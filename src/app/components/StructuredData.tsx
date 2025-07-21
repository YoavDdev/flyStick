"use client";

interface StructuredDataProps {
  type?: 'website' | 'person' | 'organization' | 'course' | 'video';
  data?: any;
}

export default function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = 'https://www.studioboazonline.com';
    
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "סטודיו בועז אונליין",
          "alternateName": "Studio Boaz Online",
          "url": baseUrl,
          "description": "בואו לצלול לשפע עצום של שיעורים ותרגילים שפותחו כדי להעשיר ולפתח את החיבור בין הגוף לנפש שלכם ולשדרג את מצבו התפקודי עם אימונים וטכניקות ברמות קושי מגוונות. בועז נחייסי מלמד פלייסטיק, תנועה מרפאה ואימונים אישיים.",
          "inLanguage": "he-IL",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/explore?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Person",
            "name": "בועז נחייסי",
            "alternateName": "Boaz Nahaissi",
            "jobTitle": "מדריך תנועה ופלייסטיק",
            "description": "מייסד בית הספר של בועז נחייסי מאז 2012, מלמד פלייסטיק, תנועה מרפאה ואימונים אישיים",
            "url": `${baseUrl}/about`,
            "sameAs": [
              baseUrl
            ]
          }
        };
        
      case 'person':
        return {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "בועז נחייסי",
          "alternateName": "Boaz Nahaissi",
          "jobTitle": "מדריך תנועה ופלייסטיק",
          "description": "מייסד בית הספר של בועז נחייסי מאז 2012, מקום של חדשנות, יזמות ועידוד לחיבור ושינוי. המציא את שיטת הפלייסטיק ב-2013 ומלמד בפסטיבלים, כנסים, קהל אולימפי, קבוצות, קורסי מורים, הכשרות והשתלמויות.",
          "url": `${baseUrl}/about`,
          "worksFor": {
            "@type": "Organization",
            "name": "סטודיו בועז אונליין",
            "url": baseUrl
          },
          "knowsAbout": [
            "פלייסטיק",
            "תנועה מרפאה", 
            "אימונים אישיים",
            "יוגה",
            "פילאטיס",
            "חיבור גוף נפש",
            "תנועה ונשימה"
          ],
          "sameAs": [
            baseUrl
          ]
        };
        
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "סטודיו בועז אונליין",
          "alternateName": "Studio Boaz Online",
          "url": baseUrl,
          "logo": `${baseUrl}/android-chrome-144x144.png`,
          "description": "סטודיו אונליין לאימונים אישיים, תנועה מרפאה ופלייסטיק. בועז נחייסי מלמד ומדריך תנועה ונשימה לחיבור גוף ונפש.",
          "founder": {
            "@type": "Person",
            "name": "בועז נחייסי"
          },
          "foundingDate": "2012",
          "areaServed": "IL",
          "serviceType": [
            "אימונים אישיים",
            "תנועה מרפאה",
            "פלייסטיק",
            "יוגה",
            "פילאטיס",
            "שיעורי וידאו אונליין"
          ],
          "sameAs": [
            baseUrl
          ]
        };
        
      case 'course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": data?.name || "קורס תנועה ונשימה",
          "description": data?.description || "קורס מקיף לתנועה מרפאה וחיבור גוף נפש",
          "provider": {
            "@type": "Organization",
            "name": "סטודיו בועז אונליין",
            "url": baseUrl
          },
          "instructor": {
            "@type": "Person",
            "name": "בועז נחייסי"
          },
          "courseMode": "online",
          "inLanguage": "he-IL",
          "educationalLevel": "beginner to advanced",
          "about": [
            "תנועה מרפאה",
            "פלייסטיק", 
            "חיבור גוף נפש",
            "תנועה ונשימה"
          ]
        };
        
      default:
        return {};
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}
