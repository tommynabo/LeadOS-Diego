import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Manually read .env to get keys (avoiding extra deps like dotenv)
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const url = env['VITE_SUPABASE_URL'];
const key = env['VITE_SUPABASE_ANON_KEY'];

console.log('--- LOGIN INSTANT CHECK ---');
console.log('Target Project:', url);

if (!url || !key) {
    console.error('ERROR: Could not find VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

// 2. Init Supabase
const supabase = createClient(url, key);

// 3. Attempt Login
const email = 'tomasnivraone@gmail.com';
const password = 'password123'; // The one we agreed to test

console.log(`Attempting login for: ${email}`);
console.log(`Password used: ${password}`);

async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('\n❌ LOGIN FAILED');
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        console.error('Error Name:', error.name);

        if (error.message.includes('Invalid login credentials')) {
            console.log('\n--> DIAGNOSIS: The password is wrong OR the user is not confirmed.');
            console.log('    If you just created it, did you set the password to "password123"?');
        }
    } else {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('\n--> DIAGNOSIS: Credentials are CORRECT. If localhost fails, it is a Browser/Cache issue.');
    }
}

test();
