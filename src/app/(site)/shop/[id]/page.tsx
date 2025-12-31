"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ProductVariant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  stock: number;
  order: number;
}

interface Product {
  id: string;
  name: string;
  nameHebrew?: string;
  description: string;
  descriptionHebrew?: string;
  price: number;
  images: string[];
  stock: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  weight?: number;
  dimensions?: string;
  isActive: boolean;
}

export default function ProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryMethod: "pickup",
    deliveryNotes: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    const checkAdminAndFetchProduct = async () => {
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
        setCheckoutForm(prev => ({
          ...prev,
          customerName: session.user?.name || "",
          customerEmail: session.user?.email || "",
        }));

        const productsResponse = await fetch("/api/admin/products");
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const products = await productsResponse.json();
        
        const foundProduct = products.find((p: Product) => p.id === productId);
        if (!foundProduct) {
          toast.error("מוצר לא נמצא");
          router.push("/shop");
          return;
        }

        setProduct(foundProduct);
        // Auto-select first variant if product has variants
        if (foundProduct.hasVariants && foundProduct.variants && foundProduct.variants.length > 0) {
          const firstVariant = foundProduct.variants[0];
          setSelectedVariant(firstVariant);
          // Set variant image if available
          if (firstVariant.image && foundProduct.images) {
            const variantImageIndex = foundProduct.images.indexOf(firstVariant.image);
            if (variantImageIndex !== -1) {
              setSelectedImage(variantImageIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("שגיאה בטעינת המוצר");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      checkAdminAndFetchProduct();
    }
  }, [session, status, router, productId]);

  const handleOrder = async () => {
    if (!product) return;

    if (checkoutForm.paymentMethod === "cash") {
      if (!checkoutForm.customerName || !checkoutForm.customerEmail || !checkoutForm.customerPhone) {
        toast.error("נא למלא שם, אימייל וטלפון");
        return;
      }

      setIsOrdering(true);
      try {
        const response = await fetch("/api/shop/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ 
              productId: product.id, 
              quantity,
              variantId: selectedVariant?.id,
              variantName: selectedVariant?.name,
            }],
            ...checkoutForm,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create order");
        }

        const order = await response.json();
        toast.success(`הזמנה ${order.orderNumber} נוצרה בהצלחה!`);
        router.push("/shop");
      } catch (error: any) {
        console.error("Error creating order:", error);
        toast.error(error.message || "שגיאה ביצירת הזמנה");
      } finally {
        setIsOrdering(false);
      }
    } else {
      toast.error("תשלום PayPal יתווסף בקרוב");
    }
  };

  if (loading || status === "loading" || !product) {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-pulse text-[#2D3142]/40 mb-4">
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" opacity="0.3" />
            </svg>
          </div>
          <p className="text-[#2D3142]/60 text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3EB] via-[#FAF7F2] to-[#F7F3EB]">
      <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[#2D3142]/60 hover:text-[#2D3142] transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-light">חזרה לחנות</span>
        </Link>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative w-full">
                <div className="relative w-full h-[500px] sm:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-white to-[#FAF7F2] shadow-xl flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage] || product.images[0]}
                      alt={product.nameHebrew || product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F7F3EB] to-[#E8DFD4]">
                      <svg className="w-32 h-32 text-[#2D3142]/10" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {product.images && product.images.length > 1 && (
                    <>
                      {/* Right Arrow - Previous Image */}
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg flex items-center justify-center group z-10"
                        aria-label="תמונה קודמת"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3142]/70 group-hover:text-[#2D3142] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Left Arrow - Next Image */}
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-lg flex items-center justify-center group z-10"
                        aria-label="תמונה הבאה"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3142]/70 group-hover:text-[#2D3142] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="w-full">
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white/50 ${
                          selectedImage === index
                            ? "border-[#2D3142]/40 ring-2 ring-[#2D3142]/20"
                            : "border-[#2D3142]/10 hover:border-[#2D3142]/20"
                        }`}
                      >
                        <img src={img} alt={`${product.nameHebrew} ${index + 1}`} className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Title & Price */}
              <div className="space-y-4 pb-6 border-b border-[#2D3142]/10">
                <h1 className="text-4xl sm:text-5xl font-light text-[#2D3142] tracking-wide">
                  {product.nameHebrew || product.name}
                </h1>
                <p className="text-3xl font-light text-[#2D3142]">₪{product.price}</p>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-light text-[#2D3142] tracking-wide">על המוצר</h2>
                <p className="text-[#2D3142]/70 font-light leading-relaxed whitespace-pre-line">
                  {product.descriptionHebrew || product.description}
                </p>
              </div>

              {/* Variant Selector */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-[#2D3142]/10">
                  <label className="block text-[#2D3142]/60 font-light">בחר אפשרות:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          // Change main image to variant image if available
                          if (variant.image && product.images) {
                            const variantImageIndex = product.images.indexOf(variant.image);
                            if (variantImageIndex !== -1) {
                              setSelectedImage(variantImageIndex);
                            }
                          }
                        }}
                        disabled={variant.stock === 0}
                        className={`px-4 py-3 rounded-xl border-2 transition-all ${
                          selectedVariant?.id === variant.id
                            ? "border-[#2D3142] bg-[#2D3142]/5 text-[#2D3142]"
                            : variant.stock > 0
                            ? "border-[#2D3142]/20 hover:border-[#2D3142]/40 text-[#2D3142]/70"
                            : "border-[#2D3142]/10 text-[#2D3142]/30 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold">{variant.name}</div>
                          {variant.stock === 0 && (
                            <div className="text-xs text-red-500 mt-1">אזל</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Variant Description */}
                  {selectedVariant?.description && (
                    <div className="mt-4 p-4 bg-[#F7F3EB]/50 rounded-xl border border-[#2D3142]/10">
                      <p className="text-[#2D3142]/70 font-light leading-relaxed whitespace-pre-line text-sm" dir="rtl">
                        {selectedVariant.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Product Details */}
              {(product.weight || product.dimensions) && (
                <div className="space-y-3 text-sm text-[#2D3142]/60 font-light">
                  {product.weight && <p>משקל: {product.weight} גרם</p>}
                  {product.dimensions && <p>מידות: {product.dimensions}</p>}
                </div>
              )}

              {/* Quantity & Stock */}
              <div className="space-y-4 pt-6 border-t border-[#2D3142]/10">
                <div className="flex items-center gap-4">
                  <label className="text-[#2D3142]/60 font-light">כמות:</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-[#2D3142]/20 hover:border-[#2D3142]/40 hover:bg-[#2D3142]/5 transition-all"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-lg">{quantity}</span>
                    <button
                      onClick={() => {
                        const maxStock = product.hasVariants && selectedVariant ? selectedVariant.stock : product.stock;
                        setQuantity(Math.min(maxStock, quantity + 1));
                      }}
                      className="w-10 h-10 rounded-full border border-[#2D3142]/20 hover:border-[#2D3142]/40 hover:bg-[#2D3142]/5 transition-all"
                      disabled={quantity >= (product.hasVariants && selectedVariant ? selectedVariant.stock : product.stock)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[#2D3142]/40 font-light">
                  {(() => {
                    const currentStock = product.hasVariants && selectedVariant ? selectedVariant.stock : product.stock;
                    return currentStock > 0 ? `${currentStock} יחידות במלאי` : "אזל מהמלאי";
                  })()}
                </p>
              </div>

              {/* Checkout Form */}
              {!showCheckout ? (
                <button
                  onClick={() => {
                    if (product.hasVariants && !selectedVariant) {
                      toast.error("נא לבחור אפשרות");
                      return;
                    }
                    setShowCheckout(true);
                  }}
                  disabled={(() => {
                    const currentStock = product.hasVariants && selectedVariant ? selectedVariant.stock : product.stock;
                    return currentStock === 0;
                  })()}
                  className="w-full py-4 px-8 bg-[#2D3142] text-white rounded-full font-light tracking-wide hover:bg-[#3D3D3D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {(() => {
                    const currentStock = product.hasVariants && selectedVariant ? selectedVariant.stock : product.stock;
                    return currentStock > 0 ? "המשך לרכישה" : "אזל מהמלאי";
                  })()}
                </button>
              ) : (
                <div className="space-y-6 pt-6 border-t border-[#2D3142]/10">
                  <h3 className="text-xl font-light text-[#2D3142]">פרטי הזמנה</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">שם מלא</label>
                      <input
                        type="text"
                        value={checkoutForm.customerName}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">אימייל</label>
                      <input
                        type="email"
                        value={checkoutForm.customerEmail}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">טלפון *</label>
                      <input
                        type="tel"
                        value={checkoutForm.customerPhone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm"
                        dir="rtl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">אופן משלוח</label>
                      <select
                        value={checkoutForm.deliveryMethod}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryMethod: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm"
                        dir="rtl"
                      >
                        <option value="pickup">איסוף עצמי</option>
                        <option value="shipping" disabled>משלוח (בקרוב)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">אופן תשלום</label>
                      <select
                        value={checkoutForm.paymentMethod}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm"
                        dir="rtl"
                      >
                        <option value="cash">מזומן באיסוף</option>
                        <option value="paypal" disabled>PayPal (בקרוב)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-[#2D3142]/60 mb-2">הערות</label>
                      <textarea
                        value={checkoutForm.deliveryNotes}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryNotes: e.target.value })}
                        className="w-full px-4 py-3 border border-[#2D3142]/20 rounded-xl focus:border-[#2D3142]/40 focus:outline-none bg-white/50 backdrop-blur-sm resize-none"
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#2D3142]/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg text-[#2D3142]/60">סה&quot;כ:</span>
                      <span className="text-2xl font-light text-[#2D3142]">₪{totalPrice}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleOrder}
                        disabled={isOrdering || product.stock === 0}
                        className="flex-1 py-4 px-8 bg-[#2D3142] text-white rounded-full font-light tracking-wide hover:bg-[#3D3D3D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isOrdering ? "מעבד..." : "אישור הזמנה"}
                      </button>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="px-6 py-4 border border-[#2D3142]/20 rounded-full font-light hover:border-[#2D3142]/40 transition-all"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
