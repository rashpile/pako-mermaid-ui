# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD of the Pako Mermaid UI project.

## Workflows

### 1. `docker-build.yml` - Main Docker Build
**Triggers:**
- Push to `master`/`main` branches
- Tags starting with `v*`
- Pull requests to `master`/`main`

**Features:**
- Builds multi-platform images (AMD64, ARM64)
- Publishes to GitHub Container Registry (ghcr.io)
- Automatic tagging based on branch/tag/PR
- Build cache optimization
- Attestation and provenance generation

### 2. `docker-hub.yml` - Docker Hub Publishing
**Triggers:**
- Push to `master`/`main` branches  
- Tags starting with `v*`
- GitHub releases

**Features:**
- Publishes to Docker Hub
- Updates repository description from DOCKER.md
- Multi-platform builds
- Semantic versioning tags

**Required Secrets:**
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token

### 3. `ci-cd.yml` - Complete CI/CD Pipeline
**Triggers:**
- Push to `master`/`main`/`develop` branches
- Pull requests to `master`/`main`
- GitHub releases

**Features:**
- Full test suite (lint, type-check, build)
- Docker build with security scanning
- Trivy vulnerability scanning
- SBOM generation for releases
- Staging/production deployment workflows

### 4. `docker-dev.yml` - Development Builds
**Triggers:**
- Push to `develop` branch
- Push to `feature/*` branches
- Manual workflow dispatch

**Features:**
- Development image builds
- Branch-specific tagging
- PR comments with image details
- Faster builds (single platform)

## Setup Instructions

### For GitHub Container Registry (Recommended)

1. **Enable GitHub Packages** in your repository settings
2. **No additional secrets needed** - uses `GITHUB_TOKEN` automatically
3. **Images will be available at:** `ghcr.io/username/pako-mermaid-ui`

### For Docker Hub

1. **Create Docker Hub account** and repository
2. **Generate access token** in Docker Hub settings
3. **Add repository secrets:**
   ```
   DOCKERHUB_USERNAME=yourusername
   DOCKERHUB_TOKEN=your_access_token
   ```

### Setting up Environments (Optional)

For the full CI/CD pipeline, create GitHub environments:

1. Go to **Settings** → **Environments**
2. Create environments: `staging`, `production`
3. Add protection rules and secrets as needed

## Image Tags

### Automatic Tagging Strategy

- **Latest:** `latest` (from main/master branch)
- **Branch:** `main`, `develop` (from respective branches)
- **PR:** `pr-123` (from pull requests)
- **Semantic:** `v1.0.0`, `v1.0`, `v1` (from version tags)
- **SHA:** `main-abc1234` (commit-based)

### Usage Examples

```bash
# Pull latest stable version
docker pull ghcr.io/username/pako-mermaid-ui:latest

# Pull specific version
docker pull ghcr.io/username/pako-mermaid-ui:v1.0.0

# Pull development version
docker pull ghcr.io/username/pako-mermaid-ui:develop

# Pull specific feature branch
docker pull ghcr.io/username/pako-mermaid-ui:dev-feature-auth
```

## Security Features

### Vulnerability Scanning
- **Trivy** scans all built images
- Results uploaded to **GitHub Security** tab
- Blocks deployment on critical vulnerabilities

### Image Signing
- **Cosign** signatures for all images
- **SBOM** (Software Bill of Materials) generation
- **Build attestations** for supply chain security

### Security Best Practices
- Non-root container execution
- Minimal base images (Alpine Linux)
- Multi-stage builds to reduce attack surface
- Regular dependency updates

## Monitoring and Notifications

### Build Status
- Badge available: `![Docker Build](https://github.com/username/pako-mermaid-ui/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)`
- Email notifications on build failures
- Slack/Discord integration possible

### Image Metrics
- Build time tracking
- Image size optimization
- Cache hit rates
- Security scan results

## Customization

### Modifying Workflows

1. **Edit workflow files** in `.github/workflows/`
2. **Test in feature branch** first
3. **Review changes** in pull request
4. **Merge to main** to activate

### Adding New Registries

Add additional registry steps in workflows:
```yaml
- name: Login to additional registry
  uses: docker/login-action@v3
  with:
    registry: your-registry.com
    username: ${{ secrets.REGISTRY_USERNAME }}
    password: ${{ secrets.REGISTRY_PASSWORD }}
```

## Troubleshooting

### Common Issues

1. **Permission denied** - Check repository permissions for GitHub Packages
2. **Build failures** - Review build logs and fix TypeScript/lint errors
3. **Registry authentication** - Verify secrets and token permissions
4. **Multi-platform builds** - May require additional setup for ARM64

### Debug Information

Enable debug logging by setting repository secret:
```
ACTIONS_STEP_DEBUG=true
```

### Support

For issues with workflows:
1. Check **Actions** tab for detailed logs
2. Review **Security** tab for vulnerability reports
3. Check **Packages** tab for published images