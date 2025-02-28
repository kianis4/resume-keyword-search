import { NextResponse } from "next/server";
import openai from "../../../../lib/openaiClient";

export async function POST(request) {
  try {
    const { jobDescription } = await request.json();
    if (!jobDescription) {
      return NextResponse.json(
        { error: "No job description provided." },
        { status: 400 }
      );
    }

    // New prompt asks for:
    // 1. A JSON array of keywords under "keywords"
    // 2. A 2-3 sentence summary of the ideal candidate under "idealCandidateDescription"
    const prompt = `
    You are an AI that only returns valid JSON, no extra text.
    Please return an object with two keys:
      "keywords": a strict JSON array of skills/technologies from the JD
      "idealCandidateDescription": a short, 2–3 sentence summary describing the ideal candidate for this role
    Do NOT include any backticks or triple backticks in your output.

    JD: "${jobDescription}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo"
      messages: [
        { role: "user", content: prompt },
      ],
    });

    // Get the text output from the model
    let content = completion.choices[0].message?.content || "";

    // Remove any leftover code fences (just in case)
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    let extracted;
    try {
      // Expect an object with { keywords: [...], idealCandidateDescription: "..." }
      extracted = JSON.parse(content);
    } catch (parseError) {
      // If it fails to parse, fallback to storing the raw text.
      extracted = {
        keywords: [],
        idealCandidateDescription: content,
      };
    }

    return NextResponse.json({
      keywords: extracted.keywords,
      idealCandidateDescription: extracted.idealCandidateDescription,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error parsing JD" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import openai from "../../../../lib/openaiClient";

// export async function POST(request) {
//   try {
//     const { jobDescription } = await request.json();
//     if (!jobDescription) {
//       return NextResponse.json(
//         { error: "No job description provided." },
//         { status: 400 }
//       );
//     }

//     // Stronger prompt: do NOT include code fences
//     const prompt = `
//     You are an AI that only returns valid JSON, no extra text.
//     Output a strict JSON array of skills/technologies from the JD. 
//     Do NOT include any backticks or triple backticks in your output.

//     JD: "${jobDescription}"
//     `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o", // or "gpt-3.5-turbo"
//       messages: [
//         { role: "user", content: prompt },
//       ],
//     });

//     let content = completion.choices[0].message?.content || "";

//     // Remove backticks if present
//     content = content.replace(/```json/gi, '').replace(/```/g, '').trim();

//     let extracted;
//     try {
//       extracted = JSON.parse(content);
//     } catch (parseError) {
//       // If not parseable, fallback
//       extracted = [content];
//     }

//     return NextResponse.json({ keywords: extracted });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Error parsing JD" }, { status: 500 });
//   }
// }
