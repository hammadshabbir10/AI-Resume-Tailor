import React from 'react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import Image from 'next/image';

const bloggers = [
  { name: 'Sarah Chen', image: '/bloggers/blogger1.png', specialty: 'AI & Tech', desc: 'Sarah writes about the latest in artificial intelligence and technology trends.' },
  { name: 'Maria Rodriguez', image: '/bloggers/blogger2.png', specialty: 'Sustainability', desc: 'Maria shares tips and stories on sustainable living and eco-friendly habits.' },
  { name: 'Alex Thompson', image: '/bloggers/blogger3.png', specialty: 'Marketing', desc: 'Alex covers digital marketing strategies and industry insights.' },
  { name: 'Emily Watson', image: '/bloggers/blogger4.png', specialty: 'Health & Wellness', desc: 'Emily focuses on mental health, wellness, and digital wellbeing.' },
  { name: 'David Kim', image: '/bloggers/blogger5.png', specialty: 'Finance', desc: 'David provides advice on personal finance and smart investing.' },
  { name: 'Lisa Park', image: '/bloggers/blogger6.png', specialty: 'Travel', desc: 'Lisa explores travel destinations and shares travel hacks.' },
];

export default function LearnMore() {
  return (
    <>
     <Navbar   />
    <div className="bg-blue-50 min-h-screen w-full flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center">Learn More</h1>
        <section className="max-w-3xl mx-auto mb-12 bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">How to Use Nexium Blog Summarizer</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Go to the Dashboard and paste or write your blog content.</li>
            <li>Click <span className="font-semibold text-blue-600">Summarize</span> to generate an AI-powered summary.</li>
            <li>Click <span className="font-semibold text-blue-600">Translate</span> to see the summary in Urdu.</li>
            <li>Save your favorite summaries to your account for future reference.</li>
            <li>Access your saved blogs and summaries anytime from the My Blogs section.</li>
          </ol>
        </section>
        <section className="max-w-3xl mx-auto mb-12 bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>AI-powered blog summarization for quick insights.</li>
            <li>Instant Urdu translation of summaries.</li>
            <li>Save and manage your favorite blogs and summaries.</li>
            <li>Secure storage using Supabase and MongoDB.</li>
            <li>Modern, user-friendly interface with step-by-step workflow.</li>
          </ul>
        </section>
        <section className="max-w-5xl mx-auto mb-12 bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-8 text-blue-700 text-center">Meet Our Bloggers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bloggers.map((blogger) => (
              <div key={blogger.name} className="flex flex-col items-center bg-blue-50 rounded-lg p-4 shadow-sm">
                <Image src={blogger.image} alt={blogger.name} width={80} height={80} className="rounded-full mb-3 object-cover" />
                <div className="text-lg font-bold text-blue-700">{blogger.name}</div>
                <div className="text-sm text-blue-500 mb-1">{blogger.specialty}</div>
                <div className="text-gray-600 text-center text-sm">{blogger.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>  
    </div>
    <Footer />
    </>
  );
}