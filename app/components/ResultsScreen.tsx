import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Download, RotateCcw, CheckCircle, Loader2, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkReportStatus } from '../store/testSlice';

interface ResultsScreenProps {
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ onRestart }) => {
  const dispatch = useAppDispatch();
  const { 
    taskId, 
    reportStatus, 
    reportUrl, 
    error, 
    answers, 
    photos 
  } = useAppSelector((state) => state.test);
  const { toast } = useToast();

  useEffect(() => {
    if (taskId && reportStatus !== 'ready') {
      // Initial check
      dispatch(checkReportStatus(taskId));
      
      // Set up polling every 5 seconds
      const interval = setInterval(() => {
        if (reportStatus === 'processing') {
          dispatch(checkReportStatus(taskId));
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [taskId, reportStatus, dispatch]);

  useEffect(() => {
    if (reportStatus === 'ready' && reportUrl) {
      toast({
        title: "Отчет готов",
        description: "Ваш психологический анализ готов к просмотру",
      });
    } else if (reportStatus === 'failed' && error) {
      toast({
        title: "Ошибка генерации отчета",
        description: error,
        variant: "destructive",
      });
    }
  }, [reportStatus, reportUrl, error, toast]);

  const handleViewReport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    }
  };

  const handleDownloadReport = () => {
    if (reportUrl) {
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `Психологический_анализ_${answers.child_name || 'ребенок'}_${new Date().toLocaleDateString('ru-RU')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRetryCheck = () => {
    if (taskId) {
      dispatch(checkReportStatus(taskId));
    }
  };

  const getStatusMessage = () => {
    switch (reportStatus) {
      case 'processing':
        return 'Анализ в процессе...';
      case 'ready':
        return 'Отчет готов!';
      case 'failed':
        return 'Произошла ошибка при создании отчета';
      default:
        return 'Обрабатываем результаты';
    }
  };

  const getEmotionalAnalysis = () => {
    const joyScore = answers.joy_frequency || 0;
    const sadnessScore = answers.sadness_frequency || 0;
    
    if (joyScore >= 4 && sadnessScore <= 2) {
      return "Эмоциональное состояние ребенка в норме. Демонстрирует здоровый эмоциональный баланс.";
    } else if (joyScore <= 2 || sadnessScore >= 4) {
      return "Рекомендуется обратить внимание на эмоциональное состояние ребенка. Возможна необходимость в дополнительной поддержке.";
    }
    return "Эмоциональное развитие находится в пределах нормы с некоторыми особенностями.";
  };

  const getSocialAnalysis = () => {
    const friendsScore = answers.makes_friends_easily || 0;
    
    if (friendsScore >= 4) {
      return "Ребенок демонстрирует хорошие социальные навыки и легко устанавливает контакты.";
    } else if (friendsScore <= 2) {
      return "Отмечаются некоторые трудности в социальном взаимодействии. Рекомендуется работа над коммуникативными навыками.";
    }
    return "Социальные навыки развиваются нормально.";
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {reportStatus === 'processing' ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : reportStatus === 'ready' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {reportStatus === 'ready' ? 'Тестирование завершено!' : 'Обрабатываем результаты'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {getStatusMessage()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {reportStatus === 'processing' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-blue-700">
                  Пожалуйста, подождите. Наши специалисты анализируют рисунки и ответы вашего ребенка.
                  Это может занять несколько минут.
                </p>
              </CardContent>
            </Card>
          )}

          {reportStatus === 'failed' && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 mb-3">
                  {error || 'Произошла ошибка при обработке данных. Попробуйте обновить страницу или начать тест заново.'}
                </p>
                <Button
                  onClick={handleRetryCheck}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Проверить еще раз
                </Button>
              </CardContent>
            </Card>
          )}

          {reportStatus === 'ready' && (
            <>
              {/* Краткие результаты */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">Эмоциональная сфера</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-700">{getEmotionalAnalysis()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-800">Социальное взаимодействие</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-700">{getSocialAnalysis()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Информация о загруженных рисунках */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800">Загруженные материалы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Дом, дерево, человек</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Несуществующее животное</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Автопортрет</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Общая информация */}
              {answers.child_name && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800">Информация о ребенке</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="font-medium">Имя:</span> {answers.child_name}</p>
                    {answers.birth_date && (
                      <p><span className="font-medium">Дата рождения:</span> {new Date(answers.birth_date).toLocaleDateString('ru-RU')}</p>
                    )}
                    {answers.gender && (
                      <p><span className="font-medium">Пол:</span> {answers.gender}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {reportStatus === 'ready' && reportUrl && (
              <>
                <Button
                  onClick={handleViewReport}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Просмотреть отчет
                </Button>
                
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Скачать отчет
                </Button>
              </>
            )}
            
            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Пройти тест заново
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>
              Данный анализ носит рекомендательный характер. Для получения профессиональной помощи
              обратитесь к квалифицированному детскому психологу.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsScreen;