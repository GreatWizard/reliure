const DEFAULT_LANGUAGE = '__default__'

const languages = [
  {
    codes: [DEFAULT_LANGUAGE],
    latexPackages: [],
    css: `section:not(.titlepage) p {
  margin: 0;
}
section:not(.titlepage) p:not(:nth-child(2)) {
  text-indent: 1.5em;
}`,
  },
  {
    codes: ['fr'],
    latexPackages: ['[french]{babel}'],
    css: `section:not(.titlepage) p {
  margin: 0;
  text-indent: 1.5em;
}`,
  },
]

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
  return languages.find((l) => l.codes.includes(DEFAULT_LANGUAGE))
}
