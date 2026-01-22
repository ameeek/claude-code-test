/**
 * Vercel Serverless Function - Chat Proxy
 * Proxies requests to n8n webhook to hide the webhook URL from the browser
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const { message } = req.query;

    if (!message) {
        return res.status(400).json({ error: 'Message parameter is required' });
    }

    try {
        const url = new URL(webhookUrl);
        url.searchParams.append('message', message);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`n8n responded with status: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error.message);
        return res.status(500).json({ error: 'Failed to communicate with AI backend' });
    }
}
