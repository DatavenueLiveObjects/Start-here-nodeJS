< [Back](../../README.md)

## Sample lo-device

This sample is a Mqtt Client that use LiveObjects Mqtt Device Mode.

This sample is able to connect, receive command, receive firmware updates and config.
This device can send data messages too.

### Step 1 : Run the device

  > cd samples/lo-device

- via private environment (cf. [parent Readme](../../README.md))
  > node lo-device.js
- or on command line via mqtts
  > node lo-device.js mqtts://liveobjects.orange-business.com:8883 YourApiKeyValueHere SampleLODemo
- or on command line via secure websocket
  > node lo-device.js wss://liveobjects.orange-business.com:443/mqtt YourApiKeyValueHere SampleLODemo

### Step 2 : Type `h` to see device help menu or `q` to disconnect.

For more details about connection, cf. [lo_manual_v2 MQTT_API](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API)
