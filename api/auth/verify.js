export default async function handler(req, res) {
  // 允许CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ valid: false, error: 'Missing password' });
    }

    // 计算SHA256哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 验证密码
    const validHashes = process.env.VIDEO_PASSWORD_HASHES.split(',');
    const isValid = validHashes.includes(hashedPassword);

    return res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ valid: false, error: 'Internal server error' });
  }
}
