const fs = require("fs")
const os = require("os")
const path = require("path")
const CleanCSS = require("clean-css")
const nodePandoc = require("node-pandoc-promise")

const {
  latexHeader,
  latexNumber,
  latexImage,
  latexTOC,
  latexTitle,
  latexNewPage,
} = require("./helpers/latex")
const stylesheet = require("./helpers/stylesheet")
const { yamlToBool } = require("./utils")
const { epubToMobi } = require("./kindlegen")
const {
  extract,
  archive,
  replaceGeneratorMetadata,
  textSubstitutions,
  navSubstitutions,
  opfSubstitutions,
  appendExtraMetadata,
} = require("./edition")

const FORMAT_LATEX = "latex"
const FORMAT_MARKDOWN = "markdown"

module.exports = async (config) => {
  if (!config.filename) {
    throw new Error("[Reliure] Filename attribute is missing.")
  }

  if (!config.files || config.files.length === 0) {
    throw new Error(
      "[Reliure] Files attribute MUST be an array and contains at least one file."
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
    throw new Error("[Reliure] Files MUST be in LaTeX or Markdown.")
  }

  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "reliure-"))

  let args = []

  if (config.format === "epub" || config.format === "mobi") {
    // add stylesheet
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
    args.push("--css", cssFile)

    if (config.coverImage) {
      // add cover
      args.push(`--epub-cover-image`)
      args.push(path.join(process.cwd(), config.coverImage))
    }
  }

  if (config.format === "pdf") {
    // use pdflatex
    args.push("--pdf-engine=pdflatex")

    // add nice chapter split for pdf
    let headerFile = path.join(tempPath, "header.tex")
    fs.writeFileSync(headerFile, latexHeader(config.latexPackages), "utf8")
    args.push("--include-in-header", headerFile)

    // add before body: Title + Cover
    let latexBeforeBody = latexTitle()
    if (config.coverImage) {
      latexBeforeBody +=
        latexNewPage() +
        latexImage(path.join(process.cwd(), config.coverImage)) +
        latexNumber(false)
    }
    let beforeBodyFile = path.join(tempPath, "beforeBody.tex")
    fs.writeFileSync(beforeBodyFile, latexBeforeBody, "utf8")
    args.push("--include-before-body", beforeBodyFile)

    // add after body: TOC + Fourth Cover
    let latexAfterBody = latexTOC()
    if (config.fourthCoverImage) {
      latexAfterBody +=
        latexNewPage() +
        latexImage(path.join(process.cwd(), config.fourthCoverImage)) +
        latexNumber(false)
    }
    let afterBodyFile = path.join(tempPath, "afterBody.tex")
    fs.writeFileSync(afterBodyFile, latexAfterBody, "utf8")
    args.push("--include-after-body", afterBodyFile)
  }

  // from latex/markdown to epub/pdf
  let outputFormat = "epub"
  if (config.format === "pdf") {
    outputFormat = "pdf"
  }
  args.push("-t", outputFormat)

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
  args.push("-o", outputFile)

  // add metadata
  if (config.metadata) {
    for (const key in config.metadata) {
      args.push("--metadata", `${key}:${config.metadata[key]}`)
    }
  }

  // compile with pandoc
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
      replaceGeneratorMetadata(editionTempPath)
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
