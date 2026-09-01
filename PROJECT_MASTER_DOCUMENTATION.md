# 📖 Vitelo — Master System Architecture & Technical Handbook

> **Universal Directive for AI Models & Developers**: This master documentation represents the exhaustive, authoritative single source of truth for the entire **Vitelo** ecosystem. It specifies every component, database entity, REST API endpoint, frontend view, pricing quota, operational pipeline, email dispatch engine, telemetry rule, and resumption workflow across different machines.

---

## 📑 Mündəricat (Table of Contents)
1. [Sistem Arxitekturası və Domenlər](#-1-sistem-arxitekturas%C4%B1-v%C9%99-domenl%C9%99r)
2. [Qovluq Strukturu və Fayl Xəritəsi](#-2-qovluq-strukturu-v%C9%99-fayl-x%C9%99rit%C9%99si)
3. [Baza Sxemi və Cədvəllər (PostgreSQL / Supabase)](#-3-baza-sxemi-v%C9%99-c%C9%99dv%C9%99ll%C9%99r)
4. [Tam REST API Spesifikasiyası (`/api/v1/`)](#-4-tam-rest-api-spesifikasiyas%C4%B1)
5. [E-Poçt Çatdırılma Mühərriki (Resend & DNS)](#-5-e-po%C3%A7t-%C3%A7atd%C4%B1r%C4%B1lma-m%C3%BCh%C9%99rriki-resend)
6. [Mərkəzləşdirilmiş Loqlama və Telemetriya (Better Stack & Supabase)](#-6-m%C9%99rk%C9%99zl%C9%99%C5%9Fdirilmi%C5%9F-loqlama-v%C9%99-telemetriya)
7. [AI Prompt Mühəndisliyi və ATS Alqoritmləri](#-7-ai-prompt-m%C3%BCh%C9%99ndisliyi-v%C9%99-ats-alqoritml%C9%99ri)
8. [Frontend Arxitekturası, Zustand Store-lar və Çoxdillilik](#-8-frontend-arxitekturas%C4%B1-v%C9%99-zustand-store-lar)
9. [Monetizasiya, LemonSqueezy və Kredit Sistemi](#-9-monetizasiya-v%C9%99-kredit-sistemi)
10. [DevOps, Docker, Nginx və Deployment Bələdçisi](#-10-devops-docker-nginx-v%C9%99-deployment)
11. [Mühit Dəyişənləri (`.env`) Bələdçisi](#-11-m%C3%BChit-d%C9%99yi%C5%9F%C9%99nl%C9%99ri-b%C9%99l%C9%99d%C3%A7isi)
12. [Başqa Kompüterdə İşə Başlama Bələdçisi (Quickstart for New Machine)](#-12-ba%C5%9Fqa-komp%C3%BCterd%C9%99-i%C5%9F%C9%99-ba%C5%9Flama)
13. [Gələcək AI və Proqramçılar Üçün Qızıl Qaydalar](#-13-q%C4%B1z%C4%B1l-qaydalar)

---

## 🏛️ 1. Sistem Arxitekturası və Domenlər

Vitelo müasir, yüksək performanslı və mikroxidmətə hazır monolit-arxitektura əsasında qurulmuşdur:

```mermaid
graph TD
    User([İstifadəçi Brauzeri]) -->|HTTPS| CF[Cloudflare Pages: vitelo.me]
    User -->|API Requests| Nginx[Nginx Reverse Proxy: api.vitelo.me]
    Nginx -->|Port 8000| FastAPI[FastAPI Backend: Uvicorn / Docker]
    FastAPI -->|Async Pooler| Pooler[Supabase IPv4 Pooler: Port 5432]
    Pooler --> Postgres[(Supabase PostgreSQL: ap-south-1)]
    FastAPI -->|LLM Requests| Gemini[Google Gemini AI: gemini-1.5-flash]
    FastAPI -->|Redis Tasks| Upstash[Upstash Redis / Celery]
    FastAPI -->|Transactional Emails| Resend[Resend API: no-reply@vitelo.me]
    FastAPI -->|Live Telemetry Stream| BetterStack[Better Stack Logs Cloud]
    Lemon[LemonSqueezy Payment] -->|Webhooks| FastAPI
    FastAPI -->|Persistent Telemetry| AppLogs[(Supabase: app_logs)]
```

### 🌐 Canlı Şəbəkə Xəritəsi:
* **Frontend Web App**: `https://vitelo.me` (Cloudflare Pages — avtomatik CI/CD `git push origin main` ilə).
* **Backend API Gateway**: `https://api.vitelo.me/api/v1` (DigitalOcean Droplet `vitelo-backend`, Ubuntu 24.04, Docker Container).
* **Supabase Project**: `https://qxwxpykthyoyfnydsxvn.supabase.co` (Region: `ap-south-1`).
* **Supabase Database Pooler**: `aws-0-ap-south-1.pooler.supabase.com:5432` (Session mode IPv4).
* **Mərkəzi Loqlar**: Better Stack Logs (`vitelo-backend` source) + Supabase `app_logs`.
* **E-Poçt Çatdırılması**: Resend API (`no-reply@vitelo.me`).

---

## 📂 2. Qovluq Strukturu və Fayl Xəritəsi

```
vitelo/
├── backend/                        # FastAPI Python 3.12+ Backend
│   ├── api/
│   │   └── v1/                     # REST API V1 Routers
│   │       ├── auth.py             # Login, Register, Forgot/Reset Password, Verify Email, Token Refresh
│   │       ├── cv.py               # CV CRUD, AI Generate, Tailor, Section Patching, Unlock
│   │       ├── cover_letter.py     # Cover Letter AI Builder, CRUD, Export endpoints
│   │       ├── jobs.py             # Vacancy Aggregator & 1-Click URL Scraper Tailor
│   │       ├── tracker.py          # Job Tracker Kanban Board APIs (Stages, Notes, Dates)
│   │       ├── interview.py        # AI Mock Interview simulator & STAR Answer Grader
│   │       ├── salary.py           # Salary Analyzer & Market Benchmark calculator
│   │       ├── learning.py         # Career Learning Hub modules & course progress
│   │       ├── billing.py          # LemonSqueezy Webhooks, Credits checkout & Ledger
│   │       ├── logs.py             # Supabase app_logs & Better Stack Telemetry receiver
│   │       ├── user.py             # User profile, preferences, settings
│   │       └── b2b.py              # B2B Bulk Matcher & Enterprise Organization APIs
│   ├── core/
│   │   ├── config.py               # Pydantic Settings (ENV parser: DB, Resend, BetterStack, Gemini)
│   │   ├── database.py             # Async Engine (pool_recycle=300, prepared_stmt=0), async_session, Base
│   │   ├── errors.py               # Global Exception Handlers & Standard JSON errors
│   │   ├── security.py             # JWT encode/decode, bcrypt hashing, dependencies
│   │   └── telemetry.py            # Dual-sink logging engine (Better Stack + Supabase app_logs)
│   ├── models/                     # SQLAlchemy ORM Data Models
│   │   ├── user.py                 # User, UserProfile, Role, UserSession, AuditLog
│   │   ├── cv.py                   # CVResume, CVExperience, CVEducation, CVSkill, CVProject, ATSScan
│   │   ├── cover_letter.py         # CoverLetter model
│   │   ├── tracker.py              # JobTracker, JobTrackerApplication
│   │   ├── interview.py            # InterviewSession, InterviewQuestion, InterviewUserAnswer
│   │   ├── salary.py               # SalaryInsight, SalaryMarketData
│   │   ├── transaction.py          # Transaction, UserCreditLedger
│   │   ├── log.py                  # AppLog (Central telemetry model)
│   │   └── b2b.py                  # B2BOrganization, B2BCandidate, B2BCampaign
│   ├── schemas/                    # Pydantic Request/Response Validation Schemas
│   ├── services/                   # Business Logic & Third-Party Integrations
│   │   ├── ai_service.py           # Google Gemini AI prompts, XYZ optimizer, ATS grader
│   │   ├── billing_service.py      # LemonSqueezy webhook processor & credit allocation
│   │   ├── email_service.py        # Resend API email dispatcher with branded HTML templates
│   │   └── scraper_service.py      # HTTPX & BeautifulSoup URL job post scraper
│   ├── docker/
│   │   ├── Dockerfile.backend      # Production Python 3.12 slim Docker image
│   │   └── Dockerfile.worker       # Celery Worker image
│   ├── docker-compose.yml          # Container orchestration (API, Worker, Nginx)
│   ├── main.py                     # FastAPI entrypoint, lifespan, CORS, rate-limiting
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # React 18 + Vite 5 + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── cv/                 # CV Studio: Live Preview, ATS Checker, Job Match Drawer
│   │   │   ├── landing/            # LiveScannerWidget (10s ATS Tool), Feature Carousels
│   │   │   └── ui/                 # Navbar, Footer, LanguageSelector, Modals, Tabs
│   │   ├── data/
│   │   │   ├── translations.ts     # Complete Multilingual Dictionary (AZ 🇦🇿, EN 🇬🇧, TR 🇹🇷)
│   │   │   ├── exampleProfiles.ts  # Pre-filled CV & Cover Letter sample benchmarks
│   │   │   └── templates.ts        # CV Visual Templates definitions (Modern, Minimal, etc.)
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance with auth interceptor & error telemetry
│   │   │   └── logger.ts           # Client-side logger streaming to Supabase app_logs
│   │   ├── stores/                 # Zustand Persistent Stores
│   │   │   ├── authStore.ts        # JWT token, user payload, authentication state
│   │   │   ├── languageStore.ts    # Selected UI language (AZ / EN / TR)
│   │   │   └── cvStore.ts          # Active CV model, live score, styling config
│   │   ├── pages/                  # 18 Application Views
│   │   │   ├── Landing.tsx         # Modern Landing Page with Live Scanner & Pricing
│   │   │   ├── Login.tsx           # Sign-in with "Forgot Password?" entry
│   │   │   ├── Register.tsx        # New user registration
│   │   │   ├── ForgotPassword.tsx  # Password reset link dispatcher
│   │   │   ├── ResetPassword.tsx   # Token validation and new password setter
│   │   │   ├── Dashboard.tsx       # Core User Dashboard
│   │   │   ├── GenerateCV.tsx      # Full-blown 2-column Interactive CV Studio
│   │   │   ├── GenerateCoverLetter.tsx # Cover Letter AI Builder (Word/PDF export)
│   │   │   ├── Documents.tsx       # Document repository (CVs + Cover Letters)
│   │   │   ├── JobTracker.tsx      # Drag-and-drop Kanban job application board
│   │   │   ├── InterviewPrep.tsx   # AI Mock Interview with STAR scoring
│   │   │   ├── SalaryAnalyzer.tsx  # Salary Benchmarking & Negotiation tool
│   │   │   ├── Jobs.tsx            # Curated vacancies with 1-click apply
│   │   │   ├── JobSearchMethod.tsx # Structured 5-Step job search masterclass
│   │   │   ├── LearningHub.tsx     # Career video lessons and tracks
│   │   │   ├── DashboardPricing.tsx# LemonSqueezy credit packages
│   │   │   ├── Account.tsx         # Profile, security & Transaction history ledger
│   │   │   ├── SystemLogs.tsx      # Real-time Supabase log inspector
│   │   │   └── PublicWebCV.tsx     # QR-enabled public web CV view (/p/:id)
│   │   ├── App.tsx                 # Route declarations & ProtectedRoute wrappers
│   │   └── main.tsx                # React DOM entry
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── clear_logs.py                   # 1-Click Supabase log purge tool
├── clear_logs.ps1                  # PowerShell helper for log purge
├── test_email.py                   # Direct Resend API diagnostic test
├── deploy.sh                       # Single-command VPS deployment script
├── api.vitelo.me                   # Production Nginx reverse-proxy server block
└── PROJECT_MASTER_DOCUMENTATION.md # This master document
```

---

## 🗄️ 3. Baza Sxemi və Cədvəllər (PostgreSQL / Supabase)

### 1. `users` (Əsas İstifadəçilər)
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'individual', -- 'individual' | 'b2b' | 'admin'
    credits INTEGER DEFAULT 0,
    target_role VARCHAR(255),
    profile_completion INTEGER DEFAULT 0,
    api_key VARCHAR(64) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `app_logs` (Mərkəzi Telemetriya və Canlı Sistem Logları)
```sql
CREATE TABLE public.app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL, -- 'INFO' | 'WARN' | 'ERROR' | 'ACTION'
    category VARCHAR(50) NOT NULL, -- 'auth' | 'cv_generator' | 'payment' | 'client_exception' | 'email_service'
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    page_url TEXT,
    component VARCHAR(100),
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_app_logs_created_at ON public.app_logs(created_at DESC);
```

---

## 🔌 4. Tam REST API Spesifikasiyası

Bütün endpointlər `https://api.vitelo.me/api/v1` prefiksi ilə işləyir:

### 1. Autentifikasiya (`/auth`)
* `POST /auth/register`
  - **Body**: `{ "email": "user@mail.com", "password": "...", "full_name": "Tebriz Latifov" }`
  - **İşləməsi**: 15 dəqiqəlik JWT token yaradır, `email_service` ilə qeydiyyat təsdiq emaili göndərir.
* `POST /auth/verify-email`
  - **Body**: `{ "token": "jwt_token" }`
  - **İşləməsi**: Tokeni yoxlayır, istifadəçini `users` bazasında aktivləşdirir və giriş tokenlərini qaytarır.
* `POST /auth/login`
  - **Body**: `{ "email": "user@mail.com", "password": "..." }`
  - **Cavab (200)**: `{ "access_token": "jwt...", "refresh_token": "jwt..." }`
* `GET /auth/me` *(Auth Required)*
  - **Cavab (200)**: `{ "id": "uuid", "email": "...", "full_name": "...", "credits": 5, "role": "individual" }`
* `POST /auth/forgot-password`
  - **Body**: `{ "email": "user@mail.com" }`
  - **İşləməsi**: İstifadəçi varsa 30 dəqiqəlik şifrə sıfırlama linki yaradır və Resend ilə poçtuna göndərir.
* `POST /auth/reset-password`
  - **Body**: `{ "token": "jwt_reset_token", "new_password": "NewPassword123!" }`
  - **İşləməsi**: Şifrəni yeniləyir və təsdiq mesajı qaytarır.

---

## 📩 5. E-Poçt Çatdırılma Mühərriki (Resend)

* **Servis Modulu**: `backend/services/email_service.py`
* **API Key**: `re_hV13drPC_8r5woUzcf3MH8Y3EGZ5FhiSY`
* **Göndərən Ünvan**: `Vitelo <no-reply@vitelo.me>`
* **Cloudflare DNS Qeydləri**:
  1. **DKIM**: TXT `resend._domainkey` -> `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4NEk/4ZFJq8ucXApnnojMP6q5A+JCazhJVM2GyohSICAOkNnIvlYeL4ysSHZkOK6LMENS6UpbI1zHaXQ8agA6s+YTizabawCdA94TU6k1LMiIpOnewjwy0Z0WEQCm5+OsdTdAaFCQOAhn7QjVUMfqKbxbxGZzcDHvEsVFBbisEQIDAQAB`
  2. **SPF**: TXT `send` -> `v=spf1 include:amazonses.com ~all`
  3. **MX**: MX `send` -> `feedback-smtp.ap-northeast-1.amazonses.com` (Priority 10)
  4. **DMARC**: TXT `_dmarc` -> `v=DMARC1; p=none;`

---

## 🪵 6. Mərkəzləşdirilmiş Loqlama və Telemetriya

Vitelo **Dual-Sink Real-Time Observability Engine** istifadə edir:
* **Engine Modulu**: `backend/core/telemetry.py`
* **Better Stack Token**: `qt7poDKNd3sJfwNkVQ6Y5haS` (Source: `vitelo-backend`)
* **Canlı Axın (Live Tail)**: [Better Stack Logs Dashboard](https://betterstack.com/logs)
* **Baza Arxivlənməsi**: Supabase `app_logs` cədvəli
* **Təmizləmə Skripti**: `python clear_logs.py` (bütün logları sıfırlamaq üçün)

---

## 🤖 7. AI Prompt Mühəndisliyi və ATS Alqoritmləri

### 📐 Google XYZ Formulu
Vitelo bütün CV təcrübə bəndlərini **Google-un Rəsmi XYZ Standartı** ilə qurur:
$$\text{Accomplished } [X] \text{ as measured by } [Y], \text{ by doing } [Z]$$

### 📊 ATS Qiymətləndirmə Metrikası (100 Bal):
1. **Fəaliyyət Felləri (Action Verbs)**: 20 bal
2. **Kəmiyyət və Metriklər (Numbers & %)**: 30 bal
3. **Açar Söz Doyumluluğu (Keyword Match)**: 30 bal
4. **Struktur və Formatlaşdırma (Formatting)**: 20 bal

---

## 🎨 8. Frontend Arxitekturası və Zustand Store-lar

* **`authStore.ts`**: İstifadəçi sessiyası, JWT tokeni və cari kreditlər.
* **`languageStore.ts`**: Çoxdilli sistem (`az`, `en`, `tr`) — `data/translations.ts` lüğəti ilə.
* **`cvStore.ts`**: CV redaktoru, rənglər, şablonlar, A4 canlı önizləmə.

---

## 💎 9. Monetizasiya və Kredit Sistemi

| Plan | Qiymət | Sənəd Limiti | Xüsusiyyətlər |
|---|---|---|---|
| **Free Tier** | $0 | **1 CV** | Basic Şablonlar, Standart PDF, Web CV & QR |
| **Single CV** | $3.99 | **1 Kredit** | Tək bir CV üçün limitsiz ixrac hüququ |
| **Basic Plan** | $4.99 | **3 CV + 3 Cover Letter** | Minimalist & Modern şablonlar, Təmiz PDF, QR paylaşımı |
| **Pro Plan** | $7.99 | **5 CV + 5 Cover Letter** | Bütün Pro Şablonlar, 1-Klik Vakansiya Uyğunlaşdırma, ATS Auditi |
| **Ultimate Plan**| $12.99| **8 CV + 8 Cover Letter** | Bütün şablonlar, AI Çoxdilli Tərcüməçi, LinkedIn Optimizer, 5 Müsahibə Q&A, Maaş Analizatoru |

---

## 🚀 10. DevOps, Docker, Nginx və Deployment

### Canlı Serverin Yenilənməsi (DigitalOcean VPS `209.38.213.29`)
DigitalOcean Web Console-da bu vahid əmri icra etmək kifayətdir:
```bash
cd /var/www/vitelo && git pull origin main && docker compose up -d --build
```

---

## ⚙️ 11. Mühit Dəyişənləri Bələdçisi (`backend/.env`)

```ini
# Database (Supabase PostgreSQL IPv4 Session Pooler)
DATABASE_URL=postgresql+asyncpg://postgres.qxwxpykthyoyfnydsxvn:%25ecLt3VaURe%26aT5@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://qxwxpykthyoyfnydsxvn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3hweWt0aHlveWZueWRzeHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NzcsImV4cCI6MjA4OTY2NTk3N30.K3F7z7Y2N_F-q0lF6R7hT7eX_g7mN9eQ4wE1yU8t0eE

# Redis (Upstash)
REDIS_URL=rediss://default:gQAAAAAAAQIQAAIncDE2NmYwM2VhMjc4ZTM0NDk2YTgwYTU0OWM1NGZmNjRlZXAxNjYwNjQ@fresh-hookworm-66064.upstash.io:6379

# JWT Auth
SECRET_KEY=vitelo-super-secret-jwt-key-min-32-chars-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini AI
GEMINI_API_KEY=AIzaSyB3_H5ZNGyCHKPrGukOZ9fgTpVWY1R4Btw

# LemonSqueezy
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
LEMONSQUEEZY_WEBHOOK_SECRET=vitelo-webhook-secret-2024
LEMONSQUEEZY_STORE_ID=94d59cef-dbb8-4ea5-b178-d2540fcd6919

# Centralized Logging (Better Stack Logs / Logtail)
LOGTAIL_SOURCE_TOKEN=qt7poDKNd3sJfwNkVQ6Y5haS
BETTERSTACK_TOKEN=qt7poDKNd3sJfwNkVQ6Y5haS

# Email Service (Resend)
RESEND_API_KEY=re_hV13drPC_8r5woUzcf3MH8Y3EGZ5FhiSY
EMAIL_FROM=Vitelo <no-reply@vitelo.me>

# App
ENVIRONMENT=production
FRONTEND_URL=https://vitelo.me
```

---

## 💻 12. Başqa Kompüterdə İşə Başlama Bələdçisi (Quickstart)

Sabah başqa kompüterdə layihəni açdıqda sadəcə bu addımları atın:

1. **Repozitoriyanı çəkin**:
   ```bash
   git clone https://github.com/latifovtebriz/vitelo.git
   cd vitelo
   ```
2. **Backend Mühiti**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate   # (Linux/Mac: source venv/bin/activate)
   pip install -r requirements.txt
   # .env faylını yuxarıdakı bələdçiyə uyğun yaradın
   uvicorn main:app --reload --port 8000
   ```
3. **Frontend Mühiti**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔒 13. Qızıl Qaydalar (Rules for Future AI & Developers)

1. ⚠️ **Baza Toxunulmazlığı**: `eagle-readonly` və `businesstest-readonly` bazalarına **qətiyyən toxunulmamalıdır**. Yalnız Vitelo bazası (`qxwxpykthyoyfnydsxvn`) istifadə edilməlidir.
2. 🪵 **Mütləq Telemetriya Loqlaması**: Hər bir yeni düymə, API və ya səhifə xətası `app_logs` cədvəlinə və Better Stack-ə ötürülməlidir.
3. 📦 **TypeScript Verbatim Syntax**: Bütün Type importları `import type { ... } from '...'` formatında olmalıdır. `npm run build` hər commit-dən əvvəl 0 xəta ilə tamamlanmalıdır.
4. 🌐 **IPv4 Supabase Pooler**: Birbaşa IPv6 `db.qxwxpykthyoyfnydsxvn.supabase.co` əvəzinə həmişə `aws-0-ap-south-1.pooler.supabase.com:5432` Session Pooler ünvanından istifadə olunmalıdır.
5. ⚡ **SQLAlchemy Pool Ölçüsü**: Supabase Free plan bağlantı limiti 15 olduğu üçün backend `pool_size=5, max_overflow=5, pool_timeout=5, pool_recycle=180` parametrindən artıq təyin olunmamalıdır.
6. 🔐 **Native bcrypt Hashing**: `passlib` əvəzinə təmiz C-əsaslı `bcrypt` paketi istifadə olunmalıdır (performans və Windows charmap xətalarının qarşısını almaq üçün).
