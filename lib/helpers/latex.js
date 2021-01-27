const packages = ["graphicx", "sectsty"]

module.exports.latexHeader = () => {
  let header = ""
  packages.forEach((package) => {
    header += `\\usepackage{${package}}\n`
  })
  header += `\\sectionfont{\\clearpage}\n`
  return header
}

module.exports.latexCover = (coverImage) => {
  return `\\includegraphics{${coverImage}}
\\thispagestyle{empty}`
}
