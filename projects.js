/**
 * ============================================================================
 * DATA-DRIVEN PROJECTS CATALOG (projects.js)
 * ============================================================================
 * Adding a new project takes < 30 seconds:
 *   1. Copy the template object below.
 *   2. Paste it at the top (or bottom) of `window.PROJECTS_DATA`.
 *   3. Choose a `category`: "Machine Learning" | "NLP" | "Analytics" | "Computer Vision"
 *   4. Choose a `miniPreviewType` supported out of the box:
 *      "churn" | "forecast" | "sentiment" | "threshold" | "vision" | "abtest"
 *   5. Save & refresh — search, filters, card previews, Command Palette, and
 *      the 4-tab Case Study Modal update automatically!
 *
 * ------------------- COPY-PASTE PROJECT TEMPLATE ----------------------------
 * {
 *   id: "unique-project-slug",
 *   title: "Project Title Here",
 *   subtitle: "Concise one-line technical subtitle",
 *   category: "Machine Learning", // Machine Learning | NLP | Analytics | Computer Vision
 *   impactBadge: "+15% Accuracy",
 *   summary: "2-sentence summary highlighting business problem, model, and measurable impact.",
 *   tags: ["Python", "XGBoost", "FastAPI", "SQL"],
 *   miniPreviewType: "churn", // churn | forecast | sentiment | threshold | vision | abtest
 *   liveUrl: "https://github.com/harivansh-ds",
 *   repoUrl: "https://github.com/harivansh-ds",
 *   overview: {
 *     problem: "Describe the core business or engineering bottleneck.",
 *     dataset: "Dataset size, features, class imbalance, or cadence.",
 *     solution: "Modeling approach, validation split, and deployment architecture."
 *   },
 *   pipeline: [
 *     { step: "01", title: "Ingestion & SQL ETL", detail: "Automated feature extraction." },
 *     { step: "02", title: "Feature Engineering", detail: "Domain ratios, lags, encodings." },
 *     { step: "03", title: "Model & Calibration", detail: "Cross-validated training + Platt scaling." },
 *     { step: "04", title: "Serving & Drift", detail: "FastAPI endpoint + PSI monitoring." }
 *   ],
 *   results: {
 *     metrics: [
 *       { value: "0.93", label: "ROC-AUC" },
 *       { value: "-22%", label: "False Alerts" },
 *       { value: "18ms", label: "P95 Latency" }
 *     ],
 *     highlights: [
 *       "Key validation or business outcome bullet #1.",
 *       "Key engineering or interpretability outcome bullet #2."
 *     ]
 *   }
 * }
 * ============================================================================
 */

