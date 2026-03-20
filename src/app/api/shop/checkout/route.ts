export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { Resend } from "resend";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `KH${timestamp}${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryNotes,
      paymentMethod,
      paypalOrderId,
      paypalPayerId,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "נא למלא שם, אימייל וטלפון" },
        { status: 400 }
      );
    }

    if (!deliveryMethod || !paymentMethod) {
      return NextResponse.json(
        { error: "Delivery and payment methods required" },
        { status: 400 }
      );
    }

    let userId = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id || null;
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product ${product.name} is not available` },
          { status: 400 }
        );
      }

      // Check stock based on whether variant is selected
      let availableStock = product.stock;
      let variantInfo = null;

      if (product.hasVariants && item.variantId) {
        const variant = product.variants?.find((v: any) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found for ${product.name}` },
            { status: 404 }
          );
        }
        availableStock = variant.stock;
        variantInfo = { id: variant.id, name: variant.name };
      } else if (product.hasVariants && !item.variantId) {
        return NextResponse.json(
          { error: `Please select a variant for ${product.name}` },
          { status: 400 }
        );
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}${variantInfo ? ` (${variantInfo.name})` : ''}` },
          { status: 400 }
        );
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.nameHebrew || product.name,
        productImage: product.images[0] || null,
        variantId: variantInfo?.id || null,
        variantName: variantInfo?.name || null,
        quantity: item.quantity,
        pricePerUnit: product.price,
        subtotal: itemSubtotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const totalAmount = subtotal;

    const order = await prisma.shopOrder.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        deliveryNotes,
        paymentMethod,
        paypalOrderId,
        paypalPayerId,
        subtotal,
        totalAmount,
        status: paymentMethod === "paypal" ? "PENDING" : "PENDING",
        paymentStatus: paymentMethod === "paypal" ? "PAID" : "PENDING",
        paidAt: paymentMethod === "paypal" ? new Date() : null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Send email notification to admins
    try {
      const itemsHtml = order.items.map((item: any) => `
        <div style="background-color: #F7F3EB; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
          <p style="margin: 5px 0;"><strong>מוצר:</strong> ${item.productName}</p>
          <p style="margin: 5px 0;"><strong>כמות:</strong> ${item.quantity}</p>
          <p style="margin: 5px 0;"><strong>מחיר ליחידה:</strong> ₪${item.pricePerUnit}</p>
          <p style="margin: 5px 0;"><strong>סכום ביניים:</strong> ₪${item.subtotal}</p>
        </div>
      `).join('');

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Studio Boaz <info@mail.studioboazonline.com>',
        to: ['yoavddev@gmail.com', 'zzaaoobb@gmail.com'],
        subject: `🛒 הזמנה חדשה בחנות Kohu - #${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F3EB; direction: rtl;">
            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2D3142; margin-bottom: 20px; text-align: center;">הזמנה חדשה בחנות Kohu! 🌫️</h2>
              
              <div style="background-color: #D5C4B7; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <h3 style="color: #2D3142; margin: 0;">הזמנה #${orderNumber}</h3>
              </div>

              <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2D3142; margin-bottom: 15px; text-align: right;">פרטי לקוח:</h3>
                <p style="margin: 8px 0; text-align: right;"><strong>שם:</strong> ${customerName}</p>
                <p style="margin: 8px 0; text-align: right;"><strong>אימייל:</strong> ${customerEmail}</p>
                <p style="margin: 8px 0; text-align: right;"><strong>טלפון:</strong> ${customerPhone}</p>
              </div>

              <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2D3142; margin-bottom: 15px; text-align: right;">פרטי משלוח ותשלום:</h3>
                <p style="margin: 8px 0; text-align: right;"><strong>אופן משלוח:</strong> ${deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</p>
                <p style="margin: 8px 0; text-align: right;"><strong>אופן תשלום:</strong> ${paymentMethod === 'cash' ? 'מזומן' : 'PayPal'}</p>
                ${deliveryNotes ? `<p style="margin: 8px 0; text-align: right;"><strong>הערות:</strong> ${deliveryNotes}</p>` : ''}
              </div>

              <div style="background-color: #F7F3EB; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2D3142; margin-bottom: 15px; text-align: right;">מוצרים בהזמנה:</h3>
                ${itemsHtml}
              </div>

              <div style="background-color: #2D3142; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <p style="margin: 0; font-size: 18px;"><strong>סה"כ:</strong> ₪${totalAmount}</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://studioboazonline.com/admin/orders" style="background-color: #D5C4B7; color: #2D3142; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  נהל הזמנה
                </a>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D5C4B7;">
                <p style="color: #B8A99C; font-size: 14px;">Kohu Atmosphere - Studio Boaz</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
