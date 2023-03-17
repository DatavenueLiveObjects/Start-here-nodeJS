/**
    LiveObjects device simulation
        - mqtt device mode
        - notifies of connection / disconnection
        - send device config (parameters of each type)
        - send device resources
        - send a command
        - subscribe to device mode topics
        - automatic responds to config/commands/resourceUpdate
        - stdin menu allow to show device configuration, and to plan config/resourceUpdate failure
**/
/*jshint esversion: 6 */

// requirements
const Axios = require('axios');
const mqtt = require('mqtt');
const fs = require('fs');
const log4js = require('log4js');
const readline = require('readline');

const common = require('./Common.js');

// logging
const logger = log4js.getLogger();
logger.level = 'DEBUG';

// device
const deviceNamespace = 'NodeJS';
// Topic Mqtt Device Mode
const topicConfigUpdate = 'dev/cfg/upd';
const topicConfig = 'dev/cfg';
const topicData = 'dev/data';
const topicResource = 'dev/rsc';
const topicCommand = 'dev/cmd';
const topicCommandRsp = 'dev/cmd/res';
const topicResourceUpd = 'dev/rsc/upd';
const topicResourceUpdResp = 'dev/rsc/upd/res';
const topicResourceUpdErr = 'dev/rsc/upd/err';

var geolocsEurop = [
  [50.513427, -3.691406],
  [41.508577, 27.597656],
];
var geolocsFrance = [
  [49.296472, -1.911621],
  [43.452919, 7.44873],
];
var geolocsIdf = [
  [48.945955, 2.146454],
  [48.665571, 2.528229],
];
var geolocsLyon = [
  [45.794818, 4.774228],
  [45.673563, 4.950331],
];

// number of connect retries allowed
const MAX_CONNECT_RETRIES = 2;
// reconnectPeriod<=0 means no reconnection
// reconnectPeriod=1000 means reconnection after 1 second
const MQTT_RECONNECT_PERIOD_MS = 1;

function validMqttUrl(url) {
 return /^(mqtt[s]?):\/\/(.*)\:[0-9]{2,6}$/.test(url) || /^(ws[s]?):\/\/(.*)\:[0-9]{2,6}(\/mqtt)?$/.test(url);
}

function validConfig() {
    if (process.env.LO_MQTT_ENDPOINT) {
      if (!process.env.LO_MQTT_DEVICE_API_KEY) {
        console.log("please set LO_MQTT_DEVICE_API_KEY");
      }
      if (!process.env.LO_MQTT_DEVICE_ID) {
        console.log("please set LO_MQTT_DEVICE_ID");
      }
      if (!validMqttUrl(process.env.LO_MQTT_ENDPOINT)) {
        console.log("please verify LO_MQTT_ENDPOINT", process.env.LO_MQTT_ENDPOINT);
      }
      return process.env.LO_MQTT_DEVICE_API_KEY && process.env.LO_MQTT_DEVICE_ID && validMqttUrl(process.env.LO_MQTT_ENDPOINT);
    }
    // else rely on arguments instead of env
    return !(process.argv.length < 3 || !validMqttUrl(process.argv[2]));
}

// reading arguments
if (!validConfig()) {
  console.log('MQTT script simulating a device: ');
  console.log('');
  console.log('usage: node mqtt-deviceMode.js <serverURL> <apiKey> <deviceId>');
  console.log('   <serverURL>:    URL of MQTT server');
  console.log(
    "                   (ex: 'mqtt://<host>:<port>', 'mqtts://<host>:<port>')"
  );
  console.log('   <apiKey>:       LiveObjects API keys');
  console.log(
    "   <deviceId>:     device identifier (urn will be 'urn:lo:nsid:" +
      deviceNamespace +
      ":<deviceId>'"
  );
  console.log(' Some examples: '); // https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API
  console.log(
    '   node ./mqtt-deviceMode.js wss://liveobjects.orange-business.com:443/mqtt MyApiKeyHere myNodeJS'
  );
  console.log(
    '   node ./mqtt-deviceMode.js mqtts://liveobjects.orange-business.com:8883 MyApiKeyHere myNodeJS'
  );
  return;
}
var serverURL = process.env.LO_MQTT_ENDPOINT || process.argv[2];
var apiKey = process.env.LO_MQTT_DEVICE_API_KEY || process.argv[3];
var deviceId = process.env.LO_MQTT_DEVICE_ID || process.argv[4];

