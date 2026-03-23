export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { situation, sourceLabel, sourcePrompt } = req.body;

  const prompt = `Sen derin bir ruhsal ve felsefi rehbersin. Kullanıcının paylaştığı durumu veya sorunu ${sourceLabel} perspektifinden yorumlayacaksın. ${sourcePrompt} Yorumunu şu başlıklar altında yapılandır: 1) Bu durumu nasıl görüyoruz (kısa yorum) 2) Bu kaynaktan bir mesaj veya öğreti 3) Sana tavsiye: Ne yapmalısın? Her bölümü zengin, derin ve içten yaz. Toplam 300-500 kelime olsun.\n\nKullanıcının durumu: "${situation}"`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ result: `HATA: ${JSON.stringify(data)}` });
    }

    const text = data.choices?.[0]?.message?.content || "Yanıt alınamadı.";
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ result: `HATA: ${e.message}` });
  }
}
