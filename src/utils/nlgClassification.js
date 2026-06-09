const CLASS_ORDER = [
  'Hallucination-Free',
  'Low',
  'Moderate',
  'High',
  'Severe',
];

/** Composite overlap score (0–1): higher = closer to reference text */
export function nlgCompositeScore(bleu1, bleu4, rougeL) {
  const b1 = Number(bleu1) || 0;
  const b4 = Number(bleu4) || 0;
  const rg = Number(rougeL) || 0;
  return 0.45 * b1 + 0.45 * rg + 0.1 * Math.min(b4 * 4, 1);
}

/**
 * Suggested hallucination category from NLG overlap with reference.
 * High BLEU/ROUGE → report text aligns with radiologist reference → lower hallucination.
 */
export function inferCategoryFromNlg(bleu1, bleu4, rougeL) {
  const score = nlgCompositeScore(bleu1, bleu4, rougeL);
  if (score >= 0.38) return { category: 'Hallucination-Free', score };
  if (score >= 0.32) return { category: 'Low', score };
  if (score >= 0.27) return { category: 'Moderate', score };
  if (score >= 0.22) return { category: 'High', score };
  return { category: 'Severe', score };
}

function classIndex(label) {
  const i = CLASS_ORDER.indexOf(label);
  return i >= 0 ? i : -1;
}

/**
 * Compare AI-assigned class vs NLG-suggested class.
 */
export function getNlgAlignment(aiClass, nlgCategory) {
  const aiIdx = classIndex(aiClass);
  const nlgIdx = classIndex(nlgCategory);
  if (aiIdx < 0 || nlgIdx < 0) {
    return { status: 'unknown', label: '—', note: 'Missing class label.' };
  }

  const gap = nlgIdx - aiIdx;

  if (gap === 0) {
    return {
      status: 'aligned',
      label: 'Aligned',
      note: 'BLEU/ROUGE overlap is consistent with the AI-assigned category.',
    };
  }

  if (Math.abs(gap) === 1) {
    const direction =
      gap > 0
        ? 'NLG scores suggest slightly more hallucination than the AI category.'
        : 'NLG scores suggest slightly less hallucination than the AI category.';
    return {
      status: 'close',
      label: 'Close',
      note: direction,
    };
  }

  if (gap > 0) {
    return {
      status: 'mismatch',
      label: 'Mismatch',
      note: `NLG suggests "${nlgCategory}" (lower overlap) but AI assigned "${aiClass}". Text overlap implies more hallucination than the AI label — worth reviewing.`,
    };
  }

  return {
    status: 'mismatch',
    label: 'Mismatch',
    note: `NLG suggests "${nlgCategory}" (higher overlap) but AI assigned "${aiClass}". Strong BLEU/ROUGE vs reference — AI label may be stricter than textual agreement alone.`,
  };
}

export const CLASS_COLORS = {
  'Hallucination-Free': '#2E7D32',
  Low: '#558B2F',
  Moderate: '#F57F17',
  High: '#E65100',
  Severe: '#BF360C',
};
