import { afterEach, assert, describe, test, vi } from 'vitest'

import { printVersion } from '../../src/options.js'

const consoleLog = vi.spyOn(console, 'log')

describe('options', function () {
  afterEach(() => {
    consoleLog.mockClear()
  })

  test('prints version', () => {
    printVersion()
    assert.match(
      consoleLog.mock.lastCall[0],
      /v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      'version matches the regexp',
    )
  })
})
