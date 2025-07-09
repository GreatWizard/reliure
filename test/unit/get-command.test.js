import { afterEach, assert, describe, expect, test, vi } from 'vitest'
import inquirer from 'inquirer'

import { commands, getCommand } from '../../src/get-command.js'

const consoleLog = vi.spyOn(console, 'log')

let inquirerPrompt

describe('get-command', function () {
  afterEach(() => {
    consoleLog.mockClear()
    inquirerPrompt?.mockClear()
  })

  describe('command line', function () {
    test('with no archive option, it returns GENERATE command', async () => {
      let options = { config: 'path/to/config' }
      let command = await getCommand(options)
      assert.equal(command, commands.GENERATE)
      expect(consoleLog).toBeCalledWith('\nReliure will generate ebook(s) based on the reliure.yml file.\n')
    })

    test('with archive option, it returns ARCHIVE command', async () => {
      let options = { config: 'path/to/config', archive: true }
      let command = await getCommand(options)
      assert.equal(command, commands.ARCHIVE)
      expect(consoleLog).toBeCalledWith('\nReliure will (re-)archive a folder that follows epub specification.\n')
    })
  })

  describe('prompt', function () {
    test('it returns the correct command when selecting "Generate an ebook"', async () => {
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(() => {
        return { commands: 'Generate an ebook' }
      })
      let command = await getCommand()
      assert.equal(command, commands.GENERATE)
    })

    test('it returns the correct command when selecting "Archive a folder to ebook"', async () => {
      inquirerPrompt = vi.spyOn(inquirer, 'prompt').mockImplementation(() => {
        return { commands: 'Archive a folder to ebook' }
      })
      let command = await getCommand()
      assert.equal(command, commands.ARCHIVE)
    })
  })
})
