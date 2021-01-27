const fs = require("fs")
const os = require("os")
const path = require("path")
const CleanCSS = require("clean-css")
const nodePandoc = require("node-pandoc-promise")

const { latexCover, latexHeader } = require("./helpers/latex")
const stylesheet = require("./helpers/stylesheet")
const { yamlToBool } = require("./utils")
const { epubToMobi } = require("./kindlegen")
const {
  extract,
  archive,
  textSubstitutions,
  navSubstitutions,
  opfSubstitutions,
  appendExtraMetadata,
} = require("./edition")

const FORMAT_LATEX = "latex"
const FORMAT_MARKDOWN = "markdown"

module.exports = async (config) => {
  if (!config.filename) {
    throw new Error("Filename attribute is missing")
  }

  if (!config.files || config.files.length === 0) {
    throw new Error(
      "Files attribute MUST be an array and contains at least one file."
    )
  }

  let detectedInputFormat = undefined
  if (
    config.files.filter((file) => file.endsWith(".tex")).length !==
    config.files.length
  ) {
    detectedInputFormat = FORMAT_LATEX
  }
  if (
    config.files.filter((file) => file.endsWith(".md")).length !==
    config.files.length
  ) {
    detectedInputFormat = FORMAT_MARKDOWN
  }
  if (detectedInputFormat === undefined) {
    throw new Error("Files MUST be in LaTeX or Markdown.")
  }

  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "reliure-"))

  let cssContent = ""
  if (
    config.ignoreDefaultStyleSheet === undefined ||
    !yamlToBool(config.ignoreDefaultStyleSheet)
  ) {
    cssContent = stylesheet
  }
  if (config.styleSheets && config.styleSheets.length > 0) {
    config.styleSheets.forEach((filename) => {
      cssContent = `${cssContent}${fs.readFileSync(filename, "utf8")}`
    })
  }
  cssContent = new CleanCSS({
    level: {
      2: {
        restructureRules: true,
      },
    },
  }).minify(cssContent).styles
  let cssFile = path.join(tempPath, "style.css")
  fs.writeFileSync(cssFile, cssContent, "utf8")

  // output format
  let outputFormat = "epub"
  if (config.format === "pdf") {
    outputFormat = "pdf"
  }

  // add stylesheet
  let args = ["--css", cssFile]

  // add nice chapter split for pdf
  if (config.format === "pdf") {
    let headerFile = path.join(tempPath, "header.tex")
    fs.writeFileSync(headerFile, latexHeader(), "utf8")
    args.push(`--include-in-header`)
    args.push(headerFile)
  }

  // add cover
  if (config.coverImage) {
    let coverImageFile = path.join(process.cwd(), config.coverImage)
    if (config.format === "epub" || config.format === "mobi") {
      args.push(`--epub-cover-image`)
      args.push(coverImageFile)
    } else if (config.format === "pdf") {
      let coverFile = path.join(tempPath, "cover.tex")
      fs.writeFileSync(coverFile, latexCover(coverImageFile), "utf8")
      args.push(`--include-before-body`)
      args.push(coverFile)
    }
  }

  // from latex/markdown to epub/pdf
  args.push("-t", outputFormat)

  // output file option
  args.push("-o")
  // output file
  let outputFile
  if (config.format === "mobi") {
    outputFile = path.join(tempPath, "temp.epub")
  } else {
    outputFile = path.join(
      process.cwd(),
      `${config.filename}.${config.format}`
    )
  }
  args.push(outputFile)

  // add metadata
  if (config.metadata) {
    for (const key in config.metadata) {
      args.push(`--metadata`)
      args.push(`${key}:${config.metadata[key]}`)
    }
  }

  // compile to epub
  await nodePandoc(path.join(process.cwd(), config.files[0]), args)

  if (config.format === "epub" || config.format === "mobi") {
    // Automatically edit epub: apply substitutions, append extra metadata
    if (
      config.textSubstitutions ||
      config.navSubstitutions ||
      config.opfSubstitutions ||
      config.extraMetadata
    ) {
      let editionTempPath = path.join(tempPath, "edition")
      await extract(editionTempPath, outputFile)
      if (config.textSubstitutions) {
        textSubstitutions(editionTempPath, config.textSubstitutions)
      }
      if (config.navSubstitutions) {
        navSubstitutions(editionTempPath, config.navSubstitutions)
      }
      if (config.opfSubstitutions) {
        opfSubstitutions(editionTempPath, config.opfSubstitutions)
      }
      if (config.extraMetadata) {
        appendExtraMetadata(editionTempPath, config.extraMetadata)
      }
      // epub file after our internal editions
      await archive(editionTempPath, outputFile)
    }
  }

  if (config.format === "mobi") {
    // convert epub to mobi
    await epubToMobi(
      outputFile,
      path.join(process.cwd(), `${config.filename}.mobi`)
    )
  }
}
