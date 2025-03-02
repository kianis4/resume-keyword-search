//# src/app/api/customizeResume/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import openai from "../../../../lib/openaiClient"; // Adjust path if needed

export async function POST(request) {
  try {
    const { acceptedChanges } = await request.json();
    // console.log("Accepted changes:", acceptedChanges);
    const devopsPath = path.join(process.cwd(), "resumes", "devops.tex");
    const originalTex = fs.readFileSync(devopsPath, "utf8");

    const prompt = `
You are an AI that updates bullet points in a LaTeX resume. Keep the entire file exactly the same, 
except replace each original bullet in "acceptedChanges" with the new text. Preserve all LaTeX 
commands, packages, or other lines. Return only the complete updated LaTeX code for the section that is listed
under experience.

Here is an example section we are trying to update:
%-----------EXPERIENCE-----------
\section{Experience}
\resumeSubHeadingListStart
  \resumeSubheading
    {Software \& IT Systems Dev}{Aug. 2024 -- Present}
    {Burlington Training Centre}{Burlington, ON}
    \resumeItemListStart
      \resumeItem{Containerized critical applications with \textbf{Docker} and orchestrated multi-environment deployments using \textbf{Kubernetes}, reducing release cycle times by \textbf{40\%} and ensuring high system availability.}
      \resumeItem{Automated end-to-end \textbf{CI/CD} workflows with \textbf{GitHub Actions} and \textbf{Jenkins}, integrating automated testing, code quality checks, and seamless rollouts across staging and production environments.}
      \resumeItem{Implemented robust \textbf{Infrastructure as Code} using \textbf{Terraform} to provision and manage AWS resources (\textbf{EC2}, \textbf{S3}, \textbf{RDS}, \textbf{SNS}), significantly reducing manual provisioning overhead while enhancing scalability and consistency.}
      \resumeItem{Configured comprehensive monitoring solutions with \textbf{Prometheus} and custom \textbf{Grafana} dashboards, enabling proactive performance tracking, rapid incident response, and a \textbf{50\%} reduction in system downtime.}
    \resumeItemListEnd

  \resumeSubheading
    {Junior Web Developer }{May 2021 -- Aug 2022}
    {Giftcash Inc.}{Remote}
    \resumeItemListStart
      \resumeItem{Migrated a legacy \textbf{Python}/\textbf{Django} monolith to a \textbf{Node.js} serverless microservices architecture, achieving a \textbf{15\%} increase in scalability while reducing infrastructure overhead and enabling cost-effective elastic scaling.}
      \resumeItem{Optimized \textbf{PostgreSQL} performance through strategic indexing, caching, and query optimization, reducing average response times by \textbf{20\%} and enhancing data retrieval efficiency under high loads.}
      \resumeItem{Implemented robust data extraction workflows using \textbf{Puppeteer} and \textbf{Axios} in an Agile environment, automating gift card balance verifications across multiple provider platforms and boosting operational efficiency by \textbf{25\%}.}
      \resumeItem{Established streamlined \textbf{CI/CD} pipelines with \textbf{Jenkins} and \textbf{GitHub Actions}, ensuring rapid, automated development cycles and seamless deployments across staging and production environments.}
  \resumeItemListEnd

We want to update just the '\resumeItems{} that are applicable and return the new %-----------EXPERIENCE-----------
section.

Ensure that the updated LaTeX code is valid and does not contain any syntax errors, best practices are follow, such as \textbf{} for bold text on technologies and impact, and that the formatting is consistent with the rest of the document.

Current LaTeX content:
"""
${originalTex}
"""

Here are the changes (each object has "originalBullet" and "newBullet"):
${JSON.stringify(acceptedChanges, null, 2)}
`;

// console.log("Prompt:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1200,
    });
    // console.log("Completion:", completion);

    let updatedTex = completion.choices[0]?.message?.content || "";
    console.log("Updated Tex:", updatedTex);
    // updatedTex = updatedTex.replace(/```[\s\S]*?```/g, "").trim();
    const experienceSectionRegex = /%-----------EXPERIENCE-----------[\s\S]*?\\resumeSubHeadingListEnd/;
    // Remove any ```latex blocks from the response
    updatedTex = updatedTex.replace(/```latex|```/g, "").trim();
    const updatedResume = originalTex.replace(experienceSectionRegex, updatedTex);

    // Write to devops_updated.tex
    const newPath = path.join(process.cwd(), "resumes", "devops_updated.tex");
    fs.writeFileSync(newPath, updatedResume, "utf8");

    return NextResponse.json({ updatedTex });
  } catch (error) {
    console.error("Failed to inject changes:", error);
    return NextResponse.json({ error: "Failed to inject changes." }, { status: 500 });
  }
}