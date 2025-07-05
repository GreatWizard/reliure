const inquirer = require('inquirer')
const { log } = require('./message')

module.exports.commands = {
  GENERATE: 'GENERATE',
  ARCHIVE: 'ARCHIVE',
}

module.exports.getCommand = async (options = {}) => {
  let command
  if (Object.keys(options).length > 0) {
    command = options.archive ? this.commands.ARCHIVE : this.commands.GENERATE
  } else {
    command = await getCommandFromPrompt()
  }

  switch (command) {
    case this.commands.ARCHIVE:
      log('\nReliure will (re-)archive a folder that follows epub specification.\n')
      break
    default:
      log('\nReliure will generate ebook(s) based on the reliure.yml file.\n')
      break
  }

  return command
}

const getCommandFromPrompt = async () => {
  const choices = ['Generate an ebook', 'Archive a folder to ebook']
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'commands',
      message: 'What would you like to do?',
      choices,
      default: [choices[0]],
    },
  ])

  return answer.commands === choices[0] ? this.commands.GENERATE : this.commands.ARCHIVE
}
