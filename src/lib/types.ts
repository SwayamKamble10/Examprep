import { FieldValue } from "firebase/firestore";

export type Exam = "JEE" | "NEET";
export type Subject = "Physics" | "Chemistry" | "Biology" | "Math";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface PracticeQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  solution: string;
}

export type UserAnswer = { 
  answer?: string; 
  status?: 'answered' | 'marked';
  timeTaken?: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  exam: Exam;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
  userAnswers: Record<number, UserAnswer | undefined>;
  startTime: number;
  endTime?: number;
  status: 'ongoing' | 'completed';
  createdAt: FieldValue | number;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}
