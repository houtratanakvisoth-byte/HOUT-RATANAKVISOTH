import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Printer, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Code, 
  User, 
  CheckCircle,
  FolderKanban
} from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { getCvData, getSiteSettings } from '../lib/api.js';

const ICON_MAP = {
  User: User,
  Briefcase: Briefcase,
  Code: Code,
  GraduationCap: GraduationCap,
  FolderKanban: FolderKanban,
};

export default function CvPage() {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCvData(),
      getSiteSettings('general')
    ]).then(([cvData, siteData]) => {
      if (mounted) {
        setSections(cvData || []);
        setSettings(siteData || {});
      }
    }).catch((err) => console.error('Error loading CV data:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout showSidebar={false}>
      <div className="space-y-8 max-w-4xl mx-auto">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Curriculum Vitae
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live resume synced directly from PostgreSQL database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>

            {settings.cv_pdf_url && (
              <a
                href={settings.cv_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Resume Sheet Container */}
        <div className="rounded-3xl border p-6 sm:p-10 bg-[var(--bg-card)] border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
          
          {/* Candidate Info Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {settings.author_name || 'Mr. Soth'}
              </h2>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {settings.author_title || 'Senior Software Engineer'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                {settings.author_bio || 'Experienced full-stack engineer building fast, reliable web applications and edge infrastructure.'}
              </p>
            </div>

            {/* Quick Contact Links */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>{settings.contact_email}</span>
                </a>
              )}
              {settings.github_url && (
                <a
                  href={settings.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github.com/mrsoth</span>
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Linkedin className="w-3.5 h-3.5 text-sky-500" />
                  <span>linkedin.com/in/mrsoth</span>
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Sections from cv_sections + cv_items */}
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ) : sections.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No CV sections published yet.</p>
          ) : (
            sections.map((section) => {
              const IconComponent = ICON_MAP[section.icon] || Briefcase;
              return (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-4 pl-1">
                    {(section.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl p-4 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.label}</span>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-600"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 pl-5 leading-relaxed">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        {item.value && (
                          <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 sm:text-right pl-5 sm:pl-0 shrink-0">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}

        </div>

      </div>
    </Layout>
  );
}
