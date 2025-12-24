# Quick Start Guide - AI Prompt for New Project

## 🚀 Use This Prompt to Start a New Project

Copy and paste this comprehensive prompt to an AI assistant when starting your next video streaming platform:

---

## THE PROMPT:

```
I need you to build a complete video streaming platform for [CLIENT NAME/BUSINESS TYPE] based on the architecture in the attached blueprint files.

PROJECT REQUIREMENTS:
- Next.js 13.4+ with App Router, TypeScript, Tailwind CSS
- MongoDB database with Prisma ORM
- NextAuth.js authentication (Google OAuth + email/password)
- PayPal subscription payment integration
- Vimeo video hosting and playback
- Progress tracking and resume functionality
- Admin dashboard for user and content management
- Email notification system
- Hebrew/RTL support (or specify your language)
- Responsive mobile-first design
- WCAG 2.0 AA accessibility compliance

BUSINESS SPECIFICS:
- Brand name: [YOUR BRAND]
- Primary language: [Hebrew/English/Other]
- Content type: [Fitness/Wellness/Education/etc]
- Subscription price: [Monthly amount]
- Admin email: [admin@email.com]

KEY FEATURES TO IMPLEMENT:
1. ✅ User authentication with Google OAuth and credentials
2. ✅ PayPal subscription management (subscribe, cancel, restore)
3. ✅ Vimeo video integration with folders and metadata
4. ✅ Video player with progress tracking and resume
5. ✅ Manual completion toggle on progress badges
6. ✅ User types: Admin, Paid Subscriber, Trial, Free, None
7. ✅ Admin dashboard with:
   - User management table (search, edit subscriptions)
   - Folder metadata manager (description, level, category, image, visibility)
   - Category/subcategory manager (dynamic, no hardcoding)
   - Message composer (send announcements to users)
   - Monthly summary email trigger
8. ✅ Email system:
   - Welcome email after registration
   - Subscription confirmation after payment
   - Password reset emails
   - Admin notifications for new subscribers
   - Monthly summary report to admin
9. ✅ User features:
   - Dashboard with analytics cards
   - Browse videos by category/folder
   - Watch history page
   - Custom playlists
   - Message notifications (bell icon with unread count)
10. ✅ Legal pages: Privacy Policy, Terms of Service, Accessibility Statement
11. ✅ SEO optimization with sitemap, structured data, proper meta tags
12. ✅ Performance optimizations (pagination, caching, lazy loading)
13. ✅ Security best practices (bcrypt, JWT, session validation)

DESIGN SYSTEM:
Use Wabi-Sabi aesthetic (or specify your design style):
- Earthy color palette: #D5C4B7 (clay), #F7F3EB (background), #2D3142 (text)
- Rounded corners, soft shadows, subtle animations
- RTL layout for Hebrew (or LTR for English)
- Paper-like textures, gentle transitions
- Mobile-responsive with touch-friendly targets

DATABASE MODELS:
Follow the Prisma schema in the blueprint:
- User (with PayPal cache fields)
- WatchedVideo (progress tracking)
- Folder (custom playlists)
- Message + MessageRead (admin messaging)
- Category + Subcategory (dynamic content organization)
- PasswordReset (token-based)
- Account (OAuth)

API ENDPOINTS TO CREATE:
- Auth: NextAuth [...nextauth] route
- Payment: /api/add-subscriptionId, /api/cancel-subscription
- Videos: /api/videos, /api/vimeo-proxy
- Progress: /api/save-progress, /api/mark-completed
- Admin: 
  - /api/admin/get-all-users
  - /api/admin/update-subscription
  - /api/admin/sync-paypal
  - /api/admin/folder-metadata
  - /api/admin/categories
  - /api/admin/subcategories
  - /api/admin/send-message
  - /api/admin/monthly-summary
- User: /api/user/messages

PAGES TO BUILD:
Public: /, /login, /register, /reset-password, /accessibility, /privacy, /terms
Protected: /dashboard, /explore, /styles, /styles/[name], /user/folders, /watched-videos
Admin: Admin sections within /dashboard

ENVIRONMENT VARIABLES NEEDED:
- DATABASE_URL (MongoDB)
- NEXTAUTH_SECRET, NEXTAUTH_URL
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- VIMEO_ACCESS_TOKEN
- PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE
- EMAIL_SERVICE_API_KEY, EMAIL_FROM
- ADMIN_EMAIL

CRITICAL IMPLEMENTATION RULES:
✅ Hash passwords with bcrypt (never plain text)
✅ Validate PayPal subscriptions server-side
✅ Use environment variables for all secrets
✅ Implement proper error handling everywhere
✅ Add loading states for all async operations
✅ Test on mobile devices
✅ Implement proper TypeScript types
✅ Follow accessibility guidelines (WCAG 2.0 AA)
✅ Add proper RTL/LTR support based on language
✅ Cache PayPal data in database (don't call API repeatedly)
✅ Paginate video lists (12-20 per page)
✅ Save progress every 30s (not real-time)

❌ NEVER store credit cards locally
❌ NEVER trust client-side data without validation
❌ NEVER expose API keys in frontend
❌ NEVER skip error handling
❌ NEVER use aggressive polling (performance killer)
❌ NEVER hardcode content that should be dynamic

DEVELOPMENT PHASES:
Phase 1 (Weeks 1-2): Auth, database, basic dashboard, video fetching, player
Phase 2 (Weeks 3-4): PayPal, access control, progress tracking, playlists
Phase 3 (Week 5): Admin dashboard, user management, content management, messaging
Phase 4 (Week 6): Emails, SEO, legal pages, accessibility, testing, deployment

TESTING CHECKLIST:
- [ ] Registration and login flows
- [ ] Google OAuth authentication
- [ ] Password reset functionality
- [ ] PayPal subscription purchase
- [ ] Subscription cancellation
- [ ] Video playback and progress tracking
- [ ] Manual completion toggle
- [ ] Admin user management
- [ ] Folder metadata management
- [ ] Category/subcategory management
- [ ] Admin messaging system
- [ ] All email templates
- [ ] Mobile responsiveness
- [ ] Different user types (free, trial, paid, admin)
- [ ] Accessibility with screen reader
- [ ] SEO (check sitemap, meta tags, structured data)

DEPLOYMENT:
- Platform: Vercel (recommended for Next.js)
- Database: MongoDB Atlas
- Payment: PayPal Live mode
- Domain: Custom domain with SSL
- Monitoring: Setup error tracking (Sentry)
- Backups: Automated daily backups

Please start by:
1. Setting up the Next.js project with TypeScript
2. Configuring Prisma with MongoDB
3. Creating all database models
4. Setting up NextAuth configuration
5. Building the authentication pages

Then proceed through each phase systematically. Ask me for clarification on:
- Specific design preferences
- Custom branding requirements  
- Additional features needed
- Integration details

Refer to the detailed blueprint (AI_PROJECT_BLUEPRINT.md) and code examples (AI_CODE_EXAMPLES.md) for complete implementation patterns.
```