//~ calculated with arguments
var deviceUrn = 'urn:lo:nsid:' + deviceNamespace + ':' + deviceId;
var nodeResponse = 'this is an answer from nodeJs client';

var deviceResources = common.loadJsonResource("./data/initialResource.json");
var deviceConfig =  common.loadJsonResource("./data/initialConfig.json");

//~ work attributes
var client;
var reconnectRetry = 0;

var commandNoAnswer = 0;
var configFailure = 0;
var resourceFailure = 0;
var withDeviceError = process.env.LO_MQTT_DEFAULT_WITH_DEVICE_ERROR === 'true' | false;
var withDownloadStep = true;
var withDownloadExit = false;
var withNoAnswer = false;

var connectionCount = 0;
var handledConfig = 0;
var handledCommands = 0;
var handledResource = 0;
var geoloc = [45.4535, 4.5032];

function getDeviceDataMessage() {
  var messageModel = 'nodeDeviceModeV1';
  var now = new Date().toISOString();
  var deviceData = {
    s: deviceUrn,
    ts: now,
    m: messageModel,
    loc: geoloc,
    v: {
      temp: 12.75,
      humidity: 62.1,
      gpsFix: true,
      gpsSats: [12, 14, 21],
      connectionCount: connectionCount,
      handledCommands: handleCommand,
      handledConfig: handledConfig,
      handledResource: handledResource,
    },
  };
  return deviceData;
}

function deviceInfo() {
  console.log('  * urn: ' + deviceUrn + ' - session #' + connectionCount);
  if (configFailure + resourceFailure + commandNoAnswer > 0) {
    console.log(
      '    planned failures : ' +
        configFailure +
        ' cfg, ' +
        commandNoAnswer +
        ' cmd ' +
        resourceFailure +
        ' rsc ' +
        (withDeviceError ? '(custom error)' : '') +
        (withNoAnswer ? '(no answer)' : '')
    );
  }
  if (handledConfig + handledCommands + handledResource > 0) {
    console.log(
      '    handled ' +
        handledConfig +
        ' cfg, ' +
        handledCommands +
        ' cmd ' +
        handledResource +
        ' rsc'
    );
  }
  if (withDownloadStep) {
    console.log(
      '    resUpd with download step' +
        (withDownloadExit ? ' crash (enforce exit) !' : '')
    );
  }
}

function deviceInfoExtra() {
  console.log('  * urn: ' + deviceUrn);
  console.log('    config: ' + JSON.stringify(deviceConfig));
  console.log('    resources: ' + JSON.stringify(deviceResources));
}

function bye() {
  console.log('bye');
  if (client) {
    client.end(true, {}, () => process.exit());
    return;
  }
  process.exit();
}
function forceReconnect() {
  logger.info('forceReconnect');
  force = true;
  client.end(force, function () {
    clientConnect(true);
  });
}

function subscribeTopic(topic) {
  logger.info('subscribe [' + topic + ']');
  client.subscribe(topic, function (err) {
    if (err) {
      logger.info('FAILED to subscribe on [' + topic + ']> ' + err); // check mqtt rate limit
    }
  });
}

function publishDeviceResources() {
  var msgResourceStr = JSON.stringify(deviceResources);
  logger.info('[' + topicResource + ']> ' + msgResourceStr);
  client.publish(topicResource, msgResourceStr);
}

function publishDeviceConfig() {
  var msgConfigStr = JSON.stringify(deviceConfig);
  logger.info('[' + topicConfig + ']> ' + msgConfigStr);
  client.publish(topicConfig, msgConfigStr);
}

