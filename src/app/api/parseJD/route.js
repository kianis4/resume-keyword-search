import { NextResponse } from "next/server";
import openai from "@/lib/openaiClient"; 
// ^ adjust this path if you aren't using a path alias

export async function POST(request) {
  try {
    const { jobDescription } = await request.json();
    if (!jobDescription) {
      return NextResponse.json(
        { error: "No job description provided." },
        { status: 400 }
      );
    }

    // Prompt for OpenAI
    const prompt = `Extract the key skills, technologies, and important requirements from the following job description:\n\n"${jobDescription}"\n\nPlease return them as a JSON array of strings.`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.0,
    });

    const content = response.data.choices[0].message.content;

    // Attempt JSON parse
    let extractedKeywords;
    try {
      extractedKeywords = JSON.parse(content);
    } catch (err) {
      // fallback if it's not strict JSON
      extractedKeywords = [content];
    }

    return NextResponse.json({ keywords: extractedKeywords });
  } catch (error) {
    console.error("Error in parseJD route:", error);
    return NextResponse.json(
      { error: "Error parsing job description." },
      { status: 500 }
    );
  }
}
