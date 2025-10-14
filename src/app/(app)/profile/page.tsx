import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">User Profile</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Manage your account settings. (This is a mock-up for the prototype).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">Aspiring Student</h2>
              <p className="text-muted-foreground">student@example.com</p>
            </div>
          </div>
          <div>
            <Button disabled>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
