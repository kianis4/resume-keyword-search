"use client";

import { useState, useEffect } from "react";

/**
 * CustomizePage component for the Resume Tailoring System.
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
export default function CustomizePage() {
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">
              SKomp<span className="text-blue-500">X</span>cel <span className="font-light">Calibrate</span>
            </h1>
          </div>
          <div className="mt-4 md:mt-0">
            <a href="/gallery" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
              Resume Gallery
            </a>
          </div>
        </header>
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg mb-8 transform transition-all hover:shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </h2>
          <ol className="list-decimal list-inside ml-4 text-gray-300 space-y-2">
            <li>Upload a LaTeX copy of your resume before proceeding.</li>
            <li>Paste the job description in the field below.</li>
            <li>Click the "Parse & Score Resumes" button to analyze the job description and score your resumes.</li>
            <li>Review the parsed job description data and resume scoring results.</li>
            <li>Click "Load Experiences" to extract full experiences from the best-matching resume.</li>
            <li>Optimize each experience by clicking the "Optimize This Experience" button.</li>
            <li>Accept or skip suggested bullet point changes for the selected experience.</li>
            <li>Inject accepted changes into the LaTeX resume file by clicking "Inject Into LaTeX".</li>
            <li>View and download the generated PDF of your updated resume.</li>
          </ol>
        </div>

        {/* Add a progress indicator at the top */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${parsedData ? 'bg-blue-500' : 'bg-gray-700'} text-white font-medium`}>1</div>
              <div className="ml-2 text-white">Parse Job</div>
            </div>
            <div className={`flex-grow border-t mx-4 ${extractedExperiences.length > 0 ? 'border-blue-500' : 'border-gray-700'}`}></div>
            <div className="flex items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${extractedExperiences.length > 0 ? 'bg-blue-500' : 'bg-gray-700'} text-white font-medium`}>2</div>
              <div className="ml-2 text-white">Optimize</div>
            </div>
            <div className={`flex-grow border-t mx-4 ${pdfUrl ? 'border-blue-500' : 'border-gray-700'}`}></div>
            <div className="flex items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${pdfUrl ? 'bg-blue-500' : 'bg-gray-700'} text-white font-medium`}>3</div>
              <div className="ml-2 text-white">Generate</div>
            </div>
          </div>
        </div>

        {/* Step A: Paste JD + Parse/Score with improved styling */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg mb-8">
          <label className="block text-white font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Job Description
          </label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            rows={8}
            className="w-full p-4 bg-gray-900 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter or paste the job description here..."
          />
          <button
            onClick={handleParseAndScore}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Analyze Job & Score Resumes
              </>
            )}
          </button>
        </div>

        {/* Update the Parsed Data section styling */}
        {parsedData && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Parsed Job Data
            </h2>
            <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {parsedData.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-900/40 border border-blue-700/50 rounded-md text-blue-300 text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 bg-gray-900 border border-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Ideal Candidate Profile</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{parsedData.idealCandidateDescription}</p>
            </div>
          </div>
        )}

        {/* Step B: Show Scoring Results */}
        {/* Improve the resume selection cards */}
        {scoreResults && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Resume Match Results
            </h2>
            
            <p className="mb-4 text-gray-300">
              <span className="font-medium">Best Match:</span> {scoreResults.bestResume.file} (
              <span className="text-blue-400 font-semibold">{scoreResults.bestResume.scorePercent}%</span> match)
            </p>
            
            {/* Top 3 resumes with improved styling */}
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Select Resume to Optimize
            </h3>
            
            <div className="space-y-4">
              {scoreResults.allScores
                .sort((a: any, b: any) => b.scorePercent - a.scorePercent)
                .slice(0, 3)
                .map((result: any, index: number) => (
                  <div 
                    key={index} 
                    className={`
                      p-4 rounded-lg border transition-all cursor-pointer transform hover:scale-[1.01]
                      ${selectedResumeFile === result.file 
                        ? 'bg-blue-900/30 border-blue-500 shadow-md shadow-blue-900/20' 
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'}
                    `}
                    onClick={() => setSelectedResumeFile(result.file)}
                  >
                    <div className="flex items-center mb-3">
                      <input
                        type="radio"
                        id={`resume-${index}`}
                        name="selectedResume"
                        value={result.file}
                        checked={selectedResumeFile === result.file}
                        onChange={(e) => setSelectedResumeFile(e.target.value)}
                        className="mr-2 h-4 w-4 accent-blue-500"
                      />
                      <label htmlFor={`resume-${index}`} className="text-lg font-semibold text-gray-200 cursor-pointer truncate">
                        {result.file}
                      </label>
                      <span className="ml-auto px-2 py-1 bg-gray-800 rounded text-blue-400 font-semibold text-sm">
                        {result.scorePercent}%
                      </span>
                    </div>
                    
                    {/* Keyword match indicator */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{result.matchCount} of {result.totalKeywords} keywords</span>
                        <span>{result.scorePercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${result.scorePercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Matched keywords */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        <svg className="w-4 h-4 mr-1 inline text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Matched Keywords:
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {result.matchedKeywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-green-900/30 border border-green-700/50 rounded-md text-green-400 text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Unmatched keywords */}
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        <svg className="w-4 h-4 mr-1 inline text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Missing Keywords:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.unmatchedKeywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-amber-900/20 border border-amber-700/40 rounded-md text-amber-300 text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Resume recommendation */}
                    {result.recommendation && (
                      <div className="mt-3 text-xs text-gray-400 italic border-t border-gray-700 pt-2">
                        <span className="font-medium">Recommendation:</span> {result.recommendation}
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
            
            <button
              onClick={handleLoadExperiences}
              disabled={!selectedResumeFile}
              className={`
                mt-6 px-6 py-3 rounded-md transition-all flex items-center justify-center
                ${selectedResumeFile 
                  ? "bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]" 
                  : "bg-gray-700 cursor-not-allowed"}
                text-white
              `}
            >
              {loadingExperiences ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Resume...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Load Resume Content
                </>
              )}
            </button>
          </div>
        )}

        {/* Update the Extracted Experiences section styling */}
        {extractedExperiences.length > 0 && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Resume Experience Entries
            </h2>
            
            {extractedExperiences.map((exp, expIndex) => (
              <div key={expIndex} className="mb-6 bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-200">{exp.jobTitle || "N/A"}</h3>
                    <h4 className="text-md font-medium text-gray-300">{exp.company || "N/A"}</h4>
                    <div className="flex mt-1 text-sm text-gray-400">
                      <span>{exp.dateRange || "N/A"}</span>
                      {exp.location && <span className="ml-3">{exp.location}</span>}
                    </div>
                  </div>
                  
                  <div>
                    <button
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        experienceChangeSets[expIndex]?.status === "completed" 
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                          : "bg-green-700 hover:bg-green-600 text-white"
                      }`}
                      onClick={() => handleOptimizeExperience(expIndex)}
                      disabled={experienceChangeSets[expIndex]?.status === "completed"}
                    >
                      {experienceChangeSets[expIndex]?.status === "completed" 
                        ? "Optimization Completed" 
                        : "Optimize Experience"}
                    </button>
                  </div>
                </div>
                
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1 list-disc list-inside ml-2">
                    {exp.bullets.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step D: Bullet-level customization flow for the selected experience */}
        {customizationFlow === "inProgress" && currentExperienceIndex !== null && experienceChangeSets[currentExperienceIndex] && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Bullet Suggestions
            </h2>
            <p className="text-gray-300 mb-4">
              Experience #{currentExperienceIndex + 1}: Reviewing suggestion {experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex + 1} of {experienceChangeSets[currentExperienceIndex].bulletChanges.length}
            </p>
            
            <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-4">
              <p className="text-gray-300 font-semibold mb-2">Original Bullet:</p>
              <div className="bg-gray-800 border border-gray-600 p-3 rounded text-gray-400 mb-4">
                {experienceChangeSets[currentExperienceIndex].bulletChanges[experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex].originalBullet}
              </div>
              
              <p className="text-gray-300 font-semibold mb-2">Proposed New Bullet:</p>
              <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded text-blue-300">
                {experienceChangeSets[currentExperienceIndex].bulletChanges[experienceChangeSets[currentExperienceIndex].currentBulletChangeIndex].newBullet}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleAcceptBulletChange}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all transform hover:scale-[1.02] flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </button>
              <button
                onClick={handleSkipBulletChange}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-all flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Skills Optimization Section */}
        {scoreResults && !currentSkills && experienceChangeSets.some(set => set?.status === "completed") && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Skills Optimization
            </h2>
            <p className="text-gray-300 mb-4">
              Now that you've optimized the experience section, let's optimize your skills section based on the job description.
            </p>
            <button
              onClick={handleLoadSkills}
              disabled={loadingSkills}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all transform hover:scale-[1.02] flex items-center"
            >
              {loadingSkills ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Skills...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Load Skills Section
                </>
              )}
            </button>
          </div>
        )}

        {/* Update the Current Skills section styling */}
        {currentSkills && !skillsOptimized && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Current Skills
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSkills.categories.map((category: any, index: number) => (
                <div key={index} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleOptimizeSkills}
              disabled={loadingSkills}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-[1.02] flex items-center"
            >
              {loadingSkills ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing Skills...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Optimize Skills For Job
                </>
              )}
            </button>
          </div>
        )}

        {/* Update the Optimized Skills section styling */}
        {optimizedSkills && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Optimized Skills
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optimizedSkills.categories.map((category: any, index: number) => (
                <div key={index} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleAcceptSkills}
              disabled={skillsAccepted}
              className={`mt-6 px-4 py-2 rounded ${
                skillsAccepted 
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-[1.02]"
              } flex items-center justify-center`}
            >
              {skillsAccepted ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changes Accepted
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accept Optimized Skills
                </>
              )}
            </button>
          </div>
        )}

        {/* Add a summary section that shows all accepted changes and inject button */}
        {/* Update the Accepted Changes Summary section styling */}
        {experienceChangeSets.some(set => set?.acceptedChanges?.length > 0) && customizationFlow !== "inProgress" && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Accepted Changes Summary
            </h2>
            
            {experienceChangeSets.map((set, expIndex) => (
              set?.acceptedChanges?.length > 0 && (
                <div key={expIndex} className="mb-4 bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Experience #{expIndex + 1}</h3>
                  <div className="divide-y divide-gray-700">
                    {set.acceptedChanges.map((change, index) => (
                      <div key={index} className="py-3">
                        <p className="text-gray-400 mb-2">
                          <span className="font-medium text-gray-300">Original:</span> {change.originalBullet}
                        </p>
                        <p className="text-green-400">
                          <span className="font-medium">New:</span> {change.newBullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {/* Add this new section for accepted skills */}
            {acceptedSkills && (
              <div className="mb-4 bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Skills Updates</h3>
                {acceptedSkills.categories.map((category: any, index: number) => (
                  <div key={index} className="mb-2">
                    <strong className="text-gray-200">{category.name}:</strong> 
                    <span className="text-green-400">{category.skills.join(", ")}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-lg flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label className="block text-gray-300 font-semibold mb-1">
                  Save Resume As:
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="company_position"
                />
                <p className="text-xs text-gray-400 mt-1">
                  .tex extension will be added automatically
                </p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleInjectIntoLatex}
                  disabled={!acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")}
                  className={`px-4 py-2 rounded h-10 whitespace-nowrap ${
                    !acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")
                    ? "bg-gray-600 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 transition-all transform hover:scale-[1.02]"
                  } text-white`}
                >
                  {!acceptedSkills && experienceChangeSets.some(set => set?.status === "completed")
                    ? "Optimize Skills First" 
                    : "Inject All Changes Into LaTeX"
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step E: Final accepted changes summary */}
        {customizationFlow === "completed" && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Customization Flow Completed
            </h2>
            {experienceChangeSets.flatMap(set => set?.acceptedChanges || []).length > 0 ? (
              <>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">Accepted Bullet Changes:</h3>
                  <ul className="space-y-2">
                    {experienceChangeSets.flatMap(set => set?.acceptedChanges || []).map((change, index) => (
                      <li key={index} className="border-b border-gray-700 pb-2">
                        <p className="text-gray-400 mb-1">
                          <span className="font-medium text-gray-300">Original:</span> {change.originalBullet}
                        </p>
                        <p className="text-green-400">
                          <span className="font-medium">New:</span> {change.newBullet}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-300 mt-4">
                  Integrate these accepted bullet changes or click below to inject them into your LaTeX file:
                </p>
                <button
                  onClick={handleInjectIntoLatex}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l-4 4m4-4H4" />
                  </svg>
                  Inject Into LaTeX
                </button>
              </>
            ) : (
              <p className="text-gray-300">No bullet changes were accepted.</p>
            )}
          </div>
        )}

        {/* Step F: Display updated LaTeX */}
        {updatedLatex && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              LaTeX Source Code
            </h2>
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <pre className="text-xs text-gray-300 p-4 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                {updatedLatex}
              </pre>
            </div>
          </div>
        )}

        {/* Step G: Display generated PDF */}
        {/* Enhanced PDF viewer */}
        {pdfUrl && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Final Resume
            </h2>
            <div className="bg-white p-1 rounded-lg shadow-inner">
              <iframe
                src={pdfUrl}
                width="100%"
                height="700px"
                className="rounded"
                title="Resume PDF"
              ></iframe>
            </div>
            <div className="mt-4 flex justify-center">
              <a 
                href={pdfUrl} 
                download={`SKompXcel_Calibrated_Resume_${Date.now()}.pdf`}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Optimized Resume
              </a>
            </div>
          </div>
        )}

        {/* Score improvement section with improved visualization */}
        {pdfUrl && originalScore && newScore && (
          <div className="mt-8 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Resume Optimization Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Original Resume</h3>
                <div className="flex items-center mb-3">
                  <div className="w-full bg-gray-700 rounded-full h-4 mr-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${originalScore.scorePercent}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-blue-400 w-10 text-center">{originalScore.scorePercent}%</span>
                </div>
                <p className="text-gray-400">
                  <span className="font-semibold">Keywords matched:</span> {originalScore.matchCount} of {originalScore.totalKeywords}
                </p>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg relative overflow-hidden">
                {improvementPercent > 0 && (
                  <div className="absolute top-2 right-2 bg-green-600/20 border border-green-500 rounded-full px-2 py-0.5 text-xs font-bold text-green-400">
                    +{improvementPercent}%
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-300 mb-3">Optimized Resume</h3>
                <div className="flex items-center mb-3">
                  <div className="w-full bg-gray-700 rounded-full h-4 mr-2">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${newScore.scorePercent}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-green-400 w-10 text-center">{newScore.scorePercent}%</span>
                </div>
                <p className="text-gray-400">
                  <span className="font-semibold">Keywords matched:</span> {newScore.matchCount} of {newScore.totalKeywords}
                </p>
              </div>
            </div>
            
            {/* Keyword details section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Newly matched keywords */}
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Newly Matched Keywords
                </h3>
                {newScore.matchedKeywords && originalScore.matchedKeywords && 
                 newScore.matchedKeywords.filter(kw => !originalScore.matchedKeywords.includes(kw)).length > 0 ? (
                  <ul className="space-y-1">
                    {newScore.matchedKeywords
                      .filter(kw => !originalScore.matchedKeywords.includes(kw))
                      .map((keyword, idx) => (
                        <li key={idx} className="text-green-400 flex items-center">
                          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {keyword}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No new keywords matched</p>
                )}
              </div>
              
              {/* Still unmatched keywords */}
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Still Unmatched Keywords
                </h3>
                {newScore.unmatchedKeywords && newScore.unmatchedKeywords.length > 0 ? (
                  <ul className="space-y-1">
                    {newScore.unmatchedKeywords.map((keyword, idx) => (
                      <li key={idx} className="text-amber-300 flex items-center">
                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {keyword}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">All keywords matched! 🎉</p>
                )}
              </div>
            </div>
            
            {/* Improvement summary */}
            <div className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Improvement Summary
              </h3>
              <p className="text-gray-400">
                Your resume's keyword match score has {improvementPercent > 0 ? 'improved by' : 'changed by'} 
                <span className={`ml-1 font-bold ${improvementPercent > 0 ? 'text-green-400' : improvementPercent < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {improvementPercent > 0 ? '+' : ''}{improvementPercent}%
                </span>
              </p>
              <p className="text-gray-400 mt-1">
                {improvementPercent > 0 
                  ? `You've successfully tailored your resume to better match the job requirements.`
                  : `The changes you've made maintained your original keyword matching.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}