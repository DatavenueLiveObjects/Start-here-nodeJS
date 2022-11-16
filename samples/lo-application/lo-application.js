/**
    LiveObjects application simulation
        - mqtt application mode
        - subscribe to fifo and print incoming messages
        - ctrl+c to quit
**/
/*jshint esversion: 6 */

// requirements
const mqtt = require('mqtt');
const readline = require('readline');
const url = process.env.LO_MQTT_ENDPOINT || "mqtt://liveobjects.orange-business.com:1883";
const apiKey = process.env.LO_MQTT_APPLICATION_API_KEY || "<<< REPLACE WITH valid API key value with Application profile>>>";

/** Subscription for a fifo (persisted) **/
const mqttTopic = process.env.LO_MQTT_TOPIC || "fifo/alarm";

var client;

function clientConnect() {
    /** connect **/
    console.log(`MQTT::Connecting to ${url}`);
    client  = mqtt.connect(url, {
        username:"application",
        password:apiKey,
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        rejectUnauthorized : false,
        keepAlive:30
    });

    /** client on connect **/
    client.on("connect", function() {
      console.log("MQTT::Connected");

      client.subscribe(mqttTopic, function(err) {
            if (err) {
                logger.info("FAILED to subscribe on ["+mqttTopic+"]> " + err);// check mqtt rate limit
            }
      });
      console.log(`MQTT::Subscribed to topic: ${mqttTopic}`);
    });

    /** client on close **/
    client.on('close', function () {
        console.log("MQTT::Connection closed");
    });

    /** client on error **/
    client.on("error", function(err) {
      console.log("MQTT::Error from client: ", err);
    });

    /** client on message **/
    client.on("message", function (topic, message) {
        console.log(`MQTT::[${topic}] message\n${message}`);
    });

}

console.log("q to quit");
clientConnect();


function bye() {
    console.log("bye");
    if (client) {
      client.unsubscribe(mqttTopic);
      client.end(true, {}, () => process.exit());
      return;
    }
    process.exit();
}

function menu() {
  console.log("  * ~~help menu~~");
  console.log("    h  display help menu");
  console.log("    q or <CTRL> + <c>  quit");
}

// Key input
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if ((key.name == 'q') || (key && key.ctrl && key.name == 'c')) {
    bye();
    return;
  }
  switch (key.name) { // input menu key dispatcher
    case 'h': menu(); break;
    case 'return': break; // ignore
    default : console.log('unknown command "' + str + '" (ctrl:' + key.ctrl + ' name:' + key.name + ')');
  }
});

