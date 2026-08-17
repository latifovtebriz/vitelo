import { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Type,
  Layout,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
} from 'lucide-react';

export interface CVTheme {
  primaryColor: string;
  fontFamily: string;
  template: 'modern' | 'minimal' | 'executive' | 'compact';
}

export const COLOR_PALETTES = [
  { name: 'Electric Blue', value: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Emerald Green', value: '#059669', bg: 'bg-emerald-600' },
  { name: 'Indigo Violet', value: '#4f46e5', bg: 'bg-indigo-600' },
  { name: 'Slate Dark', value: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Crimson Rose', value: '#e11d48', bg: 'bg-rose-600' },
  { name: 'Amber Gold', value: '#d97706', bg: 'bg-amber-600' },
];

export const FONT_OPTIONS = [
  { name: 'Jakarta (Modern)', value: "'Plus Jakarta Sans', sans-serif" },
  { name: 'Inter (Clean)', value: "'Inter', sans-serif" },
  { name: 'Roboto (Tech)', value: "'Roboto', sans-serif" },
  { name: 'JetBrains (Mono)', value: "'JetBrains Mono', monospace" },
  { name: 'Merriweather (Serif)', value: "'Merriweather', serif" },
];

interface LiveCVPreviewProps {
  formData: any;
  theme: CVTheme;
  onThemeChange: (theme: CVTheme) => void;
}

export default function LiveCVPreview({
  formData,
  theme,
  onThemeChange,
}: LiveCVPreviewProps) {
  const [zoom, setZoom] = useState(85);
  const [activeCustomTab, setActiveCustomTab] = useState<'theme' | 'font' | 'template' | null>(null);

  const { personal, experience, education, projects, volunteering, skills, languages } = formData;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 130));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(85);

  return (
    <div className="flex flex-col h-full bg-slate-900/95 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 gap-2">
        {/* Customization Dropdowns */}
        <div className="flex items-center gap-1.5">
          {/* Color Palette Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveCustomTab(activeCustomTab === 'theme' ? null : 'theme')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeCustomTab === 'theme'
                  ? 'bg-slate-800 border-blue-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
              <span>Color</span>
            </button>

            {activeCustomTab === 'theme' && (
              <div className="absolute left-0 mt-2 z-50 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex gap-2">
                {COLOR_PALETTES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      onThemeChange({ ...theme, primaryColor: c.value });
                      setActiveCustomTab(null);
                    }}
                    className={`w-6 h-6 rounded-full ${c.bg} transition-transform hover:scale-110 ${
                      theme.primaryColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Font Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveCustomTab(activeCustomTab === 'font' ? null : 'font')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeCustomTab === 'font'
                  ? 'bg-slate-800 border-blue-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <span>Font</span>
            </button>

            {activeCustomTab === 'font' && (
              <div className="absolute left-0 mt-2 z-50 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl min-w-[170px] space-y-1">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => {
                      onThemeChange({ ...theme, fontFamily: f.value });
                      setActiveCustomTab(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      theme.fontFamily === f.value ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Template Style */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveCustomTab(activeCustomTab === 'template' ? null : 'template')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                activeCustomTab === 'template'
                  ? 'bg-slate-800 border-blue-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{theme.template}</span>
            </button>

            {activeCustomTab === 'template' && (
              <div className="absolute left-0 mt-2 z-50 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl min-w-[160px] space-y-1">
                {[
                  { id: 'modern', name: 'Modern Tech' },
                  { id: 'minimal', name: 'Minimalist ATS' },
                  { id: 'executive', name: 'Executive Classic' },
                  { id: 'compact', name: 'Compact Two-Column' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onThemeChange({ ...theme, template: t.id as any });
                      setActiveCustomTab(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      theme.template === t.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-slate-300 w-9 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Sheet Canvas Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/70">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            fontFamily: theme.fontFamily,
            transition: 'transform 0.15s ease',
          }}
          className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-10 select-text flex flex-col justify-between"
        >
          <div className="space-y-4">
            {/* Header */}
            <div
              className="pb-3 border-b-2"
              style={{ borderColor: theme.template === 'minimal' ? '#e2e8f0' : theme.primaryColor }}
            >
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {personal.name || 'Your Full Name'}
              </h1>
              {personal.headline && (
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{ color: theme.primaryColor }}
                >
                  {personal.headline}
                </div>
              )}

              {/* Contact Icons Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600 font-medium">
                {personal.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {personal.location}
                  </span>
                )}
                {personal.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {personal.phone}
                  </span>
                )}
                {personal.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {personal.email}
                  </span>
                )}
                {personal.linkedin && (
                  <span className="inline-flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-slate-400" />
                    {personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
                {personal.github && (
                  <span className="inline-flex items-center gap-1">
                    <Github className="w-3 h-3 text-slate-400" />
                    {personal.github.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
                {personal.portfolio && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {personal.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {personal.summary && (
              <div className="space-y-1">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Professional Summary
                </h3>
                <p className="text-[10px] leading-relaxed text-slate-700 text-justify">
                  {personal.summary}
                </p>
              </div>
            )}

            {/* Categorized Skills */}
            {skills && Object.values(skills).some((arr: any) => arr && arr.length > 0) && (
              <div className="space-y-1.5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Technical & Soft Skills
                </h3>
                <div className="space-y-1 text-[10px]">
                  {skills.languages_frameworks?.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 min-w-[130px] flex-shrink-0">
                        Languages & Frameworks:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skills.languages_frameworks.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9.5px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skills.devops_cloud?.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 min-w-[130px] flex-shrink-0">
                        DevOps & Cloud:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skills.devops_cloud.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9.5px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skills.databases?.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 min-w-[130px] flex-shrink-0">
                        Databases:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skills.databases.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9.5px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skills.concepts_tools?.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 min-w-[130px] flex-shrink-0">
                        Concepts & Tools:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skills.concepts_tools.map((s: string) => (
                          <span key={s} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9.5px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skills.soft_skills?.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800 min-w-[130px] flex-shrink-0">
                        Soft Skills:
                      </span>
                      <span className="text-slate-700">{skills.soft_skills.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional Experience */}
            {experience && experience.some((e: any) => e.company || e.job_title) && (
              <div className="space-y-2">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Professional Experience
                </h3>
                <div className="space-y-2.5">
                  {experience
                    .filter((e: any) => e.company || e.job_title)
                    .map((exp: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10.5px] font-bold text-slate-900">
                            {exp.company}
                            {exp.location && (
                              <span className="font-normal text-slate-500"> | {exp.location}</span>
                            )}
                          </span>
                          <span className="text-[9.5px] font-semibold text-slate-500">
                            {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date || 'Present'}
                          </span>
                        </div>
                        <div
                          className="text-[10px] font-bold"
                          style={{ color: theme.primaryColor }}
                        >
                          {exp.job_title}
                        </div>
                        {exp.description && (
                          <p className="text-[9.5px] text-slate-700 leading-relaxed pl-2 border-l-2 border-slate-200">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.some((ed: any) => ed.institution || ed.degree) && (
              <div className="space-y-1.5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Education
                </h3>
                <div className="space-y-1.5">
                  {education
                    .filter((ed: any) => ed.institution || ed.degree)
                    .map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-baseline text-[10px]">
                        <div>
                          <div className="font-bold text-slate-900">{edu.institution}</div>
                          <div className="text-slate-600">
                            {edu.degree}
                            {edu.gpa && <span className="font-semibold"> · GPA: {edu.gpa}</span>}
                          </div>
                        </div>
                        <span className="text-[9.5px] font-semibold text-slate-500">
                          {edu.start_date || edu.graduation_year || edu.end_date}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Projects & Research */}
            {projects && projects.some((p: any) => p.title) && (
              <div className="space-y-1.5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Key Projects & Research
                </h3>
                <div className="space-y-1.5">
                  {projects
                    .filter((p: any) => p.title)
                    .map((proj: any, idx: number) => (
                      <div key={idx} className="text-[10px] space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{proj.title}</span>
                          <span className="text-[9.5px] font-semibold text-slate-500">{proj.period}</span>
                        </div>
                        {proj.role && (
                          <div className="font-semibold" style={{ color: theme.primaryColor }}>
                            {proj.role}
                          </div>
                        )}
                        {proj.description && (
                          <p className="text-[9.5px] text-slate-700 leading-tight">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Volunteering & Leadership */}
            {volunteering && volunteering.some((v: any) => v.organization || v.role) && (
              <div className="space-y-1.5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Volunteering & Leadership Experience
                </h3>
                <div className="space-y-1.5">
                  {volunteering
                    .filter((v: any) => v.organization || v.role)
                    .map((vol: any, idx: number) => (
                      <div key={idx} className="text-[10px] space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>
                            {vol.organization}
                            {vol.location && <span className="font-normal text-slate-500"> | {vol.location}</span>}
                          </span>
                          <span className="text-[9.5px] font-semibold text-slate-500">{vol.period}</span>
                        </div>
                        <div className="font-semibold text-slate-700">{vol.role}</div>
                        {vol.description && (
                          <p className="text-[9.5px] text-slate-700 leading-tight">
                            {vol.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.some((l: any) => l.name) && (
              <div className="space-y-1 pt-1">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider border-b pb-0.5"
                  style={{ color: theme.primaryColor, borderColor: '#e2e8f0' }}
                >
                  Languages
                </h3>
                <div className="flex flex-wrap gap-3 text-[10px] text-slate-700">
                  {languages
                    .filter((l: any) => l.name)
                    .map((l: any, idx: number) => (
                      <span key={idx}>
                        <strong>{l.name}:</strong> {l.proficiency}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Clean Footer Watermark */}
          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400">
            <span>Generated with Vitelo AI Career Platform</span>
            <span className="font-bold tracking-widest text-slate-300 uppercase">VITELO.ME</span>
          </div>
        </div>
      </div>
    </div>
  );
}
