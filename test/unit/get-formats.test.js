import { assert, beforeEach, describe, expect, test, vi } from 'vitest'

const inquirer = require('inquirer')
const getFormat = require('../../src/get-formats.js')

const consoleWarn = vi.spyOn(console, 'warn')

let inquirerPrompt

describe('get-formats', function () {
  beforeEach(() => {
    consoleWarn.mockClear()
    inquirerPrompt?.mockClear()
  })

  describe('command line', function () {
    test('it returns the specified formats', () => {
      let settings = { kindlegenPath: true }
      let command = 'GENERATE'
      let options = { epub: true, mobi: true, pdf: true }
      let formats = getFormat(settings, command, options)
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [
            "epub",
            "mobi",
            "pdf",
          ],
        }
      `)
    })

    test('with kindlegenPath disabled, it removes mobi format', () => {
      let settings = { kindlegenPath: false }
      let command = 'GENERATE'
      let options = { epub: true, mobi: true, pdf: true }
      let formats = getFormat(settings, command, options)
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [
            "epub",
            "pdf",
          ],
        }
      `)

      expect(consoleWarn).toBeCalledWith('📙 Specified option --mobi will be ignored because mobi format is disabled.')
    })

    test('it throws when no format is specified', () => {
      let settings = { kindlegenPath: true }
      let command = 'GENERATE'
      let options = { 'non-interactive': true }
      assert.throws(() => getFormat(settings, command, options), 'You should specify at least one format')
    })

    test('with archive option, it removes pdf format', () => {
      let settings = { kindlegenPath: true }
      let command = 'ARCHIVE'
      let options = { epub: true, mobi: true, pdf: true, archive: true }
      let formats = getFormat(settings, command, options)
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [
            "epub",
            "mobi",
          ],
        }
      `)

      expect(consoleWarn).toBeCalledWith(
        '📙 Specified option --pdf is unrelated to the --archive functionality and will be ignored. --archive re-archives a folder that follows EPUB specifications as EPUB or mobi.',
      )
    })

    test('with archive option, specifying a format is optional', () => {
      let settings = { kindlegenPath: true }
      let command = 'ARCHIVE'
      let options = { archive: true }
      let formats = getFormat(settings, command, options)
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [],
        }
      `)
    })
  })

  describe('prompt', function () {
    test('it proposes all the formats', async () => {
      let settings = { kindlegenPath: true }
      let command = 'GENERATE'
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(([...args]) => {
        expect(args[0]).toMatchInlineSnapshot(`
          {
            "choices": [
              "epub",
              "mobi",
              "pdf",
            ],
            "default": [
              "epub",
            ],
            "message": "Select the output formats:",
            "name": "formats",
            "type": "checkbox",
          }
        `)
        return { formats: ['epub'] }
      })
      await getFormat(settings, command, {})
    })

    test('with kindlegenPath disabled, it removes mobi format from choices', async () => {
      let settings = { kindlegenPath: false }
      let command = 'GENERATE'
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(([...args]) => {
        expect(args[0]).toMatchInlineSnapshot(`
          {
            "choices": [
              "epub",
              "pdf",
            ],
            "default": [
              "epub",
            ],
            "message": "Select the output formats:",
            "name": "formats",
            "type": "checkbox",
          }
        `)
        return { formats: ['epub'] }
      })
      await getFormat(settings, command, {})
    })

    test('with archive option, it removes pdf format from choices', async () => {
      let settings = { kindlegenPath: true }
      let command = 'ARCHIVE'
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(([...args]) => {
        expect(args[0]).toMatchInlineSnapshot(`
          {
            "choices": [
              "epub",
              "mobi",
            ],
            "default": [
              "epub",
            ],
            "message": "Select the output formats:",
            "name": "formats",
            "type": "checkbox",
          }
        `)
        return { formats: ['epub'] }
      })
      await getFormat(settings, command, {})
    })

    test('it does not prompt if there is only one format left', async () => {
      let settings = { kindlegenPath: false }
      let command = 'ARCHIVE'
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(() => {})
      let formats = await getFormat(settings, command, {})
      expect(inquirerPrompt).not.toHaveBeenCalled()
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [
            "epub",
          ],
        }
      `)
    })
  })
})
