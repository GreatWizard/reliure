import fs from 'fs'
import path from 'path'
import { load } from 'js-yaml'

import { schemaReliure } from './schemas.js'

const DEFAULT_FILENAME = 'reliure.yml'

export function findConfig(pathOption) {
  if (!pathOption) {
    pathOption = DEFAULT_FILENAME
  }
  if (!fs.existsSync(pathOption)) {
    throw `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`
  }

  let stat = fs.statSync(pathOption)

  if (stat.isFile()) {
    return path.resolve(pathOption)
  }

  if (stat.isDirectory()) {
    let configFile = path.join(pathOption, DEFAULT_FILENAME)
    if (!fs.existsSync(configFile)) {
      throw `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`
    }

    return path.resolve(configFile)
  }
}

export function readConfig(filename) {
  try {
    let rawConfig = fs.readFileSync(filename, 'utf8')
    return load(rawConfig)
  } catch (e) {
    throw new Error(
      `Please run binding in the directory where the configuration file "${DEFAULT_FILENAME}" is located.`,
    )
  }
}
export function validateConfig(config) {
  let { error } = schemaReliure.validate(config, { abortEarly: false })
  if (error) {
    throw new Error(`Configuration file is invalid:${error.details.map((detail) => `\n  - ${detail.message}`)}`)
  }
  return true
}
