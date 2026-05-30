export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Skeleton Studio",
    url:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://skeletons-studio.vercel.app",
    description:
      "Free online skeleton generator. Paste React/JSX components and get production-ready Tailwind CSS skeleton loaders instantly.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Skeleton Studio",
    },
    browserRequirements: "Requires JavaScript",
    featureList:
      "JSX to skeleton conversion, Tailwind CSS export, React component export, editable skeleton dimensions, shimmer animations, responsive skeleton preview",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
