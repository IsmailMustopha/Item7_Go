import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// /api/chat/ai-suggestions/route.ts

// export async function POST(req: NextRequest) {
//   try {
//     await connectDb();
//     const { message, role } = await req.json();

//     if (!message) return NextResponse.json([]);

//     const prompt = `You are a delivery assistant. 
//     The customer said: "${message}". 
//     The role responding is: "${role}".
    
//     TASK: Provide exactly 3 short, helpful reply suggestions.
//     FORMAT: Return ONLY the suggestions separated by commas. 
//     No numbers, no quotes, no extra text.`;

//     // TRY THIS ONE FIRST (Most stable for 2026)
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }],
//         }),
//       },
//     );

//     const test = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
//     );
//     const models = await test.json();
//     console.log(
//       "YOUR AVAILABLE MODELS:",
//       models.models.map((m: any) => m.name),
//     );

//     const data = await response.json();

//     // --- DEBUGGING STEP ---
//     // Look at your VS Code terminal (not the browser) to see this:
//     if (data.error) {
//       console.error("Gemini API Error:", data.error.message);
//       return NextResponse.json(["Error: Check API Key"], { status: 500 });
//     }

//     const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     // Improved Parser: Splits by commas, newlines, or semicolons
//     const suggestions = rawText
//       .split(/[,\n;]/)
//       .map((s) => s.replace(/^[0-9].\s*|[*"-]/g, "").trim()) // Removes "1.", "*", and quotes
//       .filter((s) => s.length > 2) // Removes empty strings
//       .slice(0, 3);

//     return NextResponse.json(suggestions);
//   } catch (error: any) {
//     console.error("Server Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { message, role } = await req.json();

    const prompt = `You are a professional delivery assistant chatbot.

You will be given:
- role: either "user" or "delivery_boy"
- last message: the last message sent in the conversation

Your task:
👉 If role is "user" -> generate 3 short WhatsApp-style reply suggestions that a user could send to the delivery boy.
👉 If role is "delivery_boy" -> generate 3 short WhatsApp-style reply suggestions that a delivery boy could send to the user.

⚠️ Follow these rules:
- Replies must match the context of the last message.
- Keep replies short, human-like (max 10 words).
- Use emojis naturally (max one per reply).
- No generic replies like "Okay" or "Thank you".
- Must be helpful, respectful, and relevant to delivery, status, help, or location.
- NO numbering, NO extra instructions, NO extra text.
- Just return comma-separated reply suggestions.

Return only the three reply suggestions, comma-separated.

Role: ${role}
Last message: ${message}`;

     const response = await fetch(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           contents: [{ parts: [{ text: prompt }] }],
         }),
       },
     );

     const data = await response.json();
    const replyText = data.candidates?.[0].content.parts?.[0].text || "";

    // Split by comma, but also filter out any empty strings that result from trailing commas
    const suggestions = replyText
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return NextResponse.json(suggestions.slice(0, 3));

  //  const data = await response.json();
  //  const replyText = data.candidates?.[0].content.parts?.[0].text || "";
  //  const suggestions = replyText.split(",").map((s: string) => s.trim());

  //  return NextResponse.json(suggestions, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
