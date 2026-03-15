import JavaScriptObfuscator from 'javascript-obfuscator'

/**
 * Vite plugin for code obfuscation in production builds
 * Only obfuscates license-related code for security
 */
export function obfuscatorPlugin() {
  return {
    name: 'obfuscator',
    apply: 'build', // Only in production builds
    enforce: 'post',

    generateBundle(options, bundle) {
      // Only obfuscate in production
      if (process.env.NODE_ENV !== 'production') {
        return
      }

      for (const fileName in bundle) {
        const file = bundle[fileName]

        // Only obfuscate JS files
        if (file.type === 'chunk' && fileName.endsWith('.js')) {
          // High obfuscation for license-related files
          const isLicenseFile =
            fileName.includes('license') ||
            fileName.includes('encryption') ||
            fileName.includes('main')

          if (isLicenseFile) {
            console.log(`[Obfuscator] Protecting: ${fileName}`)

            const obfuscationResult = JavaScriptObfuscator.obfuscate(file.code, {
              compact: true,
              controlFlowFlattening: true,
              controlFlowFlatteningThreshold: 0.75,
              deadCodeInjection: true,
              deadCodeInjectionThreshold: 0.4,
              debugProtection: false, // Can cause issues
              debugProtectionInterval: 0,
              disableConsoleOutput: false,
              identifierNamesGenerator: 'hexadecimal',
              log: false,
              numbersToExpressions: true,
              renameGlobals: false,
              selfDefending: true,
              simplify: true,
              splitStrings: true,
              splitStringsChunkLength: 10,
              stringArray: true,
              stringArrayCallsTransform: true,
              stringArrayEncoding: ['base64'],
              stringArrayIndexShift: true,
              stringArrayRotate: true,
              stringArrayShuffle: true,
              stringArrayWrappersCount: 2,
              stringArrayWrappersChainedCalls: true,
              stringArrayWrappersParametersMaxCount: 4,
              stringArrayWrappersType: 'function',
              stringArrayThreshold: 0.75,
              transformObjectKeys: true,
              unicodeEscapeSequence: false
            })

            file.code = obfuscationResult.getObfuscatedCode()
          }
        }
      }
    }
  }
}
