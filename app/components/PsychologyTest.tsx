import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetTest } from '../store/testSlice';
import WelcomeScreen from './WelcomeScreen';
import PhotoUploadScreen from './PhotoUploadScreen';
import QuestionsScreen from './QuestionsScreen';
import ResultsScreen from './ResultsScreen';

export type ScreenType = 'welcome' | 'upload' | 'questions' | 'results';

const PsychologyTest = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const dispatch = useAppDispatch();
  const { taskId, uploadStatus, submitStatus } = useAppSelector((state) => state.test);

  const handleStartTest = () => {
    setCurrentScreen('upload');
  };

  const handlePhotosUploaded = () => {
    if (uploadStatus === 'succeeded') {
      setCurrentScreen('questions');
    }
  };

  const handleQuestionsCompleted = () => {
    if (submitStatus === 'succeeded') {
      setCurrentScreen('results');
    }
  };

  const handleRestart = () => {
    setCurrentScreen('welcome');
    dispatch(resetTest());
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStartTest} />;
      case 'upload':
        return <PhotoUploadScreen onPhotosUploaded={handlePhotosUploaded} />;
      case 'questions':
        return <QuestionsScreen onCompleted={handleQuestionsCompleted} taskId={taskId} />;
      case 'results':
        return <ResultsScreen onRestart={handleRestart} />;
      default:
        return <WelcomeScreen onStart={handleStartTest} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {renderCurrentScreen()}
    </div>
  );
};

export default PsychologyTest;