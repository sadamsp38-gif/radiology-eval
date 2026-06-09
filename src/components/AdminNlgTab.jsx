import { useMemo, useState } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import samples from '../data/samples.json';
// import {
//   inferCategoryFromNlg,
//   getNlgAlignment,
//   nlgCompositeScore,
//   CLASS_COLORS,
// } from '../utils/nlgClassification';
import { CLASS_COLORS } from '../utils/nlgClassification';
import { RATING_OPTIONS } from './RatingCard';

const CLASS_ORDER = RATING_OPTIONS.map((o) => o.id);

// const ALIGNMENT_STYLES = {
//   aligned: 'bg-green-100 text-green-800 border-green-200',
//   close: 'bg-amber-100 text-amber-800 border-amber-200',
//   mismatch: 'bg-red-100 text-red-800 border-red-200',
//   unknown: 'bg-gray-100 text-gray-600 border-gray-200',
// };

function ClassBadge({ label }) {
  const color = CLASS_COLORS[label] ?? '#1565C0';
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function fmt(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toFixed(4);
}

export default function AdminNlgTab() {
  const [filterClass, setFilterClass] = useState('');
  // const [filterAlignment, setFilterAlignment] = useState('');
  const [sortBy, setSortBy] = useState('sample_id');

  const rows = useMemo(() => {
    return samples.map((s) => {
      // const { category: nlgCategory, score: nlgScore } = inferCategoryFromNlg(
      //   s.bleu1,
      //   s.bleu4,
      //   s.rouge_l,
      // );
      // const alignment = getNlgAlignment(s.computed_class, nlgCategory);
      // const composite = nlgCompositeScore(s.bleu1, s.bleu4, s.rouge_l);
      return {
        sampleId: s.sample_id,
        uid: s.uid,
        aiClass: s.computed_class,
        aiScore: s.computed_score,
        bleu1: s.bleu1,
        bleu4: s.bleu4,
        rougeL: s.rouge_l,
        // nlgCategory,
        // nlgScore,
        // composite,
        // alignment,
        wasRefined: s.was_refined,
      };
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (filterClass) list = list.filter((r) => r.aiClass === filterClass);
    // if (filterAlignment) list = list.filter((r) => r.alignment.status === filterAlignment);

    list.sort((a, b) => {
      if (sortBy === 'bleu1') return (b.bleu1 ?? 0) - (a.bleu1 ?? 0);
      if (sortBy === 'rouge') return (b.rougeL ?? 0) - (a.rougeL ?? 0);
      // if (sortBy === 'composite') return b.composite - a.composite;
      // if (sortBy === 'gap') {
      //   const gap = (r) =>
      //     Math.abs(CLASS_ORDER.indexOf(r.nlgCategory) - CLASS_ORDER.indexOf(r.aiClass));
      //   return gap(b) - gap(a);
      // }
      return a.sampleId - b.sampleId;
    });
    return list;
  }, [rows, filterClass, sortBy]);

  // const summary = useMemo(() => {
  //   const aligned = rows.filter((r) => r.alignment.status === 'aligned').length;
  //   const close = rows.filter((r) => r.alignment.status === 'close').length;
  //   const mismatch = rows.filter((r) => r.alignment.status === 'mismatch').length;
  //   return { aligned, close, mismatch, total: rows.length };
  // }, [rows]);

  return (
    <div>
      <div className="mb-4 rounded-lg border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-sm text-gray-700">
        <p className="font-semibold text-[#1565C0]">
          NLG (Natural Language Generation metrics) vs AI category
        </p>
        <p className="mt-1 leading-relaxed">
          BLEU-1, BLEU-4, and ROUGE-L measure how closely the AI report overlaps the
          radiologist reference text. Higher scores usually mean stronger textual agreement
          with the reference.
        </p>
        {/* <p className="mt-1 leading-relaxed">
          The <strong>suggested category</strong> is derived from these scores;{' '}
          <strong>alignment</strong> shows whether it agrees with the AI pipeline label (
          <code className="text-xs">computed_class</code>).
        </p> */}
      </div>

      {/* <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-green-800">{summary.aligned}</p>
          <p className="text-xs text-green-700">Aligned</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-amber-800">{summary.close}</p>
          <p className="text-xs text-amber-700">Close (±1 tier)</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-red-800">{summary.mismatch}</p>
          <p className="text-xs text-red-700">Mismatch (2+ tiers)</p>
        </div>
        <div className="rounded-lg border border-[#E3EAF2] bg-white px-3 py-2 text-center">
          <p className="text-2xl font-bold text-[#0A1628]">{summary.total}</p>
          <p className="text-xs text-gray-600">Total reports</p>
        </div>
      </div> */}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">AI class:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-lg border border-[#E3EAF2] px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {CLASS_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {/* <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Alignment:</span>
          <select
            value={filterAlignment}
            onChange={(e) => setFilterAlignment(e.target.value)}
            className="rounded-lg border border-[#E3EAF2] px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="aligned">Aligned</option>
            <option value="close">Close</option>
            <option value="mismatch">Mismatch</option>
          </select>
        </label> */}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-[#E3EAF2] px-2 py-1.5 text-sm"
          >
            <option value="sample_id">Sample ID</option>
            {/* <option value="composite">NLG score (high→low)</option> */}
            <option value="bleu1">BLEU-1 (high→low)</option>
            <option value="rouge">ROUGE-L (high→low)</option>
            {/* <option value="gap">Largest AI vs NLG gap</option> */}
          </select>
        </label>
        <span className="text-sm text-gray-500">
          Showing {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E3EAF2]">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2">Sample</th>
              <th className="px-3 py-2">UID</th>
              <th className="px-3 py-2">AI category</th>
              <th className="px-3 py-2">AI score</th>
              <th className="px-3 py-2">BLEU-1</th>
              <th className="px-3 py-2">BLEU-4</th>
              <th className="px-3 py-2">ROUGE-L</th>
              {/* <th className="px-3 py-2">NLG composite</th> */}
              {/* <th className="px-3 py-2">Suggested category</th> */}
              {/* <th className="px-3 py-2">Alignment</th> */}
              {/* <th className="min-w-[220px] px-3 py-2">Interpretation</th> */}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.sampleId} className="border-t border-[#E3EAF2] hover:bg-gray-50">
                <td className="px-3 py-2">{row.sampleId}</td>
                <td className="px-3 py-2 font-medium">{row.uid}</td>
                <td className="px-3 py-2">
                  <ClassBadge label={row.aiClass} />
                </td>
                <td className="px-3 py-2">{row.aiScore}</td>
                <td className="px-3 py-2 font-mono">{fmt(row.bleu1)}</td>
                <td className="px-3 py-2 font-mono">{fmt(row.bleu4)}</td>
                <td className="px-3 py-2 font-mono">{fmt(row.rougeL)}</td>
                {/* <td className="px-3 py-2 font-mono">{fmt(row.composite)}</td> */}
                {/* <td className="px-3 py-2">
                  <ClassBadge label={row.nlgCategory} />
                </td> */}
                {/* <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${ALIGNMENT_STYLES[row.alignment.status]}`}
                  >
                    {row.alignment.label}
                  </span>
                </td> */}
                {/* <td className="px-3 py-2 text-gray-600 leading-snug">{row.alignment.note}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
        <BarChart3 className="h-3.5 w-3.5" />
        Suggested category thresholds (NLG composite): ≥0.38 Hallucination-Free · ≥0.32 Low · ≥
        0.27 Moderate · ≥0.22 High · else Severe
      </p> */}
      <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
        <BarChart3 className="h-3.5 w-3.5" />
        {rows.length} reports · BLEU/ROUGE vs radiologist reference
      </p>
    </div>
  );
}
