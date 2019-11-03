/**
 * This script runs automatically after your first npm-install.
 */
import * as path from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { execSync, fork, ChildProcess } from 'child_process'

import { mv, rm, exec, which } from 'shelljs'
import * as colors from 'colors'
import isScoped = require('is-scoped')

import getPackageName from './get-package-name'

const replace = require('replace-in-file')

function promiseFromChildProcess(child: ChildProcess) {
  return new Promise(function(resolve, reject) {
    child.addListener('error', reject)
    child.addListener('exit', resolve)
  })
}

// Note: These should all be relative to the project root directory
const rmDirs: string[] = []
const rmFiles = [
  '.is-new-repo',
  '.all-contributorsrc',
  '.gitattributes',
  'tools/initializer',
  'tools/preinstall.js'
]
const modifyFiles = [
  'LICENSE',
  'package.json',
  'README.md',
  'test/library.test.ts',
  'tools/gh-pages-publish.ts'
]
const renameFiles = [
  ['src/library.ts', 'src/--librarynamewithoutscope--.ts'],
  ['test/library.test.ts', 'test/--librarynamewithoutscope--.test.ts']
]

const workspaceDir = path.resolve(__dirname, '..', '..')
const isNewRepo = existsSync(path.join(workspaceDir, '.is-new-repo'))

const run = async () => {
  if (!which('git')) {
    console.log(colors.red('Sorry, this script requires git'))
    removeItems()
    process.exit(1)
  }

  if (!isNewRepo) {
    process.exit(0)
  }

  // Recreate Git folder
  const stdout = execSync('git init', { cwd: workspaceDir })
  console.log(colors.green(stdout.toString().replace(/(\n|\r)+/g, '')))

  // Clear console
  process.stdout.write('\x1B[2J\x1B[0f')

  // Say hi!
  console.log(colors.cyan("Hi! You're almost ready to make the next great TypeScript library."))

  try {
    const libraryName = await getPackageName()
    let libraryNameWithoutScope = libraryName
    let scopeName = ''
    if (isScoped(libraryName)) {
      ;[scopeName, libraryNameWithoutScope] = libraryNameWithoutScope.split('/')
    }

    console.log(
      colors.cyan('\nThanks for the info. The last few changes are being made... hang tight!\n\n')
    )

    // Get the Git username and email before the .git directory is removed
    const username = exec('git config user.name', { silent: true }).stdout.trim()
    const usermail = exec('git config user.email', { silent: true }).stdout.trim()

    modifyContents(
      [
        /--libraryname--/g,
        /--scopeName--/g,
        /--librarynamewithoutscope--/g,
        /--username--/g,
        /--usermail--/g
      ],
      [libraryName, scopeName, libraryNameWithoutScope, username, usermail]
    )
    renameItems(libraryNameWithoutScope)

    // Initialize Husky
    process.env.HUSKY_SKIP_INSTALL = '0'

    await promiseFromChildProcess(
      fork(
        path.resolve(__dirname, '..', '..', 'node_modules', 'husky', 'lib', 'installer', 'bin.js'),
        ['install'],
        {
          silent: false
        }
      )
    )
    console.log(colors.green('Git hooks set up'))

    finalize()
    removeItems()

    console.log(colors.cyan("OK, you're all set. Happy coding!! ;)\n"))
  } catch (err) {
    if (err) {
      throw err
    }
  }
}

/**
 * Removes items from the project that aren't needed after the initial setup
 */
function removeItems() {
  console.log(colors.underline.white('Removed'))

  // The directories and files are combined here, to simplify the function,
  // as the 'rm' command checks the item type before attempting to remove it
  let rmItems = rmDirs.concat(rmFiles)
  rm('-rf', rmItems.map(f => path.resolve(workspaceDir, f)))
  console.log(colors.red(rmItems.join('\n')))

  console.log('\n')
}

/**
 * Updates the contents of the template files with the library name or user details
 *
 * @param libraryName
 * @param username
 * @param usermail
 */
function modifyContents(from: RegExp[], to: string[]) {
  console.log(colors.underline.white('Modified'))

  let files = modifyFiles.map(f => path.resolve(workspaceDir, f))
  try {
    replace.sync({
      files,
      from,
      to
    })
    console.log(colors.yellow(modifyFiles.join('\n')))
  } catch (error) {
    console.error('An error occurred modifying the file: ', error)
  }

  console.log('\n')
}

/**
 * Renames any template files to the new library name
 *
 * @param libraryNameWithoutScope
 */
function renameItems(libraryNameWithoutScope: string) {
  console.log(colors.underline.white('Renamed'))

  renameFiles.forEach(function(files) {
    // Files[0] is the current filename
    // Files[1] is the new name
    let newFilename = files[1].replace(/--librarynamewithoutscope--/g, libraryNameWithoutScope)
    console.log(
      'rename',
      path.resolve(workspaceDir, files[0]),
      path.resolve(workspaceDir, newFilename)
    )
    mv(path.resolve(workspaceDir, files[0]), path.resolve(workspaceDir, newFilename))
    console.log(colors.cyan(files[0] + ' => ' + newFilename))
  })

  console.log('\n')
}

/**
 * Calls any external programs to finish setting up the library
 */
function finalize() {
  console.log(colors.underline.white('Finalizing'))

  // Remove pre && post-install command
  let jsonPackage = path.resolve(__dirname, '..', '..', 'package.json')
  const pkg = JSON.parse(readFileSync(jsonPackage) as any)

  // Note: Add items to remove from the package file here
  delete pkg.scripts.preinstall
  delete pkg.scripts.postinstall

  writeFileSync(jsonPackage, JSON.stringify(pkg, null, 2))
  console.log(colors.green('Preinstall and postinstall script have been removed'))

  console.log('\n')
}

run().then()
