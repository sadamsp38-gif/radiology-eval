import { useState } from 'react';
import { getAllRatings, getReviewerInfo } from '../utils/storage';
import Disclaimer from './Disclaimer';

const ROLES = ['Radiologist', 'Medical Student', 'Researcher', 'General Reviewer'];

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [error, setError] = useState('');
  const [welcomeBack, setWelcomeBack] = useState(null);

  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name or anonymous ID before starting.');
      return;
    }
    setError('');
    const existing = getAllRatings(trimmed);
    if (existing.length > 0) {
      setWelcomeBack({ count: existing.length, name: trimmed });
      return;
    }
    onStart(trimmed, role);
  }

  function handleContinue() {
    onStart(welcomeBack.name, role, true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="bg-[#0A1628] px-6 py-8 text-center text-white shadow-md">
        <h1 className="text-2xl font-bold md:text-3xl">
          Radiology Report Human Evaluation Study
        </h1>
        <p className="mt-2 text-sm text-blue-100 md:text-base">
          SIBAU and NTNU &apos; 2026 — MedGemma AI Evaluation
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 md:px-6">
        <div className="rounded-lg border border-[#E3EAF2] bg-white p-6 shadow-md md:p-8">
          <p className="mb-6 leading-relaxed text-gray-700">
            You will review 100 chest X-ray images alongside AI-generated radiology reports.
            For each case, read the AI report carefully and rate how much hallucination it
            contains — meaning how much the AI report contains findings not supported by the
            X-ray.
          </p>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-semibold text-[#0A1628]">
              Your Name or Anonymous ID <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                setError('');
                setWelcomeBack(null);
                const info = getReviewerInfo(v.trim());
                if (info?.role) setRole(info.role);
              }}
              className="w-full rounded-lg border border-[#E3EAF2] px-4 py-2.5 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30"
              placeholder="e.g. Reviewer_A12"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1 block text-sm font-semibold text-[#0A1628]">Your Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-[#E3EAF2] px-4 py-2.5 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <div className="mb-6 rounded-lg border border-blue-200 bg-[#EFF6FF] p-4 text-sm leading-relaxed text-gray-700">
            <p className="mb-2 font-semibold text-[#1565C0]">Instructions:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Look at the chest X-ray image on the left</li>
              <li>Read the AI Generated Report on the right</li>
              <li>Compare it with the Reference Report written by a radiologist</li>
              <li>Select the rating that best describes the AI report quality</li>
              <li>Click Save &amp; Next to proceed</li>
            </ol>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {welcomeBack && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-3 text-sm text-gray-800">
                Welcome back! You have rated {welcomeBack.count} report
                {welcomeBack.count !== 1 ? 's' : ''}. Continue from where you left off?
              </p>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-lg bg-[#1565C0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d47a1]"
              >
                Yes, continue
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-lg bg-[#2E7D32] px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2"
          >
            START EVALUATION
          </button>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
