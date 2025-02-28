// /src/app/page.tsx
"use client";

import { useState } from "react";

export default function HomePage() {
  const [jobDesc, setJobDesc] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleParseJD() {
    setLoading(true);
    try {
      const response = await fetch("/api/parseJD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc }),
      });
      const data = await response.json();
      setParsedData(data);
    } catch (err) {
      console.error("Error parsing JD:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Resume Tailoring System - Day 2
        </h1>

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
          onClick={handleParseJD}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Parsing..." : "Parse Job Description"}
        </button>

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
      </div>
    </main>
  );
}
