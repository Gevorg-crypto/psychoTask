import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { submitSurvey, setAnswers } from '../store/testSlice';
import questionsData from '../data/question.json';

interface QuestionsScreenProps {
  onCompleted: () => void;
  taskId: string | null;
}

const QuestionsScreen: React.FC<QuestionsScreenProps> = ({ onCompleted, taskId }) => {
  const [answers, setLocalAnswers] = useState<Record<string, any>>({});
  const dispatch = useAppDispatch();
  const { submitStatus, error } = useAppSelector((state) => state.test);
  const { toast } = useToast();

  useEffect(() => {
    if (submitStatus === 'succeeded') {
      toast({
        title: "Анкета отправлена",
        description: "Переходим к результатам",
      });
      onCompleted();
    } else if (submitStatus === 'failed' && error) {
      toast({
        title: "Ошибка отправки",
        description: error,
        variant: "destructive",
      });
    }
  }, [submitStatus, error, onCompleted, toast]);

  const handleInputChange = (questionId: string, value: any) => {
    setLocalAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setLocalAnswers(prev => ({ ...prev, birth_date: date?.toISOString() }));
  };

  // Get all questions from all sections and filter required ones
  const getAllQuestions = () => {
    const data = questionsData as any;
    if (data && data.sections && Array.isArray(data.sections)) {
      return data.sections.flatMap((section: any) => section.questions || []);
    }
    return [];
  };

  const isFormValid = () => {
    const allQuestions = getAllQuestions();
    const requiredQuestions = allQuestions.filter((q: any) => q.required).map((q: any) => q.id);
    return requiredQuestions.every((questionId: string) => answers[questionId] !== undefined && answers[questionId] !== '');
  };

  const handleSubmit = async () => {
    if (!taskId) {
      toast({
        title: "Ошибка",
        description: "Не найден ID задачи. Попробуйте загрузить фото заново.",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, ответьте на все вопросы перед отправкой",
        variant: "destructive",
      });
      return;
    }

    dispatch(setAnswers(answers));
    dispatch(submitSurvey({ taskId, answers }));
  };

  const submitting = submitStatus === 'loading';

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="grid gap-2">
            <Label htmlFor={question.id}>{question.question}</Label>
            <Input
              type="text"
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={question.id} className="grid gap-2">
            <Label htmlFor={question.id}>{question.question}</Label>
            <Textarea
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            />
          </div>
        );
      case 'radio':
        return (
          <div key={question.id} className="grid gap-2">
            <Label>{question.question}</Label>
            <RadioGroup
              defaultValue={answers[question.id] || ''}
              onValueChange={(value) => handleInputChange(question.id, value)}
            >
              <div className="flex flex-col space-y-1">
                {question.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}_${index}`} />
                    <Label htmlFor={`${question.id}_${index}`} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
      case 'scale':
        const scaleOptions = ['Очень редко', 'Редко', 'Иногда', 'Часто', 'Всегда'];
        return (
          <div key={question.id} className="grid gap-3">
            <Label className="text-base font-medium">{question.question}</Label>
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleInputChange(question.id, value)}
              className="flex flex-row justify-between items-center bg-gray-50 p-4 rounded-lg"
            >
              {scaleOptions.map((option, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${question.id}_${index}`}
                    className="w-5 h-5"
                  />
                  <Label 
                    htmlFor={`${question.id}_${index}`} 
                    className="cursor-pointer text-xs text-center leading-tight max-w-[80px]"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 'date':
        return (
          <div key={question.id} className="grid gap-2">
            <Label>{question.question}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !answers['birth_date'] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {answers['birth_date'] ? (
                    format(new Date(answers['birth_date']), "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ru}
                  defaultMonth={new Date()}
                  selected={answers['birth_date'] ? new Date(answers['birth_date']) : undefined}
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      default:
        return null;
    }
  };

  const data = questionsData as any;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Ответьте на вопросы
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Пожалуйста, ответьте на следующие вопросы для анализа результатов
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {data && data.sections && Array.isArray(data.sections) && data.sections.map((section: any) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
              <div className="space-y-4">
                {section.questions && Array.isArray(section.questions) && section.questions.map((question: any) => renderQuestion(question))}
              </div>
            </div>
          ))}

          <div className="text-center pt-6">
            <p className="text-sm text-gray-500 mb-4">
              Шаг 2/3 • Анкета
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
              size="lg"
              className={`
                px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300
                ${isFormValid() && !submitting
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Отправляем...
                </>
              ) : (
                'Завершить тест'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionsScreen;