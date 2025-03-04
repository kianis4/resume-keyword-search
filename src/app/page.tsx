"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [emailInput, setEmailInput] = useState('');
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Tailor your resume to <span className="text-blue-500">match the job</span> you really want
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Stop sending generic resumes. Customize your resume with AI-powered keyword optimization to increase your match score and get more interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/customize" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center">
                  Start Customizing Now
                </Link>
                <Link href="/gallery" 
                  className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all flex items-center justify-center">
                  View Resume Gallery
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute -left-10 -bottom-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
              <div className="relative z-10 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg transform rotate-2">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-xs">resume.tex</span>
                </div>
                <code className="block text-sm text-blue-400 font-mono">
                  <span className="text-green-400">// before</span><br />
                  Led team of developers on software projects<br /><br />
                  <span className="text-green-400">// after</span><br />
                  <span className="text-blue-300">Led cross-functional team of 6 developers to deliver</span> <span className="bg-green-900/30 text-green-400">cloud-native microservices</span> <span className="text-blue-300">architecture, reducing deployment time by 40%</span>
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* My Story Section */}
      <div className="bg-gray-900/70 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why I Built SKompXcel Calibrate</h2>
          
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-lg">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              During my job search in 2023, I submitted over 800 applications but received very few responses. I eventually discovered that most companies use Applicant Tracking Systems (ATS) that filter resumes based on keyword matching before a human ever sees them.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I spent countless hours manually tailoring my resume for each application, trying to match job descriptions. It was time-consuming and frustrating—I knew there had to be a better way.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              So, I built SKompXcel Calibrate to automate this process. The tool uses AI to analyze job descriptions, identifies missing keywords, and suggests optimizations to your resume—all while preserving your authentic experience and skills.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              What started as a personal project has now helped dozens of job seekers increase their interview rates. I hope it helps you too on your job search journey.
            </p>
            <div className="mt-8 border-t border-gray-700 pt-8">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="ml-4">
                  <p className="text-white font-medium">Suley</p>
                  <p className="text-gray-400">Creator of SKompXcel Calibrate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg transform transition-all hover:scale-[1.02]">
              <div className="w-14 h-14 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Parse Job Description</h3>
              <p className="text-gray-300 leading-relaxed">
                Upload your resume and paste the job description. Our AI engine analyzes the job requirements and extracts key skills and qualifications.
              </p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg transform transition-all hover:scale-[1.02]">
              <div className="w-14 h-14 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Optimize Content</h3>
              <p className="text-gray-300 leading-relaxed">
                Review AI-generated suggestions for improving your bullet points and skills section. Accept or reject changes to keep your resume authentic.
              </p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg transform transition-all hover:scale-[1.02]">
              <div className="w-14 h-14 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Generate Perfect Resume</h3>
              <p className="text-gray-300 leading-relaxed">
                Download your tailored resume as a professionally formatted PDF, ready to submit with confidence to your target company.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-gray-900/70 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">85%</div>
              <p className="text-gray-300">Average increase in keyword matching score</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">3X</div>
              <p className="text-gray-300">More interview invitations reported by users</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-500 mb-2">5 min</div>
              <p className="text-gray-300">Average time to optimize a resume (vs. 2+ hours manually)</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Land Your Next Interview?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who are using SKompXcel Calibrate to optimize their resumes and get noticed by recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customize" 
              className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105 text-lg font-medium">
              Start Customizing Your Resume
            </Link>
            <Link href="/upload" 
              className="px-8 py-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all text-lg font-medium">
              Upload Your Resume
            </Link>
          </div>
        </div>
      </div>
      
    </main>
  );
}