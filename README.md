# Live Objects MQTT Client

This project includes Live Objects Client code samples for the MQTT protocol, written in JavaScript for node.js

## Quick start

### Download

Clone this repository from GitHub:

```
$ git clone https://github.com/Orange-OpenSource/LiveObjects-samples-nodejs.git
```

### Prerequisites

1. Install NodeJs (https://nodejs.org/en/download/)
2. Install samples dependencies (from package.json, example, https://github.com/mqttjs/MQTT.js)
    > npm install


### Sample retrieve a data message from a FIFO using a mqtt client
Pre-requisites before running this sample :
1. you MUST create a FIFO called "alarm" in your LO account (see [lo_manual_v2 FIFO](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#FIFO))
2. you MUST create an action policy to route your messages to the "alarm" FIFO (see [lo_manual_v2 MESSAGE_ROUTING](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MESSAGE_ROUTING))

Open the mqtt-client.js

1. Replace the apiKey with yours
2. Configure your mqttTopic depending on your needs, subscriptions for all devices PubSub, one specific device PubSub or FIFO
3. Run the mqtt-client.js:
    > node mqtt-client.js


### Sample Mqtt DeviceMode client

1. Run the mqtt-deviceMode.js:
    > node mqtt-deviceMode.js mqtt://liveobjects.orange-business.com:1883 YourApiKeyValueHere SampleLODemo
2. type 'h' to see device help menu or 'q' to disconnect.

For more details about connection, cf. [lo_manual_v2 MQTT_API](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API)

## License

Copyright (c) 2015 — 2019 Orange

This code is released under the BSD3 license. See the `LICENSE` file for more information.

## Contact

* Homepage: [liveobjects.orange-business.com](https://liveobjects.orange-business.com/)
