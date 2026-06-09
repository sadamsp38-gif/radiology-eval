import { useMemo, useState } from 'react';
import samplesData from './data/samples.json';
import WelcomeScreen from './components/WelcomeScreen';
import EvaluationScreen from './components/EvaluationScreen';
import CompletionScreen from './components/CompletionScreen';
import AdminView from './components/AdminView';
import { shuffleSamples } from './utils/shuffle';
import {
  saveReviewerInfo,
  getRating,
  getAllRatings,
  getReviewerInfo,
} from './utils/storage';

const SCREENS = { welcome: 'welcome', evaluation: 'evaluation', completion: 'completion' };

function findResumeIndex(shuffled, reviewerName) {
  for (let i = 0; i < shuffled.length; i++) {
    if (!getRating(reviewerName, shuffled[i].sample_id)) return i;
  }
  return shuffled.length - 1;
}

function isAllRated(shuffled, reviewerName) {
  return shuffled.every((s) => getRating(reviewerName, s.sample_id));
}

export default function App() {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  const [screen, setScreen] = useState(SCREENS.welcome);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const shuffledSamples = useMemo(() => {
    if (!reviewerName) return samplesData;
    return shuffleSamples(samplesData, reviewerName);
  }, [reviewerName]);

  const samplesById = useMemo(
    () => new Map(samplesData.map((s) => [s.sample_id, s])),
    [],
  );

  if (isAdmin) {
    return <AdminView />;
  }

  function handleStart(name, role, resume = false) {
    saveReviewerInfo(name, role);
    setReviewerName(name);
    setReviewerRole(role);

    const shuffled = shuffleSamples(samplesData, name);
    if (isAllRated(shuffled, name)) {
      setScreen(SCREENS.completion);
      return;
    }

    const idx = resume ? findResumeIndex(shuffled, name) : findResumeIndex(shuffled, name);
    setCurrentIndex(idx);
    setScreen(SCREENS.evaluation);
  }

  function handleComplete() {
    setScreen(SCREENS.completion);
  }

  function handleNewReviewer() {
    setReviewerName('');
    setReviewerRole('');
    setCurrentIndex(0);
    setScreen(SCREENS.welcome);
  }

  const ratings = reviewerName ? getAllRatings(reviewerName) : [];

  if (screen === SCREENS.welcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (screen === SCREENS.completion) {
    const info = getReviewerInfo(reviewerName);
    return (
      <CompletionScreen
        reviewerName={reviewerName}
        reviewerRole={reviewerRole || info?.role || ''}
        ratings={ratings}
        samplesById={samplesById}
        onNewReviewer={handleNewReviewer}
      />
    );
  }

  return (
    <EvaluationScreen
      reviewerName={reviewerName}
      samples={shuffledSamples}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      onComplete={handleComplete}
    />
  );
}
