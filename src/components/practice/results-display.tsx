'use client';

import type { PracticeSession } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

type ResultsDisplayProps = {
  session: PracticeSession;
  results: {
    correct: number;
    incorrect: number;
    notAttempted: number;
    totalQuestions: number;
    score: number;
    totalTime: number;
  };
};

const chartConfig = {
  correct: { label: 'Correct', color: 'hsl(142.1 76.2% 36.3%)' }, // green-600
  incorrect: { label: 'Incorrect', color: 'hsl(0 84.2% 60.2%)' }, // destructive
  notAttempted: { label: 'Not Attempted', color: 'hsl(215.4 16.3% 46.9%)' }, // muted-foreground
} satisfies ChartConfig;

export default function ResultsDisplay({ session, results }: ResultsDisplayProps) {
  const chartData = [
    { name: 'correct', value: results.correct, fill: chartConfig.correct.color },
    { name: 'incorrect', value: results.incorrect, fill: chartConfig.incorrect.color },
    { name: 'notAttempted', value: results.notAttempted, fill: chartConfig.notAttempted.color },
  ];

  const formatTime = (ms: number) => {
    if(ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Practice Results</h1>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
          <CardDescription>Here's how you performed in the session on "{session.topic}".</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col space-y-4">
             <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-3xl font-bold">{results.score.toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="text-3xl font-bold">{formatTime(results.totalTime)}</p>
                </div>
             </div>
             <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 border border-green-200 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-600">Correct</p>
                    <p className="text-xl font-bold">{results.correct}</p>
                </div>
                <div className="p-2 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-600">Incorrect</p>
                    <p className="text-xl font-bold">{results.incorrect}</p>
                </div>
                <div className="p-2 border border-gray-200 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Skipped</p>
                    <p className="text-xl font-bold">{results.notAttempted}</p>
                </div>
             </div>
          </div>
          <div className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Question-wise Analysis</CardTitle>
          <CardDescription>Review each question to understand your mistakes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {session.questions.map((q, index) => {
              const userAnswer = session.userAnswers[index];
              const isCorrect = userAnswer && userAnswer.answer === q.correctAnswer;
              const isIncorrect = userAnswer && userAnswer.answer && userAnswer.answer !== q.correctAnswer;

              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : isIncorrect ? <XCircle className="h-5 w-5 text-red-500" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                      <span className="text-left font-body">Question {index + 1}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-2">
                    <p className="font-semibold">{q.questionText}</p>
                    <div className="space-y-2">
                      {q.options.map((option, i) => {
                        const isUserAnswer = userAnswer && userAnswer.answer === option;
                        const isCorrectAnswer = q.correctAnswer === option;
                        let optionClass = 'border p-3 rounded-md text-sm';
                        if (isCorrectAnswer) {
                          optionClass += ' bg-green-100 border-green-300 text-green-900';
                        }
                        if (isUserAnswer && !isCorrectAnswer) {
                          optionClass += ' bg-red-100 border-red-300 text-red-900';
                        }
                        return <div key={i} className={optionClass}>{option}</div>;
                      })}
                    </div>
                    <div className="!mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-bold mb-2 font-headline">Solution</h4>
                      <p className="text-sm whitespace-pre-wrap font-body">{q.solution}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
