declare module 'validate-npm-package-name' {
  namespace PackageName {
    interface Result {
      validForNewPackages: boolean
      validForOldPackages: boolean
      errors: string[]
    }
  }
  function validate(name: string): PackageName.Result
  export = validate
}
