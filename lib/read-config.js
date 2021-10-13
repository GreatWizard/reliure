const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { schemaReliure } = require('./schemas')

const DEFAULT_FILENAME = 'reliure.yml'

module.exports.findConfig = (filename) => {
  let file
  if (filename) {
    if (fs.existsSync(path.join(path.resolve(filename), DEFAULT_FILENAME))) {
      // check filename with relative path + /reliure.yml
      file = path.join(path.resolve(filename), DEFAULT_FILENAME)
    } else if (fs.existsSync(path.resolve(filename))) {
      // check filename with relative path
      file = path.resolve(filename)
    } else if (fs.existsSync(path.join(filename, DEFAULT_FILENAME))) {
      // check filename with absolute path + /reliure.yml
      file = path.join(filename, DEFAULT_FILENAME)
    } else if (fs.existsSync(filename)) {
      // check filename with absolute path
      file = filename
    }
  } else {
    file = DEFAULT_FILENAME
  }
  return file
}

module.exports.readConfig = (filename) => {
  try {
    let rawConfig = fs.readFileSync(filename, 'utf8')
    return yaml.load(rawConfig)
  } catch (e) {
    throw new Error(
      `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`,
    )
  }
}

module.exports.validateConfig = (config) => {
  let { error } = schemaReliure.validate(config, { abortEarly: false })
  if (error) {
    throw new Error(`Configuration file is invalid:${error.details.map((detail) => `\n  - ${detail.message}`)}`)
  }
  return true
}
