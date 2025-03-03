This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

# Resume Keyword Search

A web application that helps job seekers optimize their resumes by analyzing keyword matches between their resume and job descriptions.

## Overview

Resume Keyword Search allows you to:
- Upload your resume document
- Input job descriptions
- Analyze keyword matches and gaps
- Get suggestions to improve your resume for specific job applications

This tool uses natural language processing to identify important skills, qualifications, and keywords from job postings and compares them with your resume content to highlight matches and missing keywords.

## Features

- **Resume Upload**: Support for PDF, DOCX, and plain text resume formats
- **Job Description Analysis**: Extract key requirements from job postings
- **Keyword Matching**: Visual representation of matching and missing keywords
- **Suggestions**: AI-powered recommendations to improve your resume
- **Resume Scoring**: Get a match percentage for each job application

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How to Use

1. **Upload Resume**: Click on the upload button and select your resume file
2. **Enter Job Description**: Paste the job description text into the provided field
3. **Analyze**: Click the "Analyze" button to see your results
4. **Review Suggestions**: Check the matched and missing keywords sections
5. **Export Results**: Download a report of the analysis (optional)

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Text Processing**: Natural language processing libraries
- **Document Parsing**: PDF and DOCX extraction tools
- **UI Components**: Custom React components with responsive design

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](https://choosealicense.com/licenses/mit/)
