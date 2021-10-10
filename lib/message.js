const chalk = require('chalk')
const figlet = require('figlet')

module.exports.printTitle = () => {
  console.log(chalk.keyword('orange').bold(figlet.textSync('Reliure', { horizontalLayout: 'full' })))
}

module.exports.info = (message) => {
  console.info(chalk.cyan(`📘 ${message}`))
}

module.exports.success = (message) => {
  console.log(chalk.green(`📗 ${message}`))
}

module.exports.warn = (message) => {
  console.warn(chalk.keyword('orange')(`📙 ${message}`))
}

module.exports.error = (message) => {
  console.error(chalk.red(`📕 ${message}`))
}
