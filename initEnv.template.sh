#!/bin/bash
# usage: . ./initEnv.dontpush.sh
# LiveObjects doc : https://liveobjects.orange-business.com/#/doc
# doc mqtt endpoints: https://liveobjects.orange-business.com/doc/html/lo_manual.html#MQTT_ENDPOINTS
# doc api keys: https://liveobjects.orange-business.com/doc/html/lo_manual.html#API_KEY

# 1) choose an mqtt endpoint

# unsecure websocket - only available on certains conditions with special offer
# export LO_MQTT_ENDPOINT=ws://mqtt.liveobjects.orange-business.com:80/mqtt

# secure mqtt - **Recommended**
export LO_MQTT_ENDPOINT=mqtts://mqtt.liveobjects.orange-business.com:8883

# secure websocket
# export LO_MQTT_ENDPOINT=wss://liveobjects.orange-business.com:443/mqtt

# optional) set a proxy for you connection
# proxy definition
# export LO_MQTT_HTTP_PROXY='http://your.http.proxy:8080/'
# export LO_MQTT_HTTPS_PROXY='http://your.http.proxy:8080/'

# 2) set your secret API key values

# device - create mqtt equipment API Key (via portal or api)
# mqtt device mode api key
export LO_MQTT_DEVICE_API_KEY=__PutMySecretAPIKeyValueHere__

# (optional) application - create mqtt application API Key (via portal or api)
# mqtt application mode api key
export LO_MQTT_APPLICATION_API_KEY=__PutMySecretAPIKeyValueHere__
#export LO_MQTT_TOPIC="fifo/myFifo"

# 3) set a name for your device

# mqtt device identifier
export LO_MQTT_DEVICE_ID=lo-mqtt-device
