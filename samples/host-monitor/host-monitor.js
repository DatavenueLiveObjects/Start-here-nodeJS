/**
 * Publishes host observability metrics to Live Objects using MQTT device mode.
 * Metrics are collected every five minutes; unavailable platform metrics are omitted.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFile} = require('node:child_process');
const mqtt = require('mqtt');
const {configureProxy, websocketOptions} = require('../utils/proxy');

const ENDPOINT = process.env.LO_MQTT_ENDPOINT || 'mqtts://liveobjects.orange-business.com:8883';
const API_KEY = process.env.LO_MQTT_DEVICE_API_KEY;
const DEVICE_ID = process.env.LO_MQTT_DEVICE_ID || os.hostname();
const DEVICE_NAMESPACE = process.env.LO_MQTT_DEVICE_NAMESPACE || 'NodeJSHostMonitor';
const INTERVAL_MS = 5 * 60 * 1000;
const CPU_SAMPLE_MS = 1000;
const MESSAGE_MODEL = 'hostObservabilityV1';
const DEVICE_URN = `urn:lo:nsid:${DEVICE_NAMESPACE}:${DEVICE_ID}`;

function validateConfig() {
    if (!API_KEY) {
        console.error('Please set LO_MQTT_DEVICE_API_KEY.');
        return false;
    }
    if (!/^(mqtts?):\/\/[^\s]+:\d{2,5}$/.test(ENDPOINT) && !/^wss?:\/\/[^\s]+:\d{2,5}(\/mqtt)?$/.test(ENDPOINT)) {
        console.error('Invalid LO_MQTT_ENDPOINT. Use mqtts://host:8883 or wss://host:443/mqtt.');
        return false;
    }
    if (!DEVICE_ID || /[+#/\s]/.test(DEVICE_ID) || !DEVICE_NAMESPACE || /[+#/\s]/.test(DEVICE_NAMESPACE)) {
        console.error('LO_MQTT_DEVICE_ID and LO_MQTT_DEVICE_NAMESPACE must be non-empty MQTT-safe identifiers.');
        return false;
    }
    return true;
}

function cpuCounters() {
    return os.cpus().map(({times}) => ({
        total: Object.values(times).reduce((sum, value) => sum + value, 0),
        idle: times.idle,
    }));
}

function cpuUsagePercent(before, after) {
    let totalDelta = 0;
    let idleDelta = 0;
    const cpuCount = Math.min(before.length, after.length);
    for (let index = 0; index < cpuCount; index++) {
        totalDelta += after[index].total - before[index].total;
        idleDelta += after[index].idle - before[index].idle;
    }
    if (totalDelta <= 0) {
        return undefined;
    }
    return round((1 - idleDelta / totalDelta) * 100, 1);
}

function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function readCpuTemperature() {
    const candidates = [];
    const thermalRoot = '/sys/class/thermal';
    const hwmonRoot = '/sys/class/hwmon';

    try {
        for (const entry of fs.readdirSync(thermalRoot)) {
            if (!entry.startsWith('thermal_zone')) {
                continue;
            }
            const zone = path.join(thermalRoot, entry);
            const type = fs.readFileSync(path.join(zone, 'type'), 'utf8').trim();
            if (!/cpu|soc/i.test(type)) {
                continue;
            }
            candidates.push(Number(fs.readFileSync(path.join(zone, 'temp'), 'utf8').trim()) / 1000);
        }
    } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'EACCES' && error.code !== 'ENOTDIR') {
            console.warn(`Could not read CPU thermal zones: ${error.message}`);
        }
    }

    try {
        for (const entry of fs.readdirSync(hwmonRoot)) {
            const hwmon = path.join(hwmonRoot, entry);
            const name = fs.readFileSync(path.join(hwmon, 'name'), 'utf8').trim();
            if (!/cpu|coretemp|k10temp|zenpower|soc/i.test(name)) {
                continue;
            }
            for (const input of fs.readdirSync(hwmon).filter(file => /^temp\d+_input$/.test(file))) {
                candidates.push(Number(fs.readFileSync(path.join(hwmon, input), 'utf8').trim()) / 1000);
            }
        }
    } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'EACCES' && error.code !== 'ENOTDIR') {
            console.warn(`Could not read CPU hwmon sensors: ${error.message}`);
        }
    }

    const valid = candidates.filter(value => Number.isFinite(value) && value >= -20 && value <= 150);
    return valid.length ? round(Math.max(...valid), 1) : undefined;
}

function readDiskMetrics() {
    try {
        const {bsize, blocks, bavail} = fs.statfsSync('/');
        const totalBytes = Number(blocks) * Number(bsize);
        const freeBytes = Number(bavail) * Number(bsize);
        const usedBytes = totalBytes - freeBytes;
        if (totalBytes <= 0) {
            return {};
        }
        return {
            disk_total_bytes: totalBytes,
            disk_free_bytes: freeBytes,
            disk_used_bytes: usedBytes,
            disk_used_percent: round((usedBytes / totalBytes) * 100, 1),
        };
    } catch (error) {
        console.warn(`Disk metrics unavailable: ${error.message}`);
        return {};
    }
}

function readHostThreadCount() {
    const procRoot = '/proc';
    try {
        const pids = fs.readdirSync(procRoot, {withFileTypes: true}).filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name));
        let threadCount = 0;
        for (const pid of pids) {
            try {
                threadCount += fs.readdirSync(path.join(procRoot, pid.name, 'task')).length;
            } catch (error) {
                if (error.code !== 'ENOENT' && error.code !== 'EACCES' && error.code !== 'ESRCH') {
                    throw error;
                }
            }
        }
        return threadCount;
    } catch (error) {
        console.warn(`Host thread count unavailable: ${error.message}`);
        return undefined;
    }
}

function readLoggedInUsers() {
    return new Promise(resolve => {
        execFile('who', [], {timeout: 2000, maxBuffer: 64 * 1024}, (error, stdout) => {
            if (error) {
                resolve(undefined);
                return;
            }
            const lines = stdout.trim().split('\n').filter(Boolean);
            resolve(lines.length);
        });
    });
}

function readMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
        ram_total_bytes: total,
        ram_free_bytes: free,
        ram_used_bytes: used,
        ram_used_percent: round((used / total) * 100, 1),
    };
}

async function collectMetrics() {
    const cpuBefore = cpuCounters();
    await new Promise(resolve => setTimeout(resolve, CPU_SAMPLE_MS));
    const cpuPercent = cpuUsagePercent(cpuBefore, cpuCounters());
    const loadAverage = os.loadavg();
    const metrics = {
        hostname: os.hostname(),
        platform: os.platform(),
        cpu_count: os.cpus().length,
        ...readMemoryMetrics(),
        ...readDiskMetrics(),
    };

    if (cpuPercent !== undefined) {
        metrics.cpu_used_percent = cpuPercent;
    }
    const cpuTemperature = readCpuTemperature();
    if (cpuTemperature !== undefined) {
        metrics.cpu_temperature_c = cpuTemperature;
    }
    if (os.platform() !== 'win32' && loadAverage.every(Number.isFinite)) {
        metrics.load_average_1m = round(loadAverage[0]);
        metrics.load_average_5m = round(loadAverage[1]);
        metrics.load_average_15m = round(loadAverage[2]);
    }
    const loggedInUsers = await readLoggedInUsers();
    if (loggedInUsers !== undefined) {
        metrics.logged_in_users = loggedInUsers;
    }
    const threadCount = readHostThreadCount();
    if (threadCount !== undefined) {
        metrics.host_thread_count = threadCount;
    }
    return metrics;
}

let client;
let timer;
let stopping = false;
let publishing = false;

async function publishMetrics() {
    if (stopping || publishing || !client || !client.connected) {
        return;
    }
    publishing = true;
    try {
        const message = {
            s: DEVICE_URN,
            ts: new Date().toISOString(),
            m: MESSAGE_MODEL,
            v: await collectMetrics(),
        };
        if (stopping || !client.connected) {
            return;
        }
        client.publish('dev/data', JSON.stringify(message), {qos: 1}, error => {
            if (error) {
                console.error(`Failed to publish host metrics: ${error.message}`);
            } else {
                console.log(`Published host metrics for ${message.v.hostname} at ${message.ts}`);
            }
        });
    } catch (error) {
        console.error(`Failed to collect host metrics: ${error.message}`);
    } finally {
        publishing = false;
    }
}

function shutdown() {
    if (stopping) {
        return;
    }
    stopping = true;
    clearInterval(timer);
    if (client) {
        client.end(false, {}, () => process.exit(0));
        setTimeout(() => process.exit(0), 3000).unref();
    } else {
        process.exit(0);
    }
}

if (!validateConfig()) {
    process.exit(1);
}

const httpProxy = process.env.LO_MQTT_HTTP_PROXY;
const httpsProxy = process.env.LO_MQTT_HTTPS_PROXY;
if (httpProxy || httpsProxy) {
    configureProxy(httpProxy, httpsProxy);
}

console.log(`Connecting Live Objects device ${DEVICE_URN} to ${ENDPOINT}`);
client = mqtt.connect(ENDPOINT, {
    clientId: DEVICE_URN,
    username: 'json+device',
    password: API_KEY,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    wsOptions: websocketOptions(ENDPOINT),
    keepAlive: 30,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('Connected to Live Objects. Publishing host metrics every five minutes.');
    publishMetrics();
    if (!timer) {
        timer = setInterval(publishMetrics, INTERVAL_MS);
    }
});
client.on('reconnect', () => console.log('Reconnecting to Live Objects...'));
client.on('error', error => console.error(`MQTT error: ${error.message}`));
client.on('close', () => console.log('MQTT connection closed.'));

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
