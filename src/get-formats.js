const inquirer = require('inquirer')

const { warn } = require('./message')

const defaultChoices = ['epub', 'mobi', 'pdf']

module.exports = (settings, options = {}) => {
  if (Object.keys(options).length > 0) {
    return getFormatFromInline(settings, options)
  } else {
    return getFormatFromPrompt(settings, options)
  }
}

const getFormatFromInline = (settings, options) => {
  let result = []

  if (options.epub || options.mobi || options.pdf) {
    if (options.epub) {
      result.push('epub')
    }
    if (options.mobi) {
      if (!settings.kindlegenPath) {
        warn('Specified option --mobi will be ignored because mobi format is disabled.')
      } else {
        result.push('mobi')
      }
    }
    if (options.pdf) {
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
    if (options['non-interactive']) {
      throw new Error('You should specify at least one format')
    } else {
      return getFormatFromPrompt(settings, options)
    }
  }

  return { formats: result }
}

const getFormatFromPrompt = (settings, options) => {
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
