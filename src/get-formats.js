const inquirer = require('inquirer')

const { warn } = require('./message')

const defaultChoices = ['epub', 'mobi', 'pdf']

module.exports = (settings, options = {}) => {
  if (options['non-interactive'] || Object.keys(options).length > 0) {
    return getFormatFromInline(settings, options)
  } else {
    return getFormatFromPrommpt(settings, options)
  }
}

const getFormatFromInline = (settings, options) => {
  let result = []

  if (options.epub || options.mobi || options.pdf) {
    if (options.epub && choices.includes('epub')) {
      result.push('epub')
    }
    if (options.mobi && choices.includes('mobi')) {
      if (!settings.kindlegenPath) {
        warn(
          'Specified option --mobi will be ignored because mobi format is disabled.',
        )
      } else {
        result.push('mobi')
      }
    }
    if (options.pdf && choices.includes('pdf')) {
      if (options.archive) {
        warn(
          'Specified option --pdf is unrelated to the --archive functionality and will be ignored. --archive re-archives a folder that follows EPUB specifications as EPUB or mobi.',
        )
      } else {
        result.push('pdf')
      }
    }
  }

  if (result.length <= 0 && !options.archive) {
    throw new Error('You should specify at least one format')
  }

  return { formats: result }
}

const getFormatFromPrommpt = (settings, options) => {
  let choices = defaultChoices

  if (!settings.kindlegenPath) {
    choices.splice(choices.indexOf('mobi'), 1)
  }

  if (options.archive) {
    choices.splice(choices.indexOf('pdf'), 1)
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
