import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Stethoscope,
  X,
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import RatingCard, { RATING_OPTIONS } from './RatingCard';
import Disclaimer from './Disclaimer';
import { getRating, saveRating } from '../utils/storage';

export default function EvaluationScreen({
  reviewerName,
  samples,
  currentIndex,
  onIndexChange,
  onComplete,
}) {
  const sample = samples[currentIndex];
  const rightPanelRef = useRef(null);
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const caseNumber = currentIndex + 1;
  const total = samples.length;
  const imageSrc = `/images/${sample.image_file}`;

  const loadExisting = useCallback(() => {
    const existing = getRating(reviewerName, sample.sample_id);
    setRating(existing?.rating ?? '');
    setComments(existing?.comments ?? '');
  }, [reviewerName, sample.sample_id]);

  useEffect(() => {
    loadExisting();
    setImageLoading(true);
    setImageError(false);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, loadExisting]);

  const hasRating = Boolean(rating);
  const existingRating = getRating(reviewerName, sample.sample_id);

  const handleSaveAndNext = useCallback(() => {
    if (!rating) return;
    saveRating(reviewerName, sample.sample_id, rating, comments);
    if (currentIndex >= total - 1) {
      onComplete();
    } else {
      onIndexChange(currentIndex + 1);
    }
  }, [rating, comments, reviewerName, sample.sample_id, currentIndex, total, onComplete, onIndexChange]);

  function handlePrevious() {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  }

  function handleNextNav() {
    if (existingRating && currentIndex < total - 1) onIndexChange(currentIndex + 1);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key >= '1' && e.key <= '5') {
        const idx = Number(e.key) - 1;
        setRating(RATING_OPTIONS[idx].id);
      }
      if (e.key === 'Enter' && rating) {
        e.preventDefault();
        handleSaveAndNext();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rating, handleSaveAndNext]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="bg-[#0A1628] px-4 py-3 text-center text-white shadow">
        <h1 className="text-lg font-bold md:text-xl">
          Radiology Report Human Evaluation Study
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col lg:flex-row">
        {/* LEFT PANEL */}
        <aside className="flex w-full flex-col border-r border-[#E3EAF2] bg-gray-100 lg:sticky lg:top-0 lg:h-screen lg:w-[42%] lg:shrink-0">
          <div className="flex flex-1 flex-col p-4 md:p-6">
            <ProgressBar current={caseNumber} total={total} />

            <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
              {imageLoading && !imageError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#1565C0]" />
                </div>
              )}
              {!imageError ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative max-h-[55vh] w-full flex-1 cursor-zoom-in overflow-hidden rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                >
                  <img
                    src={imageSrc}
                    alt={`Chest X-ray UID ${sample.uid}`}
                    className="mx-auto h-full max-h-[55vh] w-full object-contain"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                </button>
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-300 text-gray-600">
                  <span className="text-lg font-medium">UID: {sample.uid}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                UID: {sample.uid}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  sample.was_refined
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {sample.was_refined ? 'GCRF Corrected' : 'Original'}
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={handleNextNav}
                disabled={!existingRating || currentIndex >= total - 1}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section
          ref={rightPanelRef}
          className="w-full flex-1 overflow-y-auto bg-white lg:w-[58%]"
        >
          <div className="space-y-6 p-4 md:p-6 lg:p-8">
            <div className="rounded-lg border-2 border-[#1565C0] bg-[#EFF6FF] p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#1565C0]">
                <Bot className="h-5 w-5" /> AI Generated Report
              </h2>
              <p className="font-serif text-sm leading-7 text-gray-800 whitespace-pre-wrap">
                {sample.ai_report}
              </p>
            </div>

            <div className="rounded-lg border-2 border-[#00796B] bg-[#F0FFF8] p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#00796B]">
                <Stethoscope className="h-5 w-5" /> Reference — Written by a Radiologist
              </h2>
              <p className="font-serif text-sm leading-7 text-gray-800 whitespace-pre-wrap">
                {sample.ground_truth}
              </p>
              {sample.impression?.trim() && (
                <p className="mt-3 border-t border-[#00796B]/20 pt-3 text-sm leading-7 text-gray-700">
                  <span className="font-semibold text-[#00796B]">Impression:</span>{' '}
                  {sample.impression}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-start gap-2">
                <h2 className="text-lg font-bold text-[#0A1628]">
                  How much hallucination does this AI report contain?
                </h2>
                <span
                  className="group relative mt-0.5 shrink-0"
                  title="Rating guide: Compare the AI report against the reference. Focus on findings the AI mentions that you cannot verify from the X-ray image."
                >
                  <Info className="h-5 w-5 cursor-help text-[#1565C0]" />
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-lg bg-[#0A1628] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    Rating guide: Compare the AI report against the reference. Focus on
                    findings the AI mentions that you cannot verify from the X-ray image.
                  </span>
                </span>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Hallucination = findings mentioned by AI that are not supported by the actual
                X-ray image
              </p>

              <div className="grid grid-cols-6 gap-3 lg:grid-cols-5">
                {RATING_OPTIONS.map((opt, i) => (
                  <div
                    key={opt.id}
                    className={i < 2 ? 'col-span-3 lg:col-span-1' : 'col-span-2 lg:col-span-1'}
                  >
                    <RatingCard
                      option={opt}
                      selected={rating}
                      onSelect={setRating}
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Any specific observations about this report? (optional)
              </span>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30"
                placeholder="Optional notes..."
              />
            </label>

            <button
              type="button"
              onClick={handleSaveAndNext}
              disabled={!hasRating}
              className={`w-full rounded-lg px-6 py-4 text-lg font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                hasRating
                  ? 'bg-[#2E7D32] text-white hover:bg-[#1B5E20] focus:ring-[#2E7D32]'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              Save &amp; Continue →
            </button>
          </div>
        </section>
      </div>

      {lightboxOpen && !imageError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={imageSrc}
            alt={`Chest X-ray UID ${sample.uid} fullscreen`}
            className="max-h-[95vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
