'use client';

import { useState } from 'react';
import { Code, Copy, Check, Plus, Trash2, ExternalLink, Sparkles } from 'lucide-react';

type SchemaType = 'FAQPage' | 'Article' | 'SoftwareApplication' | 'HowTo' | 'Product';

export default function SchemaGenerator() {
  const [schemaType, setSchemaType] = useState<SchemaType>('FAQPage');
  const [copied, setCopied] = useState(false);

  // FAQ State
  const [faqs, setFaqs] = useState([
    { question: 'Is this schema generator free to use?', answer: 'Yes, 100% free with no registration or limits.' },
    { question: 'Does Google support FAQ schema?', answer: 'Google supports FAQPage schema for government and authoritative health/documentation websites.' },
  ]);

  // Article State
  const [article, setArticle] = useState({
    headline: 'Top 10 SEO Strategies for Ranking in 2026',
    author: 'Alex Vance',
    publisher: 'ToolForge',
    datePublished: '2026-01-15',
    image: 'https://example.com/cover.jpg',
    description: 'A comprehensive guide to boosting organic search engine rankings.',
  });

  // Software State
  const [software, setSoftware] = useState({
    name: 'ToolForge Suite',
    category: 'UtilityApplication',
    operatingSystem: 'All',
    price: '0',
    currency: 'USD',
    description: 'Free web utility tools and SEO generators.',
  });

  // HowTo State
  const [howTo, setHowTo] = useState({
    name: 'How to Generate Schema Markup',
    description: 'Learn how to generate structured data for your website in 3 simple steps.',
    steps: [
      { name: 'Choose Schema Type', text: 'Select FAQPage or Article schema.' },
      { name: 'Fill In Information', text: 'Provide accurate questions, titles, and details.' },
      { name: 'Paste in HTML', text: 'Copy the JSON-LD script into your website head.' },
    ],
  });

  // Product State
  const [product, setProduct] = useState({
    name: 'Wireless Noise Canceling Headphones',
    image: 'https://example.com/headphones.jpg',
    description: 'High fidelity audio headphones with 40-hour battery life.',
    brand: 'AudioTech',
    price: '199.99',
    currency: 'USD',
    ratingValue: '4.8',
    reviewCount: '124',
  });

  const generateJsonLd = () => {
    switch (schemaType) {
      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        };
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.headline,
          description: article.description,
          image: article.image,
          datePublished: article.datePublished,
          author: {
            '@type': 'Person',
            name: article.author,
          },
          publisher: {
            '@type': 'Organization',
            name: article.publisher,
          },
        };
      case 'SoftwareApplication':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: software.name,
          applicationCategory: software.category,
          operatingSystem: software.operatingSystem,
          description: software.description,
          offers: {
            '@type': 'Offer',
            price: software.price,
            priceCurrency: software.currency,
          },
        };
      case 'HowTo':
        return {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: howTo.name,
          description: howTo.description,
          step: howTo.steps.map((s, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: s.name,
            text: s.text,
          })),
        };
      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.image,
          description: product.description,
          brand: {
            '@type': 'Brand',
            name: product.brand,
          },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
          },
        };
    }
  };

  const jsonString = JSON.stringify(generateJsonLd(), null, 2);
  const scriptTagCode = `<script type="application/ld+json">\n${jsonString}\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTagCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Schema Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['FAQPage', 'Article', 'SoftwareApplication', 'HowTo', 'Product'] as SchemaType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSchemaType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    schemaType === type
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {type === 'SoftwareApplication' ? 'Software' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Form per Schema Type */}
          {schemaType === 'FAQPage' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">FAQ Questions &amp; Answers</span>
                <button
                  onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative">
                  {faqs.length > 1 && (
                    <button
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder={`Question #${idx + 1}`}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].answer = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder={`Answer #${idx + 1}`}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {schemaType === 'Article' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={article.headline}
                  onChange={(e) => setArticle({ ...article, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Author</label>
                  <input
                    type="text"
                    value={article.author}
                    onChange={(e) => setArticle({ ...article, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={article.publisher}
                    onChange={(e) => setArticle({ ...article, publisher: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={article.image}
                  onChange={(e) => setArticle({ ...article, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
            </div>
          )}

          {schemaType === 'SoftwareApplication' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">App Name</label>
                <input
                  type="text"
                  value={software.name}
                  onChange={(e) => setSoftware({ ...software, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={software.category}
                    onChange={(e) => setSoftware({ ...software, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price (0 for Free)</label>
                  <input
                    type="text"
                    value={software.price}
                    onChange={(e) => setSoftware({ ...software, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {schemaType === 'Product' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price</label>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rating (0-5)</label>
                  <input
                    type="text"
                    value={product.ratingValue}
                    onChange={(e) => setProduct({ ...product, ratingValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {schemaType === 'HowTo' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Guide Name</label>
                <input
                  type="text"
                  value={howTo.name}
                  onChange={(e) => setHowTo({ ...howTo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Steps</label>
                {howTo.steps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => {
                        const updated = [...howTo.steps];
                        updated[idx].name = e.target.value;
                        setHowTo({ ...howTo, steps: updated });
                      }}
                      placeholder={`Step ${idx + 1} Title`}
                      className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border rounded"
                    />
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => {
                        const updated = [...howTo.steps];
                        updated[idx].text = e.target.value;
                        setHowTo({ ...howTo, steps: updated });
                      }}
                      placeholder="Step Instructions"
                      className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON-LD Script Output */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              JSON-LD Code Output
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Test on Google <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Script!' : 'Copy Script Tag'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs overflow-x-auto max-h-[460px] font-mono leading-relaxed border border-slate-800">
            <code>{scriptTagCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
