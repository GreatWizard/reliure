const inquirer = require("inquirer")

const defaultChoices = ["epub", "mobi"]

module.exports = (settings, options = {}) => {
  let choices = defaultChoices

  if (!settings.kindlegen) {
    choices.splice(choices.indexOf("mobi"), 1)
  }

  if (options.epub || options.mobi) {
    let result = []
    if (options.epub) {
      result.push("epub")
    }
    if (options.mobi) {
      result.push("mobi")
    }
    return { formats: result }
  }

  if (choices.length === 1) {
    return { formats: [choices[0]] }
  }

  return inquirer.prompt([
    {
      type: "checkbox",
      name: "formats",
      message: "Select the output formats:",
      choices,
      default: [choices[0]]
    }
  ])
}
