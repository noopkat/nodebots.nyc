// https://docs.microsoft.com/en-us/azure/iot-hub/quickstart-send-telemetry-node
const connectionString = '{Your device connection string here}';
const Mqtt = require('azure-iot-device-mqtt').Mqtt;
const DeviceClient = require('azure-iot-device').Client
const Message = require('azure-iot-device').Message;
const client = DeviceClient.fromConnectionString(connectionString, Mqtt);

const tessel = require('tessel');
const ambientlib = require('ambient-attx4');
const ambient = ambientlib.use(tessel.port['A']);

ambient.on('ready', () => {
  // Get points of light data. The readings will happen every .5 seconds
  // The frequency can be updated by setting ambient.pollingFrequency
  ambient.on('light', (lightData) => {
    const value = lightData[0];
    console.log('Light level:', value.toFixed(8));
    reportLightLevel(value);
  });
});

ambient.on('error', (err) => {
  console.log(err);
});

// Set up the handler for the LED direct method call.
client.onDeviceMethod('toggleLED', () => {
  tessel.led[2].toggle();
});

function reportLightLevel(value) {
  const data = JSON.stringify({ light: value });
  const message = new Message(data);

  console.log('Sending message: ' + message.getData());
  client.sendEvent(message, (error, result) => {
    console.log('message sent');  
  });
}

