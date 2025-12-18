# Live Objects MQTT Client
[![scheduled npm audit](https://github.com/DatavenueLiveObjects/Start-here-nodeJS/actions/workflows/00_scheduled_npm_audit.yml/badge.svg)](https://github.com/DatavenueLiveObjects/Start-here-nodeJS/actions/workflows/00_scheduled_npm_audit.yml)

This project includes **Live Objects Client code samples for the MQTT protocol**.
- LiveObjects [official help](https://liveobjects.orange-business.com/#/cms/documentation-faq) includes [a dev. guide mqtt section](https://liveobjects.orange-business.com/doc/html/lo_manual_v2.html#MQTT_API)
- Samples are written in JavaScript for node.js.
- Samples require minimal common environment described in "Quick start" below.

## Quick start

### Download

Clone this repository from GitHub:

```
$ git clone https://github.com/DatavenueLiveObjects/Start-here-nodeJS
```

### Prerequisites

1. Install NodeJs (https://nodejs.org/en/download/)
2. Install samples dependencies (from package.json, example, https://github.com/mqttjs/MQTT.js)
    > npm install

### Set your own private environment

- copy the template in a private file

```bash
cp initEnv.template.sh initEnv.dontpush.sh
```
- edit `initEnv.dontpush.sh` according to your constraints and with your own API KEYS
- source it

```bash
source ./initEnv.dontpush.sh
```

- verify environment
```bash
env|grep LO_
```

### Start using samples
Go to sample dedicated documentation.

The samples are:
- [lo-device](./samples/lo-device/README.md) - a mqtt client using `device mode`, this sample is able to connect,
  receive command, receive firmware updates and config. This device can send data messages too.
- [lo-application](./samples/lo-application/README.md) - a mqtt client using `application mode`, this sample is able to listen
  a given fifo.


Example:
````bash
source ./initEnvLO.dontpush.sh
node samples/lo-device/lo-device.js
````

## License

Copyright (c) 2015 — 2025 Orange

This code is released under the BSD3 license. See the `LICENSE` file for more information.

## Contact

* Homepage: [liveobjects.orange-business.com](https://liveobjects.orange-business.com/)

## Contribute

* cf [CONTRIBUTING](.github/CONTRIBUTING.md)
