const http = require('node:http');
const https = require('node:https');
const {URL} = require('node:url');
const {HttpProxyAgent} = require('http-proxy-agent');
const {HttpsProxyAgent} = require('https-proxy-agent');

const defaultHttpAgent = http.globalAgent;
const defaultHttpsAgent = https.globalAgent;
let configuredHttpProxy;
let configuredHttpsProxy;
let configuredHttpAgent;
let configuredHttpsAgent;

function configureProxy(httpProxy, httpsProxy) {
    if (httpProxy === configuredHttpProxy && httpsProxy === configuredHttpsProxy) {
        return;
    }

    if (configuredHttpAgent) {
        configuredHttpAgent.destroy();
    }
    if (configuredHttpsAgent) {
        configuredHttpsAgent.destroy();
    }

    configuredHttpAgent = httpProxy ? new HttpProxyAgent(httpProxy) : undefined;
    configuredHttpsAgent = httpsProxy ? new HttpsProxyAgent(httpsProxy) : undefined;
    http.globalAgent = configuredHttpAgent || defaultHttpAgent;
    https.globalAgent = configuredHttpsAgent || defaultHttpsAgent;

    configuredHttpProxy = httpProxy;
    configuredHttpsProxy = httpsProxy;
}

function websocketOptions(url) {
    const protocol = new URL(url).protocol;
    if (protocol === 'wss:') {
        return {agent: https.globalAgent};
    }
    if (protocol === 'ws:') {
        return {agent: http.globalAgent};
    }
}

module.exports = {configureProxy, websocketOptions};
