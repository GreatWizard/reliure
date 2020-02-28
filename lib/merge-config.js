const merge = require("lodash.merge")

module.exports = (config = { default: {} }, format = undefined) => {
  return merge(
    { format, filename: config.filename },
    config.default,
    format ? config[format] : {}
  )
}
