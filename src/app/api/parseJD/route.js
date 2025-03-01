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

    // Adjusted prompt to emphasize thoroughness
    const prompt = `
    You are an AI that only returns valid JSON, no extra text.
    Please return an object with four keys:
      "companyName": A short string for the company name, or "" if not found
      "jobTitle": A short string for the job title, or "" if not found
      "keywords": A strict JSON array of all relevant skills, technologies, frameworks, and tools 
                  mentioned or implied by the JD. Be as comprehensive as possible.
      "idealCandidateDescription": A short, 2–3 sentence summary describing the ideal candidate for this role,
        naturally incorporating all listed "keywords".

    Do NOT include any backticks or triple backticks in your output.
    JD: "${jobDescription}"
    `;

    const completion = await openai.chat.completions.create({
      // "gpt-4o" or "gpt-3.5-turbo"
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      // Slightly increase temperature to allow more expansive listing
      temperature: 0.3, 
    });

    let content = completion.choices[0].message?.content || "";

    // Remove code fences if present
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      extracted = {
        companyName: "",
        jobTitle: "",
        keywords: [],
        idealCandidateDescription: content,
      };
    }

    return NextResponse.json({
      companyName: extracted.companyName || "",
      jobTitle: extracted.jobTitle || "",
      keywords: extracted.keywords || [],
      idealCandidateDescription: extracted.idealCandidateDescription || "",
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

//     // New prompt asks for:
//     // 1. A JSON array of keywords under "keywords"
//     // 2. A 2-3 sentence summary of the ideal candidate under "idealCandidateDescription"
//     const prompt = `
//     You are an AI that only returns valid JSON, no extra text.
//     Please return an object with two keys:
//       "keywords": a strict JSON array of skills/technologies from the JD
//       "idealCandidateDescription": a short, 2–3 sentence summary describing the ideal candidate for this role
//     Do NOT include any backticks or triple backticks in your output.

//     JD: "${jobDescription}"
//     `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o", // or "gpt-3.5-turbo"
//       messages: [
//         { role: "user", content: prompt },
//       ],
//     });

//     // Get the text output from the model
//     let content = completion.choices[0].message?.content || "";

//     // Remove any leftover code fences (just in case)
//     content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

//     let extracted;
//     try {
//       // Expect an object with { keywords: [...], idealCandidateDescription: "..." }
//       extracted = JSON.parse(content);
//     } catch (parseError) {
//       // If it fails to parse, fallback to storing the raw text.
//       extracted = {
//         keywords: [],
//         idealCandidateDescription: content,
//       };
//     }

//     return NextResponse.json({
//       keywords: extracted.keywords,
//       idealCandidateDescription: extracted.idealCandidateDescription,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Error parsing JD" }, { status: 500 });
//   }
// }