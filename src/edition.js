const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')
const archiver = require('archiver')
const replace = require('replace')

const METADATA_TAG = '  </metadata>'

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
  const zip = fs.createReadStream(source).pipe(unzipper.Parse({ forceStream: true }))
  for await (const entry of zip) {
    const fileName = entry.path
    let distFileName = path.join(tempPath, fileName)
    fs.mkdirSync(path.dirname(distFileName), { recursive: true })
    entry.pipe(fs.createWriteStream(distFileName))
  }
}

module.exports.archive = async (tempPath, destination) => {
  let output = fs.createWriteStream(destination)
  let archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(output)
  archive.append('application/epub+zip', { name: 'mimetype', store: true })
  archive.directory(path.join(tempPath, 'META-INF'), 'META-INF')
  archive.directory(path.join(tempPath, 'EPUB'), 'EPUB')
  await archive.finalize()
}

module.exports.textSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, 'EPUB', 'text'), substitutions)
}

module.exports.navSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, 'EPUB', 'nav.xhtml'), substitutions)
}

module.exports.opfSubstitutions = (tempPath, substitutions = []) => {
  substitute(path.join(tempPath, 'EPUB', 'content.opf'), substitutions)
}

module.exports.appendExtraMetadata = (tempPath, extraMetadata = {}) => {
  let html = ''
  Object.keys(extraMetadata).forEach((name) => {
    html += `    <meta name="${name}" content="${extraMetadata[name]}" />
`
  })
  html += METADATA_TAG

  let fileName = path.join(tempPath, 'EPUB', 'content.opf')
  let fileContent = fs.readFileSync(fileName, 'utf8')
  fileContent = fileContent.replace(METADATA_TAG, html)
  fs.writeFileSync(fileName, fileContent, 'utf8')
}

const findFilesSync = (dir, ext) => {
  return fs
    .readdirSync(dir)
    .filter((filename) => filename.endsWith(ext))
    .map((fileName) => path.join(dir, fileName))
}

module.exports.replaceGeneratorMetadata = (tempPath) => {
  let textFiles = [
    ...findFilesSync(path.join(tempPath, 'EPUB'), '.xhtml'),
    ...findFilesSync(path.join(tempPath, 'EPUB', 'text'), '.xhtml'),
  ]
  textFiles.forEach((fileName) => {
    let fileContent = fs.readFileSync(fileName, 'utf8')
    fileContent = fileContent.replace(
      '<meta name="generator" content="pandoc" />',
      '<meta name="generator" content="reliure" />',
    )
    fs.writeFileSync(fileName, fileContent, 'utf8')
  })
}
