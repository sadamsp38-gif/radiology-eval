import { useState } from 'react';
import { Lock, ShieldCheck, Trash2, User, MessageSquare } from 'lucide-react';
import {
  getAllSupervisorFeedback,
  clearSupervisorFeedback,
} from '../utils/storage';

const PASSKEY = 'sp12345';

function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso ?? '—';
  }
}

export default function AdminFeedbackViewTab() {
  const [passkey, setPasskey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const feedback = unlocked ? getAllSupervisorFeedback() : [];

  function handleUnlock(e) {
    e.preventDefault();
    if (passkey === PASSKEY) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect passkey. Please try again.');
    }
  }

  function handleLock() {
    setUnlocked(false);
    setPasskey('');
    setError('');
  }

  function handleClearAll() {
    const ok = window.confirm(
      'Delete all supervisor feedback stored in this browser? This cannot be undone.',
    );
    if (!ok) return;
    clearSupervisorFeedback();
    setRefreshKey((k) => k + 1);
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="overflow-hidden rounded-xl border border-[#E3EAF2] bg-white shadow-md">
          <div className="border-b border-[#E3EAF2] bg-gray-50 px-5 py-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1565C0]/10">
              <Lock className="h-6 w-6 text-[#1565C0]" />
            </div>
            <h2 className="text-lg font-bold text-[#0A1628]">View Supervisor Feedback</h2>
            <p className="mt-1 text-sm text-gray-500">Enter passkey to view submitted suggestions</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 px-5 py-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Passkey</label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError('');
                }}
                placeholder="Enter passkey"
                autoComplete="off"
                className="w-full rounded-lg border border-[#E3EAF2] px-4 py-2.5 text-sm focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/25"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-[#1565C0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d47a1]"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const list = getAllSupervisorFeedback();
  void refreshKey;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <ShieldCheck className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Supervisor Suggestions</h2>
            <p className="text-sm text-gray-500">
              {list.length} submission{list.length !== 1 ? 's' : ''} in this browser
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLock}
            className="rounded-lg border border-[#E3EAF2] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Lock
          </button>
          {list.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear all feedback
            </button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-[#E3EAF2] bg-white px-6 py-12 text-center shadow-sm">
          <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No supervisor feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...list].reverse().map((entry, i) => (
            <article
              key={`${entry.timestamp}-${i}`}
              className="overflow-hidden rounded-xl border border-[#E3EAF2] bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3EAF2] bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-[#0A1628]">{entry.name}</span>
                  {entry.role?.trim() && (
                    <span className="text-gray-500">· {entry.role}</span>
                  )}
                </div>
                <time className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</time>
              </div>
              <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-gray-700">
                {entry.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
