
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    console.log('Read: ' + input);
} catch (e) {
    console.log('Error: ' + e.message);
}
