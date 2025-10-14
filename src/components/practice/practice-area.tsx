'use client';

import type { PracticeSession, UserAnswer } from '@/lib/types';
import { useState, useReducer, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, Flag, Loader2, Sparkles, X } from 'lucide-react';
import { submitPracticeSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import QuestionPalette from './question-palette';

type AnswersState = Record<number, UserAnswer | undefined>;
type AnswersAction = 
  | { type: 'SET_ANSWER'; payload: { index: number; answer: string } }
  | { type: 'CLEAR_ANSWER'; payload: { index: number } }
  | { type: 'TOGGLE_MARK'; payload: { index: number } };

function answersReducer(state: AnswersState, action: AnswersAction): AnswersState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const { index, answer } = action.payload;
      return { ...state, [index]: { ...state[index], answer, status: 'answered' } };
    }
    case 'CLEAR_ANSWER': {
      const { index } = action.payload;
      const { [index]: _, ...rest } = state;
      return rest;
    }
    case 'TOGGLE_MARK': {
        const { index } = action.payload;
        const current = state[index];
        if (current?.status === 'marked') {
            // unmark
            const { status, ...rest } = current;
            return { ...state, [index]: Object.keys(rest).length > 0 ? { ...rest, status: 'answered' } as UserAnswer : undefined };
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
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Date.now() - session.startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.startTime]);
  
  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  useEffect(() => {
    setSelectedOption(answers[currentQuestionIndex]?.answer);
  }, [currentQuestionIndex, answers]);

  const handleNext = () => {
    if (selectedOption) {
      dispatch({ type: 'SET_ANSWER', payload: { index: currentQuestionIndex, answer: selectedOption } });
    }
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleClear = () => {
    dispatch({ type: 'CLEAR_ANSWER', payload: { index: currentQuestionIndex } });
    setSelectedOption(undefined);
  };
  
  const handleMark = () => {
    dispatch({ type: 'TOGGLE_MARK', payload: { index: currentQuestionIndex } });
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        if (selectedOption) {
            dispatch({ type: 'SET_ANSWER', payload: { index: currentQuestionIndex, answer: selectedOption } });
        }
        await submitPracticeSession(session.id, answers);
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Submission failed",
            description: error instanceof Error ? error.message : "Could not submit your session.",
        });
        setIsSubmitting(false);
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1} of {session.questions.length}</CardTitle>
                <div className="font-mono text-lg font-semibold bg-muted px-3 py-1 rounded-md">{formatTime(timeElapsed)}</div>
            </div>
            <CardDescription>Topic: {session.topic} | Difficulty: {session.difficulty}</CardDescription>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base font-semibold leading-relaxed">{currentQuestion.questionText}</p>
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
          onQuestionSelect={setCurrentQuestionIndex}
        />
      </div>
    </div>
  );
}
