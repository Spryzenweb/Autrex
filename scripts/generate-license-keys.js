const crypto = require('crypto')

const LicenseType = {
  REGULAR: 'AUTR',
  DAILY: 'AUTD',
  WEEKLY: 'AUTW',
  MONTHLY: 'AUTM',
  TRIAL: 'AUTT'
}

function generateLicenseKey(type = LicenseType.REGULAR) {
  const productCode = type
  const uniqueId = generateUniqueId(8)
  const checksum = calculateChecksum(productCode + uniqueId)

  return formatLicenseKey(productCode, uniqueId, checksum)
}

function generateUniqueId(length) {
  // Base32 karakterler (0-9, A-Z, I, O, 1, 0 hariç - karışıklığı önlemek için)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length)
    result += chars[randomIndex]
  }

  return result
}

function calculateChecksum(data) {
  const hash = crypto.createHash('md5').update(data).digest('hex')
  return hash.substring(0, 4).toUpperCase()
}

function formatLicenseKey(productCode, uniqueId, checksum) {
  const part1 = productCode
  const part2 = uniqueId.substring(0, 4)
  const part3 = uniqueId.substring(4, 8)
  const part4 = checksum

  return `${part1}-${part2}-${part3}-${part4}`
}

// Toplu anahtar üretimi
function generateBatch(count, type) {
  const keys = []
  const uniqueKeys = new Set()

  while (uniqueKeys.size < count) {
    const key = generateLicenseKey(type)
    uniqueKeys.add(key)
  }

  return Array.from(uniqueKeys)
}

// CLI kullanımı
const args = process.argv.slice(2)
const count = parseInt(args[0] || '10')
const typeArg = args[1]?.toUpperCase() || 'REGULAR'

const licenseTypeMap = {
  REGULAR: LicenseType.REGULAR,
  DAILY: LicenseType.DAILY,
  WEEKLY: LicenseType.WEEKLY,
  MONTHLY: LicenseType.MONTHLY,
  TRIAL: LicenseType.TRIAL
}

const type = licenseTypeMap[typeArg] || LicenseType.REGULAR
const keys = generateBatch(count, type)

console.log(`\n🔑 Generated ${keys.length} ${typeArg} license keys:\n`)
console.log('─'.repeat(50))

keys.forEach((key, index) => {
  console.log(`${(index + 1).toString().padStart(3, ' ')}. ${key}`)
})

console.log('─'.repeat(50))
console.log(`\n✅ Total: ${keys.length} keys\n`)

// Kullanım bilgisi
if (args.length === 0) {
  console.log('💡 Usage:')
  console.log('  npm run generate-keys <count> <type>')
  console.log('\nExamples:')
  console.log('  npm run generate-keys 10 REGULAR   # 10 ömür boyu lisans')
  console.log('  npm run generate-keys 50 WEEKLY    # 50 haftalık lisans')
  console.log('  npm run generate-keys 100 TRIAL    # 100 deneme lisansı')
  console.log('\nLicense Types:')
  console.log('  REGULAR - Ömür boyu')
  console.log('  MONTHLY - Aylık (30 gün)')
  console.log('  WEEKLY  - Haftalık (7 gün)')
  console.log('  DAILY   - Günlük (24 saat)')
  console.log('  TRIAL   - Deneme (6 saat)\n')
}
