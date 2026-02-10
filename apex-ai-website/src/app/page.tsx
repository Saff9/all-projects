import dynamic from 'next/dynamic';
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";

const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <div className="min-h-[400px] bg-background" />
});
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"), {
  loading: () => <div className="min-h-[600px] bg-background" />
});
const Pricing = dynamic(() => import("@/components/sections/Pricing"), {
  loading: () => <div className="min-h-[400px] bg-background" />
});
const Footer = dynamic(() => import("@/components/sections/Footer"));
const CookieBanner = dynamic(() => import("@/components/sections/CookieBanner"));

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      <div className="flex flex-col">
        <Hero />
        <Features />
        <AIPlayground />
        <Pricing />
      </div>
      <Footer />
      <CookieBanner />
    </main>
  );
}