---

## 📋 What to Customize for Each Client

### 1. Branding & Content
- Replace "Studio Boaz Online" with client's brand name
- Update color palette to match their brand
- Replace fitness content references with their content type
- Update logo, images, and brand assets

### 2. Language & Localization
- Change from Hebrew to client's language
- Update RTL to LTR if needed
- Translate all UI text and error messages
- Adjust date/time formats

### 3. Payment Configuration
- Update subscription pricing
- Add/remove payment methods (PayPal, Stripe, etc.)
- Configure trial period duration
- Set up payment provider credentials

### 4. Video Configuration
- Connect to client's Vimeo account
- Setup folder structure for their content
- Configure video metadata fields
- Setup video categories relevant to their business

### 5. Email Configuration
- Update admin email addresses
- Customize email templates with client branding
- Setup email service provider (SendGrid, Mailgun, etc.)
- Configure email notification preferences

### 6. Legal Requirements
- Update Privacy Policy with client's legal entity
- Customize Terms of Service for their jurisdiction
- Adjust Accessibility Statement if needed
- Add any additional legal pages required

### 7. Domain & Hosting
- Setup custom domain
- Configure DNS records
- Setup SSL certificate
- Configure production environment variables

---

## 🎯 Success Metrics to Track

After deployment, monitor these metrics:

