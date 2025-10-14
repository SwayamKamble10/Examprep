'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addQuestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subjectConfig } from '@/components/practice/practice-setup-form';
import type { Exam } from '@/lib/types';


const AddQuestionSchema = z.object({
  exam: z.enum(['JEE', 'NEET'], { required_error: 'Please select an exam.' }),
  subject: z.enum(['Physics', 'Chemistry', 'Biology', 'Math'], { required_error: 'Please select a subject.' }),
  topic: z.string().min(3, 'Topic is required.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], { required_error: 'Please select a difficulty.' }),
  year: z.coerce.number().min(1980, 'Invalid year.').max(new Date().getFullYear(), 'Year cannot be in the future.'),
  questionText: z.string().min(10, 'Question text is required.'),
  option1: z.string().min(1, 'Option 1 is required.'),
  option2: z.string().min(1, 'Option 2 is required.'),
  option3: z.string().min(1, 'Option 3 is required.'),
  option4: z.string().min(1, 'Option 4 is required.'),
  correctAnswer: z.string().min(1, 'Correct answer is required.'),
  solution: z.string().min(10, 'Solution is required.'),
});

type AddQuestionValues = z.infer<typeof AddQuestionSchema>;

export default function AddQuestionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddQuestionValues>({
    resolver: zodResolver(AddQuestionSchema),
    defaultValues: {
      year: new Date().getFullYear() - 1,
    },
  });

  const selectedExam = form.watch('exam');

  const onSubmit = async (data: AddQuestionValues) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    try {
      const result = await addQuestion(formData);
      if(result.error) {
        throw new Error(result.error);
      }
      toast({
        title: 'Question Added!',
        description: 'The new question has been successfully added to the database.',
      });
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add question.',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Add a New Question</h1>
        </div>
        <Card className="w-full max-w-4xl">
            <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>
                Fill out the form below to add a new question to the question bank.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Exam, Subject, Topic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="exam"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Exam</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); form.resetField('subject'); }} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger></FormControl>
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
                                <FormControl><SelectTrigger><SelectValue placeholder={selectedExam ? "Select Subject" : "Select exam first"} /></SelectTrigger></FormControl>
                                <SelectContent>
                                {selectedExam && subjectConfig[selectedExam as Exam].map(subject => (
                                    <SelectItem key={subject.value} value={subject.value}>
                                        <div className="flex items-center gap-2"><subject.icon className="h-4 w-4" />{subject.label}</div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="topic" render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., Thermodynamics" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 {/* Difficulty, Year */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger></FormControl>
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
                    <FormField control={form.control} name="year" render={({ field }) => (<FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" placeholder="e.g., 2021" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {/* Question Text */}
                <FormField control={form.control} name="questionText" render={({ field }) => (<FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea placeholder="Enter the full question text here..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="option1" render={({ field }) => (<FormItem><FormLabel>Option 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="option2" render={({ field }) => (<FormItem><FormLabel>Option 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="option3" render={({ field }) => (<FormItem><FormLabel>Option 3</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="option4" render={({ field }) => (<FormItem><FormLabel>Option 4</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {/* Correct Answer */}
                 <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl><Input placeholder="Copy-paste the exact text of the correct option" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Solution */}
                <FormField control={form.control} name="solution" render={({ field }) => (<FormItem><FormLabel>Solution</FormLabel><FormControl><Textarea placeholder="Provide a detailed step-by-step solution." {...field} rows={6} /></FormControl><FormMessage /></FormItem>)} />

                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>) : (<><PlusCircle className="mr-2 h-4 w-4" />Add Question to Database</>)}
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
    </>
  );
}
