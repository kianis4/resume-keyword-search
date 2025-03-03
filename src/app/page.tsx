"use client";

import { useState } from "react";

export default function HomePage() {
  const [jobDesc, setJobDesc] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [scoreResults, setScoreResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // For experience-based extraction
  const [extractedExperiences, setExtractedExperiences] = useState<any[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);

  // Customization state for experience-level bullet changes
  const [experienceBulletChanges, setExperienceBulletChanges] = useState<any[]>([]);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState<number | null>(null);
  const [currentBulletChangeIndex, setCurrentBulletChangeIndex] = useState(0);
  const [acceptedExperienceChanges, setAcceptedExperienceChanges] = useState<any[]>([]);
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
        setScoreResults(scored);
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
        unmatchedKeywords: unmatched,  // Pass unmatched keywords here
      };

      const response = await fetch("/api/updateExperience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
        setExperienceBulletChanges(data.changes);
        setCurrentBulletChangeIndex(0);
        setAcceptedExperienceChanges([]);
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
    if (currentBulletChangeIndex < experienceBulletChanges.length) {
      const change = experienceBulletChanges[currentBulletChangeIndex];
      setAcceptedExperienceChanges((prev) => [...prev, change]);
    }
    moveToNextBulletChange();
  }

  function handleSkipBulletChange() {
    moveToNextBulletChange();
  }

  function moveToNextBulletChange() {
    const newIndex = currentBulletChangeIndex + 1;
    if (newIndex < experienceBulletChanges.length) {
      setCurrentBulletChangeIndex(newIndex);
    } else {
      setCustomizationFlow("completed");
    }
  }

  // 5) Inject accepted changes into LaTeX
  async function handleInjectIntoLatex() {
    try {
      if (acceptedExperienceChanges.length === 0) {
        alert("No accepted changes to inject!");
        return;
      }
      
      const response = await fetch("/api/customizeResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          acceptedChanges: acceptedExperienceChanges, 
          filename: chosenFilename 
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert("Failed to inject changes: " + data.error);
      } else if (data.updatedTex) {
        setUpdatedLatex(data.updatedTex);
        
        // Store the updated filename - fix the property name to match what's returned from the API
        const updatedFileName = data.updatedFileName;  // Changed from updatedFilename to updatedFileName
        
        // Fetch the generated PDF using the updated filename
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
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={loadingExperiences}
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
                <button
                  className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => handleOptimizeExperience(expIndex)}
                >
                  Optimize This Experience
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step D: Bullet-level customization flow for the selected experience */}
        {customizationFlow === "inProgress" && experienceBulletChanges.length > 0 && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bullet Suggestions for Experience #{currentExperienceIndex! + 1}
            </h2>
            <p className="text-gray-800 mb-2">
              Reviewing suggestion {currentBulletChangeIndex + 1} of {experienceBulletChanges.length}
            </p>
            <div className="mb-4">
              <p className="text-gray-800 font-semibold">Original Bullet:</p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                {experienceBulletChanges[currentBulletChangeIndex].originalBullet}
              </pre>
              <p className="text-gray-800 font-semibold mt-2">Proposed New Bullet:</p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                {experienceBulletChanges[currentBulletChangeIndex].newBullet}
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

        {/* Step E: Final accepted changes summary */}
        {customizationFlow === "completed" && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Customization Flow Completed</h2>
            {acceptedExperienceChanges.length > 0 ? (
              <>
                <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                  <div className="mt-4"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Accepted Bullet Changes:</h3>
                  <ul className="list-disc list-inside ml-4">
                    {acceptedExperienceChanges.map((change, index) => (
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