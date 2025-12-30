"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryMethod: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  deliveryNotes?: string;
  orderedAt: string;
  paidAt?: string;
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

export default function AdminOrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const url = filterStatus === "all" 
        ? "/api/admin/orders" 
        : `/api/admin/orders?status=${filterStatus}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("שגיאה בטעינת הזמנות");
    } finally {
      setLoading(false);
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
      
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("שגיאה בעדכון הזמנה");
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    return PAYMENT_STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">טוען הזמנות...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ניהול הזמנות</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">כל ההזמנות</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">אין הזמנות להצגה</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#D5C4B7] rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#2D3142]">
                    הזמנה #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {PAYMENT_STATUS_OPTIONS.find(s => s.value === order.paymentStatus)?.label || order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">פרטי לקוח</h4>
                  <p className="text-sm"><strong>שם:</strong> {order.customerName}</p>
                  <p className="text-sm"><strong>אימייל:</strong> {order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm"><strong>טלפון:</strong> {order.customerPhone}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">פרטי משלוח ותשלום</h4>
                  <p className="text-sm">
                    <strong>משלוח:</strong> {order.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}
                  </p>
                  <p className="text-sm">
                    <strong>תשלום:</strong> {order.paymentMethod === 'cash' ? 'מזומן' : 'PayPal'}
                  </p>
                  {order.deliveryNotes && (
                    <p className="text-sm text-gray-600 mt-1"><strong>הערות:</strong> {order.deliveryNotes}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">מוצרים</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {item.productName}
                            {item.variantName && <span className="text-sm text-gray-500 mr-2">({item.variantName})</span>}
                          </p>
                          <p className="text-gray-500">כמות: {item.quantity} × ₪{item.pricePerUnit}</p>
                        </div>
                      </div>
                      <p className="font-semibold">₪{item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => updateOrderStatus(order.id, order.status, e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    {PAYMENT_STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="text-left">
                  <p className="text-sm text-gray-600">סה&quot;כ</p>
                  <p className="text-2xl font-bold text-[#2D3142]">₪{order.totalAmount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
