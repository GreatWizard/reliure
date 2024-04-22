const cliProgress = require('cli-progress')
const fs = require('fs')
const inquirer = require('inquirer')
const os = require('os')
const path = require('path')
const fetch = require('node-fetch')
const { spawn } = require('child_process')
const tar = require('tar')
const unzipper = require('unzipper')

const { log, warn } = require('./message')
const { humanizePlatformArch } = require('./utils')

const kindlegenFilename = () => (process.platform === 'win32' ? 'kindlegen.exe' : 'kindlegen')
const localKindlegenPath = () => path.resolve(process.cwd(), kindlegenFilename())

const downloadKindleGen = (fileUrl) => {
  let filename = path.basename(new URL(fileUrl).pathname)
  const progressBar = new cliProgress.SingleBar(
    {
      format: '{bar} {percentage}% | ETA: {eta}s',
    },
    cliProgress.Presets.shades_classic,
  )
  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), 'download-'))
  const file = fs.createWriteStream(path.join(tempPath, filename))
  let receivedBytes = 0

  return new Promise((resolve, reject) => {
    fetch(fileUrl).then((response) => {
      if (response.status !== 200) {
        reject(`Response status was ${response.statusCode}`)
      }
      const totalBytes = response.headers.get('content-length')
      progressBar.start(totalBytes, 0)
      response.body
        .on('data', (chunk) => {
          receivedBytes += chunk.length
          progressBar.update(receivedBytes)
        })
        .pipe(file)
        .on('error', (err) => {
          fs.unlink(filename)
          progressBar.stop()
          reject(err.message)
        })

      file.on('finish', () => {
        progressBar.stop()
        file.close()
        resolve(file)
      })

      file.on('error', (err) => {
        fs.unlink(filename)
        progressBar.stop()
        reject(err.message)
      })
    })
  })
}

const extractKindleGen = (file) => {
  let filename = kindlegenFilename()
  if (file.path.endsWith('.zip')) {
    return fs
      .createReadStream(file.path)
      .pipe(unzipper.Parse())
      .on('entry', function (entry) {
        if (entry.path === filename) {
          entry.pipe(fs.createWriteStream(filename))
        } else {
          entry.autodrain()
        }
      })
      .promise()
  }
  if (file.path.endsWith('.tar.gz')) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(
          tar.x({
            filter(path) {
              return path === filename
            },
          }),
        )
        .on('finish', () => resolve())
        .on('error', (err) => reject(err.message))
    })
  }
  throw new Error('Unsupported file format')
}

module.exports.epubToMobi = (input, output, options = {}) => {
  let kindlegenPath = options.kindlegenPath || localKindlegenPath()
  return new Promise((resolve, reject) => {
    let opts = ['-c2', '-dont_append_source']
    if (options.debug) {
      opts.push('-verbose')
    }
    opts.push(input)
    let kindlegen = spawn(kindlegenPath, opts)
    kindlegen.on('close', async (code) => {
      if (code !== 0 && code !== 1) {
        reject(`KindleGen returned error ${code}`)
      }
      await fs.copyFileSync(input.replace('.epub', '.mobi'), output)
      resolve()
    })
  })
}

module.exports.detectOrInstallKindlegen = async (options = {}) => {
  let { kindlegenPath } = options
  let binUrl = undefined
  if (process.platform === 'darwin' && process.arch === 'x32') {
    binUrl = 'https://archive.org/download/kindlegen-mac-i386-v2-9/KindleGen_Mac_i386_v2_9.zip'
  } else if (process.platform === 'linux') {
    binUrl = 'https://archive.org/download/kindlegen_linux_2_6_i386_v2_9/kindlegen_linux_2.6_i386_v2_9.tar.gz'
  } else if (process.platform === 'win32') {
    binUrl = 'https://archive.org/download/kindlegen_win32_v2_9/kindlegen_win32_v2_9.zip'
  }
  if (kindlegenPath) {
    if (!fs.existsSync(kindlegenPath)) {
      throw new Error(`KindleGen seems not installed at the location "${kindlegenPath}"`)
    }
  } else {
    kindlegenPath = localKindlegenPath()
    if (!fs.existsSync(kindlegenPath)) {
      if (!binUrl) {
        throw new Error(
          `Building ebook in mobi format is not compatible with your platform ${humanizePlatformArch(
            process.platform,
            process.arch,
          )}.`,
        )
      }
      log(`KindleGen is a tool to convert files to the Kindle format (Mobi) enabling publishers to create great-looking books that work on all Kindle devices and apps.
KindleGen is officially supported by Amazon.
To install KindleGen, you must accept the following terms of use: https://www.amazon.com/gp/feature.html?docId=1000599251`)
      let install = options.mobi
      if (!install) {
        let { startInstall } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'startInstall',
            message: 'Do you agree to terms of use?',
          },
        ])
        install = startInstall
      }
      if (install) {
        log('* Download KindleGen')
        let file = await downloadKindleGen(binUrl)
        log('* Extract KindleGen in the current directory')
        await extractKindleGen(file)
        if (process.platform === 'darwin' || process.platform === 'linux') {
          fs.chmodSync(kindlegenPath, 0o755)
        }
      }
      log()
      return install ? kindlegenPath : undefined
    }
  }
  if (!binUrl) {
    warn(
      `Building ebook in mobi format may produce errors. KindleGen has been detected but it looks like it's not compatible with your platform ${humanizePlatformArch(
        process.platform,
        process.arch,
      )}.`,
    )
  }
  return kindlegenPath
}
