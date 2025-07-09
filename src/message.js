import chalk from 'chalk'
import figlet from 'figlet'

const orange = '#ffb86c'

export function printTitle() {
  console.log(chalk.hex(orange).bold(figlet.textSync('Reliure', { horizontalLayout: 'full' })))
}

export function info(message, icon = '📘') {
  console.info(chalk.cyan(`${icon} ${message}`))
}

export function success(message, icon = '📗') {
  console.log(chalk.green(`${icon} ${message}`))
}

export function warn(message, icon = '📙') {
  console.warn(chalk.hex(orange)(`${icon} ${message}`))
}

export function error(message, icon = '📕') {
  console.error(chalk.red(`${icon} ${message}`))
}

export function debug(message, icon = '⚙️') {
  console.log(chalk.gray(`${icon} ${message}`))
}

export function log(message = '') {
  console.log(message)
}
