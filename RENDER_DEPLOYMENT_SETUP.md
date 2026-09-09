# Render Deployment Configuration for VOYAGO Backend

## ✅ Code Changes Completed

The following files have been updated to fix CORS/403 production issues:

### 1. SecurityConfig.java
- ✅ Changed CORS config to: `http.cors(cors -> {})`
- ✅ Added OPTIONS preflight handler: `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`
- ✅ OPTIONS requests now bypass JWT authentication
- ✅ HttpMethod import already present
- ✅ Preserved JWT authentication for all other endpoints

### 2. CorsConfig.java
- ✅ Configured CorsConfigurationSource bean
- ✅ Supports dynamic origins from environment variable
- ✅ Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- ✅ Allowed headers: Authorization, Content-Type, Accept, X-Requested-With
- ✅ Exposed headers: Authorization (for JWT responses)
- ✅ Allow credentials: true (required for JWT)
- ✅ MaxAge: 3600 seconds (1 hour preflight cache)
- ✅ Registered for all paths: `/**`

### 3. application.properties
- ✅ Already configured: `app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}`
- ✅ Supports environment variable with fallback to localhost

---

## 🔧 REQUIRED: Render Environment Variables

### Go to your Render backend service dashboard and set these environment variables:

#### 1. CORS_ALLOWED_ORIGINS (CRITICAL)
```
https://voyago-nine-psi.vercel.app
```
**IMPORTANT:** 
- ⚠️ NO trailing slash
- ⚠️ Must be HTTPS (not HTTP)
- ⚠️ Must match your exact Vercel domain

#### 2. Other Required Variables (if not already set)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voyago?retryWrites=true&w=majority
MONGODB_DATABASE=voyago
JWT_SECRET=your-secure-jwt-secret-key-min-256-bits
PORT=8080
```

---

## 📋 Deployment Checklist

### Before Deploying:

1. ✅ SecurityConfig.java updated (OPTIONS permitted, CORS enabled)
2. ✅ CorsConfig.java updated (production origin support)
3. ✅ application.properties configured (env variable support)
4. ⚠️ **Set CORS_ALLOWED_ORIGINS on Render** → `https://voyago-nine-psi.vercel.app`
5. ⚠️ **Verify MongoDB Atlas allows Render IP addresses**
6. ⚠️ **Commit and push changes to GitHub**
7. ⚠️ **Render will auto-deploy from GitHub**

### After Deployment:

Test the complete flow from your Vercel frontend:

#### Test 1: OPTIONS Preflight
```
Request: OPTIONS https://voyago-backend-xt64.onrender.com/api/auth/login
Expected: 200 or 204
Headers should include:
  Access-Control-Allow-Origin: https://voyago-nine-psi.vercel.app
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With
  Access-Control-Allow-Credentials: true
```

#### Test 2: Login
```
Request: POST https://voyago-backend-xt64.onrender.com/api/auth/login
Body: {"email": "admin@voyago.com", "password": "admin123"}
Expected: 200 with JWT token
```

#### Test 3: Public GET Endpoints
```
Request: GET https://voyago-backend-xt64.onrender.com/api/hotels
Expected: 200 with hotel data (no auth required)

Request: GET https://voyago-backend-xt64.onrender.com/api/vehicles
Expected: 200 with vehicle data (no auth required)

Request: GET https://voyago-backend-xt64.onrender.com/api/transport
Expected: 200 with transport data (no auth required)

Request: GET https://voyago-backend-xt64.onrender.com/api/destinations
Expected: 200 with destination data (no auth required)
```

#### Test 4: Authenticated Endpoints
```
Request: GET https://voyago-backend-xt64.onrender.com/api/bookings/user
Headers: Authorization: Bearer <your-jwt-token>
Expected: 200 with user bookings
```

---

## 🔍 How the CORS Fix Works

### Request Flow:

```
1. Browser (Vercel) → OPTIONS /api/auth/login
   ↓
2. Spring Security → Check requestMatchers(OPTIONS, "/**").permitAll()
   ↓
3. CorsConfigurationSource → Validate origin & headers
   ↓
4. Response → 200/204 with CORS headers
   ↓
5. Browser → POST /api/auth/login (actual request)
   ↓
6. Spring Security → /api/auth/** is permitAll (no JWT needed)
   ↓
7. AuthController → Process login
   ↓
8. Response → 200 with JWT token + CORS headers
   ↓
9. Browser → GET /api/hotels (with JWT in Authorization header)
   ↓
10. Spring Security → OPTIONS permitted, GET requires auth check
    ↓
11. Response → 200 with data + CORS headers
```

### Key Changes:

1. **OPTIONS requests bypass authentication**
   - Previously: Spring Security blocked OPTIONS with 403
   - Now: OPTIONS explicitly permitted before JWT filter runs

2. **CORS enabled globally**
   - Previously: `.cors(cors -> cors.configure(http))` had issues
   - Now: `.cors(cors -> {})` uses CorsConfigurationSource bean

3. **Production origin whitelisted**
   - Previously: Only localhost origins allowed
   - Now: Vercel domain added via CORS_ALLOWED_ORIGINS env var

4. **Credentials support**
   - allowCredentials=true allows Authorization header
   - Specific origins (not wildcard) required with credentials

---

## 🚨 Common Issues & Solutions

### Issue: Still getting 403 on OPTIONS
**Solution:** Verify OPTIONS matcher is BEFORE other matchers in SecurityConfig

### Issue: CORS error even after OPTIONS succeeds
**Solution:** Check CORS_ALLOWED_ORIGINS has exact Vercel URL (no trailing slash, HTTPS)

### Issue: "The 'Access-Control-Allow-Origin' header contains multiple values"
**Solution:** Ensure only ONE origin matches (don't allow both HTTP and HTTPS of same domain)

### Issue: Login works but authenticated endpoints fail
**Solution:** Verify JWT is being sent in Authorization header: `Bearer <token>`

### Issue: MongoDB connection timeout
**Solution:** Add Render's IP addresses to MongoDB Atlas Network Access whitelist

---

## 📝 Git Commands

```bash
# Check what changed
git status

# Review changes
git diff backend/src/main/java/com/voyago/config/

# Stage changes
git add backend/src/main/java/com/voyago/config/SecurityConfig.java
git add backend/src/main/java/com/voyago/config/CorsConfig.java

# Commit
git commit -m "Fix CORS/403 issues: Allow OPTIONS preflight, add production origin support"

# Push to trigger Render deployment
git push origin main
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Browser Network tab shows OPTIONS requests returning 200/204
2. ✅ No CORS errors in browser console
3. ✅ Login from Vercel frontend returns JWT token
4. ✅ GET /api/hotels, vehicles, transport work without authentication
5. ✅ Authenticated endpoints work with JWT token
6. ✅ Admin endpoints require ADMIN role

---

## 🔗 URLs

- **Frontend:** https://voyago-nine-psi.vercel.app
- **Backend:** https://voyago-backend-xt64.onrender.com
- **Backend Health Check:** https://voyago-backend-xt64.onrender.com/api/destinations

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status:** Ready for deployment ✅
