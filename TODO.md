## Overview of the Final Tech Stack

### Frontend:
- Next.js (using React for UI and Next.js API Routes for backend logic).
- Minimal styling (you can add Tailwind CSS or another styling solution if you prefer).

### Backend:
- Next.js API Routes that handle:
    - Job Description Parsing (via an OpenAI endpoint).
    - Resume Scoring (simple text search vs. your .tex files).
    - Resume Customization (OpenAI generation).
    - LaTeX Compilation (optional local or external setup).

### LLM Integration:
- OpenAI GPT-3.5/4 calls via the openai Node.js library.
- You’ll need an OpenAI API key in your .env.local file.

### PDF Generation:
- Programmatically edit .tex files, then compile them into a PDF on the server side.
- For local development, you can install a minimal LaTeX distribution or containerize it.

### Deployment:
- Vercel (to handle Next.js gracefully).
- You’ll set environment variables (like OPENAI_API_KEY) in the Vercel dashboard.

## Day 1: Project Setup & Basic Architecture

### Tasks

1. **Create a GitHub Repo**
     - Name: resume-tailoring-system.
     - Clone it locally.

2. **Initialize Next.js App**
     ```bash
     npx create-next-app resume-tailoring-system
     cd resume-tailoring-system
     git add .
     git commit -m "chore: initial next.js setup"
     git push origin main
     ```
     - Run `npm run dev` (or `yarn dev`) and confirm the starter project opens at http://localhost:3000.

3. **Configure Environment Variables**
     - Create a file `.env.local` in the project root:
         ```bash
         OPENAI_API_KEY="sk-123..."
         ```
     - Add `.env.local` to `.gitignore` so you don’t expose your secret key on GitHub.

4. **Project File Structure**
     - Within `resume-tailoring-system/`, create the following structure:
         ```bash
         /resumes           # place .tex files here
             devops.tex
             fullstack.tex
             backend.tex
             frontend.tex
             aiml.tex

         /pages
             /api             # Next.js API routes
                 parseJD.js
                 scoreResume.js
                 customizeResume.js
                 compilePDF.js
                 ...
             index.js         # or /app/page.js if using App Router

         /lib               # utility files
             openaiClient.js  # for OpenAI config
             latexCompiler.js # for LaTeX compilation logic
             ...
         ```
     - Copy your five .tex resume templates into `/resumes`.

5. **Initialize OpenAI Client (in /lib/openaiClient.js)**
     ```javascript
     import { Configuration, OpenAIApi } from "openai";

     const configuration = new Configuration({
         apiKey: process.env.OPENAI_API_KEY,
     });

     const openai = new OpenAIApi(configuration);

     export default openai;
     ```

6. **Commit & Push**
     ```bash
     git add .
     git commit -m "feat: project structure and openAI config"
     git push origin main
     ```

**End of Day 1:**
You’ll have a Next.js project set up with your .tex files in place, environment variables for OpenAI, and a structure ready for API route implementations.

## Day 2: Job Description Parsing (API & UI)

### Tasks

1. **Job Description UI**
     - Edit `pages/index.js` (or `/app/page.js`, but let’s assume the classic Pages Router).
     - Create a basic form with a `<textarea>` and a “Parse Job Description” button:
         ```jsx
         import { useState } from 'react';

         export default function Home() {
             const [jobDesc, setJobDesc] = useState('');
             const [parsedData, setParsedData] = useState(null);

             async function handleParseJD() {
                 const response = await fetch('/api/parseJD', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ jobDescription: jobDesc }),
                 });
                 const data = await response.json();
                 setParsedData(data);
             }

             return (
                 <div style={{ padding: '1rem' }}>
                     <h1>Resume Tailoring System</h1>
                     <textarea
                         value={jobDesc}
                         onChange={(e) => setJobDesc(e.target.value)}
                         rows={10}
                         cols={50}
                     />
                     <br />
                     <button onClick={handleParseJD}>Parse Job Description</button>

                     {parsedData && (
                         <div>
                             <h2>Parsed Data</h2>
                             <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                         </div>
                     )}
                 </div>
             );
         }
         ```

