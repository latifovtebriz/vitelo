# 🚀 Vitelo — Complete Master System Documentation & Architectural Blueprint

> **Notice for AI Models & Developers**: This document is the single source of truth for the entire **Vitelo** ecosystem. It explains every module, database table, backend endpoint, frontend page, third-party integration, deployment pipeline, and operational rule in full detail.

---

## 📌 1. Layihənin İcmalı və Məqsədi (Project Overview)
* **Adı**: Vitelo (AI-Powered Career & Resume Studio)
* **Missiyası**: Namizədlərə beynəlxalq ATS (Applicant Tracking System) standartlarına tam uyğun olan peşəkar CV, Cover Letter hazırlamaq, vakansiyalara 1-kliklə fərdiləşdirilmiş müraciət etmək, süni intellekt ilə müsahibəyə hazırlaşmaq və karyera idarəçiliyini tək platformadan həyata keçirmək imkanı vermək.
* **Canlı Domenlər**:
  - **Frontend (Cloudflare Pages)**: `https://vitelo.me`
  - **Backend API (DigitalOcean VPS)**: `https://api.vitelo.me`
  - **GitHub Repozitoriyası**: `https://github.com/latifovtebriz/vitelo.git` (qol: `main`)

---

## 🏗️ 2. Texnoloji Stek (Technology Stack)

### 🎨 Frontend (`/frontend`)
* **Framework**: React 18 (TypeScript) + Vite 5
* **Stil & UI**: TailwindCSS, Lucide React (ikonlar), PostCSS
* **Dövlət İdarəsi (State Management)**: Zustand (persist dəstəyi ilə):
  - `authStore.ts` — İstifadəçi sessiyası, JWT token və profil
  - `languageStore.ts` — Çoxdilli interfeys (AZ 🇦🇿, EN 🇬🇧, TR 🇹🇷)
  - `cvStore.ts` — Real-time CV redaktoru və ATS balı
* **Şəbəkə Sorğuları**: Axios (`/src/lib/api.ts`) — Avtomatik Bearer Token və Supabase telemetriya interceptorları ilə
* **İxracat**: `html2pdf.js`, `jspdf`, Word (`.doc`) blob generatoru

### ⚙️ Backend (`/backend`)
* **Framework**: Python 3.12+, FastAPI, Uvicorn
* **ORM & Baza**: SQLAlchemy 2.0 (Asyncio) + `asyncpg`
* **Süni İntellekt (AI)**: Google Gemini (`gemini-1.5-flash` modeli) — Google XYZ metrikləri və ATS analizi üçün
* **Təhlükəsizlik & Auth**: JWT (JSON Web Tokens), `passlib` (bcrypt), `python-jose`
* **Arxa Plan İşləri**: Celery + Redis (Upstash)

