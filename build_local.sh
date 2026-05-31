#!/bin/bash
set -euo pipefail

# Portable repo-root detection
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || dirname "$(realpath "$0")")"
cd "$REPO_ROOT"

# Diagnostics
echo "--- Build Diagnostics ---"
pwd
ls -la
git rev-parse --show-toplevel 2>/dev/null || echo "Not a git repository"
echo "-------------------------"

echo "Installing deps..."
npm ci

echo "Building backend..."
npm run build:backend

echo "Building frontend..."
npm run build:frontend
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=http://localhost:5000/api

echo "Preparing backend bundle..."
mkdir -p backend/bundle
node -e "
  const pkg = JSON.parse(require('fs').readFileSync('backend/package.json','utf-8'));
  delete pkg.devDependencies; delete pkg.scripts;
  delete pkg.dependencies.shared;
  require('fs').writeFileSync('backend/bundle/package.json', JSON.stringify(pkg,null,2));
"
if [ ! -d "backend/bundle" ]; then
  echo "Error: backend/bundle directory not found"
  exit 1
fi
cd backend/bundle && npm install --omit=dev --ignore-scripts
cd ../..
cp -r shared backend/bundle/node_modules/shared

echo "Preparing frontend bundle..."
mkdir -p frontend/bundle
node -e "
  const pkg = JSON.parse(require('fs').readFileSync('frontend/package.json','utf-8'));
  const keep = ['next','react','react-dom'];
  const deps = {};
  keep.forEach(k => { if(pkg.dependencies[k]) deps[k]=pkg.dependencies[k]; });
  pkg.dependencies = deps;
  delete pkg.devDependencies; delete pkg.scripts;
  require('fs').writeFileSync('frontend/bundle/package.json', JSON.stringify(pkg,null,2));
"
if [ ! -d "frontend/bundle" ]; then
  echo "Error: frontend/bundle directory not found"
  exit 1
fi
cd frontend/bundle && npm install --omit=dev --ignore-scripts
cd ../..

echo "Building Linux desktop app..."
if [ ! -d "desktop" ]; then
  echo "Error: desktop directory not found"
  exit 1
fi
cd desktop
npm install
npx electron-builder --linux
