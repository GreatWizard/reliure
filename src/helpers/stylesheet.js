import path from 'path'

import { generateFontFilename } from './fonts.js'
import { getLanguageData } from './languages.js'

export const defaultStylesheet = `body {
  margin: 5%;
  text-align: justify;
  font-size: medium;
}

code {
  font-family: monospace;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  text-align: left;
}

.titlepage h1,
.titlepage p,
.titlepage div {
  text-align: center;
}

nav#toc ol,
nav#landmarks ol {
  padding: 0;
  margin-left: 1em;
}

nav#toc ol li,
nav#landmarks ol li {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

a.footnote-ref {
  vertical-align: super;
}

em,
em em em,
em em em em em {
  font-style: italic;
}

em em,
em em em em {
  font-style: normal;
}

code {
  white-space: pre-wrap;
}

span.smallcaps {
  font-variant: small-caps;
}

span.underline {
  text-decoration: underline;
}

q {
  quotes: "“" "”" "‘" "’";
}

div.column {
  display: inline-block;
  vertical-align: top;
  width: 50%;
}

div.hanging-indent {
  margin-left: 1.5em;
  text-indent: -1.5em;
}\n`

export function generateFontsStylesheet(fonts = {}) {
  let result = ''

  if (fonts.main) {
    result += `@font-face {
  font-family: "${fonts.main.name}";
  font-style: normal;
  font-weight: normal;
  src: url("../fonts/${path.basename(generateFontFilename(fonts, 'main', 'upright'))}");
}\n`

    if (fonts.main.shapes && fonts.main.shapes.italic) {
      result += `@font-face {
  font-family: "${fonts.main.name}";
  font-style: italic;
  font-weight: normal;
  src: url("../fonts/${generateFontFilename(fonts, 'main', 'italic')}");
}\n`
    }

    result += `body {
  font-family: '${fonts.main.name}';
}\n`
  }

  return result
}

export function getLanguageStylesheet(lang) {
  return `${getLanguageData(lang).css}\n`
}
