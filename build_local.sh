#!/bin/bash
set -e
cd /home/abdul-razack-a/Personal/Freelance/billing-optics

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
cd frontend/bundle && npm install --omit=dev --ignore-scripts
cd ../..

echo "Building Linux desktop app..."
cd desktop
npm install
npx electron-builder --linux
