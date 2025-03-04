"use client";

import { useState, useEffect } from "react";

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

  // Add these new state variables instead
  const [newFileName, setNewFileName] = useState("");
  const [extractedCompany, setExtractedCompany] = useState("");
  const [extractedPosition, setExtractedPosition] = useState("");

  // Add these new state variables for skills section
  const [currentSkills, setCurrentSkills] = useState<any>(null);
  const [optimizedSkills, setOptimizedSkills] = useState<any>(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillsOptimized, setSkillsOptimized] = useState(false);
  const [acceptedSkills, setAcceptedSkills] = useState<any>(null);

  // Add this new state variable
  const [skillsAccepted, setSkillsAccepted] = useState(false);

  // Add these new state variables at the top with other state variables
  const [originalScore, setOriginalScore] = useState<any>(null);
  const [newScore, setNewScore] = useState<any>(null);
  const [improvementPercent, setImprovementPercent] = useState<number | null>(null);

  // Add this new state variable for tracking the selected resume
  const [selectedResumeFile, setSelectedResumeFile] = useState<string | null>(null);

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

      // Extract company and position from job description
      const jobLines = jobDesc.split('\n');
      let company = "";
      let position = "";
      
      // Simple extraction logic - could be enhanced
      for (const line of jobLines) {
        if (line.toLowerCase().includes('company:')) {
          company = line.split(':')[1]?.trim() || "";
        }
        if (line.toLowerCase().includes('position:') || 
            line.toLowerCase().includes('job title:') ||
            line.toLowerCase().includes('role:')) {
          position = line.split(':')[1]?.trim() || "";
        }
        
        // Try to extract from the first line if it looks like a job title
        if (!position && line.length < 100 && !line.includes(':')) {
          position = line.trim();
        }
      }

      setExtractedCompany(company || "Company");
      setExtractedPosition(position || "Position");

      // Rest of your existing code
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
    if (!selectedResumeFile) {
      alert("Please select a resume first.");
      return;
    }
    
    setLoadingExperiences(true);
    try {
      setChosenFilename(selectedResumeFile); // Use the selected filename
      const response = await fetch(`/api/extractBulletPoints?file=${selectedResumeFile}`);
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
    if (!selectedResumeFile) {
      alert("No resume selected. Please select a resume first.");
      return;
    }
    
    const experience = extractedExperiences[expIndex];
    if (!experience) {
      alert("Experience not found.");
      return;
    }

    // Find the selected resume's data from scoreResults
    const selectedResumeData = scoreResults.allScores.find(
      (score: any) => score.file === selectedResumeFile
    );
    
    if (!selectedResumeData) {
      alert("Selected resume data not found.");
      return;
    }

    // Retrieve unmatchedKeywords from the selected resume object
    const unmatched = selectedResumeData.unmatchedKeywords || [];

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

  // Update handleInjectIntoLatex to show the modal
  async function handleInjectIntoLatex() {
    try {
      const allAcceptedChanges = experienceChangeSets.flatMap(set => 
        set?.acceptedChanges || []
      );
      
      if (allAcceptedChanges.length === 0 && !acceptedSkills) {
        alert("No changes to inject! Please accept experience or skills changes.");
        return;
      }
      
      if (!newFileName) {
        alert("Filename cannot be empty!");
        return;
      }
      
      // Store the original score before making changes
      if (scoreResults?.bestResume) {
        setOriginalScore({
          matchCount: scoreResults.bestResume.matchCount,
          totalKeywords: scoreResults.bestResume.totalKeywords,
          scorePercent: scoreResults.bestResume.scorePercent,
          matchedKeywords: scoreResults.bestResume.matchedKeywords,
          unmatchedKeywords: scoreResults.bestResume.unmatchedKeywords
        });
      }
      
      const response = await fetch("/api/customizeResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          acceptedChanges: allAcceptedChanges, 
          acceptedSkills: acceptedSkills, // Add this new parameter
          filename: chosenFilename,
          newFileName: newFileName.endsWith('.tex') ? newFileName : `${newFileName}.tex`
        }),
      });
      
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
          
          // Score the new resume with the existing scoreResume endpoint
          if (parsedData?.keywords) {
            try {
              // Call the same endpoint we used initially
              const scoreResponse = await fetch("/api/scoreResume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keywords: parsedData.keywords }),
              });
              
              const scoreData = await scoreResponse.json();
              
              // Find the score for our new file
              const newFileScore = scoreData.allScores.find((score: any) => 
                score.file === updatedFileName
              );
              
              if (newFileScore) {
                setNewScore(newFileScore);
                
                // Calculate improvement percentage
                const improvement = newFileScore.scorePercent - (originalScore?.scorePercent || 0);
                setImprovementPercent(improvement);
              }
            } catch (scoreErr) {
              console.error("Error scoring updated resume:", scoreErr);
            }
          }
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

  // Function to load skills
  async function handleLoadSkills() {
    if (!scoreResults?.bestResume?.file) {
      alert("No best resume file found. Please parse & score first.");
      return;
    }
    setLoadingSkills(true);
    try {
      const file = scoreResults.bestResume.file;
      const response = await fetch(`/api/extractSkills?file=${file}`);
      const data = await response.json();
      if (data.skills) {
        setCurrentSkills(data.skills);
      } else {
        alert(data.error || "Failed to extract skills.");
      }
    } catch (err) {
      console.error("Error extracting skills:", err);
      alert("Failed to extract skills from resume.");
    } finally {
      setLoadingSkills(false);
    }
  }

  // Function to optimize skills
  async function handleOptimizeSkills() {
    if (!currentSkills || !scoreResults?.bestResume) {
      alert("Current skills or best resume not found. Please load skills first.");
      return;
    }
    setLoadingSkills(true);
    try {
      const unmatched = scoreResults.bestResume.unmatchedKeywords || [];
      
      const response = await fetch("/api/optimizeSkills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSkills,
          jobDescription: jobDesc,
          unmatchedKeywords: unmatched
        }),
      });
      
      const data = await response.json();
      if (data.optimizedSkills) {
        setOptimizedSkills(data.optimizedSkills);
        setSkillsOptimized(true);
      } else {
        alert(data.error || "Failed to optimize skills.");
      }
    } catch (err) {
      console.error("Error optimizing skills:", err);
      alert("Failed to optimize skills.");
    } finally {
      setLoadingSkills(false);
    }
  }

  // Function to accept optimized skills
  function handleAcceptSkills() {
    if (!optimizedSkills) return;
    setAcceptedSkills(optimizedSkills);
    setSkillsAccepted(true); // Add this line
  }

  useEffect(() => {
    // code here
  }, [extractedCompany, extractedPosition]);

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
            <h3 className="font-semibold text-gray-800 mb-3">Top 3 Resumes</h3>
            
            {/* Filter and display only top 3 resumes */}
            <div className="space-y-4">
              {scoreResults.allScores
                .sort((a: any, b: any) => b.scorePercent - a.scorePercent)
                .slice(0, 3)
                .map((result: any, index: number) => (
                  <div key={index} className="bg-gray-100 p-4 rounded shadow">
                    {/* Add a radio button for selection */}
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`resume-${index}`}
                        name="selectedResume"
                        value={result.file}
                        checked={selectedResumeFile === result.file}
                        onChange={(e) => setSelectedResumeFile(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor={`resume-${index}`} className="text-lg font-semibold text-gray-800 cursor-pointer">
                        File: {result.file}
                      </label>
                    </div>
                    
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
                ))
              }
            </div>
            
            {/* Update the load experiences button to be disabled unless a resume is selected */}
            <button
              onClick={handleLoadExperiences}
              disabled={!selectedResumeFile}
              className={`mt-4 px-4 py-2 ${
                selectedResumeFile 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-gray-400 cursor-not-allowed"
              } text-white rounded transition-colors`}
            >
              {loadingExperiences ? "Loading Experiences..." : "Load Experiences"}
            </button>
            {!selectedResumeFile && (
              <p className="mt-2 text-amber-600 text-sm">
                Please select one of the resumes above to proceed.
              </p>
            )}
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

        {/* Skills Optimization Section */}
        {scoreResults && !currentSkills && experienceChangeSets.some(set => set?.status === "completed") && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Skills Optimization</h2>
            <p className="text-gray-800 mb-4">
              Now that you've optimized the experience section, let's optimize your skills section based on the job description.
            </p>
            <button
              onClick={handleLoadSkills}
              disabled={loadingSkills}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loadingSkills ? "Loading Skills..." : "Load Skills Section"}
            </button>
          </div>
        )}

        {/* Display Current Skills */}
        {currentSkills && !skillsOptimized && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Skills</h2>
            
            {currentSkills.categories.map((category: any, index: number) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{category.name}:</h3>
                <p className="text-gray-800">{category.skills.join(", ")}</p>
              </div>
            ))}
            
            <button
              onClick={handleOptimizeSkills}
              disabled={loadingSkills}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loadingSkills ? "Optimizing Skills..." : "Optimize Skills For Job"}
            </button>
          </div>
        )}

        {/* Display Optimized Skills */}
        {optimizedSkills && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Optimized Skills</h2>
            
            {optimizedSkills.categories.map((category: any, index: number) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{category.name}:</h3>
                <p className="text-gray-800">{category.skills.join(", ")}</p>
              </div>
            ))}
            
            <button
              onClick={handleAcceptSkills}
              disabled={skillsAccepted}
              className={`mt-4 px-4 py-2 ${
                skillsAccepted 
                  ? "bg-gray-500" 
                  : "bg-green-600 hover:bg-green-700"
              } text-white rounded`}
            >
              {skillsAccepted ? "Changes Accepted" : "Accept Optimized Skills"}
            </button>
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

            {/* Add this new section for accepted skills */}
            {acceptedSkills && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Skills Updates</h3>
                <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto whitespace-pre-wrap break-words">
                  {acceptedSkills.categories.map((category: any, index: number) => (
                    <div key={index} className="mb-2">
                      <strong>{category.name}:</strong> {category.skills.join(", ")}
                    </div>
                  ))}
                </pre>
              </div>
            )}
            
            <div className="mt-4 flex flex-col md:flex-row gap-2">
              <div className="flex-grow">
                <label className="block text-gray-800 font-semibold mb-1">
                  Save Resume As:
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300 text-gray-900"
                  placeholder="company_position"
                />
                <p className="text-xs text-gray-600 mt-1">
                  .tex extension will be added automatically
                </p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleInjectIntoLatex}
                  disabled={!acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")}
                  className={`px-4 py-2 ${
                    !acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white rounded h-10 whitespace-nowrap`}
                >
                  {!acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")
                    ? "Optimize Skills First" 
                    : "Inject All Changes Into LaTeX"
                  }
                </button>
              </div>
            </div>
            {!acceptedSkills && experienceChangeSets.some(set => set?.status === "completed") && (
              <p className="text-xs text-orange-600 mt-1">
                Please optimize and accept skills changes before injecting into LaTeX
              </p>
            )}
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

        {/* Add this right after the PDF viewer section, before the final closing divs */}
        {pdfUrl && originalScore && newScore && (
          <div className="mt-8 bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resume Score Improvement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Original Resume</h3>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${originalScore.scorePercent}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold">{originalScore.scorePercent}%</span>
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Keywords matched:</span> {originalScore.matchCount} of {originalScore.totalKeywords}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimized Resume</h3>
                <div className="flex items-center mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                    <div 
                      className="bg-green-600 h-4 rounded-full" 
                      style={{ width: `${newScore.scorePercent}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold">{newScore.scorePercent}%</span>
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Keywords matched:</span> {newScore.matchCount} of {newScore.totalKeywords}
                </p>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Improvement: 
                <span className={`ml-2 ${improvementPercent > 0 ? 'text-green-600' : improvementPercent < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {improvementPercent > 0 ? '+' : ''}{improvementPercent}%
                </span>
              </h3>
              
              {newScore.matchedKeywords.length > originalScore.matchedKeywords.length && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-800">Newly Matched Keywords:</h4>
                  <ul className="mt-1 list-disc list-inside">
                    {newScore.matchedKeywords
                      .filter(kw => !originalScore.matchedKeywords.includes(kw))
                      .map((keyword, idx) => (
                        <li key={idx} className="text-green-700">{keyword}</li>
                      ))}
                  </ul>
                </div>
              )}
              
              {newScore.unmatchedKeywords.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-800">Still Unmatched Keywords:</h4>
                  <ul className="mt-1 list-disc list-inside">
                    {newScore.unmatchedKeywords.map((keyword, idx) => (
                      <li key={idx} className="text-gray-700">{keyword}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}