const defaultPpackages = ['{lmodern}', '[utf8]{inputenc}', '[T1]{fontenc}', '{tikz}', '{graphicx}', '{sectsty}']

module.exports.latexHeader = (latexPackages = []) => {
  let header = ''
  let allPackages = defaultPpackages.concat(latexPackages)
  allPackages.forEach((packageName) => {
    header += `\\usepackage${packageName}\n`
  })
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
  return `\\setcounter{tocdepth}{1}
\\tableofcontents\n`
}

module.exports.latexNewPage = () => {
  return `\\newpage\n`
}
