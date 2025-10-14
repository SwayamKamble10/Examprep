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
      questionText: z.string().describe('The text of the question, formatted as a string. Mathematical expressions should be in LaTeX format.'),
      options: z.array(z.string()).length(4).describe('An array of exactly four possible answer options for the question.'),
      correctAnswer: z.string().describe('The correct answer for the question. This must exactly match one of the strings in the options array.'),
      solution: z.string().describe('A detailed step-by-step solution to the question. Mathematical expressions should be in LaTeX format.'),
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
  prompt: `You are an AI expert in generating practice questions for competitive exams in India. Your task is to generate {{numQuestions}} practice questions for the {{exam}} exam.
The questions should be for the subject of {{subject}} and focus on the topic of {{topic}}. The difficulty level should be {{difficulty}}.

IMPORTANT: You must follow these instructions precisely.
1.  Generate the specified number of questions.
2.  Each question must have exactly 4 multiple-choice options.
3.  The 'correctAnswer' field must be an exact match to one of the strings in the 'options' array.
4.  Provide a detailed, step-by-step solution for each question.
5.  Format all mathematical equations and symbols using LaTeX.
6.  The output must be a valid JSON object that conforms to the specified output schema. Do not include any text or formatting outside of the JSON structure.
`,
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
