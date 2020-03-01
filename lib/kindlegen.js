const cliProgress = require("cli-progress")
const fs = require("fs")
const inquirer = require("inquirer")
const os = require("os")
const path = require("path")
const request = require("request")
const { spawn } = require("child_process")
const tar = require("tar")
const unzipper = require("unzipper")

const { log } = console

const kindlegenFilename = () =>
  process.platform === "win32" ? "kindlegen.exe" : "kindlegen"
const kindlegenPath = () => path.resolve(process.cwd(), kindlegenFilename())

const download = fileUrl => {
  let filename = path.basename(new URL(fileUrl).pathname)
  const progressBar = new cliProgress.SingleBar(
    {
      format: "{bar} {percentage}% | ETA: {eta}s"
    },
    cliProgress.Presets.shades_classic
  )
  let tempPath = fs.mkdtempSync(path.join(os.tmpdir(), "download-"))
  const file = fs.createWriteStream(path.join(tempPath, "kindlegen.zip"))
  let receivedBytes = 0

  return new Promise((resolve, reject) => {
    request
      .get(fileUrl)
      .on("response", response => {
        if (response.statusCode !== 200) {
          reject("Response status was " + response.statusCode)
        }

        const totalBytes = response.headers["content-length"]
        progressBar.start(totalBytes, 0)
      })
      .on("data", chunk => {
        receivedBytes += chunk.length
        progressBar.update(receivedBytes)
      })
      .pipe(file)
      .on("error", err => {
        fs.unlink(filename)
        progressBar.stop()
        reject(err.message)
      })

    file.on("finish", () => {
      progressBar.stop()
      file.close()
      resolve(file)
    })

    file.on("error", err => {
      fs.unlink(filename)
      progressBar.stop()
      reject(err.message)
    })
  })
}

module.exports.epubToMobi = function(input, output) {
  return new Promise((resolve, reject) => {
    let kindlegen = spawn(kindlegenPath(), [
      input,
      "-c2",
      "-dont_append_source",
      "-o",
      output
    ])
    kindlegen.on("close", code => {
      if (code !== 0 && code !== 1) {
        reject("kindlegen returned error " + code)
      }
      resolve()
    })
  })
}

module.exports.installKindlegen = async (forceInstall = false) => {
  if (!fs.existsSync(kindlegenPath())) {
    let binUrl
    if (process.platform === "darwin" && process.arch === "x32") {
      binUrl = "https://kindlegen.s3.amazonaws.com/KindleGen_Mac_i386_v2_9.zip"
    } else if (process.platform === "linux") {
      binUrl =
        "https://kindlegen.s3.amazonaws.com/kindlegen_linux_2.6_i386_v2_9.tar.gz"
    } else if (process.platform === "win32") {
      binUrl = "https://kindlegen.s3.amazonaws.com/kindlegen_win32_v2_9.zip"
    } else {
      throw new Error("Unsupported platform")
    }
    log(
      "KindleGen is a tool to convert files to the Kindle format (Mobi) enabling publishers to create great-looking books that work on all Kindle devices and apps."
    )
    log("KindleGen is officially supported by Amazon.")
    log(
      "To install KindleGen, you must accept the following terms of use: https://www.amazon.com/gp/feature.html?docId=1000599251"
    )
    let install = forceInstall
    if (!install) {
      let { startInstall } = await inquirer.prompt([
        {
          type: "confirm",
          name: "startInstall",
          message: "Do you agree to terms of use?"
        }
      ])
      install = startInstall
    }
    if (install) {
      log("* Download KindleGen")
      let file = await download(binUrl)
      log("* Extract KindleGen in the current directory")
      let stream = fs.createReadStream(file.path)
      let filename = kindlegenFilename()
      if (binUrl.endsWith(".zip")) {
        const zip = stream.pipe(unzipper.Parse({ forceStream: true }))
        for await (const entry of zip) {
          if (entry.path === filename) {
            entry.pipe(fs.createWriteStream(filename))
          } else {
            entry.autodrain()
          }
        }
      } else if (binUrl.endsWith(".tar.gz")) {
        stream.pipe(
          tar.x({
            filter(path) {
              return path === filename
            }
          })
        )
      }
      if (process.platform === "darwin" || process.platform === "linux") {
        fs.chmodSync("kindlegen", 0o755)
      }
    }
    log()
    return install
  }
  return true
}
