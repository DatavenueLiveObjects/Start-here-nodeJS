/*
 * Copyright (C) 2016 Orange
 *
 * This software is distributed under the terms and conditions of the 'BSD-3-Clause'
 * license which can be found in the file 'LICENSE.txt' in this package distribution
 * or at 'https://opensource.org/licenses/BSD-3-Clause'.
 */

 /*jshint esversion: 6 */

var mqtt = require('mqtt');
const url = "mqtt://liveobjects.orange-business.com:1883";
const apiKey = "<<< REPLACE WITH valid API key value with Application profile>>>";

/** Subscription for a fifo (persisted) **/
const mqttTopic = "fifo/alarm";

var client;

function onMessage(topic, message) {
      console.log("MQTT::New message\n");
      var jsonMessage = JSON.parse(message)
      console.log(jsonMessage);
}

function clientConnect() {
    /** connect **/
    console.log("MQTT::Connecting to", url);
    client  = mqtt.connect(url, {username:"application", password:apiKey, keepAlive:30});

    /** client on connect **/
    client.on("connect", function() {
      console.log("MQTT::Connected");

      client.subscribe(mqttTopic)
      console.log("MQTT::Subscribed to topic:", mqttTopic);
    })

    /** client on error **/
    client.on("error", function(err) {
      console.log("MQTT::Error from client --> ", err);
    })

    client.on("message", function (topic, message) {
        onMessage(topic, message);
    });
}

console.log("CTRL + C to quit");
clientConnect();