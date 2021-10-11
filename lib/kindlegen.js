const cliProgress = require('cli-progress')
const fs = require('fs')
const inquirer = require('inquirer')
const os = require('os')
const path = require('path')
const fetch = require('node-fetch')
const { spawn } = require('child_process')
const tar = require('tar')
const unzipper = require('unzipper')

const kindlegenFilename = () => (process.platform === 'win32' ? 'kindlegen.exe' : 'kindlegen')
const kindlegenPath = () => path.resolve(process.cwd(), kindlegenFilename())

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

const extractKindleGen = async (file) => {
  let stream = fs.createReadStream(file.path)
  let filename = kindlegenFilename()
  if (file.path.endsWith('.zip')) {
    const zip = stream.pipe(unzipper.Parse({ forceStream: true }))
    for await (const entry of zip) {
      if (entry.path === filename) {
        entry.pipe(fs.createWriteStream(filename))
      } else {
        entry.autodrain()
      }
    }
  } else if (file.path.endsWith('.tar.gz')) {
    stream.pipe(
      tar.x({
        filter(path) {
          return path === filename
        },
      }),
    )
  }
  if (process.platform === 'darwin' || process.platform === 'linux') {
    fs.chmodSync('kindlegen', 0o755)
  }
}

module.exports.epubToMobi = (input, output) => {
  return new Promise((resolve, reject) => {
    let kindlegen = spawn(kindlegenPath(), ['-c2', '-dont_append_source', input])
    kindlegen.on('close', async (code) => {
      if (code !== 0 && code !== 1) {
        reject(`KindleGen returned error ${code}`)
      }
      await fs.copyFileSync(input.replace('.epub', '.mobi'), output)
      resolve()
    })
  })
}

module.exports.installKindlegen = async (forceInstall = false) => {
  if (!fs.existsSync(kindlegenPath())) {
    let binUrl
    if (process.platform === 'darwin' && process.arch === 'x32') {
      binUrl = 'https://archive.org/download/kindlegen-mac-i386-v2-9/KindleGen_Mac_i386_v2_9.zip'
    } else if (process.platform === 'linux') {
      binUrl = 'https://archive.org/download/kindlegen_linux_2_6_i386_v2_9/kindlegen_linux_2.6_i386_v2_9.tar.gz'
    } else if (process.platform === 'win32') {
      binUrl = 'https://archive.org/download/kindlegen_win32_v2_9/kindlegen_win32_v2_9.zip'
    } else {
      throw new Error('Unsupported platform.')
    }
    console.log(`KindleGen is a tool to convert files to the Kindle format (Mobi) enabling publishers to create great-looking books that work on all Kindle devices and apps.
KindleGen is officially supported by Amazon.
To install KindleGen, you must accept the following terms of use: https://www.amazon.com/gp/feature.html?docId=1000599251`)
    let install = forceInstall
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
      console.log('* Download KindleGen')
      let file = await downloadKindleGen(binUrl)
      console.log('* Extract KindleGen in the current directory')
      await extractKindleGen(file)
    }
    console.log()
    return install
  }
  return true
}
