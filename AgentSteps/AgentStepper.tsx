import React from "react";

const steps = [
  {
    title: "Input Blog",
    description: "Write or paste your blog content to get started."
  },
  {
    title: "Summarize",
    description: "AI generates a concise summary for you."
  },
  {
    title: "Translate to Urdu",
    description: "Instantly see your summary in Urdu."
  },
  {
    title: "Save to DB",
    description: "Store your results for future reference."
  }
];

export default function AgentStepper({ step = 0 }: { step?: number }) {
  return (
    <div className="flex flex-col items-center my-12 px-2 w-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-6 sm:gap-8 md:gap-12 w-full max-w-xl">
        {steps.map((s, i) => (
          <StepCard key={i} num={i + 1} step={s} active={step === i} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ num, step, active }: { num: number; step: { title: string; description: string }; active: boolean }) {
  return (
    <div className={`rounded-2xl shadow-lg p-6 sm:p-8 w-full min-w-[140px] flex flex-col items-center transition-all duration-200 ${
      active
        ? 'bg-blue-600 text-white scale-105 ring-4 ring-blue-200 font-bold'
        : 'bg-white text-blue-700 hover:shadow-xl'
    }`}>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 text-xl sm:text-2xl font-bold transition-all duration-200 ${
        active ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {num}
      </div>
      <h4 className="text-base sm:text-lg font-semibold mb-1">{step.title}</h4>
      <p className="text-center text-xs sm:text-sm font-normal">{step.description}</p>
    </div>
  );
}