2. **/api/parseJD.js (NLP Extraction with OpenAI)**
     - Create `pages/api/parseJD.js`:
         ```jsx
         import openai from '../../lib/openaiClient';

         export default async function handler(req, res) {
             const { jobDescription } = req.body;

             if (!jobDescription) {
                 return res.status(400).json({ error: 'No job description provided' });
             }

             try {
                 const prompt = `Extract the key skills, technologies, and important requirements from the following job description:\n\n"${jobDescription}"\n\nPlease return them in a JSON array of strings.`;

                 const response = await openai.createChatCompletion({
                     model: 'gpt-3.5-turbo',
                     messages: [
                         { role: 'system', content: 'You are a helpful assistant.' },
                         { role: 'user', content: prompt },
                     ],
                     temperature: 0.0,
                 });

                 const content = response.data.choices[0].message.content;

                 let extractedKeywords;
                 try {
                     extractedKeywords = JSON.parse(content);
                 } catch (err) {
                     extractedKeywords = [content];
                 }

                 return res.status(200).json({ keywords: extractedKeywords });
             } catch (error) {
                 console.error(error);
                 return res.status(500).json({ error: 'Error parsing job description.' });
             }
         }
         ```

3. **Test Parsing**
     - Run `npm run dev`.
     - Open http://localhost:3000, paste a sample job description, click “Parse Job Description”.
     - Verify you get a JSON array of key terms.

4. **Commit & Push**
     ```bash
     git add .
     git commit -m "feat: job description parsing with openAI"
     git push origin main
     ```

**End of Day 2:**
Now you have a UI to paste a JD and an API endpoint that uses OpenAI to return extracted keywords, skills, and requirements.

## Day 3: Resume Scoring & Selection

### Tasks

1. **Scoring API Route**
     - Create `pages/api/scoreResume.js`:
         ```js
         import fs from 'fs';
         import path from 'path';

         export default async function handler(req, res) {
             const { keywords } = req.body;
             if (!keywords || !Array.isArray(keywords)) {
                 return res.status(400).json({ error: 'No valid keywords array provided.' });
             }

             const resumesDir = path.join(process.cwd(), 'resumes');
             const resumeFiles = fs.readdirSync(resumesDir);

             const scores = resumeFiles.map((file) => {
                 const fullPath = path.join(resumesDir, file);
                 const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();

                 let score = 0;
                 keywords.forEach((kw) => {
                     if (content.includes(kw.toLowerCase())) {
                         score += 1;
                     }
                 });

                 return { file, score };
             });

             scores.sort((a, b) => b.score - a.score);

             const bestResume = scores[0];

             return res.status(200).json({ bestResume, allScores: scores });
         }
         ```

2. **Add Scoring Logic to Frontend**
     - In `pages/index.js` (right after receiving the keywords), call `/api/scoreResume`:
         ```js
         async function handleScoreResumes(parsedData) {
             const response = await fetch('/api/scoreResume', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ keywords: parsedData.keywords }),
             });
             const data = await response.json();
             return data;
         }
         async function handleParseJD() {
             const parseResponse = await fetch('/api/parseJD', { ... });
             const parseData = await parseResponse.json();

             const scoreData = await handleScoreResumes(parseData);
             setParsedData(parseData);
             setScoreResults(scoreData);
         }
         ```

3. **Display Best Resume**
     - Show the top resume in the UI:
         ```jsx
         {scoreResults && (
             <div>
                 <h2>Best Resume</h2>
                 <p>
                     {scoreResults.bestResume.file} with score {scoreResults.bestResume.score}
                 </p>
                 <h3>All Scores</h3>
                 <pre>{JSON.stringify(scoreResults.allScores, null, 2)}</pre>
             </div>
         )}
         ```

4. **Test**
     - Paste a JD, parse it, and see if the best resume is chosen.
     - If everything works, the output includes a sorted list of resume scores.

