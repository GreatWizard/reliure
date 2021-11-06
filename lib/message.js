const chalk = require('chalk')
const figlet = require('figlet')

const orange = '#ffb86c'

module.exports.printTitle = () => {
  console.log(chalk.hex(orange).bold(figlet.textSync('Reliure', { horizontalLayout: 'full' })))
}

module.exports.info = (message, icon = '📘') => {
  console.info(chalk.cyan(`${icon} ${message}`))
}

module.exports.success = (message, icon = '📗') => {
  console.log(chalk.green(`${icon} ${message}`))
}

module.exports.warn = (message, icon = '📙') => {
  console.warn(chalk.hex(orange)(`${icon} ${message}`))
}

module.exports.error = (message, icon = '📕') => {
  console.error(chalk.red(`${icon} ${message}`))
}
