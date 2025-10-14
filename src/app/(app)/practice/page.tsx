import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PracticeSetupForm } from '@/components/practice/practice-setup-form';

export default function PracticeSetupPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Create a New Practice Session
        </h1>
      </div>
      <div className="flex justify-center items-start pt-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Practice Setup</CardTitle>
            <CardDescription>
              Tell us what you want to practice, and our AI will generate questions for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PracticeSetupForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