5. **Commit & Push**
     ```bash
     git add .
     git commit -m "feat: resume scoring system"
     git push origin main
     ```

**End of Day 3:**
You now have a functional pipeline for job description parsing → keyword extraction → resume scoring → best resume selection.

## Day 4: Resume Customization with OpenAI

### Tasks

1. **Customization API Route**
     - Create `pages/api/customizeResume.js`:
         ```js
         import fs from 'fs';
         import path from 'path';
         import openai from '../../lib/openaiClient';

         export default async function handler(req, res) {
             const { resumeFile, keywords, jobDescription } = req.body;
             if (!resumeFile || !keywords || !jobDescription) {
                 return res.status(400).json({ error: 'Missing resumeFile, keywords or jobDescription.' });
             }

             try {
                 const resumePath = path.join(process.cwd(), 'resumes', resumeFile);
                 let resumeContent = fs.readFileSync(resumePath, 'utf8');

                 const prompt = `
                     You are an expert resume writer. 
                     The user has this resume content (LaTeX format below):
                     
                     """ 
                     ${resumeContent}
                     """

                     The user is applying to a job with this description:
                     """
                     ${jobDescription}
                     """

                     The extracted keywords/skills are: ${JSON.stringify(keywords)}.

                     Please suggest changes to the bullet points or experience sections that incorporate these keywords 
                     in a concise manner, while keeping the resume to ONE page. Output your suggestions in a structured 
                     JSON format, for example:
                     {
                         "edits": [
                             {
                                 "originalBullet": "...",
                                 "suggestedBullet": "..."
                             }
                         ]
                     }
                 `;

                 const response = await openai.createChatCompletion({
                     model: 'gpt-3.5-turbo',
                     messages: [
                         { role: 'system', content: 'You are a helpful assistant.' },
                         { role: 'user', content: prompt },
                     ],
                     temperature: 0.7,
                 });

                 const content = response.data.choices[0].message.content;

                 let suggestions;
                 try {
                     suggestions = JSON.parse(content);
                 } catch (err) {
                     suggestions = { error: "Couldn't parse suggestions as JSON.", raw: content };
                 }

                 return res.status(200).json({ suggestions });
             } catch (error) {
                 console.error(error);
                 return res.status(500).json({ error: 'Error customizing resume.' });
             }
         }
         ```

2. **Frontend Flow**
     - After scoring, show a button: “Customize Best Resume”.
     - On click, call `/api/customizeResume` with the chosen resume’s name, keywords, and original JD:
         ```js
         async function handleCustomizeResume() {
             if (!scoreResults?.bestResume?.file) return;
             const response = await fetch('/api/customizeResume', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     resumeFile: scoreResults.bestResume.file,
                     keywords: parsedData.keywords,
                     jobDescription: jobDesc,
                 }),
             });
             const data = await response.json();
             setCustomizationSuggestions(data.suggestions);
         }
         ```

3. **Display & Approve Suggestions**
     - In your UI, render the `suggestions.edits` in a table or list.
     - Let the user see each "originalBullet" vs. "suggestedBullet", and have a button to “Accept” or “Reject.”
     - Keep track of accepted changes in a state array.

4. **Apply Changes in .tex**
     - Once the user finalizes the changes, create a new function to apply them:
         ```js
         async function finalizeEdits(acceptedEdits) {
             const response = await fetch('/api/applyEdits', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     resumeFile: scoreResults.bestResume.file,
                     acceptedEdits,
                 }),
             });
             // ...
         }
         ```
     - The `applyEdits` route would read the .tex file, replace lines that match `originalBullet`, and insert the `suggestedBullet`.

**End of Day 4:**
You can now request bullet-point modifications from OpenAI and display them to the user, though you haven’t yet completed the final step of regenerating the PDF. That comes next!


## Day 5: PDF Generation & Finalization

### Tasks

