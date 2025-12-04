'use client';

import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, Copy, Share2, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  PLATFORM_CONFIGS,
  TEMPLATES,
  type TemplateType,
} from './templates/ShareImageTemplates';

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roast: string;
  glowUp?: string;
  intensity: 'mild' | 'spicy';
  isPro: boolean;
  resumeText?: string;
}

type PlatformKey = keyof typeof PLATFORM_CONFIGS;

const POPULAR_PLATFORMS: PlatformKey[] = [
  'instagram_square',
  'instagram_story',
  'twitter_post',
  'linkedin_post',
  'reddit_post',
  'threads_post',
  'youtube_thumbnail',
  'tiktok_video',
  'facebook_post',
  'pinterest_pin',
];

export function SocialShareModal({
  open,
  onOpenChange,
  roast,
  glowUp,
  intensity,
  isPro,
  resumeText,
}: SocialShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>('twitter_post');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!templateRef.current) return;

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `roastmyresume-${selectedPlatform}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Image downloaded! 🔥',
        description: 'Your roast image is ready to share.',
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: 'Failed to generate image',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPlatform]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!templateRef.current) return;

    setIsGenerating(true);
    try {
      const blob = await toPng(templateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      }).then(url => fetch(url).then(res => res.blob()));

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copied to clipboard! 📋',
        description: 'Paste it anywhere to share your roast.',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Failed to copy',
        description: 'Try downloading instead.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback((platform: string) => {
    const urls: Record<string, string> = {
      twitter: 'https://twitter.com/intent/tweet?text=Check%20out%20my%20resume%20roast%20from%20RoastMyResume!%20🔥',
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=https://roastmyresume.com',
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=https://roastmyresume.com',
      reddit: 'https://www.reddit.com/submit?title=My%20resume%20got%20roasted&url=https://roastmyresume.com',
      whatsapp: 'whatsapp://send?text=Check%20out%20my%20resume%20roast!%20🔥%20https://roastmyresume.com',
      telegram: 'https://t.me/share/url?url=https://roastmyresume.com&text=Check%20out%20my%20resume%20roast!%20🔥',
    };

    const url = urls[platform.toLowerCase()] || urls.twitter;
    window.open(url, '_blank', 'width=600,height=400');

    toast({
      title: 'Opening share dialog...',
      description: `Sharing to ${platform}`,
    });
  }, []);

  const SelectedTemplate = TEMPLATES[selectedTemplate];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <ImageIcon className="w-7 h-7" />
            Share Your Roast
          </DialogTitle>
          <DialogDescription>
            Generate perfectly sized images for any social media platform.
            {!isPro && (
              <span className="block mt-2 text-amber-600 font-medium">
                ⚠️ Free tier includes watermark. Upgrade to Pro for watermark-free images!
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Platform</label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={(value) => setSelectedPlatform(value as PlatformKey)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <optgroup label="Popular">
                        {POPULAR_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {PLATFORM_CONFIGS[platform].name}
                            {' '}({PLATFORM_CONFIGS[platform].width}×{PLATFORM_CONFIGS[platform].height})
                          </SelectItem>
                        ))}
                      </optgroup>
                      <optgroup label="All Platforms">
                        {Object.entries(PLATFORM_CONFIGS)
                          .filter(([key]) => !POPULAR_PLATFORMS.includes(key as PlatformKey))
                          .map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.name} ({config.width}×{config.height})
                            </SelectItem>
                          ))}
                      </optgroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Template Style</label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={(value) => setSelectedTemplate(value as TemplateType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Gradient)</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="newspaper">Newspaper</SelectItem>
                      <SelectItem value="meme">Meme Format</SelectItem>
                      <SelectItem value="quote">Quote Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full h-12 text-lg"
                  >
                    {isGenerating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Image
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full h-12"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-medium mb-3">Quick Share</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => handleShare('twitter')}>
                      Twitter/X
                    </Button>
                    <Button variant="outline" onClick={() => handleShare('linkedin')}>
                      LinkedIn
                    </Button>
                    <Button variant="outline" onClick={() => handleShare('reddit')}>
                      Reddit
                    </Button>
                    <Button variant="outline" onClick={() => handleShare('facebook')}>
                      Facebook
                    </Button>
                    <Button variant="outline" onClick={() => handleShare('whatsapp')}>
                      WhatsApp
                    </Button>
                    <Button variant="outline" onClick={() => handleShare('telegram')}>
                      Telegram
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                <div className="transform scale-[0.3] origin-center">
                  <SelectedTemplate
                    ref={templateRef}
                    roast={roast}
                    glowUp={glowUp}
                    intensity={intensity}
                    platform={selectedPlatform}
                    isPro={isPro}
                    resumeText={resumeText}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPlatform === key ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedPlatform(key as PlatformKey);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted-foreground/20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-semibold text-sm">{config.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {config.width}×{config.height}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Object.keys(TEMPLATES) as TemplateType[]).map((templateKey) => (
                <Card
                  key={templateKey}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedTemplate === templateKey ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTemplate(templateKey)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-4xl">
                        {templateKey === 'default' && '🎨'}
                        {templateKey === 'minimalist' && '✨'}
                        {templateKey === 'newspaper' && '📰'}
                        {templateKey === 'meme' && '😂'}
                        {templateKey === 'quote' && '💬'}
                      </span>
                    </div>
                    <h3 className="font-semibold capitalize">{templateKey}</h3>
                    <p className="text-xs text-muted-foreground">
                      {templateKey === 'default' && 'Beautiful gradient background with branding'}
                      {templateKey === 'minimalist' && 'Clean, simple design focused on the roast'}
                      {templateKey === 'newspaper' && 'Classic newspaper layout for maximum impact'}
                      {templateKey === 'meme' && 'Popular meme format for viral sharing'}
                      {templateKey === 'quote' && 'Elegant quote card design'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
