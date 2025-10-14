'use client';

import type { PracticeSession, UserAnswer } from '@/lib/types';
import { useState, useReducer, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, Flag, Loader2, X } from 'lucide-react';
import { submitPracticeSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import QuestionPalette from './question-palette';
import { useUser } from '@/firebase';

type AnswersState = Record<number, UserAnswer | undefined>;
type AnswersAction = 
  | { type: 'SET_ANSWER'; payload: { index: number; answer: string, time: number } }
  | { type: 'CLEAR_ANSWER'; payload: { index: number } }
  | { type: 'TOGGLE_MARK'; payload: { index: number } };

function answersReducer(state: AnswersState, action: AnswersAction): AnswersState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const { index, answer, time } = action.payload;
      const existing = state[index] || {};
      return { ...state, [index]: { ...existing, answer, status: 'answered', timeTaken: time } };
    }
    case 'CLEAR_ANSWER': {
      const { index } = action.payload;
      const current = state[index];
      if (current) {
        const { answer, status, timeTaken, ...rest } = current;
        if(Object.keys(rest).length > 0) {
            return { ...state, [index]: rest };
        }
      }
      const { [index]: _, ...restState } = state;
      return restState;
    }
    case 'TOGGLE_MARK': {
        const { index } = action.payload;
        const current = state[index];
        if (current?.status === 'marked') {
            // unmark
            const { status, ...rest } = current;
            return { ...state, [index]: Object.keys(rest).length > 0 ? { ...rest, status: current.answer ? 'answered' : undefined } as UserAnswer : undefined };
        }
        return { ...state, [index]: { ...current, status: 'marked' } as UserAnswer };
    }
    default:
      return state;
  }
}

export function PracticeArea({ session }: { session: PracticeSession }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [answers, dispatch] = useReducer(answersReducer, {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTime, setQuestionTime] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();

  const handleSetQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    setQuestionTime(0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTime(prevTime => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex]);
  
  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  useEffect(() => {
    setSelectedOption(answers[currentQuestionIndex]?.answer);
  }, [currentQuestionIndex, answers]);

  const recordAnswer = () => {
    if (selectedOption) {
      const existingTime = answers[currentQuestionIndex]?.timeTaken || 0;
      dispatch({ type: 'SET_ANSWER', payload: { index: currentQuestionIndex, answer: selectedOption, time: existingTime + questionTime } });
    }
  }

  const handleNext = () => {
    recordAnswer();
    if (currentQuestionIndex < session.questions.length - 1) {
      handleSetQuestion(currentQuestionIndex + 1);
    }
  };
  
  const handleClear = () => {
    dispatch({ type: 'CLEAR_ANSWER', payload: { index: currentQuestionIndex } });
    setSelectedOption(undefined);
  };
  
  const handleMark = () => {
    dispatch({ type: 'TOGGLE_MARK', payload: { index: currentQuestionIndex } });
  };

  const handleQuestionSelect = (index: number) => {
    recordAnswer();
    handleSetQuestion(index);
  }
  
  const handleSubmit = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit the session.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
        recordAnswer();
        // The answers state might not have updated yet, so we'll create a final version.
        const finalAnswers = { ...answers };
        if (selectedOption) {
            const existingTime = finalAnswers[currentQuestionIndex]?.timeTaken || 0;
            finalAnswers[currentQuestionIndex] = {
                ...finalAnswers[currentQuestionIndex],
                answer: selectedOption,
                status: 'answered',
                timeTaken: existingTime + questionTime
            };
        }
        await submitPracticeSession(session.id, user.uid, finalAnswers);
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Submission failed",
            description: error instanceof Error ? error.message : "Could not submit your session.",
        });
        setIsSubmitting(false);
    }
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!session || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1} of {session.questions.length}</CardTitle>
                <div className="font-mono text-lg font-semibold bg-muted px-3 py-1 rounded-md">{formatTime(questionTime)}</div>
            </div>
            <CardDescription>Topic: {session.topic} | Difficulty: {session.difficulty}</CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base font-semibold leading-relaxed whitespace-pre-wrap">{currentQuestion.questionText}</p>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-secondary has-[:checked]:border-primary/50 transition-colors">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleMark}>
                    <Flag className={`mr-2 h-4 w-4 ${answers[currentQuestionIndex]?.status === 'marked' ? 'fill-primary text-primary' : ''}`} />
                    Mark for Review
                </Button>
                <Button variant="ghost" onClick={handleClear}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Response
                </Button>
            </div>
            <div className="flex gap-2">
                {currentQuestionIndex < session.questions.length - 1 ? (
                    <Button onClick={handleNext}>Save & Next</Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button>Submit Test</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will end your practice session and take you to the results page. You cannot undo this action.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Submit
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="hidden md:block">
        <QuestionPalette
          totalQuestions={session.questions.length}
          answers={answers}
          currentIndex={currentQuestionIndex}
          onQuestionSelect={handleQuestionSelect}
        />
      </div>
    </div>
  );
}
