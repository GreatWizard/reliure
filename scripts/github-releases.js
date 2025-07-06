import downloadReleases from 'download-github-release'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const releases = packageJson.githubReleases || {}
const outputDir = 'github_releases'

Object.keys(releases).forEach((project) => {
  let [user, repo] = project.split('/')
  let version = releases[project]
  let dir = path.join(process.cwd(), outputDir, user, repo)
  let alreadyInstalledVersion = undefined
  try {
    alreadyInstalledVersion = fs.readFileSync(path.join(dir, '.github-release-version'), 'utf8')
  } catch (err) {
    // This is fine.
  }
  if (version !== alreadyInstalledVersion) {
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true })
    }
    fs.mkdirSync(dir, { recursive: true })

    downloadReleases(user, repo, dir, (release) => {
      return release.tag_name === version
    })
      .then(function () {
        fs.writeFileSync(path.join(dir, '.github-release-version'), version, 'utf8')
        console.log('✨  Github releases download done.')
      })
      .catch(function (err) {
        console.error(err.message)
      })
  }
})
