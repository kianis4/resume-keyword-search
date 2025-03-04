# Resume Tailoring System

An AI-powered web application that automatically tailors your resume to specific job descriptions, optimizing your chances of passing through Applicant Tracking Systems (ATS) and impressing human recruiters.

## 📋 Overview

The Resume Tailoring System uses artificial intelligence to:

1. Parse job descriptions to extract key requirements, skills, and keywords
2. Score your existing resumes against these requirements
3. Optimize experience bullet points to better highlight relevant skills
4. Tailor your skills section to match job requirements
5. Generate a customized LaTeX resume that maintains professional formatting
6. Compile the tailored resume to a downloadable PDF
7. Provide before/after score improvement metrics

This application streamlines the job application process by eliminating the manual work of tailoring resumes for each position while ensuring your qualifications are presented optimally for each opportunity.

## ✨ Key Features

### Job Description Analysis
- Extract keywords, technologies, and requirements from any job posting
- Generate an "ideal candidate profile" based on the job description
- Identify critical skills and qualifications for the role

### Resume Scoring & Selection
- Analyze multiple resume versions against job requirements
- Calculate match percentages based on keyword alignment
- Identify matched and unmatched keywords
- Select the best resume version as a starting point

### Experience Optimization
- Extract experience sections from LaTeX resumes
- Generate tailored bullet point suggestions that incorporate missing keywords
- Review and approve/reject suggested changes per bullet point
- Maintain professional tone and realistic content in optimizations

### Skills Section Customization
- Extract current skills from resume
- Reorder and optimize skills based on job relevance
- Add missing relevant skills that match your background
- Remove less relevant skills to maintain focus

### LaTeX Integration & PDF Generation
- Apply accepted changes to LaTeX resume templates
- Maintain formatting and professional appearance
- Compile updated LaTeX to a downloadable PDF
- Preserve the single-page resume format

### Performance Analytics
- Calculate before/after keyword match scores
- Display keyword match improvement metrics
- Track newly matched keywords after optimization
- Identify any remaining unmatched keywords

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0 or higher)
- npm or yarn package manager
- An OpenAI API key

### Installation

1. Clone the repository
```
<copilot-edited-file>```bash
git clone https://github.com/yourusername/resume-tailoring-system.git
cd resume-tailoring-system
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ How to Use

1. **Upload Resume**: Click on the upload button and select your resume file
2. **Enter Job Description**: Paste the job description text into the provided field
3. **Analyze**: Click the "Analyze" button to see your results
4. **Review Suggestions**: Check the matched and missing keywords sections
5. **Export Results**: Download a report of the analysis (optional)

## 🧰 Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Text Processing**: Natural language processing libraries
- **Document Parsing**: PDF and DOCX extraction tools
- **UI Components**: Custom React components with responsive design

# Updated README.md for Resume Tailoring System

Here's a completely updated README with comprehensive documentation for your project:

### [README.md](file:///Users/suley/Desktop/resume-keyword-search/README.md)

