import { getSession } from '@/lib/session-cache';
import { notFound } from 'next/navigation';
import ResultsDisplay from '@/components/practice/results-display';
import { redirect } from 'next/navigation';

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const session = getSession(params.sessionId);

  if (!session) {
    notFound();
  }
  
  if (session.status !== 'completed') {
    // Redirect to the practice page if not completed
    redirect(`/practice/${params.sessionId}`);
  }

  // Calculate score
  let correctCount = 0;
  const answeredKeys = Object.keys(session.userAnswers).filter(key => session.userAnswers[parseInt(key)]?.status === 'answered');

  answeredKeys.forEach(key => {
    const index = parseInt(key);
    const userAnswer = session.userAnswers[index];
    if (userAnswer && userAnswer.answer === session.questions[index].correctAnswer) {
      correctCount++;
    }
  });

  const incorrectCount = answeredKeys.length - correctCount;
  const notAttemptedCount = session.questions.length - answeredKeys.length;
  const totalTime = session.endTime ? session.endTime - session.startTime : 0;

  const results = {
    correct: correctCount,
    incorrect: incorrectCount,
    notAttempted: notAttemptedCount,
    totalQuestions: session.questions.length,
    score: session.questions.length > 0 ? (correctCount / session.questions.length) * 100 : 0,
    totalTime,
  };

  return <ResultsDisplay session={session} results={results} />;
}