function publishDeviceData() {
  var msgDataStr = JSON.stringify(getDeviceDataMessage());
  logger.info('[' + topicData + ']> ' + msgDataStr);
  client.publish(topicData, msgDataStr);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param [[number,number], [number, number]] geolocs : the square in wich the device must be localized
 * @param {*} nb : number of localized device to generate
 */
async function generateGeoloc(geolocs, nb = 1) {
  if (
    geolocs.length !== 2 ||
    geolocs[0].length !== 2 ||
    geolocs[1].length !== 2 ||
    'number' !== typeof geolocs[0][0] ||
    'number' !== typeof geolocs[0][1] ||
    'number' !== typeof geolocs[1][0] ||
    'number' !== typeof geolocs[1][1]
  ) {
    throw new Error(
      'geolocs input must be a square of locations in which the device will be localized'
    );
  }
  for (let index = 0; index < nb; index++) {
    deviceUrn =
      'urn:lo:nsid:' +
      deviceNamespace +
      ':' +
      deviceId +
      '_' +
      Math.ceil(Math.random() * 100000000000); // we generate a new device with a random id

    var count = connectionCount;
    forceReconnect();
    while (count === connectionCount) {
      await sleep(500);
    }
    await sleep(1000);
    /**
     * The geoloc of the device is randonly in the square of geolocs
     */
    geoloc = [
      geolocs[1][0] + (geolocs[0][0] - geolocs[1][0]) * Math.random(),
      geolocs[0][1] + (geolocs[1][1] - geolocs[0][1]) * Math.random(),
    ];
    var messageId = client.getLastMessageId();

    publishDeviceData();

    while (messageId === client.getLastMessageId()) {
      await sleep(500);
    }
    await sleep(1000);
  }
}

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);

  return Axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {

    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}

function downloadFileStep(
  resourceId,
  resourceNewVersion,
  resourceUrl,
  resourceSize,
  resourceMd5,
  downloadError,
  endDownloadCb
) {
  logger.debug(`download resource ${resourceId} version ${resourceNewVersion} from ${resourceUrl}`);
  downloadFile(resourceUrl, 'lastFirmware.raw')
      .catch(err => {// download issues are just reported as warn
          var details = "";
          if ("EPROTO" === err.code) {
            details += " protocol issue (seems that resource server don't match url scheme).";
          }
          logger.warn(`Download error code:${err.code} errno:${err.errno} ${details}`);
      })
      .then(result => {
          logger.debug('download done');
          if (downloadError) {
            setTimeout(() => {
              logger.debug('simulate an error while downloading firmware: enforce exit()');
              process.exit();
            }, 10);
          }
          endDownloadCb();
      });

}

function handleConfigUpdate(message) {
  var request = JSON.parse(message);
  var jsonRequest = JSON.stringify(request);

  logger.info('<[' + topicConfigUpdate + '] ', jsonRequest);
  if (configFailure > 0) {
    // hack a wrong value for a requested parameter
    var msgWrongCfg = request;
    var firstParam = Object.keys(request.cfg)[0];
    msgWrongCfg.cfg[firstParam].v = 666;

    var msgWrongCfgStr = JSON.stringify(msgWrongCfg);
    logger.info('FAILED config [' + topicConfig + ']> ' + msgWrongCfgStr);
    client.publish(topicConfig, msgWrongCfgStr);
    configFailure--;
  } else {
    // success

    deviceConfig = request;
    publishDeviceConfig();
  }
  handledConfig++;
}

function handleCommand(message) {
  var request = JSON.parse(message);
  var jsonRequest = JSON.stringify(request);
  logger.info('<[' + topicCommand + '] ', jsonRequest);

  if (commandNoAnswer <= 0) {
    var msgCommand = { res: { data: nodeResponse }, cid: request.cid };
    var msgCommandStr = JSON.stringify(msgCommand);

    logger.info('OK result [' + topicCommandRsp + ']>' + msgCommandStr);
    client.publish(topicCommandRsp, msgCommandStr);
  } else {
    logger.info('no answer to command');
    commandNoAnswer--;
  }
  handledCommands++;
}

function simulateResourceUpdateDone(resourceId, resourceNewVersion) {
  // act version update internally
  deviceResources.rsc[resourceId].v = resourceNewVersion;
  // publish new version
  publishDeviceResources();
}

