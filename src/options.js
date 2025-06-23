const chalk = require('chalk')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const { log } = require('./message')
const { version } = require('../package.json')

const optionList = [
  {
    name: 'config',
    alias: 'c',
    type: String,
    defaultOption: true,
    description: 'The configuration file/directory to process',
  },
  {
    name: 'archive',
    alias: 'a',
    type: Boolean,
    description:
      'Zip a folder that implements the epub specification. If you use this option, the config should be the path to the folder to archive.',
  },
  {
    name: 'epub',
    type: Boolean,
    description: 'Specify to bound the epub format',
  },
  {
    name: 'mobi',
    type: Boolean,
    description:
      'Specify to bound the mobi format and you accept the following terms of use: https://www.amazon.com/gp/feature.html?docId=1000599251',
  },
  {
    name: 'pdf',
    type: Boolean,
    description: 'Specify to bound the pdf format',
  },
  {
    name: 'kindlegen-path',
    type: String,
    description: 'Specify the kindlegen location',
  },
  {
    name: 'non-interactive',
    type: Boolean,
    description: 'Does not prompt for any input',
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean,
    description: 'Print the version number',
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Print usage information',
  },
]

module.exports.getOptions = () => {
  let options = commandLineArgs([
    ...optionList,
    {
      name: 'debug',
      type: Boolean,
    },
  ])
  if (options['kindlegen-path'] === '') {
    delete options['kindlegen-path']
  }
  return options
}

module.exports.printVersion = () => {
  log(`v${version}`)
}

module.exports.printHelp = () => {
  log(
    commandLineUsage([
      {
        header: 'How to use Reliure ⛑️',
        content: 'Usage: reliure [options] [configuration file/directory]',
      },
      {
        header: 'Options',
        optionList,
      },
      {
        header: 'Examples',
        content: `reliure --epub --mobi
reliure --epub --pdf my-project/
reliure --epub --pdf my-complex-project/reliure-config.yml
reliure --mobi --kindlegen-path=/usr/local/bin/kindlegen
reliure --archive my-unzipped-epub-i-manually-changed/
reliure -v
reliure --version`,
      },
      { content: `Visit ${chalk.bold('https://reliure.greatwizard.fr')} to learn more about Reliure.` },
    ]),
  )
}