### 🗄️ Baza & İnfrastruktur (Database & Cloud)
* **PostgreSQL (Supabase)**:
  - **Project Ref**: `qxwxpykthyoyfnydsxvn`
  - **Supabase URL**: `https://qxwxpykthyoyfnydsxvn.supabase.co`
  - **IPv4 Connection Pooler**: `aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
* **Ödəniş Qapısı**: LemonSqueezy Webhooks (`POST /api/v1/billing/webhook`)
* **Server**: DigitalOcean Droplet (`vitelo-backend`, Ubuntu 24.04, Docker & Nginx Reverse Proxy)

---

## 🗃️ 3. Baza Sxemi və Cədvəllər (Database Schema)

### 1. `users` (İstifadəçilər)
| Sütun | Tip | Təsvir |
|---|---|---|
| `id` | UUID (PK) | İstifadəçinin unikal identifikatoru |
| `email` | VARCHAR(255) | Unikal e-poçt ünvanı |
| `password_hash` | VARCHAR(255) | Bcrypt ilə şifrələnmiş parol |
| `full_name` | VARCHAR(255) | İstifadəçinin ad və soyadı |
| `role` | VARCHAR(50) | `individual` və ya `b2b` |
| `credits` | INTEGER | Mövcud balans (CV və sənəd yaratmaq üçün) |
| `target_role` | VARCHAR(255) | Hədəf vəzifə (məs: Senior Fullstack Engineer) |
| `profile_completion`| INTEGER | Profil doluluq faizi (0-100) |
| `api_key` | VARCHAR(64) | B2B müştərilər üçün xüsusi API açarı |
| `is_active` | BOOLEAN | Hesabın aktivlik statusu |
| `created_at` / `updated_at` | TIMESTAMPTZ | Yaradılma və yenilənmə tarixləri |

### 2. `cv_generations` (Yaradılmış CV-lər)
* `id` (UUID, PK), `user_id` (FK -> users.id), `title`, `content` (JSONB strukturlu məlumatlar: Təcrübə, Təhsil, Bacarıqlar, Layihələr, Sertifikatlar).
* `ats_score` (INTEGER 0-100), `template_id` (modern, minimalist, executive, creative, technical).
* `color_theme`, `font_family`, `is_unlocked` (BOOLEAN), `public_slug` (Web CV paylaşımı üçün).

### 3. `cover_letters` (Müşayiət Məktubları)
* `id` (UUID, PK), `user_id` (FK -> users.id), `job_title`, `company_name`, `tone` (Professional, Confident, Modern, Casual), `body_text`, `created_at`.

### 4. `job_tracker` (İş Müraciətləri - Kanban Board)
* `id` (UUID, PK), `user_id` (FK -> users.id), `company`, `role`, `stage` (`wishlist`, `applied`, `interviewing`, `offered`, `rejected`), `salary_offer`, `location`, `job_url`, `notes`, `deadline`.

### 5. `interview_sessions` (AI Müsahibə Hazırlığı)
* `id` (UUID, PK), `user_id` (FK -> users.id), `target_role`, `seniority_level`, `questions_and_answers` (JSONB), `star_feedback`, `overall_score`.

### 6. `salary_insights` (Maaş Analizatoru)
* `id` (UUID, PK), `role_title`, `location`, `min_salary`, `median_salary`, `max_salary`, `currency` (AZN, USD, EUR), `negotiation_scripts`.

### 7. `transactions` (Ödəniş Tarixçəsi və Fakturalar)
* `id` (UUID, PK), `user_id` (FK -> users.id), `order_id` (LemonSqueezy Order ID), `tier` (`basic`, `pro`, `ultimate`, `single_cv`), `amount` (USD), `credits_added`, `status` (`completed`, `refunded`, `failed`), `created_at`.

### 8. `app_logs` (Mərkəzi Telemetriya və Monitorinq Logları)
* **Xüsusiyyət**: Sistemdə baş verən hər bir istifadəçi hərəkəti, düymə klikləri, API xətaları və AI prosesləri bura yazılır. Hər 5 gündən bir köhnə qeydlər avtomatik təmizlənir.
* Sütunlar: `id`, `level` (INFO, WARN, ERROR, ACTION), `category` (auth, cv_generator, payment, client_exception), `user_id`, `user_email`, `page_url`, `component`, `message`, `payload` (JSONB), `created_at`.

---

## 🌐 4. API Endpointləri Xəritəsi (`/api/v1`)

### 🔐 1. Auth (`/api/v1/auth`)
* `POST /register` — Yeni istifadəçi qeydiyyatı, token cütü yaradır.
* `POST /login` — E-poçt və şifrə yoxlanışı, JWT access və refresh token qaytarır.
* `POST /refresh` — Köhnə tokenləri təzələyir.
* `GET /me` — Giriş etmiş istifadəçinin tam profilini və kredit balansını qaytarır.
* `POST /change-password` — Mövcud şifrəni yoxlayıb yenisi ilə əvəz edir.
* `POST /forgot-password` — Şifrəni unutduqda 30 dəqiqəlik kriptoqrafik bərpa tokeni yaradır və `app_logs`-a yazır.
* `POST /reset-password` — Bərpa tokenini yoxlayaraq yeni şifrəni bazada yeniləyir.

### 📄 2. CV Studio (`/api/v1/cv`)
* `POST /generate` — Süni intellektlə tam strukturlaşdırılmış ATS CV yaradır.
* `GET /` — İstifadəçinin bütün CV-lərini siyahılayır.
* `GET /{cv_id}` — Tək bir CV-nin detallarını gətirir.
* `PUT /{cv_id}` — CV məzmununu, şablonunu və rənglərini redaktə edir.
* `DELETE /{cv_id}` — CV-ni silir.
* `POST /tailor/{cv_id}` — Mövcud CV-ni seçilmiş iş elanına uyğunlaşdırır.
* `POST /unlock/{cv_id}` — 1 kredit çıxaraq CV-nin tam ixrac hüququnu aktivləşdirir.

### ✉️ 3. Cover Letter Studio (`/api/v1/cover-letter`)
* `POST /generate` — Vakansiyaya və tona uyğun rəsmi Müşayiət Məktubu yazır.
* `GET /` — Saxlanılmış cover letter-lərin siyahısı.
* `DELETE /{id}` — Məktubu silir.

### 🎯 4. Jobs & Scraper (`/api/v1/jobs`)
* `GET /` — Real vaxt rejimində təklif olunan vakansiyalar siyahısı (Filterlər: Region, Remote, Level).
* `POST /scrape-and-tailor` — LinkedIn, Indeed və s. vakansiya linkini oxuyur, tələbləri təhlil edir və namizədin CV bəndlərini Google XYZ formatında avtomatik gücləndirir.

### 📊 5. Job Tracker (`/api/v1/tracker`)
* `GET /` — İstifadəçinin Kanban lövhəsindəki bütün müraciətləri gətirir.
* `POST /` — Yeni vakansiya müraciəti əlavə edir.
* `PUT /{id}/stage` — Vakansiyanın mərhələsini dəyişir (`wishlist` -> `applied` -> `interviewing` -> `offered` -> `rejected`).
* `DELETE /{id}` — Müraciəti silir.

### 🎤 6. Interview & Salary (`/api/v1/interview`, `/api/v1/salary`)
* `POST /interview/start` — Hədəf vəzifə üzrə AI müsahibə sessiyası başladır.
* `POST /interview/submit-answer` — Cavabı STAR metodu ilə qiymətləndirir və konstruktiv rəy verir.
* `GET /salary/search` — Bazar maaş dərəcələrini və danışıq taktikalarını hesablayır.

### 💳 7. Billing & Monetization (`/api/v1/billing`)
* `POST /webhook` — LemonSqueezy ödəniş təsdiqi və balansın avtomatik artırılması.
* `GET /history` — İstifadəçinin bütün faktura və ödəniş tarixçəsi.
* `GET /credits` — Mövcud kredit qalığı.

### 📡 8. Logs & Health (`/api/v1/logs`, `/api/v1/health`)
* `POST /logs/` — Frontenddən gələn telemetriya və xəta loglarını qəbul edir.
* `GET /health` — PostgreSQL və Redis əlaqələrinin canlılıq vəziyyətini yoxlayır.

---

## 💻 5. Frontend Səhifələri və İnterfeys Xəritəsi

```
frontend/src/
├── pages/
│   ├── Landing.tsx             # Ana Səhifə: 10s Canlı ATS Skaner, Çoxdilli Navbar (AZ/EN/TR), Qiymətlər, FAQ
│   ├── Login.tsx               # Giriş Səhifəsi ("Forgot Password?" keçidi ilə)
│   ├── Register.tsx            # Qeydiyyat Səhifəsi
│   ├── ForgotPassword.tsx      # Şifrə Bərpası Sorğusu Səhifəsi (/forgot-password)
│   ├── ResetPassword.tsx       # Yeni Şifrə Təyini Səhifəsi (/reset-password?token=...)
│   ├── Dashboard.tsx           # Əsas İdarəetmə Paneli: Metrikalar, Son CV-lər, Sürətli Keçidlər
│   ├── GenerateCV.tsx          # İnteraktiv 2-Sütunlu CV Studiyası (Canlı ATS Balı, XYZ köməkçisi, PDF ixracı)
│   ├── GenerateCoverLetter.tsx # Cover Letter Redaktoru: Word (.doc), PDF və .txt ixracatı
│   ├── Documents.tsx           # Bütün CV və Məktubların mərkəzi arxivi (Rename, Duplicate, Delete)
│   ├── JobTracker.tsx          # Drag-and-Drop Kanban Lövhəsi (Wishlist, Applied, Interviewing, Offered)
│   ├── InterviewPrep.tsx       # AI Müsahibə Simulyatoru (STAR Qiymətləndirməsi)
│   ├── SalaryAnalyzer.tsx      # Maaş Kalkulyatoru və Bazar İnsaytları
│   ├── Jobs.tsx                # İş Elanları Mərkəzi (1-Kliklə CV Uyğunlaşdırma)
│   ├── JobSearchMethod.tsx     # 5 Addımlıq Strukturlaşdırılmış İş Axtarış Metodologiyası
│   ├── LearningHub.tsx         # Karyera Video Təlimləri və Sertifikatlar
│   ├── DashboardPricing.tsx    # Qiymət Planları və LemonSqueezy Checkout Tətiyi
│   ├── Account.tsx             # Profil Tənzimləmələri, Şifrə Dəyişmə və Ödəniş Tarixçəsi Cədvəli
│   ├── SystemLogs.tsx          # Real-time Telemetriya Log Baxışı (/logs)
│   └── PublicWebCV.tsx         # QR Kod və Açıq Link ilə Paylaşılan Veb CV (/p/:id)
```

---

## 💰 6. Qiymət Siyasəti və Paket Limitləri (Monetization Rules)

1. **İlk İstifadəçi Qaydası**: İlk qeydiyyatdan sonra **1 Pulsuz CV ixracı** təqdim olunur (Basic şablonlar).
2. **Single CV Unlock**: **$3.99 / kredit**.
3. **Basic Plan ($4.99)**:
   - Maksimum **3 CV + 3 Cover Letter** (3 kredit).
   - Minimalist və Modern şablonlar, Clean PDF ixracı, Web CV & QR paylaşımı.
4. **Pro Plan ($7.99)**:
   - Maksimum **5 CV + 5 Cover Letter** (5 kredit).
   - Bütün Pro Şablonlar, 1-Klik Vakansiya Linki Uyğunlaşdırma, Dərin ATS Auditi.
5. **Ultimate Plan ($12.99)**:
   - Maksimum **8 CV + 8 Cover Letter** (8 kredit).
   - Bütün şablonlar, AI Çoxdilli Tərcüməçi (AZ/EN/TR/DE/RU), LinkedIn Profil Optimizatoru, 5 Mock Müsahibə Sessiyası, Maaş Analizatoru.

---

## 🚢 7. Canlı Server və Deployment Təlimatları

### 1. Frontend Deployment (Cloudflare Pages):
* Hər dəfə GitHub-ın `main` qoluna `git push` edildikdə Cloudflare Pages avtomatik olaraq `npm run build` əmrini icra edir və saniyələr içində `https://vitelo.me` üzərində canlıya çıxarır.

