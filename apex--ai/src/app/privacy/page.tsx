"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
        </Link>

        <div className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-sora">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Data Collection</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Apex AI is designed with privacy in mind. We collect minimal data necessary to provide the service:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Conversations:</strong> Stored locally in your browser. We do not store your conversations on our servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>API Keys:</strong> If you provide your own API keys, they are stored locally and never transmitted to our servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Usage Data:</strong> Basic analytics to improve the service (page views, error rates).</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">How We Use Your Data</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your data is used solely to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Provide AI chat functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Improve service reliability and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Debug issues when they occur</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Data Storage</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All your conversations and settings are stored in your browser&apos;s local storage. This means:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Your data stays on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Clearing browser data will delete your conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>We cannot recover your data if lost</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Third-Party Services</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We use the following third-party AI providers to power our chat:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Groq:</strong> For fast AI responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>HuggingFace:</strong> For creative AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>OpenRouter:</strong> For additional AI capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Serper:</strong> For web search functionality</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Your messages are sent to these providers to generate responses. Please review their respective privacy policies.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Contact</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy or your data, please contact us through our social media channels listed in the app settings.
              </p>
            </section>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Apex AI • Built with love in Kashmir
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
