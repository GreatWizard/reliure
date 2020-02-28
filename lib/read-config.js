const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

module.exports = () => {
  return yaml.safeLoad(
    fs.readFileSync(path.resolve(process.cwd(), "reliure.yml"), "utf8")
  )
}
