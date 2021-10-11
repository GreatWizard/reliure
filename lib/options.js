const chalk = require('chalk')
const parseArgs = require('minimist')

const { version } = require('../package.json')

module.exports.getOptions = () => {
  let options = parseArgs(process.argv.slice(2), {
    boolean: ['epub', 'mobi', 'pdf', 'version', 'help'],
    alias: { v: 'version', h: 'help' },
  })
  if (options['_'] && options['_'].length > 0) {
    options.config = options['_'][0]
  }
  return options
}

module.exports.printVersion = () => {
  console.log(`v${version}`)
}

module.exports.printHelp = () => {
  console.log(`
  How to use Reliure ⛑️

  Usage: reliure [options] [configuration file/directory]

  Options:

    --epub          specify to bound the epub format
    --mobi          specify to bound the mobi format
    --pdf           specify to bound the pdf format
    -v, --version   print the version number
    -h, --help      print usage information


  Examples:

    reliure --epub --mobi
    reliure --epub --pdf my-project/
    reliure --epub --pdf my-complex-project/reliure-config.yml
    reliure -v
    reliure --version


  Visit ${chalk.bold('https://reliure.greatwizard.fr')} to learn more about Reliure.`)
}
