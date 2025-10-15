'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const handleCopy = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast({
        title: 'Copied to clipboard!',
        description: 'Your User ID has been copied.',
      });
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          User Profile
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            This is your profile information from your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL ?? undefined} />
              <AvatarFallback>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.displayName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button disabled>Edit Profile (Coming Soon)</Button>
        </CardFooter>
      </Card>
    </>
  );
}
