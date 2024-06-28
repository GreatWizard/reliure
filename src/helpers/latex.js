const { cleanArray } = require('../utils')
const { generateFontFilename } = require('./fonts')

const defaultPackages = ['{tikz}', '{graphicx}', '{sectsty}']

module.exports.latexHeader = (latexPackages = [], fonts = {}) => {
  let header = ''
  let allPackages = [...defaultPackages, ...latexPackages]
  if (fonts.main) {
    allPackages.push('{fontspec}')
  }
  cleanArray(allPackages).forEach((packageName) => {
    header += `\\usepackage${packageName}\n`
  })
  if (fonts.main) {
    header += `\\setmainfont{${generateFontFilename(fonts, 'main', 'upright')}}`
    if (fonts.main.shapes && fonts.main.shapes.italic) {
      header += `[
  ItalicFont=${generateFontFilename(fonts, 'main', 'italic')}
]`
    }
    header += '\n'
  }
  header += `\\sectionfont{\\clearpage}\n`
  return header
}

module.exports.latexNumber = (number = true) => {
  return `\\thispagestyle{${number ? 'plain' : 'empty'}}\n`
}

module.exports.latexImage = (coverImage) => {
  return `\\begin{tikzpicture}[remember picture,overlay]
  \\node[inner sep=0pt] at (current page.center) {%
    \\includegraphics[width=\\paperwidth,height=\\paperheight]{${coverImage}}%
  };
\\end{tikzpicture}\n`
}

module.exports.latexTitle = () => {
  return `\\maketitle\n`
}

module.exports.latexTOC = () => {
  return `\\tableofcontents\n`
}

module.exports.latexNewPage = () => {
  return `\\newpage\n`
}
