const { spawn } = require('child_process');
const child = spawn('npx', ['drizzle-kit', 'push'], { stdio: ['pipe', 'pipe', 'pipe'] });
let answered = false;

child.stdout.on('data', data => {
  process.stdout.write(data);
  const str = data.toString();
  if (str.includes('No, abort') && !answered) {
    answered = true;
    setTimeout(() => {
      // Down arrow, then enter
      child.stdin.write('\x1B[B\r');
    }, 1000);
  }
});
child.stderr.on('data', data => process.stderr.write(data));
child.on('close', code => process.exit(code));
