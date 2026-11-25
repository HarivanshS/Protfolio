/**
 * ============================================================================
 * PORTFOLIO CONFIGURATION & STRUCTURED CONTENT (data.js)
 * ============================================================================
 * Edit ONLY this file to update Harivansh's personal profile, placeholder KPIs,
 * skills matrix, experience/education timeline, certifications, and links.
 * No HTML or logic edits required!
 * ============================================================================
 */

window.PORTFOLIO_DATA = {
  // --------------------------------------------------------------------------
  // 1. PERSONAL PROFILE & LINKS (Customize these placeholders with your info)
  // --------------------------------------------------------------------------
  profile: {
    name: "Harivansh",
    headlineRole: "Data Scientist & Machine Learning Engineer",
    roles: [
      "Data Scientist",
      "Machine Learning Engineer",
      "Data Analyst"
    ],
    availability: "Open to Data Science & ML Roles",
    location: "Uttar Pradesh",
    email: "suwaliyaharivansh@gmail.com", // <-- Replace with your real email
    bio: "I build interpretable predictive models, scalable SQL/Python data pipelines, and production ML services that convert noisy operational datasets into measurable business outcomes.",
    // To use a real headshot, place an image in assets/harivansh.jpg and set:
    // avatarUrl: "assets/harivansh.jpg",
    avatarUrl: "",
    // To link a hosted PDF resume, place it in assets/Harivansh_Resume.pdf and set:
    // resumePdfUrl: "assets/Harivansh_Resume.pdf",
    resumePdfUrl: "Harivansh_AI_ML_Internship_Resume_Updated.pdf",
    primaryStack: "Python · SQL · PyTorch",
    focusAreas: "Predictive ML, NLP Systems, Experimentation",
    educationSummary: "B.Tech in Computer Science & Data Engineering (Sample Placeholder)"
  },

  // --------------------------------------------------------------------------
  // 2. HERO KPI COUNTERS (EDITABLE PLACEHOLDERS)
  // Replace target values & labels with your verified portfolio metrics.
  // --------------------------------------------------------------------------
  kpis: [
    {
      id: "kpi-projects",
      target: 14,
      suffix: "+",
      label: "ML & Analytics Projects",
      placeholderNote: "Editable placeholder"
    },
    {
      id: "kpi-models",
      target: 6,
      suffix: "",
      label: "Models Shipped to API",
      placeholderNote: "Editable placeholder"
    },
    {
      id: "kpi-rows",
      target: 45,
      suffix: "M+",
      label: "Rows Processed & Modeled",
      placeholderNote: "Editable placeholder"
    }
  ],

  // --------------------------------------------------------------------------
  // 3. SOCIAL & PROFESSIONAL PROFILES
  // --------------------------------------------------------------------------
  socials: [
    {
      id: "github",
      label: "GitHub",
      handle: "github.com/harivansh-S",
      url: "https://github.com/HarivanshS"
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "linkedin.com/in/harivansh-S",
      url: "https://www.linkedin.com/in/harivansh-gautam-96s75v1121/"
    }
  ],

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE SKILLS MATRIX
  // `filterTag` links each skill directly to matching projects in projects.js!
  // --------------------------------------------------------------------------
  skills: [
    {
      id: "ml",
      tabLabel: "Machine Learning & AI",
      shortLabel: "ML & AI",
      pillarScore: 94,
      items: [
        { name: "PyTorch", level: 88, context: "Neural nets, embeddings, Vision & NLP", filterTag: "PyTorch" },
        { name: "Scikit-Learn", level: 96, context: "Pipelines, cross-validation, ensembles", filterTag: "Scikit-Learn" },
        { name: "Transformers & NLP", level: 89, context: "Sentiment, RAG, text classification", filterTag: "NLP" }
      ]
    },
    {
      id: "analytics",
      tabLabel: "Data Analytics & SQL",
      shortLabel: "Analytics & SQL",
      pillarScore: 95,
      items: [
        { name: "SQL & BigQuery", level: 90, context: "Window functions, CTEs, query tuning", filterTag: "SQL" },
        { name: "Python (Pandas,Numpy,Matplotlib)", level: 96, context: "Vectorized ETL, feature engineering, Data Visualization", filterTag: "Python" },
        { name: "Power BI", level: 90, context: "Power analysis, Interactive Charts, Deshboards", filterTag: "Experimentation" },
        ]
    },
    
    {
      id: "mlops",
      tabLabel: "MLOps & Deployment",
      shortLabel: "MLOps",
      pillarScore: 86,
      items: [
        { name: "FastAPI & REST Services", level: 90, context: "Low-latency inference endpoints", filterTag: "FastAPI" },
        { name: "Docker & Containers", level: 86, context: "Reproducible training & serving", filterTag: "Docker" },
        { name: "CI/CD & GitHub Actions", level: 84, context: "Automated model & data tests", filterTag: "CI/CD" },
        { name: "Cloud (AWS / GCP)", level: 82, context: "S3, Cloud Run, Vertex AI basics", filterTag: "Cloud" },
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 5. EXPERIENCE & EDUCATION TIMELINE
  // COPY-PASTE TEMPLATE TO ADD A NEW ENTRY:
  // {
  //   id: "exp-new",
  //   kind: "work", // "work" or "education"
  //   role: "Your Role or Degree",
  //   org: "Company or University",
  //   period: "Jan 2026 – Present",
  //   location: "City / Remote",
  //   summary: "One-line scope summary.",
  //   bullets: [
  //     "Measurable outcome #1 with percentage or latency metric.",
  //     "Measurable outcome #2 showing technical ownership."
  //   ],
  //   tags: ["Python", "SQL", "XGBoost"],
  //   expandedByDefault: false
  // }
  // --------------------------------------------------------------------------
  timeline: [
    {
      id: "exp-1",
      kind: "work",
      role: "Data Analyst Intern",
      org: "Bluestock",
      period: " Jul 2026 – Sep 2026",
      location: "Remote",
      summary: "Completed a 2-month Data Analyst internship at Bluestock Fintech, working on financial and market datasets to extract actionable insights. Performed data cleaning, exploratory data analysis (EDA), and built interactive dashboards to support data-driven decision-making",
      bullets: [
        "Analyzed financial and stock market datasets to identify key market trends, anomalies, and performance metrics.",
        "Cleaned, transformed, and structured raw data to ensure high accuracy for reporting and analytical workflows.",
        "Designed visual reports and interactive dashboards to present complex financial insights clearly to stakeholders."
      ],
      tags: ["Python(Numpy, Pandas, Matplotlip)", "Power BI", "SQL", "FastAPI", "Data Cleaning"],
      expandedByDefault: true
    },
    
    {
      id: "edu-1",
      kind: "education",
      role: "B.Tech in Information Technology",
      org: "Rajkiya Engineering College, Bijnor",
      period: "2024 – 2028",
      location: "India",
      summary: "Pursuing an undergraduate degree in Information Technology with a strong focus on Data Analytics, Software Development, Database Management Systems, and Machine Learning. Actively applying theoretical concepts to real-world technical projects and industry internships.",
      bullets: [
        "Key Coursework: Data Structures & Algorithms (DSA), Python Programming, Machine Learning, Operating Systems, Computer Networks, and Soft Computing.",
        "Technical Activities: Actively participating in coding challenges, technical workshops, and campus innovation projects to strengthen problem-solving skills."
      ],
      tags: ["Statistics", "Problem Solving", "Computer Networks", "SQL", "Algorithms"],
      expandedByDefault: false
    }
  ],

  // --------------------------------------------------------------------------
  // 6. CERTIFICATIONS & ACHIEVEMENTS
  // --------------------------------------------------------------------------
  certifications: [
    {
      id: "cert-1",
      title: "Data Analyst Internship",
      issuer: "Bluestock Fintech",
      date: "2026",
      credentialId: "BFDA103138",
      badgeType: "Internship",
      certificateFile: "Certificates/BFDA103138.jpg", 
      buttonText: "Check Certificate",
      skills: ["Data Analytics", "Python", "SQL", "Power BI", "EDA"]
    },
    {
      id: "cert-2",
      title: "Data Science & Analytics",
      issuer: "Hp Foundation",
      date: "2026",
      certificateFile: "Certificates/Data Science & Analytics.pdf",
      buttonText: "Check Certificate",
      skills: ["Data Analytics", "Data Visualization", "Presentation"]
    }
    
  ]
};
