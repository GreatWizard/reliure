const En = require('./languages/en')
const Fr = require('./languages/fr')

const languages = [En, Fr]

module.exports.getLanguageData = (lang) => {
  if (lang) {
    let language = languages.find((l) => l.codes.includes(lang))
    if (language) {
      return language
    }
    language = languages.find((l) => l.codes.includes(lang.split('-')[0]))
    if (language) {
      return language
    }
  }
  return En
}
