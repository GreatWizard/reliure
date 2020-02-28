const chalk = require("chalk")
const figlet = require("figlet")

const { log, info, warn, error } = console

module.exports.printTitle = () => {
  log(
    chalk
      .keyword("orange")
      .bold(figlet.textSync("Reliure", { horizontalLayout: "full" }))
  )
}

module.exports.info = message => {
  info(chalk.cyan(`📘 ${message}`))
}

module.exports.success = message => {
  log(chalk.green(`📗 ${message}`))
}

module.exports.warn = message => {
  warn(chalk.keyword("orange")(`📙 ${message}`))
}

module.exports.error = message => {
  error(chalk.red(`📕 ${message}`))
}
