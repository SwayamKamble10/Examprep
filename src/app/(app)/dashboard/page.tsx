'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { PracticeSession } from '@/lib/types';
import { format } from 'date-fns';

function SessionRow({ session }: { session: PracticeSession & { id: string } }) {
    const answeredKeys = Object.keys(session.userAnswers).filter(key => session.userAnswers[parseInt(key)]?.status === 'answered');
    const correctCount = answeredKeys.reduce((count, key) => {
        const index = parseInt(key);
        const userAnswer = session.userAnswers[index];
        if (userAnswer && userAnswer.answer === session.questions[index].correctAnswer) {
            return count + 1;
        }
        return count;
    }, 0);

    const score = session.questions.length > 0
      ? (correctCount / session.questions.length) * 100
      : 0;

    return (
        <TableRow>
            <TableCell>
            <div className="font-medium">{session.subject}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">{session.topic}</TableCell>
            <TableCell className="hidden sm:table-cell">
            {session.createdAt ? format(new Date(session.createdAt), 'PPP') : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
            <Badge variant={score > 70 ? 'default' : 'secondary'} className={score > 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {score.toFixed(0)}%
            </Badge>
            </TableCell>
            <TableCell className="text-right">
            <Button variant="outline" size="sm" asChild>
                <Link href={`/practice/${session.id}/results`}>View Results <ArrowUpRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            </TableCell>
        </TableRow>
    );
}

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const practiceSessionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'practiceSessions'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }, [firestore, user]);

    const { data: practiceHistory, isLoading } = useCollection<PracticeSession>(practiceSessionsQuery);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Aspirant'}!
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Ready to practice?</CardDescription>
            <CardTitle className="text-3xl font-headline">Start a New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Select your exam, subject, and topic to begin.</p>
            <Button size="sm" className="mt-2" asChild>
                <Link href="/practice">Start Practice</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary to-background border-dashed">
            <CardHeader className="pb-2">
                <CardDescription>Track Your Progress</CardDescription>
                <CardTitle className="text-3xl font-headline">Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Detailed insights and progress tracking are coming soon!</p>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Practice History</CardTitle>
          <CardDescription>
            Review your previously completed practice sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
             <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          )}
          {!isLoading && practiceHistory && practiceHistory.length > 0 && (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden sm:table-cell">Topic</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {practiceHistory.map((session) => (
                    <SessionRow key={session.id} session={session} />
                ))}
                </TableBody>
            </Table>
          )}
           {!isLoading && (!practiceHistory || practiceHistory.length === 0) && (
             <div className="text-center py-10">
                <p className="text-muted-foreground">You haven't completed any practice sessions yet.</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/practice">Start your first session</Link>
                </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </>
  );
}
