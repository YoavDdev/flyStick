# 🚀 הוראות Deploy לתיקון מיילי שיעורים חיים

## מה תוקן:
1. ✅ הוספת לוג מפורט לכל מייל של רישום לשיעור חי
2. ✅ שמירת Resend ID בדאטאבייס
3. ✅ תיעוד שגיאות מפורט
4. ✅ מערכת ניטור מיילים בדשבורד האדמין

## קבצים ששונו:
- `/src/app/api/live/register/route.ts` - הוספת לוג למיילים
- `/src/app/api/live-events/send-registration-email/route.ts` - הוספת לוג ו-Resend ID
- `/prisma/schema.prisma` - הוספת מודל EmailLog
- `/src/app/libs/emailLogger.ts` - פונקציות עזר ללוג
- `/src/app/components/EmailLogsViewer.tsx` - צפייה בלוגים
- `/src/app/(site)/dashboard/page.tsx` - הוספת קומפוננטות ניטור

## צעדים ל-Deploy:

### 1. Commit השינויים:
```bash
git add .
git commit -m "Fix: Add email logging for live event registrations"
git push origin main
```

### 2. אחרי ה-Deploy, בדוק:
1. היכנס לדשבורד האדמין ב-production
2. גלול ל**"לוג מיילים"** 📊
3. סנן לפי `live_event_registration`
4. תראה את כל המיילים שנשלחו/נכשלו

### 3. בדיקה:
1. הירשם לשיעור חי עם `yoavdrasteam@gmail.com`
2. בדוק בלוג המיילים מה קרה
3. אם נכשל - תראה את השגיאה המדויקת

## איך לבדוק למה המייל נכשל:

### אם תראה בלוג:
- **Status: sent** ✅ - המייל נשלח, בדוק ספאם
- **Status: failed** ❌ - יש שגיאה, קרא את errorMessage

### שגיאות נפוצות:
1. **"Invalid API key"** - בעיה ב-RESEND_API_KEY
2. **"Domain not verified"** - צריך לאמת את mail.studioboazonline.com ב-Resend
3. **"Rate limit exceeded"** - יותר מדי מיילים בזמן קצר
4. **"Recipient rejected"** - כתובת מייל לא תקינה

## בדיקת Resend Domain:
1. לך ל-https://resend.com/domains
2. בדוק ש-`mail.studioboazonline.com` מאומת
3. וודא שיש ✅ ירוק ליד SPF, DKIM, DMARC

---

**אחרי ה-Deploy, נרשם לשיעור ותגיד לי מה אתה רואה בלוג!** 🎯
