import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import {
  Sparkles, CheckCircle2, Circle, ExternalLink,
  Award, Star, Clock,
  Cloud, Server, Layout,
} from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  rating: number;
  duration: string;
  level: string;
  url: string;
  color: string;
  description: string;
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
  recommended_course_id?: string;
}

interface CareerRoadmap {
  role_key: string;
  role_title: string;
  description: string;
  icon: string;
  steps: RoadmapStep[];
}

const FALLBACK_ROADMAPS: CareerRoadmap[] = [
  {
    role_key: 'frontend',
    role_title: 'Senior Frontend Engineer',
    description: 'Master modern client-side architectures, TypeScript, performance profiling, and design systems.',
    icon: 'Layout',
    steps: [
      {
        id: 'fe_1',
        title: '1. Advanced TypeScript & Modern React 19',
        description: 'Generics, utility types, React server components, and concurrent rendering.',
        skills: ['TypeScript', 'React.js', 'Next.js', 'Zustand'],
      },
      {
        id: 'fe_2',
        title: '2. Performance Profiling & Web Vitals',
        description: 'Tree-shaking, lazy loading, bundle analysis, and LCP/FID/CLS optimization.',
        skills: ['Vite', 'Lighthouse', 'Core Web Vitals', 'Memory Profiling'],
      },
      {
        id: 'fe_3',
        title: '3. Testing & Design System Governance',
        description: 'Component testing with Vitest/Playwright and accessible Tailwind component libraries.',
        skills: ['Vitest', 'Playwright', 'TailwindCSS', 'Storybook'],
      },
    ],
  },
  {
    role_key: 'backend',
    role_title: 'Backend & Cloud Architect',
    description: 'Design high-throughput APIs, distributed caching, messaging queues, and database scaling.',
    icon: 'Server',
    steps: [
      {
        id: 'be_1',
        title: '1. Async Microservices & High-Concurrency APIs',
        description: 'Async/await paradigms, connection pooling, and RESTful/gRPC protocol design.',
        skills: ['.NET Core / C#', 'Python FastAPI', 'gRPC', 'PostgreSQL'],
      },
      {
        id: 'be_2',
        title: '2. Distributed Caching & Event Messaging',
        description: 'Pub/Sub architectures, Redis caching layers, message queues, and worker offloading.',
        skills: ['Redis', 'RabbitMQ', 'Kafka', 'Celery'],
      },
      {
        id: 'be_3',
        title: '3. Cloud Infrastructure & Container Orchestration',
        description: 'Containerizing services, managing Kubernetes clusters, and IaC provisioning.',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'Azure / AWS'],
      },
    ],
  },
  {
    role_key: 'devops',
    role_title: 'DevOps & SRE Specialist',
    description: 'Automate CI/CD pipelines, container orchestration, multi-cloud infrastructure, and observability.',
    icon: 'Cloud',
    steps: [
      {
        id: 'do_1',
        title: '1. Linux Internals & Containerization',
        description: 'Kernel namespaces, cgroups, multi-stage Docker builds, and network isolation.',
        skills: ['Linux', 'Bash', 'Docker', 'Security Hardening'],
      },
      {
        id: 'do_2',
        title: '2. Kubernetes & Helm Deployment',
        description: 'StatefulSets, Ingress controllers, Helm charts, and service meshes.',
        skills: ['Kubernetes', 'Helm', 'Istio', 'ArgoCD'],
      },
      {
        id: 'do_3',
        title: '3. Observability & SRE Metrics',
        description: 'SLO/SLA dashboards, Prometheus metrics scraping, and Grafana alerting.',
        skills: ['Prometheus', 'Grafana', 'OpenTelemetry', 'ELK Stack'],
      },
    ],
  },
];

