const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');
const disableComment = '/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */\n';

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes(disableComment.trim())) {
                fs.writeFileSync(fullPath, disableComment + content);
            }
        }
    });
}

walk(directoryPath);
console.log('Added eslint-disable comments to all tsx/ts files.');
