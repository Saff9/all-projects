import dynamic from 'next/dynamic';
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import { getPostsFromDB, getAllCategories } from "@/lib/blog";

const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <div className="min-h-[400px] bg-background" />
});
const Stats = dynamic(() => import("@/components/Stats"));
const AIPlayground = dynamic(() => import("@/components/sections/AIPlayground"), {
  loading: () => <div className="min-h-[600px] bg-background" />
});
const Testimonials = dynamic(() => import("@/components/sections/Testimonials"));
const Blog = dynamic(() => import("@/components/sections/Blog"));
const Newsletter = dynamic(() => import("@/components/sections/Newsletter"));
const Pricing = dynamic(() => import("@/components/sections/Pricing"), {
  loading: () => <div className="min-h-[400px] bg-background" />
});
const Footer = dynamic(() => import("@/components/sections/Footer"));
const CookieBanner = dynamic(() => import("@/components/sections/CookieBanner"));

export default async function Home() {
  const [blogPosts, blogCategories] = await Promise.all([
    getPostsFromDB(6, 0), // Get 6 posts for homepage
    getAllCategories()
  ]);
  return (
    <main id="top" className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <Header />
      <div className="flex flex-col">
        <Hero />
        <Features />
        <Stats />
        <AIPlayground />
        <Testimonials />
        <Blog posts={blogPosts} categories={blogCategories} />
        <Pricing />
      </div>
      <Newsletter />
      <Footer />
      <CookieBanner />
    </main>
  );
}
