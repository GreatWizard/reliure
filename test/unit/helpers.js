const chai = require('chai')

module.exports.setupSinon = () => {
  chai.use(require('sinon-chai'))
  require('mocha-sinon')
}
