# Project Vision Document

## 1. Project Overview

### Name: Automated Resume Tailoring System

**Description:**
A web-based tool that takes a job description (JD) as input and dynamically selects and tailors one of five LaTeX-based resumes (DevOps, Full Stack, Backend, Front End, AI/ML). It uses an LLM (OpenAI GPT or Anthropic Claude) to:

- Parse and analyze the JD for specific skills, technologies, and requirements.
- Score each of the five resumes against the JD.
- Choose the best-fit resume based on the scoring mechanism.
- Offer to update specific bullet points/sections to ensure the final resume matches the job description even more closely, while strictly maintaining a single-page format.

## 2. Goals and Objectives

### Streamline Resume Customization

- Eliminate manual effort of tailoring resumes for each application.
- Provide a quick way to match job requirements to a relevant skill set.

### Improve Relevance and Clarity

- Use natural language processing to identify important keywords/skills in the JD.
- Suggest (or auto-generate) bullet points that align with the user’s background but also highlight relevant experience for the specific role.

### Maintain Single-Page Constraint

- Automatically ensure the resume remains one page by replacing or removing existing text as necessary.
- Keep the overall design/style consistent with each LaTeX template.

### Provide an Interactive User Experience

- Let the user see the system’s recommended resume choice.
- Offer step-by-step suggestions for bullet-point updates and finalize an optimized resume.

### Support Future Scalability

- Initially for personal use but can be extended into a cloud-based tool for broader audiences.

## 3. Stakeholders

### Primary User (You / Individual)

- Wants to save time and improve alignment between their resume and job postings.

### Potential Future Users (Other Job Seekers)

- Could leverage this tool to tailor resumes with minimal effort.

### System Developers

- Responsible for building, maintaining, and deploying the system (either you or a team in the future).

## 4. Key Features

### Job Description Parsing

- Extracts keywords (e.g., “AWS,” “React,” “Kubernetes”) and important phrases from any pasted job description text.
- Understands context (e.g., synonyms, prioritized terms, role-based requirements).

### Resume Matching and Scoring

- Compares each of the five LaTeX resumes against the extracted keywords/skills.
- Scores resumes based on how many relevant keywords appear and how closely the content aligns with the JD.

### Automated Resume Customization

- Replaces or removes bullet points and text to maintain a single-page format.
- Suggests new bullet points generated by an LLM, ensuring they sound professional and plausible.

### Interactive Editing

- Allows the user to approve or decline each proposed change.
- Provides a final option to confirm the complete tailored resume or revert if unsatisfied.

### LaTeX to PDF Generation

- Final output is a single-page PDF that can be downloaded or used directly in applications.

## 5. Success Criteria

- **Accuracy:** The system accurately identifies key skills/technologies from the JD and reflects them in the selected resume.
- **Efficiency:** The user can get a tailored resume in one minute or less (not strictly real-time, but reasonably
