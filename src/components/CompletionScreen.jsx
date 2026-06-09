import { CheckCircle2, Download, UserPlus } from 'lucide-react';
import { RATING_OPTIONS } from './RatingCard';
import Disclaimer from './Disclaimer';
import { exportReviewerRatings } from '../utils/export';

const RATING_COLORS = {
  'Hallucination-Free': '#2E7D32',
  Low: '#558B2F',
  Moderate: '#F57F17',
  High: '#E65100',
  Severe: '#BF360C',
};

export default function CompletionScreen({
  reviewerName,
  reviewerRole,
  ratings,
  samplesById,
  onNewReviewer,
}) {
  const total = ratings.length;
  const counts = {};
  for (const opt of RATING_OPTIONS) counts[opt.id] = 0;
  for (const r of ratings) {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  }

  function handleDownload() {
    exportReviewerRatings(reviewerName, reviewerRole, ratings, samplesById);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="bg-[#0A1628] px-6 py-6 text-center text-white shadow-md">
        <h1 className="text-xl font-bold md:text-2xl">
          Radiology Report Human Evaluation Study
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
        <div className="rounded-lg border border-[#E3EAF2] bg-white p-8 text-center shadow-md">
          <CheckCircle2 className="mx-auto h-20 w-20 text-[#2E7D32]" strokeWidth={1.5} />
          <h2 className="mt-4 text-2xl font-bold text-[#0A1628]">Evaluation Complete!</h2>
          <p className="mt-2 text-gray-700">
            Thank you, <span className="font-semibold">{reviewerName}</span>. You rated all{' '}
            {total} reports.
          </p>

          <div className="mt-8 text-left">
            <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-gray-500">
              Your ratings breakdown
            </h3>
            <div className="space-y-3">
              {RATING_OPTIONS.map((opt) => {
                const count = counts[opt.id] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const color = RATING_COLORS[opt.id] ?? '#1565C0';
                return (
                  <div key={opt.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{opt.title}</span>
                      <span className="text-gray-600">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1565C0] px-6 py-3 font-semibold text-white hover:bg-[#0d47a1]"
            >
              <Download className="h-5 w-5" />
              Download My Results (CSV)
            </button>
            <button
              type="button"
              onClick={onNewReviewer}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#E3EAF2] bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <UserPlus className="h-5 w-5" />
              New Reviewer
            </button>
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
