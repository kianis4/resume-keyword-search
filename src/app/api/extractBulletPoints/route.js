// File: src/app/api/extractBulletPoints/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import openai from "../../../../lib/openaiClient";

export async function GET(request) {
  try {
    // read ?file= query param
    const { searchParams } = new URL(request.url);
    const resumeFile = searchParams.get("file");

    if (!resumeFile) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 });
    }

    // Read .tex content
    const resumesDir = path.join(process.cwd(), "resumes");
    const resumePath = path.join(resumesDir, resumeFile);
    if (!fs.existsSync(resumePath)) {
      return NextResponse.json(
        { error: `File not found: ${resumeFile}` },
        { status: 404 }
      );
    }

    const texContent = fs.readFileSync(resumePath, "utf8");

    // Prompt the model to parse experience sections with thorough instructions
    // We explicitly mention possible headings or environment structures.
    const prompt = `
      You are an AI that extracts EXPERIENCE SECTIONS from a LaTeX resume. 
      The LaTeX content is enclosed below. 
      The user wants to see each job or position under "Experience," including:
        - job title,
        - company name,
        - date range,
        - (optionally) location,
        - an array of bullet points.

      Sometimes the resume is structured with commands like:
        \\section{Experience}
        \\subsection{Company Name}
        \\subsection{Role}
        \\item ...
      or 
        \\begin{itemize} ... \\end{itemize}
      or 
        \\resumeItemListStart ... \\resumeItemListEnd
      or something else.

      **Task**: 
      1. Identify all distinct experiences in the resume (like separate roles or positions).
      2. For each, provide a JSON object with the structure:
         {
           "jobTitle": "string",
           "company": "string",
           "dateRange": "string",
           "location": "string",
           "bullets": ["bullet1", "bullet2", ...]
         }
      3. If you can't find some info (e.g. location), use an empty string "".
      4. Output a strict JSON array of these objects, with no extra text or code fences.

      Make sure your output is strictly valid JSON (no backticks, no triple backticks, no code blocks).

      LaTeX Content:
      """
      ${texContent}
      """
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
    });

    let raw = completion.choices[0].message?.content || "";

    // (A) Remove any triple backticks or code fences if the model returns them.
    raw = raw.replace(/```[\s\S]*?```/g, "").trim();

    // (B) Attempt to parse as JSON
    let experiences = [];
    try {
      experiences = JSON.parse(raw);
      // Validate it's an array
      if (!Array.isArray(experiences)) experiences = [];
    } catch (err) {
      console.warn("JSON parse failed, output was:\n", raw);
      experiences = [];
    }

    return NextResponse.json({ experiences });
  } catch (err) {
    console.error("Error extracting experiences with AI:", err);
    return NextResponse.json(
      { error: "Failed to extract experiences" },
      { status: 500 }
    );
  }
}