```markdown
# Resume Tailoring System

An AI-powered web application that automatically tailors your resume to specific job descriptions, optimizing your chances of passing through Applicant Tracking Systems (ATS) and impressing human recruiters.

## 📋 Overview

The Resume Tailoring System uses artificial intelligence to:

1. Parse job descriptions to extract key requirements, skills, and keywords
2. Score your existing resumes against these requirements
3. Optimize experience bullet points to better highlight relevant skills
4. Tailor your skills section to match job requirements
5. Generate a customized LaTeX resume that maintains professional formatting
6. Compile the tailored resume to a downloadable PDF
7. Provide before/after score improvement metrics

This application streamlines the job application process by eliminating the manual work of tailoring resumes for each position while ensuring your qualifications are presented optimally for each opportunity.

## ✨ Key Features

### Job Description Analysis
- Extract keywords, technologies, and requirements from any job posting
- Generate an "ideal candidate profile" based on the job description
- Identify critical skills and qualifications for the role

### Resume Scoring & Selection
- Analyze multiple resume versions against job requirements
- Calculate match percentages based on keyword alignment
- Identify matched and unmatched keywords
- Select the best resume version as a starting point

### Experience Optimization
- Extract experience sections from LaTeX resumes
- Generate tailored bullet point suggestions that incorporate missing keywords
- Review and approve/reject suggested changes per bullet point
- Maintain professional tone and realistic content in optimizations

### Skills Section Customization
- Extract current skills from resume
- Reorder and optimize skills based on job relevance
- Add missing relevant skills that match your background
- Remove less relevant skills to maintain focus

### LaTeX Integration & PDF Generation
- Apply accepted changes to LaTeX resume templates
- Maintain formatting and professional appearance
- Compile updated LaTeX to a downloadable PDF
- Preserve the single-page resume format

### Performance Analytics
- Calculate before/after keyword match scores
- Display keyword match improvement metrics
- Track newly matched keywords after optimization
- Identify any remaining unmatched keywords

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0 or higher)
- npm or yarn package manager
- An OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/resume-keyword-search.git
cd resume-keyword-search
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the project root and add your OpenAI API key
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage Instructions

1. **Input Job Description**: Paste the job description text into the provided textarea
2. **Parse & Score**: Click "Parse & Score Resumes" to extract keywords and evaluate your existing resumes
3. **Review Analysis**: Examine the parsed job data and resume scoring results
4. **Load Experiences**: Click "Load Experiences" to extract experience sections from your best-matching resume
5. **Optimize Experiences**: For each experience section, click "Optimize This Experience" to receive AI-generated improvements
6. **Review Suggestions**: Accept or skip each suggested bullet point change
7. **Optimize Skills**: Click "Load Skills Section" then "Optimize Skills For Job" to receive skills section improvements
8. **Review Final Changes**: Review all accepted changes in the summary section
9. **Generate PDF**: Enter a filename and click "Inject All Changes Into LaTeX" to create your tailored resume
10. **Download PDF**: View your optimized resume and download the PDF for job applications

## 🔧 Technical Architecture

### Frontend
- Next.js (React framework)
- React Hooks for state management
- Tailwind CSS for styling

### Backend (API Routes)
- `/api/parseJD` - Analyzes job descriptions using OpenAI
- `/api/scoreResume` - Calculates keyword match scores for resumes
- `/api/extractBulletPoints` - Extracts experience sections from LaTeX
- `/api/updateExperience` - Generates optimized bullet points
- `/api/extractSkills` - Extracts skills sections from LaTeX
- `/api/optimizeSkills` - Generates optimized skills layout
- `/api/customizeResume` - Injects changes into LaTeX templates
- `/api/compilePDF` - Compiles LaTeX into downloadable PDFs

### External Services
- OpenAI API (GPT-3.5 Turbo) for language processing
- LaTeX compiler for PDF generation

## 📁 Project Structure

```
resume-keyword-search/
├── public/             # Static assets
├── src/                # Source files
│   ├── app/            # Next.js app router
│   │   ├── api/        # API routes
│   │   │   ├── compilePDF/         # PDF compilation endpoint
│   │   │   ├── customizeResume/    # Resume customization endpoint
│   │   │   ├── extractBulletPoints/# Experience extraction endpoint
│   │   │   ├── extractSkills/      # Skills extraction endpoint
│   │   │   ├── optimizeSkills/     # Skills optimization endpoint
│   │   │   ├── parseJD/            # Job description parsing endpoint
│   │   │   ├── scoreResume/        # Resume scoring endpoint
│   │   │   └── updateExperience/   # Bullet point optimization endpoint
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Main application page
│   ├── components/     # React components
│   └── lib/            # Utility functions
├── resumes/            # LaTeX resume templates
├── .env.local          # Environment variables (create this)
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## 🛠️ Technologies Used

- **Next.js**: React framework for frontend and API routes
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI API**: Natural language processing
- **LaTeX**: Professional resume formatting
- **PDF.js**: PDF preview rendering

## 🤖 How the AI Works

1. **Job Description Parsing**
   - The system uses OpenAI's GPT-3.5 Turbo model to extract key information from job descriptions
   - Prompts are designed to identify technical skills, soft skills, requirements, and create an "ideal candidate" profile
   - The AI distinguishes between required and preferred skills

2. **Bullet Point Optimization**
   - For each experience bullet point, the AI evaluates relevance to the job
   - It rewrites bullets to naturally incorporate missing keywords when relevant
   - Irrelevant bullets are replaced with new content highlighting applicable skills
   - The AI maintains bullet length and natural language flow

3. **Skills Section Optimization**
   - The AI analyzes the skills section structure (categories, formatting)
   - It reorders skills to prioritize job-relevant ones
   - Adds missing keywords that align with the candidate's background
   - Maintains the original structure and formatting

## 📊 Performance Metrics

The system provides quantitative measures of improvement:
- Original resume match score
- Optimized resume match score
- Percentage improvement
- Newly matched keywords
- Remaining unmatched keywords

## 🔜 Future Enhancements

- User authentication for saving multiple resume profiles
- Custom resume template uploads
- Multiple export formats (DOCX, PDF, TXT)
- ATS simulation testing
- Resume version history and comparison
- Mobile app version

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenAI for providing the GPT API
- Next.js team for the excellent React framework
- All contributors and testers who helped improve this project

---

Created with ❤️ to simplify the job application process
```
