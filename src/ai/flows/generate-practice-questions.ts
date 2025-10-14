'use server';

/**
 * @fileOverview A practice question generator AI agent.
 *
 * - generatePracticeQuestions - A function that handles the question generation process.
 * - GeneratePracticeQuestionsInput - The input type for the generatePracticeQuestions function.
 * - GeneratePracticeQuestionsOutput - The return type for the generatePracticeQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePracticeQuestionsInputSchema = z.object({
  exam: z.string().describe('The exam for which the questions are generated (e.g., JEE, NEET).'),
  subject: z.string().describe('The subject of the questions (e.g., Physics, Chemistry, Biology, Math).'),
  topic: z.string().describe('The specific topic for which the questions should be generated.'),
  difficulty: z.string().describe('The difficulty level of the questions (e.g., Easy, Medium, Hard).'),
  numQuestions: z.number().describe('The number of questions to generate.')
});

export type GeneratePracticeQuestionsInput = z.infer<typeof GeneratePracticeQuestionsInputSchema>;

const GeneratePracticeQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string().describe('The text of the question.'),
      options: z.array(z.string()).describe('The possible answer options for the question.'),
      correctAnswer: z.string().describe('The correct answer for the question.'),
      solution: z.string().describe('A detailed step-by-step solution to the question.'),
    })
  ).describe('An array of practice questions.')
});

export type GeneratePracticeQuestionsOutput = z.infer<typeof GeneratePracticeQuestionsOutputSchema>;

export async function generatePracticeQuestions(input: GeneratePracticeQuestionsInput): Promise<GeneratePracticeQuestionsOutput> {
  return generatePracticeQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeQuestionsPrompt',
  input: {schema: GeneratePracticeQuestionsInputSchema},
  output: {schema: GeneratePracticeQuestionsOutputSchema},
  prompt: `You are an AI expert in generating practice questions for competitive exams. You will generate {{numQuestions}} practice questions for the {{exam}} exam, specifically for the subject of {{subject}}, and focusing on the topic of {{topic}}. The difficulty level of the questions should be {{difficulty}}. Each question should have 4 options, clearly labeled as A, B, C, and D. Provide the correct answer and a detailed, step-by-step solution for each question.

Here's the format for each question:

Question: [The question text]
Options:
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [The correct answer]
Solution: [The detailed step-by-step solution]`,
});

const generatePracticeQuestionsFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuestionsFlow',
    inputSchema: GeneratePracticeQuestionsInputSchema,
    outputSchema: GeneratePracticeQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