1. **Implement LaTeX Editing (Apply Edits)**

    Create `pages/api/applyEdits.js` (or integrate into `customizeResume.js`):
    ```js
    import fs from 'fs';
    import path from 'path';

    export default async function handler(req, res) {
      const { resumeFile, acceptedEdits } = req.body;
      if (!resumeFile || !acceptedEdits) {
         return res.status(400).json({ error: 'No resumeFile or acceptedEdits provided.' });
      }

      try {
         const resumePath = path.join(process.cwd(), 'resumes', resumeFile);
         let resumeContent = fs.readFileSync(resumePath, 'utf8');

         // For each edit, do a string replace from originalBullet -> suggestedBullet
         acceptedEdits.forEach((edit) => {
            const { originalBullet, suggestedBullet } = edit;
            // This approach can be naive if there's LaTeX special characters, you may refine using a parser
            resumeContent = resumeContent.replace(originalBullet, suggestedBullet);
         });

         // Save the updated .tex file
         fs.writeFileSync(resumePath, resumeContent, 'utf8');

         // Return the updated content or a success message
         return res.status(200).json({ message: 'Edits applied successfully.' });
      } catch (error) {
         console.error(error);
         return res.status(500).json({ error: 'Error applying edits.' });
      }
    }
    ```

2. **LaTeX Compilation**

    In `/lib/latexCompiler.js`, define a function to compile the `.tex` file to PDF. You could use a library like `node-latex` or a child process with `pdflatex` installed. For example:
    ```js
    import path from 'path';
    import { spawn } from 'child_process';

    export function compileLatex(filePath) {
      return new Promise((resolve, reject) => {
         const pdflatex = spawn('pdflatex', ['-interaction=nonstopmode', filePath], {
            cwd: path.dirname(filePath),
         });

         pdflatex.on('error', (err) => reject(err));
         pdflatex.on('exit', (code) => {
            if (code === 0) {
              // PDF should be generated in the same folder
              const pdfPath = filePath.replace('.tex', '.pdf');
              resolve(pdfPath);
            } else {
              reject(new Error(`pdflatex exited with code ${code}`));
            }
         });
      });
    }
    ```

    Then in a new API route `pages/api/compilePDF.js`:
    ```js
    import path from 'path';
    import fs from 'fs';
    import { compileLatex } from '../../lib/latexCompiler';

    export default async function handler(req, res) {
      const { resumeFile } = req.body;

      if (!resumeFile) {
         return res.status(400).json({ error: 'No resumeFile provided.' });
      }

      try {
         const resumePath = path.join(process.cwd(), 'resumes', resumeFile);
         const pdfPath = await compileLatex(resumePath);

         // Read the PDF file into a buffer
         const pdfBuffer = fs.readFileSync(pdfPath);

         // Convert to base64 or just send a binary
         res.setHeader('Content-Type', 'application/pdf');
         res.status(200).send(pdfBuffer);

      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Error compiling PDF.' });
      }
    }
    ```

3. **Integrate Final Compilation Flow**

    After applying edits, you can call:
    ```js
    const response = await fetch('/api/compilePDF', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeFile: scoreResults.bestResume.file }),
    });
    const pdfBlob = await response.blob();

    // Generate a downloadable link
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    ```

    The PDF should open in a new tab for download.

4. **Test the Entire Flow**

    Paste JD → Parse → Score → Customize → Accept/Reject → Apply Edits → Compile PDF → Download. Verify it’s still one page by design.

5. **Deployment to Vercel**

    - Commit & push all changes.
    - In Vercel, create a new project linking to your GitHub repo.
    - Add environment variables (`OPENAI_API_KEY`) in the Vercel dashboard.
    - After deployment, test the live URL.

    Important: Vercel might not have a LaTeX distribution installed. You might need a Docker-based solution or a separate microservice to compile PDFs. If you face issues, consider using an external compilation API or host on a platform that supports installing TeX packages.

**End of Day 5:**
You have a fully functioning solution that can parse a JD, pick the best resume, suggest custom bullet points, apply them, and compile a final PDF, all within Next.js API routes and OpenAI.
