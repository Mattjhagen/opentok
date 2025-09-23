# OpenTok PWA Deployment Guide

## 🚀 Deploying to Render

Render is an excellent platform for hosting OpenTok as a PWA. Here's how to deploy it:

### 1. **Prepare Your Repository**

Make sure your repository is pushed to GitHub with all the PWA changes.

### 2. **Set Up Supabase Database**

1. Go to [Supabase](https://supabase.com) and create a new project
2. Run the database migrations:
   ```sql
   -- Copy and run the migration from:
   -- supabase/migrations/20250101000000-add-chat-system.sql
   ```
3. Get your project URL and anon key from Settings > API

### 3. **Deploy to Render**

#### Option A: Using Render Dashboard (Recommended)

1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   ```
   Build Command: npm ci && npm run build:pwa
   Publish Directory: dist
   ```

3. **Environment Variables:**
   Add these in the Render dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
   NODE_ENV=production
   ```

4. **Custom Headers (Important for PWA):**
   Add these headers in Render:
   ```
   /sw.js: Cache-Control: no-cache
   /manifest.json: Cache-Control: no-cache
   /icons/*: Cache-Control: public, max-age=31536000
   /*: Service-Worker-Allowed: /
   ```

#### Option B: Using render.yaml

The `render.yaml` file is already configured. Just push it to your repository and Render will automatically detect it.

### 4. **Generate VAPID Keys for Push Notifications**

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Add the public key to your environment variables.

### 5. **Configure Custom Domain (Optional)**

1. In Render dashboard, go to your service
2. Click "Custom Domains"
3. Add your domain and configure DNS

### 6. **SSL and HTTPS**

Render automatically provides SSL certificates. This is required for PWA features like:
- Service Workers
- Push Notifications
- Native Sharing APIs

## 🔧 **Render Configuration Details**

### Build Process
```bash
# Render will automatically run:
npm ci                    # Install dependencies
npm run build:pwa        # Build with PWA optimizations
```

### Static Site Configuration
- **Framework**: Static Site
- **Build Command**: `npm ci && npm run build:pwa`
- **Publish Directory**: `dist`
- **Node Version**: 18+ (automatically detected)

### Environment Variables Required
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
NODE_ENV=production
```

### Headers Configuration
These headers are crucial for PWA functionality:

```yaml
# Service Worker
/sw.js:
  Cache-Control: no-cache

# Manifest
/manifest.json:
  Cache-Control: no-cache

# Icons (cache for 1 year)
/icons/*:
  Cache-Control: public, max-age=31536000

# Allow service worker on all routes
/*:
  Service-Worker-Allowed: /
```

## 🧪 **Testing Your Deployment**

### 1. **PWA Testing**
- Visit your deployed URL
- Check if install prompt appears
- Test offline functionality
- Verify service worker is registered

### 2. **Feature Testing**
- Test chat system
- Try sharing features
- Check notifications
- Verify real-time updates

### 3. **Performance Testing**
- Run Lighthouse audit
- Check Core Web Vitals
- Test on mobile devices

## 🚨 **Common Issues and Solutions**

### Issue: Service Worker Not Working
**Solution**: Ensure HTTPS is enabled and headers are configured correctly.

### Issue: Push Notifications Not Working
**Solution**: 
1. Verify VAPID keys are set correctly
2. Check browser console for errors
3. Ensure HTTPS is enabled

### Issue: Build Fails
**Solution**:
1. Check Node.js version (18+ required)
2. Verify all dependencies are in package.json
3. Check build logs in Render dashboard

### Issue: Database Connection Fails
**Solution**:
1. Verify Supabase URL and keys
2. Check RLS policies
3. Ensure migrations are applied

## 📊 **Monitoring and Analytics**

### Render Metrics
- Monitor build times
- Check deployment logs
- Monitor uptime and performance

### Application Monitoring
Consider adding:
- Sentry for error tracking
- Google Analytics for usage
- Web Vitals monitoring

## 🔄 **Continuous Deployment**

Render automatically deploys when you push to your main branch. For manual deployments:

1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select branch and deploy

## 💰 **Pricing**

Render offers:
- **Free Tier**: Perfect for development and small projects
- **Starter Plan**: $7/month for production use
- **Professional Plan**: $25/month for advanced features

## 🎯 **Production Checklist**

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] VAPID keys generated and set
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] PWA features tested
- [ ] Performance optimized
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Backup strategy in place

## 🚀 **Go Live!**

Once everything is configured:

1. Your app will be available at: `https://your-app-name.onrender.com`
2. Share the URL with users
3. Monitor performance and user feedback
4. Iterate and improve based on usage

---

Your OpenTok PWA is now ready for production deployment on Render! 🎉
