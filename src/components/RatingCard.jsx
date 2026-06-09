import { CheckCircle2 } from 'lucide-react';

export const RATING_OPTIONS = [
  {
    id: 'Hallucination-Free',
    title: 'Hallucination-Free',
    description:
      'AI report matches the X-ray perfectly with no fabricated findings.',
    color: '#2E7D32',
    icon: '✓',
    shortcut: '1',
  },
  {
    id: 'Low',
    title: 'Low',
    description:
      'Mostly accurate. 1-2 minor unconfirmed statements that are not dangerous.',
    color: '#558B2F',
    icon: '~',
    shortcut: '2',
  },
  {
    id: 'Moderate',
    title: 'Moderate',
    description:
      'Several findings not clearly supported by the image. Needs clinical review.',
    color: '#F57F17',
    icon: '△',
    shortcut: '3',
  },
  {
    id: 'High',
    title: 'High',
    description:
      'Multiple fabricated findings. Significant portions of the report are not visible in the X-ray.',
    color: '#E65100',
    icon: '⚠',
    shortcut: '4',
  },
  {
    id: 'Severe',
    title: 'Severe',
    description:
      'Most of the report appears fabricated. Clinically dangerous if acted upon.',
    color: '#BF360C',
    icon: '✗',
    shortcut: '5',
  },
];

export default function RatingCard({ option, selected, onSelect }) {
  const isSelected = selected === option.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`relative flex h-full w-full flex-col rounded-lg border-2 p-3 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1565C0] ${
        isSelected ? 'shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      style={
        isSelected
          ? {
              borderColor: option.color,
              borderWidth: '3px',
              backgroundColor: `${option.color}14`,
            }
          : { borderTopWidth: '4px', borderTopColor: option.color }
      }
    >
      {isSelected && (
        <span
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: option.color }}
        >
          <CheckCircle2 className="h-4 w-4" />
        </span>
      )}
      <span className="mb-1 text-2xl" aria-hidden>
        {option.icon}
      </span>
      <span className="mb-1 text-base font-bold text-[#0A1628]">{option.title}</span>
      <span className="text-xs leading-snug text-gray-600">{option.description}</span>
      <span className="mt-2 text-[10px] text-gray-400">Press {option.shortcut}</span>
    </button>
  );
}
