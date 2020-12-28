const fs = require("fs")
const nodePandoc = require("node-pandoc-promise")
const os = require("os")
const path = require("path")
const stylesheet = require("./stylesheet")
const CleanCSS = require("clean-css")
const { yamlToBool } = require ("./utils")
const { epubToMobi } = require("./kindlegen")

module.exports = async config => {
  if (!config.filename) {
    throw new Error("Filename attribute is missing")
  }

  if (!config.files || config.files.length === 0) {
    throw new Error(
      "Files attribute MUST be an array and contains at least one file."
    )
  }

  if (
    config.files.filter(file => file.endsWith(".tex")).length !==
    config.files.length
  ) {
    throw new Error("Files MUST be in LaTeX.")
  }

  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "reliure-"))

  let cssContent = ""
  if (config.ignoreDefaultStyleSheet === undefined || !yamlToBool(config.ignoreDefaultStyleSheet)) {
    cssContent = stylesheet
  }
  if (config.styleSheets && config.styleSheets.length > 0) {
    config.styleSheets.forEach((filename)=> {
      cssContent = `${cssContent}${fs.readFileSync(filename, 'utf8')}`
    })
  }
  cssContent = new CleanCSS({
    level: {
      2: {
        restructureRules: true
      }
    }
  }).minify(cssContent).styles
  let cssFile = path.join(tempPath, "style.css")
  fs.writeFileSync(cssFile, cssContent)

  // add stylesheet, from latex to epub, output file option
  let args = [
    "--css",
    cssFile,
    "-f",
    "latex",
    "-t",
    "epub",
    "-o"
  ]
  // output file
  let epubFile
  switch (config.format) {
    case "epub":
      epubFile = path.join(process.cwd(), `${config.filename}.epub`)
      break
    case "mobi":
      epubFile = path.join(tempPath, "temp.epub")
      break
  }
  args.push(epubFile)

  // add cover
  if (config.coverImage) {
    args.push(`--epub-cover-image`)
    args.push(path.join(process.cwd(), config.coverImage))
  }

  // add metadata
  if (config.metadata) {
    for (const key in config.metadata) {
      args.push(`--metadata`)
      args.push(`${key}:${config.metadata[key]}`)
    }
  }

  // compile to epub
  await nodePandoc(path.join(process.cwd(), config.files[0]), args)

  if (config.format === "mobi") {
    // convert epub to mobi
    await epubToMobi(
      epubFile,
      path.join(process.cwd(), `${config.filename}.mobi`)
    )
  }
}
