export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  popular: string[];
  all: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'languages_frameworks',
    name: 'Languages & Frameworks',
    description: 'Programming languages, runtime environments, and core libraries',
    popular: ['C#', '.NET Core', 'ASP.NET MVC', 'Web API', 'JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Python', 'FastAPI', 'Java', 'Go'],
    all: [
      'C#', '.NET Core', '.NET 8', '.NET 9', 'ASP.NET MVC', 'ASP.NET Core', 'Web API', 'Entity Framework', 'LINQ', 'WPF', 'Blazor',
      'JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Node.js', 'Express.js', 'NestJS', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
      'Python', 'FastAPI', 'Django', 'Flask', 'Pandas', 'NumPy', 'PyTorch', 'TensorFlow',
      'Go', 'Golang', 'Java', 'Spring Boot', 'Kotlin', 'Rust', 'C++', 'C', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Swift', 'Flutter', 'Dart',
      'HTML5', 'CSS3', 'Tailwind CSS', 'SASS/SCSS', 'Bootstrap', 'GraphQL', 'RESTful API'
    ]
  },
  {
    id: 'devops_cloud',
    name: 'DevOps & Cloud',
    description: 'Infrastructure, containers, orchestrators, and CI/CD tools',
    popular: ['Azure DevOps', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'ELK Stack', 'Linux OS', 'AWS', 'CI/CD'],
    all: [
      'Azure DevOps', 'Docker', 'Docker Compose', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Puppet', 'Chef',
      'Prometheus', 'Grafana', 'ELK Stack', 'Elasticsearch', 'Logstash', 'Kibana', 'Datadog', 'Splunk', 'New Relic',
      'Linux OS', 'Ubuntu', 'Debian', 'CentOS', 'Red Hat (RHEL)', 'Bash Scripting', 'PowerShell',
      'AWS (Amazon Web Services)', 'AWS EC2', 'AWS S3', 'AWS Lambda', 'AWS ECS', 'AWS EKS',
      'Microsoft Azure', 'Azure App Service', 'Azure Kubernetes (AKS)', 'Google Cloud Platform (GCP)', 'Cloudflare',
      'CI/CD Pipelines', 'GitHub Actions', 'GitLab CI/CD', 'Jenkins', 'ArgoCD', 'Nginx', 'Apache', 'Traefik'
    ]
  },
  {
    id: 'databases',
    name: 'Databases & Caching',
    description: 'Relational, NoSQL, in-memory, and search database engines',
    popular: ['Microsoft SQL Server', 'PostgreSQL', 'Redis', 'Oracle Database', 'MongoDB', 'MySQL', 'SQLite'],
    all: [
      'Microsoft SQL Server', 'T-SQL', 'PostgreSQL', 'pgSQL', 'Redis', 'Oracle Database', 'PL/SQL',
      'MongoDB', 'MySQL', 'MariaDB', 'SQLite', 'Cassandra', 'DynamoDB', 'Supabase', 'Firebase Firestore',
      'Neo4j', 'CouchDB', 'InfluxDB', 'CockroachDB', 'ClickHouse', 'Database Indexing & Optimization', 'Database Replication'
    ]
  },
  {
    id: 'concepts_tools',
    name: 'Concepts & Architecture',
    description: 'Architectural patterns, engineering methodologies, and tools',
    popular: ['Microservices', 'Web APIs', 'Clean Architecture', 'CQRS', 'RabbitMQ', 'Agile/Scrum', 'Git', 'SOLID Principles'],
    all: [
      'Microservices', 'Clean Architecture', 'Domain-Driven Design (DDD)', 'CQRS', 'Event Sourcing', 'Event-Driven Architecture',
      'RabbitMQ', 'Apache Kafka', 'gRPC', 'WebSockets', 'Message Queues', 'Service Mesh',
      'SOLID Principles', 'Design Patterns', 'Object-Oriented Programming (OOP)', 'Functional Programming',
      'Test-Driven Development (TDD)', 'Unit Testing', 'Integration Testing', 'Jest', 'xUnit', 'NUnit', 'Postman',
      'Agile/Scrum', 'Kanban', 'Jira', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Code Review'
    ]
  },
  {
    id: 'soft_skills',
    name: 'Soft Skills',
    description: 'Interpersonal, management, and problem-solving capabilities',
    popular: [
      'Problem Solving & Analytical Thinking',
      'Self-Management & Adaptability',
      'Effective Communication (Remote/Async)',
      'Team Collaboration & Mentorship',
      'Critical Thinking',
      'Time Management',
      'Creative Innovation'
    ],
    all: [
      'Problem Solving & Analytical Thinking',
      'Self-Management & Adaptability',
      'Effective Communication (Remote/Async)',
      'Team Collaboration & Mentorship',
      'Critical Thinking',
      'Time Management',
      'Creative Innovation',
      'Leadership',
      'Conflict Resolution',
      'Cross-Functional Collaboration',
      'Active Listening',
      'Decision Making',
      'Work Ethic & Ownership'
    ]
  }
];