/*window.PROJECTS_DATA = [
  {
    id: "saas-churn-engine",
    title: "SaaS Churn Prediction & Retention Engine",
    subtitle: "Calibrated gradient boosting + SHAP customer health scoring",
    category: "Machine Learning",
    impactBadge: "+18.4% Retention Recall",
    summary: "End-to-end B2B churn prediction system combining behavioral usage telemetry, XGBoost probability calibration, and per-account SHAP explanations served via FastAPI.",
    tags: ["Python", "XGBoost", "SHAP", "FastAPI", "SQL", "dbt", "MLflow"],
    miniPreviewType: "churn",
    liveUrl: "https://github.com/harivansh-ds/saas-churn-engine",
    repoUrl: "https://github.com/harivansh-ds/saas-churn-engine",
    overview: {
      problem: "Customer Success teams relied on static lagged health scores and missed 40% of silent churners before renewal windows.",
      dataset: "180K monthly account snapshots across 34 engineered product-usage, billing, and support-ticket features (11.8% churn positive class).",
      solution: "Trained a time-aware XGBoost classifier with isotonic probability calibration and integrated top-3 SHAP risk drivers into CRM playbooks."
    },
    pipeline: [
      { step: "01", title: "Warehouse ETL", detail: "PostgreSQL & dbt rollups capturing 7d/30d/90d usage velocity and seat contraction." },
      { step: "02", title: "Temporal Validation", detail: "Out-of-time rolling window splits preventing future leakage across cohorts." },
      { step: "03", title: "XGBoost + Calibration", detail: "Optuna-tuned tree ensemble calibrated via isotonic regression for true probabilities." },
      { step: "04", title: "FastAPI + SHAP", detail: "Sub-25ms scoring API surfacing top churn drivers directly to account managers." }
    ],
    results: {
      metrics: [
        { value: "0.914", label: "PR-AUC (Test Cohort)" },
        { value: "+18.4%", label: "Top-Decile Recall Lift" },
        { value: "21ms", label: "P95 Inference Latency" },
        { value: "$380K", label: "Est. ARR Saved (Annualized)" }
      ],
      highlights: [
        "Reduced Brier calibration error by 41% so retention offers matched true churn risk.",
        "Automated weekly PSI feature-drift checks via GitHub Actions and MLflow."
      ]
    }
  },
  {
    id: "retail-demand-forecaster",
    title: "Multi-Horizon Retail Demand Forecaster",
    subtitle: "Hierarchical LightGBM forecasting with promo-elasticity & uncertainty bands",
    category: "Analytics",
    impactBadge: "-14.2% Forecast Error",
    summary: "SKU-level demand forecasting platform modeling seasonal cycles, promotional lift, and P10/P90 safety-stock intervals across 1,400+ retail SKUs.",
    tags: ["Python", "LightGBM", "Time-Series", "SQL", "Plotly", "Streamlit"],
    miniPreviewType: "forecast",
    liveUrl: "https://github.com/harivansh-ds/retail-demand-forecaster",
    repoUrl: "https://github.com/harivansh-ds/retail-demand-forecaster",
    overview: {
      problem: "Simple moving averages caused frequent stockouts during holiday promos while over-ordering slow-moving inventory.",
      dataset: "3.2M daily POS transactions merged with calendar events, discount depth, weather anomalies, and supplier lead times.",
      solution: "Engineered Fourier seasonality terms, recursive lag features, and quantile LightGBM regressors producing P10/P50/P90 demand curves."
    },
    pipeline: [
      { step: "01", title: "POS Aggregation", detail: "Cleaned missing stockout-censored days and normalized store-cluster hierarchies." },
      { step: "02", title: "Lag & Calendar Features", detail: "Built rolling means, promo-decay indicators, and Fourier harmonic terms." },
      { step: "03", title: "Quantile LightGBM", detail: "Trained P10, P50, and P90 models to quantify safety-stock uncertainty." },
      { step: "04", title: "Planner Dashboard", detail: "Interactive scenario simulator allowing planners to test discount schedules." }
    ],
    results: {
      metrics: [
        { value: "-14.2%", label: "wMAPE Reduction" },
        { value: "91.6%", label: "Interval Coverage (P10–P90)" },
        { value: "-19%", label: "Stockout Incidents" },
        { value: "1,400+", label: "Active SKUs Modeled" }
      ],
      highlights: [
        "Outperformed SARIMAX baseline on intermittent-demand SKUs by 23% wMAPE.",
        "Cut weekly inventory reconciliation prep time by 8 hours for operations leads."
      ]
    }
  },
  {
    id: "nlp-ticket-router",
    title: "Support Ticket Sentiment & Intent Router",
    subtitle: "Fine-tuned transformer triage + urgency scoring for customer ops",
    category: "NLP",
    impactBadge: "93.1% Macro-F1",
    summary: "Real-time NLP pipeline classifying multi-lingual support tickets by intent, sentiment polarity, and SLA escalation urgency using distilled transformers.",
    tags: ["PyTorch", "NLP", "Transformers", "FastAPI", "Docker", "Cloud", "Python"],
    miniPreviewType: "sentiment",
    liveUrl: "https://github.com/harivansh-ds/nlp-ticket-router",
    repoUrl: "https://github.com/harivansh-ds/nlp-ticket-router",
    overview: {
      problem: "Manual ticket triaging averaged 4.5 hours to first response, delaying critical billing and outage incidents.",
      dataset: "92,000 anonymized customer support messages across 12 intent classes and 3 escalation severity tiers.",
      solution: "Fine-tuned a compact DistilRoBERTa multi-task head jointly predicting intent category and sentiment urgency, quantized to ONNX for CPU serving."
    },
    pipeline: [
      { step: "01", title: "PII Redaction & Tokenizing", detail: "Regex + NER scrubbing of emails, tokens, and card patterns prior to training." },
      { step: "02", title: "Multi-Task Fine-Tuning", detail: "PyTorch joint loss combining focal intent loss and ordinal urgency scoring." },
      { step: "03", title: "ONNX INT8 Quantization", detail: "Reduced model footprint by 68% with < 0.3% F1 drop for fast CPU inference." },
      { step: "04", title: "Webhook Triage API", detail: "Dockerized FastAPI worker routing urgent tickets to Slack & PagerDuty." }
    ],
    results: {
      metrics: [
        { value: "93.1%", label: "Macro-F1 (12 Intents)" },
        { value: "-64%", label: "Median First-Response Time" },
        { value: "14ms", label: "CPU ONNX Latency" },
        { value: "25K/mo", label: "Tickets Routed" }
      ],
      highlights: [
        "Focal loss and class-balanced sampling boosted rare outage recall from 71% to 92%.",
        "Low-confidence predictions (< 0.65) automatically route to human-in-the-loop review."
      ]
    }
  },
  {
    id: "fraud-anomaly-detector",
    title: "Real-Time Payment Fraud Anomaly Detector",
    subtitle: "Cost-sensitive threshold optimization + Isolation Forest velocity signals",
    category: "Machine Learning",
    impactBadge: "0.96 ROC-AUC",
    summary: "Hybrid supervised + unsupervised fraud scoring engine balancing false-positive customer friction against chargeback loss via dynamic decision thresholds.",
    tags: ["Scikit-Learn", "XGBoost", "Anomaly Detection", "Python", "Docker", "Monitoring"],
    miniPreviewType: "threshold",
    liveUrl: "https://github.com/harivansh-ds/fraud-anomaly-detector",
    repoUrl: "https://github.com/harivansh-ds/fraud-anomaly-detector",
    overview: {
      problem: "Severe class imbalance (0.35% fraud rate) caused high false declines on legitimate high-value cross-border purchases.",
      dataset: "590K anonymized payment events with device fingerprint, merchant risk, and sliding-window velocity aggregations.",
      solution: "Combined an Isolation Forest novelty score with a cost-sensitive LightGBM classifier and expected-dollar threshold tuning."
    },
    pipeline: [
      { step: "01", title: "Streaming Velocity Features", detail: "10m/1h/24h card & IP spend velocity computed without target leakage." },
      { step: "02", title: "Unsupervised Anomaly Score", detail: "Isolation Forest trained on clean baseline transactions to catch zero-day patterns." },
      { step: "03", title: "Cost-Sensitive Training", detail: "Weighted log-loss reflecting actual chargeback vs manual-review cost matrix." },
      { step: "04", title: "Threshold Policy Engine", detail: "Dynamic operating thresholds routing borderline cases to 2FA step-up." }
    ],
    results: {
      metrics: [
        { value: "0.962", label: "ROC-AUC" },
        { value: "-31%", label: "False Decline Rate" },
        { value: "89.4%", label: "Fraud Recall @ 1% FPR" },
        { value: "11ms", label: "Scoring Budget" }
      ],
      highlights: [
        "Adding Isolation Forest outlier features improved novel-attack detection by +7.8% PR-AUC.",
        "Interactive cost-curve analysis aligned Risk & Product teams on optimal cutoff."
      ]
    }
  },
  {
    id: "edge-pcb-vision",
    title: "Edge PCB Surface Defect Inspector",
    subtitle: "Lightweight PyTorch CNN + ONNX Runtime automated optical inspection",
    category: "Computer Vision",
    impactBadge: "96.4% mAP@50",
    summary: "High-speed computer vision defect detector identifying solder bridges, missing pads, and tombstoning components on manufacturing lines at 42 FPS.",
    tags: ["PyTorch", "Computer Vision", "ONNX", "Python", "Docker", "CI/CD"],
    miniPreviewType: "vision",
    liveUrl: "https://github.com/harivansh-ds/edge-pcb-vision",
    repoUrl: "https://github.com/harivansh-ds/edge-pcb-vision",
    overview: {
      problem: "Manual microscope inspection suffered from operator fatigue and missed hairline solder bridges on dense SMD boards.",
      dataset: "14,200 high-resolution annotated PCB macro tiles augmented with lighting, rotation, and sensor-noise transforms.",
      solution: "Trained a compact YOLOv8-nano / MobileNet-backed detector exported to FP16 ONNX Runtime for edge GPU deployment."
    },
    pipeline: [
      { step: "01", title: "Tile Slicing & Augmentation", detail: "SAHI-inspired overlapping crops preserving tiny sub-millimeter defects." },
      { step: "02", title: "PyTorch Detector Training", detail: "Cosine annealing + focal classification loss for rare defect types." },
      { step: "03", title: "NMS & Confidence Tuning", detail: "Tuned IoU overlap and per-class thresholds to minimize scrap escapes." },
      { step: "04", title: "Edge Inference Service", detail: "ONNX Runtime container logging annotated defect crops for QA audits." }
    ],
    results: {
      metrics: [
        { value: "96.4%", label: "mAP@0.50" },
        { value: "42 FPS", label: "Edge Throughput" },
        { value: "-74%", label: "Manual QA Audit Load" },
        { value: "99.1%", label: "Critical Bridge Recall" }
      ],
      highlights: [
        "Overlapping tile inference raised small-component defect recall by +12.5%.",
        "Automated visual regression tests run on golden test boards in CI."
      ]
    }
  },
  {
    id: "ab-experiment-platform",
    title: "Bayesian & Frequentist A/B Uplift Workbench",
    subtitle: "Sequential hypothesis testing, SRM checks & power simulation engine",
    category: "Analytics",
    impactBadge: "3.2x Faster Decisions",
    summary: "Self-serve experimentation framework automating Sample Ratio Mismatch (SRM) detection, CUPED variance reduction, and statistically rigorous launch gates.",
    tags: ["Statistics", "Experimentation", "SQL", "Python", "BI", "Plotly"],
    miniPreviewType: "abtest",
    liveUrl: "https://github.com/harivansh-ds/ab-experiment-platform",
    repoUrl: "https://github.com/harivansh-ds/ab-experiment-platform",
    overview: {
      problem: "Product teams peeked at p-values prematurely and misread noisy funnel fluctuations, risking false feature rollouts.",
      dataset: "Experiment exposure & conversion tables totaling 12M+ user sessions across onboarding and checkout funnels.",
      solution: "Implemented automated Chi-Square SRM checks, pre-period CUPED covariate adjustment, and sequential alpha-spending boundaries."
    },
    pipeline: [
      { step: "01", title: "Exposure SQL Standardization", detail: "Unified user-bucketing joins and deduplicated multi-device exposures." },
      { step: "02", title: "Guardrail & SRM Checks", detail: "Automated Chi-Square split checks halting broken randomizations early." },
      { step: "03", title: "CUPED Variance Reduction", detail: "Adjusted metrics using pre-experiment behavior, shrinking confidence intervals." },
      { step: "04", title: "Executive Scorecards", detail: "Clear lift, p-value, MDE power, and annualized revenue impact summaries." }
    ],
    results: {
      metrics: [
        { value: "-28%", label: "Variance via CUPED" },
        { value: "3.2x", label: "Faster Experiment Turnaround" },
        { value: "100%", label: "SRM Guardrail Coverage" },
        { value: "40+", label: "Product Tests Audited" }
      ],
      highlights: [
        "CUPED reduced required sample size by ~28% on high-variance revenue metrics.",
        "Caught 4 silent bucketing bugs prior to full rollout via automated SRM alerts."
      ]
    }
  }
];*/
