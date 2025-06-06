# Publishing Checklist for Mini Framework

## Pre-Publishing Setup

### 1. NPM Account Setup
- [ ] Create NPM account at [npmjs.com](https://npmjs.com)
- [ ] Verify email address
- [ ] Enable 2FA (recommended)
- [ ] Login locally: `npm login`

### 2. Package Configuration
- [x] Update package name in `package.json`:
  ```json
  "name": "@bernotieno/mini-framework"
  ```
- [x] Update repository URLs:
  ```json
  "repository": {
    "type": "git",
    "url": "git+https://github.com/bernotieno/mini-framework.git"
  },
  "bugs": {
    "url": "https://github.com/bernotieno/mini-framework/issues"
  },
  "homepage": "https://github.com/bernotieno/mini-framework#readme"
  ```
- [ ] Update author information
- [ ] Verify license is correct

### 3. Code Quality
- [ ] All imports/exports work correctly
- [ ] No Python dependencies remain
- [ ] TypeScript definitions are accurate
- [ ] README examples use correct import paths
- [ ] Examples work with the published package structure

## Publishing Process

### 1. Version Management
Choose appropriate version bump:
- [ ] **Patch** (1.0.0 → 1.0.1): Bug fixes
  ```bash
  npm version patch
  ```
- [ ] **Minor** (1.0.0 → 1.1.0): New features, backward compatible
  ```bash
  npm version minor
  ```
- [ ] **Major** (1.0.0 → 2.0.0): Breaking changes
  ```bash
  npm version major
  ```

### 2. Pre-publish Checks
- [ ] Run tests: `npm test`
- [ ] Check package contents: `npm pack --dry-run`
- [ ] Verify files included in package
- [ ] Test local installation: `npm install -g .`

### 3. Publish
- [ ] For scoped packages: `npm publish --access public`
- [ ] For unscoped packages: `npm publish`
- [ ] Verify on npmjs.com that package appears correctly

## Post-Publishing

### 1. Verification
- [ ] Install package in test project: `npm install @bernotieno/mini-framework`
- [ ] Test basic imports work
- [ ] Test examples from README
- [ ] Check TypeScript definitions work

### 2. Documentation
- [ ] Update README with correct installation instructions
- [ ] Add badges (version, downloads, etc.)
- [ ] Update any external documentation

### 3. Promotion
- [ ] Create GitHub release
- [ ] Update project description
- [ ] Share on social media/communities (optional)

## Maintenance

### Regular Updates
- [ ] Monitor for security vulnerabilities
- [ ] Keep dependencies updated (dev dependencies only)
- [ ] Respond to issues and PRs
- [ ] Consider semantic versioning for all changes

### Version History
Keep track of published versions:
- v1.0.0: Initial release
- v1.0.1: Bug fixes
- v1.1.0: New features
- etc.

## Troubleshooting

### Common Issues
1. **Package name already taken**: Choose a different name or use scoped package
2. **Permission denied**: Ensure you're logged in and have publish rights
3. **Version already exists**: Bump version number
4. **Files missing**: Check `.npmignore` and `files` field in package.json

### Useful Commands
```bash
# Check login status
npm whoami

# Check package info
npm info @bernotieno/mini-framework

# Unpublish (within 24 hours only)
npm unpublish @bernotieno/mini-framework@1.0.0

# Deprecate version
npm deprecate @bernotieno/mini-framework@1.0.0 "Please upgrade to 1.0.1"
```
