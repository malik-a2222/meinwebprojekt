// Vercel Blob Upload Handler
// Speichere diese Datei als: api/upload.js (wenn du Vercel Functions nutzt)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  try {
    const { filename, data } = req.body;

    // Blob Storage API Call
    const response = await fetch('https://blob.vercel-storage.com/upload', {
      method: 'POST',
      headers: {
        'x-add-random-suffix': 'true',
        'Authorization': `Bearer ${process.env.BLOB_WEBHOOK_PUBLIC_KEY}`,
      },
      body: Buffer.from(data, 'base64'),
    });

    const blob = await response.json();

    res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
