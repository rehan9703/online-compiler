
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {
        console.log('Received input: ' + input);
    } else {
        console.log('No standard input provided.');
    }
} catch (e) {
    console.log('Error:', e.message);
}
