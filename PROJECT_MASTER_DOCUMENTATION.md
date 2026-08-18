# 📖 Vitelo — Master System Architecture & Technical Handbook

> **Universal Directive for AI Models & Developers**: This master documentation represents the exhaustive, authoritative single source of truth for the entire **Vitelo** ecosystem. It specifies every component, database entity, REST API endpoint, frontend view, pricing quota, operational pipeline, and telemetry rule.

---

## 📑 Mündəricat (Table of Contents)
1. [Sistem Arxitekturası və Domenlər](#-1-sistem-arxitekturas%C4%B1-v%C9%99-domenl%C9%99r)
2. [Qovluq Strukturu və Fayl Xəritəsi](#-2-qovluq-strukturu-v%C9%99-fayl-x%C9%99rit%C9%99si)
3. [Baza Sxemi və Cədvəllər (PostgreSQL / Supabase)](#-3-baza-sxemi-v%C9%99-c%C9%99dv%C9%99ll%C9%99r)
4. [Tam REST API Spesifikasiyası (`/api/v1/`)](#-4-tam-rest-api-spesifikasiyas%C4%B1)
5. [AI Prompt Mühəndisliyi və ATS Alqoritmləri](#-5-ai-prompt-m%C3%BCh%C9%99ndisliyi-v%C9%99-ats-alqoritml%C9%99ri)
6. [Frontend Arxitekturası, Zustand Store-lar və Çoxdillilik](#-6-frontend-arxitekturas%C4%B1-v%C9%99-zustand-store-lar)
7. [Monetizasiya, LemonSqueezy və Kredit Sistemi](#-7-monetizasiya-v%C9%99-kredit-sistemi)
8. [DevOps, Docker, Nginx və Deployment Bələdçisi](#-8-devops-docker-nginx-v%C9%99-deployment)
9. [Mühit Dəyişənləri (`.env`) Bələdçisi](#-9-m%C3%BChit-d%C9%99yi%C5%9F%C9%99nl%C9%99ri-b%C9%99l%C9%99d%C3%A7isi)
10. [Gələcək AI və Proqramçılar Üçün Qızıl Qaydalar](#-10-q%C4%B1z%C4%B1l-qaydalar)

---

## 🏛️ 1. Sistem Arxitekturası və Domenlər

Vitelo müasir, yüksək performanslı və mikroxidmətə hazır monolit-arxitektura əsasında qurulmuşdur:

```mermaid
graph TD
    User([İstifadəçi Brauzeri]) -->|HTTPS| CF[Cloudflare Pages: vitelo.me]
    User -->|API Requests| Nginx[Nginx Reverse Proxy: api.vitelo.me]
    Nginx -->|Port 8000| FastAPI[FastAPI Backend: Uvicorn / Docker]
    FastAPI -->|Async Session| Pooler[Supabase IPv4 Pooler: Port 5432]
    Pooler --> Postgres[(Supabase PostgreSQL: ap-south-1)]
    FastAPI -->|LLM Requests| Gemini[Google Gemini AI: gemini-1.5-flash]
    FastAPI -->|Redis Tasks| Upstash[Upstash Redis / Celery]
    Lemon[LemonSqueezy Payment] -->|Webhooks| FastAPI
    FastAPI -->|Telemetry Logs| AppLogs[(Supabase: app_logs)]
```

### 🌐 Canlı Şəbəkə Xəritəsi:
* **Frontend Web App**: `https://vitelo.me` (Cloudflare Pages — avtomatik CI/CD `git push origin main` ilə).
* **Backend API Gateway**: `https://api.vitelo.me/api/v1` (DigitalOcean Droplet `vitelo-backend`, Ubuntu 24.04, Docker Container).
* **Supabase Project**: `https://qxwxpykthyoyfnydsxvn.supabase.co` (Region: `ap-south-1`).
* **Supabase Database Pooler**: `aws-0-ap-south-1.pooler.supabase.com:5432` (Session mode IPv4).

---

## 📂 2. Qovluq Strukturu və Fayl Xəritəsi

```
vitelo/
├── backend/                        # FastAPI Python 3.12+ Backend
│   ├── api/
│   │   └── v1/                     # REST API V1 Routers
│   │       ├── auth.py             # Login, Register, Forgot/Reset Password, Token Refresh
│   │       ├── cv.py               # CV CRUD, AI Generate, Tailor, Section Patching, Unlock
│   │       ├── cover_letter.py     # Cover Letter AI Builder, CRUD, Export endpoints
│   │       ├── jobs.py             # Vacancy Aggregator & 1-Click URL Scraper Tailor
│   │       ├── tracker.py          # Job Tracker Kanban Board APIs (Stages, Notes, Dates)
│   │       ├── interview.py        # AI Mock Interview simulator & STAR Answer Grader
│   │       ├── salary.py           # Salary Analyzer & Market Benchmark calculator
│   │       ├── learning.py         # Career Learning Hub modules & course progress
│   │       ├── billing.py          # LemonSqueezy Webhooks, Credits checkout & Ledger
│   │       ├── logs.py             # Supabase app_logs Telemetry receiver & search
│   │       ├── user.py             # User profile, preferences, settings
│   │       └── b2b.py              # B2B Bulk Matcher & Enterprise Organization APIs
│   ├── core/
│   │   ├── config.py               # Pydantic Settings (ENV parser)
│   │   ├── database.py             # Async Engine, sessionmaker, Base model
│   │   ├── errors.py               # Global Exception Handlers & Standard JSON errors
│   │   └── security.py             # JWT encode/decode, bcrypt hashing, dependencies
│   ├── models/                     # SQLAlchemy ORM Data Models
│   │   ├── user.py                 # User, UserProfile, Role, UserSession, AuditLog
│   │   ├── cv.py                   # CVGeneration, CVTemplate, ATSScan, CVSection
│   │   ├── cover_letter.py         # CoverLetter model
│   │   ├── tracker.py              # JobTracker, ApplicationStage, TrackerEvent
│   │   ├── interview.py            # InterviewSession, InterviewQuestion, GraderLog
│   │   ├── salary.py               # SalaryInsight, Benchmark, NegotiationScript
│   │   ├── transaction.py          # Transaction, UserCreditLedger
│   │   ├── log.py                  # AppLog (Central telemetry model)
│   │   └── b2b.py                  # B2BOrganization, B2BCandidate, B2BCampaign
│   ├── schemas/                    # Pydantic Request/Response Validation Schemas
│   ├── services/                   # Business Logic & Third-Party Integrations
│   │   ├── ai_service.py           # Google Gemini AI prompts, XYZ optimizer, ATS grader
│   │   ├── billing_service.py      # LemonSqueezy webhook processor & credit allocation
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
├── deploy.sh                       # Single-command VPS deployment script
├── api.vitelo.me                   # Production Nginx reverse-proxy server block
└── PROJECT_MASTER_DOCUMENTATION.md # This document
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

### 2. `cv_generations` (CV Sənədləri)
```sql
CREATE TABLE public.cv_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL DEFAULT 'Untitled Resume',
    content JSONB NOT NULL, -- { personal, summary, experience, education, skills, projects, certifications, languages, custom_sections }
    ats_score INTEGER DEFAULT 70,
    template_id VARCHAR(50) DEFAULT 'modern', -- 'modern' | 'minimalist' | 'executive' | 'creative' | 'technical'
    color_theme VARCHAR(50) DEFAULT 'blue',
    font_family VARCHAR(50) DEFAULT 'Inter',
    is_unlocked BOOLEAN DEFAULT FALSE,
    public_slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cv_generations_user_id ON public.cv_generations(user_id);
```

### 3. `cover_letters` (Müşayiət Məktubları)
```sql
CREATE TABLE public.cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    tone VARCHAR(50) DEFAULT 'professional', -- 'professional' | 'confident' | 'modern' | 'casual'
    body_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `job_tracker` (Kanban İş Müraciətləri)
```sql
CREATE TABLE public.job_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'wishlist', -- 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'rejected'
    salary_offer VARCHAR(100),
    location VARCHAR(255),
    job_url TEXT,
    notes TEXT,
    deadline VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_job_tracker_user_stage ON public.job_tracker(user_id, stage);
```

### 5. `interview_sessions` (AI Müsahibə Təlimi)
```sql
CREATE TABLE public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    seniority_level VARCHAR(50) DEFAULT 'Middle', -- 'Junior' | 'Middle' | 'Senior' | 'Lead'
    questions_and_answers JSONB NOT NULL, -- Array of { question, userAnswer, starRating, aiFeedback, modelAnswer }
    overall_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. `transactions` (LemonSqueezy Fakturaları & Balans Artımı)
```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id VARCHAR(100) UNIQUE,
    tier VARCHAR(50) NOT NULL, -- 'basic' | 'pro' | 'ultimate' | 'single_cv'
    amount_usd NUMERIC(10, 2) NOT NULL,
    credits_added INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. `app_logs` (Mərkəzi Telemetriya və Canlı Sistem Logları)
```sql
CREATE TABLE public.app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL, -- 'INFO' | 'WARN' | 'ERROR' | 'ACTION'
    category VARCHAR(50) NOT NULL, -- 'auth' | 'cv_generator' | 'payment' | 'client_exception' | 'ai_service'
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

> 🧹 **Avtomatik Log Təmizlənməsi**: `app_logs` cədvəlindəki 5 gündən köhnə bütün qeydlər sistem performansını yüksək saxlamaq üçün periyodik olaraq təmizlənir.

---

## 🔌 4. Tam REST API Spesifikasiyası

Bütün endpointlər `https://api.vitelo.me/api/v1` prefiksi ilə işləyir:

### 1. Autentifikasiya (`/auth`)
* `POST /auth/register`
  - **Body**: `{ "email": "user@mail.com", "password": "...", "full_name": "Tebriz Latifov" }`
  - **Cavab (201)**: `{ "access_token": "jwt...", "refresh_token": "jwt...", "token_type": "bearer" }`
* `POST /auth/login`
  - **Body**: `{ "email": "user@mail.com", "password": "..." }`
  - **Cavab (200)**: `{ "access_token": "jwt...", "refresh_token": "jwt..." }`
* `GET /auth/me` *(Auth Required)*
  - **Cavab (200)**: `{ "id": "uuid", "email": "...", "full_name": "...", "credits": 5, "role": "individual" }`
* `POST /auth/forgot-password`
  - **Body**: `{ "email": "user@mail.com" }`
  - **Cavab (200)**: `{ "success": true, "message": "If an account with that email exists, a password reset link has been dispatched." }`
* `POST /auth/reset-password`
  - **Body**: `{ "token": "jwt_reset_token", "new_password": "NewPassword123!" }`
  - **Cavab (200)**: `{ "success": true, "message": "Password has been reset successfully. You can now log in." }`

### 2. CV Əməliyyatları (`/cv`)
* `POST /cv/generate` *(Auth Required)*
  - **Body**: `{ "target_role": "Backend Engineer", "experience_level": "Senior", "raw_notes": "..." }`
  - **İşləməsi**: Gemini 1.5 Flash ilə Google XYZ formatında təcrübə bəndləri və ATS uyğun JSON generasiya edir.
* `GET /cv/` & `GET /cv/{id}` — İstifadəçinin CV arxivini və ya tək CV detalını qaytarır.
* `PUT /cv/{id}` — CV məzmununu, rəngini, fontunu və bölmələrini yeniləyir.
* `DELETE /cv/{id}` — CV-ni bazadan silir.
* `POST /cv/unlock/{id}` — 1 kredit çıxaraq sənədin limitsiz yüklənməsini aktivləşdirir.

### 3. Vakansiya Skraperi və Uyğunlaşdırma (`/jobs`)
* `GET /jobs/` — Mövcud vakansiyalar axını (filter: remote, salary, tech stack).
* `POST /jobs/scrape-and-tailor` *(Auth Required)*
  - **Body**: `{ "job_url": "https://linkedin.com/jobs/view/...", "current_cv": { ... } }`
  - **İşləməsi**: Vakansiyanın mətni və açar sözlərini skrap edir, namizədin CV-sində çatışmayan açar sözləri tapır və təcrübə bəndlərini vakansiyanın tələblərinə uyğunlaşdırır.

### 4. Digər Əsas Endpointlər
* `POST /cover-letter/generate` — Vakansiya və şirkət adına uyğun Cover Letter yaradır.
* `GET /tracker/` / `POST /tracker/` / `PUT /tracker/{id}/stage` — Kanban idarəsi.
* `POST /interview/start` & `POST /interview/submit-answer` — STAR əsaslı AI müsahibə.
* `GET /salary/search?role=DevOps&location=Baku` — Maaş statistikası.
* `POST /billing/webhook` — LemonSqueezy webhook emalçısı.
* `POST /logs/` — Real-time telemetriya log qəbulu.
* `GET /health` — PostgreSQL və Redis canlılıq statusu.

---

## 🤖 5. AI Prompt Mühəndisliyi və ATS Alqoritmləri

### 📐 Google XYZ Formulu
Vitelo bütün CV təcrübə bəndlərini **Google-un Rəsmi XYZ Standartı** ilə qurur:
$$\text{Accomplished } [X] \text{ as measured by } [Y], \text{ by doing } [Z]$$
* **Zəif Nümunə**: *"FastAPI ilə backend API-lar yazdım."*
* **Vitelo XYZ Nümunəsi**: *"FastAPI və PostgreSQL asinxron arxitekturası quraraq server gecikməsini 45% azaltdım və gündəlik 120k+ istifadəçi sorğusuna dayanıqlı API təqdim etdim."*

### 📊 ATS Qiymətləndirmə Metrikası (100 Bal):
1. **Fəaliyyət Felləri (Action Verbs)**: 20 bal (Məs: *Architected, Engineered, Optimized, Spearheaded*).
2. **Kəmiyyət və Metriklər (Numbers & %)**: 30 bal (Hər bənddə ən az 1 rəqəm/faiz/valyuta göstəricisi).
3. **Açar Söz Doyumluluğu (Keyword Match)**: 30 bal (Vakansiyanın tələb etdiyi texnologiyaların CV-də olması).
4. **Struktur və Bölmə Düzülüşü (Formatting)**: 20 bal (Standart kontaktlar, təcrübə, təhsil, bacarıqlar).

---

## 🎨 6. Frontend Arxitekturası və Zustand Store-lar

### 1. `authStore.ts` (İstifadəçi Sessiyası)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}
```

### 2. `languageStore.ts` (Çoxdilli Sistem)
* **Dillər**: `az` (Azərbaycan), `en` (English), `tr` (Türkçe).
* **Məzmun**: `translations.ts` daxilində bütün naviqasiya, qəhrəman bölməsi, 10s ATS skaner, qiymət kartları və FAQ mətnləri tək obyektdə toplanıb.
* Seçilmiş dil `localStorage`-da saxlanılır və səhifə yeniləndikdə itmir.

### 3. `cvStore.ts` (CV Redaktoru və Canlı Önizləmə)
* Real vaxt rejimində istifadəçi daxil etdiyi hər mətni emal edir, dərhal ATS balını hesablayır və sağ sütunda A4 formatında canlı nümayiş etdirir.

---

## 💎 7. Monetizasiya və Kredit Sistemi

Vitelo LemonSqueezy ilə tam inteqrasiya olunub:

| Plan | Qiymət | Sənəd Limiti | Xüsusiyyətlər |
|---|---|---|---|
| **Free Tier** | $0 | **1 CV** | Basic Şablonlar, Standart PDF, Web CV & QR |
| **Single CV** | $3.99 | **1 Kredit** | Tək bir CV üçün limitsiz ixrac hüququ |
| **Basic Plan** | $4.99 | **3 CV + 3 Cover Letter** | Minimalist & Modern şablonlar, Təmiz PDF, QR paylaşımı |
| **Pro Plan** | $7.99 | **5 CV + 5 Cover Letter** | Bütün Pro Şablonlar, 1-Klik Vakansiya Uyğunlaşdırma, ATS Auditi |
| **Ultimate Plan**| $12.99| **8 CV + 8 Cover Letter** | Bütün şablonlar, AI Çoxdilli Tərcüməçi, LinkedIn Optimizer, 5 Müsahibə Q&A, Maaş Analizatoru |

---

## 🚀 8. DevOps, Docker, Nginx və Deployment

### 1. Lokal İşə Salma (Development)
* **Backend**:
  ```powershell
  cd backend
  .\venv\Scripts\uvicorn main:app --reload --port 8000
  ```
* **Frontend**:
  ```powershell
  cd frontend
  npm run dev
  ```

### 2. Canlı Serverin Yenilənməsi (DigitalOcean VPS)
DigitalOcean Web Console-da sadəcə bu vahid əmri icra etmək kifayətdir:
```bash
cd /var/www/vitelo && git pull origin main && docker compose up -d --build
```

---

## ⚙️ 9. Mühit Dəyişənləri Bələdçisi (`backend/.env`)

```ini
# Database (Supabase PostgreSQL IPv4 Session Pooler)
DATABASE_URL=postgresql+asyncpg://postgres.qxwxpykthyoyfnydsxvn:%25ecLt3VaURe%26aT5@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://qxwxpykthyoyfnydsxvn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis
REDIS_URL=rediss://default:...@fresh-hookworm-66064.upstash.io:6379

# JWT Secret & Expiry
SECRET_KEY=vitelo-super-secret-jwt-key-min-32-chars-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini AI
GEMINI_API_KEY=AIzaSyB3_H5ZNGyCHKPrGukOZ9fgTpVWY1R4Btw

# LemonSqueezy
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
LEMONSQUEEZY_WEBHOOK_SECRET=vitelo-webhook-secret-2024
LEMONSQUEEZY_STORE_ID=94d59cef-dbb8-4ea5-b178-d2540fcd6919
```

---

## 🔒 10. Qızıl Qaydalar (Rules for Future AI & Developers)

1. ⚠️ **Baza Toxunulmazlığı**: `eagle-readonly` və `businesstest-readonly` bazalarına **qətiyyən toxunulmamalıdır**. Yalnız Vitelo bazası (`qxwxpykthyoyfnydsxvn`) istifadə edilməlidir.
2. 🪵 **Mütləq Telemetriya Loqlaması**: Hər bir yeni düymə, API və ya səhifə xətası `app_logs` cədvəlinə yazılmalıdır. İstifadəçi test edərkən AI xətaları birbaşa bazadan oxuyaraq həll etməlidir.
3. 📦 **TypeScript Verbatim Syntax**: Bütün Type importları `import type { ... } from '...'` formatında olmalıdır. `npm run build` hər commit-dən əvvəl 0 xəta ilə tamamlanmalıdır.
4. 🌐 **IPv4 Supabase Pooler**: Birbaşa IPv6 `db.qxwxpykthyoyfnydsxvn.supabase.co` əvəzinə həmişə `aws-0-ap-south-1.pooler.supabase.com:5432` Session Pooler ünvanından istifadə olunmalıdır.
