#!/bin/bash
# usage: . ./initEnv.dontpush.sh

# choose an mqtt endpoint
# unsecure mqtt
# export LO_MQTT_ENDPOINT=mqtt://liveobjects.orange-business.com:1883
# secure mqtt
# export LO_MQTT_ENDPOINT=mqtts://liveobjects.orange-business.com:8883
# unsecure websocket
# export LO_MQTT_ENDPOINT=ws://liveobjects.orange-business.com:80/mqtt
# secure websocket
export LO_MQTT_ENDPOINT=wss://liveobjects.orange-business.com:443/mqtt

# mqtt device mode api key
export LO_MQTT_DEVICE_API_KEY=__PutMySecretAPIKeyValueHere__

# mqtt device identifier
export LO_MQTT_DEVICE_ID=mqtt-deviceMode
