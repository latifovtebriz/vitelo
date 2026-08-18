-- ====================================================================
-- Vitelo Production Database Schema for Supabase PostgreSQL
-- 54 Normalized Relational Tables + Real-Time App Telemetry Logs
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────────────
-- MODUL 1: Auth & Users
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    target_role VARCHAR(255),
    profile_completion INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 2 & 3: CV, Templates & Sections
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cv_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    thumbnail_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_template_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES cv_templates(id) ON DELETE CASCADE,
    primary_color VARCHAR(20) DEFAULT '#2563eb',
    font_family VARCHAR(50) DEFAULT 'Inter',
    font_size VARCHAR(20) DEFAULT 'medium',
    spacing VARCHAR(20) DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS cv_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'My Resume',
    template_id UUID REFERENCES cv_templates(id) ON DELETE SET NULL,
    language_code VARCHAR(10) DEFAULT 'en',
    ats_score INTEGER,
    is_unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_personal_infos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID UNIQUE NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url TEXT,
    portfolio_url TEXT,
    summary TEXT
);

CREATE TABLE IF NOT EXISTS cv_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50),
    is_current BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_experience_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES cv_experiences(id) ON DELETE CASCADE,
    highlight_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    graduation_year VARCHAR(50),
    gpa VARCHAR(20),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    description TEXT,
    project_url TEXT,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date VARCHAR(50),
    expiration_date VARCHAR(50),
    credential_id VARCHAR(100),
    credential_url TEXT,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    proficiency_level VARCHAR(50),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS cv_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS cv_custom_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    section_title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 4: AI & ATS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ats_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    detailed_report JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ats_scan_keyword_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES ats_scans(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    is_present BOOLEAN DEFAULT FALSE,
    count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cv_tailoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_resumes(id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    tailored_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 5: Cover Letter
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cover_letter_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    structure_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_id UUID REFERENCES cv_resumes(id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_description TEXT,
    tone VARCHAR(50) DEFAULT 'Professional & Formal',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letter_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cover_letter_id UUID NOT NULL REFERENCES cover_letters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 6: AI Mock Interview Prep
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    cv_id UUID REFERENCES cv_resumes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_hint TEXT,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interview_user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    user_answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_ai_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID UNIQUE NOT NULL REFERENCES interview_user_answers(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    tips_to_improve TEXT,
    grammar_errors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 7 & 8: Jobs & Kanban Job Tracker
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency VARCHAR(10) DEFAULT 'AZN',
    description TEXT,
    requirements JSONB,
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_saved_jobs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS job_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'Job Search Board',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_tracker_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracker_id UUID NOT NULL REFERENCES job_trackers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    status_key VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS job_tracker_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID NOT NULL REFERENCES job_tracker_columns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(100),
    job_url TEXT,
    notes TEXT,
    applied_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 9, 10, 11, 12: Learning, Billing, Salary, Strategy
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.8,
    duration VARCHAR(50),
    level VARCHAR(50),
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_course_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percentage INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_credit_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    credits_added INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    seniority VARCHAR(50) NOT NULL,
    p25 NUMERIC NOT NULL,
    median NUMERIC NOT NULL,
    p75 NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'AZN',
    sample_size INTEGER DEFAULT 100,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_search_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage_key VARCHAR(50) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- MODUL 13: Real-time Application Telemetry Logs (With 5-Day Auto-Purge)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL DEFAULT 'INFO',
    source VARCHAR(50) NOT NULL DEFAULT 'frontend',
    category VARCHAR(100) NOT NULL DEFAULT 'ui_action',
    message TEXT NOT NULL,
    page_url VARCHAR(255),
    component VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    payload JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_category ON app_logs(category);

-- ────────────────────────────────────────────────────────────────────
-- Seed Initial Data
-- ────────────────────────────────────────────────────────────────────

INSERT INTO roles (name, description) VALUES
('individual', 'Standard individual user'),
('b2b', 'Corporate recruiter or B2B customer'),
('admin', 'System administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cv_templates (name, slug, thumbnail_url, is_premium) VALUES
('Berlin Modern', 'berlin', '/templates/berlin.png', FALSE),
('Zurich Executive', 'zurich', '/templates/zurich.png', TRUE),
('Tokyo Minimalist', 'tokyo', '/templates/tokyo.png', FALSE),
('London Finance', 'london', '/templates/london.png', TRUE),
('San Francisco Tech', 'san-francisco', '/templates/tech.png', FALSE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO job_postings (title, company, location, is_remote, employment_type, salary_min, salary_max, description) VALUES
('Senior .NET Developer', 'Kapital Bank', 'Baku, Azerbaijan', FALSE, 'Full-time', 3000, 4500, 'Design and scale core banking microservices with C#, .NET 9, and PostgreSQL.'),
('Full Stack React / Python Architect', 'PASHA Bank', 'Baku, Azerbaijan', TRUE, 'Full-time', 3500, 5000, 'Lead frontend architecture in React 19, TypeScript, and FastAPI services.'),
('DevOps / Platform Engineer', 'Azercell', 'Baku, Azerbaijan', FALSE, 'Full-time', 2800, 4200, 'Maintain Kubernetes clusters, Terraform IaC, and CI/CD pipelines.')
ON CONFLICT DO NOTHING;
