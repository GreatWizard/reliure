const packages = ["graphicx", "sectsty"]

module.exports.latexHeader = () => {
  let header = ""
  packages.forEach((package) => {
    header += `\\usepackage{${package}}\n`
  })
  header += `\\sectionfont{\\clearpage}\n`
  return header
}

module.exports.latexNumber = (number = true) => {
  return `\\pagestyle{${number ? "plain" : "empty"}}\n`
}

module.exports.latexTOC = () => {
  return `\\setcounter{tocdepth}{1}
\\tableofcontents
\\newpage\n`
}

module.exports.latexCover = (coverImage) => {
  return `\\includegraphics{${coverImage}}
\\newpage\n`
}
