import { cleanArray } from '../utils.js'
import { generateFontFilename } from './fonts.js'

const defaultPackages = ['{tikz}', '{graphicx}', '{sectsty}']

export function latexHeader(latexPackages = [], fonts = {}) {
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

export function latexNumber(number = true) {
  return `\\thispagestyle{${number ? 'plain' : 'empty'}}\n`
}

export function latexImage(coverImage) {
  return `\\begin{tikzpicture}[remember picture,overlay]
  \\node[inner sep=0pt] at (current page.center) {%
    \\includegraphics[width=\\paperwidth,height=\\paperheight]{${coverImage}}%
  };
\\end{tikzpicture}\n`
}

export function latexTitle() {
  return `\\maketitle\n`
}

export function latexTOC() {
  return `\\tableofcontents\n`
}

export function latexNewPage() {
  return `\\newpage\n`
}
