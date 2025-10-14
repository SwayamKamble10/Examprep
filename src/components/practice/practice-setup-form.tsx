'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { startPracticeSession } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Atom, Beaker, Dna, Loader2, Sigma, BookCopy } from 'lucide-react';
import type { Exam } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const PracticeSetupSchema = z.object({
  exam: z.enum(['JEE', 'NEET'], { required_error: 'Please select an exam.' }),
  subject: z.enum(['Physics', 'Chemistry', 'Biology', 'Math'], { required_error: 'Please select a subject.' }),
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], { required_error: 'Please select a difficulty.' }),
  numQuestions: z.coerce.number().min(1, 'At least 1 question.').max(20, 'Max 20 questions.'),
});

type PracticeSetupValues = z.infer<typeof PracticeSetupSchema>;

const subjectConfig = {
    JEE: [
      { value: 'Physics', label: 'Physics', icon: Atom },
      { value: 'Chemistry', label: 'Chemistry', icon: Beaker },
      { value: 'Math', label: 'Math', icon: Sigma },
    ],
    NEET: [
      { value: 'Physics', label: 'Physics', icon: Atom },
      { value: 'Chemistry', label: 'Chemistry', icon: Beaker },
      { value: 'Biology', label: 'Biology', icon: Dna },
    ],
  };

export function PracticeSetupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<PracticeSetupValues>({
    resolver: zodResolver(PracticeSetupSchema),
    defaultValues: {
      topic: '',
      numQuestions: 5,
    },
  });

  const selectedExam = form.watch('exam');

  const onSubmit = async (data: PracticeSetupValues) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to start a practice session.",
        });
        return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    try {
      await startPracticeSession(formData, user.uid);
      // Redirect is handled by the server action
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Something went wrong.",
            description: error instanceof Error ? error.message : "Failed to create session.",
        });
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="exam"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Exam</FormLabel>
                <Select onValueChange={(value) => {
                    field.onChange(value);
                    form.resetField('subject');
                }} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an exam" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="JEE">JEE (Engineering)</SelectItem>
                    <SelectItem value="NEET">NEET (Medical)</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedExam}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={selectedExam ? "Select a subject" : "Select an exam first"} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {selectedExam && subjectConfig[selectedExam as Exam].map(subject => (
                        <SelectItem key={subject.value} value={subject.value}>
                            <div className="flex items-center gap-2">
                                <subject.icon className="h-4 w-4" />
                                {subject.label}
                            </div>
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kinematics, Chemical Bonding" {...field} />
              </FormControl>
              <FormDescription>
                The specific topic you want to practice questions on.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="numQuestions"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Number of Questions</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="20" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" disabled={isSubmitting || !user} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching Questions...
            </>
          ) : (
            <>
              <BookCopy className="mr-2 h-4 w-4" />
              Start Practice Test
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
