export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { situation, sourceId, sourceLabel, sourcePrompt } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Sen derin bir ruhsal ve felsefi rehbersin. Kullanıcının paylaştığı durumu veya sorunu ${sourceLabel} perspektifinden yorumlayacaksın. ${sourcePrompt} Yorumunu şu başlıklar altında yapılandır: 1) Bu durumu nasıl görüyoruz (kısa yorum) 2) Bu kaynaktan bir mesaj veya öğreti 3) Sana tavsiye: Ne yapmalısın? Her bölümü zengin, derin ve içten yaz. Toplam 300-500 kelime olsun.`,
        messages: [{ role: "user", content: `Şu an kafama takılan / yaşadığım durum:\n\n"${situation}"` }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ result: `HATA: ${JSON.stringify(data)}` });
    }

    const text = data.content?.map((b) => b.text || "").join("") || "Yanıt alınamadı.";
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ result: `HATA: ${e.message}` });
  }
}
