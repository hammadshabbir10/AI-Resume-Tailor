import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FileReader from '../components/FileReader';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [resumesCreated, setResumesCreated] = useState(0);
  const [pdfsUploaded, setPdfsUploaded] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);

  type Activity = {
    type: 'login' | 'upload';
    message: string;
    detail: string;
    timestamp: number;
    timeAgo?: string;
  };
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const emptyEducation: Record<string, string> = {
    degree: '',
    school: '',
    city: '',
    country: '',
    graduationDate: '',
    cgpa: '',
    coursework: ''
  };
  const emptyExperience: Record<string, string> = {
    role: '',
    company: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    description: ''
  };
  const emptyProject: Record<string, string> = {
    title: '',
    technologies: '',
    description: ''
  };
  const [resumeForm, setResumeForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    github: '',
    summary: '',
    skills: '',
    education: [ { ...emptyEducation } ],
    experience: [ { ...emptyExperience } ],
    projects: [{ ...emptyProject }]
  });
  const [showResumeView, setShowResumeView] = useState<null | number>(null);
  const [createdResumes, setCreatedResumes] = useState<any[]>([]);
  const [uploadedPDFs, setUploadedPDFs] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState<{ name: string; data: string } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserName(`${user.firstname} ${user.lastname}`);
      // Fetch dashboard stats from API
      fetch(`/api/dashboard-stats?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          setResumesCreated(data.resumesCreated || 0);
          setPdfsUploaded(data.pdfsUploaded || 0);
          setTotalActivities(data.totalActivities || 0);
        });
    }
  }, []);

  useEffect(() => {
    // Fetch user activity from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      const activities: Activity[] = JSON.parse(localStorage.getItem(`activity_${user.email}`) || '[]');
      setRecentActivities(activities.map((a: Activity) => ({
        ...a,
        timeAgo: getTimeAgo(a.timestamp)
      })));
    }
  }, []);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      fetch(`/api/user-resumes?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setCreatedResumes(data.resumes || []));
    }
  }, [showResumeModal]);

  function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  function getTimeAgoFromDate(dateString: string | Date): string {
    const now = Date.now();
    const created = new Date(dateString).getTime();
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  function handleUploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed!');
      return;
    }
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    const user = JSON.parse(userInfo);
    // Read file as base64
    const reader = new window.FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const pdfs = JSON.parse(localStorage.getItem(`pdfs_${user.email}`) || '[]');
      const dataUrl = ev.target?.result as string;
      const newPDF = {
        name: file.name,
        data: dataUrl,
        uploadedAt: Date.now()
      };
      const updatedPDFs = [newPDF, ...pdfs];
      localStorage.setItem(`pdfs_${user.email}`, JSON.stringify(updatedPDFs));
      setUploadedPDFs(updatedPDFs);
      // Add activity
      const activities: Activity[] = JSON.parse(localStorage.getItem(`activity_${user.email}`) || '[]');
      const newActivity: Activity = {
        type: 'upload',
        message: 'Resume uploaded',
        detail: file.name,
        timestamp: Date.now()
      };
      const updatedActivities = [newActivity, ...activities];
      localStorage.setItem(`activity_${user.email}`, JSON.stringify(updatedActivities));
      setRecentActivities(updatedActivities.map((a: Activity) => ({ ...a, timeAgo: getTimeAgo(a.timestamp) })));
      alert('Resume uploaded!');
    };
    reader.readAsDataURL(file);
  }

  function handleResumeFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setResumeForm({ ...resumeForm, [e.target.name]: e.target.value });
  }

  function handleEducationChange(idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = [...resumeForm.education];
    (updated[idx] as Record<string, string>)[e.target.name] = e.target.value;
    setResumeForm({ ...resumeForm, education: updated });
  }
  function addEducation() {
    setResumeForm({ ...resumeForm, education: [...resumeForm.education, { ...emptyEducation }] });
  }
  function removeEducation(idx: number) {
    const updated = resumeForm.education.filter((_, i) => i !== idx);
    setResumeForm({ ...resumeForm, education: updated });
  }

  function handleExperienceChange(idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = [...resumeForm.experience];
    (updated[idx] as Record<string, string>)[e.target.name] = e.target.value;
    setResumeForm({ ...resumeForm, experience: updated });
  }
  function addExperience() {
    setResumeForm({ ...resumeForm, experience: [...resumeForm.experience, { ...emptyExperience }] });
  }
  function removeExperience(idx: number) {
    const updated = resumeForm.experience.filter((_, i) => i !== idx);
    setResumeForm({ ...resumeForm, experience: updated });
  }

  function handleProjectChange(idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = [...resumeForm.projects];
    (updated[idx] as Record<string, string>)[e.target.name] = e.target.value;
    setResumeForm({ ...resumeForm, projects: updated });
  }
  function addProject() {
    setResumeForm({ ...resumeForm, projects: [...resumeForm.projects, { ...emptyProject }] });
  }
  function removeProject(idx: number) {
    const updated = resumeForm.projects.filter((_, i) => i !== idx);
    setResumeForm({ ...resumeForm, projects: updated });
  }

  function handleCreateResume(e: React.FormEvent) {
    e.preventDefault();
    // Required fields check
    if (!resumeForm.name || !resumeForm.email || !resumeForm.phone || !resumeForm.city || !resumeForm.country || !resumeForm.summary || !resumeForm.skills) {
      alert('Please fill all required fields.');
      return;
    }
    for (const edu of resumeForm.education) {
      if (!edu.degree || !edu.school || !edu.city || !edu.country || !edu.graduationDate) {
        alert('Please fill all required education fields.');
        return;
      }
    }
    for (const exp of resumeForm.experience) {
      if (!exp.role || !exp.company || !exp.city || !exp.country || !exp.startDate || !exp.endDate || !exp.description) {
        alert('Please fill all required experience fields.');
        return;
      }
    }
    for (const proj of resumeForm.projects) {
      if (!proj.title || !proj.description) {
        alert('Please fill all required project fields.');
        return;
      }
    }
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    const user = JSON.parse(userInfo);
    fetch('/api/ownresume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user.email,
        jobTitle: resumeForm.summary, // or another field for job title
        candidateName: resumeForm.name,
        resumeText: resumeForm, // Save as object
        createdAt: new Date()
      })
    }).then(() => {
      setShowResumeModal(false);
      setResumeForm({
        name: '', email: '', phone: '', city: '', country: '', linkedin: '', github: '', summary: '', skills: '',
        education: [ { ...emptyEducation } ], experience: [ { ...emptyExperience } ], projects: [{ ...emptyProject }]
      });
      // Refetch resumes after creation
      fetch(`/api/user-resumes?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setCreatedResumes(data.resumes || []));
      // Add to recent activity
      setRecentActivities(prev => ([{
        type: 'upload',
        message: 'Created a new resume',
        detail: resumeForm.name,
        timestamp: Date.now(),
        timeAgo: 'just now'
      }, ...prev]));
      alert('Resume created!');
    });
  }

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      const activities: Activity[] = JSON.parse(localStorage.getItem(`activity_${user.email}`) || '[]');
      setRecentActivities(activities.map((a: Activity) => ({
        ...a,
        timeAgo: getTimeAgo(a.timestamp)
      })));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    router.push('/');
  };

  function handleDownloadResumePDF(resume: any) {
    fetch('/api/generateResumePdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to generate PDF');
        const data = await res.json();
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,' + data.base64;
        const name =
        (typeof resume.name === 'string' && resume.name.trim()) ||
        (typeof resume.candidateName === 'string' && resume.candidateName.trim()) ||
        (resume.resumeText && typeof resume.resumeText.name === 'string' && resume.resumeText.name.trim()) ||
        'Resume';
      link.download = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        alert('Failed to generate PDF: ' + err.message);
      });
  }

  function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  let parsedResume: any = null;
  if (showResumeView !== null && createdResumes[showResumeView]) {
    const resume = createdResumes[showResumeView];
    parsedResume = resume;
    if (resume && typeof resume.resumeText === 'string') {
      try {
        parsedResume = JSON.parse(resume.resumeText);
      } catch {
        parsedResume = resume;
      }
    } else if (resume && typeof resume.resumeText === 'object') {
      parsedResume = resume.resumeText;
    }
  }
  const education = parsedResume && Array.isArray(parsedResume.education) ? parsedResume.education : [];
  const projects = parsedResume && Array.isArray(parsedResume.projects) ? parsedResume.projects : [];
  const experience = parsedResume && Array.isArray(parsedResume.experience) ? parsedResume.experience : [];

  const handleDeleteResume = async (resumeId: string) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    const user = JSON.parse(userInfo);
    await fetch(`/api/ownresume?id=${resumeId}`, { method: 'DELETE' });
    // Refetch resumes
    fetch(`/api/user-resumes?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setCreatedResumes(data.resumes || []));
  };

  return (
    <>
      <Head>
        <title>Dashboard - Resume Tailor</title>
        <meta name="description" content="Manage your resumes, upload PDFs, and track your professional documents" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Navbar */}
        <Navbar userName={userName} />

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl shadow-2xl p-8 mb-8 border border-green-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-green-800 mb-2 animate-fade-in">
                  Welcome back, {userName || 'User'}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  Create, edit, and manage your professional resumes with our easy-to-use tools.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-700">{resumesCreated}</div>
                    <div className="text-green-600 font-medium">Resumes Built</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-700">{pdfsUploaded}</div>
                    <div className="text-blue-600 font-medium">ATS Checked</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-700">{totalActivities}</div>
                    <div className="text-purple-600 font-medium">Total Activities</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-700">100%</div>
                    <div className="text-orange-600 font-medium">ATS Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
                onClick={() => setShowResumeModal(true)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="font-semibold text-lg">Create New Resume</div>
                  <div className="text-sm opacity-90 mt-1">Build from scratch</div>
                </div>
              </button>
              
              <button 
                className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
                onClick={() => setShowUploadModal(true)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="font-semibold text-lg">Upload Resume</div>
                  <div className="text-sm opacity-90 mt-1">Import existing PDF</div>
                </div>
              </button>
              
              <button 
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                onClick={() => router.push('/generate-cv')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-lg">Generate CV</div>
                  <div className="text-sm opacity-90 mt-1">AI-powered tailoring</div>
                </div>
              </button>
              
              <button 
                className="group bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                onClick={() => router.push('/ats-checker')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-lg">ATS Checker</div>
                  <div className="text-sm opacity-90 mt-1">Optimize for ATS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div id="recent-activity-section" className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.filter(a => a.type !== 'login').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l4 4m-4-4l-4 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No recent activity</p>
                  <p className="text-gray-400 text-sm">Start by creating or uploading a resume</p>
                </div>
              ) : (
                recentActivities.filter(a => a.type !== 'login').map((activity, idx) => (
                  <div key={idx} className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 p-6 rounded-xl relative transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 hover:border-blue-300">
                    {/* Delete cross for uploaded resumes */}
                    {activity.type === 'upload' && activity.detail && (
                      <button
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Delete uploaded resume and activity"
                        onClick={() => {
                          const userInfo = localStorage.getItem('userInfo');
                          if (!userInfo) return;
                          const user = JSON.parse(userInfo);
                          // Remove PDF
                          const pdfs = JSON.parse(localStorage.getItem(`pdfs_${user.email}`) || '[]');
                          const updatedPDFs = pdfs.filter((pdf: any) => pdf.name !== activity.detail);
                          localStorage.setItem(`pdfs_${user.email}`, JSON.stringify(updatedPDFs));
                          setUploadedPDFs(updatedPDFs);
                          // Remove activity
                          const updatedActivities = recentActivities.filter((_, i) => i !== idx);
                          localStorage.setItem(`activity_${user.email}`, JSON.stringify(updatedActivities));
                          setRecentActivities(updatedActivities.map((a: Activity) => ({ ...a, timeAgo: getTimeAgo(a.timestamp) })));
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        activity.type === 'upload' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'upload' ? (
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">
                          {activity.type === 'upload' && activity.detail ? (
                            <span className="text-green-700 cursor-pointer hover:underline transition-colors duration-200" onClick={() => {
                              const userInfo = localStorage.getItem('userInfo');
                              if (!userInfo) return;
                              const user = JSON.parse(userInfo);
                              const pdfs = JSON.parse(localStorage.getItem(`pdfs_${user.email}`) || '[]');
                              const found = pdfs.find((pdf: any) => pdf.name === activity.detail);
                              if (found) setShowPdfModal(found);
                            }}>
                              📄 {activity.detail}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              {activity.type === 'upload' ? '📤' : '📝'} {activity.message}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{activity.detail}</div>
                      </div>
                      
                      <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                        {activity.timeAgo}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        {/* My Resumes Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Resumes
          </h2>
          
          {createdResumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-6">Create your first professional resume to get started</p>
              <button 
                onClick={() => setShowResumeModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdResumes.filter(r => r._id).map((resume, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 relative hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <button
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Delete created resume"
                    onClick={() => handleDeleteResume(resume._id)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {(parsedResume && parsedResume.name) || resume.candidateName || 'Resume'}
                    </h3>
                    <p className="text-sm text-gray-500">Created {getTimeAgoFromDate(resume.createdAt)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                      onClick={() => setShowResumeView(idx)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Resume
                    </button>
                    <button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                      onClick={() => handleDownloadResumePDF(resume)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div id="pro-tips-section" className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Pro Tips & Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-green-800 mb-2 text-lg">Start with a Template</h3>
              <p className="text-green-700">Choose from our professional templates to get started quickly and ensure your resume looks great.</p>
            </div>
            
            <div className="group bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-blue-800 mb-2 text-lg">Keep it Updated</h3>
              <p className="text-blue-700">Regularly update your resume with new skills, experiences, and achievements to stay competitive.</p>
            </div>
            
            <div className="group bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-purple-800 mb-2 text-lg">ATS Optimization</h3>
              <p className="text-purple-700">Use our ATS checker to ensure your resume passes through Applicant Tracking Systems effectively.</p>
            </div>
            
            <div className="group bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-orange-800 mb-2 text-lg">AI-Powered Tailoring</h3>
              <p className="text-orange-700">Use our AI-powered CV generator to tailor your resume for specific job positions automatically.</p>
            </div>
            
            <div className="group bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-red-200">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-red-800 mb-2 text-lg">Get Feedback</h3>
              <p className="text-red-700">Use our feedback system to get professional insights and improve your resume's effectiveness.</p>
            </div>
            
            <div className="group bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold text-indigo-800 mb-2 text-lg">Multiple Formats</h3>
              <p className="text-indigo-700">Export your resume in multiple formats including PDF for professional submissions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Creation Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowResumeModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Create New Resume</h2>
            <form onSubmit={handleCreateResume} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={resumeForm.name} onChange={handleResumeFormChange} required placeholder="Full Name *" className="w-full border rounded-lg p-2" />
                <input name="email" value={resumeForm.email} onChange={handleResumeFormChange} required placeholder="Email *" className="w-full border rounded-lg p-2" />
                <input name="phone" value={resumeForm.phone} onChange={handleResumeFormChange} required placeholder="Phone *" className="w-full border rounded-lg p-2" />
                <input name="city" value={resumeForm.city} onChange={handleResumeFormChange} required placeholder="City *" className="w-full border rounded-lg p-2" />
                <input name="country" value={resumeForm.country} onChange={handleResumeFormChange} required placeholder="Country *" className="w-full border rounded-lg p-2" />
                <input name="linkedin" value={resumeForm.linkedin} onChange={handleResumeFormChange} placeholder="LinkedIn (optional)" className="w-full border rounded-lg p-2" />
                <input name="github" value={resumeForm.github} onChange={handleResumeFormChange} placeholder="GitHub (optional)" className="w-full border rounded-lg p-2" />
              </div>
              <textarea name="summary" value={resumeForm.summary} onChange={handleResumeFormChange} required placeholder="Summary / Objective *" className="w-full border rounded-lg p-2" />
              <input name="skills" value={resumeForm.skills} onChange={handleResumeFormChange} required placeholder="Skills (comma separated) *" className="w-full border rounded-lg p-2" />
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Education</h3>
                {resumeForm.education.map((edu, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-2 relative">
                    {resumeForm.education.length > 1 && (
                      <button type="button" className="absolute top-2 right-2 text-red-500" onClick={() => removeEducation(idx)}>&times;</button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input name="degree" value={edu.degree} onChange={e => handleEducationChange(idx, e)} required placeholder="Degree *" className="border rounded-lg p-2" />
                      <input name="school" value={edu.school} onChange={e => handleEducationChange(idx, e)} required placeholder="University / School *" className="border rounded-lg p-2" />
                      <input name="city" value={edu.city} onChange={e => handleEducationChange(idx, e)} required placeholder="City *" className="border rounded-lg p-2" />
                      <input name="country" value={edu.country} onChange={e => handleEducationChange(idx, e)} required placeholder="Country *" className="border rounded-lg p-2" />
                      <input name="graduationDate" type="date" value={edu.graduationDate} onChange={e => handleEducationChange(idx, e)} required placeholder="Graduation Date *" className="border rounded-lg p-2" />
                      <input name="cgpa" value={edu.cgpa} onChange={e => handleEducationChange(idx, e)} placeholder="CGPA (optional)" className="border rounded-lg p-2" />
                      <input name="coursework" value={edu.coursework} onChange={e => handleEducationChange(idx, e)} placeholder="Relevant Coursework (optional)" className="border rounded-lg p-2" />
                    </div>
                  </div>
                ))}
                <button type="button" className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded" onClick={addEducation}>+ Add Education</button>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Projects</h3>
                {resumeForm.projects.map((proj, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-2 relative">
                    {resumeForm.projects.length > 1 && (
                      <button type="button" className="absolute top-2 right-2 text-red-500" onClick={() => removeProject(idx)}>&times;</button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input name="title" value={proj.title} onChange={e => handleProjectChange(idx, e)} required placeholder="Project Title *" className="border rounded-lg p-2" />
                      <input name="technologies" value={proj.technologies} onChange={e => handleProjectChange(idx, e)} placeholder="Technologies Used (optional)" className="border rounded-lg p-2" />
                      <textarea name="description" value={proj.description} onChange={e => handleProjectChange(idx, e)} required placeholder="Description *" className="border rounded-lg p-2 col-span-2" />
                    </div>
                  </div>
                ))}
                <button type="button" className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded" onClick={addProject}>+ Add Project</button>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Experience</h3>
                {resumeForm.experience.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-2 relative">
                    {resumeForm.experience.length > 1 && (
                      <button type="button" className="absolute top-2 right-2 text-red-500" onClick={() => removeExperience(idx)}>&times;</button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input name="role" value={exp.role} onChange={e => handleExperienceChange(idx, e)} required placeholder="Role / Job Title *" className="border rounded-lg p-2" />
                      <input name="company" value={exp.company} onChange={e => handleExperienceChange(idx, e)} required placeholder="Company / Organization *" className="border rounded-lg p-2" />
                      <input name="city" value={exp.city} onChange={e => handleExperienceChange(idx, e)} required placeholder="City *" className="border rounded-lg p-2" />
                      <input name="country" value={exp.country} onChange={e => handleExperienceChange(idx, e)} required placeholder="Country *" className="border rounded-lg p-2" />
                      <input name="startDate" type="date" value={exp.startDate} onChange={e => handleExperienceChange(idx, e)} required placeholder="Start Date *" className="border rounded-lg p-2" />
                      <input name="endDate" type="date" value={exp.endDate} onChange={e => handleExperienceChange(idx, e)} required placeholder="End Date *" className="border rounded-lg p-2" />
                      <textarea name="description" value={exp.description} onChange={e => handleExperienceChange(idx, e)} required placeholder="Description *" className="border rounded-lg p-2 col-span-2" />
                    </div>
                  </div>
                ))}
                <button type="button" className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded" onClick={addExperience}>+ Add Experience</button>
              </div>
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg">Create Resume</button>
            </form>
          </div>
        </div>
      )}

      {/* Resume View Modal */}
      {showResumeView !== null && createdResumes[showResumeView] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowResumeView(null)}>&times;</button>
            <div className="mb-4 text-2xl font-bold text-green-800">
              {parsedResume?.name?.trim() || createdResumes[showResumeView].candidateName?.trim() || 'Resume'}
            </div>
            <div className="mb-2"><b>Email:</b> {parsedResume.email || ''}</div>
            <div className="mb-2"><b>Phone:</b> {parsedResume.phone || ''}</div>
            <div className="mb-2"><b>City:</b> {parsedResume.city || ''}</div>
            <div className="mb-2"><b>Country:</b> {parsedResume.country || ''}</div>
            {parsedResume.linkedin && <div className="mb-2"><b>LinkedIn:</b> {parsedResume.linkedin}</div>}
            {parsedResume.github && <div className="mb-2"><b>GitHub:</b> {parsedResume.github}</div>}
            <div className="mb-2"><b>Summary:</b> {parsedResume.summary || ''}</div>
            <div className="mb-2"><b>Skills:</b> {parsedResume.skills || ''}</div>
            <div className="mb-2"><b>Education:</b>
              <ul className="list-disc ml-6">
                {education.length > 0 ? education.map((edu: any, i: number) => (
                  <li key={i}>
                    <b>{edu.degree}</b> at <b>{edu.school}</b>, {edu.city}, {edu.country} <br />
                    Graduation: {edu.graduationDate} {edu.cgpa && <>| CGPA: {edu.cgpa}</>} {edu.coursework && <>| Coursework: {edu.coursework}</>}
                  </li>
                )) : (
                  <li>No education details available.</li>
                )}
              </ul>
            </div>
            <div className="mb-2"><b>Projects:</b>
              <ul className="list-disc ml-6">
                {projects.length > 0 ? projects.map((proj: any, i: number) => (
                  <li key={i}>
                    <b>{proj.title}</b>{proj.technologies && <> | <span className="italic">{proj.technologies}</span></>}<br />
                    {proj.description}
                  </li>
                )) : (
                  <li>No project details available.</li>
                )}
              </ul>
            </div>
            <div className="mb-2"><b>Experience:</b>
              <ul className="list-disc ml-6">
                {experience.length > 0 ? experience.map((exp: any, i: number) => (
                  <li key={i}>
                    <b>{exp.role}</b> at <b>{exp.company}</b>, {exp.city}, {exp.country} <br />
                    {exp.startDate} - {exp.endDate} <br />
                    {exp.description}
                  </li>
                )) : (
                  <li>No experience details available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Upload Resume Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowUploadModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Upload Resume (PDF)</h2>
            <FileReader onFileRead={(file, dataUrl) => {
              const userInfo = localStorage.getItem('userInfo');
              if (!userInfo) return;
              const user = JSON.parse(userInfo);
              const pdfs = JSON.parse(localStorage.getItem(`pdfs_${user.email}`) || '[]');
              const newPDF = {
                name: file.name,
                data: dataUrl,
                uploadedAt: Date.now()
              };
              const updatedPDFs = [newPDF, ...pdfs];
              localStorage.setItem(`pdfs_${user.email}`, JSON.stringify(updatedPDFs));
              setUploadedPDFs(updatedPDFs);
              // Add activity
              const activities = JSON.parse(localStorage.getItem(`activity_${user.email}`) || '[]');
              const newActivity = {
                type: 'upload',
                message: 'Resume uploaded',
                detail: file.name,
                timestamp: Date.now()
              };
              const updatedActivities = [newActivity, ...activities];
              localStorage.setItem(`activity_${user.email}`, JSON.stringify(updatedActivities));
              setRecentActivities(updatedActivities.map((a: Activity) => ({ ...a, timeAgo: getTimeAgo(a.timestamp) })));
              setShowUploadModal(false);
              alert('Resume uploaded!');
            }} />
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowPdfModal(null)}>&times;</button>
            <h2 className="text-2xl font-bold text-green-800 mb-4">{showPdfModal.name}</h2>
            <embed src={showPdfModal.data} type="application/pdf" className="w-full h-[70vh] border rounded" />
            <a href={showPdfModal.data} download={showPdfModal.name} className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Download</a>
          </div>
        </div>
      )}

      <Footer />  
      </div>
    </>
  );
};

export default Dashboard; 