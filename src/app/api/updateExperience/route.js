// File: src/app/api/updateExperience/route.js
import { NextResponse } from "next/server";
import openai from "../../../../lib/openaiClient";

export async function POST(request) {
  try {
    const {
      jobTitle,
      company,
      bullets,
      idealCandidateDescription,
      jobDescription,
      unmatchedKeywords,
    } = await request.json();

    if (!bullets || !Array.isArray(bullets)) {
      return NextResponse.json(
        { error: "Missing or invalid 'bullets' array." },
        { status: 400 }
      );
    }
    if (!jobDescription || !idealCandidateDescription) {
      return NextResponse.json(
        { error: "Missing 'jobDescription' or 'idealCandidateDescription'." },
        { status: 400 }
      );
    }

    const prompt = buildUpdateExperiencePrompt(
      jobTitle,
      company,
      bullets,
      idealCandidateDescription,
      jobDescription,
      unmatchedKeywords || []
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if available
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    let rawOutput = completion.choices[0].message?.content || "";
    // Remove code fences if present
    rawOutput = rawOutput.replace(/```[\s\S]*?```/g, "").trim();

    let changes = [];
    try {
      changes = JSON.parse(rawOutput);
      if (!Array.isArray(changes)) changes = [];
    } catch (err) {
      console.warn("Failed to parse updateExperience output as JSON. Raw output:", rawOutput);
      changes = [];
    }

    return NextResponse.json({ changes });
  } catch (err) {
    console.error("Error in updateExperience route:", err);
    return NextResponse.json({ error: "Failed to update experience bullets." }, { status: 500 });
  }
}

function buildUpdateExperiencePrompt(
  jobTitle,
  company,
  bullets,
  idealCandidateDescription,
  jd,
  unmatchedKeywords
) {
  return `
You are an AI rewriting bullet points for a specific EXPERIENCE section in a resume, aiming to align them closely with the "ideal candidate" profile from the job description. 

Key objectives:
1. If a bullet is already somewhat relevant, rewrite it to naturally include any truly relevant missing skills or keywords, rather than just appending a short sentence. 
2. If a bullet is irrelevant or doesn't highlight the candidate’s needed strengths, it's acceptable to replace it with a new bullet that better demonstrates the missing or relevant skills.
3. Maintain roughly the same bullet length as the original, but you may rewrite the entire bullet for coherence. 
4. Avoid forcing random technologies (e.g., do not mention Ruby on Rails if it doesn't logically fit the bullet). 
5. Keep the bullet count the same (one bullet in, one bullet out).

EXPERIENCE INFO:
- Job Title: ${jobTitle}
- Company: ${company}
- Original Bullet Points:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

IDEAL CANDIDATE PROFILE:
${idealCandidateDescription}

JOB DESCRIPTION CONTEXT:
${jd}

UNMATCHED KEYWORDS (missing from candidate’s resume):
${unmatchedKeywords.join(", ")}

YOUR TASK:
- Rewrite or replace each bullet in a cohesive way that highlights the candidate’s relevant skills and missing keywords, if they make sense for the bullet’s context. 
- If a bullet is truly irrelevant, replace it with a new bullet that showcases relevant or missing skills. 
- Keep the final bullet count the same, with each bullet about the same length as before. 
- Return a strictly valid JSON array of objects, in the same order, each with:
  {
    "originalBullet": "...",
    "newBullet": "..."
  }
No extra commentary or code fences.
`;
}