function handleResourceUpdate(message) {
  var request = JSON.parse(message);
  var jsonRequest = JSON.stringify(request);
  logger.info('<[' + topicResourceUpd + '] ', jsonRequest);

  if (resourceFailure > 0) {
    if (withNoAnswer) {
      logger.info('no answer to resource update');
    } else if (withDeviceError) {
      // device custom details

      var msgDeviceError = {
        errorCode: 'NY_NODE_JS_UNKNOWN_RESOURCE',
        errorDetails: nodeResponse,
      };
      var msgDeviceErrorStr = JSON.stringify(msgDeviceError);
      logger.info('[' + topicResourceUpdErr + ']>' + msgDeviceErrorStr);
      client.publish(topicResourceUpdErr, msgDeviceErrorStr);
    } else {
      // one of predefined error
      var possibleErrors = [
        // 2.1 // "UNKNOWN_RESOURCE",
        'INVALID_RESOURCE',
        'WRONG_SOURCE_VERSION',
        'WRONG_TARGET_VERSION',
        'NOT_AUTHORIZED',
        'INTERNAL_ERROR',
      ];
      var randomError =
        possibleErrors[Math.floor(Math.random() * possibleErrors.length)];

      var msgError = { res: randomError, cid: request.cid };
      var msgErrorStr = JSON.stringify(msgError);
      logger.info('FAILED [' + topicResourceUpdResp + ']>' + msgErrorStr);
      client.publish(topicResourceUpdResp, msgErrorStr);
    }

    resourceFailure--;
  } else {
    // good resource update
    var correlationId = request.cid;

    var resourceId = request.id;
    var resourceNewVersion = request.new;
    var resourceUrl = request.m.uri;
    var resourceSize = request.m.size;
    var resourceMd5 = request.m.md5;

    // accept update
    var msgOk = { res: 'OK', cid: correlationId };
    var msgOkStr = JSON.stringify(msgOk);
    logger.info('OK [' + topicResourceUpdResp + ']>' + msgOkStr);
    client.publish(topicResourceUpdResp, msgOkStr);

    if (withDownloadStep) {
      // download resource
      downloadFileStep(
        resourceId,
        resourceNewVersion,
        resourceUrl,
        resourceSize,
        resourceMd5,
        withDownloadExit,
        function () {
          simulateResourceUpdateDone(resourceId, resourceNewVersion);
        }
      );
    } else {
      simulateResourceUpdateDone(resourceId, resourceNewVersion);
    }
  }
  handledResource++;
}

function clientProxy() {
  const http  = process.env.LO_MQTT_HTTP_PROXY;
  const https = process.env.LO_MQTT_HTTPS_PROXY;
  if (http || https) {
    const proxy = require('node-global-proxy').default;
    proxy.setConfig({http, https});
    proxy.start();
  }
}

function clientConnect(byPassInit = false) {
  logger.info(deviceUrn + ' connect to ' + serverURL);
  if (!byPassInit) {
      clientProxy();
  }
  client = mqtt.connect(serverURL, {
    clientId: deviceUrn,
    username: 'json+device',
    password: apiKey,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    rejectUnauthorized: false,
    keepAlive: 30,
    reconnectPeriod: MQTT_RECONNECT_PERIOD_MS,
  });

  // After connection actions
  client.on('connect', function () {
    logger.info('connected');
    connectionCount++;
    reconnectRetry = 0;

    if (!byPassInit) {
      publishDeviceConfig();

      subscribeTopic(topicConfigUpdate);

      publishDeviceData();

      if (process.env.LO_MQTT_SKIP_STARTUP_PUBLISH !== "true") {
        publishDeviceResources();
      }

      subscribeTopic(topicCommand);

      subscribeTopic(topicResourceUpd);
    }

    logger.info("type 'h' to see help");
  });

  // On message actions
  client.on('message', function (topic, message) {
    if (topic == topicConfigUpdate) {
      // dev/cfg
      handleConfigUpdate(message);
    } else if (topic == topicCommand) {
      // dev/cmd
      handleCommand(message);
    } else if (topic == topicResourceUpd) {
      // dev/rsc/upd
      handleResourceUpdate(message);
    } else {
      logger.error('received unexpected message: <[' + topic + '] ', message);
    }
  });

  client.on('close', function () {
    logger.info('connection closed');
    if (reconnectRetry >= MAX_CONNECT_RETRIES) {
      logger.error('aborted after ' + MAX_CONNECT_RETRIES + ' retries');
      process.exit(1);
    }
  });

  // Other callbacks
  client.on('suback', function (topic, message) {
    logger.info('subscribed to ' + topic);
  });

  client.on('error', function (error) {
    // https://nodejs.org/api/errors.html#errors_class_error
    if (error.code) {
      logger.error('error code:' + error.code + ' message:' + error.message);
    } else {
      logger.error('error:' + error.message);
    }
  });

  client.on('reconnect', function () {
    reconnectRetry++;
    logger.info('reconnect (retry ' + reconnectRetry + ')');
  });
}

