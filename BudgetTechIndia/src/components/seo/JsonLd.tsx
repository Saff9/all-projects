import React from 'react';

interface JsonLdProps {
  type: 'website' | 'organization' | 'product' | 'article' | 'breadcrumbs' | 'faq';
  data: Record<string, any>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, data }) => {
  let schema: Record<string, any> = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'website':
      schema = {
        ...schema,
        '@type': 'WebSite',
        name: 'BudgetTechIndia',
        url: 'https://budget-tech-india.vercel.app',
        description: 'Best budget tech products, reviews, and deals under ₹2000 in India.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://budget-tech-india.vercel.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
      break;

    case 'organization':
      schema = {
        ...schema,
        '@type': 'Organization',
        name: 'BudgetTechIndia',
        url: 'https://budget-tech-india.vercel.app',
        logo: 'https://budget-tech-india.vercel.app/icons/icon-512x512.png',
        sameAs: [
          'https://x.com/saff9?s=20',
          'https://www.youtube.com/@saff9',
          'https://instagram.com/budgettechindia',
        ],
        ...data,
      };
      break;

    case 'product':
      schema = {
        ...schema,
        '@type': 'Product',
        name: data.name,
        image: data.imageUrl || data.image,
        description: data.description,
        brand: {
          '@type': 'Brand',
          name: data.brand || 'Budget Tech',
        },
        offers: {
          '@type': 'Offer',
          url: data.affiliateUrl || 'https://budget-tech-india.vercel.app',
          priceCurrency: 'INR',
          price: data.price,
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Amazon India',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating || 4.5,
          reviewCount: data.reviewCount || 1200,
          bestRating: 5,
          worstRating: 1,
        },
      };
      break;

    case 'breadcrumbs':
      schema = {
        ...schema,
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: { name: string; url: string }, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `https://budget-tech-india.vercel.app${item.url}`,
        })),
      };
      break;

    case 'faq':
      schema = {
        ...schema,
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq: { question: string; answer: string }) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      break;

    default:
      schema = {
        ...schema,
        ...data,
      };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
