//# src/app/api/customizeResume/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import openai from "../../../../lib/openaiClient"; // Adjust path if needed

export async function POST(request) {
  try {
    const { acceptedChanges, filename, newFileName } = await request.json();
    const resumePath = path.join(process.cwd(), "resumes", filename);
    const originalTex = fs.readFileSync(resumePath, "utf8");

    // Update the prompt to be more specific about structure
    const prompt = `
You are an AI that updates bullet points in a LaTeX resume. I will provide you with the entire resume file and 
a list of bullet point changes. Your task is to:

1. Identify the EXPERIENCE section in the resume
2. Replace each original bullet with its corresponding new bullet in the "acceptedChanges" list
3. Return ONLY the complete updated EXPERIENCE section, from the "%-----------EXPERIENCE-----------" line 
   through the SINGLE final "\\resumeSubHeadingListEnd"

IMPORTANT:
- There must be EXACTLY ONE experience section with structure:
  %-----------EXPERIENCE-----------
  \\section{Experience}
  \\resumeSubHeadingListStart
    ... job entries ...
  \\resumeSubHeadingListEnd
  %-------------------------------------------

- Remove any duplicate job entries or extra \\resumeSubHeadingListEnd tags
- End the experience section with "\\resumeSubHeadingListEnd" followed by "%-------------------------------------------"
- Do not include any content after the experience section

Current LaTeX content:
"""
${originalTex}
"""

Here are the changes (each object has "originalBullet" and "newBullet"):
${JSON.stringify(acceptedChanges, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1200,
    });

    let updatedTex = completion.choices[0]?.message?.content || "";
    updatedTex = updatedTex.replace(/```latex|```/g, "").trim();

    // Ensure we have the correct section markers
    if (!updatedTex.startsWith("%-----------EXPERIENCE-----------")) {
      updatedTex = "%-----------EXPERIENCE-----------\n" + updatedTex;
    }
    
    if (!updatedTex.endsWith("%-------------------------------------------")) {
      updatedTex += "\n%-------------------------------------------";
    }

    // Ensure there's only one resumeSubHeadingListEnd
    const parts = updatedTex.split("\\resumeSubHeadingListEnd");
    if (parts.length > 2) {
      // Keep only the first instance and its content
      updatedTex = parts[0] + "\\resumeSubHeadingListEnd\n%-------------------------------------------";
    }

    // Change the regex to capture everything between EXPERIENCE and PROJECTS sections
    const experienceSectionRegex = /%-+EXPERIENCE-+[\s\S]*?(?=%-+PROJECTS-+)/;
    const updatedResume = originalTex.replace(experienceSectionRegex, updatedTex);

    // Create a filename-safe string by removing special characters
    const sanitizeForFilename = (str) => {
      if (!str) return '';
      return str.toLowerCase()
               .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
               .replace(/_+/g, '_')          // Replace multiple underscores with single
               .replace(/^_|_$/g, '')        // Remove leading/trailing underscores
               .substring(0, 50);            // Limit length
    };

    // Use the provided newFileName directly
    let updatedFileName;
    if (newFileName) {
      updatedFileName = newFileName;  // Use the user-provided filename
    } else {
      // Fallback to original naming if no new name provided
      updatedFileName = path.basename(resumePath, ".tex") + "_updated.tex";
    }

    const newPath = path.join(path.dirname(resumePath), updatedFileName);
    fs.writeFileSync(newPath, updatedResume, "utf8");

    return NextResponse.json({ 
      updatedTex: updatedResume, 
      updatedFileName
    });
  } catch (error) {
    console.error("Failed to inject changes:", error);
    return NextResponse.json({ error: "Failed to inject changes." }, { status: 500 });
  }
}