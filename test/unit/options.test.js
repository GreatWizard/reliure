import { assert, describe, test, vi } from 'vitest'

const subject = require('../../src/options.js')

const consoleLog = vi.spyOn(console, 'log')

describe('options', function () {
  test('prints version', () => {
    subject.printVersion()
    assert.match(
      consoleLog.mock.lastCall[0],
      /v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      'version matches the regexp',
    )
  })
})
