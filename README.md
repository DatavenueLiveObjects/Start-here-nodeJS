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

### Setup your own private environment

- copy the template in a private file
> cp initEnv.template.sh initEnv.dontpush.sh
- edit `initEnv.dontpush.sh`
- source it
> . ./initEnv.dontpush.sh


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

Step 1 : Run the mqtt-deviceMode.js

- via private environment
    > node mqtt-deviceMode.js 
- or on command line via mqtts
    > node mqtt-deviceMode.js mqtts://liveobjects.orange-business.com:8883 YourApiKeyValueHere SampleLODemo
- or on command line via secure websocket
    > node mqtt-deviceMode.js wss://liveobjects.orange-business.com:443/mqtt YourApiKeyValueHere SampleLODemo

Step 2 : Type `h` to see device help menu or `q` to disconnect.

For more details about connection, cf. [lo_manual_v2 MQTT_API](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API)

## License

Copyright (c) 2015 — 2019 Orange

This code is released under the BSD3 license. See the `LICENSE` file for more information.

## Contact

* Homepage: [liveobjects.orange-business.com](https://liveobjects.orange-business.com/)