### Business Metrics
- New user registrations per week
- Conversion rate (free to paid)
- Monthly recurring revenue (MRR)
- Churn rate
- Customer lifetime value (CLV)

### Technical Metrics
- Page load time (target: <3 seconds)
- Video player initialization time (target: <2 seconds)
- API response times
- Error rates
- Uptime percentage (target: 99.9%)

### User Engagement
- Average session duration
- Videos watched per user
- Completion rates
- Return visitor rate
- Custom playlist creation rate

---

## 🔧 Post-Launch Maintenance

### Weekly
- Review error logs
- Check payment reconciliation
- Monitor user feedback

### Monthly
- Run PayPal sync for all users
- Send monthly summary email
- Review analytics and metrics
- Check for security updates

### Quarterly
- Security audit
- Performance optimization review
- User experience improvements
- Feature prioritization

### Annually
- Dependency updates (Next.js, React, etc.)
- Legal page updates
- Comprehensive security audit
- Platform scalability review

---

## 💡 Enhancement Ideas for Future Versions

### Immediate (Months 1-3)
- User profile customization
- Video favorites/bookmarks
- Search functionality
- Video ratings and reviews

### Short-term (Months 3-6)
- Mobile apps (iOS/Android)
- Offline video downloads
- Live streaming capabilities
- Community forum

### Mid-term (Months 6-12)
- AI-powered recommendations
- Multiple subscription tiers
- Gift subscriptions
- Referral program
- Analytics dashboard for users
- Social sharing features

### Long-term (Year 2+)
- White-label solution for other businesses
- Instructor/creator portal
- Advanced analytics and reporting
- Integration with fitness trackers
- API for third-party integrations
- International expansion (multi-currency)

---

## 📞 Support Resources

### For Developers
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- NextAuth.js Documentation: https://next-auth.js.org
- PayPal API Reference: https://developer.paypal.com/docs/api
- Vimeo API Reference: https://developer.vimeo.com/api

### For Admins
- Create comprehensive admin documentation
- Record video tutorials for common tasks
- Setup support ticket system
- Create FAQ page for common issues

### For Users
- Create user onboarding flow
- Record tutorial videos
- Setup chat support (optional)
- Create help center

---

## ✅ Final Deployment Checklist

Before going live, verify:

- [ ] All environment variables configured in production
- [ ] Database backups enabled
- [ ] PayPal switched to live mode and tested
- [ ] All email templates working
- [ ] Custom domain configured with SSL
- [ ] SEO: Sitemap submitted to Google Search Console
- [ ] SEO: Google Analytics configured (optional)
- [ ] All legal pages published
- [ ] Accessibility tested with screen reader
- [ ] Mobile responsiveness verified on real devices
- [ ] All user types tested (free, trial, paid, admin)
- [ ] Payment flow tested end-to-end
- [ ] Video playback tested on multiple devices/browsers
- [ ] Admin dashboard fully functional
- [ ] Error tracking (Sentry) configured
- [ ] Performance metrics baseline established
- [ ] Admin documentation complete
- [ ] User documentation complete
- [ ] Support channels established
- [ ] Social media accounts ready
- [ ] Launch announcement prepared

---

## 🎉 You're Ready to Launch!

With this blueprint, code examples, and quick start guide, you have everything needed to build a production-ready video streaming platform for your next client.

**Remember:** Focus on core functionality first, then iterate based on user feedback!

Good luck with your project! 🚀
