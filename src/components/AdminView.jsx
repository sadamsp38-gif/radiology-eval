import { useMemo, useState } from 'react';
import { Download, FileText, Users, BarChart3, LayoutDashboard, Trash2, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import AdminNlgTab from './AdminNlgTab';
import SupervisorFeedbackTab from './SupervisorFeedbackTab';
import AdminFeedbackViewTab from './AdminFeedbackViewTab';
import samples from '../data/samples.json';
import {
  getAllReviewers,
  getAllRatings,
  getReviewerInfo,
  getAllRatingsAllReviewers,
  clearAllStudyData,
} from '../utils/storage';
import { exportAllRatings, exportComparison } from '../utils/export';
import Disclaimer from './Disclaimer';
import { RATING_OPTIONS } from './RatingCard';

const CLASS_ORDER = RATING_OPTIONS.map((o) => o.id);

function DetailTable({ rows, emptyMessage }) {
  if (rows.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2">Reviewer</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Sample</th>
            <th className="px-3 py-2">UID</th>
            <th className="px-3 py-2">Human Rating</th>
            <th className="px-3 py-2">Computed Class</th>
            <th className="px-3 py-2">Computed Score</th>
            <th className="px-3 py-2">CHAIR-S</th>
            <th className="px-3 py-2">NPV</th>
            <th className="px-3 py-2">PPV</th>
            <th className="px-3 py-2">Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-[#E3EAF2] hover:bg-gray-50">
              <td className="px-3 py-2 font-medium">{row.reviewerName}</td>
              <td className="px-3 py-2">{row.role}</td>
              <td className="px-3 py-2">{row.sampleId}</td>
              <td className="px-3 py-2">{row.uid}</td>
              <td className="px-3 py-2 font-medium">{row.rating}</td>
              <td className="px-3 py-2">{row.computedClass}</td>
              <td className="px-3 py-2">{row.computedScore}</td>
              <td className="px-3 py-2">{row.chairS}</td>
              <td className="px-3 py-2">{row.npv}</td>
              <td className="px-3 py-2">{row.ppv}</td>
              <td className="max-w-[220px] truncate px-3 py-2" title={row.comments}>
                {row.comments}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function enrichRating(r, samplesById) {
  const sample = samplesById.get(r.sampleId);
  const info = getReviewerInfo(r.reviewerName);
  return {
    key: `${r.reviewerName}-${r.sampleId}`,
    reviewerName: r.reviewerName,
    role: info?.role ?? '—',
    sampleId: r.sampleId,
    uid: sample?.uid ?? '',
    rating: r.rating,
    comments: r.comments ?? '',
    computedClass: sample?.computed_class ?? '',
    computedScore: sample?.computed_score ?? '',
    chairS: sample?.final_chair_s ?? '',
    npv: sample?.final_npv ?? '',
    ppv: sample?.final_ppv ?? '',
  };
}

const TABS = [
  { id: 'overview', label: 'Overview & ratings', icon: LayoutDashboard },
  { id: 'nlg', label: 'NLG vs AI category', icon: BarChart3 },
  { id: 'supervisor-feedback', label: 'Supervisor Feedback', icon: MessageSquarePlus },
  { id: 'view-feedback', label: 'View Feedback', icon: ShieldCheck },
];

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUid, setSelectedUid] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');

  const reviewers = getAllReviewers();
  const samplesById = new Map(samples.map((s) => [s.sample_id, s]));
  const samplesByUid = new Map(samples.map((s) => [s.uid, s]));

  const allRatingsEnriched = getAllRatingsAllReviewers()
    .map((r) => enrichRating(r, samplesById))
    .sort(
      (a, b) =>
        a.reviewerName.localeCompare(b.reviewerName) || a.sampleId - b.sampleId,
    );

  const uidsWithRatings = useMemo(() => {
    const set = new Set(allRatingsEnriched.map((r) => r.uid).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [allRatingsEnriched]);

  const reportWiseRows = useMemo(() => {
    if (!selectedUid) return [];
    return allRatingsEnriched.filter((r) => r.uid === selectedUid);
  }, [selectedUid, allRatingsEnriched]);

  const reviewerWiseRows = useMemo(() => {
    if (!selectedReviewer) return [];
    return allRatingsEnriched
      .filter((r) => r.reviewerName === selectedReviewer)
      .sort((a, b) => a.sampleId - b.sampleId);
  }, [selectedReviewer, allRatingsEnriched]);

  const selectedSample = selectedUid ? samplesByUid.get(selectedUid) : null;

  const reviewerSummaries = reviewers.map((name) => {
    const info = getReviewerInfo(name);
    const ratings = getAllRatings(name);
    const dist = {};
    for (const c of CLASS_ORDER) dist[c] = 0;
    for (const r of ratings) {
      if (dist[r.rating] !== undefined) dist[r.rating]++;
    }
    return { name, role: info?.role ?? '—', total: ratings.length, dist, ratings };
  });

  const allFlat = [];
  for (const { name, role, ratings } of reviewerSummaries) {
    for (const r of ratings) {
      const sample = samplesById.get(r.sampleId);
      allFlat.push([
        name,
        role,
        r.sampleId,
        sample?.uid ?? '',
        sample?.image_file ?? '',
        r.rating,
        r.comments ?? '',
        r.timestamp,
        sample?.was_refined ?? '',
        sample?.computed_class ?? '',
        sample?.computed_score ?? '',
        sample?.final_chair_s ?? '',
        sample?.final_npv ?? '',
        sample?.final_ppv ?? '',
      ]);
    }
  }

  function handleExportAll() {
    exportAllRatings(allFlat);
  }

  function handleExportComparison() {
    const ratingsByReviewer = new Map();
    for (const name of reviewers) {
      ratingsByReviewer.set(name, getAllRatings(name));
    }
    exportComparison(samples, reviewers, ratingsByReviewer);
  }

  function handleClearAllLocalData() {
    const ok = window.confirm(
      'This will permanently delete ALL reviewer info and ratings stored in this browser for this study (keys starting with radeval_rating_ and radeval_reviewer_). Continue?',
    );
    if (!ok) return;
    const deleted = clearAllStudyData();
    window.alert(`Deleted ${deleted} localStorage entries. Refreshing admin view...`);
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="bg-[#0A1628] px-6 py-6 text-white shadow-md">
        <h1 className="text-2xl font-bold">Admin — All Reviewer Results</h1>
        <p className="mt-1 text-sm text-blue-100">
          
        </p>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6">
        <nav className="mb-6 flex flex-wrap gap-2 border-b border-[#E3EAF2] pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === id
                  ? 'border-[#1565C0] text-[#1565C0]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {activeTab === 'nlg' ? (
          <AdminNlgTab />
        ) : activeTab === 'supervisor-feedback' ? (
          <SupervisorFeedbackTab />
        ) : activeTab === 'view-feedback' ? (
          <AdminFeedbackViewTab />
        ) : (
          <>
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportAll}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1565C0] px-5 py-2.5 font-semibold text-white hover:bg-[#0d47a1]"
          >
            <Download className="h-4 w-4" />
            Export All Ratings (CSV)
          </button>
          <button
            type="button"
            onClick={handleExportComparison}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00796B] px-5 py-2.5 font-semibold text-white hover:bg-[#00574B]"
          >
            <Download className="h-4 w-4" />
            Export Comparison (Human vs Computed)
          </button>
          <button
            type="button"
            onClick={handleClearAllLocalData}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
            title="Deletes all radeval_* keys in this browser"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Local Data
          </button>
        </div>

        <section className="mb-8 overflow-hidden rounded-lg border border-[#E3EAF2] bg-white shadow-md">
          <h2 className="border-b border-[#E3EAF2] bg-gray-50 px-4 py-3 font-bold text-[#0A1628]">
            Reviewer Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Total Rated</th>
                  {CLASS_ORDER.map((c) => (
                    <th key={c} className="px-2 py-3 text-center">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviewerSummaries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + CLASS_ORDER.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No reviewer data in localStorage yet.
                    </td>
                  </tr>
                ) : (
                  reviewerSummaries.map((row) => (
                    <tr
                      key={row.name}
                      className={`border-t border-[#E3EAF2] hover:bg-gray-50 ${
                        selectedReviewer === row.name ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewer(row.name)}
                          className="text-left text-[#1565C0] hover:underline"
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="px-4 py-3">{row.role}</td>
                      <td className="px-4 py-3">{row.total}</td>
                      {CLASS_ORDER.map((c) => (
                        <td key={c} className="px-2 py-3 text-center text-gray-700">
                          {row.dist[c] || 0}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Report-wise */}
        <section className="mb-8 overflow-hidden rounded-lg border border-[#E3EAF2] bg-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E3EAF2] bg-gray-50 px-4 py-3">
            <h2 className="flex items-center gap-2 font-bold text-[#0A1628]">
              <FileText className="h-5 w-5 text-[#1565C0]" />
              Report-wise — ratings by UID
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Select report (UID):</span>
              <select
                value={selectedUid}
                onChange={(e) => setSelectedUid(e.target.value)}
                className="min-w-[180px] rounded-lg border border-[#E3EAF2] px-3 py-2 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30"
              >
                <option value="">— Choose UID —</option>
                {uidsWithRatings.map((uid) => (
                  <option key={uid} value={uid}>
                    UID {uid}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedUid && selectedSample && (
            <div className="border-b border-[#E3EAF2] bg-[#EFF6FF] px-4 py-3 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Sample ID:</span> {selectedSample.sample_id}
                {' · '}
                <span className="font-semibold">Image:</span> {selectedSample.image_file}
                {' · '}
                <span className="font-semibold">Computed:</span> {selectedSample.computed_class}{' '}
                ({selectedSample.computed_score})
                {' · '}
                <span className="font-semibold">GCRF:</span>{' '}
                {selectedSample.was_refined ? 'Corrected' : 'Original'}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-gray-600">
                <span className="font-semibold">AI report:</span> {selectedSample.ai_report}
              </p>
            </div>
          )}

          {!selectedUid ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Select a UID to see how every reviewer rated that report.
            </p>
          ) : (
            <>
              <p className="border-b border-[#E3EAF2] px-4 py-2 text-sm text-gray-600">
                {reportWiseRows.length} reviewer
                {reportWiseRows.length !== 1 ? 's' : ''} rated UID {selectedUid}
              </p>
              <DetailTable
                rows={reportWiseRows}
                emptyMessage={`No ratings yet for UID ${selectedUid}.`}
              />
            </>
          )}
        </section>

        {/* Reviewer-wise */}
        <section className="mb-8 overflow-hidden rounded-lg border border-[#E3EAF2] bg-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E3EAF2] bg-gray-50 px-4 py-3">
            <h2 className="flex items-center gap-2 font-bold text-[#0A1628]">
              <Users className="h-5 w-5 text-[#00796B]" />
              Reviewer-wise — all reports by user
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Select reviewer:</span>
              <select
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                className="min-w-[200px] rounded-lg border border-[#E3EAF2] px-3 py-2 focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30"
              >
                <option value="">— Choose reviewer —</option>
                {reviewers.map((name) => {
                  const info = getReviewerInfo(name);
                  return (
                    <option key={name} value={name}>
                      {name} ({info?.role ?? '—'})
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          {!selectedReviewer ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Select a reviewer to see all reports they have rated. You can also click a name
              in the summary table above.
            </p>
          ) : (
            <>
              {(() => {
                const info = getReviewerInfo(selectedReviewer);
                const summary = reviewerSummaries.find((r) => r.name === selectedReviewer);
                return (
                  <p className="border-b border-[#E3EAF2] bg-[#F0FFF8] px-4 py-2 text-sm text-gray-700">
                    <span className="font-semibold">{selectedReviewer}</span>
                    {' · '}
                    Role: {info?.role ?? '—'}
                    {' · '}
                    {summary?.total ?? 0} report
                    {(summary?.total ?? 0) !== 1 ? 's' : ''} rated
                  </p>
                );
              })()}
              <DetailTable
                rows={reviewerWiseRows}
                emptyMessage={`${selectedReviewer} has not rated any reports yet.`}
              />
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-[#E3EAF2] bg-white shadow-md">
          <h2 className="border-b border-[#E3EAF2] bg-gray-50 px-4 py-3 font-bold text-[#0A1628]">
            All Ratings (detailed)
          </h2>
          <div className="max-h-[60vh] overflow-auto">
            <DetailTable
              rows={allRatingsEnriched}
              emptyMessage="No ratings in localStorage yet."
            />
          </div>
        </section>
          </>
        )}
      </main>

      <Disclaimer />
    </div>
  );
}
