# Security Measures

This document outlines the security measures implemented in Autrex to protect against reverse engineering and tampering.

## Implemented Security Features

### 1. ASAR Integrity Protection

**Location**: `electron-builder.yml`

```yaml
asar: true
asarIntegrity: true
```

- Enables ASAR packaging with integrity checks
- Electron validates ASAR file hasn't been modified
- Prevents simple unpacking and repacking

### 2. Code Obfuscation

**Location**: `scripts/obfuscate-build.js`

Obfuscates critical JavaScript files:

- `main/index.js` - Main process entry point
- `main/services/licenseService.js` - License validation logic
- `main/services/encryptionService.js` - Encryption utilities
- `preload/index.js` - Preload script

**Obfuscation Features**:

- Control flow flattening
- Dead code injection
- String array encoding (base64)
- Identifier name mangling (hexadecimal)
- Self-defending code
- String splitting and rotation

### 3. Runtime Integrity Checks

**Location**: `src/main/services/integrityService.ts`

Performs multiple integrity checks at runtime:

1. **ASAR Tampering Detection**
   - Checks if `app.asar.unpacked` exists
   - Validates ASAR file size
   - Detects unpacked app directories

2. **Installation Path Validation**
   - Ensures app runs from proper installation directory
   - Detects execution from temp/downloads folders

3. **Startup Validation**
   - Runs all checks before app initialization
   - Terminates app if tampering detected
   - Shows security warning to user

### 4. Additional Protections

- **Context Isolation**: Enabled in BrowserWindow
- **Node Integration**: Disabled in renderer
- **Sandbox**: Enabled for renderer processes
- **Remote Module**: Disabled
- **Web Security**: Enabled

## Build Process

### Development Build

```bash
npm run dev
```

- No obfuscation
- No integrity checks
- Fast iteration

### Production Build

```bash
npm run build:all
```

Build process:

1. TypeScript compilation
2. Vite bundling
3. Code obfuscation (critical files)
4. ASAR packaging with integrity
5. Platform-specific installers

## Limitations

### What This Protects Against

✅ Casual reverse engineering  
✅ Simple ASAR unpacking  
✅ Basic code modification  
✅ Running from suspicious locations  
✅ Tampered installations

### What This Does NOT Protect Against

❌ Determined attackers with debugging tools  
❌ Memory inspection at runtime  
❌ Native code analysis  
❌ Electron framework vulnerabilities  
❌ Network traffic interception

## Best Practices

### For Developers

1. **Never commit sensitive data**
   - API keys should be server-side only
   - Use environment variables
   - Keep secrets out of client code

2. **Minimize client-side logic**
   - Move critical validation to server
   - Use server-side license checks
   - Implement rate limiting

3. **Regular updates**
   - Keep Electron updated
   - Update dependencies
   - Patch security vulnerabilities

### For Users

1. **Download from official sources only**
   - Official website
   - Verified GitHub releases
   - Authorized distributors

2. **Verify installer integrity**
   - Check file hashes
   - Verify digital signatures
   - Report suspicious files

3. **Keep app updated**
   - Enable auto-updates
   - Install security patches
   - Report security issues

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@autrex.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Additional Hardening (Optional)

For even stronger protection, consider:

1. **Native Code Modules**
   - Implement critical logic in C++
   - Use Node.js native addons
   - Harder to reverse engineer

2. **Server-Side Validation**
   - Move license checks to server
   - Implement API authentication
   - Use token-based validation

3. **Code Signing**
   - Sign installers with valid certificate
   - Enable Windows SmartScreen
   - macOS Gatekeeper approval

4. **Anti-Debug Techniques**
   - Detect debugger attachment
   - Check for common debugging tools
   - Implement timing checks

5. **Encrypted Resources**
   - Encrypt sensitive assets
   - Decrypt at runtime
   - Use custom encryption keys

## Maintenance

### Regular Security Audits

- Review obfuscation effectiveness
- Test integrity checks
- Update security measures
- Monitor for bypass attempts

### Update Schedule

- **Critical**: Immediate patch
- **High**: Within 1 week
- **Medium**: Within 1 month
- **Low**: Next release

## Conclusion

While no client-side application can be 100% secure, these measures significantly raise the bar for attackers and protect against casual reverse engineering attempts.

Remember: **Security is a process, not a product.**
