// TypeScript
interface User {
    name: string;
    id: number;
}
const user: User = { name: 'CodeForge', id: 1 };
console.log('Hello, ' + user.name + '!');

import * as fs from 'fs';
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) console.log('Read: ' + input);
} catch (e) {}