### 2. Backend Deployment (DigitalOcean VPS):
* Server: `209.38.213.29` (DigitalOcean Droplet `vitelo-backend`)
* Layihə Yolu: `/var/www/vitelo`
* **Serveri 1 Əmrlə Yeniləmək**:
  DigitalOcean panelindən **"Web Console"** açaraq bu əmri icra etmək kifayətdir:
  ```bash
  cd /var/www/vitelo && git pull origin main && docker compose up -d --build
  ```

---

## 🛡️ 8. Mühüm Təhlükəsizlik və İnkişaf Qaydaları
1. **MCP və Baza Toxunulmazlığı**: Hazırda sistemə qoşulmuş `eagle-readonly` və `businesstest-readonly` bazalarına qətiyyən toxunulmamalıdır. Yalnız Vitelo bazası (`qxwxpykthyoyfnydsxvn`) istifadə olunur.
2. **Loqlama Prinsipləri**: Hər bir yeni yazılan funksionallıq `logger.action` və ya `AppLog` ilə `app_logs` cədvəlinə telemetriya göndərməlidir ki, test zamanı problemlər dərhal bazadan izlənə bilsin.
3. **IPv4 Pooler İstifadəsi**: Lokal mühitdə və serverlərdə birbaşa IPv6 `db.xxx` yerinə Supabase Session Pooler `aws-0-ap-south-1.pooler.supabase.com:5432` istifadə edilir.
