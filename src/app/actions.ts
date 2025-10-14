'use server';

import { generatePracticeQuestions, type GeneratePracticeQuestionsInput } from '@/ai/flows/generate-practice-questions';
import { createSession, updateSession } from '@/lib/session-cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import type { PracticeSession } from './lib/types';


const PracticeSetupSchema = z.object({
  exam: z.enum(['JEE', 'NEET']),
  subject: z.enum(['Physics', 'Chemistry', 'Biology', 'Math']),
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  numQuestions: z.coerce.number().min(1, 'Please enter at least 1 question.').max(10, 'You can generate a maximum of 10 questions for this prototype.'),
});

export async function startPracticeSession(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validationResult = PracticeSetupSchema.safeParse(rawData);

  if (!validationResult.success) {
    const error = validationResult.error.flatten().fieldErrors;
    const errorMessage = Object.values(error).flat().join(', ');
    throw new Error(errorMessage || 'Invalid form data.');
  }

  const { exam, subject, topic, difficulty, numQuestions } = validationResult.data;

  if (exam === 'NEET' && subject === 'Math') {
    throw new Error('Math is not a subject in NEET.');
  }
  if (exam === 'JEE' && subject === 'Biology') {
    throw new Error('Biology is not a subject in JEE (Main).');
  }

  const aiInput: GeneratePracticeQuestionsInput = {
    exam,
    subject,
    topic,
    difficulty,
    numQuestions,
  };

  try {
    const { questions } = await generatePracticeQuestions(aiInput);
    
    if (!questions || questions.length === 0) {
      throw new Error('AI failed to generate questions. Please try a different topic.');
    }

    const sessionId = randomUUID();
    createSession(sessionId, {
      exam,
      subject,
      topic,
      difficulty,
      questions,
    });
    
    redirect(`/practice/${sessionId}`);
  } catch (error) {
    console.error('Error generating practice session:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to start practice session.');
  }
}

export async function submitPracticeSession(sessionId: string, userAnswers: PracticeSession['userAnswers']) {
    const session = updateSession(sessionId, {
        userAnswers,
        status: 'completed',
        endTime: Date.now(),
    });

    if (!session) {
        throw new Error('Session not found.');
    }

    redirect(`/practice/${sessionId}/results`);
}


export async function submitFeedback(prevState: any, formData: FormData) {
    const feedback = formData.get('feedback') as string;
    if (!feedback || feedback.trim().length < 10) {
        return { error: 'Feedback must be at least 10 characters long.' };
    }
    console.log('Feedback submitted:', feedback);
    // Here you would save the feedback to your database
    return { success: 'Thank you for your feedback!' };
}