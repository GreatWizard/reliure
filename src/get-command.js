import inquirer from 'inquirer'

import { log } from './message.js'

export const commands = {
  GENERATE: 'GENERATE',
  ARCHIVE: 'ARCHIVE',
}

export async function getCommand(options = {}) {
  let command
  if (Object.keys(options).length > 0) {
    command = options.archive ? commands.ARCHIVE : commands.GENERATE
  } else {
    command = await getCommandFromPrompt()
  }

  switch (command) {
    case commands.ARCHIVE:
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

  return answer.commands === choices[0] ? commands.GENERATE : commands.ARCHIVE
}
