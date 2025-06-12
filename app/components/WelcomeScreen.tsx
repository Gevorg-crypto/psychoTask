import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Психологический тест
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
              Анализ детских рисунков
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
              Данный тест поможет провести психологическую оценку развития ребенка на основе анализа его рисунков и ответов на специальные вопросы.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Загрузите 3 рисунка ребенка</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ответьте на вопросы анкеты</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Получите подробный анализ в PDF</span>
            </div>
          </div>

          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Начать тест
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;