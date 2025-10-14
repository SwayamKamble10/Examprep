import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import FeedbackForm from '@/components/feedback-form';

export default function FeedbackPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Submit Feedback</h1>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>We value your opinion</CardTitle>
          <CardDescription>
            Help us improve ExamPrep by sharing your thoughts, reporting issues, or requesting features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>
    </>
  );
}
