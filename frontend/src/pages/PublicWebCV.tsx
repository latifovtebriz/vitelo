import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { logger } from '../lib/logger';
import {
  Download,
  Share2,
  QrCode,
  Check,
  Sparkles,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  FileCheck,
  X,
  Loader2,
  AlertCircle,
  Copy,
} from 'lucide-react';

export default function PublicWebCV() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/cv/public/${id}`)
      .then((res) => {
        setCvData(res.data);
        // Log telemetry event to Supabase
        logger.action('PublicWebCV', 'Recruiter View Profile', {
          cv_id: id,
          title: res.data.title,
          referrer: document.referrer || 'direct',
        });
      })
      .catch((err) => {
        console.error('Failed to load public CV:', err);
        setError('This CV profile is not found or has been made private.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-sm font-semibold text-slate-300">Loading candidate profile...</p>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">CV Profile Unavailable</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Unable to load resume.'}</p>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Go to Vitelo Home
          </Link>
        </div>
      </div>
    );
  }

  const raw = cvData.cv_data || {};
  const personal = raw.personal || {};
  const experience = raw.experience || [];
  const education = raw.education || [];
  const projects = raw.projects || [];
  const volunteering = raw.volunteering || [];
  const skills = raw.skills || {};
  const languages = raw.languages || [];
  const downloadUrl = cvData.clean_pdf_url || cvData.watermarked_pdf_url;

  // Flatten technical skills
  const technicalSkillsList: string[] = Array.isArray(skills.technical)
    ? skills.technical
    : [
        ...(skills.languages_frameworks || []),
        ...(skills.devops_cloud || []),
        ...(skills.databases || []),
        ...(skills.concepts_tools || []),
      ];

  const softSkillsList: string[] = Array.isArray(skills.soft)
    ? skills.soft
    : skills.soft_skills || [];

  return (
    <div className="min-h-screen bg-slate-100/90 font-sans flex flex-col antialiased">
      {/* Floating Action Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">Vitelo</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Verified Digital Resume
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share
                </>
              )}
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
              title="View Mobile QR Code"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
            </button>

            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            ) : (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Print / Save
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Resume Sheet View */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {personal.name || cvData.title || 'Candidate Profile'}
                </h1>
                <p className="text-blue-300 text-base font-semibold mt-1">
                  {personal.headline || raw.target_job || 'Professional'}
                </p>
              </div>

              {cvData.ats_score && (
                <div className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold shadow-sm">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  ATS Verified {cvData.ats_score}%
                </div>
              )}
            </div>

            {/* Contact Pills */}
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-6 pt-6 border-t border-white/10 text-xs text-slate-300 font-medium">
              {personal.email && (
                <a
                  href={`mailto:${personal.email}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> {personal.email}
                </a>
              )}
              {personal.phone && (
                <a
                  href={`tel:${personal.phone}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> {personal.phone}
                </a>
              )}
              {personal.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {personal.location}
                </span>
              )}
              {personal.linkedin && (
                <a
                  href={
                    personal.linkedin.startsWith('http')
                      ? personal.linkedin
                      : `https://${personal.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
                </a>
              )}
              {personal.github && (
                <a
                  href={
                    personal.github.startsWith('http')
                      ? personal.github
                      : `https://${personal.github}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-blue-400" /> GitHub
                </a>
              )}
              {personal.portfolio && (
                <a
                  href={
                    personal.portfolio.startsWith('http')
                      ? personal.portfolio
                      : `https://${personal.portfolio}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Resume Body */}
          <div className="p-8 sm:p-10 space-y-9 text-slate-800">
            {/* Summary */}
            {personal.summary && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-3 pb-1.5 border-b border-blue-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Professional Summary
                </h2>
                <p className="text-sm leading-relaxed text-slate-700 font-normal">
                  {personal.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-5 pb-1.5 border-b border-blue-100 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Work Experience
                </h2>

                <div className="space-y-6">
                  {experience.map((exp: any, i: number) => (
                    <div key={i} className="pl-4 border-l-2 border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {exp.job_title}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500">
                          {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-blue-700 mb-2">
                        {exp.company} {exp.location ? `· ${exp.location}` : ''}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-5 pb-1.5 border-b border-blue-100 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </h2>

                <div className="space-y-4">
                  {education.map((edu: any, i: number) => (
                    <div key={i} className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {edu.degree}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600">
                          {edu.institution} {edu.location ? `· ${edu.location}` : ''}
                        </p>
                        {edu.gpa && <p className="text-xs text-slate-400 mt-0.5">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-xs text-slate-500 font-bold">
                        {edu.graduation_year || edu.start_date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-5 pb-1.5 border-b border-blue-100 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5" /> Key Projects & Initiatives
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((proj: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {proj.title}
                        </h3>
                        {proj.period && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {proj.period}
                          </span>
                        )}
                      </div>
                      {proj.role && (
                        <p className="text-xs font-bold text-indigo-600 mb-1.5">{proj.role}</p>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills */}
            {technicalSkillsList.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-4 pb-1.5 border-b border-blue-100 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Technical Skills & Tools
                </h2>

                <div className="flex flex-wrap gap-2">
                  {technicalSkillsList.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills & Languages */}
            {(softSkillsList.length > 0 || languages.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {softSkillsList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                      Core Competencies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {softSkillsList.map((s: string) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteering */}
                {volunteering && volunteering.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">
                      Volunteering & Leadership
                    </h3>
                    <div className="space-y-3 text-xs text-slate-700">
                      {volunteering.map((v: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">{v.role || v.organization}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{v.period}</span>
                          </div>
                          {v.role && <p className="text-blue-600 font-semibold mb-1">{v.organization}</p>}
                          {v.description && <p className="text-slate-600 leading-relaxed">{v.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Scan Mobile Resume</h3>
            <p className="text-xs text-slate-500 mb-6">
              Recruiters can scan this QR code with their mobile camera to view this CV instantly.
            </p>

            {/* Quick SVG QR code visual */}
            <div className="w-48 h-48 bg-slate-50 rounded-2xl border border-slate-200 p-3 mx-auto mb-6 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.href
                )}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="py-8 px-4 text-center text-xs text-slate-400">
        <p>
          Generated with{' '}
          <Link to="/" className="font-extrabold text-blue-600 hover:underline">
            Vitelo AI Resume Builder
          </Link>{' '}
          · ATS-Optimized Digital Portfolios
        </p>
      </footer>
    </div>
  );
}
