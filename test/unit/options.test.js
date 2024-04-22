const chai = require('chai')
const { setupSinon } = require('./helpers')

const { expect } = chai

setupSinon()

describe('options', function () {
  let logSpy, subject

  this.beforeEach(function () {
    const message = require('../../src/message.js')

    logSpy = this.sinon.spy(message, 'log')

    subject = require('../../src/options.js')
  })

  it('prints version', function () {
    subject.printVersion()

    expect(logSpy.args[0]).to.match(
      /v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    )
  })
})
