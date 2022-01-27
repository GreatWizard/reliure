const chalk = require('chalk')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

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
    name: 'epub',
    type: Boolean,
    description: 'Specify to bound the epub format',
  },
  {
    name: 'mobi',
    type: Boolean,
    description: 'Specify to bound the mobi format',
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
  console.log(`v${version}`)
}

module.exports.printHelp = () => {
  console.log(
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
reliure -v
reliure --version`,
      },
      { content: `Visit ${chalk.bold('https://reliure.greatwizard.fr')} to learn more about Reliure.` },
    ]),
  )
}
