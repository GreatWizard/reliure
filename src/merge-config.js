import merge from 'lodash.merge'

export default function (config = { default: {} }, format = undefined) {
  return merge({ format, filename: config.filename }, config.default, format ? config[format] : {})
}
