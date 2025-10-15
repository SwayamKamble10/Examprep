'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Wand2, BarChart3, ShieldCheck } from '@/components/icons';

const featureCards = [
  {
    icon: <Wand2 className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Practice',
    description:
      'Generate unlimited, targeted questions for any topic with our advanced AI.',
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    title: 'Detailed Analysis',
    description:
      'Review your performance with step-by-step solutions and time analysis.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'Focused Environment',
    description:
      'A clean, distraction-free interface designed to mimic the real exam.',
  },
];


export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const heroImage = placeholderImages.placeholderImages.find(
    (p) => p.id === 'hero-landing'
  );
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleLogin = async () => {
    try {
      await initiateGoogleSignIn(auth);
      // onAuthStateChanged in the provider will handle the user state
      // and redirect to the dashboard.
      router.push('/dashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  // While checking auth state, we can show a loader or null. 
  // Returning null for a cleaner initial view.
  if (isUserLoading || user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="ml-2 text-xl font-bold font-headline">ExamPrep</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" onClick={handleGoogleLogin}>
            Login with Google
          </Button>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {heroImage && (
                <Image
                  alt="Hero"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                  data-ai-hint={heroImage.imageHint}
                  src={heroImage.imageUrl}
                  width={600}
                  height={600}
                />
              )}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                    Master Your Competitive Exams
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                    A minimalist platform providing a focused, high-quality
                    practice environment for Indian competitive exam aspirants.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Start Practicing Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Core Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  A Better Way to Practice
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                  Our platform is designed to eliminate distractions and provide
                  you with the tools you need to succeed.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-16">
              {featureCards.map((feature, index) => (
                <div key={index} className="grid gap-2 text-center">
                  <div className="flex justify-center items-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold font-headline">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 ExamPrep. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
