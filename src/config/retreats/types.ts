export interface RetreatScheduleItem {
  time: string;
  activity: string;
  description?: string;
}

export interface RetreatScheduleDay {
  day: string;
  title: string;
  items: RetreatScheduleItem[];
}

export interface RetreatTestimonial {
  name: string;
  text: string;
  role?: string;
}

export interface RetreatFAQItem {
  question: string;
  answer: string;
}

export interface RetreatHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface RetreatGalleryImage {
  src: string;
  alt: string;
}

export interface RetreatInstructor {
  name: string;
  title: string;
  bio: string[];
  image: string;
  credentials?: string[];
}

export interface RetreatConfig {
  // Basic
  slug: string;
  title: string;
  subtitle: string;
  tagline?: string;

  // Dates & Location
  date: string;
  dateRange?: string;
  location: string;
  locationDescription?: string;
  mapLink?: string;

  // Pricing
  price: string;
  earlyBirdPrice?: string;
  earlyBirdDeadline?: string;
  priceNote?: string;

  // Availability
  maxParticipants?: number;
  spotsLeft?: number;

  // Media
  heroImage: string;
  gallery: RetreatGalleryImage[];

  // Content
  about: string[];
  highlights: RetreatHighlight[];
  schedule: RetreatScheduleDay[];
  includes: string[];
  excludes?: string[];

  // Instructor
  instructor: RetreatInstructor;

  // Social proof
  testimonials: RetreatTestimonial[];

  // FAQ
  faq: RetreatFAQItem[];

  // CTA
  ctaText: string;
  ctaLink: string;
  ctaPhone?: string;
  ctaWhatsApp?: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;

  // Customization
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };

  // Status
  isActive: boolean;
  registrationOpen: boolean;
}
