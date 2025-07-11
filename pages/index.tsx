import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import { Button } from '../components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/UI/card';
// import { summarizeText } from '../lib/summarize';
import translateToUrdu from '../lib/urduDictionary';

// Social icons SVGs
const LinkedInIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
);
const InstagramIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.012-4.947.07-1.276.058-2.687.334-3.678 1.325-.991.991-1.267 2.402-1.325 3.678-.058 1.28-.07 1.688-.07 4.947s.012 3.667.07 4.947c.058 1.276.334 2.687 1.325 3.678.991.991 2.402 1.267 3.678 1.325 1.28.058 1.688.07 4.947.07s3.667-.012 4.947-.07c1.276-.058 2.687-.334 3.678-1.325.991-.991 1.267-2.402 1.325-3.678.058-1.28.07-1.688.07-4.947s-.012-3.667-.07-4.947c-.058-1.276-.334-2.687-1.325-3.678-.991-.991-2.402-1.267-3.678-1.325-1.28-.058-1.688-.07-4.947-.07zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);
const TwitterIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482c-4.083-.205-7.697-2.162-10.125-5.134a4.822 4.822 0 0 0-.664 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
);
const GitHubIcon = () => (
  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

// Demo blogs data
const demoBlogs = [
  {
    id: 1,
    title: "The Future of Artificial Intelligence",
    author: "Dr. Sarah Chen",
    excerpt: "Exploring how AI is transforming industries and reshaping our daily lives...",
    image: "/bloggers/favorite1.png",
    url: "https://example.com/ai-future"
  },
  {
    id: 2,
    title: "Sustainable Living in Modern Cities",
    author: "Maria Rodriguez",
    excerpt: "Practical tips for reducing your carbon footprint while living in urban areas...",
    image: "/bloggers/favorites2.png",
    url: "https://example.com/sustainable-living"
  },
  {
    id: 3,
    title: "Digital Marketing Trends 2024",
    author: "Alex Thompson",
    excerpt: "The latest strategies and tools that are dominating the digital marketing landscape...",
    image: "/bloggers/favorites3.jpg",
    url: "https://example.com/marketing-trends"
  },
  {
    id: 4,
    title: "Mental Health in the Digital Age",
    author: "Dr. Emily Watson",
    excerpt: "How technology affects our mental wellbeing and strategies for digital wellness...",
    image: "/bloggers/favorites4.png",
    url: "https://example.com/mental-health"
  }
];


export default function Home() {
  const [summaries, setSummaries] = useState<{ [id: number]: string }>({});
  const [urduTranslations, setUrduTranslations] = useState<{ [id: number]: string }>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is the Blog Summarizer?',
      answer: "It's a web app that uses AI to summarize blogs and instantly translate the summary to Urdu.",
    },
    {
      question: 'How accurate is the Urdu translation?',
      answer: 'We use a custom Urdu dictionary and AI-based translation for best results, but some nuances may vary.',
    },
    {
      question: 'Can I save my summaries?',
      answer: 'Yes! You can save your favorite summaries to your account, backed by Supabase and MongoDB.',
    },
    {
      question: 'Is it free to use?',
      answer: 'The basic features are free. Advanced features may require an account or subscription in the future.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 mb-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-800">Summarize & Translate Blogs Instantly</h1>
            <p className="text-lg text-gray-600 mb-8">
              AI-powered blog summarization and Urdu translation in one click.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
              <Link href="/learn-more">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn More
              </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-8 md:mt-0">
            <Image
              src="/bloggers/favorites.png" // Use your existing image or replace with another
              alt="Bloggers illustration"
              width={350}
              height={350}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-xl p-12 mb-24 mt-12 max-w-6xl mx-auto">
        <h3 className="text-center text-gray-500 font-semibold mb-2 tracking-widest">HOW IT WORKS</h3>
        <h2 className="text-3xl font-bold text-center mb-10">Convert in 3 simple steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Write or Paste Your Blog</h4>
            <p className="text-gray-600 text-center">Enter your blog content to get started.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">AI Summarizes</h4>
            <p className="text-gray-600 text-center">Our AI generates a concise summary for you.</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Get Urdu Translation</h4>
            <p className="text-gray-600 text-center">Instantly see your summary in Urdu.</p>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Demo Blogs Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Featured Blogs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoBlogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={250}
                    height={128}
                    className="object-cover w-full h-32 rounded-lg"
                  /></div>
                  <CardTitle className="text-lg">{blog.title}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    By {blog.author}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-gray-600 mb-4 line-clamp-3 min-h-[60px]">{blog.excerpt}</p>
                  </div>
                  <div className="flex flex-col flex-1 justify-end">
                    <div className="flex space-x-2 mt-auto">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                        onClick={() => {
                          const summary = blog.excerpt; // Replace with summarizeText(blog.excerpt) if available
                          setSummaries(prev => ({ ...prev, [blog.id]: summary }));
                        }}
                      >
                        Summarize
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          const summary = summaries[blog.id] || blog.excerpt; // Replace with summarizeText(blog.excerpt) if available
                          const urdu = translateToUrdu(summary);
                          setUrduTranslations(prev => ({ ...prev, [blog.id]: urdu }));
                        }}
                      >
                        Translate
                      </Button>
                    </div>
                    {summaries[blog.id] && (
                      <div className="mt-2 text-sm text-blue-700">Summary: {summaries[blog.id]}</div>
                    )}
                    {urduTranslations[blog.id] && (
                      <div className="mt-2 text-sm text-green-700">Urdu: {urduTranslations[blog.id]}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {/* FAQ Section */}
        <section className="bg-white rounded-xl shadow p-10 max-w-4xl mx-auto mb-20">
          <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b last:border-b-0 pb-4">
                <button
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="font-semibold text-blue-600 text-lg">{faq.question}</span>
                  <span className="ml-4 text-2xl text-blue-600 font-bold select-none">
                    {openFaq === idx ? '-' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}
                  style={{}}
                >
                  <p className="text-gray-700 pl-1 pr-8">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    
    </>
  );
} 