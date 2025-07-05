const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const { error } = require('./message')

module.exports = async () => {
  return ensureInput()
}

const getInput = async () => {
  const { folderPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'folderPath',
      message: 'Type the name of the folder to archive:',
    },
  ])
  return folderPath
}

const ensureInput = async () => {
  let folderPath = await getInput()
  folderPath = path.resolve(folderPath)

  if (!fs.existsSync(folderPath)) {
    error(`${folderPath} was not found. Does the folder exist?`)
    folderPath = await ensureInput()
  }

  let stat = fs.statSync(folderPath)
  if (!stat.isDirectory()) {
    error(
      `${folderPath} is not a folder. Reliure can only archive a folder that follows epub specification. Did you type the correct name?`,
    )
    folderPath = await ensureInput()
  }

  return folderPath
}
