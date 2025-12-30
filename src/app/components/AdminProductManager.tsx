"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface ProductVariant {
  id?: string;
  name: string;
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
  sku?: string;
  weight?: number;
  dimensions?: string;
  category?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  variants?: ProductVariant[];
  order: number;
  createdAt: string;
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    nameHebrew: "",
    description: "",
    descriptionHebrew: "",
    price: 0,
    images: [],
    stock: 0,
    sku: "",
    category: "",
    tags: [],
    isActive: true,
    isFeatured: false,
    hasVariants: false,
    variants: [],
    order: 0,
  });
  const [imageInput, setImageInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products?includeInactive=true");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("שגיאה בטעינת מוצרים");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setFormData({
      name: "",
      nameHebrew: "",
      description: "",
      descriptionHebrew: "",
      price: 0,
      images: [],
      stock: 0,
      sku: "",
      category: "",
      tags: [],
      isActive: true,
      isFeatured: false,
      hasVariants: false,
      variants: [],
      order: 0,
    });
    setImageInput("");
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreating(false);
    setFormData(product);
    setImageInput("");
  };

  const handleSave = async () => {
    try {
      const url = editingProduct
        ? "/api/admin/products"
        : "/api/admin/products";
      
      const method = editingProduct ? "PUT" : "POST";
      
      const body = editingProduct
        ? { ...formData, id: editingProduct.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save product");

      toast.success(editingProduct ? "מוצר עודכן בהצלחה" : "מוצר נוצר בהצלחה");
      setEditingProduct(null);
      setIsCreating(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("שגיאה בשמירת מוצר");
    }
  };

  const handleHide = async (productId: string) => {
    if (!confirm("האם אתה בטוח שברצונך להסתיר מוצר זה?")) return;

    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, isActive: false }),
      });

      if (!response.ok) throw new Error("Failed to hide product");

      toast.success("מוצר הוסתר בהצלחה");
      fetchProducts();
    } catch (error) {
      console.error("Error hiding product:", error);
      toast.error("שגיאה בהסתרת מוצר");
    }
  };

  const handlePermanentDelete = async (productId: string, productName: string) => {
    if (!confirm(`⚠️ מחיקה קבועה!\n\nהאם אתה בטוח שברצונך למחוק לצמיתות את המוצר "${productName}"?\n\nפעולה זו לא ניתנת לביטול!`)) return;

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      toast.success("מוצר נמחק לצמיתות");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("שגיאה במחיקת מוצר");
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/product-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setFormData({
        ...formData,
        images: [...(formData.images || []), ...uploadedUrls],
      });

      toast.success(`${uploadedUrls.length} תמונות הועלו בהצלחה`);
      event.target.value = ''; // Reset file input
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'שגיאה בהעלאת תמונות');
    } finally {
      setUploadingImage(false);
    }
  };


  if (loading) {
    return <div className="text-center py-8">טוען מוצרים...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ניהול מוצרי החנות</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#D5C4B7] text-[#2D3142] rounded-lg hover:bg-[#B8A99C] transition-colors"
        >
          + הוסף מוצר חדש
        </button>
      </div>

      {(isCreating || editingProduct) && (
        <div className="bg-white border border-[#D5C4B7] rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold mb-4">
            {isCreating ? "מוצר חדש" : "עריכת מוצר"}
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">שם המוצר</label>
            <input
              type="text"
              value={formData.nameHebrew || ""}
              onChange={(e) => setFormData({ ...formData, nameHebrew: e.target.value, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">תיאור המוצר</label>
            <textarea
              value={formData.descriptionHebrew || ""}
              onChange={(e) => setFormData({ ...formData, descriptionHebrew: e.target.value, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">מחיר (₪)</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.hasVariants ? "מלאי (לא בשימוש כשיש גרסאות)" : "מלאי"}
              </label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={formData.hasVariants}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku || ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">קטגוריה</label>
            <input
              type="text"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">תמונות מוצר</label>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block">
                <div className="px-4 py-3 bg-[#2D3142] text-white rounded-lg hover:bg-[#3D3D3D] transition-colors cursor-pointer text-center">
                  {uploadingImage ? (
                    <span>מעלה תמונות...</span>
                  ) : (
                    <span>📷 בחר תמונות להעלאה</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1 text-center">ניתן לבחור מספר תמונות (JPEG, PNG, WebP - עד 5MB)</p>
            </div>

            {/* URL Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="או הדבק URL של תמונה"
              />
              <button
                onClick={addImage}
                className="px-4 py-2 bg-[#D5C4B7] text-[#2D3142] rounded-md hover:bg-[#B8A99C]"
              >
                הוסף URL
              </button>
            </div>

            {/* Image Gallery */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={img} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2214%22%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="מחק תמונה"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">מוצר פעיל</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">מוצר מומלץ</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Product Variants Section */}
          <div className="border-t pt-4">
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={(e) => {
                    const hasVariants = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      hasVariants,
                      variants: hasVariants ? (formData.variants || []) : []
                    });
                  }}
                  className="rounded"
                />
                <span className="text-sm font-medium">יש למוצר גרסאות (טעמים, צבעים וכו&apos;)</span>
              </label>
            </div>

            {formData.hasVariants && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">גרסאות מוצר</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        variants: [...(formData.variants || []), { name: "", stock: 0, order: (formData.variants?.length || 0) }]
                      });
                    }}
                    className="px-3 py-1 text-sm bg-[#D5C4B7] text-[#2D3142] rounded hover:bg-[#B8A99C]"
                  >
                    + הוסף גרסה
                  </button>
                </div>

                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white p-3 rounded border">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => {
                              const newVariants = [...(formData.variants || [])];
                              newVariants[index] = { ...newVariants[index], name: e.target.value };
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="שם הגרסה (לדוגמה: בזיליקום, שום)"
                            dir="rtl"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => {
                              const newVariants = [...(formData.variants || [])];
                              newVariants[index] = { ...newVariants[index], stock: parseInt(e.target.value) || 0 };
                              setFormData({ ...formData, variants: newVariants });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="מלאי"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = formData.variants?.filter((_, i) => i !== index) || [];
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="מחק גרסה"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">לחץ על &quot;הוסף גרסה&quot; כדי להתחיל</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#2D3142] text-white rounded-lg hover:bg-[#3D3D3D] transition-colors"
            >
              שמור
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsCreating(false);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold">מוצרים קיימים ({products.length})</h3>
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white border rounded-lg p-4 ${
              product.isActive ? "border-[#D5C4B7]" : "border-gray-300 opacity-60"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-lg font-bold">
                  {product.nameHebrew || product.name}
                  {!product.isActive && (
                    <span className="text-sm text-gray-500 mr-2">(מוסתר)</span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {product.descriptionHebrew || product.description}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>מחיר: ₪{product.price}</span>
                  {product.hasVariants ? (
                    <span>גרסאות: {product.variants?.length || 0}</span>
                  ) : (
                    <span>מלאי: {product.stock}</span>
                  )}
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
                {product.hasVariants && product.variants && product.variants.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {product.variants.map((variant, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        • {variant.name} - מלאי: {variant.stock}
                      </div>
                    ))}
                  </div>
                )}
                {product.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-3 py-1 text-sm bg-[#D5C4B7] text-[#2D3142] rounded hover:bg-[#B8A99C]"
                >
                  ערוך
                </button>
                {product.isActive && (
                  <button
                    onClick={() => handleHide(product.id)}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    הסתר
                  </button>
                )}
                <button
                  onClick={() => handlePermanentDelete(product.id, product.nameHebrew || product.name)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  מחק לצמיתות
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
