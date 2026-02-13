// GA4 Event Tracking Utility
// Sends custom events to Google Analytics 4

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = ({ action, category, label, value, ...rest }: GTagEvent) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
      ...rest,
    });
  }
};

// ====== Subscription & Payment Events ======

export const trackSubscriptionClick = (method: "credit_card" | "paypal") => {
  trackEvent({
    action: "begin_checkout",
    category: "subscription",
    label: method,
  });
};

export const trackSubscriptionSuccess = (subscriptionId: string) => {
  trackEvent({
    action: "purchase",
    category: "subscription",
    label: subscriptionId,
    value: 220,
    currency: "ILS",
  });
};

export const trackPricingView = () => {
  trackEvent({
    action: "view_pricing",
    category: "subscription",
  });
};

export const trackRegisterFromPricing = () => {
  trackEvent({
    action: "register_from_pricing",
    category: "subscription",
    label: "pricing_cta",
  });
};

// ====== Video Events ======

export const trackVideoPlay = (videoName: string, folderName?: string) => {
  trackEvent({
    action: "video_play",
    category: "video",
    label: videoName,
    folder_name: folderName,
  });
};

export const trackVideoComplete = (videoName: string) => {
  trackEvent({
    action: "video_complete",
    category: "video",
    label: videoName,
  });
};

// ====== Auth Events ======

export const trackLogin = (method: "credentials" | "google") => {
  trackEvent({
    action: "login",
    category: "auth",
    label: method,
  });
};

export const trackRegister = (method: "credentials" | "google") => {
  trackEvent({
    action: "sign_up",
    category: "auth",
    label: method,
  });
};

// ====== Navigation & Content Events ======

export const trackFolderView = (folderName: string) => {
  trackEvent({
    action: "folder_view",
    category: "navigation",
    label: folderName,
  });
};

export const trackStylesFilter = (filterType: "level" | "category", filterValue: string) => {
  trackEvent({
    action: "filter_content",
    category: "navigation",
    label: `${filterType}: ${filterValue}`,
  });
};

export const trackSearch = (query: string) => {
  trackEvent({
    action: "search",
    category: "navigation",
    label: query,
  });
};

// ====== Favorites & Engagement ======

export const trackAddToFavorites = (videoName: string) => {
  trackEvent({
    action: "add_to_favorites",
    category: "engagement",
    label: videoName,
  });
};

export const trackRemoveFromFavorites = (videoName: string) => {
  trackEvent({
    action: "remove_from_favorites",
    category: "engagement",
    label: videoName,
  });
};

// ====== Series Events ======

export const trackSeriesView = (seriesName: string) => {
  trackEvent({
    action: "series_view",
    category: "series",
    label: seriesName,
  });
};

export const trackSeriesPurchase = (seriesName: string, price: number) => {
  trackEvent({
    action: "series_purchase",
    category: "series",
    label: seriesName,
    value: price,
    currency: "ILS",
  });
};

export const trackSeriesPreview = (seriesName: string) => {
  trackEvent({
    action: "series_preview",
    category: "series",
    label: seriesName,
  });
};
