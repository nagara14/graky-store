# 🚨 Fix: TiDB "Missing User Name Prefix" Error

## ❌ Error Message
```
Missing user name prefix. See https://docs.pingcap.com/tidbcloud/select-cluster-tier#user-name-prefix
```

## 🔍 Root Cause

TiDB Cloud requires the username to include a **cluster prefix** in this format:
```
<ClusterID>.<username>
```

The error occurs when Vercel doesn't have the `DATABASE_URL` environment variable set, or it's in the wrong format.

---

## ✅ Solution: Set DATABASE_URL in Vercel

### Step 1: Verify Your TiDB Connection String

Your **correct** connection string should be:
```
mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true
```

Breaking it down:
- **Username**: `2gonWQBQYXkJmfK.root` (ClusterID + "." + username)
- **Password**: `e1oCFLjb7umKrfON`
- **Host**: `gateway01.ap-northeast-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Database**: `graky_web`
- **Options**: `ssl=true`

---

### Step 2: Set in Vercel Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Select your project** (graky-store)

3. **Go to**: Settings → Environment Variables

4. **Add or Update** `DATABASE_URL`:

   ```
   Name: DATABASE_URL
   Value: mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true
   Environment: ✅ Production, ✅ Preview, ✅ Development
   ```

5. **Click "Save"**

---

### Step 3: Also Set Other Required Variables

While you're in Environment Variables, make sure these are also set:

#### Auth (fixes "Bad request"):
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=vYn084kfZylVuQa7DwshpXtAxmgdLiCT
```

#### Google OAuth:
```
GOOGLE_CLIENT_ID=1031142005840-oq09mjp3ttu1t0pn07shtmqrtjbol1dp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### Midtrans (Optional):
```
MIDTRANS_SERVER_KEY=<your-key>
MIDTRANS_CLIENT_KEY=<your-key>
MIDTRANS_IS_PRODUCTION=false
```

#### App:
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

### Step 4: Redeploy

After ALL variables are set:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

---

## 🔍 Why This Happens

### TiDB Cloud Username Format

TiDB Cloud uses a **multi-tenant** architecture. To identify which cluster your connection belongs to, they require the username to include the cluster prefix:

**Format**: `<ClusterID>.<username>`

Example:
- Cluster ID: `2gonWQBQYXkJmfK`
- Username: `root`
- **Full username**: `2gonWQBQYXkJmfK.root`

### Common Mistakes

❌ **Wrong**: `root` (missing cluster prefix)
✅ **Correct**: `2gonWQBQYXkJmfK.root`

---

## 📋 Complete Environment Variables Checklist

Before redeploying, verify ALL these are set in Vercel:

- [ ] `DATABASE_URL` - TiDB connection string with cluster prefix
- [ ] `NEXTAUTH_URL` - Your Vercel domain
- [ ] `NEXTAUTH_SECRET` - Generated secret
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `MIDTRANS_SERVER_KEY` - From Midtrans Dashboard (optional)
- [ ] `MIDTRANS_CLIENT_KEY` - From Midtrans Dashboard (optional)  
- [ ] `MIDTRANS_IS_PRODUCTION` - `false` or `true` (optional)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- [ ] Google OAuth callback URL added to Google Console

---

## 🎯 Expected Build Logs

After fixing, you should see:
```
✓ Compiled successfully
✓ Checking validity of types
✓ Collecting page data
✓ Generating static pages (29/29)
✓ Finalizing page optimization
```

**No more "Missing user name prefix" error!**

---

## 🔗 Additional Resources

- [TiDB Cloud User Name Prefix](https://docs.pingcap.com/tidbcloud/select-cluster-tier#user-name-prefix)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Complete setup guide

---

## 💡 Pro Tip

If you're still getting database errors after setting `DATABASE_URL`:

1. **Verify TiDB Cloud cluster is active**:
   - Login to TiDB Cloud dashboard
   - Check cluster status

2. **Test connection locally**:
   ```bash
   npx tsx scripts/test-db-auth.ts
   ```

3. **Check Vercel Function Logs**:
   - Vercel Dashboard → Deployments → Latest → Function Logs
   - Look for specific database error messages

---

**Next**: Set the environment variables in Vercel and redeploy! 🚀
