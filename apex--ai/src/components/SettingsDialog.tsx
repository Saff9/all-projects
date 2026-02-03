"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Key,
  User,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sun,
  Moon,
  Monitor,
  Youtube,
  Instagram,
  Github,
  Globe,
  FileText,
  ExternalLink,
  Palette,
  Type,
  Vibrate,
  Sparkles,
} from 'lucide-react';
import { getSettings, saveSettings, clearAllData, getRateLimitData, COLOR_THEMES, FONT_OPTIONS, type UserSettings } from '@/lib/store';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const socialLinks = {
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
  website: process.env.NEXT_PUBLIC_WEBSITE_URL || '',
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [rateLimit, setRateLimit] = useState({ count: 0, limit: 70 });
  const [hasChanges, setHasChanges] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (open) {
      setSettings(getSettings());
      setRateLimit(getRateLimitData());
      setDeleteConfirm(false);
      setHasChanges(false);
    }
  }, [open]);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setHasChanges(false);
      applyColorTheme(settings.colorTheme);
      applyFont(settings.fontFamily);
      toast.success('Settings saved successfully');
    }
  };

  const applyColorTheme = (themeName: keyof typeof COLOR_THEMES) => {
    const colorTheme = COLOR_THEMES[themeName];
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? colorTheme.dark : colorTheme.light;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
  };

  const applyFont = (fontKey: keyof typeof FONT_OPTIONS) => {
    const font = FONT_OPTIONS[fontKey];
    document.body.style.fontFamily = font.family;
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm) {
      clearAllData();
      toast.success('All data deleted successfully');
      onOpenChange(false);
      window.location.reload();
    } else {
      setDeleteConfirm(true);
    }
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
      setHasChanges(true);
    }
  };

  const updateApiKey = (key: keyof UserSettings['apiKeys'], value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        apiKeys: { ...settings.apiKeys, [key]: value },
      });
      setHasChanges(true);
    }
  };

  const openExternalUrl = (url: string) => {
    if (url) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    }
  };

  if (!settings) return null;

  const hasSocialLinks = socialLinks.youtube || socialLinks.instagram || socialLinks.github || socialLinks.website;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 glass-strong border-border/50">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 font-sora text-lg sm:text-xl">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure your Apex AI preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1">
          <div className="px-4 sm:px-6 pt-4">
            <TabsList className="w-full grid grid-cols-5 h-10 sm:h-11 glass">
              <TabsTrigger value="general" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1 sm:px-2">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1 sm:px-2">
                <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Look</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1 sm:px-2">
                <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">API</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1 sm:px-2">
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">About</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1 sm:px-2">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[350px] sm:h-[400px] px-4 sm:px-6 py-4">
            <TabsContent value="general" className="mt-0 space-y-4 sm:space-y-6">
              <div className="glass rounded-xl p-3 sm:p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Usage Statistics</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Your daily usage</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Requests today</span>
                    <span className="font-medium">{rateLimit.count} / {rateLimit.limit}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min((rateLimit.count / rateLimit.limit) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {rateLimit.limit - rateLimit.count} requests remaining. Resets daily at midnight.
                  </p>
                </div>
              </div>

              <div className="glass rounded-xl p-3 sm:p-4">
                <h3 className="font-medium text-sm sm:text-base mb-3">Theme</h3>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="gap-2 flex-1"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="gap-2 flex-1"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="gap-2 flex-1"
                  >
                    <Monitor className="w-4 h-4" />
                    Auto
                  </Button>
                </div>
              </div>

              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Vibrate className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Vibration Feedback</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Vibrate on new AI response (mobile)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Account ID</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">{settings.userId.slice(0, 20)}...</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-4 sm:space-y-6">
              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Color Theme</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Choose calm colors - less UV for your eyes
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(COLOR_THEMES) as [keyof typeof COLOR_THEMES, typeof COLOR_THEMES[keyof typeof COLOR_THEMES]][]).map(([key, colorTheme]) => (
                    <button
                      key={key}
                      onClick={() => updateSettings({ colorTheme: key })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        settings.colorTheme === key 
                          ? 'ring-2 ring-primary bg-primary/10' 
                          : 'glass hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ background: colorTheme.light.primary }}
                        />
                        <span className="text-xs font-medium">{colorTheme.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{colorTheme.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Type className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Font Style</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Choose your preferred reading font
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FONT_OPTIONS) as [keyof typeof FONT_OPTIONS, typeof FONT_OPTIONS[keyof typeof FONT_OPTIONS]][]).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => updateSettings({ fontFamily: key })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        settings.fontFamily === key 
                          ? 'ring-2 ring-primary bg-primary/10' 
                          : 'glass hover:bg-accent/50'
                      }`}
                    >
                      <span 
                        className="text-sm font-medium block mb-0.5"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{font.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="mt-0 space-y-3 sm:space-y-4">
              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm">Use Your Own API Keys</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Add your personal API keys for unlimited usage. Keys are stored locally and never sent to our servers.
                    </p>
                  </div>
                </div>
              </div>

              {[
                { key: 'groq', label: 'Groq API Key', placeholder: 'gsk_...', hint: 'Get from console.groq.com' },
                { key: 'huggingface', label: 'HuggingFace Token', placeholder: 'hf_...', hint: 'Get from huggingface.co/settings/tokens' },
                { key: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-...', hint: 'Get from openrouter.ai/keys' },
                { key: 'search', label: 'Serper API Key (Web Search)', placeholder: 'Your serper key', hint: 'Get from serper.dev' },
              ].map(({ key, label, placeholder, hint }) => (
                <div key={key} className="glass rounded-xl p-3 sm:p-4 space-y-2">
                  <Label htmlFor={key} className="text-xs sm:text-sm font-medium">{label}</Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type={showApiKeys[key] ? 'text' : 'password'}
                      value={settings.apiKeys[key as keyof typeof settings.apiKeys]}
                      onChange={(e) => updateApiKey(key as keyof typeof settings.apiKeys, e.target.value)}
                      placeholder={placeholder}
                      className="pr-10 font-mono text-xs sm:text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7"
                      onClick={() => setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                      {showApiKeys[key] ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{hint}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="about" className="mt-0 space-y-3 sm:space-y-4">
              <div className="glass rounded-xl p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-sora font-semibold text-lg">Apex AI</h3>
                <p className="text-sm text-muted-foreground mt-1">Fast. Smart. Calm on your eyes.</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Developed by {process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Saffan'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {process.env.NEXT_PUBLIC_DEVELOPER_LOCATION || 'Kashmir, India'}
                </p>
              </div>

              {hasSocialLinks && (
                <div className="glass rounded-xl p-3 sm:p-4">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Connect With Us
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {socialLinks.youtube && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExternalUrl(socialLinks.youtube)}
                        className="gap-2 justify-start h-12 px-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Youtube className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">YouTube</p>
                          <p className="text-[10px] text-muted-foreground">Watch videos</p>
                        </div>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    )}
                    {socialLinks.instagram && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExternalUrl(socialLinks.instagram)}
                        className="gap-2 justify-start h-12 px-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                          <Instagram className="w-4 h-4 text-pink-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">Instagram</p>
                          <p className="text-[10px] text-muted-foreground">Follow us</p>
                        </div>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    )}
                    {socialLinks.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExternalUrl(socialLinks.github)}
                        className="gap-2 justify-start h-12 px-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                          <Github className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">GitHub</p>
                          <p className="text-[10px] text-muted-foreground">View code</p>
                        </div>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    )}
                    {socialLinks.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openExternalUrl(socialLinks.website)}
                        className="gap-2 justify-start h-12 px-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium">Website</p>
                          <p className="text-[10px] text-muted-foreground">Learn more</p>
                        </div>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="glass rounded-xl p-3 sm:p-4">
                <h3 className="font-medium text-sm mb-3">Legal</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openExternalUrl('/privacy')}
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Privacy Policy
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0 space-y-3 sm:space-y-4">
              <div className="glass rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">Use Data for Training</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Allow conversations to improve AI
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.allowDataTraining}
                    onCheckedChange={(checked) => updateSettings({ allowDataTraining: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="glass rounded-xl p-3 sm:p-4 border border-destructive/20">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive text-sm sm:text-base">Delete All Data</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 mb-3">
                      Permanently delete all conversations, settings, and local data. This cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      className="gap-2 text-xs"
                    >
                      {deleteConfirm ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Click again to confirm
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete All Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-3 sm:p-4 border-t border-border/50 flex justify-between items-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <Button onClick={handleSave} disabled={!hasChanges} size="sm" className="gap-2 text-xs sm:text-sm">
            {hasChanges ? (
              <>
                <Save className="w-3.5 h-3.5" />
                Save
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
