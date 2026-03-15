const JavaScriptObfuscator = require('javascript-obfuscator')
const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '../out')

// Obfuscation options
const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false, // Set to true for production
  debugProtectionInterval: 0,
  disableConsoleOutput: true,
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
  stringArrayCallsTransformThreshold: 0.75,
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
}

// Files to obfuscate (exclude node_modules and large files)
const filesToObfuscate = [
  'main/index.js',
  'main/services/licenseService.js',
  'main/services/encryptionService.js',
  'main/services/integrityService.js',
  'main/services/antiDebugService.js',
  'preload/index.js'
]

function obfuscateFile(filePath) {
  const fullPath = path.join(outDir, filePath)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  try {
    const code = fs.readFileSync(fullPath, 'utf8')
    const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions)
    fs.writeFileSync(fullPath, obfuscated.getObfuscatedCode())
    console.log(`✓ Obfuscated: ${filePath}`)
  } catch (error) {
    console.error(`✗ Failed to obfuscate ${filePath}:`, error.message)
  }
}

console.log('🔒 Starting code obfuscation...\n')

filesToObfuscate.forEach(obfuscateFile)

console.log('\n✓ Obfuscation complete!')
