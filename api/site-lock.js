const LOCK_KEY = 'blockforge:site-unlocked';

async function redisRequest(command, args = []) {
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/${command}/${args.map(encodeURIComponent).join('/')}`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    if (!response.ok) throw new Error('Redis request failed');
    return response.json();
}

export default async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.OWNER_PASSWORD) {
        return response.status(503).json({ error: 'Server storage is not configured.' });
    }

    try {
        if (request.method === 'GET') {
            const result = await redisRequest('get', [LOCK_KEY]);
            return response.status(200).json({ unlocked: result.result === 'true' });
        }

        if (request.method === 'POST') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {};
            if (body.password !== process.env.OWNER_PASSWORD) return response.status(401).json({ error: 'Invalid password.' });
            await redisRequest('set', [LOCK_KEY, 'true']);
            return response.status(200).json({ unlocked: true });
        }

        return response.status(405).json({ error: 'Method not allowed.' });
    } catch (error) {
        return response.status(500).json({ error: 'Lock service unavailable.' });
    }
}