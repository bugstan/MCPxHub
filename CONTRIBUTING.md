# Contributing to MCP x Hub

We welcome contributions to MCP x Hub! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `pnpm install`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/bugstan/MCPxHub.git
cd McpxHub

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode with logging enabled
LOG_ENABLED=true node dist/src/index.js
```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-description
   ```

2. Make your changes to the code.

3. Write or update tests for the changes if applicable.

4. Run the tests:
   ```bash
   pnpm test
   ```

5. Build the project to make sure it compiles:
   ```bash
   pnpm build
   ```

6. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```

7. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request against the main repository.

## Pull Request Guidelines

When submitting a pull request:

1. Make sure your code follows the project's coding style
2. Include tests for new features or bug fixes
3. Update documentation as needed
4. Keep pull requests focused on a single topic
5. Write a clear description of what your PR does and why it's needed

## Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use 4 spaces for indentation
- Include JSDoc comments for public APIs
- Use meaningful variable and function names

## Testing

We encourage writing tests for new features and bug fixes. Please ensure all tests pass before submitting a pull request.

## Documentation

If you're adding new features or making significant changes, please update the documentation accordingly. This includes:

- README.md
- JSDoc comments
- Any relevant files in the docs/ directory

## Reporting Issues

When reporting issues, please include:

1. A clear description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment information (OS, Node.js version, etc.)
6. Logs if available

## License

By contributing to MCP x Hub, you agree that your contributions will be licensed under the project's MIT License.