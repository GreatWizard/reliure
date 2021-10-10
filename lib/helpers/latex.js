const defaultPackages = ['{lmodern}', '[utf8]{inputenc}', '[T1]{fontenc}', '{tikz}', '{graphicx}', '{sectsty}']

export function latexHeader(latexPackages = []) {
  let header = ''
  let allPackages = defaultPackages.concat(latexPackages)
  allPackages.forEach((packageName) => {
    header += `\\usepackage${packageName}\n`
  })
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
  return `\\setcounter{tocdepth}{1}
\\tableofcontents\n`
}

export function latexNewPage() {
  return `\\newpage\n`
}
