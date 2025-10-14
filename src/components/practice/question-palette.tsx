'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserAnswer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Flag } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  answers: Record<number, UserAnswer | undefined>;
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
}

export default function QuestionPalette({
  totalQuestions,
  answers,
  currentIndex,
  onQuestionSelect,
}: QuestionPaletteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Palette</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const answerState = answers[index];
            const isAnswered = answerState?.status === 'answered';
            const isMarked = answerState?.status === 'marked';
            const isCurrent = index === currentIndex;

            return (
              <Button
                key={index}
                variant={isCurrent ? 'default' : isAnswered || isMarked ? 'secondary' : 'outline'}
                size="icon"
                className={cn("h-10 w-10 relative", {
                    "bg-green-200 text-green-800 hover:bg-green-300": isAnswered && !isCurrent,
                    "bg-primary/20 text-primary hover:bg-primary/30": isMarked && !isCurrent,
                })}
                onClick={() => onQuestionSelect(index)}
              >
                {index + 1}
                {isAnswered && <Check className="h-3 w-3 absolute bottom-1 right-1" />}
                {isMarked && <Flag className="h-3 w-3 absolute bottom-1 right-1" />}
              </Button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-sm bg-green-200" /> Answered</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-sm bg-primary/20" /> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-sm border" /> Not Visited</div>
            <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-sm bg-background ring-2 ring-primary" /> Current Question</div>
        </div>
      </CardContent>
    </Card>
  );
}
