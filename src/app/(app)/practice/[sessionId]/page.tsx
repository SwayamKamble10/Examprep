'use client';

import { getSession } from '@/lib/session-cache';
import { notFound, redirect } from 'next/navigation';
import { PracticeArea } from '@/components/practice/practice-area';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import type { PracticeSession } from '@/lib/types';

export default function PracticeSessionPage({ params }: { params: { sessionId: string } }) {
  const { user, isUserLoading } = useUser();
  const [sessionData, setSessionData] = useState<PracticeSession | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) return; 
    if (!user) {
      redirect('/?error=unauthenticated');
      return;
    }

    const fetchSession = async () => {
      try {
        const session = await getSession(params.sessionId, user.uid);
        if (!session) {
          setError('Session not found.');
        } else {
          setSessionData(session);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Failed to load session.');
      }
    };

    fetchSession();
  }, [params.sessionId, user, isUserLoading]);

  if (isUserLoading || sessionData === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading Session...</p>
      </div>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (!sessionData) {
    notFound();
  }

  if (sessionData.status === 'completed') {
    return (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Already Completed</AlertTitle>
            <AlertDescription>
                This practice session has already been completed. Redirecting to results...
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <PracticeArea session={sessionData} />
  );
}
