import { useState } from 'react';
import { MessageSquarePlus, CheckCircle2, Send } from 'lucide-react';
import { saveSupervisorFeedback } from '../utils/storage';

export default function SupervisorFeedbackTab() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please fill in your name and comment before submitting.');
      return;
    }
    setError('');
    saveSupervisorFeedback({ name, role, message });
    setSubmitted(true);
    setName('');
    setRole('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1565C0]/10">
          <MessageSquarePlus className="h-5 w-5 text-[#1565C0]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0A1628]">Supervisor Feedback</h2>
          <p className="text-sm text-gray-500">
            Share your suggestions or change requests for this interface.
          </p>
        </div>
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium">Thank you! Your feedback has been recorded.</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-[#E3EAF2] bg-white shadow-md"
      >
        <div className="border-b border-[#E3EAF2] bg-gray-50 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your Details &amp; Comment
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Jane Smith"
              className="w-full rounded-lg border border-[#E3EAF2] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/25"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Role / Title <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Radiologist, Supervisor…"
              className="w-full rounded-lg border border-[#E3EAF2] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/25"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Comment / Suggestion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Describe the change, update, or suggestion you'd like to see in this interface…"
              className="w-full resize-y rounded-lg border border-[#E3EAF2] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/25"
            />
          </div>
        </div>

        <div className="border-t border-[#E3EAF2] bg-gray-50 px-5 py-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1565C0] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0d47a1] active:scale-95 transition-transform"
          >
            <Send className="h-4 w-4" />
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
