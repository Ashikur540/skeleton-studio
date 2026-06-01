"use client";

import Script from "next/script";

/**
 * Microsoft Clarity analytics loader. Injects the official Clarity tag via
 * next/script (lazyOnload) so session recording/heatmaps load on browser idle,
 * after first paint and primary content. Reads the project id from
 * NEXT_PUBLIC_CLARITY_PROJECT_ID and renders nothing when absent (e.g. local
 * dev) to avoid noise.
 */
export function ClarityAnalytics() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  if (!projectId) return null;

  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
