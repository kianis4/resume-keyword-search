"use client"; // needed to use state/hooks in Next.js 13 with the App Router

import { useState } from "react";

export default function HomePage() {
  const [jobDesc, setJobDesc] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);

  async function handleParseJD() {
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
    }
  }

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Resume Tailoring System - Day 2</h1>
      <textarea
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        rows={10}
        cols={50}
        placeholder="Paste job description here..."
        style={{ display: "block", marginBottom: "1rem" }}
      />
      <button onClick={handleParseJD}>
        Parse Job Description
      </button>

      {parsedData && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Parsed Data</h2>
          <pre>
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
