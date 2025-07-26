import React from 'react';

const StructuredDataHome = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Studio Boaz Online",
    "alternateName": ["בועז סטודיו און לין", "סטודיו בועז אונליין", "בועז סטודיו", "Studio Boaz", "Boaz Studio"],
    "url": "https://www.studioboazonline.com",
    "logo": "https://www.studioboazonline.com/favicon2.ico",
    "description": "Studio Boaz Online - בועז סטודיו און לין. בועז נחייסי מציע אימונים אישיים, פלייסטיק ותנועה מרפאה. סטודיו בועז אונליין עם שיעורי וידאו מקצועיים לחיבור גוף ונפש.",
    "founder": {
      "@type": "Person",
      "name": "בועז נחייסי",
      "alternateName": "Boaz Nahaissi"
    },
    "sameAs": [
      "https://www.studioboazonline.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "zzaaoobb@gmail.com",
      "contactType": "customer service",
      "areaServed": "IL",
      "availableLanguage": ["Hebrew", "English"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Israel"
    },
    "knowsAbout": [
      "פלייסטיק", "תנועה מרפאה", "אימונים אישיים", "יוגה", "פילאטיס", 
      "Flyastic", "Movement Therapy", "Personal Training", "Yoga", "Pilates"
    ],
    "offers": {
      "@type": "Service",
      "name": "Online Fitness Classes",
      "description": "שיעורי כושר ותנועה מרפאה אונליין",
      "provider": {
        "@type": "Organization",
        "name": "Studio Boaz Online"
      }
    }
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Studio Boaz Online",
    "alternateName": "בועז סטודיו און לין",
    "url": "https://www.studioboazonline.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.studioboazonline.com/explore?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["he", "en"],
    "about": {
      "@type": "Thing",
      "name": "Online Fitness and Movement Therapy"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
};

export default StructuredDataHome;
