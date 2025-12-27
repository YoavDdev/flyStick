"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  nameHebrew?: string;
  description: string;
  descriptionHebrew?: string;
  price: number;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchProducts = async () => {
      try {
        if (status === "loading") return;

        if (!session?.user?.email) {
          router.push("/login");
          return;
        }

        const userResponse = await axios.post("/api/get-user-subsciptionId", {
          userEmail: session.user.email,
        });

        const subscriptionId = userResponse.data.subscriptionId;
        
        if (subscriptionId !== "Admin") {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        const productsResponse = await fetch("/api/admin/products");
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const data = await productsResponse.json();
        setProducts(data.filter((p: Product) => p.isActive));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchProducts();
  }, [session, status, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-pulse text-[#2D3142]/40 mb-4">
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" opacity="0.3" />
              <circle cx="50" cy="20" r="5" />
              <circle cx="20" cy="50" r="5" />
            </svg>
          </div>
          <p className="text-[#2D3142]/60 text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] via-[#FAF7F2] to-[#F7F3EB]">
      {/* Hero Section - Enhanced Minimalist Kohu Style */}
      <div className="relative overflow-hidden border-b border-[#2D3142]/5">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8DFD4]/20 via-transparent to-[#D5C4B7]/10" />
          
          {/* Large KOHU Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/KOHU no text .png" 
              alt="" 
              className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] object-contain opacity-[0.08]"
            />
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D5C4B7]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E8DFD4]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-6xl mx-auto">
            {/* Studio Boaz Branding */}
            <div className="text-center mb-8">
              <p className="text-sm sm:text-base text-[#2D3142]/50 font-light tracking-[0.15em] mb-2">
                STUDIO BOAZ
              </p>
              <div className="h-px w-16 bg-[#2D3142]/20 mx-auto" />
            </div>

            {/* Main Content - Centered */}
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-[#D5C4B7]/20 px-6 py-2 rounded-full mb-8">
                <svg className="w-5 h-5 text-[#2D3142]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm text-[#2D3142]/60 font-light tracking-wide">חנות אונליין</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#2D3142] leading-tight mb-6">
                חנות <span className="text-[#2D3142]/70">KOHU</span>
              </h1>

              <p className="text-xl sm:text-2xl text-[#2D3142]/50 font-light tracking-[0.15em] mb-4">
                ערפל עדין
              </p>

              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#2D3142]/20 to-transparent mx-auto mb-6" />

              <p className="text-lg sm:text-xl text-[#2D3142]/60 font-light leading-relaxed max-w-2xl mx-auto mb-8">
                ברוכים הבאים לחנות המקוונת של <strong className="font-normal">Studio Boaz</strong>. 
                כאן תוכלו למצוא מוצרים מיוחדים שנבחרו בקפידה עבורכם.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-sm text-[#2D3142]/50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>משלוח מהיר</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2D3142]/50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>תשלום מאובטח</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2D3142]/50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>איכות מעולה</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section - Enhanced */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-[#2D3142] tracking-wide mb-4">המוצרים שלנו</h2>
            <div className="h-px w-16 bg-[#2D3142]/20 mx-auto" />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex w-32 h-32 rounded-full bg-gradient-to-br from-[#2D3142]/5 to-[#2D3142]/10 items-center justify-center mb-8 shadow-lg">
                <svg className="w-16 h-16 text-[#2D3142]/20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                </svg>
              </div>
              <p className="text-[#2D3142]/40 text-xl font-light mb-2">
                אין מוצרים זמינים כרגע
              </p>
              <p className="text-[#2D3142]/30 text-sm font-light">
                בקרוב תוכלו למצוא כאן מוצרים מיוחדים
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group"
                >
                  <Link href={`/shop/${product.id}`} className="block">
                    {/* Product Card */}
                    <div className="relative">
                      {/* Image Container with Enhanced Effects */}
                      <div className="relative w-full h-[350px] sm:h-[400px] mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-[#FAF7F2] shadow-lg group-hover:shadow-2xl transition-all duration-700 flex items-center justify-center">
                        {/* Image */}
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.nameHebrew || product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F7F3EB] via-[#FAF7F2] to-[#E8DFD4]">
                            <img src="/KOHU no text .png" alt="KOHU" className="w-32 h-32 opacity-20" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D3142]/40 via-[#2D3142]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        {/* CTA Button - Appears on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="px-8 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <span className="text-[#2D3142] font-light tracking-wide">צפה במוצר</span>
                          </div>
                        </div>

                        {/* Stock Badge */}
                        {product.stock > 0 && product.stock <= 5 && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs rounded-full">
                            נותרו {product.stock} בלבד
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-3 text-center px-4">
                        <h3 className="text-2xl sm:text-3xl font-light text-[#2D3142] tracking-wide group-hover:text-[#2D3142]/70 transition-colors duration-300">
                          {product.nameHebrew || product.name}
                        </h3>
                        
                        <p className="text-sm sm:text-base text-[#2D3142]/60 font-light line-clamp-2 leading-relaxed min-h-[48px]">
                          {product.descriptionHebrew || product.description}
                        </p>

                        {/* Price with Animation */}
                        <div className="pt-4 pb-2">
                          <div className="inline-block relative">
                            <span className="text-3xl sm:text-4xl font-light text-[#2D3142]">₪{product.price}</span>
                            <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2D3142]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="pt-2">
                          {product.stock > 0 ? (
                            <div className="inline-flex items-center gap-2 text-xs text-[#2D3142]/40 font-light">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                              <span>במלאי</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-xs text-red-400/60 font-light">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                              <span>אזל מהמלאי</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Enhanced */}
      <div className="border-t border-[#2D3142]/10 bg-gradient-to-b from-transparent to-[#F7F3EB]/50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src="/KOHU.png" alt="KOHU" className="w-24 h-24 opacity-40" />
            </div>
            
            {/* Brand Text */}
            <p className="text-sm text-[#2D3142]/40 font-light tracking-[0.3em]">
              KOHU ATMOSPHERE
            </p>
            
            {/* Divider */}
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#2D3142]/20 to-transparent mx-auto" />
            
            {/* Tagline */}
            <p className="text-xs text-[#2D3142]/30 font-light max-w-md mx-auto leading-relaxed">
              נשימה של חיים • מעבר בין עולמות • התחלה חדשה
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
