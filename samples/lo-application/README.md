< [Back](../../README.md)

## Sample lo-application

This sample is a Mqtt Client that use LiveObjects Mqtt Application Mode.

This sample is able to listen a given fifo.

### Step 1 : configure LiveObjects 

Pre-requisites before running this sample :
1. you MUST create a FIFO called `alarm` in your LO account (see [lo_manual_v2 FIFO](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#FIFO))
2. you MUST create an action policy to route your messages to the `alarm` FIFO (see [lo_manual_v2 MESSAGE_ROUTING](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MESSAGE_ROUTING))


### Step 2 : Run the device

> cd samples/lo-application

- via private environment (cf. [parent Readme](../../README.md))
  > node lo-application.js 

### Step 3 : Type `h` to see application help menu or `q` to disconnect.

For more details about connection, cf. [lo_manual_v2 MQTT_API](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API)

