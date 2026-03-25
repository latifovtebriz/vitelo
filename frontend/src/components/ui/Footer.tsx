import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'CV Builder', href: '/generate' },
      { label: 'ATS Checker', href: '/checker' },
      { label: 'CV Examples', href: '/examples' },
      { label: 'Templates', href: '/templates' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'AI CV Writing', href: '/generate' },
      { label: 'Cover Letter', href: '/generate' },
      { label: 'Interview Prep', href: '/generate' },
      { label: 'ATS Optimization', href: '/checker' },
      { label: 'Job Match', href: '/generate' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '/#faq' },
      { label: 'Contact Us', href: 'mailto:hello@vitelo.me' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

const LANGUAGES = [
  { flag: '🇬🇧', label: 'English', active: true },
  { flag: '🇦🇿', label: 'Azərbaycan', active: false },
  { flag: '🇹🇷', label: 'Türkçe', active: false },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Vitelo</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              AI-powered CV builder trusted by thousands of job seekers worldwide. Build your perfect CV in minutes.
            </p>

            {/* Language Switcher */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Language</p>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.label}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      lang.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Vitelo.me · All rights reserved
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>for job seekers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
