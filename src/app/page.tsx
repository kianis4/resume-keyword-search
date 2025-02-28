// /src/app/page.tsx
"use client";

import { useState } from "react";

export default function HomePage() {
  const [jobDesc, setJobDesc] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [scoreResults, setScoreResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ---- Customization states remain ----
  const [customizationFlow, setCustomizationFlow] = useState<"idle"|"ready"|"inProgress"|"completed">("idle");
  const [bulletSuggestions, setBulletSuggestions] = useState<any[]>([]);
  const [currentBulletIndex, setCurrentBulletIndex] = useState(0);
  const [acceptedChanges, setAcceptedChanges] = useState<any[]>([]);

  // ---- For experience-based extraction
  const [extractedExperiences, setExtractedExperiences] = useState<any[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);

  // 1) Parse & Score JD
  async function handleParseAndScore() {
    setLoading(true);
    setCustomizationFlow("idle");
    try {
      // parse JD
      const parseResponse = await fetch("/api/parseJD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc }),
      });
      const parsed = await parseResponse.json();
      setParsedData(parsed);

      // score resumes if we have keywords
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

  // 2) Load full experiences
  async function handleLoadExperiences() {
    if (!scoreResults?.bestResume?.file) {
      alert("No best resume file found. Please parse & score first.");
      return;
    }

    setLoadingExperiences(true);
    try {
      const file = scoreResults.bestResume.file;
      // GET /api/extractExperiences?file=backend.tex (for example)
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

  // 3) Customize Resume (existing logic)
  async function handleCustomizeResume() {
    if (!scoreResults?.bestResume) {
      alert("No best resume found. Parse & score first.");
      return;
    }
    setLoading(true);
    setCustomizationFlow("inProgress");

    try {
      const { file, unmatchedKeywords, matchedKeywords } = scoreResults.bestResume;
      const jobDescription = jobDesc;

      const customizeResponse = await fetch("/api/customizeResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeFile: file,
          jobDescription,
          unmatchedKeywords,
          matchedKeywords
        }),
      });
      const customizeData = await customizeResponse.json();

      if (customizeData.changes && Array.isArray(customizeData.changes)) {
        setBulletSuggestions(customizeData.changes);
        setCurrentBulletIndex(0);
        setAcceptedChanges([]);
      } else {
        alert("No bullet changes returned.");
        setCustomizationFlow("completed");
      }
    } catch (err) {
      console.error("Error customizing resume:", err);
      setCustomizationFlow("completed");
    } finally {
      setLoading(false);
    }
  }

  // 4) Accept or Skip bullet changes
  function handleAcceptChange() {
    if (currentBulletIndex < bulletSuggestions.length) {
      const acceptedChange = bulletSuggestions[currentBulletIndex];
      setAcceptedChanges((prev) => [...prev, acceptedChange]);
    }
    moveToNextBullet();
  }
  function handleSkipChange() {
    moveToNextBullet();
  }
  function moveToNextBullet() {
    const newIndex = currentBulletIndex + 1;
    if (newIndex < bulletSuggestions.length) {
      setCurrentBulletIndex(newIndex);
    } else {
      setCustomizationFlow("completed");
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Parsed Data
            </h2>
            <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </div>
        )}

        {/* Step B: Show Scoring Results */}
        {scoreResults && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Resume Scoring Results
            </h2>
            <p className="mb-2 text-gray-800">
              <strong>Best Resume:</strong> {scoreResults.bestResume.file}{" "}
              ({scoreResults.bestResume.scorePercent}% match)
            </p>
            <h3 className="font-semibold text-gray-800">All Scores</h3>
            <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
              {JSON.stringify(scoreResults.allScores, null, 2)}
            </pre>

            {/* Button: Load experiences from best resume */}
            <button
              onClick={handleLoadExperiences}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={loadingExperiences}
            >
              {loadingExperiences ? "Loading Experiences..." : "Load Experiences"}
            </button>

            {/* Button: Customize */}
            {customizationFlow === "idle" && (
              <button
                onClick={handleCustomizeResume}
                className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                Customize This Resume
              </button>
            )}
          </div>
        )}

        {/* Show Extracted Experiences */}
        {extractedExperiences.length > 0 && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Extracted Experiences
            </h2>
            {extractedExperiences.map((exp, idx) => (
              <div key={idx} className="mb-6 border-b border-gray-300 pb-2">
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
                {/* Bullet Points */}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {exp.bullets.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-gray-800 mb-1">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* The existing bullet-level customization flow */}
        {customizationFlow === "inProgress" && bulletSuggestions.length > 0 && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bullet Suggestions
            </h2>
            <p className="text-gray-800 mb-2">
              Reviewing suggestion {currentBulletIndex + 1} of {bulletSuggestions.length}
            </p>

            {/* Show current bullet suggestion */}
            <div className="mb-4">
              <p className="text-gray-800"><strong>Original Bullet:</strong></p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300">
                {bulletSuggestions[currentBulletIndex].originalBullet}
              </pre>

              <p className="text-gray-800 mt-2"><strong>Proposed New Bullet:</strong></p>
              <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300">
                {bulletSuggestions[currentBulletIndex].newBullet}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAcceptChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept
              </button>
              <button
                onClick={handleSkipChange}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Show final accepted changes */}
        {customizationFlow === "completed" && (
          <div className="mt-8 bg-gray-200 p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Customization Flow Completed
            </h2>
            {acceptedChanges.length > 0 ? (
              <>
                <p className="text-gray-800 mb-2">
                  You accepted {acceptedChanges.length} bullet changes.
                </p>
                <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto">
                  {JSON.stringify(acceptedChanges, null, 2)}
                </pre>
                <p className="text-gray-800 mt-2">
                  You can now manually integrate these accepted bullets into the `.tex` file.
                </p>
              </>
            ) : (
              <p className="text-gray-800">
                No bullet changes were accepted.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


// "use client";

// import { useState } from "react";

// export default function HomePage() {
//   const [jobDesc, setJobDesc] = useState("");
//   const [parsedData, setParsedData] = useState<any>(null);
//   const [scoreResults, setScoreResults] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   // ---- NEW STATES FOR CUSTOMIZATION ----
//   const [customizationFlow, setCustomizationFlow] = useState<"idle"|"ready"|"inProgress"|"completed">("idle");
//   const [bulletSuggestions, setBulletSuggestions] = useState<any[]>([]);
//   const [currentBulletIndex, setCurrentBulletIndex] = useState(0);
//   const [acceptedChanges, setAcceptedChanges] = useState<any[]>([]);

//   // 1) Parse & Score JD
//   async function handleParseAndScore() {
//     setLoading(true);
//     setCustomizationFlow("idle");
//     try {
//       // (A) Parse JD
//       const parseResponse = await fetch("/api/parseJD", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ jobDescription: jobDesc }),
//       });
//       const parsed = await parseResponse.json();
//       setParsedData(parsed);

//       // (B) Score resumes if keywords exist
//       if (parsed.keywords) {
//         const scoreResponse = await fetch("/api/scoreResume", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ keywords: parsed.keywords }),
//         });
//         const scored = await scoreResponse.json();
//         setScoreResults(scored);
//       }
//     } catch (err) {
//       console.error("Error parsing or scoring JD:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 2) Start customizing the best resume
//   async function handleCustomizeResume() {
//     if (!scoreResults?.bestResume) {
//       alert("No best resume found. Parse & score first.");
//       return;
//     }

//     setLoading(true);
//     setCustomizationFlow("inProgress");

//     try {
//       // Pull needed info: unmatched / matched keywords, the job description, etc.
//       const { file, unmatchedKeywords, matchedKeywords } = scoreResults.bestResume;
//       const jobDescription = jobDesc; // or parsedData.idealCandidateDescription, etc.

//       const customizeResponse = await fetch("/api/customizeResume", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           resumeFile: file,
//           jobDescription,
//           unmatchedKeywords,
//           matchedKeywords
//         }),
//       });
//       const customizeData = await customizeResponse.json();

//       // The API should return an array of bullet changes, e.g. { changes: [{ originalBullet: "", newBullet: "" }, ...] }
//       // or in the snippet we used "suggestions" (raw text). Let's assume it returns a structured "changes" array.
//       if (customizeData.changes && Array.isArray(customizeData.changes)) {
//         setBulletSuggestions(customizeData.changes);
//         setCurrentBulletIndex(0);
//         setAcceptedChanges([]);
//       } else {
//         alert("No bullet changes returned.");
//         setCustomizationFlow("completed");
//       }
//     } catch (err) {
//       console.error("Error customizing resume:", err);
//       setCustomizationFlow("completed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // 3) Accept or Skip Each Bullet Change
//   function handleAcceptChange() {
//     if (currentBulletIndex < bulletSuggestions.length) {
//       const acceptedChange = bulletSuggestions[currentBulletIndex];
//       setAcceptedChanges((prev) => [...prev, acceptedChange]);
//     }
//     moveToNextBullet();
//   }

//   function handleSkipChange() {
//     // The user decided not to replace or update that bullet
//     moveToNextBullet();
//   }

//   function moveToNextBullet() {
//     const newIndex = currentBulletIndex + 1;
//     if (newIndex < bulletSuggestions.length) {
//       setCurrentBulletIndex(newIndex);
//     } else {
//       // Done with all bullet suggestions
//       setCustomizationFlow("completed");
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6 text-white">
//           Resume Tailoring System - Day 4
//         </h1>

//         {/* (1) Paste JD and Parse/Score */}
//         <label className="block text-white font-semibold mb-2">
//           Paste Job Description:
//         </label>
//         <textarea
//           value={jobDesc}
//           onChange={(e) => setJobDesc(e.target.value)}
//           rows={8}
//           className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300"
//           placeholder="Enter or paste the job description here..."
//         />

//         <button
//           onClick={handleParseAndScore}
//           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
//           disabled={loading}
//         >
//           {loading ? "Parsing & Scoring..." : "Parse & Score Resumes"}
//         </button>

//         {/* (2) Display Parsed JD */}
//         {parsedData && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Parsed Data
//             </h2>
//             <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
//               {JSON.stringify(parsedData, null, 2)}
//             </pre>
//           </div>
//         )}

//         {/* (3) Display Scoring Results */}
//         {scoreResults && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Resume Scoring Results
//             </h2>
//             <p className="mb-2 text-gray-800">
//               <strong>Best Resume:</strong> {scoreResults.bestResume.file}{" "}
//               ({scoreResults.bestResume.scorePercent}% match)
//             </p>
//             <h3 className="font-semibold text-gray-800">All Scores</h3>
//             <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
//               {JSON.stringify(scoreResults.allScores, null, 2)}
//             </pre>

//             {/* Button to customize best resume */}
//             {customizationFlow === "idle" && (
//               <button
//                 onClick={handleCustomizeResume}
//                 className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//                 disabled={loading}
//               >
//                 Customize This Resume
//               </button>
//             )}
//           </div>
//         )}

//         {/* (4) Interactive Customization */}
//         {customizationFlow === "inProgress" && bulletSuggestions.length > 0 && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Bullet Suggestions
//             </h2>
//             <p className="text-gray-800 mb-2">
//               Reviewing suggestion {currentBulletIndex + 1} of {bulletSuggestions.length}
//             </p>

//             {/* Show current bullet suggestion */}
//             <div className="mb-4">
//               <p className="text-gray-800"><strong>Original Bullet:</strong></p>
//               <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300">
//                 {bulletSuggestions[currentBulletIndex].originalBullet}
//               </pre>

//               <p className="text-gray-800 mt-2"><strong>Proposed New Bullet:</strong></p>
//               <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300">
//                 {bulletSuggestions[currentBulletIndex].newBullet}
//               </pre>
//             </div>

//             {/* Accept or Skip the change */}
//             <div className="flex gap-4">
//               <button
//                 onClick={handleAcceptChange}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Accept
//               </button>
//               <button
//                 onClick={handleSkipChange}
//                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//               >
//                 Skip
//               </button>
//             </div>
//           </div>
//         )}

//         {/* (5) Final: Show accepted changes summary */}
//         {customizationFlow === "completed" && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Customization Flow Completed
//             </h2>

//             {acceptedChanges.length > 0 ? (
//               <>
//                 <p className="text-gray-800 mb-2">
//                   You accepted {acceptedChanges.length} bullet changes.
//                 </p>
//                 <pre className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 overflow-auto">
//                   {JSON.stringify(acceptedChanges, null, 2)}
//                 </pre>
//                 <p className="text-gray-800 mt-2">
//                   You can now manually integrate these accepted bullets into the `.tex` file
//                   (or we can automate this in a future step).
//                 </p>
//               </>
//             ) : (
//               <p className="text-gray-800">
//                 No bullet changes were accepted.
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// "use client";

// import { useState } from "react";

// export default function HomePage() {
//   const [jobDesc, setJobDesc] = useState("");
//   const [parsedData, setParsedData] = useState<any>(null);
//   const [scoreResults, setScoreResults] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   async function handleParseAndScore() {
//     setLoading(true);
//     try {
//       // 1) Parse JD to get keywords, etc.
//       const parseResponse = await fetch("/api/parseJD", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ jobDescription: jobDesc }),
//       });
//       const parsed = await parseResponse.json();
//       setParsedData(parsed);

//       // 2) If we have keywords, call the /api/scoreResume route
//       if (parsed.keywords) {
//         const scoreResponse = await fetch("/api/scoreResume", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ keywords: parsed.keywords }),
//         });
//         const scored = await scoreResponse.json();
//         setScoreResults(scored);
//       }
//     } catch (err) {
//       console.error("Error parsing or scoring JD:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6 text-white">
//           Resume Tailoring System - Day 3
//         </h1>

//         <label className="block text-white font-semibold mb-2">
//           Paste Job Description:
//         </label>
//         <textarea
//           value={jobDesc}
//           onChange={(e) => setJobDesc(e.target.value)}
//           rows={8}
//           className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300"
//           placeholder="Enter or paste the job description here..."
//         />

//         <button
//           onClick={handleParseAndScore}
//           className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
//           disabled={loading}
//         >
//           {loading ? "Parsing & Scoring..." : "Parse & Score Resumes"}
//         </button>

//         {/* Display Parsed JD */}
//         {parsedData && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Parsed Data
//             </h2>
//             <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
//               {JSON.stringify(parsedData, null, 2)}
//             </pre>
//           </div>
//         )}

//         {/* Display Scoring Results */}
//         {scoreResults && (
//           <div className="mt-8 bg-gray-200 p-4 rounded shadow">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">
//               Resume Scoring Results
//             </h2>
//             <p className="mb-2 text-gray-800">
//               <strong>Best Resume:</strong> {scoreResults.bestResume.file}{" "}
//               ({scoreResults.bestResume.scorePercent}% match)
//             </p>
//             <h3 className="font-semibold text-gray-800">All Scores</h3>
//             <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
//               {JSON.stringify(scoreResults.allScores, null, 2)}
//             </pre>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
