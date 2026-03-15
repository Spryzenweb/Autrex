# Build Exclusions

This document lists all files and folders that are excluded from the production build to minimize bundle size and prevent sensitive data leakage.

## Excluded Folders

### Development Files

- `src/` - Source code (compiled to `out/`)
- `.vscode/` - VS Code settings
- `.git/` - Git repository
- `.github/` - GitHub workflows
- `.kiro/` - Kiro IDE settings

### Website & API

- `website/**/*` - PHP website files (server-side only)
- `api/**/*` - API endpoints (deployed separately)

### Scripts & Tools

- `scripts/**/*` - Build and data fetching scripts
- `docs/**/*` - Documentation files
- `build/lollens-main/**/*` - Third-party source code

## Excluded Files

### Configuration Files

- `electron.vite.config.{js,ts,mjs,cjs}` - Vite config
- `tsconfig.json` - TypeScript config
- `tsconfig.node.json` - Node TypeScript config
- `tsconfig.web.json` - Web TypeScript config
- `postcss.config.js` - PostCSS config
- `tailwind.config.ts` - Tailwind config
- `vite.config.ts` - Vite config
- `components.json` - Component config
- `eslint.config.mjs` - ESLint config
- `.prettierrc.yaml` - Prettier config
- `.prettierignore` - Prettier ignore
- `dev-app-update.yml` - Dev update config

### Package Management

- `.npmrc` - NPM config
- `pnpm-lock.yaml` - PNPM lock file
- `pnpm-workspace.yaml` - PNPM workspace config

### Environment & Secrets

- `.env` - Environment variables
- `.env.*` - Environment variable variants

### Git & Version Control

- `.gitignore` - Git ignore rules
- `.editorconfig` - Editor config
- `.vercelignore` - Vercel ignore

### Documentation & Metadata

- `CHANGELOG.md` - Changelog
- `README.md` - Readme
- `*.md` - All markdown files
- `*.txt` - Text files
- `*.log` - Log files

### Misc Files

- `.DS_Store` - macOS metadata
- `.eslintcache` - ESLint cache
- `run_trial_migration.sh` - Migration script
- `lcu-openapi.json` - OpenAPI spec
- `auimg.png` - Unused image
- `logo.png` - Unused logo

## Included in Build

### Required Files

✅ `out/**/*` - Compiled application code  
✅ `node_modules/**/*` - Production dependencies  
✅ `package.json` - Package metadata  
✅ `resources/**/*` - Application resources (unpacked)  
✅ `build/icon.ico` - Windows icon  
✅ `build/icon.icns` - macOS icon  
✅ `build/icon.png` - Linux icon  
✅ `build/installerSidebar.png` - Installer image

## Why Exclude These Files?

### Security

- **Website folder**: Contains PHP code with database credentials
- **API folder**: Contains server-side API keys
- **`.env` files**: Environment variables and secrets
- **Scripts**: May contain sensitive build logic

### Size Optimization

- **Source code**: Already compiled to `out/`
- **Documentation**: Not needed at runtime
- **Config files**: Only used during development
- **Git files**: Version control not needed in production

### Intellectual Property

- **Source code**: Prevent easy access to uncompiled code
- **Build scripts**: Protect build process
- **Third-party code**: Avoid licensing issues

## Verification

To verify what's included in your build:

### Windows

```bash
# Extract ASAR (for testing only)
npx asar extract "C:\Program Files\Autrex\resources\app.asar" extracted
dir extracted
```

### macOS/Linux

```bash
# Extract ASAR (for testing only)
npx asar extract "/Applications/Autrex.app/Contents/Resources/app.asar" extracted
ls -la extracted
```

## Expected Build Size

- **ASAR file**: ~50-100 MB (compressed)
- **Total installer**: ~150-250 MB (includes Electron runtime)
- **Installed size**: ~200-300 MB

## Troubleshooting

### "Module not found" errors

- Check if the module is in `dependencies` (not `devDependencies`)
- Verify the module is not excluded in `electron-builder.yml`

### Large build size

- Check for accidentally included folders
- Review `node_modules` for unnecessary packages
- Use `npm prune --production` before building

### Missing resources

- Ensure resources are in `resources/` folder
- Check `asarUnpack` configuration
- Verify file paths are correct

## Best Practices

1. **Never include sensitive data**
   - Use environment variables
   - Keep secrets server-side
   - Encrypt sensitive config

2. **Minimize bundle size**
   - Remove unused dependencies
   - Exclude development files
   - Compress assets

3. **Test builds regularly**
   - Extract and inspect ASAR
   - Check for sensitive files
   - Verify functionality

4. **Document exclusions**
   - Update this file when adding exclusions
   - Explain why files are excluded
   - Review periodically

## Related Files

- `electron-builder.yml` - Build configuration
- `.gitignore` - Git exclusions
- `package.json` - Dependencies
- `docs/SECURITY.md` - Security measures
