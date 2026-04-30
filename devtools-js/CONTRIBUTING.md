# Contributing to devtools-js

🎉 Thanks for your interest in contributing to devtools-js! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project follows a simple code of conduct: **Be respectful and considerate**. We welcome contributions from everyone regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

## 🚀 How Can I Contribute?

### Reporting Bugs

- **Search existing issues** before creating a new one
- **Provide clear steps** to reproduce the issue
- **Include version information** (Node.js, devtools-js, OS)
- **Add code samples** if applicable

### Suggesting Enhancements

- **Check if it's already planned** in existing issues
- **Explain the use case** clearly
- **Provide code examples** of how it would work
- **Consider backward compatibility**

### Pull Requests

We welcome pull requests for:
- Bug fixes
- New utility functions
- Performance improvements
- Documentation improvements
- Test coverage improvements

## 💻 Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/devtools-js.git
cd devtools-js

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (watches for changes)
npm run dev
```

## 📝 Pull Request Guidelines

1. **Fork the repository** and create your branch from `main`
2. **Use descriptive branch names**: `feat/add-feature`, `fix/bug-name`, `docs/update-readme`
3. **Keep PRs focused** on a single feature/bug
4. **Update documentation** if your changes affect the API
5. **Add tests** for new functionality
6. **Ensure all tests pass** before submitting
7. **Reference related issues** in your PR description

## 🎯 Coding Standards

### TypeScript

- Use strict TypeScript settings (already configured in tsconfig.json)
- Always specify types for function parameters and return values
- Use type aliases for complex types
- Prefer interfaces for object shapes

### Code Style

- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and types
- Use **UPPER_CASE** for constants
- Use **async/await** instead of promises
- Use **arrow functions** for callbacks
- Use **template literals** instead of string concatenation

### Comments

Write **human-readable comments** that explain the **why**, not the **what**:

```typescript
// Good: Explain the purpose and reasoning
// Pause execution for given milliseconds.
// Useful for rate limiting, retries, or testing delays.
export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Bad: Just restates the code
// function to sleep for ms milliseconds
```

### Error Handling

- Use **descriptive error messages**
- Include **context** in errors
- Use **custom error classes** when appropriate
- **Validate inputs** and throw early

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(retry): add exponential backoff and jitter support

- Implement advanced retry options with backoff strategies
- Add jitter to prevent thundering herd problem
- Maintain backward compatibility with simple retry API
```

```
fix(logger): ensure colors work in all terminals

- Use chalk's auto-detection for color support
- Fallback to no colors when not supported
- Add terminal detection tests
```

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- **Test all public API functions**
- **Include edge cases**
- **Test error conditions**
- **Aim for >90% coverage**
- **Use descriptive test names**

### Test Structure

```typescript
describe('sleep', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
    expect(duration).toBeLessThan(150); // Allow some tolerance
  });

  it('should reject if time is negative', async () => {
    await expect(sleep(-100)).rejects.toThrow();
  });
});
```

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for all public functions
- **TypeScript types** are the primary documentation
- **Keep comments up-to-date** with code changes

### README Updates

When adding new features:
1. Add to the **Features** section
2. Add **usage examples**
3. Update **API documentation**
4. Add to **table of contents** if needed

## 🤝 Community

- **Join discussions** on GitHub issues
- **Help review** pull requests
- **Answer questions** from other users
- **Share your use cases** and success stories

## 📄 License

By contributing to devtools-js, you agree that your contributions will be licensed under the **MIT License**.

---

Thank you for contributing to devtools-js! Your help makes this project better for everyone. 🚀