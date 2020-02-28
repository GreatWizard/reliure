const chalk = require("chalk")
const parseArgs = require("minimist")

const log = console.log

const { version } = require("../package.json")

module.exports.getOptions = () => {
  return parseArgs(process.argv.slice(2), {
    boolean: ["epub", "mobi", "version", "help"],
    alias: { v: "version", h: "help" }
  })
}

module.exports.printVersion = () => {
  log(version)
}

module.exports.printHelp = () => {
  log(`  How to use Reliure ⛑️

  Usage: reliure [options]

  Options:

    --epub          specify to bound the epub format
    --mobi          specify to bound the mobi format
    -v, --version   print the version number
    -h, --help      print usage information


  Examples:

    reliure --epub --mobi
    reliure -v
    reliure --version


  Visit ${chalk.bold(
    "https://reliure.greatwizard.fr"
  )} to learn more about Reliure.`)
}
