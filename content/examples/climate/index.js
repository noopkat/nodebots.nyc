const connectionString = '{Your device connection string here}';
const Mqtt = require('azure-iot-device-mqtt').Mqtt;
const DeviceClient = require('azure-iot-device').Client
const Message = require('azure-iot-device').Message;
const client = DeviceClient.fromConnectionString(connectionString, Mqtt);

const tessel = require('tessel');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port['A']);

climate.on('ready', () => {
  // get points of temperature data. The readings will happen every .5 seconds
  setInterval(getTemperature, 500);
});

climate.on('error', (error) => console.log(error));

// sets up the handler for the LED device method call.
client.onDeviceMethod('toggleLED', (request, response) => {
  // toggle an led on the Tessel board!
  tessel.led[2].toggle();
  // tell IoT Hub that you got the method call request and everything's good.
  response.send(200, 'led toggled.', (error) => error && console.log(error));
});

// gets the current temperature reading from the climate module
function getTemperature() {
  // 'f' means get the reading in Farenheit
  climate.readTemperature('f', (error, temp) => {
    if (error) throw error; 
    console.log('Temperature level:', temp.toFixed(8));
    reportTemperatureLevel(temp);
  });
}

// sends temperature readings to IoT Hub
function reportTemperatureLevel(value) {
  // create a JSON payload to send to IoT Hub
  const data = JSON.stringify({ temperature: value });
  const message = new Message(data);

  console.log('Sending message: ' + message.getData());
  // send temperature value payload to IoT Hub
  client.sendEvent(message, (error) => error && console.log(error));
}

