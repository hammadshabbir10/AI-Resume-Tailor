import React, { useState } from "react";
import BlogInput from "../../Blog/BlogInput";
import AgentStepper from "../../AgentSteps/AgentStepper";
import { summarizeText } from "../api/summarize";
//import { translateToUrdu } from "../api/urduDictionary";

export default function Dashboard() {
  const [step, setStep] = useState(0); // 0: Input, 1: Summarize, 2: Translate, 3: Save
  const [blogText, setBlogText] = useState("");
  const [summary, setSummary] = useState("");
  const [urdu, setUrdu] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleBlogSubmit = async (text: string) => {
    setBlogText(text);
    setStep(1);

    let summaryText = "";
    let urduText= "";
    try {
      // Summarize via API
      const sumRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const sumData = await sumRes.json();
      summaryText = sumData.summary;
      setSummary(summaryText);
      setStep(2);
    } catch (err) {
      console.error("Error during summarization:", err);
      setSummary("Error: Could not summarize blog.");
      return;
    }

    try {
        // Translate via API
        const urduRes = await fetch("/api/urduDictionary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: summaryText }),
        });
        const urduData = await urduRes.json();
        setUrdu(urduData.urdu);
        setStep(3);
      
        // Save all together in MongoDB
        await fetch('/api/saveBlog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogText: text, summary: summaryText, urdu: urduData.urdu }),
        });
      } catch (err) {
        console.error("Error during translation or saving:", err);
        setUrdu("Error: Could not translate summary.");
        return;
      }

    // Save summary to Supabase
    await fetch('/api/saveSummary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: summaryText }),
    });

    // Save full blog text to MongoDB
    await fetch('/api/saveFullText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogText: text }), // <--- use the function argument, not state
    });
   
  };
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Blog Summarizer Workflow</h1>
      <AgentStepper step={step} />
      {step === 0 && <BlogInput onSubmit={handleBlogSubmit} />}
      {step > 0 && (
        <div className="mt-8 space-y-4">
          <div>
            <h2 className="font-semibold">Summary:</h2>
            <p>{summary}</p>
          </div>
          <div>
            <h2 className="font-semibold">Urdu Translation:</h2>
            <p>{urdu}</p>
          </div>
          {saving && <p>Saving to database...</p>}
          {saved && <p className="text-green-600">Saved successfully!</p>}
        </div>
      )}
    </div>
  );
}