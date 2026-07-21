'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Large 404 Text */}
        <h1 className="text-9xl font-bold text-primary">404</h1>
        
        {/* Custom Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Oops! Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Illustration */}
        <div className="py-8">
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse delay-75" />
            <div className="absolute inset-8 bg-primary/30 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">Or explore:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/neet">NEET</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jee">JEE</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pyqs">PYQs</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mock-tests">Mock Tests</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/resources">Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
