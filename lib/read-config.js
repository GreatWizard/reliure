const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const FILENAME = 'reliure.yml'

module.exports = () => {
  try {
    let config = fs.readFileSync(path.resolve(process.cwd(), FILENAME), 'utf8')
    return yaml.load(config)
  } catch (e) {
    throw new Error(
      `[Reliure] Please run binding in the directory where the configuration file "${FILENAME}" is located.`,
    )
  }
}
