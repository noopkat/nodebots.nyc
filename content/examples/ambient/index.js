const connectionString = '{Your device connection string here}';
const Mqtt = require('azure-iot-device-mqtt').Mqtt;
const DeviceClient = require('azure-iot-device').Client
const Message = require('azure-iot-device').Message;
const client = DeviceClient.fromConnectionString(connectionString, Mqtt);

const tessel = require('tessel');
const ambientlib = require('ambient-attx4');
const ambient = ambientlib.use(tessel.port['A']);

ambient.on('ready', () => {
  // get points of light data. The readings will happen every .5 seconds
  // the frequency can be updated by setting ambient.pollingFrequency
  ambient.on('light', (lightData) => {
    const value = lightData[0];
    console.log('Light level:', value.toFixed(8));
    reportLightLevel(value);
  });
});

ambient.on('error', (error) => console.log(error));

// sets up the handler for the LED device method call.
client.onDeviceMethod('toggleLED', (request, response) => {
  // toggle an led on the Tessel board!
  tessel.led[2].toggle();
  // tell IoT Hub that you got the method call request and everything's good.
  response.send(200, 'led toggled.', (error) => error && console.log(error));
});

// sends light readings to IoT Hub
function reportLightLevel(value) {
  // create a JSON payload to send to IoT Hub
  const data = JSON.stringify({ light: value });
  const message = new Message(data);

  console.log('Sending message: ' + message.getData());
  // send light value payload to IoT Hub
  client.sendEvent(message, (error) => error && console.log(error));
}

