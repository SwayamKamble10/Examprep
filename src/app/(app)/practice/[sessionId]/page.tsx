import { getSession } from '@/lib/session-cache';
import { notFound } from 'next/navigation';
import { PracticeArea } from '@/components/practice/practice-area';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PracticeSessionPage({ params }: { params: { sessionId: string } }) {
  const sessionData = getSession(params.sessionId);

  if (!sessionData) {
    notFound();
  }

  if (sessionData.status === 'completed') {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Already Completed</AlertTitle>
            <AlertDescription>
                This practice session has already been completed. You can view the results in your dashboard.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <PracticeArea session={sessionData} />
  );
}
