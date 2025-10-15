'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitFeedback } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
  error: null,
  success: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Feedback
        </Button>
    )
}

export default function FeedbackForm() {
    const [state, formAction] = useActionState(submitFeedback, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: 'Success', description: state.success });
            formRef.current?.reset();
        }
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);

    return (
        <form 
            ref={formRef}
            action={formAction} 
            className="space-y-4"
        >
            <Textarea
                name="feedback"
                placeholder="Tell us what you think..."
                rows={5}
                required
                minLength={10}
            />
            <SubmitButton />
        </form>
    );
}
