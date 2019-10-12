/// <reference path="./types/enquirer/index.d.ts" />
import { StringPrompt } from 'enquirer'
import * as colors from 'colors'
import validatePackageName = require('validate-npm-package-name')
import npmName = require('npm-name')
const configuredRegistryUrl = require('registry-url')()

interface ScopedNamePromptOptions extends Enquirer.BasePromptOptions {
  registryUrl?: string
  checkRegistry?: boolean
}

export class ScopedNamePrompt extends StringPrompt {
  footerMessage: string = ''
  registryUrl: string
  checkRegistry: boolean

  constructor(options: ScopedNamePromptOptions) {
    super(options)
    this.registryUrl = options.registryUrl || configuredRegistryUrl
    this.checkRegistry = !!options.checkRegistry
  }

  async footer() {
    return (
      colors.gray(this.footerMessage) ||
      (this.checkRegistry ? colors.gray(`current registry: ${colors.bold(this.registryUrl)}`) : '')
    )
  }

  async validate(value: string) {
    const r = validatePackageName(value)
    if (!r.validForNewPackages) {
      return r.errors[0]
    }
    if (this.checkRegistry) {
      this.footerMessage = `verifying that the package name(${colors.bold(value)}) is valid...`
      await this.render()
      const available = await npmName(value)
      this.footerMessage = ''
      if (!available) {
        return `package name("${colors.bold(value)}") has been taken already`
      }
    }
    return true
  }

  result(value: string) {
    return value
  }
}
