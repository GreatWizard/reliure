import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const FILENAME = 'reliure.yml'

export default function () {
  try {
    let config = fs.readFileSync(path.resolve(process.cwd(), FILENAME), 'utf8')
    return yaml.load(config)
  } catch (e) {
    throw new Error(
      `[Reliure] Please run binding in the directory where the configuration file "${FILENAME}" is located.`,
    )
  }
}
