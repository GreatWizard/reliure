import { assert, beforeEach, describe, expect, test, vi } from 'vitest'

const getFormat = require('../../src/get-formats.js')

const consoleWarn = vi.spyOn(console, 'warn')

describe('get-formats', function () {
  beforeEach(() => {
    consoleWarn.mockClear()
  })

  describe('command line', function () {
    test('it returns the specified formats', () => {
      let settings = { kindlegenPath: true }
      let options = { epub: true, mobi: true, pdf: true }
      let formats = getFormat(settings, options)
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
      let options = { epub: true, mobi: true, pdf: true }
      let formats = getFormat(settings, options)
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
      let options = { 'non-interactive': true }
      assert.throws(() => getFormat(settings, options), 'You should specify at least one format')
    })

    test('with archive option, it removes pdf format', () => {
      let settings = { kindlegenPath: true }
      let options = { epub: true, mobi: true, pdf: true, archive: true }
      let formats = getFormat(settings, options)
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
      let options = { archive: true }
      let formats = getFormat(settings, options)
      expect(formats).toMatchInlineSnapshot(`
        {
          "formats": [],
        }
      `)
    })
  })
})
