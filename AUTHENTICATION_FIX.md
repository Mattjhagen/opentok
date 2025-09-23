# 🔐 Authentication Fix Guide

## 🚨 **Issue Identified**

The login/signup is failing because the Supabase client was using **hardcoded values** instead of environment variables. This causes authentication to fail in production.

## ✅ **What I Fixed**

1. **Updated Supabase Client** (`src/integrations/supabase/client.ts`)
   - Now uses environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Falls back to hardcoded values for development
   - Added validation to ensure environment variables are set

2. **Environment Variable Support**
   - The app now properly reads from environment variables in production
   - Maintains backward compatibility for development

## 🔧 **Required Environment Variables**

You need to set these environment variables in your **Render dashboard**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
NODE_ENV=production
```

## 📋 **How to Fix Authentication**

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Set Environment Variables in Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Select your OpenTok service
3. Go to **Environment** tab
4. Add these variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
NODE_ENV=production
```

### Step 3: Redeploy

1. Click **Manual Deploy** in Render
2. Or push a new commit to trigger automatic deployment

## 🗄️ **Database Setup Requirements**

Make sure your Supabase database has these tables and policies:

### Required Tables:
- `profiles` - User profiles
- `videos` - Video content
- `likes` - Video likes
- `comments` - Video comments
- `shares` - Video shares
- `chats` - Chat conversations (PWA feature)
- `chat_messages` - Chat messages (PWA feature)
- `notifications` - User notifications (PWA feature)
- `push_subscriptions` - Push notification subscriptions (PWA feature)

### Required Policies:
- Row Level Security (RLS) enabled on all tables
- Proper policies for user access control

## 🔍 **Troubleshooting**

### If authentication still fails:

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

2. **Verify Supabase Connection**
   - Test the connection in Supabase dashboard
   - Check if your project is active and not paused

3. **Check Environment Variables**
   - Ensure variables are set correctly in Render
   - No extra spaces or quotes around values
   - URLs should start with `https://`

4. **Database Permissions**
   - Ensure RLS policies allow user registration
   - Check if `profiles` table exists and is accessible

### Common Error Messages:

- **"Invalid API key"** → Check `VITE_SUPABASE_ANON_KEY`
- **"Invalid URL"** → Check `VITE_SUPABASE_URL`
- **"Sign up failed"** → Check database permissions and RLS policies
- **"Load failed"** → Check network connectivity and CORS settings

## 🚀 **After Fixing**

Once you've set the environment variables and redeployed:

1. **Test Registration**
   - Try creating a new account
   - Check if you receive verification email

2. **Test Login**
   - Try logging in with existing credentials
   - Verify session persistence

3. **Test Features**
   - Upload videos
   - Like/comment on content
   - Use chat system
   - Test notifications

## 📞 **Need Help?**

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your Supabase project is active
3. Ensure all database migrations have been applied
4. Check Render deployment logs for build errors

The authentication should work once the environment variables are properly configured! 🎉
