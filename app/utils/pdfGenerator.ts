import jsPDF from 'jspdf';

export const generatePDFReport = async (testData: any) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Заголовок
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Психологический анализ детских рисунков', pageWidth / 2, yPosition, {
    align: 'center'
  });
  yPosition += 20;

  // Дата создания
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('ru-RU');
  pdf.text(`Дата создания отчета: ${currentDate}`, 20, yPosition);
  yPosition += 20;

  // Основная информация
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Общая информация', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const basicInfo = [
    { label: 'Имя ребенка', value: testData.answers.child_name || 'Не указано' },
    { label: 'Дата рождения', value: testData.answers.birth_date ? new Date(testData.answers.birth_date).toLocaleDateString('ru-RU') : 'Не указано' },
    { label: 'Пол', value: testData.answers.gender || 'Не указано' },
    { label: 'Родитель/опекун', value: testData.answers.guardian_name || 'Не указано' }
  ];

  basicInfo.forEach((item) => {
    pdf.text(`${item.label}: ${item.value}`, 20, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Анализ эмоциональной сферы
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Анализ эмоциональной сферы', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const emotionalAnalysis = analyzeEmotionalSphere(testData.answers);
  pdf.text(emotionalAnalysis, 20, yPosition, { maxWidth: pageWidth - 40 });
  yPosition += pdf.getTextDimensions(emotionalAnalysis, { maxWidth: pageWidth - 40 }).h + 10;

  // Социальное взаимодействие
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Социальное взаимодействие', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const socialAnalysis = analyzeSocialInteraction(testData.answers);
  pdf.text(socialAnalysis, 20, yPosition, { maxWidth: pageWidth - 40 });
  yPosition += pdf.getTextDimensions(socialAnalysis, { maxWidth: pageWidth - 40 }).h + 10;

  // Саморегуляция
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Саморегуляция и поведение', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const selfRegulationAnalysis = analyzeSelfRegulation(testData.answers);
  pdf.text(selfRegulationAnalysis, 20, yPosition, { maxWidth: pageWidth - 40 });
  yPosition += pdf.getTextDimensions(selfRegulationAnalysis, { maxWidth: pageWidth - 40 }).h + 10;

  // Рекомендации
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Рекомендации', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const recommendations = generateRecommendations(testData.answers);
  pdf.text(recommendations, 20, yPosition, { maxWidth: pageWidth - 40 });

  // Сохранение файла
  const childName = testData.answers.child_name || 'ребенок';
  pdf.save(`Психологический_анализ_${childName}_${currentDate.replace(/\./g, '_')}.pdf`);
};

const analyzeEmotionalSphere = (answers: any) => {
  const joyScore = answers.joy_frequency || 0;
  const sadnessScore = answers.sadness_frequency || 0;
  const angerScore = answers.anger_without_reason || 0;

  let analysis = "Анализ эмоциональной сферы:\n\n";

  if (joyScore >= 4) {
    analysis += "Ребенок демонстрирует высокий уровень позитивных эмоций, что является благоприятным показателем эмоционального развития.\n\n";
  } else if (joyScore <= 2) {
    analysis += "Отмечается низкий уровень проявления радости и удовольствия. Рекомендуется обратить внимание на эмоциональное состояние ребенка.\n\n";
  }

  if (sadnessScore >= 4 || angerScore >= 4) {
    analysis += "Высокий уровень проявления негативных эмоций может указывать на необходимость дополнительной психологической поддержки.\n\n";
  }

  return analysis;
};

const analyzeSocialInteraction = (answers: any) => {
  const friendsScore = answers.makes_friends_easily || 0;
  const avoidsPlayingScore = answers.avoids_playing_with_children || 0;

  let analysis = "Анализ социального взаимодействия:\n\n";

  if (friendsScore >= 4) {
    analysis += "Ребенок демонстрирует хорошие социальные навыки и легко устанавливает контакты со сверстниками.\n\n";
  } else if (friendsScore <= 2) {
    analysis += "Отмечаются трудности в установлении социальных контактов. Рекомендуется работа над развитием коммуникативных навыков.\n\n";
  }

  if (avoidsPlayingScore >= 4) {
    analysis += "Ребенок предпочитает одиночные игры, что может указывать на интровертированность или социальные трудности.\n\n";
  }

  return analysis;
};

const analyzeSelfRegulation = (answers: any) => {
  const followsRulesScore = answers.follows_rules || 0;
  const impulseControlScore = answers.impulse_control_difficulty || 0;

  let analysis = "Анализ саморегуляции и поведения:\n\n";

  if (followsRulesScore >= 4) {
    analysis += "Ребенок демонстрирует хорошие навыки саморегуляции и способность следовать правилам.\n\n";
  } else if (followsRulesScore <= 2) {
    analysis += "Отмечаются трудности с соблюдением правил и инструкций. Рекомендуется работа над развитием самоконтроля.\n\n";
  }

  if (impulseControlScore >= 4) {
    analysis += "Высокий уровень импульсивности требует особого внимания и возможной коррекционной работы.\n\n";
  }

  return analysis;
};

const generateRecommendations = (answers: any) => {
  let recommendations = "Рекомендации для развития ребенка:\n\n";
  
  recommendations += "1. Регулярные игры и творческие занятия для развития эмоциональной сферы.\n\n";
  recommendations += "2. Поощрение социального взаимодействия через групповые активности.\n\n";
  recommendations += "3. Установление четких, но справедливых правил и границ.\n\n";
  recommendations += "4. Развитие навыков эмоциональной регуляции через обучение техникам самоуспокоения.\n\n";
  
  if (answers.development_concerns) {
    recommendations += "5. Консультация с детским психологом для более детального анализа особенностей развития.\n\n";
  }
  
  recommendations += "Данный анализ носит рекомендательный характер. For получения профессиональной помощи обратитесь к квалифицированному детскому психологу.";
  
  return recommendations;
};