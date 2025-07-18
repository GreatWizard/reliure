import fs from 'fs'
import os from 'os'
import path from 'path'
import CleanCSS from 'clean-css'
import { dump } from 'js-yaml'

import nodePandoc from './node-pandoc-promise.js'

import { latexHeader, latexNumber, latexImage, latexTOC, latexTitle, latexNewPage } from './helpers/latex.js'
import { defaultStylesheet, generateFontsStylesheet, getLanguageStylesheet } from './helpers/stylesheet.js'
import { generateFontFilename } from './helpers/fonts.js'
import { parseBool } from './utils.js'
import { epubToMobi } from './kindlegen.js'
import {
  extract,
  archive,
  replaceGeneratorMetadata,
  textSubstitutions,
  navSubstitutions,
  opfSubstitutions,
  appendExtraMetadata,
} from './edition.js'
import { success } from './message.js'

const FORMATS = [
  { name: 'LaTeX', extension: 'tex' },
  { name: 'Markdown', extension: 'md' },
  { name: 'LibreOffice', extension: 'odt' },
  { name: 'Microsoft Word', extension: 'docx' },
]

export default async function (config, options = {}) {
  let cwd = options.cwd || process.cwd()

  // Check existence of stylesheets
  ;(config.styleSheets || []).forEach((filename) => {
    if (!fs.existsSync(path.join(cwd, filename))) {
      throw new Error(`Stylesheet "${filename}" doesn't exists.`)
    }
  })

  // Check existence of fonts
  let fontsFiles = []
  Object.keys(config.fonts || []).forEach((type) => {
    let shapes = Object.keys(config.fonts[type].shapes || [])
    if (!shapes.includes('upright')) {
      shapes.push('upright')
    }
    shapes.forEach((shape) => {
      let filename = generateFontFilename(config.fonts, type, shape)
      fontsFiles.push(path.join(cwd, filename))
      if (!fs.existsSync(path.join(cwd, filename))) {
        throw new Error(`Fonts "${filename}" doesn't exists.`)
      }
    })
  })

  // Check existence of files
  ;(config.files || []).forEach((filename) => {
    if (!fs.existsSync(path.join(cwd, filename))) {
      throw new Error(`File "${filename}" doesn't exists.`)
    }
  })
  ;[config.coverImage, config.fourthCoverImage].filter(Boolean).forEach((filename) => {
    if (!fs.existsSync(path.join(cwd, filename))) {
      throw new Error(`File "${filename}" doesn't exists.`)
    }
  })

  // Check that all input files are in the same supported format
  let detectedInputFormat = undefined
  FORMATS.forEach((format) => {
    if (config.files.every((filename) => filename.endsWith(`.${format.extension}`))) {
      detectedInputFormat = format
    }
  })
  if (detectedInputFormat === undefined) {
    throw new Error(
      `Files MUST use the same format and be in one of the following formats:
  - Microsoft Word (.docx)
  - LibreOffice (.odt)
  - Markdown (.md)
  - LaTeX (.tex)`,
    )
  }

  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), 'reliure-'))

  let args = config.files

  // Suppress warning messages
  args.push('--quiet')

  if (config.format === 'epub' || config.format === 'mobi') {
    // add stylesheet
    let cssContent = ''
    if (config.ignoreDefaultStyleSheet === undefined || !parseBool(config.ignoreDefaultStyleSheet)) {
      cssContent = defaultStylesheet
    }
    ;(config.styleSheets || []).forEach((filename) => {
      cssContent += fs.readFileSync(path.join(cwd, filename), 'utf8')
    })
    cssContent += getLanguageStylesheet(config.metadata.lang)
    cssContent += generateFontsStylesheet(config.fonts)
    cssContent = new CleanCSS({
      level: {
        2: {
          restructureRules: true,
        },
      },
    }).minify(cssContent).styles
    let cssFile = path.join(tempPath, 'style.css')
    fs.writeFileSync(cssFile, cssContent, 'utf8')
    args.push('--css', cssFile)

    fontsFiles.forEach((filename) => {
      args.push('--epub-embed-font', filename)
    })

    if (config.coverImage) {
      // add cover
      args.push(`--epub-cover-image`)
      args.push(path.join(cwd, config.coverImage))
    }
  }

  if (config.format === 'pdf') {
    if (config.metadata.lang) {
      // Pass the lang option to the template
      args.push('-V', `lang=${config.metadata.lang.split('-')[0]}`)
    }

    // use pdf engine
    args.push('--pdf-engine=xelatex')

    // add nice chapter split for pdf
    let headerContent = latexHeader(config.latexPackages, config.fonts)
    let headerFile = path.join(tempPath, 'header.tex')
    fs.writeFileSync(headerFile, headerContent, 'utf8')
    args.push('--include-in-header', headerFile)

    // add before body: Title + Cover
    let latexBeforeBody = latexTitle()
    if (config.coverImage) {
      latexBeforeBody += latexNewPage() + latexImage(path.join(cwd, config.coverImage)) + latexNumber(false)
    }
    let beforeBodyFile = path.join(tempPath, 'beforeBody.tex')
    fs.writeFileSync(beforeBodyFile, latexBeforeBody, 'utf8')
    args.push('--include-before-body', beforeBodyFile)

    // add after body: TOC + Fourth Cover
    let latexAfterBody = latexTOC()
    if (config.fourthCoverImage) {
      latexAfterBody += latexNewPage() + latexImage(path.join(cwd, config.fourthCoverImage)) + latexNumber(false)
    }
    let afterBodyFile = path.join(tempPath, 'afterBody.tex')
    fs.writeFileSync(afterBodyFile, latexAfterBody, 'utf8')
    args.push('--include-after-body', afterBodyFile)
  }

  // add metadata
  if (config.metadata) {
    let metadataFile = path.join(tempPath, 'metadata.yml')
    let yamlDoc = dump(config.metadata)
    fs.writeFileSync(metadataFile, yamlDoc, 'utf8')
    args.push('--metadata-file', metadataFile)
  }

  // from latex/markdown to epub/pdf
  let outputFormat = 'epub'
  if (config.format === 'pdf') {
    outputFormat = 'pdf'
  }
  args.push('-t', outputFormat)

  // output file
  let outputFile
  if (config.format === 'mobi') {
    outputFile = path.join(tempPath, 'temp.epub')
  } else {
    outputFile = path.join(cwd, `${config.filename}.${config.format}`)
  }
  args.push('-o', outputFile)

  // compile with pandoc
  await nodePandoc('', args, { cwd }, undefined, { debug: options.debug })

  if (config.format === 'epub' || config.format === 'mobi') {
    // Automatically edit epub: apply substitutions, append extra metadata
    if (config.textSubstitutions || config.navSubstitutions || config.opfSubstitutions || config.extraMetadata) {
      let editionTempPath = path.join(tempPath, 'edition')
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

  if (config.format === 'mobi') {
    // convert epub to mobi
    await epubToMobi(outputFile, path.join(cwd, `${config.filename}.mobi`), {
      kindlegenPath: options.kindlegenPath,
      debug: options.debug,
    })
  }
}

export async function rearchive(inputFolder, options) {
  // The epub has the same name as the folder we rearchive
  let outputFile = `${inputFolder}.epub`
  await archive(path.resolve(inputFolder), outputFile)
  success(`Created archive ${inputFolder}.epub`)

  if (options.mobi) {
    // convert epub to mobi
    await epubToMobi(path.resolve(outputFile), `${inputFolder}.mobi`, {
      kindlegenPath: options.kindlegenPath,
      debug: options.debug,
    })
    success(`Created archive ${inputFolder}.mobi`)
  }
}
