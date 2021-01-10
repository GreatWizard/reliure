const fs = require("fs")
const path = require("path")
const unzipper = require("unzipper")
const archiver = require("archiver")
const replace = require("replace")

const substitute = (filePath, substitutions = []) => {
  substitutions.forEach((sub) => {
    replace({
      regex: sub.regex,
      replacement: sub.replacement,
      paths: [filePath],
      recursive: true,
      silent: true,
    })
  })
}

module.exports.extract = async (tempPath, source) => {
  const zip = fs
    .createReadStream(source)
    .pipe(unzipper.Parse({ forceStream: true }))
  for await (const entry of zip) {
    const fileName = entry.path
    let distFileName = path.join(tempPath, fileName)
    fs.mkdirSync(path.dirname(distFileName), { recursive: true })
    entry.pipe(fs.createWriteStream(distFileName))
  }
}

module.exports.archive = async (tempPath, destination) => {
  let output = fs.createWriteStream(destination)
  let archive = archiver("zip", { zlib: { level: 9 } })
  archive.pipe(output)
  archive.file(path.join(tempPath, "mimetype"), { name: 'mimetype', store: true })
  archive.glob("META-INF/**", { cwd: tempPath })
  archive.glob("EPUB/**", { cwd: tempPath })
  await archive.finalize()
}

module.exports.textSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, "EPUB", "text"), substitutions)
}

module.exports.navSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, "EPUB", "nav.xhtml"), substitutions)
}

module.exports.opfSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, "EPUB", "content.opf"), substitutions)
}
