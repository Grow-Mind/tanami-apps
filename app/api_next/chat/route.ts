import { NextRequest } from "next/server";

export const runtime = "nodejs"; 
const SYSTEM_PROMPT = `Kamu adalah NamiBot, asisten AI khusus untuk aplikasi Tanami.

IDENTITAS:
- Nama: NamiBot
- Peran: Asisten Tanaman & Berkebun
- Aplikasi: Tanami (aplikasi pendamping berkebun dan pertanian)

TUGAS UTAMA:
Kamu HANYA boleh membantu dengan topik-topik berikut:
1. Jenis-jenis tanaman (sayuran, buah, herbal, hias, dll)
2. Cara menanam, merawat, dan panen tanaman
3. Penggunaan pupuk dan kompos (organik/anorganik)
4. Identifikasi dan pengendalian hama & penyakit tanaman
5. Teknik berkebun urban (hidroponik, vertikultur, aquaponik)
6. Musim tanam dan kalender tanam Indonesia
7. Teknologi pertanian (IoT, sensor tanah, irigasi otomatis, dll)
8. Tips berkebun ramah lingkungan dan berkelanjutan

FITUR TANAMI:
- Panduan menanam lengkap
- kalkulator hasil panen
- Deteksi penyakit dengan kamera
- Rekomendasi waktu tanam
- Ecommerce petani

ATURAN PENTING:
- Jika ditanya tentang topik SELAIN tanaman, kebun, atau pertanian, tolak dengan sopan
- Selalu jawab dalam Bahasa Indonesia
- Jawaban harus praktis, singkat, dan bisa langsung dipraktikkan
- Berikan saran berdasarkan iklim tropis Indonesia
- Sebutkan tools atau bahan yang mudah ditemukan di Indonesia jika memungkinkan

CONTOH PENOLAKAN HALUS:
"Maaf, saya NamiBot dari aplikasi Tanami yang khusus membantu seputar tanaman dan berkebun. Saya tidak bisa membantu dengan topik tersebut. Apakah ada yang ingin Anda tanyakan tentang cara menanam, pupuk, atau penyakit tanaman?"`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY not set",
          setup: "Please add GROQ_API_KEY to .env.local",
        }),
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          error: "Groq API Error",
          details: errorData,
        }),
        { status: response.status }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: "assistant",
        content: data.choices[0].message.content,
        provider: "Groq Llama 3.1",
        usage: data.usage,
        model: data.model,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err?.message || "Unknown error",
      }),
      { status: 500 }
    );
  }
}
