# Complete Video Streaming Platform - AI Development Blueprint

## 🎯 Project Overview
Build a Next.js video streaming platform with subscription management, Vimeo integration, user authentication, progress tracking, and admin dashboard. Target: Fitness/wellness content delivery with Hebrew/RTL support.

---

## 🛠 Tech Stack

**Frontend:** Next.js 13.4+ (App Router), TypeScript, Tailwind CSS, Framer Motion (minimal)  
**Backend:** Next.js API Routes, Prisma ORM, MongoDB  
**Auth:** NextAuth.js (Google OAuth + credentials)  
**Payment:** PayPal subscriptions  
**Video:** Vimeo API + @vimeo/player SDK  
**Email:** Transactional email service (SendGrid/Mailgun/Resend)

---

## 📊 Database Models (Prisma)

```prisma
model User {
  id                String         @id @default(auto()) @map("_id") @db.ObjectId
  name              String?
  email             String         @unique
  hashedPassword    String?
  subscriptionId    String?        // PayPal ID, "Admin", "Trial", "Free", or null
  paypalStatus      String?        // ACTIVE, CANCELLED, EXPIRED
  paypalId          String?
  paypalCancellationDate DateTime?
  paypalLastSyncAt  DateTime?
  createdAt         DateTime       @default(now())
  watchedVideos     WatchedVideo[]
  folders           Folder[]
  messageReads      MessageRead[]
}

model WatchedVideo {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  videoId     String
  progress    Float    @default(0)
  completed   Boolean  @default(false)
  lastWatched DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, videoId])
}

model Folder {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  userId      String   @db.ObjectId
  videoIds    String[]
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Message {
  id        String        @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  content   String
  link      String?
  isActive  Boolean       @default(true)
  createdAt DateTime      @default(now())
  reads     MessageRead[]
}

model MessageRead {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  messageId String   @db.ObjectId
  readAt    DateTime @default(now())
  @@unique([userId, messageId])
}

model Category {
  id            String        @id @default(auto()) @map("_id") @db.ObjectId
  name          String        @unique
  hebrewName    String
  order         Int
  isActive      Boolean       @default(true)
  subcategories Subcategory[]
}

model Subcategory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  hebrewName  String
  categoryId  String   @db.ObjectId
  order       Int
  isActive    Boolean  @default(true)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
}

model PasswordReset {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  email   String
  token   String   @unique
  expires DateTime
}
```

---

## 🔐 Authentication System

### Setup
- **NextAuth.js** with JWT sessions
- **Providers:** Google OAuth + Email/Password
- **Password:** bcrypt hashing (10 rounds)
- **Protected Routes:** Middleware checks session

### Pages
- `/register` - Name, email, password, confirmation
- `/login` - Email/password or Google OAuth
- `/reset-password` - Token-based password reset

### Session Protection
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 👥 User Types & Access

| Type | subscriptionId | Access |
|------|---------------|--------|
| **Admin** | "Admin" | Full platform + admin dashboard |
| **Paid Subscriber** | "I-XXXXXXX" (PayPal ID) | Full content access |
| **Trial User** | "Trial" | 30-day limited access |
| **Free User** | "Free" | Limited content |
| **No Subscription** | null | Landing page only |

```typescript
export const getUserType = (subscriptionId: string | null): UserType => {
  if (!subscriptionId) return 'free';
  if (subscriptionId === 'Admin') return 'admin';
  if (subscriptionId === 'Trial') return 'trial';
  if (subscriptionId === 'Free') return 'free';
  if (subscriptionId.startsWith('I-')) return 'subscription';
  return 'free';
};
```

---

## 💳 Payment System (PayPal)

### API Endpoints
```typescript
// POST /api/add-subscriptionId
// - Validates PayPal subscription
// - Updates user.subscriptionId
// - Sends confirmation email to user
// - Sends notification to admin

// POST /api/cancel-subscription
// - Calls PayPal cancel API
// - Updates user status
// - Maintains access until billing cycle ends

// POST /api/admin/sync-paypal
// - Batch syncs all users' PayPal status
// - Caches data to prevent excessive API calls
// - Updates paypalStatus, paypalCancellationDate fields
```

### Configuration
```typescript
const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const auth = Buffer.from(
  `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
).toString('base64');
```

---

## 🎥 Video System (Vimeo)

### Folder Metadata Config
```typescript
// /src/config/folder-metadata.ts
interface FolderMetadata {
  description: string;
  level: 'beginners' | 'intermediate' | 'advanced' | 'all';
  hebrewLevel: string;
  category: string;
  subcategory?: string;
  order: number;
  isNew: boolean;
  isVisible: boolean;
  image?: string;
}

