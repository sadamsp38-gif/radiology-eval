export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  let barColor = 'bg-[#1565C0]';
  if (pct >= 67) barColor = 'bg-[#2E7D32]';
  else if (pct >= 34) barColor = 'bg-[#F57F17]';

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          Case {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
