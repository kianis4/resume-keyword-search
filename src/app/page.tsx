"use client";

import { useState } from "react";

/**
 * HomePage component for the Resume Tailoring System.
 * 
 * This component provides a multi-step process for users to tailor their resumes based on a job description.
 * 
 * Steps:
 * 1. **Upload LaTeX Resume**: Ensure the user uploads a LaTeX copy of their resume before proceeding.
 * 2. **Paste Job Description**: Users paste the job description into a textarea.
 * 3. **Parse & Score JD**: The job description is parsed to extract keywords and score resumes based on keyword matches.
 * 4. **Load Full Experiences**: Extracts full experiences from the best-matching resume.
 * 5. **Optimize Experience**: Optimizes an entire experience by suggesting bullet point changes based on unmatched keywords.
 * 6. **Bullet-level Customization**: Users can accept or skip suggested bullet point changes for the selected experience.
 * 7. **Inject Changes into LaTeX**: Accepted changes are injected into the LaTeX resume file.
 * 8. **Generate PDF**: The updated LaTeX file is compiled into a PDF, which can be viewed and downloaded.
 * 
 * State Variables:
 * - `jobDesc`: Holds the job description input by the user.
 * - `parsedData`: Stores the parsed data from the job description.
 * - `scoreResults`: Stores the scoring results of the resumes.
 * - `loading`: Indicates if the parsing and scoring process is in progress.
 * - `extractedExperiences`: Stores the extracted experiences from the best-matching resume.
 * - `loadingExperiences`: Indicates if the experience extraction process is in progress.
 * - `experienceBulletChanges`: Stores the suggested bullet point changes for the current experience.
 * - `currentExperienceIndex`: Index of the current experience being optimized.
 * - `currentBulletChangeIndex`: Index of the current bullet point change being reviewed.
 * - `acceptedExperienceChanges`: Stores the accepted bullet point changes.
 * - `customizationFlow`: Indicates the current state of the customization flow.
 * - `updatedLatex`: Holds the updated LaTeX content after injecting changes.
 * - `chosenFilename`: Holds the filename of the chosen resume.
 * - `pdfUrl`: URL of the generated PDF for viewing and downloading.
 * 
 * Functions:
 * - `handleParseAndScore`: Parses the job description and scores resumes.
 * - `handleLoadExperiences`: Loads full experiences from the best-matching resume.
 * - `handleOptimizeExperience`: Optimizes an experience by suggesting bullet point changes.
 * - `handleAcceptBulletChange`: Accepts the current bullet point change.
 * - `handleSkipBulletChange`: Skips the current bullet point change.
 * - `moveToNextBulletChange`: Moves to the next bullet point change.
 * - `handleInjectIntoLatex`: Injects accepted changes into the LaTeX resume file.
 * 
 * UI Components:
 * - Textarea for job description input.
 * - Button to parse and score resumes.
 * - Display of parsed job description data.
 * - Display of resume scoring results.
 * - Button to load experiences.
 * - Display of extracted experiences with an option to optimize each experience.
 * - Bullet-level customization flow for the selected experience.
 * - Summary of accepted bullet changes.
 * - Display of updated LaTeX content.
 * - Display of generated PDF with an option to download.
 */