export const JOB_TITLE_SUGGESTIONS = [
  'Software and DevOps Engineer',
  'Software Engineer',
  'DevOps and SRE Engineer',
  'Senior Backend Engineer',
  'Frontend Developer',
  'Full Stack Developer',
  'Cloud Solutions Architect',
  '.NET Software Engineer',
  'Lead Software Engineer',
  'Systems Engineer',
  'Engineering Manager',
  'Data Engineer',
  'AI / Machine Learning Engineer',
  'Cybersecurity Analyst',
  'QA Automation Engineer'
];

export const SAMPLE_CV_DATA = {
  personal: {
    name: 'TABRIZ LATIFOV',
    headline: 'Software and DevOps Engineer',
    email: 'latifovtebriz@gmail.com',
    phone: '+994 50 789 52 82',
    location: 'Baku, Azerbaijan',
    linkedin: 'https://linkedin.com/in/latifovtebriz',
    github: 'https://github.com/tebriz993',
    portfolio: 'https://vitelo.me',
    summary: 'Software Engineer with 4+ years of experience specializing in the .NET ecosystem, microservices architecture, and DevOps practices. Proven track record in designing scalable systems, automating CI/CD pipelines, and managing cloud infrastructure. Experienced in working within remote, distributed teams with a strong focus on clean architecture and system optimization.'
  },
  skills: {
    languages_frameworks: ['C#', '.NET Core', 'ASP.NET MVC', 'Web API', 'JavaScript', 'TypeScript', 'React.js'],
    devops_cloud: ['Azure DevOps', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'ELK Stack', 'Linux OS'],
    databases: ['Microsoft SQL Server', 'PostgreSQL', 'Redis', 'Oracle Database'],
    concepts_tools: ['Microservices', 'Web APIs', 'Clean Architecture', 'CQRS', 'RabbitMQ', 'Agile/Scrum', 'Git'],
    soft_skills: [
      'Problem Solving & Analytical Thinking',
      'Self-Management & Adaptability',
      'Effective Communication (Remote/Async)',
      'Team Collaboration & Mentorship',
      'Critical Thinking',
      'Time Management',
      'Creative Innovation'
    ]
  },
  experience: [
    {
      job_title: 'Software Engineer',
      company: 'ATESHGAH INSURANCE OJSC',
      location: 'Baku, Azerbaijan (Hybrid)',
      start_date: 'Dec 2025',
      end_date: 'Present',
      is_current: true,
      description: 'Developing mission-critical insurance microservices with .NET Core and PostgreSQL. Implementing event-driven messaging with RabbitMQ and automating deployments with Docker and CI/CD pipelines.'
    },
    {
      job_title: 'DevOps and SRE Engineer',
      company: 'SKOLYN',
      location: 'Remote (Contract)',
      start_date: 'Sep 2025',
      end_date: 'Present',
      is_current: true,
      description: 'Managing cloud infrastructure using Terraform and Kubernetes. Implementing monitoring, alerting, and observability dashboards with Prometheus and Grafana.'
    },
    {
      job_title: 'Software Engineer',
      company: 'FREELANCE',
      location: 'United States (Remote)',
      start_date: 'May 2025',
      end_date: 'Oct 2025',
      is_current: false,
      description: 'Built scalable web applications and REST APIs using ASP.NET Core and React.js for international clients, emphasizing clean architecture and test coverage.'
    },
    {
      job_title: 'Software Engineer',
      company: 'CROCUSOFT',
      location: 'Baku, Azerbaijan (Part-time)',
      start_date: 'Jan 2025',
      end_date: 'May 2025',
      is_current: false,
      description: 'Contributed to enterprise web applications, optimized SQL database queries, and implemented user authentication workflows.'
    },
    {
      job_title: 'Software Engineer',
      company: 'DENDCLUB',
      location: 'Remote (Contract)',
      start_date: 'Jan 2025',
      end_date: 'May 2025',
      is_current: false,
      description: 'Developed backend API endpoints and microservices, integrated third-party payment gateways, and resolved performance bottlenecks.'
    },
    {
      job_title: 'Software Engineer (Instructor)',
      company: 'CODEWORLD',
      location: 'On-site (Contract)',
      start_date: 'Apr 2025',
      end_date: 'Present',
      is_current: true,
      description: 'Teaching advanced C#, .NET development, clean architecture, and modern backend engineering principles to aspiring developers.'
    },
    {
      job_title: 'Software Engineer (Instructor)',
      company: 'SOFTWARE VILLAGE',
      location: 'Azerbaijan (Contract)',
      start_date: 'Aug 2024',
      end_date: 'Feb 2026',
      is_current: false,
      description: 'Delivered technical workshops on DevOps, Docker, Git workflows, and Web API development.'
    },
    {
      job_title: 'ICT Onsite Support Technician',
      company: 'KRONOS',
      location: 'Baku, Azerbaijan (On-site)',
      start_date: 'Oct 2024',
      end_date: 'Nov 2024',
      is_current: false,
      description: 'Maintained IT infrastructure, resolved network and hardware issues, and configured employee workstations.'
    },
    {
      job_title: 'Software Engineer',
      company: 'TIC',
      location: 'United States (Remote)',
      start_date: 'May 2021',
      end_date: 'Nov 2024',
      is_current: false,
      description: 'Designed and engineered backend services with .NET and SQL Server. Implemented automated testing, CI/CD pipelines, and reduced system latency.'
    }
  ],
  education: [
    {
      institution: 'Baku Engineering University',
      degree: 'Bachelor of Science in Computer Engineering',
      location: 'Baku, Azerbaijan',
      start_date: 'Sep 2022',
      end_date: 'Sep 2026',
      graduation_year: '2026',
      gpa: ''
    },
    {
      institution: 'Massachusetts Institute of Technology (MIT)',
      degree: 'Computer Science and Programming',
      location: 'Online',
      start_date: 'Aug 2024',
      end_date: 'Nov 2024',
      graduation_year: '2024',
      gpa: ''
    },
    {
      institution: 'Stanford University',
      degree: 'Algorithms: Divide and Conquer, Sorting and Searching',
      location: 'Online',
      start_date: 'Jan 2024',
      end_date: 'Apr 2024',
      graduation_year: '2024',
      gpa: ''
    }
  ],
  projects: [
    {
      title: 'IAC 2025 Sydney',
      role: 'Scientific Researcher – The role of Software Architectures in Space Systems',
      period: 'Jan 2025 – Sep 2025',
      description: 'Researched resilient fault-tolerant distributed software architectures for space and avionics communications systems.'
    },
    {
      title: 'IKSAD Institute',
      role: 'Scientific Researcher: “Will Artificial Intelligence Replace Humans?”',
      period: 'Jul 2024',
      description: 'Published paper analyzing the socio-economic and technological impacts of Generative AI and automated decision systems.'
    },
    {
      title: 'United Nations',
      role: 'Virtual Delegate for COP30 Brazil',
      period: 'Nov 2025 – Dec 2025',
      description: 'Represented youth technical perspective on digital sustainability and carbon-efficient cloud computing strategies.'
    }
  ],
  volunteering: [
    {
      organization: 'EUROPEAN SOLIDARITY CORPS (ESC) & TURKISH TAEKWONDO FED.',
      role: 'Leader Youth Worker & International Volunteer',
      location: 'Ankara, Türkiye',
      period: 'Aug 2025 – Sep 2025',
      description: 'Coordinated international youth programs, intercultural exchange events, and sports volunteer initiatives.'
    },
    {
      organization: 'ASAN VOLUNTEER ORGANIZATION',
      role: 'Team Leader of Volunteers',
      location: 'Baku, Azerbaijan',
      period: 'Jun 2023 – Aug 2023',
      description: 'Led volunteer teams in public service delivery, community engagement, and citizen assistance.'
    },
    {
      organization: 'SLOVENIAN NATIONAL AGENCY (MOVIT)',
      role: 'Youth Worker (EAYW Project)',
      location: 'Slovenia',
      period: 'Mar 2024 – Sep 2024',
      description: 'Participated in European Academy on Youth Work projects focusing on digital innovation and community empowerment.'
    }
  ],
  languages: [
    { name: 'Azerbaijani', proficiency: 'Native' },
    { name: 'English', proficiency: 'Professional Working' },
    { name: 'Turkish', proficiency: 'Fluent' }
  ]
};
