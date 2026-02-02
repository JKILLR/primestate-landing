const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3847;
const EMAILS_FILE = process.env.EMAILS_FILE || '/data/subscribers.json';

// Initialize file if doesn't exist
if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([], null, 2));
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://primestate.dev');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    if (req.method === 'POST' && req.url === '/subscribe') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { email } = JSON.parse(body);
                
                // Basic email validation
                if (!email || !email.includes('@') || !email.includes('.')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid email' }));
                    return;
                }
                
                // Load existing subscribers
                const subscribers = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf8'));
                
                // Check for duplicate
                if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Already subscribed' }));
                    return;
                }
                
                // Add new subscriber
                subscribers.push({
                    email: email.toLowerCase(),
                    subscribedAt: new Date().toISOString(),
                    source: 'blog'
                });
                
                fs.writeFileSync(EMAILS_FILE, JSON.stringify(subscribers, null, 2));
                
                console.log(`New subscriber: ${email}`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Email capture server running on port ${PORT}`);
});
