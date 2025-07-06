export function generateFontFilename(fonts = {}, type = 'main', shape = 'upright') {
  let filename = ((fonts[type].shapes || [])[shape] || '*').replace('*', fonts[type].baseFilename)
  let extension = fonts[type].extension
  return `${filename}${extension}`
}
