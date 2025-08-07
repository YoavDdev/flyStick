import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/app/libs/adminAuth";
import prisma from "@/app/libs/prismadb";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [PAYPAL_DEBUG] Starting diagnostic check");
    
    // Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: "אין הרשאות מתאימות" },
        { status: 401 }
      );
    }

    // Check environment variables
    const hasClientId = !!process.env.PAYPAL_CLIENT_ID;
    const hasClientSecret = !!process.env.PAYPAL_CLIENT_SECRET;
    const clientIdLength = process.env.PAYPAL_CLIENT_ID?.length || 0;
    
    // Check database connection
    let dbConnectionOk = false;
    let paypalUserCount = 0;
    
    try {
      paypalUserCount = await prisma.user.count({
        where: {
          subscriptionId: { startsWith: "I-" }
        }
      });
      dbConnectionOk = true;
    } catch (dbError) {
      console.error("❌ [PAYPAL_DEBUG] Database error:", dbError);
    }

    // Test PayPal API connection (if credentials exist)
    let paypalApiTest = null;
    if (hasClientId && hasClientSecret) {
      try {
        // Create basic auth header
        const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        
        const testResponse = await fetch("https://api.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-Language": "en_US",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${credentials}`
          },
          body: "grant_type=client_credentials"
        });
        
        paypalApiTest = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText
        };
      } catch (apiError) {
        paypalApiTest = {
          error: apiError instanceof Error ? apiError.message : "Unknown API error"
        };
      }
    }

    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasPayPalClientId: hasClientId,
        hasPayPalClientSecret: hasClientSecret,
        clientIdLength,
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        connectionOk: dbConnectionOk,
        paypalUserCount
      },
      paypalApi: paypalApiTest,
      adminAccess: {
        isAuthenticated: authResult.isAuthenticated,
        isAdmin: authResult.isAdmin
      }
    };

    console.log("🔍 [PAYPAL_DEBUG] Diagnostic complete:", diagnosticInfo);

    return NextResponse.json(diagnosticInfo);
    
  } catch (error) {
    console.error("❌ [PAYPAL_DEBUG] Diagnostic failed:", error);
    return NextResponse.json(
      { 
        error: "שגיאה בבדיקת האבחון",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