// New folders auto-get default metadata
// Admin manages via dashboard
```

### Video Fetching
```typescript
// GET /api/videos?folderId=XXX&page=1
// - Authenticates with Vimeo token
// - Fetches folder contents with pagination (20 per page)
// - Returns: videoId, title, description, duration, thumbnail, uri

// POST /api/vimeo-proxy
// - Batch fetches multiple videos
// - Returns standardized video data
```

### Video Player Component
- **Vimeo Player SDK** embedded
- **Progress tracking:** Save every 30s
- **Resume playback** from last position
- **Manual completion toggle** (click progress badge)
- **Keyboard navigation** (Escape to close)
- **Responsive modal** overlay

### Progress API
```typescript
// POST /api/save-progress
// Body: { videoId, progress, completed }

// POST /api/mark-completed
// Body: { videoId, completed: boolean }
// Toggles completion without overwriting progress
```

---

## 🎨 UI Design System (Wabi-Sabi)

### Colors
```css
--clay-dark: #B8A99C;
--clay-light: #D5C4B7;
--background: #F7F3EB;
--text-dark: #2D3142;
```

### Principles
- Earthy tones, rounded corners
- Subtle animations (performance-first)
- RTL support for Hebrew
- Paper-like textures
- Gentle transitions

### Key Components
- **Navbar:** Dynamic menu based on user type
- **VideoCard:** Thumbnail, progress badge, duration, manual completion toggle
- **DashboardCard:** Icon, title, action button
- **Modal:** Video player, message notifications (proper z-index layering)

---

## 📄 Page Structure

### Public Pages
- `/` - Landing (home)
- `/login`, `/register`, `/reset-password`
- `/accessibility`, `/privacy`, `/terms`

### Protected Pages
- `/dashboard` - User dashboard + admin section
- `/explore` - All videos
- `/styles` - Browse by category/folder
- `/styles/[name]` - Folder videos
- `/user/folders` - Custom playlists
- `/watched-videos` - Watch history

---

## 🛡️ Admin Dashboard

### User Management (`AdminUserTable.tsx`)
- View all users with search/filter
- Edit subscription status dropdown
- View PayPal data (status, ID, cancellation date)
- Warning indicators for mismatches
- Restore PayPal subscriptions
- Color-coded status (ACTIVE=green, CANCELLED=red)

### Content Management

**Folder Metadata Manager** (`AdminFolderMetadataManager.tsx`)
- Edit description, level, category, order
- Set background images
- Toggle visibility (`isVisible`)
- "חדש" badge for new folders
- No code changes needed for new Vimeo folders

**Category Manager** (`CategoryManager.tsx`)
- CRUD categories and subcategories
- Reorder, soft delete (isActive)
- Hebrew + English names
- Dynamic updates across platform

### Communication

**Message Composer** (`AdminMessageComposer.tsx`)
- Send messages to all users
- Title, content, optional link
- Send history

**User Notifications** (`UserMessageNotification.tsx`)
- Bell icon with unread count
- Modal with messages
- Mark as read individually/bulk

### Analytics

**Monthly Summary Email** (`/api/admin/monthly-summary`)
- Active subscriber count
- New subscribers this month
- Revenue calculation
- Complete subscriber table
- Sent to admin emails
- Manual trigger + configurable automation

**Admin Notification Emails**
- New subscription alerts
- User registration notices

---

## 📧 Email System

### Required Templates (HTML + Hebrew)
1. **Welcome Email** - After registration
2. **Subscription Confirmation** - After payment
3. **Password Reset** - Token link
4. **Admin New Subscription** - Alert to admin
5. **Monthly Summary** - Detailed report

### Implementation
```typescript
export async function sendEmail({ to, subject, html, text }: EmailParams) {
  // Use SendGrid/Mailgun/Resend API
  // Professional Hebrew templates
  // Mobile-responsive
}
```

---

## 🔒 Security Checklist

✅ **Auth:** bcrypt password hashing, JWT sessions, OAuth  
✅ **API:** Session validation on protected endpoints  
✅ **Admin:** subscriptionId === "Admin" check  
✅ **Payment:** PayPal handles all card processing (PCI DSS)  
✅ **Data:** HTTPS encryption, environment variables  

⚠️ **Recommendations:**
- Add rate limiting on auth/payment endpoints
- Implement CSRF protection
- Add request validation middleware
- Consider 2FA for admin accounts

---

## 🌍 Environment Variables

```env
DATABASE_URL="mongodb://..."
NEXTAUTH_SECRET="random-secret"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
VIMEO_ACCESS_TOKEN="..."
PAYPAL_CLIENT_ID="..."
PAYPAL_SECRET="..."
PAYPAL_MODE="sandbox"  # or "live"
EMAIL_SERVICE_API_KEY="..."
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
```

---

## ♿ Accessibility (WCAG 2.0 AA)

### Required Features
- ✅ **Keyboard navigation** for all interactive elements
- ✅ **Screen reader support** (semantic HTML, ARIA labels)
- ✅ **Color contrast** ≥ 4.5:1
- ✅ **Focus indicators** visible
- ✅ **Skip links** for navigation
- ✅ **Form labels** and error messages
- ✅ **Video player keyboard controls** (Escape to close)
- ✅ **Responsive to prefers-reduced-motion**

### Required Page (`/accessibility`)
- WCAG 2.0 AA compliance statement
- List of features
- Contact for issues
- Hebrew language (if Israeli market)

---

## 📜 Legal Pages (Israeli Market)

### Privacy Policy (`/privacy`)
- Data collection practices
- Payment data handling (PCI DSS, no local storage)
- User rights (GDPR-style: access, deletion, portability)
- Data retention (7 years post-closure)
- Contact information
- Hebrew language

### Terms of Service (`/terms`)
- Service description
- Medical disclaimers (fitness content)
- Liability waivers
- Subscription terms (no refunds for paid periods)
- Cancellation policy
- Israeli law jurisdiction
- Hebrew language

---

## 🔍 SEO Optimization

### Home Page
```typescript
export const metadata = {
  title: "Brand Name - Hebrew Name | Platform",
  description: "Keywords in Hebrew and English...",
  keywords: ["keyword1", "keyword2", "Hebrew keywords"],
  openGraph: {
    title: "Brand Name",
    description: "...",
    type: "website",
    locale: "he_IL",
    siteName: "Brand Name"
  },
  robots: "index, follow"
};
```

### Additional SEO
- ✅ Create `/public/sitemap.xml` (home at priority 1.0)
- ✅ Add `/public/robots.txt` (block auth pages)
- ✅ Add structured data (Schema.org: Organization, WebSite, Video)
- ✅ Meta robots "noindex" on `/login`, `/register`, `/dashboard`
- ✅ Submit sitemap to Google Search Console

---

## 🚀 Development Phases

### Phase 1: Core (Weeks 1-2)
- Auth system (login, register, password reset)
- Database setup + Prisma models
- Basic dashboard
- Vimeo video fetching
- Video player with playback

### Phase 2: Payment (Weeks 3-4)
- PayPal integration (subscribe, cancel)
- User type system + access control
- Progress tracking
- Custom playlists

### Phase 3: Admin (Week 5)
- Admin dashboard
- User management table
- Folder metadata manager
- Category manager
- Message system

### Phase 4: Polish (Week 6)
- Email templates
- SEO optimization
- Legal pages
- Accessibility compliance
- Performance optimization
- Security audit
- Testing

---

## ⚡ Performance Guidelines

### DO:
✅ Paginate video lists (12-20 per page)  
✅ Lazy load thumbnails  
✅ Cache PayPal data in database  
✅ Use Next.js Image optimization  
✅ Throttle progress saves (every 30s)  
✅ Use CSS transitions over JavaScript animations  
✅ Implement loading states  

### DON'T:
❌ Aggressive polling (kills performance)  
❌ RequestAnimationFrame loops  
❌ Excessive Framer Motion animations  
❌ Load all videos at once  
❌ Real-time progress updates  

---

## ✅ Critical Implementation Rules

### MUST DO:
✅ Hash passwords with bcrypt (never plain text)  
✅ Validate PayPal subscriptions server-side  
✅ Use environment variables for secrets  
✅ Implement proper error handling (try/catch)  
✅ Test on mobile devices  
✅ RTL support for Hebrew  
✅ Proper loading states everywhere  
✅ TypeScript for type safety  

### NEVER DO:
❌ Store credit cards locally  
❌ Trust client-side data without validation  
❌ Expose API keys in frontend  
❌ Skip accessibility features  
❌ Hardcode content that should be dynamic  
❌ Forget edge case handling (null/undefined)  

---

## 📦 Deployment Checklist

- [ ] Setup production MongoDB database
- [ ] Configure all environment variables
- [ ] Switch PayPal to live mode
- [ ] Test payment flow end-to-end
- [ ] Test video playback on multiple devices
- [ ] Setup custom domain + SSL
- [ ] Submit sitemap to Google Search Console
- [ ] Setup error tracking (Sentry)
- [ ] Configure automated backups
- [ ] Create admin documentation
- [ ] Test accessibility with screen reader

---

## 📞 Support Documentation

### For Admins
- Adding video folders in Vimeo
- Managing folder metadata
- Sending user messages
- Handling subscription issues
- Syncing PayPal data
- Viewing monthly reports

### For Users
- Creating account
- Subscribing/canceling
- Tracking progress
- Creating playlists
- Resetting password
- Contacting support

---

**Recommended Platform:** Vercel (native Next.js support, auto-deployments, CDN)
