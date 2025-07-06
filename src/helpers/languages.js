import En from './languages/en.js'
import Fr from './languages/fr.js'

const languages = [En, Fr]

export function getLanguageData(lang) {
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