const FALLBACK_COURSES: CourseItem[] = [
  {
    id: 'c1',
    title: 'Meta Front-End Developer Professional Certificate',
    provider: 'Coursera (Meta)',
    category: 'Frontend',
    rating: 4.8,
    duration: '40 hours',
    level: 'Beginner to Advanced',
    url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
    color: 'from-blue-500 to-indigo-600',
    description: 'Comprehensive curriculum covering React, modern JavaScript, UI/UX principles, and version control.',
  },
  {
    id: 'c2',
    title: 'Google Cloud DevOps & SRE Professional Certificate',
    provider: 'Google Cloud',
    category: 'DevOps',
    rating: 4.9,
    duration: '35 hours',
    level: 'Intermediate',
    url: 'https://www.coursera.org/professional-certificates/google-cloud-devops-and-sre',
    color: 'from-amber-500 to-orange-600',
    description: 'Learn Kubernetes orchestration, Terraform Infrastructure as Code, CI/CD, and system observability.',
  },
  {
    id: 'c3',
    title: 'System Design Masterclass & Distributed Architecture',
    provider: 'ByteByteGo',
    category: 'Engineering',
    rating: 4.9,
    duration: '25 hours',
    level: 'Senior / Lead',
    url: 'https://bytebytego.com/',
    color: 'from-purple-500 to-violet-600',
    description: 'Master CQRS, event-driven architectures, caching strategies, rate limiting, and database sharding.',
  },
  {
    id: 'c4',
    title: 'Python & FastAPI Production Engineering with Async Architecture',
    provider: 'Udemy',
    category: 'Backend',
    rating: 4.7,
    duration: '20 hours',
    level: 'Intermediate',
    url: 'https://www.udemy.com/',
    color: 'from-emerald-500 to-teal-600',
    description: 'Build asynchronous REST APIs, SQLAlchemy 2.0 ORM, Celery background queues, and Dockerized microservices.',
  },
  {
    id: 'c5',
    title: "CS50's Introduction to Computer Science",
    provider: 'Harvard University (edX)',
    category: 'Foundations',
    rating: 4.9,
    duration: '60 hours',
    level: 'All Levels',
    url: 'https://pll.harvard.edu/course/cs50-introduction-computer-science',
    color: 'from-rose-500 to-red-600',
    description: 'The gold standard of computer science foundations: algorithms, data structures, memory management, and security.',
  },
];

export default function LearningHub() {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>(FALLBACK_ROADMAPS);
  const [courses, setCourses] = useState<CourseItem[]>(FALLBACK_COURSES);
  const [activeRoleKey, setActiveRoleKey] = useState<string>('frontend');
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set(['TypeScript', 'React.js']));

  useEffect(() => {
    api.get('/learning/roadmaps')
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setRoadmaps(res.data); })
      .catch(() => {});

    api.get('/learning/courses')
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setCourses(res.data); })
      .catch(() => {});
  }, []);

  const currentRoadmap = roadmaps.find(r => r.role_key === activeRoleKey) || roadmaps[0];

  const totalSkillsInTrack = currentRoadmap.steps.flatMap(s => s.skills).length;
  const completedInTrack = currentRoadmap.steps.flatMap(s => s.skills).filter(sk => completedSkills.has(sk)).length;
  const progressPct = Math.round((completedInTrack / Math.max(1, totalSkillsInTrack)) * 100);

  const toggleSkill = (skill: string) => {
    setCompletedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  return (
    <DashboardLayout activeKey="learning">
      <div className="max-w-6xl mx-auto pb-16">

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Unlimited Learning & Up-skilling
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Personalized Career Roadmaps & Courses
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Target higher salaries and senior roles with curated skill milestones, verified courses from top institutions (Harvard, Meta, Google), and interactive progress tracking.
            </p>
          </div>
        </div>

        {/* Track Selector Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-x-auto gap-2">
          {roadmaps.map(r => (
            <button
              key={r.role_key}
              onClick={() => setActiveRoleKey(r.role_key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeRoleKey === r.role_key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r.role_key === 'frontend' && <Layout className="w-4 h-4" />}
              {r.role_key === 'backend' && <Server className="w-4 h-4" />}
              {r.role_key === 'devops' && <Cloud className="w-4 h-4" />}
              {r.role_title}
            </button>
          ))}
        </div>

        {/* 2-Column Content */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left Column: Interactive Milestone Roadmap */}
          <div className="lg:col-span-7 space-y-6">

            {/* Roadmap Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{currentRoadmap.role_title} Track</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentRoadmap.description}</p>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {progressPct}% Complete
                </span>
              </div>

              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {completedInTrack} of {totalSkillsInTrack} key technical skills mastered
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-4">
              {currentRoadmap.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Skills Checklist */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      Click to mark skills you know:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.skills.map(sk => {
                        const isDone = completedSkills.has(sk);
                        return (
                          <button
                            key={sk}
                            onClick={() => toggleSkill(sk)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Recommended Online Courses */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  Top Recommended Courses
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Verified Credentials</span>
            </div>

            <div className="space-y-3.5">
              {courses.map(course => (
                <a
                  key={course.id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {course.provider}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {course.rating}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1.5">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration} • {course.level}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      Enroll <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
