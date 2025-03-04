//# src/app/api/scoreResume/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import openai from "../../../../lib/openaiClient"; // Adjust path alias or use relative import if needed

// Add this function to normalize LaTeX special characters for comparison
function normalizeLatexForComparison(content) {
  // Replace LaTeX escape sequences with their plain text equivalents
  return content
    .replace(/C\\#/g, 'C#')
    .replace(/F\\#/g, 'F#')
    .replace(/\\#/g, '#')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\_/g, '_')
    .replace(/\\\$/g, '$');
}

export async function POST(request) {
  try {
    const { keywords } = await request.json();
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "No valid keywords array provided." },
        { status: 400 }
      );
    }

    // Path to your "resumes" folder at the project root
    const resumesDir = path.join(process.cwd(), "resumes");
    const resumeFiles = fs.readdirSync(resumesDir);

    // We'll store each resume's analysis, then sort by scorePercent
    const resumeAnalyses = [];

    for (const file of resumeFiles) {
      const fullPath = path.join(resumesDir, file);
      const content = fs.readFileSync(fullPath, "utf8");
      
      // Normalize the content for keyword comparison
      const normalizedContent = normalizeLatexForComparison(content.toLowerCase());

      // Determine matched vs unmatched
      const matchedKeywords = [];
      const unmatchedKeywords = [];

      for (const kw of keywords) {
        if (normalizedContent.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        } else {
          unmatchedKeywords.push(kw);
        }
      }

      const matchCount = matchedKeywords.length;
      const totalKeywords = keywords.length;
      const scorePercent = Math.round((matchCount / totalKeywords) * 100);

      // (Optional) Generate a short improvement tip using OpenAI
      // If you prefer not to do multiple calls, skip or combine them in one request.
      let recommendation = "";
      if (unmatchedKeywords.length > 0) {
        recommendation = await generateImprovementTip(file, matchedKeywords, unmatchedKeywords);
      } else {
        recommendation = "This resume already covers all parsed keywords quite well!";
      }

      resumeAnalyses.push({
        file,
        matchCount,
        totalKeywords,
        scorePercent,
        matchedKeywords,
        unmatchedKeywords,
        recommendation,
      });
    }

    // Sort by highest match percentage
    resumeAnalyses.sort((a, b) => b.scorePercent - a.scorePercent);

    const bestResume = resumeAnalyses[0];

    return NextResponse.json({ bestResume, allScores: resumeAnalyses });
  } catch (error) {
    console.error("Error scoring resumes:", error);
    return NextResponse.json(
      { error: "Error scoring resumes" },
      { status: 500 }
    );
  }
}

/**
 * Helper function that calls OpenAI to generate a 3–4 sentence explanation on
 * how to improve the resume to include the unmatched keywords.
 */
async function generateImprovementTip(resumeFile, matched, unmatched) {
  try {
    const prompt = `
      The user has a resume file called "${resumeFile}" which currently matches these keywords:
      ${matched.join(", ")}

      It is missing these other relevant keywords:
      ${unmatched.join(", ")}

      Provide a concise 3–4 sentence explanation of how the resume could be improved or updated
      to better reflect the unmatched keywords, ensuring that any suggestions incorporate these
      missing skills/technologies in a natural way. Please do not provide your answer in JSON;
      just return plain text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    return completion.choices[0].message?.content?.trim() || "";
  } catch (err) {
    console.error("Error generating improvement tip:", err);
    return "Unable to generate improvement tips at this time.";
  }
}

