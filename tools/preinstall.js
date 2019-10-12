#!/usr/bin/env node
var path = require('path')
var fs = require('fs')
var execSync = require('child_process').execSync

var workspaceDir = path.resolve(__dirname, '..')
var gitDir = path.join(workspaceDir, '.git')
var repoName = path.basename(workspaceDir)

function green(text) {
  return '\033[32m' + text + '\033[0m'
}

function output(stdout) {
  console.log(green(stdout.toString().replace(/(\n|\r)+/g, '')))
}

if ('typescript-starter' === repoName) {
  console.log(green('We are in the original repo.'))
  process.exit(0)
}

fs.writeFileSync(path.join(workspaceDir, '.is-new-repo'), Buffer.alloc(0))

// delete .git folder
if (fs.existsSync(gitDir)) {
  var stdout = execSync('rm -rf .git', { cwd: workspaceDir })
  output(stdout)
}
