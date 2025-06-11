# Contributing to Pako Mermaid UI

Thank you for your interest in contributing to Pako Mermaid UI! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Docker (optional, for containerized development)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/pako-mermaid-ui.git
   cd pako-mermaid-ui
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/pkoptilin/pako-mermaid-ui.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to http://localhost:5173

## 🏗️ Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Follow the coding standards**
   - Use TypeScript for type safety
   - Follow existing code style
   - Add comments for complex logic
   - Write descriptive commit messages

2. **Test your changes**
   ```bash
   # Run linting
   npm run lint
   
   # Run type checking
   npx tsc --noEmit
   
   # Build the project
   npm run build
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add dark mode support
fix: resolve diagram export issue
docs: update API documentation
style: format code with prettier
refactor: simplify state management
test: add unit tests for components
chore: update dependencies
```

### Submitting a Pull Request

1. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Go to GitHub and click "New Pull Request"
   - Fill out the PR template
   - Link any related issues

3. **PR Requirements**
   - Clear description of changes
   - Screenshots for UI changes
   - Tests pass (CI will verify)
   - Code review approval

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Bug description** - Clear and concise
2. **Steps to reproduce** - Numbered steps
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - Browser, OS, version
6. **Screenshots** - If applicable

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

For feature requests, please include:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - Your suggested approach
3. **Alternatives considered** - Other solutions you've thought of
4. **Use cases** - How would this be used?

## 🎨 UI/UX Guidelines

### Design Principles

- **Simplicity** - Keep interfaces clean and intuitive
- **Consistency** - Follow existing design patterns
- **Accessibility** - Support keyboard navigation and screen readers
- **Responsiveness** - Work on desktop and tablet devices

### Component Guidelines

- Use existing components when possible
- Follow Tailwind CSS utility classes
- Maintain consistent spacing and colors
- Add proper TypeScript types
- Include accessibility attributes

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

### Writing Tests

- Add tests for new features
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Explain non-obvious code
- Update README for new features

### API Documentation

- Document new API endpoints
- Include request/response examples
- Update OpenAPI specs if applicable

## 🐳 Docker Development

### Development Container

```bash
# Build development image
docker build -f Dockerfile.dev -t pako-mermaid-ui:dev .

# Run development container
docker run -p 5173:5173 -v $(pwd):/app pako-mermaid-ui:dev
```

### Testing Docker Build

```bash
# Build production image
docker build -t pako-mermaid-ui:test .

# Test the image
docker run -p 3000:80 pako-mermaid-ui:test
```

## 🚀 Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. GitHub Actions will build and publish

## 📋 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] Screenshots included for UI changes
- [ ] No breaking changes (or properly documented)

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Accessibility enhancements
- Mobile responsiveness

### Medium Priority
- New diagram types support
- Additional export formats
- UI/UX improvements
- Documentation improvements

### Low Priority
- Advanced AI features
- Integration with other tools
- Theme customization
- Localization support

## 💬 Getting Help

If you need help:

1. **Check documentation** - README, Wiki, and code comments
2. **Search issues** - Someone might have asked already
3. **Create discussion** - For questions and ideas
4. **Join community** - Engage with other contributors

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Added to the contributors page

## 📞 Contact

- **GitHub Issues** - For bugs and features
- **GitHub Discussions** - For questions and ideas
- **Email** - For security issues: security@example.com

---

Thank you for contributing to Pako Mermaid UI! 🙏