export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { situation, sourceLabel, sourcePrompt } = req.body;

  const prompt = `Sen derin bir ruhsal ve felsefi rehbersin. Kullanıcının paylaştığı durumu veya sorunu ${sourceLabel} perspektifinden yorumlayacaksın. ${sourcePrompt} Yorumunu şu başlıklar altında yapılandır: 1) Bu durumu nasıl görüyoruz (kısa yorum) 2) Bu kaynaktan bir mesaj veya öğreti 3) Sana tavsiye: Ne yapmalısın? Her bölümü zengin, derin ve içten yaz. Toplam 300-500 kelime olsun.

Kullanıcının durumu: "${situation}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ result: `HATA: ${JSON.stringify(data)}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ result: `HATA: ${e.message}` });
  }
}
