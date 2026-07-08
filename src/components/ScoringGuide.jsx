import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Minus,
  AlertCircle,
  XCircle,
  Star,
  BookOpen,
  Calculator,
  Layers,
  ClipboardList,
  Info,
} from 'lucide-react';
import Disclaimer from './Disclaimer';

const FORMULA_ROWS = [
  { metric: 'CHAIR-i', weight: '20%', desc: 'Entity-level fabrication rate' },
  { metric: 'CHAIR-s', weight: '20%', desc: 'Sentence-level fabrication rate' },
  { metric: '(1 − PPV)', weight: '15%', desc: 'False positive clinical claims' },
  { metric: 'CheXbert', weight: '15%', desc: 'Condition-level inaccuracy (14 conditions)' },
  { metric: 'Contradiction', weight: '15%', desc: 'Logical contradictions in the report' },
  { metric: '(1 − Truthful)', weight: '15%', desc: 'Ungrounded clinical statements' },
];

const CATEGORIES = [
  {
    name: 'Hallucination-Free',
    color: '#2E7D32',
    range: '0% – 15%',
    Icon: CheckCircle2,
    description:
      'The AI report is fully grounded. Every clinical finding mentioned is confirmed by the reference report and supported by the X-ray image. No fabricated entities or statements detected.',
    example:
      'AI says: No pleural effusion, heart size normal, lungs clear. Reference confirms all three. Score: 8%',
  },
  {
    name: 'Low',
    color: '#558B2F',
    range: '15% – 30%',
    Icon: Minus,
    description:
      'Mostly accurate report with 1–2 minor unconfirmed statements. The core clinical findings are correct. Minor vocabulary differences or slightly imprecise phrasing that does not change the clinical meaning.',
    example:
      'AI mentions mild degenerative changes — reference says thoracic spondylosis. Effectively the same finding, slightly different wording. Score: 22%',
  },
  {
    name: 'Moderate',
    color: '#F57F17',
    range: '30% – 50%',
    Icon: AlertTriangle,
    description:
      'Several findings in the AI report are not clearly supported by the X-ray or reference. The report may over-report findings, use incorrect severity language, or miss some real pathology. Clinical review is required before acting on this report.',
    example:
      'AI asserts bilateral atelectasis but reference only notes mild basilar atelectasis on the left. Over-reporting severity. Score: 37%',
  },
  {
    name: 'High',
    color: '#E65100',
    range: '50% – 70%',
    Icon: AlertCircle,
    description:
      'Multiple findings are fabricated or significantly incorrect. The AI report cannot be trusted without full radiologist review. Acting on this report without verification could lead to unnecessary procedures or missed diagnoses.',
    example:
      'AI reports consolidation and pleural effusion. Reference shows only mild cardiomegaly. Most AI findings are not present in the image. Score: 58%',
  },
  {
    name: 'Severe',
    color: '#BF360C',
    range: '70% – 100%',
    Icon: XCircle,
    description:
      'The majority of the report is fabricated. The AI has generated clinically plausible-sounding but largely false findings. This report is clinically dangerous if acted upon without complete radiologist verification.',
    example:
      'AI reports tension pneumothorax, bilateral effusion, and consolidation. Reference shows a completely normal chest. Score: 78%',
  },
];

const TASK_CARDS = [
  {
    Icon: Eye,
    title: 'Look at the X-ray',
    text: 'Carefully examine the chest X-ray image on the left panel. Note what you can see: cardiac silhouette, lung fields, pleural spaces, bony structures.',
  },
  {
    Icon: FileText,
    title: 'Read both reports',
    text: 'Read the AI Generated Report and compare it with the Reference Report written by a qualified radiologist. Focus on clinical accuracy, not writing style.',
  },
  {
    Icon: Star,
    title: 'Rate the hallucination level',
    text: 'Select the category that best describes how much the AI report fabricates or misrepresents what is actually in the X-ray. Use the five categories above as your guide.',
  },
];

const SECTIONS = [
  { id: 'about', label: 'About the study', icon: BookOpen },
  { id: 'formula', label: 'Scoring formula', icon: Calculator },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'task', label: 'Your task', icon: ClipboardList },
  { id: 'notes', label: 'Important notes', icon: Info },
];

