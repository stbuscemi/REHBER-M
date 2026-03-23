import dynamic from "next/dynamic";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const SOURCES = [
  { id: "quran", label: "Kuran-ı Kerim", emoji: "☪️", color: "#10b981" },
  { id: "hadith", label: "Hadisler & Sünnet", emoji: "📿", color: "#059669" },
  { id: "bible", label: "İncil", emoji: "✝️", color: "#6366f1" },
  { id: "torah", label: "Tevrat", emoji: "✡️", color: "#3b82f6" },
  { id: "buddhism", label: "Budizm", emoji: "☸️", color: "#f59e0b" },
  { id: "stoicism", label: "Stoacılık", emoji: "🏛️", color: "#94a3b8" },
  { id: "epicureanism", label: "Epikürcülük", emoji: "🍃", color: "#84cc16" },
  { id: "taoism", label: "Taoizm", emoji: "☯️", color: "#e2e8f0" },
  { id: "nihilism", label: "Nihilizm", emoji: "🌑", color: "#64748b" },
  { id: "hinduism", label: "Hinduizm & Vedalar", emoji: "🕉️", color: "#f97316" },
  { id: "kabbalah", label: "Kabala", emoji: "🔯", color: "#a855f7" },
  { id: "hermeticism", label: "Hermetizm", emoji: "🔺", color: "#eab308" },
  { id: "ra", label: "Ra Yasası (Law of One)", emoji: "🌞", color: "#fbbf24" },
  { id: "marcus", label: "Marcus Aurelius", emoji: "👑", color: "#c0a060" },
  { id: "seneca", label: "Seneca", emoji: "📜", color: "#a78bfa" },
  { id: "jung", label: "Jung & Arketipler", emoji: "🧠", color: "#ec4899" },
  { id: "sufism", label: "Tasavvuf & Sufizm", emoji: "🌹", color: "#fb7185" },
  { id: "shamanism", label: "Şamanizm", emoji: "🔥", color: "#ef4444" },
];

const SOURCE_PROMPTS = {
  quran: "Kuran-ı Kerim perspektifinden yorum yap. İlgili ayetlere atıflar yap. Allah'ın bu konudaki öğretisini ve sabrın, tevekkülün önemini anlat. Türkçe yaz.",
  hadith: "Hz. Muhammed'in hadisleri ve sünnet perspektifinden yorum yap. İlgili hadisleri belirt. İslami bir rehberlik sun. Türkçe yaz.",
  bible: "İncil'in öğretileri perspektifinden yorum yap. İlgili ayetlere atıf yap. Hz. İsa'nın öğretilerini kullan. Türkçe yaz.",
  torah: "Tevrat ve Yahudi geleneği perspektifinden yorum yap. İlgili bölümlere atıf yap. Türkçe yaz.",
  buddhism: "Budizm öğretileri perspektifinden yorum yap. Dört Yüce Gerçek, Sekiz Aşamalı Yol ve karma kavramlarını kullan. Türkçe yaz.",
  stoicism: "Stoacılık felsefesi perspektifinden yorum yap. Epiktetos, Marcus Aurelius ve Seneca'nın öğretilerini kullan. Kontrol dairemiz içindekiler ve dışındakiler ayrımını vurgula. Türkçe yaz.",
  epicureanism: "Epikürcülük felsefesi perspektifinden yorum yap. Ataraxia, hedonizm ve gerçek mutluluk kavramlarını işle. Türkçe yaz.",
  taoism: "Taoizm öğretileri perspektifinden yorum yap. Tao Te Ching'e atıflar yap, wu-wei ve doğanın akışı kavramlarını kullan. Türkçe yaz.",
  nihilism: "Nihilist bir perspektiften yorum yap. Anlamsızlık içinde özgürlük bulmayı, kendi değerleri yaratmayı anlat. Nietzsche ve Camus'ya atıflar yap. Türkçe yaz.",
  hinduism: "Hinduizm ve Vedalar perspektifinden yorum yap. Dharma, karma, samsara ve moksha kavramlarını kullan. Bhagavad Gita'ya atıf yap. Türkçe yaz.",
  kabbalah: "Kabala öğretileri perspektifinden yorum yap. Sefirot, Ein Sof ve ruhsal dönüşüm kavramlarını kullan. Türkçe yaz.",
  hermeticism: "Hermetik felsefe perspektifinden yorum yap. Yedi Hermetik İlke ve 'Yukarıda ne varsa aşağıda da o vardır' ilkesini kullan. Türkçe yaz.",
  ra: "Ra Yasası (Law of One) perspektifinden yorum yap. Kataliz, hizmet, polarizasyon ve evrimsel yolculuk kavramlarını kullan. Türkçe yaz.",
  marcus: "Marcus Aurelius'un Düşünceler kitabı ve Stoacı öğretileri perspektifinden yorum yap. Direkt olarak Marcus'un sesinden konuş. Türkçe yaz.",
  seneca: "Seneca'nın mektupları ve felsefi eserleri perspektifinden yorum yap. Ölümlülük, zaman ve iç huzur temalarını işle. Türkçe yaz.",
  jung: "Carl Jung'un psikolojik ve arketipsel perspektifinden yorum yap. Gölge, kolektif bilinçdışı ve bireyselleşme sürecini kullan. Türkçe yaz.",
  sufism: "Tasavvuf ve Sufizm perspektifinden yorum yap. Rumi, Yunus Emre ve İbn Arabi'nin öğretilerini kullan. Türkçe yaz.",
  shamanism: "Şamanizm ve animist gelenek perspektifinden yorum yap. Ruh dünyası, ata ruhlar, denge ve doğayla uyum temalarını işle. Türkçe yaz.",
};