function menu() {
  console.log('  * ~~help menu~~');
  console.log('    h  display help menu');
  console.log('    k  add command no answer');
  console.log('    c  add config update failure');
  console.log('    r  add resource update failure');
  console.log('    d  toggle resource update failure custom device error');
  console.log('    n  toggle resource update failure no answer');
  console.log('    f  toggle resource update download step');
  console.log('    z  enforce resource update download crash');
  console.log('    i  display device info');
  console.log('    x  display device internal info');
  console.log('    o  send current resource message');
  console.log('    m  send data message');
  console.log('    e  generate new device in Europe');
  console.log('    l  generate new device in France');
  console.log('    g  generate new device in Ile de France');
  console.log('    a  generate 100 new devices in Lyon');
  console.log('    b  generate 100 new devices in France');
  console.log('    j  generate 100 new devices in Europe');
  console.log('    p  generate 1000 new devices in Europe');
  console.log('    *  force disconnect / reconnect');
  console.log('    q or <CTRL> + <c>  quit');
}

// Key input
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (function () {
  return async (str, key) => {
    if (key.name === 'q'
        || (key && key.ctrl && key.name === 'c')) {
      bye();
      return;
    }
    if (str === '*') {
      forceReconnect();
      return;
    }
    switch (
        key.name // input menu key dispatcher
        ) {
      case 'h':
        menu();
        break;
      case 'i':
        deviceInfo();
        break;
      case 'x':
        deviceInfoExtra();
        break;
      case 'k':
        commandNoAnswer++;
        console.log('.');
        break;
      case 'c':
        configFailure++;
        console.log('.');
        break;
      case 'r':
        resourceFailure++;
        console.log('.');
        break;
      case 'd':
        withDeviceError = !withDeviceError;
        console.log('.');
        break;
      case 'f':
        withDownloadStep = !withDownloadStep;
        console.log('.');
        break;
      case 'z':
        withDownloadStep = true;
        withDownloadExit = !withDownloadExit;
        console.log('.');
        break;
      case 'n':
        withNoAnswer = !withNoAnswer;
        console.log('.');
        break;
      case 'o':
        publishDeviceResources();
        break;
      case 'm':
        publishDeviceData();
        break;
      case 'e':
        await generateGeoloc(geolocsEurop);
        break;
      case 'l':
        await generateGeoloc(geolocsFrance);
        break;
      case 'g':
        await generateGeoloc(geolocsIdf);
        break;
      case 'a':
        await generateGeoloc(geolocsLyon, 100);
        break;
      case 'b':
        await generateGeoloc(geolocsFrance, 100);
        break;
      case 'j':
        await generateGeoloc(geolocsEurop, 100);
        break;
      case 'p':
        await generateGeoloc(geolocsEurop, 1000);
        break;
      case '*':
        forceReconnect();
        break;
      case 'return':
        break; // ignore
      default:
        console.log(
            'unknown command "' +
            str +
            '" (ctrl:' +
            key.ctrl +
            ' name:' +
            key.name +
            ')'
        );
    }
  };
})());

// Main entry-point
clientConnect();
