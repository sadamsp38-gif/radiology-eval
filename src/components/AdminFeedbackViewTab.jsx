import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Trash2, Inbox } from 'lucide-react';
import { getAllSupervisorFeedback, clearSupervisorFeedback } from '../utils/storage';

const PASSKEY = 'sp12345';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminFeedbackViewTab() {
  const [inputKey, setInputKey] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [keyError, setKeyError] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);

  function handleUnlock(e) {
    e.preventDefault();
    if (inputKey === PASSKEY) {
      setUnlocked(true);
      setKeyError(false);
      setFeedbackList(getAllSupervisorFeedback());
    } else {
      setKeyError(true);
    }
  }

  function handleClear() {
    const ok = window.confirm(
      'This will permanently delete ALL supervisor feedback. Continue?',
    );
    if (!ok) return;
    clearSupervisorFeedback();
    setFeedbackList([]);
  }

  function handleRefresh() {
    setFeedbackList(getAllSupervisorFeedback());
  }

  // ── Lock screen ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E3EAF2] bg-white shadow-xl">
          {/* Icon header */}
          <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-[#0A1628] to-[#1565C0] px-6 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Protected Area</h2>
            <p className="text-center text-sm text-blue-200">
              Enter the admin passkey to view supervisor feedback.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="px-6 py-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Passkey
              </label>
              <div className="relative">
                <input
                  type={showInput ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => { setInputKey(e.target.value); setKeyError(false); }}
                  placeholder="Enter passkey…"
                  autoComplete="current-password"
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${
                    keyError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50'
                      : 'border-[#E3EAF2] focus:border-[#1565C0] focus:ring-[#1565C0]/25'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowInput((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {keyError && (
                <p className="mt-1.5 text-xs font-medium text-red-600">Incorrect passkey. Please try again.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#1565C0] py-2.5 text-sm font-semibold text-white hover:bg-[#0d47a1] active:scale-95 transition-transform"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Unlocked view ────────────────────────────────────────────────────────
  return (
    <div className="py-6">
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <ShieldCheck className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Supervisor Feedback</h2>
            <p className="text-sm text-gray-500">
              {feedbackList.length} submission{feedbackList.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E3EAF2] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E3EAF2] bg-white shadow-md">
        {feedbackList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Inbox className="h-10 w-10" />
            <p className="text-sm font-medium">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Comment / Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((fb, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#E3EAF2] align-top hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-[#0A1628]">{fb.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{fb.role || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {formatDate(fb.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <p className="max-w-[420px] whitespace-pre-wrap break-words">{fb.message}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
