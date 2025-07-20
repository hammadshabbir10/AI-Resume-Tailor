import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ATSChecker: React.FC = () => {
  const [uploadedPDFs, setUploadedPDFs] = useState<any[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'select' | 'analyzing' | 'results'>('select');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentSelectedPDF, setCurrentSelectedPDF] = useState<any>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUploadedPDFs(JSON.parse(localStorage.getItem(`pdfs_${user.email}`) || '[]'));
      setUserName(`${user.firstname || ''} ${user.lastname || ''}`.trim());
      
      // Load saved ATS data from localStorage
      const savedATSData = localStorage.getItem(`ats_data_${user.email}`);
      if (savedATSData) {
        const data = JSON.parse(savedATSData);
        setReport(data.report || null);
        setSelectedPDF(data.selectedPDF || null);
        setCurrentSelectedPDF(data.selectedPDF || null);
        setCurrentStep(data.report ? 'results' : 'select');
      }
    }
  }, []);

  // Simulate analysis progress
  useEffect(() => {
    if (loading) {
      setCurrentStep('analyzing');
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleCheck = async () => {
    if (!selectedPDF) return;
    setLoading(true);
    setReport(null);
    setError(null);
    setAnalysisProgress(0);
    
    try {
      const res = await fetch('/api/atsCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: selectedPDF.data, fileName: selectedPDF.name}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setReport(data);
      setCurrentStep('results');
      setCurrentSelectedPDF(selectedPDF);
      
      // Save to localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        localStorage.setItem(`ats_data_${user.email}`, JSON.stringify({
          report: data,
          selectedPDF: selectedPDF,
          timestamp: Date.now()
        }));
      }
    } catch (err: any) {
      setError(err.message);
      setCurrentStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!report) return;
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = 800;
    const fontSize = 14;
    const headingSize = 18;
    const maxWidth = 495;
    
    const wrapText = (text: string, fontObj: any, size: number) => {
      const words = text.split(' ');
      let lines: string[] = [];
      let currentLine = '';
      for (let word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const width = fontObj.widthOfTextAtSize(testLine, size);
        if (width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // Title
    const title = 'ATS Resume Report';
    const titleWidth = boldFont.widthOfTextAtSize(title, headingSize);
    page.drawText(title, { x: (595 - titleWidth) / 2, y, size: headingSize, font: boldFont, color: rgb(0, 0.5, 0) });
    y -= 40;
    
    // Score
    page.drawText(`Score: ${report.score}/100`, { x: 50, y, size: fontSize, font: boldFont, color: rgb(0, 0.5, 0) });
    y -= 24;
    
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Summary
    page.drawText('Summary:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    for (const line of wrapText(report.summary, font, fontSize)) {
      page.drawText(line, { x: 50, y, size: fontSize, font });
      y -= 18;
      if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    }
    y -= 10;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Errors
    page.drawText('Spelling/Grammar Errors:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    for (const err of report.errors) {
      for (const line of wrapText('- ' + err, font, fontSize)) {
        page.drawText(line, { x: 60, y, size: fontSize, font, color: rgb(1, 0, 0) });
        y -= 16;
        if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
      }
    }
    y -= 10;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Missing Sections
    page.drawText('Missing Sections:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    page.drawText(report.missingSections.join(', ') || 'None', { x: 60, y, size: fontSize, font });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Found Skills
    page.drawText('Found Skills:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    page.drawText(report.foundSkills.join(', '), { x: 60, y, size: fontSize, font });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Missing Skills
    page.drawText('Missing Skills:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    page.drawText(report.missingSkills.join(', '), { x: 60, y, size: fontSize, font });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    
    // Suggestions
    page.drawText('Suggestions:', { x: 50, y, size: fontSize, font: boldFont });
    y -= 20;
    if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
    for (const s of report.suggestions) {
      for (const line of wrapText('- ' + s, font, fontSize)) {
        page.drawText(line, { x: 60, y, size: fontSize, font, color: rgb(0, 0, 0.7) });
        y -= 16;
        if (y < 50) { page = pdfDoc.addPage([595, 842]); y = 800; }
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ATS_Report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAnalysis = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      localStorage.removeItem(`ats_data_${user.email}`);
    }
    setCurrentStep('select');
    setReport(null);
    setError(null);
    setAnalysisProgress(0);
    setSelectedPDF(null);
    setCurrentSelectedPDF(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <>
      <Head>
        <title>ATS Checker - Resume Tailor</title>
        <meta name="description" content="Check your resume's ATS compatibility and get optimization suggestions" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <Navbar userName={userName} />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
              ATS Resume Checker
            </h1>
            <p className="text-xl text-green-700 max-w-3xl mx-auto">
              Get your resume analyzed by our AI-powered ATS checker and receive detailed feedback 
              to improve your chances of getting past Applicant Tracking Systems
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Step 1: Select Resume */}
              {currentStep === 'select' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-green-800 mb-2">Select Your Resume</h2>
                    <p className="text-green-600">Choose a resume from your uploaded files to analyze</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-green-700 mb-3">
                      📄 Select Resume
                    </label>
                    <select
                      className="w-full border border-green-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={uploadedPDFs.findIndex(pdf => pdf === selectedPDF)}
                      onChange={e => setSelectedPDF(uploadedPDFs[parseInt(e.target.value)])}
                    >
                      <option value="">-- Select a resume to analyze --</option>
                      {uploadedPDFs.map((pdf, idx) => (
                        <option value={idx} key={idx}>{pdf.name}</option>
                      ))}
                    </select>
                    
                    {uploadedPDFs.length === 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>No resumes uploaded yet!</strong> Please upload a resume in your dashboard first.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleCheck}
                      disabled={!selectedPDF || loading}
                      className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                        !selectedPDF || loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Start ATS Analysis
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Analyzing */}
              {currentStep === 'analyzing' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
                      <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-blue-800 mb-2">Analyzing Your Resume</h2>
                    <p className="text-blue-600">Our AI is checking your resume for ATS compatibility...</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Analysis Progress</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Analysis Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                      analysisProgress > 20 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          analysisProgress > 20 ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {analysisProgress > 20 ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-white text-xs">1</span>
                          )}
                        </div>
                        <span className={`font-medium ${analysisProgress > 20 ? 'text-green-700' : 'text-gray-500'}`}>
                          Text Extraction
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                      analysisProgress > 50 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          analysisProgress > 50 ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {analysisProgress > 50 ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-white text-xs">2</span>
                          )}
                        </div>
                        <span className={`font-medium ${analysisProgress > 50 ? 'text-green-700' : 'text-gray-500'}`}>
                          ATS Analysis
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                      analysisProgress > 80 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          analysisProgress > 80 ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {analysisProgress > 80 ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-white text-xs">3</span>
                          )}
                        </div>
                        <span className={`font-medium ${analysisProgress > 80 ? 'text-green-700' : 'text-gray-500'}`}>
                          Generating Report
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Results */}
              {currentStep === 'results' && report && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-green-800 mb-2">Analysis Complete!</h2>
                    <p className="text-green-600">Here's your detailed ATS compatibility report</p>
                    {currentSelectedPDF && (
                      <p className="text-blue-600 mt-2 font-medium">Analyzed: {currentSelectedPDF.name}</p>
                    )}
                  </div>

                  {/* Score Card */}
                  <div className={`p-6 rounded-xl border-2 ${getScoreBgColor(report.score)}`}>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">ATS Compatibility Score</h3>
                      <div className={`text-5xl font-bold ${getScoreColor(report.score)}`}>
                        {report.score}/100
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {report.score >= 80 ? 'Excellent! Your resume is highly ATS-friendly.' :
                         report.score >= 60 ? 'Good! Some improvements can be made.' :
                         'Needs improvement. Consider the suggestions below.'}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Summary
                      </h4>
                      <p className="text-blue-700 text-sm">{report.summary}</p>
                    </div>

                    {/* Skills Analysis */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Skills Found
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {report.foundSkills.map((skill: any, i: number) => (
                          <span key={i} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                            {typeof skill === 'string' ? skill : skill.description || JSON.stringify(skill)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Errors */}
                    {report.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Issues Found ({report.errors.length})
                        </h4>
                        <ul className="text-red-700 text-sm space-y-1">
                          {report.errors.map((err: any, i: number) => (
                            <li key={i} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {typeof err === 'string' ? err : err.description || JSON.stringify(err)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {report.missingSkills.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {report.missingSkills.map((skill: any, i: number) => (
                            <span key={i} className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                              {typeof skill === 'string' ? skill : skill.description || JSON.stringify(skill)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {report.suggestions.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Improvement Suggestions
                      </h4>
                      <ul className="text-purple-700 text-sm space-y-2">
                        {report.suggestions.map((suggestion: any, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">💡</span>
                            {typeof suggestion === 'string' ? suggestion : suggestion.description || JSON.stringify(suggestion)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleDownloadReport}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                    <button
                      onClick={resetAnalysis}
                      className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 font-medium flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Analysis
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                    onClick={resetAnalysis}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">ATS Optimization Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-2">Use Simple Formatting</h4>
                  <p className="text-blue-700 text-sm">Avoid complex layouts, tables, and graphics that ATS systems can't read properly.</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Include Keywords</h4>
                  <p className="text-green-700 text-sm">Use relevant keywords from the job description to improve your ATS score.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-purple-800 mb-2">Clear Section Headers</h4>
                  <p className="text-purple-700 text-sm">Use standard section headers like "Experience," "Education," and "Skills" for better parsing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ATSChecker;