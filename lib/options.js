import chalk from 'chalk'
import parseArgs from 'minimist'

const { log } = console

// Define "require"
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { version } = require('../package.json')

export function getOptions() {
  return parseArgs(process.argv.slice(2), {
    boolean: ['epub', 'mobi', 'pdf', 'version', 'help'],
    alias: { v: 'version', h: 'help' },
  })
}

export function printVersion() {
  log(version)
}

export function printHelp() {
  log(`  How to use Reliure ⛑️

  Usage: reliure [options]

  Options:

    --epub          specify to bound the epub format
    --mobi          specify to bound the mobi format
    --pdf           specify to bound the pdf format
    -v, --version   print the version number
    -h, --help      print usage information


  Examples:

    reliure --epub --mobi
    reliure -v
    reliure --version


  Visit ${chalk.bold('https://reliure.greatwizard.fr')} to learn more about Reliure.`)
}