export default function HomePage() {
  const [jobDesc, setJobDesc] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [scoreResults, setScoreResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // For experience-based extraction
  const [extractedExperiences, setExtractedExperiences] = useState<any[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);

  // Customization state for experience-level bullet changes
  const [experienceChangeSets, setExperienceChangeSets] = useState<any[]>([]);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState<number | null>(null);
  const [customizationFlow, setCustomizationFlow] = useState<"idle" | "inProgress" | "completed">("idle");

  // Holds updated LaTeX from the server
  const [updatedLatex, setUpdatedLatex] = useState("");

  // Holds the chosen filename
  const [chosenFilename, setChosenFilename] = useState("devops.tex");

  // Holds the PDF URL
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // 1) Parse & Score JD
  async function handleParseAndScore() {
    setLoading(true);
    try {
      const parseResponse = await fetch("/api/parseJD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc }),
      });
      const parsed = await parseResponse.json();
      setParsedData(parsed);

      if (parsed.keywords) {
        const scoreResponse = await fetch("/api/scoreResume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords: parsed.keywords }),
        });
        const scored = await scoreResponse.json();

        // Only set scoreResults if there's an actual file
        if (!scored?.bestResume?.file) {
          alert("No resumes found. Please upload a resume before customizing.");
          setScoreResults(null);  // force reset
          return;
        } else {
          setScoreResults(scored);
        }
      }
    } catch (err) {
      console.error("Error parsing or scoring JD:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2) Load full experiences using extractBulletPoints route
  async function handleLoadExperiences() {
    if (!scoreResults?.bestResume?.file) {
      alert("No best resume file found. Please parse & score first.");
      return;
    }
    setLoadingExperiences(true);
    try {
      const file = scoreResults.bestResume.file;
      setChosenFilename(file); // Set the chosen filename based on the best resume file
      const response = await fetch(`/api/extractBulletPoints?file=${file}`);
      const data = await response.json();
      if (data.experiences && Array.isArray(data.experiences)) {
        setExtractedExperiences(data.experiences);
      } else {
        alert(data.error || "Failed to extract experiences.");
      }
    } catch (err) {
      console.error("Error extracting experiences:", err);
      alert("Failed to extract experiences from resume.");
    } finally {
      setLoadingExperiences(false);
    }
  }

  // 3) Optimize an entire experience by sending its details to updateExperience route
  async function handleOptimizeExperience(expIndex: number) {
    if (!scoreResults?.bestResume) {
      alert("No best resume found. Parse & Score first.");
      return;
    }
    const experience = extractedExperiences[expIndex];
    if (!experience) {
      alert("Experience not found.");
      return;
    }

    // Retrieve unmatchedKeywords from the best resume object
    const unmatched = scoreResults.bestResume.unmatchedKeywords || [];

    try {
      const payload = {
        jobTitle: experience.jobTitle,
        company: experience.company,
        bullets: experience.bullets,
        idealCandidateDescription: parsedData?.idealCandidateDescription || "",
        jobDescription: jobDesc,
        unmatchedKeywords: unmatched,
      };

      const response = await fetch("/api/updateExperience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
        // Update the experienceChangeSets for this specific experience
        setExperienceChangeSets(prev => {
          const updated = [...prev];
          updated[expIndex] = {
            bulletChanges: data.changes,
            currentBulletChangeIndex: 0,
            acceptedChanges: [],
            status: "inProgress" as const
          };
          return updated;
        });
        
        setCurrentExperienceIndex(expIndex);
        setCustomizationFlow("inProgress");
      } else {
        alert("No bullet changes returned for this experience.");
      }
    } catch (err) {
      console.error("Error optimizing experience:", err);
    }
  }

  // 4) Accept or Skip bullet changes for the current experience
  function handleAcceptBulletChange() {
    if (currentExperienceIndex === null) return;
    
    const expIndex = currentExperienceIndex;
    const changeSet = experienceChangeSets[expIndex];
    
    if (changeSet && changeSet.currentBulletChangeIndex < changeSet.bulletChanges.length) {
      const change = changeSet.bulletChanges[changeSet.currentBulletChangeIndex];
      setExperienceChangeSets(prev => {
        const updated = [...prev];
        updated[expIndex] = {
          ...updated[expIndex],
          acceptedChanges: [...updated[expIndex].acceptedChanges, change],
        };
        return updated;
      });
    }
    moveToNextBulletChange();
  }

  function handleSkipBulletChange() {
    moveToNextBulletChange();
  }

  function moveToNextBulletChange() {
    if (currentExperienceIndex === null) return;
    
    const expIndex = currentExperienceIndex;
    const changeSet = experienceChangeSets[expIndex];
    
    if (!changeSet) return;
    
    const newIndex = changeSet.currentBulletChangeIndex + 1;
    if (newIndex < changeSet.bulletChanges.length) {
      setExperienceChangeSets(prev => {
        const updated = [...prev];
        updated[expIndex] = {
          ...updated[expIndex],
          currentBulletChangeIndex: newIndex,
        };
        return updated;
      });
    } else {
      setExperienceChangeSets(prev => {
        const updated = [...prev];
        updated[expIndex] = {
          ...updated[expIndex],
          status: "completed",
        };
        return updated;
      });
      setCustomizationFlow("idle"); // Return to idle state so user can optimize other experiences
    }
  }

  // 5) Inject accepted changes into LaTeX
  async function handleInjectIntoLatex() {
    try {
      // Gather all accepted changes from all experiences
      const allAcceptedChanges = experienceChangeSets.flatMap(set => 
        set?.acceptedChanges || []
      );
      
      if (allAcceptedChanges.length === 0) {
        alert("No accepted changes to inject!");
        return;
      }
      
      const response = await fetch("/api/customizeResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          acceptedChanges: allAcceptedChanges, 
          filename: chosenFilename 
        }),
      });
      
      // Rest of the function remains the same
      const data = await response.json();
      
      if (data.error) {
        alert("Failed to inject changes: " + data.error);
      } else if (data.updatedTex) {
        setUpdatedLatex(data.updatedTex);
        
        const updatedFileName = data.updatedFileName;
        
        const pdfResponse = await fetch(`/api/compilePDF?filename=${updatedFileName}`);
        
        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.blob();
          const pdfUrl = URL.createObjectURL(pdfBlob);
          setPdfUrl(pdfUrl);
        } else {
          console.error('Failed to fetch PDF:', await pdfResponse.text());
          alert('Failed to generate PDF. Check console for details.');
        }
      } else {
        alert("No updatedTex returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Error injecting changes to LaTeX.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Resume Tailoring System - Extract Full Experiences
        </h1>
        <div className="bg-yellow-100 p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Instructions</h2>
          <ol className="list-decimal list-inside ml-4 text-gray-800">
            <li className="mb-2">Upload a LaTeX copy of your resume before proceeding.</li>
            <li className="mb-2">Paste the job description into the provided textarea.</li>
            <li className="mb-2">Click the "Parse & Score Resumes" button to analyze the job description and score your resumes.</li>
            <li className="mb-2">Review the parsed job description data and resume scoring results.</li>
            <li className="mb-2">Click "Load Experiences" to extract full experiences from the best-matching resume.</li>
            <li className="mb-2">Optimize each experience by clicking the "Optimize This Experience" button.</li>
            <li className="mb-2">Accept or skip suggested bullet point changes for the selected experience.</li>
            <li className="mb-2">Inject accepted changes into the LaTeX resume file by clicking "Inject Into LaTeX".</li>
            <li className="mb-2">View and download the generated PDF of your updated resume.</li>
          </ol>
        </div>

        {/* Step A: Paste JD + Parse/Score */}
        <label className="block text-white font-semibold mb-2">
          Paste Job Description:
        </label>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300"
          placeholder="Enter or paste the job description here..."
        />
        <button
          onClick={handleParseAndScore}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Parsing & Scoring..." : "Parse & Score Resumes"}
        </button>

        {/* Display Parsed JD */}
        {parsedData && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Parsed Data</h2>
            <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto whitespace-pre-wrap break-words">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Keywords:</h3>
                <ul className="list-disc list-inside ml-4">
                  {parsedData.keywords.map((keyword: string, index: number) => (
                    <li key={index} className="text-sm text-gray-900">{keyword}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold text-gray-800 mt-4">Ideal Candidate Description:</h3>
                <p className="text-sm text-gray-900">{parsedData.idealCandidateDescription}</p>
              </div>
            </pre>
          </div>
        )}

        {/* Step B: Show Scoring Results */}
        {scoreResults && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Resume Scoring Results</h2>
            <p className="mb-2 text-gray-800">
              <strong>Best Resume:</strong> {scoreResults.bestResume.file} (
              {scoreResults.bestResume.scorePercent}% match)
            </p>
            <h3 className="font-semibold text-gray-800">All Scores</h3>
            <div className="space-y-4">
              {scoreResults.allScores.map((result: any, index: number) => (
                <div key={index} className="bg-gray-100 p-4 rounded shadow">
                  <h3 className="text-lg font-semibold text-gray-800">File: {result.file}</h3>
                  <p className="text-gray-800">
                    <strong>Match Count:</strong> {result.matchCount} / {result.totalKeywords}
                  </p>
                  <p className="text-gray-800">
                    <strong>Score Percent:</strong> {result.scorePercent}%
                  </p>
                  <div className="mt-2">
                    <h4 className="text-md font-semibold text-gray-800">Matched Keywords:</h4>
                    <ul className="list-disc list-inside ml-4">
                      {result.matchedKeywords.map((keyword: string, i: number) => (
                        <li key={i} className="text-sm text-gray-800">{keyword}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-md font-semibold text-gray-800">Unmatched Keywords:</h4>
                    <ul className="list-disc list-inside ml-4">
                      {result.unmatchedKeywords.map((keyword: string, i: number) => (
                        <li key={i} className="text-sm text-gray-800">{keyword}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-md font-semibold text-gray-800">Recommendation:</h4>
                    <p className="text-sm text-gray-800">{result.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleLoadExperiences}
              disabled={!scoreResults || !scoreResults.bestResume}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {loadingExperiences ? "Loading Experiences..." : "Load Experiences"}
            </button>
          </div>
        )}

        {/* Step C: Display Extracted Experiences with Optimize button */}
        {extractedExperiences.length > 0 && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Experiences</h2>
            {extractedExperiences.map((exp, expIndex) => (
              <div key={expIndex} className="mb-6 border-b border-gray-300 pb-2">
                <p className="text-md text-gray-800 mb-1">
                  <strong>Job Title:</strong> {exp.jobTitle || "N/A"}
                </p>
                <p className="text-md text-gray-800 mb-1">
                  <strong>Company:</strong> {exp.company || "N/A"}
                </p>
                <p className="text-md text-gray-800 mb-1">
                  <strong>Dates:</strong> {exp.dateRange || "N/A"}
                </p>
                <p className="text-md text-gray-800 mb-1">
                  <strong>Location:</strong> {exp.location || "N/A"}
                </p>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {exp.bullets.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-gray-800 mb-1">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {/* Show "Optimize This Experience" button only if not already optimized or in progress */}
                <button
                  className={`mt-2 px-3 py-1 ${
                    experienceChangeSets[expIndex]?.status === "completed" 
                      ? "bg-gray-500" 
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded`}
                  onClick={() => handleOptimizeExperience(expIndex)}
                  disabled={experienceChangeSets[expIndex]?.status === "completed"}
                >
                  {experienceChangeSets[expIndex]?.status === "completed" 
                    ? "Optimization Completed" 
                    : "Optimize This Experience"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step D: Bullet-level customization flow for the selected experience */}
        {customizationFlow === "inProgress" && currentExperienceIndex !== null && experienceChangeSets[currentExperienceIndex] && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bullet Suggestions for Experience #{currentExperienceIndex + 1}
            </h2>
            <p className="text-gray-800 mb-2">
              Reviewing suggestion {experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex + 1} of {experienceChangeSets[currentExperienceIndex].bulletChanges.length}
            </p>
            <div className="mb-4">
              <p className="text-gray-800 font-semibold">Original Bullet:</p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                {experienceChangeSets[currentExperienceIndex].bulletChanges[experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex].originalBullet}
              </pre>
              <p className="text-gray-800 font-semibold mt-2">Proposed New Bullet:</p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                {experienceChangeSets[currentExperienceIndex].bulletChanges[experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex].newBullet}
              </pre>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAcceptBulletChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept
              </button>
              <button
                onClick={handleSkipBulletChange}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Add a summary section that shows all accepted changes and inject button */}
        {experienceChangeSets.some(set => set?.acceptedChanges?.length > 0) && customizationFlow !== "inProgress" && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Accepted Changes Summary</h2>
            
            {experienceChangeSets.map((set, expIndex) => (
              set?.acceptedChanges?.length > 0 && (
                <div key={expIndex} className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Experience #{expIndex + 1}</h3>
                  <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                    <ul className="list-disc list-inside ml-4">
                      {set.acceptedChanges.map((change, index) => (
                        <li key={index} className="text-sm text-gray-900 mb-2">
                          <p><strong>Original:</strong> {change.originalBullet}</p>
                          <p><strong>New:</strong> {change.newBullet}</p>
                        </li>
                      ))}
                    </ul>
                  </pre>
                </div>
              )
            ))}
            
            <button
              onClick={handleInjectIntoLatex}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Inject All Changes Into LaTeX
            </button>
          </div>
        )}

        {/* Step E: Final accepted changes summary */}
        {customizationFlow === "completed" && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Customization Flow Completed</h2>
            {experienceChangeSets.flatMap(set => set?.acceptedChanges || []).length > 0 ? (
              <>
                <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                  <div className="mt-4"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Accepted Bullet Changes:</h3>
                  <ul className="list-disc list-inside ml-4">
                    {experienceChangeSets.flatMap(set => set?.acceptedChanges || []).map((change, index) => (
                      <li key={index} className="text-sm text-gray-900 mb-2">
                        <p><strong>Original Bullet:</strong> {change.originalBullet}</p>
                        <p><strong>New Bullet:</strong> {change.newBullet}</p>
                      </li>
                    ))}
                  </ul>
                </pre>
                <p className="text-gray-800 mt-2">
                  Integrate these accepted bullet changes or click below to inject them into your LaTeX file:
                </p>
                <button
                  onClick={handleInjectIntoLatex}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Inject Into LaTeX
                </button>
              </>
            ) : (
              <p className="text-gray-800">No bullet changes were accepted.</p>
            )}
          </div>
        )}

        {/* Step F: Display updated LaTeX */}
        {updatedLatex && (
          <div className="mt-8 bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Updated .tex content</h2>
            <pre className="text-xs text-gray-800 bg-white p-4 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
              {updatedLatex}
            </pre>
          </div>
        )}

        {/* Step G: Display generated PDF */}
        {pdfUrl && (
          <div className="mt-8 bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Generated PDF</h2>
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              className="border border-gray-300 rounded"
              title="Resume PDF"
            ></iframe>
            <div className="mt-4">
              <a 
                href={pdfUrl} 
                download={`resume_${Date.now()}.pdf`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}