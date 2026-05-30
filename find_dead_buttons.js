const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Find <Button ...> and match up to closing </Button> or />
    const buttonRegex = /<Button([\s\S]*?)(?:>([\s\S]*?)<\/Button>|\/>)/g;
    let match;
    let count = 1;
    const lines = content.split('\n');
    
    while ((match = buttonRegex.exec(content)) !== null) {
        const props = match[1];
        const children = match[2];
        
        // Find line number
        const preMatch = content.substring(0, match.index);
        const lineNo = preMatch.split('\n').length;
        
        // Check for click/submit behavior
        const hasOnClick = /onClick=/.test(props);
        const hasTypeSubmit = /type=["']submit["']/.test(props);
        const hasAsChild = /asChild/.test(props);
        const isFormChild = props.includes('form=');
        
        if (!hasOnClick && !hasTypeSubmit && !hasAsChild && !isFormChild) {
            console.log(`Potential dead button at ${file}:${lineNo}`);
            console.log(`  Props: ${props.trim().replace(/\n/g, ' ')}`);
            if (children) console.log(`  Content: ${children.trim().replace(/\n/g, ' ')}`);
        }
    }
});
