"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  deliveryNotes?: string;
  orderedAt: string;
  paidAt?: string;
  completedAt?: string;
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "אושר", color: "bg-blue-100 text-blue-800" },
  { value: "PREPARING", label: "בהכנה", color: "bg-purple-100 text-purple-800" },
  { value: "READY", label: "מוכן לאיסוף", color: "bg-green-100 text-green-800" },
  { value: "COMPLETED", label: "הושלם", color: "bg-gray-100 text-gray-800" },
  { value: "CANCELLED", label: "בוטל", color: "bg-red-100 text-red-800" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "ממתין לתשלום", color: "bg-yellow-100 text-yellow-800" },
  { value: "PAID", label: "שולם", color: "bg-green-100 text-green-800" },
  { value: "REFUNDED", label: "הוחזר", color: "bg-red-100 text-red-800" },
];

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    const checkAdmin = async () => {
      if (status === "loading") return;

      if (!session?.user?.email) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post("/api/get-user-subsciptionId", {
          userEmail: session.user.email,
        });

        if (response.data.subscriptionId !== "Admin") {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);
        fetchOrders();
      } catch (error) {
        console.error("Error checking admin:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("שגיאה בטעינת הזמנות");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, paymentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      toast.success("הזמנה עודכנה בהצלחה");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("שגיאה בעדכון הזמנה");
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הזמנה #${orderNumber}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error("Failed to delete order");

      toast.success("הזמנה נמחקה בהצלחה");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("שגיאה במחיקת הזמנה");
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    return PAYMENT_STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const activeOrders = orders.filter(
    order => order.status !== "COMPLETED" && order.status !== "CANCELLED"
  );

  const completedOrders = orders.filter(
    order => order.status === "COMPLETED" || order.status === "CANCELLED"
  );

  const displayOrders = activeTab === "active" ? activeOrders : completedOrders;

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EB] flex items-center justify-center">
        <p className="text-[#2D3142]/60">טוען...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
            >
              ← חזרה לדשבורד
            </Link>
            <span className="text-[#2D3142]/30">|</span>
            <Link
              href="/admin/products"
              className="text-[#2D3142]/60 hover:text-[#2D3142] transition-colors"
            >
              ניהול מוצרים
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2D3142]">ניהול הזמנות</h1>
              <p className="text-[#2D3142]/60 mt-2">מעקב וניהול הזמנות החנות</p>
            </div>
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeTab === "active"
                    ? "bg-[#2D3142] text-white"
                    : "text-[#2D3142]/60 hover:text-[#2D3142]"
                }`}
              >
                פעילות ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeTab === "completed"
                    ? "bg-[#2D3142] text-white"
                    : "text-[#2D3142]/60 hover:text-[#2D3142]"
                }`}
              >
                הושלמו ({completedOrders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-[#2D3142]/40 text-lg">
              {activeTab === "active" ? "אין הזמנות פעילות" : "אין הזמנות מושלמות"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#D5C4B7] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2D3142]">
                      הזמנה #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-[#2D3142]/60 mt-1">
                      {new Date(order.orderedAt).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {PAYMENT_STATUS_OPTIONS.find(s => s.value === order.paymentStatus)?.label || order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Customer & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#2D3142]/10">
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D3142]/70 mb-3">פרטי לקוח</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-[#2D3142]">שם:</strong> <span className="text-[#2D3142]/70">{order.customerName}</span></p>
                      <p><strong className="text-[#2D3142]">אימייל:</strong> <span className="text-[#2D3142]/70">{order.customerEmail}</span></p>
                      <p><strong className="text-[#2D3142]">טלפון:</strong> <span className="text-[#2D3142]/70">{order.customerPhone}</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D3142]/70 mb-3">פרטי משלוח ותשלום</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong className="text-[#2D3142]">משלוח:</strong>{" "}
                        <span className="text-[#2D3142]/70">{order.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</span>
                      </p>
                      <p>
                        <strong className="text-[#2D3142]">תשלום:</strong>{" "}
                        <span className="text-[#2D3142]/70">{order.paymentMethod === 'cash' ? 'מזומן' : 'PayPal'}</span>
                      </p>
                      {order.deliveryNotes && (
                        <p className="mt-2 p-3 bg-[#F7F3EB] rounded-lg">
                          <strong className="text-[#2D3142]">הערות:</strong>{" "}
                          <span className="text-[#2D3142]/70">{order.deliveryNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#2D3142]/70 mb-4">מוצרים בהזמנה</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-[#F7F3EB] rounded-lg">
                        <div className="flex items-center gap-4">
                          {item.productImage && (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-[#2D3142]">{item.productName}</p>
                            <p className="text-sm text-[#2D3142]/60">
                              כמות: {item.quantity} × ₪{item.pricePerUnit}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-[#2D3142]">₪{item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions & Total */}
                <div className="flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-[#2D3142]/10">
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value, order.paymentStatus)}
                      className="px-4 py-2 text-sm border border-[#2D3142]/20 rounded-lg focus:outline-none focus:border-[#2D3142]/40"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updateOrderStatus(order.id, order.status, e.target.value)}
                      className="px-4 py-2 text-sm border border-[#2D3142]/20 rounded-lg focus:outline-none focus:border-[#2D3142]/40"
                    >
                      {PAYMENT_STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteOrder(order.id, order.orderNumber)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      מחק הזמנה
                    </button>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-sm text-[#2D3142]/60 mb-1">סה&quot;כ</p>
                    <p className="text-3xl font-bold text-[#2D3142]">₪{order.totalAmount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
