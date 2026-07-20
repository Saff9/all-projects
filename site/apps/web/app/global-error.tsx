'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Mail } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold">Something Went Wrong</h1>

        {/* Error Message */}
        <p className="text-muted-foreground">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Technical Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="text-left p-4 bg-muted rounded-lg text-sm">
            <p className="font-mono text-red-500">{error.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={() => reset()} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Contact Support */}
        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please contact support
          </p>
          <Button variant="link" className="mt-2" asChild>
            <a href="mailto:support@jeeneet.com">
              <Mail className="mr-2 h-4 w-4" />
              support@jeeneet.com
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
