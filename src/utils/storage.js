const RATING_PREFIX = 'radeval_rating_';
const REVIEWER_PREFIX = 'radeval_reviewer_';

function ratingKey(reviewerName, sampleId) {
  return `${RATING_PREFIX}${reviewerName}_${sampleId}`;
}

function reviewerKey(name) {
  return `${REVIEWER_PREFIX}${name}`;
}

export function saveRating(reviewerName, sampleId, rating, comments = '') {
  const data = {
    sampleId,
    rating,
    comments,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(ratingKey(reviewerName, sampleId), JSON.stringify(data));
}

export function getRating(reviewerName, sampleId) {
  const raw = localStorage.getItem(ratingKey(reviewerName, sampleId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAllRatings(reviewerName) {
  const prefix = `${RATING_PREFIX}${reviewerName}_`;
  const ratings = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        ratings.push(JSON.parse(localStorage.getItem(key)));
      } catch {
        /* skip invalid */
      }
    }
  }
  return ratings.sort((a, b) => a.sampleId - b.sampleId);
}

export function getAllReviewers() {
  const names = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(REVIEWER_PREFIX)) {
      names.add(key.slice(REVIEWER_PREFIX.length));
    }
  }
  return [...names];
}

export function getAllRatingsAllReviewers() {
  const ratings = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(RATING_PREFIX)) continue;
    const suffix = key.slice(RATING_PREFIX.length);
    const lastUnderscore = suffix.lastIndexOf('_');
    if (lastUnderscore < 0) continue;
    const sampleId = Number(suffix.slice(lastUnderscore + 1));
    const reviewerName = suffix.slice(0, lastUnderscore);
    try {
      const data = JSON.parse(localStorage.getItem(key));
      ratings.push({ reviewerName, ...data, sampleId: data.sampleId ?? sampleId });
    } catch {
      /* skip */
    }
  }
  return ratings;
}

export function saveReviewerInfo(name, role) {
  localStorage.setItem(
    reviewerKey(name),
    JSON.stringify({ name, role, startedAt: new Date().toISOString() }),
  );
}

export function getReviewerInfo(name) {
  const raw = localStorage.getItem(reviewerKey(name));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAllStudyData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(RATING_PREFIX) || key.startsWith(REVIEWER_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) localStorage.removeItem(key);
  return keysToRemove.length;
}
