export interface ExampleCVProfile {
  slug: string;
  title: string;
  industry: 'Tech' | 'Business' | 'Healthcare' | 'Education' | 'Creative';
  ats_score: number;
  badge?: string;
  emoji: string;
  popular: boolean;
  personal: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github?: string;
    portfolio?: string;
    summary: string;
  };
  experience: {
    job_title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    location: string;
    start_date: string;
    end_date: string;
    graduation_year: string;
    gpa?: string;
  }[];
  projects?: {
    title: string;
    role: string;
    period: string;
    description: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications?: string[];
  languages: {
    name: string;
    proficiency: string;
  }[];
}

export const EXAMPLE_PROFILES: Record<string, ExampleCVProfile> = {
  'software-engineer': {
    slug: 'software-engineer',
    title: 'Software & DevOps Engineer',
    industry: 'Tech',
    ats_score: 96,
    badge: '🏆 Highly Rated',
    emoji: '💻',
    popular: true,
    personal: {
      name: 'Tabriz Latifov',
      headline: 'Software & DevOps Engineer | .NET, Microservices & Cloud Architectures',
      email: 'latifovtebriz@gmail.com',
      phone: '+994 50 789 52 82',
      location: 'Baku, Azerbaijan',
      linkedin: 'linkedin.com/in/tabrizlatifov',
      github: 'github.com/latifovtebriz',
      portfolio: 'tabrizlatifov.dev',
      summary:
        'Software Engineer with 4+ years of experience specializing in the .NET ecosystem, microservices architecture, and DevOps practices. Proven track record in designing scalable systems, automating CI/CD pipelines, and managing cloud infrastructure. Experienced in working within remote, cross-functional international teams with high communication and problem-solving skills.',
    },
    experience: [
      {
        job_title: 'Full Stack .NET Developer',
        company: 'VLand Systems',
        location: 'Sumgayit, Azerbaijan (Hybrid)',
        start_date: 'Nov 2024',
        end_date: 'Present',
        is_current: true,
        description:
          'Engineered resilient RESTful APIs and backend microservices using .NET 8, ASP.NET Core, and PostgreSQL. Reduced query latency by 45% through Redis caching and query plan indexing. Configured automated CI/CD pipelines via Azure DevOps and GitHub Actions.',
      },
      {
        job_title: 'Software Engineer',
        company: 'TIC Solutions',
        location: 'United States (Remote)',
        start_date: 'May 2021',
        end_date: 'Nov 2024',
        is_current: false,
        description:
          'Designed enterprise web applications with ASP.NET Core Web API, Entity Framework, and SQL Server. Implemented event-driven message queues with RabbitMQ and automated integration testing with xUnit.',
      },
    ],
    education: [
      {
        institution: 'Baku Engineering University',
        degree: 'Bachelor of Science in Computer Engineering',
        location: 'Baku, Azerbaijan',
        start_date: 'Sep 2022',
        end_date: 'Jun 2026',
        graduation_year: '2026',
        gpa: '3.8 / 4.0',
      },
    ],
    projects: [
      {
        title: 'High-Throughput Microservices Platform',
        role: 'Lead Architect',
        period: '2024',
        description:
          'Built distributed microservices architecture utilizing CQRS, Clean Architecture, RabbitMQ, and Docker Compose with 99.98% service uptime.',
      },
    ],
    skills: {
      technical: [
        'C#',
        '.NET Core',
        '.NET 8',
        'ASP.NET Core Web API',
        'Entity Framework',
        'PostgreSQL',
        'Microsoft SQL Server',
        'Redis',
        'Docker',
        'Kubernetes',
        'RabbitMQ',
        'Azure DevOps',
        'Clean Architecture',
        'CQRS',
      ],
      soft: ['Cross-Functional Leadership', 'Problem Solving', 'Agile/Scrum', 'System Design'],
    },
    certifications: [
      'Microsoft Certified: Azure Developer Associate',
      'Docker & Kubernetes Certified Practitioner',
    ],
    languages: [
      { name: 'Azerbaijani', proficiency: 'Native' },
      { name: 'English', proficiency: 'Professional Working' },
      { name: 'Turkish', proficiency: 'Fluent' },
    ],
  },
  'frontend-developer': {
    slug: 'frontend-developer',
    title: 'Senior Frontend Developer',
    industry: 'Tech',
    ats_score: 95,
    badge: '⚡ Top Choice',
    emoji: '🎨',
    popular: true,
    personal: {
      name: 'Maria Chen',
      headline: 'Senior Frontend Developer | React, TypeScript & Web Performance',
      email: 'maria.chen@email.com',
      phone: '+44 7700 900123',
      location: 'London, United Kingdom',
      linkedin: 'linkedin.com/in/mariachen-fe',
      github: 'github.com/mariachen',
      portfolio: 'mariachen.design',
      summary:
        'Frontend Engineer with 5+ years of experience building high-performance web applications with React, Next.js, and TypeScript. Specializes in design systems, Web Vitals optimization (improving Lighthouse scores from 55 to 98), and accessible UI architectures (WCAG 2.1 AA).',
    },
    experience: [
      {
        job_title: 'Senior Frontend Engineer',
        company: 'Fintech Scaleup UK',
        location: 'London, UK (Hybrid)',
        start_date: 'Jan 2022',
        end_date: 'Present',
        is_current: true,
        description:
          'Architected unified design system and reusable component library in React/TypeScript adopted across 5 product teams. Reduced bundle size by 38% and cut page load times from 3.2s to 850ms.',
      },
      {
        job_title: 'Frontend Developer',
        company: 'WebStudio London',
        location: 'London, UK',
        start_date: 'Jun 2019',
        end_date: 'Dec 2021',
        is_current: false,
        description:
          'Built responsive SPAs for over 15 clients with Next.js, Tailwind CSS, and REST/GraphQL APIs. Implemented end-to-end automated testing with Cypress and Jest.',
      },
    ],
    education: [
      {
        institution: 'Imperial College London',
        degree: 'B.Sc. in Computing & Web Technologies',
        location: 'London, UK',
        start_date: 'Sep 2016',
        end_date: 'Jun 2019',
        graduation_year: '2019',
      },
    ],
    skills: {
      technical: [
        'React.js',
        'Next.js',
        'TypeScript',
        'JavaScript (ES6+)',
        'Tailwind CSS',
        'Redux Toolkit',
        'Zustand',
        'GraphQL',
        'Webpack / Vite',
        'Jest / React Testing Library',
        'Figma to Code',
      ],
      soft: ['UX Empathy', 'Design Systems Thinking', 'Mentorship', 'Code Review'],
    },
    certifications: ['Meta Certified Front-End Developer', 'Google UX Design Certificate'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Mandarin', proficiency: 'Fluent' },
    ],
  },
  'devops-engineer': {
    slug: 'devops-engineer',
    title: 'Cloud & DevOps Engineer',
    industry: 'Tech',
    ats_score: 97,
    badge: '☁️ Cloud Expert',
    emoji: '⚙️',
    popular: true,
    personal: {
      name: 'Marcus Vance',
      headline: 'DevOps & Site Reliability Engineer | Kubernetes, Terraform, AWS',
      email: 'marcus.vance@cloudeng.io',
      phone: '+1 (415) 890-4321',
      location: 'Austin, TX, USA',
      linkedin: 'linkedin.com/in/marcusvance-devops',
      github: 'github.com/marcusvance',
      summary:
        'DevOps Engineer with 6+ years automating multi-cloud infrastructure, deploying resilient Kubernetes clusters, and architecting zero-downtime CI/CD delivery pipelines. Slashed cloud infrastructure spend by $240K/year and increased deployment frequency by 8x.',
    },
    experience: [
      {
        job_title: 'Senior DevOps / SRE Lead',
        company: 'CloudNative Corp',
        location: 'Austin, TX',
        start_date: 'Mar 2021',
        end_date: 'Present',
        is_current: true,
        description:
          'Spearheaded migration of 80+ microservices to Amazon EKS using Terraform and Helm. Established GitOps deployment workflows via ArgoCD and real-time observability with Prometheus, Grafana, and Datadog.',
      },
      {
        job_title: 'Cloud Systems Engineer',
        company: 'Nexus Data Inc',
        location: 'San Jose, CA',
        start_date: 'Aug 2018',
        end_date: 'Feb 2021',
        is_current: false,
        description:
          'Automated cloud provisioning with Terraform and Ansible across AWS and Azure. Managed Linux server fleets, SSL/TLS certificates, and VPC network security configurations.',
      },
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'B.S. in Electrical and Computer Engineering',
        location: 'Austin, TX',
        start_date: '2014',
        end_date: '2018',
        graduation_year: '2018',
      },
    ],
    skills: {
      technical: [
        'Docker',
        'Kubernetes (EKS, AKS)',
        'Terraform',
        'AWS (EC2, S3, IAM, CloudFront)',
        'CI/CD (GitHub Actions, GitLab CI)',
        'ArgoCD',
        'Prometheus & Grafana',
        'Linux / Bash',
        'Python Scripting',
        'Ansible',
        'Nginx',
      ],
      soft: ['Incident Management', 'Root Cause Analysis', 'On-Call Response', 'DevSecOps Culture'],
    },
    certifications: [
      'AWS Certified DevOps Engineer – Professional',
      'Certified Kubernetes Administrator (CKA)',
      'HashiCorp Certified: Terraform Associate',
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'German', proficiency: 'Conversational' },
    ],
  },
  'data-scientist': {
    slug: 'data-scientist',
    title: 'Lead Data Scientist & ML Engineer',
    industry: 'Tech',
    ats_score: 96,
    badge: '📊 AI / ML',
    emoji: '🧠',
    popular: true,
    personal: {
      name: 'Dr. Elena Rostova',
      headline: 'Lead Data Scientist | Machine Learning, NLP & Predictive Analytics',
      email: 'elena.rostova@datascience.org',
      phone: '+49 176 98765432',
      location: 'Berlin, Germany',
      linkedin: 'linkedin.com/in/elena-rostova-phd',
      github: 'github.com/elenarostova',
      summary:
        'Data Scientist with a PhD in Applied Mathematics and 5+ years building and deploying production machine learning models. Designed real-time recommendation and fraud detection engines serving 10M+ users with measurable 28% revenue uplift.',
    },
    experience: [
      {
        job_title: 'Lead Machine Learning Scientist',
        company: 'Fintech AI Solutions',
        location: 'Berlin, Germany',
        start_date: 'Apr 2021',
        end_date: 'Present',
        is_current: true,
        description:
          'Trained and deployed deep learning and gradient boosted models (XGBoost, PyTorch) for real-time credit scoring, reducing default rates by 19% while maintaining 99.4% inference uptime.',
      },
      {
        job_title: 'Data Scientist',
        company: 'E-Commerce Global',
        location: 'Munich, Germany',
        start_date: 'Sep 2018',
        end_date: 'Mar 2021',
        is_current: false,
        description:
          'Engineered personalized product ranking algorithms improving checkout conversion by 14%. Designed A/B testing frameworks and automated reporting dashboards in Tableau and Streamlit.',
      },
    ],
    education: [
      {
        institution: 'Technical University of Munich (TUM)',
        degree: 'PhD in Applied Mathematics & Machine Learning',
        location: 'Munich, Germany',
        start_date: '2014',
        end_date: '2018',
        graduation_year: '2018',
      },
    ],
    skills: {
      technical: [
        'Python',
        'PyTorch',
        'TensorFlow',
        'Scikit-learn',
        'SQL (PostgreSQL, BigQuery)',
        'Pandas & NumPy',
        'MLOps (MLflow, Kubeflow)',
        'Docker',
        'Spark / PySpark',
        'Tableau',
        'Statistics & A/B Testing',
      ],
      soft: ['Business Translation', 'Data Storytelling', 'Research Methodology', 'Mentoring'],
    },
    certifications: [
      'AWS Certified Machine Learning – Specialty',
      'DeepLearning.AI TensorFlow Developer Specialization',
    ],
    languages: [
      { name: 'English', proficiency: 'Fluent (C2)' },
      { name: 'German', proficiency: 'Professional (B2)' },
      { name: 'Russian', proficiency: 'Native' },
    ],
  },
  'product-manager': {
    slug: 'product-manager',
    title: 'Senior Product Manager',
    industry: 'Business',
    ats_score: 95,
    badge: '🚀 Growth & Scale',
    emoji: '🗺️',
    popular: true,
    personal: {
      name: 'Sarah Jenkins',
      headline: 'Senior Product Manager | SaaS Growth, B2B Platforms & User Experience',
      email: 'sarah.jenkins@productlead.co',
      phone: '+1 (212) 555-7890',
      location: 'New York, NY, USA',
      linkedin: 'linkedin.com/in/sarahjenkins-pm',
      summary:
        'Customer-centric Product Leader with 6+ years driving product strategy, roadmaps, and lifecycle execution for enterprise SaaS products. Scaled ARR from $4M to $18M while increasing net retention by 22% through data-driven feature prioritization.',
    },
    experience: [
      {
        job_title: 'Senior Product Manager',
        company: 'HyperGrowth SaaS',
        location: 'New York, NY',
        start_date: 'Jan 2022',
        end_date: 'Present',
        is_current: true,
        description:
          'Owned core subscription product vision and led a cross-functional squad of 12 engineers, designers, and marketers. Launched self-serve onboarding flow which boosted activation by 34%.',
      },
      {
        job_title: 'Product Manager',
        company: 'VentureApp Inc',
        location: 'Boston, MA',
        start_date: 'Jun 2018',
        end_date: 'Dec 2021',
        is_current: false,
        description:
          'Conducted 100+ user interviews to define PRDs and user stories. Managed agile sprints in Jira, leading to 95% on-time release consistency.',
      },
    ],
    education: [
      {
        institution: 'Columbia University',
        degree: 'B.A. in Economics & Information Systems',
        location: 'New York, NY',
        start_date: '2014',
        end_date: '2018',
        graduation_year: '2018',
      },
    ],
    skills: {
      technical: [
        'Product Strategy',
        'Roadmapping',
        'User Research',
        'Data Analytics (Amplitude, Mixpanel)',
        'SQL Queries',
        'A/B Testing',
        'Agile/Scrum',
        'Jira & Confluence',
        'Figma',
      ],
      soft: ['Executive Stakeholder Management', 'Cross-Functional Alignment', 'Negotiation', 'Empathy'],
    },
    certifications: ['Pragmatic Institute Certified (PMC-III)', 'Certified Scrum Product Owner (CSPO)'],
    languages: [{ name: 'English', proficiency: 'Native' }],
  },
  'financial-analyst': {
    slug: 'financial-analyst',
    title: 'Senior Financial Analyst',
    industry: 'Business',
    ats_score: 96,
    badge: '📈 Corporate Finance',
    emoji: '📊',
    popular: true,
    personal: {
      name: 'James Thornton',
      headline: 'Senior Financial Analyst | FP&A, DCF Modeling & Strategic Planning',
      email: 'j.thornton@financecorp.com',
      phone: '+44 20 7946 0912',
      location: 'London, UK',
      linkedin: 'linkedin.com/in/jamesthornton-cfa',
      summary:
        'CFA Charterholder with 5+ years of experience in Corporate FP&A and Investment Valuation. Built financial forecasts for $500M+ revenue portfolios, delivering variance analysis and strategic M&A valuation models for executive leadership.',
    },
    experience: [
      {
        job_title: 'Senior Financial Analyst (FP&A)',
        company: 'Barclays International',
        location: 'London, UK',
        start_date: 'Jul 2021',
        end_date: 'Present',
        is_current: true,
        description:
          'Led annual budgeting and quarterly forecasting for UK retail banking division ($320M P&L). Automated monthly variance dashboards in Power BI and SQL, saving 25 hours per closing cycle.',
      },
      {
        job_title: 'Financial Analyst',
        company: 'Deloitte Corporate Finance',
        location: 'London, UK',
        start_date: 'Sep 2018',
        end_date: 'Jun 2021',
        is_current: false,
        description:
          'Constructed 3-statement financial models, DCF valuations, and sensitivity tables for 8 M&A advisory transactions valued at over $1.2B total.',
      },
    ],
    education: [
      {
        institution: 'London School of Economics (LSE)',
        degree: 'B.Sc. in Accounting & Finance',
        location: 'London, UK',
        start_date: '2015',
        end_date: '2018',
        graduation_year: '2018',
      },
    ],
    skills: {
      technical: [
        'Advanced Financial Modeling (DCF, LBO, 3-Statement)',
        'FP&A',
        'Budgeting & Forecasting',
        'Advanced Excel (VBA, Macros)',
        'Power BI / Tableau',
        'SQL for Finance',
        'Bloomberg Terminal',
        'ERP Systems (SAP, NetSuite)',
      ],
      soft: ['Executive Presentations', 'Quantitative Rigor', 'Analytical Thinking', 'Risk Assessment'],
    },
    certifications: ['CFA (Chartered Financial Analyst)', 'FMVA (Financial Modeling & Valuation Analyst)'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'French', proficiency: 'Professional' },
    ],
  },
};
