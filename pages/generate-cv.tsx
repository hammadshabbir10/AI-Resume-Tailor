import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface TailoredCVResponse {
  success: boolean;
  tailoredCV?: string;
  jobTitle?: string;
  error?: string;
}

export default function GenerateCV() {
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tailoredCV, setTailoredCV] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState<string>('');

  const handleFileSelect = (file: File) => {
    // Check if file ends with .pdf (case insensitive)
    const isPdfFile = file.name.toLowerCase().endsWith('.pdf');
    
    if (isPdfFile) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file (.pdf extension)');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          console.log('Sending PDF data, size:', arrayBuffer.byteLength);
          
          const response = await fetch('/api/extract-pdf-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdfData: Array.from(new Uint8Array(arrayBuffer))
            }),
          });
          
          if (!response.ok) {
            if (response.status === 413) {
              reject(new Error('File too large. Please use a smaller PDF file (max 5MB).'));
            } else {
              const errorText = await response.text();
              console.error('PDF extraction error:', errorText);
              reject(new Error(`Server error: ${response.status} ${response.statusText}`));
            }
            return;
          }
          
          const result = await response.json();
          console.log('PDF extraction result:', result);
          
          if (result.success) {
            if (!result.text || result.text.trim().length === 0) {
              reject(new Error('No text found in PDF. Please check if the PDF contains readable text.'));
            } else {
              resolve(result.text);
            }
          } else {
            reject(new Error(result.error || 'Failed to extract text'));
          }
        } catch (error) {
          console.error('PDF extraction error:', error);
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const generateTailoredCV = async () => {
    if (!jobTitle.trim() || !selectedFile) {
      alert('Please enter a job title and select a CV file');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting PDF text extraction...');
      
      // Extract text from PDF
      const cvText = await extractTextFromPDF(selectedFile);
      console.log('Extracted text length:', cvText.length);
      console.log('First 200 characters:', cvText.substring(0, 200));
      
      if (!cvText || cvText.trim().length === 0) {
        alert('No text could be extracted from the PDF. Please check if the PDF contains readable text.');
        return;
      }
      
      console.log('Generating tailored CV...');
      
      // Generate tailored CV
      const response = await fetch('/api/tailor-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          cvText: cvText
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tailor CV error:', errorText);
        alert(`Failed to generate tailored CV: ${response.status} ${response.statusText}`);
        return;
      }

      const result: TailoredCVResponse = await response.json();
      
      if (result.success && result.tailoredCV) {
        setTailoredCV(result.tailoredCV);
        setCurrentJobTitle(jobTitle.trim());
        setShowPreview(true);

        // Save to MongoDB
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          await fetch('/api/generated-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: user.email,
              jobTitle: jobTitle.trim(),
              candidateName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
              resumeText: result.tailoredCV,
              createdAt: new Date()
            })
          });
        }
      } else {
        alert(result.error || 'Failed to generate tailored CV');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTailoredCV = async () => {
    if (!tailoredCV) return;

    try {
      let candidateName = '';
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        candidateName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
      }
      const response = await fetch('/api/generate-tailored-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tailoredCV: tailoredCV,
          jobTitle: currentJobTitle || jobTitle,
          candidateName: candidateName // <-- send this!
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailored-cv-${(currentJobTitle || jobTitle).replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(`${user.firstname || ''} ${user.lastname || ''}`.trim());
      
      // Load saved CV data from localStorage
      const savedCVData = localStorage.getItem(`cv_data_${user.email}`);
      if (savedCVData) {
        const data = JSON.parse(savedCVData);
        setTailoredCV(data.tailoredCV || '');
        setJobTitle(data.jobTitle || '');
        setCurrentJobTitle(data.jobTitle || '');
        setShowPreview(!!data.tailoredCV);
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Head>
        <title>Generate Tailored CV - Resume Builder</title>
        <meta name="description" content="Generate a tailored CV based on job requirements" />
      </Head>

      <Navbar userName={userName} />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Generate Tailored Resume
          </h1>
          <p className="text-xl text-green-700 max-w-3xl mx-auto">
            Upload your CV and enter a job title to get a professionally tailored resume 
            optimized for your target position
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Job Title Input */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-green-800 mb-6">
                  Job Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer, Marketing Manager"
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">💡 Tips for better results:</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Be specific with the job title</li>
                    <li>• Mention the industry or sector</li>
                  </ul>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-green-800 mb-6">
                  Upload Your Resume or CV
                </h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-green-500 bg-green-50' 
                      : selectedFile 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="text-green-600">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-green-800">{selectedFile.name}</p>
                        <p className="text-sm text-green-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(3)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-green-800">
                          Drop your Resume here, or click to browse
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Supports PDF files only
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 cursor-pointer transition-colors duration-200"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={generateTailoredCV}
                disabled={isLoading || !jobTitle.trim() || !selectedFile}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isLoading || !jobTitle.trim() || !selectedFile
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Tailored Resume...
                  </div>
                ) : (
                  'Generate Resume'
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && tailoredCV && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Tailored Resume Preview
                  </h2>
                  {currentJobTitle && (
                    <p className="text-green-600 mt-1">Tailored for: {currentJobTitle}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const userInfo = localStorage.getItem('userInfo');
                      if (userInfo) {
                        const user = JSON.parse(userInfo);
                        localStorage.removeItem(`cv_data_${user.email}`);
                      }
                      setTailoredCV('');
                      setShowPreview(false);
                      setJobTitle('');
                      setCurrentJobTitle('');
                      setSelectedFile(null);
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={downloadTailoredCV}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                    {tailoredCV}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
} 