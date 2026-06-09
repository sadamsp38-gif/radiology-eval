function escapeCsv(value) {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReviewerRatings(reviewerName, role, ratings, samplesById) {
  const header = [
    'reviewer_name',
    'reviewer_role',
    'sample_id',
    'uid',
    'image_file',
    'human_rating',
    'comments',
    'timestamp',
    'was_refined',
  ];
  const rows = [header];
  for (const r of ratings) {
    const sample = samplesById.get(r.sampleId);
    rows.push([
      reviewerName,
      role,
      r.sampleId,
      sample?.uid ?? '',
      sample?.image_file ?? '',
      r.rating,
      r.comments ?? '',
      r.timestamp,
      sample?.was_refined ?? '',
    ]);
  }
  const safeName = reviewerName.replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadCsv(`radeval_${safeName}.csv`, rows);
}

export function exportAllRatings(allRows) {
  const header = [
    'reviewer_name',
    'reviewer_role',
    'sample_id',
    'uid',
    'image_file',
    'human_rating',
    'comments',
    'timestamp',
    'was_refined',
    'computed_class',
    'computed_score',
    'final_chair_s',
    'final_npv',
    'final_ppv',
  ];
  const rows = [header, ...allRows];
  downloadCsv('radeval_all_ratings.csv', rows);
}

export function exportComparison(samples, reviewers, ratingsByReviewer) {
  const sortedReviewers = [...reviewers].sort();
  const header = [
    'sample_id',
    'uid',
    'computed_class',
    'computed_score',
    ...sortedReviewers.map((_, i) => `reviewer${i + 1}_rating`),
  ];
  const rows = [header];
  for (const sample of samples) {
    const row = [
      sample.sample_id,
      sample.uid,
      sample.computed_class,
      sample.computed_score,
      ...sortedReviewers.map((name) => {
        const list = ratingsByReviewer.get(name) ?? [];
        const found = list.find((x) => x.sampleId === sample.sample_id);
        return found?.rating ?? '';
      }),
    ];
    rows.push(row);
  }
  downloadCsv('radeval_comparison.csv', rows);
}
