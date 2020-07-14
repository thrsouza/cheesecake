const chalk = require('chalk');
const { existsSync, watchFile, unwatchFile } = require('fs');
const { execSync } = require('child_process');

const GPIO_ROOT_PATH = '/sys/class/gpio';

function __delay(value) {
  execSync(`sleep ${value / 1000}`);
}

function __GpioExport(gpio) {
  execSync(`echo "${gpio}" > ${GPIO_ROOT_PATH}/export`);
  console.log(
    chalk.green(`Cheesecake ${new Date().toJSON()} - Gpio${gpio}: exported ✔`),
  );
  __delay(100);
}

function __GpioUnexport(gpio) {
  execSync(`echo "${gpio}" > ${GPIO_ROOT_PATH}/unexport`);
  console.log(
    chalk.green(
      `Cheesecake ${new Date().toJSON()} - Gpio${gpio}: unexported ✔`,
    ),
  );
}

function __GpioDirection(gpio, direction) {
  execSync(`echo "${direction}" > ${GPIO_ROOT_PATH}/gpio${gpio}/direction`);
}

class Gpio {
  /**
   * Constructor method
   * @param {Number} gpio
   * @param {String} direction
   */
  constructor(gpio, direction) {
    this.gpio = Object.freeze(gpio);
    this.direction = Object.freeze(direction);

    this.gpioPath = Object.freeze(`${GPIO_ROOT_PATH}/gpio${gpio}`);
    this.gpioValuePath = Object.freeze(`${this.gpioPath}/value`);

    if (!existsSync(this.gpioPath)) {
      __GpioExport(this.gpio);
    }

    __GpioDirection(this.gpio, this.direction);
  }

  /**
   * Retrieve the current GPIO value
   */
  getValue() {
    try {
      return Number(execSync(`cat ${this.gpioValuePath}`).toString().trim());
    } catch (_err) {
      console.log(
        chalk.yellow(
          `\r\nCheesecake ${new Date().toJSON()} - Gpio${
            this.gpio
          } is not available`,
        ),
      );
      return Number();
    }
  }

  /**
   * Define a new value for GPIO
   * @param {Number} value
   */
  setValue(value) {
    try {
      execSync(`echo "${value}" > ${this.gpioValuePath}`);
    } catch (_err) {
      console.log(
        chalk.yellow(
          `\r\nCheesecake ${new Date().toJSON()} - Gpio${
            this.gpio
          } is not available`,
        ),
      );
    }
  }

  /**
   * Reverses the effect of exporting GPIO to user space
   */
  dispose() {
    unwatchFile(this.gpioValuePath);
    __GpioUnexport(this.gpio);
  }

  /**
   * The callback will be called when gpio value changed
   * @param {function(Number)} callback
   */
  onValueChanged(callback) {
    if (typeof callback === 'function') {
      let currentValue = this.getValue();

      watchFile(this.gpioValuePath, { interval: 150 }, () => {
        const value = this.getValue();
        if (value !== currentValue) {
          currentValue = value;
          callback(value);
        }
      });
    }
  }
}

const GpioValue = Object.freeze({
  HIGH: 1,
  LOW: 0,
});

const GpioDirection = Object.freeze({
  IN: 'in',
  OUT: 'out',
});

module.exports = { Gpio, GpioValue, GpioDirection };
