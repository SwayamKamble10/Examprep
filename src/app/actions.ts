'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import type { PracticeSession, PracticeQuestion } from './lib/types';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getSdks } from '@/firebase';

// A server-side only utility to get an admin-authenticated firestore instance.
function getAdminFirestore() {
    const { firestore } = getSdks();
    return firestore;
}

const PracticeSetupSchema = z.object({
  exam: z.enum(['JEE', 'NEET']),
  subject: z.enum(['Physics', 'Chemistry', 'Biology', 'Math']),
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  numQuestions: z.coerce.number().min(1, 'Please enter at least 1 question.').max(20, 'You can fetch a maximum of 20 questions.'),
});

export async function startPracticeSession(formData: FormData, userId: string) {
  if (!userId) {
    throw new Error('You must be logged in to start a practice session.');
  }
  
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

  let sessionId: string | null = null;
  try {
    const firestore = getAdminFirestore();
    const questionsCollection = collection(firestore, 'questions');
    
    // Query for questions that match the criteria
    const q = query(
      questionsCollection,
      where('exam', '==', exam),
      where('subject', '==', subject),
      where('topic', '==', topic),
      where('difficulty', '==', difficulty)
    );

    const querySnapshot = await getDocs(q);
    const fetchedQuestions = querySnapshot.docs.map(doc => doc.data() as PracticeQuestion);

    if (fetchedQuestions.length === 0) {
      throw new Error('No questions found for the selected criteria. Please try a different topic or add questions to the database.');
    }

    // Shuffle and pick the required number of questions
    const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestions);

    sessionId = randomUUID();
    const sessionRef = doc(firestore, 'users', userId, 'practiceSessions', sessionId);
    
    const sessionData: Omit<PracticeSession, 'id'> = {
      userId,
      exam,
      subject,
      topic,
      difficulty,
      questions: selectedQuestions,
      userAnswers: {},
      status: 'ongoing',
      startTime: Date.now(),
      createdAt: serverTimestamp(),
    };

    await setDoc(sessionRef, sessionData);

  } catch (error) {
    console.error('Error starting practice session:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to start practice session.');
  }

  if (sessionId) {
    redirect(`/practice/${sessionId}`);
  }
}

export async function submitPracticeSession(sessionId: string, userId: string, userAnswers: PracticeSession['userAnswers']) {
    if (!userId) {
        throw new Error('You must be logged in to submit a practice session.');
    }

    const firestore = getAdminFirestore();
    const sessionRef = doc(firestore, 'users', userId, 'practiceSessions', sessionId);

    const docSnap = await getDoc(sessionRef);

    if (!docSnap.exists()) {
        throw new Error('Session not found.');
    }

    await updateDoc(sessionRef, {
        userAnswers,
        status: 'completed',
        endTime: Date.now(),
    });

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
