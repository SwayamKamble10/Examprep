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
import { ArrowUpRight } from 'lucide-react';

const mockHistory = [
  { id: 'SESS001', subject: 'Physics', topic: 'Kinematics', date: '2024-07-20', score: 75 },
  { id: 'SESS002', subject: 'Chemistry', topic: 'Chemical Bonding', date: '2024-07-19', score: 60 },
  { id: 'SESS003', subject: 'Math', topic: 'Calculus', date: '2024-07-18', score: 85 },
];

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Welcome back, Aspirant!
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
              {mockHistory.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.subject}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{session.topic}</TableCell>
                  <TableCell className="hidden sm:table-cell">{session.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={session.score > 70 ? 'default' : 'secondary'} className={session.score > 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                        {session.score}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="#">View Results <ArrowUpRight className="h-4 w-4 ml-2" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
