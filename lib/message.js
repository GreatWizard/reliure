import chalk from 'chalk'
import figlet from 'figlet'

export function printTitle() {
  console.log(chalk.keyword('orange').bold(figlet.textSync('Reliure', { horizontalLayout: 'full' })))
}

export function info(message) {
  console.info(chalk.cyan(`📘 ${message}`))
}

export function success(message) {
  console.log(chalk.green(`📗 ${message}`))
}

export function warn(message) {
  console.warn(chalk.keyword('orange')(`📙 ${message}`))
}

export function error(message) {
  console.error(chalk.red(`📕 ${message}`))
}
