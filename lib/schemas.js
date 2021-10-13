const Joi = require('joi')

const schemaSubstitutions = Joi.array().items(
  Joi.object({
    regex: Joi.string().required(),
    replacement: Joi.string().required(),
  }),
)

const schemaCreator = Joi.array().items(
  Joi.object({
    role: Joi.string(),
    text: Joi.string(),
  }),
)

const schemaFormat = Joi.object({
  coverImage: Joi.string(),
  styleSheets: Joi.array().items(Joi.string()),
  files: Joi.array().items(Joi.string()),
  metadata: Joi.object({
    identifier: Joi.string(),
    title: Joi.alternatives().try(
      Joi.string(),
      Joi.object({
        type: Joi.string(),
        text: Joi.string(),
      }),
    ),
    subtitle: Joi.string(),
    author: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    creator: schemaCreator,
    contributor: schemaCreator,
    date: Joi.string().isoDate(),
    lang: Joi.string(),
    subject: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    description: Joi.string(),
    type: Joi.string(),
    format: Joi.string(),
    relation: Joi.string(),
    coverage: Joi.string(),
    rights: Joi.string(),
    'belongs-to-collection': Joi.string(),
    'group-position': Joi.number(),
    'page-progression-direction': Joi.valid('ltr', 'rtl'),
    ibooks: Joi.object({
      version: Joi.string(),
      'specified-fonts': Joi.boolean(),
      'ipad-orientation-lock': Joi.valid('portrait-only', 'landscape-only'),
      'iphone-orientation-lock': Joi.valid('portrait-only', 'landscape-only'),
      binding: Joi.boolean(),
      'scroll-axis': Joi.valid('vertical', 'horizontal', 'default'),
    }),
    publisher: Joi.string(),
  })
    .with('belongs-to-collection', 'group-position')
    .with('group-position', 'belongs-to-collection'),
  extraMetadata: Joi.object()
    .with('calibre:series', 'calibre:series_index')
    .with('calibre:series_index', 'calibre:series'),
})

const ebookObject = {
  ignoreDefaultStyleSheet: Joi.boolean(),
  textSubstitutions: schemaSubstitutions,
  navSubstitutions: schemaSubstitutions,
  opfSubstitutions: schemaSubstitutions,
}

const pdfObject = {
  fourthCoverImage: Joi.string(),
  latexPackages: Joi.array().items(Joi.string()),
}

const schemaDefaultFormat = schemaFormat.append(ebookObject).append(pdfObject).required()
const schemaEbookFormat = schemaFormat.append(ebookObject)
const schemaPDFFormat = schemaFormat.append(pdfObject)

module.exports.schemaReliure = Joi.object({
  filename: Joi.string().required(),
  default: schemaDefaultFormat,
  epub: schemaEbookFormat,
  mobi: schemaEbookFormat,
  pdf: schemaPDFFormat,
})