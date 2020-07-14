const { Gpio, GpioValue, GpioDirection } = require('../cheesecake');

const gpio4 = new Gpio(4, GpioDirection.OUT);

gpio4.onValueChanged((data) => {
  const dateTime = new Date().toJSON();
  console.log(`${dateTime} - Gpio${gpio4.gpio}: new value => ${data}`);
});

setInterval(() => {
  const value = gpio4.getValue();
  gpio4.setValue(value ? GpioValue.LOW : GpioValue.HIGH);
}, 1000);

process.on('SIGINT', () => {
  console.log('Please, await...');
  gpio4.dispose();
  process.exit();
});
