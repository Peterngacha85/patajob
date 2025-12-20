const dotenv = require('dotenv');
const path = require('path');

console.log('Current Directory:', process.cwd());
console.log('Expected .env Path:', path.resolve(process.cwd(), '.env'));

const result = dotenv.config();

if (result.error) {
    console.error('Dotenv Error:', result.error);
} else {
    console.log('Dotenv Parsed:', result.parsed);
}