function Home() {
  const [situation, setSituation] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const responseRef = useRef(null);

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]);

  const handleInterpret = async () => {
    if (!situation.trim() || !selectedSource) return;
    setLoading(true);
    setResponse("");

    const source = SOURCES.find((s) => s.id === selectedSource);

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          sourceId: selectedSource,
          sourceLabel: source.label,
          sourcePrompt: SOURCE_PROMPTS[selectedSource],
        }),
      });
      const data = await res.json();
      setResponse(data.result || "Yanıt alınamadı.");
    } catch (e) {
      setResponse("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const reset = () => {
    setSituation("");
    setSelectedSource(null);
    setResponse("");
  };

  const selectedSourceObj = SOURCES.find((s) => s.id === selectedSource);

  return (
    <>
      <Head>
        <title>Rehberim – Durumunu Yorumla</title>
        <meta name="description" content="Günlük olaylarını dini, felsefi ve ezoterik kaynaklarla yorumla." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #0f0c29 0%, #0a0a14 50%, #000000 100%)",
        fontFamily: "'Crimson Text', Georgia, serif",
        color: "#e8dcc8",
        padding: "0",
        overflowX: "hidden",
      }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #000; }
          .glow-text { text-shadow: 0 0 30px rgba(212,175,55,0.5), 0 0 60px rgba(212,175,55,0.2); }
          .source-card {
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 12px 14px;
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .source-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(212,175,55,0.3); transform: translateY(-1px); }
          .source-card.selected { border-color: rgba(212,175,55,0.8); background: rgba(212,175,55,0.08); }
          .main-btn {
            background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
            color: #000;
            border: none;
            padding: 16px 40px;
            font-family: 'Cinzel Decorative', serif;
            font-size: 14px;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 1px;
            box-shadow: 0 4px 30px rgba(212,175,55,0.3);
          }
          .main-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(212,175,55,0.5); }
          .main-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .textarea-custom {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 16px;
            padding: 20px;
            color: #e8dcc8;
            font-family: 'Crimson Text', Georgia, serif;
            font-size: 18px;
            line-height: 1.7;
            resize: none;
            outline: none;
            transition: border-color 0.3s;
          }
          .textarea-custom:focus { border-color: rgba(212,175,55,0.6); }
          .textarea-custom::placeholder { color: rgba(232,220,200,0.3); font-style: italic; }
          .response-section {
            background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(139,90,43,0.05) 100%);
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 20px;
            padding: 32px;
            margin-top: 32px;
            animation: fadeIn 0.8s ease;
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .loading-dots span { display: inline-block; animation: pulse 1.4s ease-in-out infinite; font-size: 24px; color: #d4af37; }
          .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
          .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes pulse { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }
        `}</style>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✦</div>
            <h1 className="glow-text" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(22px,5vw,38px)", fontWeight: 700, color: "#d4af37", letterSpacing: "2px", lineHeight: 1.3 }}>
              Rehberim
            </h1>
            <p style={{ marginTop: 12, color: "rgba(232,220,200,0.5)", fontSize: 16, fontStyle: "italic", letterSpacing: "1px" }}>
              Durumunu anlat — kaynağını seç — içini aydınlat
            </p>
            <div style={{ color: "#d4af37", opacity: 0.6, fontSize: 20, letterSpacing: "8px", marginTop: 16 }}>✦ ✦ ✦</div>
          </div>

          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #d4af37, #b8860b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700, fontSize: 14, fontFamily: "'Cinzel Decorative', serif" }}>1</div>
              <h2 style={{ fontSize: 18, fontFamily: "'Cinzel Decorative', serif", color: "#d4af37", fontWeight: 400 }}>Ne yaşıyorsun?</h2>
            </div>
            <textarea className="textarea-custom" rows={5} value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Kafana takılan şeyi, yaşadığın olayı, hissettiğin duyguyu buraya yaz..." />
          </div>

          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #d4af37, #b8860b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700, fontSize: 14, fontFamily: "'Cinzel Decorative', serif" }}>2</div>
              <h2 style={{ fontSize: 18, fontFamily: "'Cinzel Decorative', serif", color: "#d4af37", fontWeight: 400 }}>Rehberini seç</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {SOURCES.map((src) => (
                <div key={src.id} className={`source-card ${selectedSource === src.id ? "selected" : ""}`} onClick={() => setSelectedSource(src.id)} style={selectedSource === src.id ? { borderColor: src.color, boxShadow: `0 0 20px ${src.color}22` } : {}}>
                  <span style={{ fontSize: 20 }}>{src.emoji}</span>
                  <span style={{ fontSize: 13, color: selectedSource === src.id ? src.color : "rgba(232,220,200,0.75)", fontFamily: "'Crimson Text', serif", fontWeight: selectedSource === src.id ? 600 : 400, lineHeight: 1.2 }}>{src.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <button className="main-btn" onClick={handleInterpret} disabled={!situation.trim() || !selectedSource || loading}>
              {loading ? "Yorum yapılıyor..." : "✦ Yorumla ✦"}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <div className="loading-dots"><span>✦</span><span>✦</span><span>✦</span></div>
              <p style={{ color: "rgba(212,175,55,0.6)", fontSize: 14, marginTop: 12, fontStyle: "italic" }}>
                {selectedSourceObj?.label} perspektifinden bakılıyor...
              </p>
            </div>
          )}

          {response && !loading && (
            <div ref={responseRef} className="response-section">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <span style={{ fontSize: 36 }}>{selectedSourceObj?.emoji}</span>
                <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: selectedSourceObj?.color || "#d4af37", fontSize: 18, marginTop: 8, fontWeight: 400, letterSpacing: "1px" }}>{selectedSourceObj?.label} Perspektifinden</h3>
                <div style={{ color: "#d4af37", opacity: 0.6, fontSize: 20, letterSpacing: "8px", marginTop: 8 }}>✦ ✦ ✦</div>
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.85, color: "#e8dcc8", whiteSpace: "pre-wrap", letterSpacing: "0.2px" }}>{response}</div>
              <hr style={{ border: "none", borderTop: "1px solid rgba(212,175,55,0.2)", margin: "24px 0" }} />
              <div style={{ textAlign: "center" }}>
                <button className="main-btn" onClick={reset} style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.4)", color: "#d4af37", padding: "12px 28px", fontSize: 13 }}>
                  ↩ Yeni Soru Sor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
