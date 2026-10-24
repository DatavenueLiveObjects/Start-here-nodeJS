# Host monitoring device

This sample sends generic host observability metrics to Live Objects using the same MQTT device mode as [`lo-device`](../lo-device/README.md). It publishes immediately after connecting and then every five minutes to `dev/data`.

## Requirements

- Node.js 18 or newer
- Install this repository's dependencies with `npm install`
- A Live Objects MQTT device API key

## Configuration

Configure the API key via the environment; it is not accepted as a command-line argument, to avoid exposing it in process listings:

```bash
export LO_MQTT_DEVICE_API_KEY='your-device-api-key'
export LO_MQTT_DEVICE_ID="$(hostname)"
node samples/host-monitor/host-monitor.js
```

Optional environment variables:

- `LO_MQTT_ENDPOINT`: MQTT endpoint; defaults to `mqtts://liveobjects.orange-business.com:8883`. WSS is supported too, for example `wss://liveobjects.orange-business.com:443/mqtt`.
- `LO_MQTT_DEVICE_ID`: device identifier; defaults to the host name.
- `LO_MQTT_DEVICE_NAMESPACE`: namespace in the device URN; defaults to `NodeJSHostMonitor`.
- `LO_MQTT_HTTP_PROXY` and `LO_MQTT_HTTPS_PROXY`: proxies, consistent with the other samples.

The device URN is `urn:lo:nsid:<namespace>:<device-id>`. Choose a unique ID for each monitored host.

## Measurements

The `hostObservabilityV1` data message contains available values for CPU usage percentage, CPU count, CPU temperature, load averages (1, 5 and 15 minutes), RAM total/free/used bytes and usage percentage, root filesystem total/free/used bytes and usage percentage, logged-in user count, and host-wide thread count.

Some measurements are platform-dependent and are omitted when unavailable. CPU usage is calculated over a one-second sample at each collection. CPU temperature is read from Linux CPU/SoC thermal sensors in `/sys`; logged-in users use the `who` command; host-wide thread count uses `/proc`. Disk usage is for the filesystem containing `/`.

The API key must have the permissions required to publish device data in Live Objects. Stop the process with `Ctrl+C` or `SIGTERM`.