function SectionHeading({ id, icon: Icon, title, subtitle }) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1565C0]/10">
          <Icon className="h-5 w-5 text-[#1565C0]" />
        </div>
        <h2 className="text-xl font-bold text-[#0A1628] md:text-2xl">{title}</h2>
      </div>
      {subtitle && (
        <p className="mb-6 ml-0 text-[15px] leading-relaxed text-gray-600 md:ml-[52px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function ScoringGuide({ reviewerName, reviewerRole, onStart }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA]">
      <header className="bg-[#0A1628] px-6 py-6 text-center text-white shadow-md">
        <h1 className="text-2xl font-bold md:text-3xl">Scoring Guide</h1>
        <p className="mt-2 text-sm text-blue-100 md:text-base">
          How our AI system scores radiology report hallucination
        </p>
        {reviewerName && (
          <p className="mt-3 text-sm text-blue-200">
            Reviewer: <span className="font-semibold text-white">{reviewerName}</span>
            {reviewerRole && (
              <>
                {' '}
                · <span className="text-blue-100">{reviewerRole}</span>
              </>
            )}
          </p>
        )}
      </header>

      <nav className="sticky top-0 z-20 border-b border-[#E3EAF2] bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E3EAF2] px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#1565C0] hover:bg-[#EFF6FF] hover:text-[#1565C0] md:text-sm"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 md:px-6 md:py-12">
        <div className="space-y-14 md:space-y-16">
          {/* Section 1 */}
          <section className="rounded-xl border border-[#E3EAF2] bg-white p-6 shadow-md md:p-8">
            <SectionHeading id="about" icon={BookOpen} title="What This Study Is About" />
            <p className="text-[15px] leading-relaxed text-gray-700 md:ml-[52px]">
              Our AI system (MedGemma 1.5 + GCRF) automatically generates radiology reports from
              chest X-ray images. We then run each report through a Multi-Agent Hallucination
              Auditor that checks for fabricated findings. Your job as a radiologist is to
              independently rate each AI-generated report on how much hallucination it contains —
              comparing the AI report against both the X-ray image and the reference report written
              by a qualified radiologist.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-[#E3EAF2] bg-white p-6 shadow-md md:p-8">
            <SectionHeading
              id="formula"
              icon={Calculator}
              title="How We Calculate the Hallucination Score"
              subtitle="Each AI report receives a Composite Hallucination Score from 0% to 100%. Lower is better. Here is the exact formula:"
            />

            <div className="mb-6 overflow-hidden rounded-lg border-l-4 border-[#0A1628] bg-[#F8F9FA] font-mono text-sm md:ml-[52px]">
              <div className="border-b border-gray-200 px-5 py-3">
                <span className="font-semibold text-[#0A1628]">Score =</span>
              </div>
              <ul className="divide-y divide-gray-200">
                {FORMULA_ROWS.map((row) => (
                  <li
                    key={row.metric}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-5 py-3 text-[15px]"
                  >
                    <span className="min-w-[120px] font-bold text-[#0A1628]">{row.metric}</span>
                    <span className="text-gray-400">×</span>
                    <span className="font-semibold text-[#1565C0]">{row.weight}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-sans text-gray-600">{row.desc}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 bg-gray-100/80 px-5 py-3 text-[15px] font-semibold text-[#0A1628]">
                Total = Composite Hallucination Score (0–100%)
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-[#EFF6FF] p-5 md:ml-[52px]">
              <p className="text-[15px] leading-relaxed text-gray-700">
                <span className="font-semibold text-[#1565C0]">In simple terms: </span>
                we check every clinical word, every sentence, and every diagnosed condition in the
                AI report against the real radiologist reference. Any mismatch, fabrication, or
                contradiction adds to the score. A score of 0% means every single clinical claim
                was confirmed. A score of 100% would mean everything was fabricated.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-[#E3EAF2] bg-white p-6 shadow-md md:p-8">
            <SectionHeading
              id="categories"
              icon={Layers}
              title="The Five Hallucination Categories"
              subtitle="Based on the composite score, each report is assigned one of five categories:"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {CATEGORIES.map(({ name, color, range, Icon, description, example }) => (
                <article
                  key={name}
                  className="flex flex-col rounded-lg border border-[#E3EAF2] bg-white shadow-sm"
                  style={{ borderTopWidth: '4px', borderTopColor: color }}
                >
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Icon className="h-6 w-6 shrink-0" style={{ color }} />
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {range}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-bold text-[#0A1628]">{name}</h3>
                    <p className="mb-4 flex-1 text-[15px] leading-relaxed text-gray-600">
                      {description}
                    </p>
                    <div
                      className="rounded-md border-l-2 bg-gray-50 px-3 py-2 text-[13px] leading-snug text-gray-600"
                      style={{ borderLeftColor: color }}
                    >
                      <span className="font-semibold text-gray-700">Example: </span>
                      {example}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-[#E3EAF2] bg-white p-6 shadow-md md:p-8">
            <SectionHeading id="task" icon={ClipboardList} title="Your Task as a Reviewer" />

            <div className="grid gap-4 md:grid-cols-3">
              {TASK_CARDS.map(({ Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-lg border border-[#E3EAF2] bg-[#F8F9FA] p-5 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1565C0]/10">
                    <Icon className="h-6 w-6 text-[#1565C0]" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[#0A1628]">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section
            id="notes"
            className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm md:p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <Info className="h-5 w-5 text-amber-700" />
              <h2 className="text-xl font-bold text-[#0A1628]">Important notes before you begin</h2>
            </div>
            <ul className="list-disc space-y-2 pl-6 text-[15px] leading-relaxed text-gray-700">
              <li>
                You will review 100 chest X-ray cases selected to represent all five hallucination
                categories
              </li>
              <li>
                Each rating is saved automatically — you can pause and resume by entering the same
                name
              </li>
              <li>Focus on CLINICAL ACCURACY, not grammatical style</li>
              <li>
                The reference report is written by a qualified radiologist and represents the ground
                truth for this study
              </li>
              <li>
                Your independent rating is compared against our automated composite score to validate
                the scoring system
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="pb-4 text-center">
            <button
              type="button"
              onClick={onStart}
              className="w-full max-w-lg rounded-lg bg-[#2E7D32] px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2 md:w-auto md:min-w-[360px]"
            >
              I understand — Start Evaluation →
            </button>
            <p className="mt-3 text-sm text-gray-500">
              
            </p>
          </section>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}
