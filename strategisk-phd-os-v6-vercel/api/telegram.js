export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = req.body?.chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID
  const text = String(req.body?.text || '').trim()

  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN belum ditetapkan di Vercel.' })
  if (!chatId) return res.status(400).json({ error: 'Chat ID diperlukan.' })
  if (!text) return res.status(400).json({ error: 'Mesej kosong.' })

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await response.json()
    if (!response.ok || !data.ok) return res.status(400).json({ error: data.description || 'Telegram gagal menghantar mesej.' })
    return res.status(200).json({ ok: true, result: data.result })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Ralat server Telegram.' })
  }
}
