const inquirer = require('inquirer')

const { warn } = require('./message')

const defaultChoices = ['epub', 'mobi', 'pdf']

module.exports = (settings, options = {}) => {
  let choices = defaultChoices

  if (!settings.kindlegenPath) {
    choices.splice(choices.indexOf('mobi'), 1)
  }

  if (options.epub || options.mobi || options.pdf) {
    let result = []
    if (options.epub && choices.includes('epub')) {
      result.push('epub')
    }
    if (options.mobi && choices.includes('mobi')) {
      result.push('mobi')
    }
    if (options.pdf && choices.includes('pdf')) {
      if (options.archive) {
        warn(
          '--pdf option is unrelated to the --archive functionality and will be ignored. --archive re-archives a folder that follows EPUB specifications as EPUB or mobi.',
        )
      } else {
        result.push('pdf')
      }
    }
    return { formats: result }
  }

  if (options['non-interactive']) {
    throw new Error('You should specify at least one format')
  }

  if (choices.length === 1) {
    return { formats: [choices[0]] }
  }

  return inquirer.prompt([
    {
      type: 'checkbox',
      name: 'formats',
      message: 'Select the output formats:',
      choices,
      default: [choices[0]],
    },
  ])
}
