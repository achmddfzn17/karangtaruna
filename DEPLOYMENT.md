# 🚀 Panduan Deployment ke Vercel

## 📋 Prerequisites

Sebelum deploy, pastikan sudah punya:
- [ ] Akun [Vercel](https://vercel.com)
- [ ] Database PostgreSQL (bisa dari [Neon](https://neon.tech), [Supabase](https://supabase.com), atau [Railway](https://railway.app))
- [ ] Akun [Supabase](https://supabase.com) untuk storage
- [ ] Repository Git (GitHub, GitLab, atau Bitbucket)

---

## 🔧 Step 1: Setup Database PostgreSQL

### Option A: Neon (Recommended)
1. Buat akun di [neon.tech](https://neon.tech)
2. Create new project
3. Copy **Connection String** (ada 2 jenis):
   - **Pooled connection** → untuk `DATABASE_URL`
   - **Direct connection** → untuk `DIRECT_URL`

### Option B: Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. Go to **Settings** → **Database**
3. Copy **Connection String** (mode: Transaction)
4. Untuk `DIRECT_URL`, gunakan connection string dengan port `:5432`

### Option C: Railway
1. Buat project di [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Copy connection string dari **Connect** tab

---

## 📦 Step 2: Setup Supabase Storage

1. Buka project Supabase (atau buat baru)
2. Go to **Storage** → **Create bucket**
3. Nama bucket: `galeri`
4. Set **Public bucket**: ✅ (centang)
5. Go to **Settings** → **API**
6. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔐 Step 3: Generate AUTH_SECRET

Jalankan salah satu command ini:

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Buka: https://generate-secret.vercel.app/32
```

Copy hasilnya untuk `AUTH_SECRET`

---

## 🌐 Step 4: Deploy ke Vercel

### A. Via Vercel Dashboard (Recommended)

1. **Login ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click **Add New** → **Project**
   - Select repository: `karangtaruna`
   - Click **Import**

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Set Environment Variables**
   
   Click **Environment Variables** dan tambahkan:

   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host:6543/db?sslmode=require
   DIRECT_URL=postgresql://user:pass@host:5432/db?sslmode=require
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   
   # Auth
   AUTH_SECRET=your-generated-secret-here
   AUTH_URL=https://your-app.vercel.app
   
   # App
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_NAME=Karang Taruna Generasi Emas
   ```

   **PENTING:** 
   - Untuk `AUTH_URL` dan `NEXT_PUBLIC_APP_URL`, gunakan URL Vercel yang akan di-generate (bisa update nanti)
   - Atau gunakan custom domain jika sudah punya

5. **Deploy**
   - Click **Deploy**
   - Tunggu build selesai (~2-3 menit)

### B. Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: karangtaruna
# - Directory: ./
# - Override settings? No

# Set environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add AUTH_SECRET
vercel env add AUTH_URL
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_NAME

# Deploy to production
vercel --prod
```

---

## 🗄️ Step 5: Run Database Migrations

Setelah deploy berhasil, jalankan migrations:

### Option A: Via Vercel CLI (Recommended)

```bash
# Set DATABASE_URL di local
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Option B: Via Prisma Data Platform

1. Buka [cloud.prisma.io](https://cloud.prisma.io)
2. Connect ke database production
3. Run migrations dari dashboard

### Option C: Manual SQL

1. Copy semua file dari `prisma/migrations/`
2. Execute SQL secara manual di database console

---

## 🎨 Step 6: Update AUTH_URL (Jika Perlu)

Setelah deploy, Vercel akan generate URL seperti: `https://karangtaruna-xxx.vercel.app`

Update environment variables:

1. Go to **Project Settings** → **Environment Variables**
2. Edit `AUTH_URL` → `https://karangtaruna-xxx.vercel.app`
3. Edit `NEXT_PUBLIC_APP_URL` → `https://karangtaruna-xxx.vercel.app`
4. Click **Save**
5. **Redeploy** project (Deployments → ... → Redeploy)

---

## 👤 Step 7: Create Super Admin Account

Setelah deploy berhasil, buat akun super admin:

### Via Prisma Studio (Recommended)

```bash
# Set DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Open Prisma Studio
npx prisma studio

# Buka browser: http://localhost:5555
# 1. Buka table "User"
# 2. Add record:
#    - email: admin@example.com
#    - password: (hash bcrypt - lihat cara di bawah)
#    - role: SUPER_ADMIN
#    - name: Super Admin
```

### Generate Password Hash

```bash
# Install bcryptjs
npm install -g bcryptjs-cli

# Generate hash
bcryptjs-cli hash "your-password-here" 12

# Copy hash dan paste ke field password
```

### Via SQL (Alternative)

```sql
-- Generate hash dulu dengan bcrypt online tool
-- Contoh: https://bcrypt-generator.com/

INSERT INTO users (id, email, password, role, name, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$12$hash-dari-bcrypt-generator',
  'SUPER_ADMIN',
  'Super Admin',
  NOW(),
  NOW(),
  NOW()
);
```

---

## ✅ Step 8: Verify Deployment

1. **Test Login**
   - Buka `https://your-app.vercel.app/login`
   - Login dengan akun super admin
   - Pastikan redirect ke dashboard

2. **Test Upload**
   - Upload foto di Galeri
   - Pastikan file tersimpan di Supabase Storage

3. **Test Database**
   - Buat data anggota baru
   - Edit data
   - Hapus data
   - Pastikan semua CRUD berfungsi

4. **Check Logs**
   - Go to Vercel Dashboard → **Logs**
   - Monitor error logs
   - Fix jika ada error

---

## 🔄 Auto Deploy on Git Push

Vercel otomatis deploy setiap kali push ke branch:
- **main/master** → Production
- **develop** → Preview
- **feature/** → Preview

Untuk disable auto-deploy:
1. Go to **Project Settings** → **Git**
2. Uncheck **Production Branch**

---

## 🌍 Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter domain: `karangtaruna.com`
4. Follow DNS setup instructions
5. Update environment variables:
   - `AUTH_URL=https://karangtaruna.com`
   - `NEXT_PUBLIC_APP_URL=https://karangtaruna.com`
6. Redeploy

---

## 🐛 Troubleshooting

### Build Error: "DATABASE_URL not set"
✅ **Fixed!** Prisma client sekarang support build tanpa DATABASE_URL

### Error: "Prisma Client initialization failed"
- Pastikan `DATABASE_URL` sudah di-set di Vercel
- Check format connection string
- Pastikan database accessible dari Vercel

### Error: "Auth callback error"
- Update `AUTH_URL` dengan URL production yang benar
- Pastikan `AUTH_SECRET` sudah di-set
- Check Vercel logs untuk detail error

### Upload File Gagal
- Check `SUPABASE_SERVICE_ROLE_KEY` sudah benar
- Pastikan bucket `galeri` sudah dibuat
- Pastikan bucket di-set sebagai **Public**

### Slow Performance
- Enable **Edge Functions** di Vercel
- Use **Connection Pooling** untuk database
- Enable **Image Optimization** di Next.js

---

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Go to **Analytics** tab
2. Enable **Web Analytics**
3. Monitor:
   - Page views
   - Unique visitors
   - Performance metrics

### Error Tracking
1. Go to **Logs** tab
2. Filter by **Error**
3. Setup **Slack/Discord** notifications

### Database Monitoring
- **Neon**: Built-in monitoring dashboard
- **Supabase**: Database → Performance
- **Railway**: Metrics tab

---

## 🔒 Security Checklist

- [ ] `AUTH_SECRET` adalah random string (min 32 chars)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` tidak exposed ke client
- [ ] Database connection string menggunakan SSL (`?sslmode=require`)
- [ ] Environment variables tidak di-commit ke Git
- [ ] CORS configured untuk production domain only
- [ ] Rate limiting enabled (via Vercel Edge Config)

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## 🎉 Done!

Aplikasi sekarang sudah live di production! 🚀

**Next Steps:**
1. Setup monitoring & alerts
2. Configure backup strategy
3. Setup staging environment
4. Add CI/CD pipeline
5. Performance optimization

**Support:**
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Community: [Discord](https://discord.gg/vercel)
