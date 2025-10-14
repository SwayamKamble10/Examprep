'use client';

import { getSession } from '@/lib/session-cache';
import { notFound, redirect } from 'next/navigation';
import ResultsDisplay from '@/components/practice/results-display';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { PracticeSession } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ResultsPage({ params }: { params: { sessionId: string } }) {
  const { user, isUserLoading } = useUser();
  const [session, setSession] = useState<PracticeSession | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      redirect('/?error=unauthenticated');
      return;
    }

    const fetchSession = async () => {
      try {
        const sessionData = await getSession(params.sessionId, user.uid);
        if (!sessionData) {
          setError('Results not found for this session.');
        } else {
          setSession(sessionData);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Failed to load results.');
      }
    };

    fetchSession();
  }, [params.sessionId, user, isUserLoading]);

  if (isUserLoading || session === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading Results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
