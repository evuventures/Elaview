import React, { useEffect, useState } from "react";
import "./TechDebtAnalysis.css"; // Move styles to a CSS file for maintainability

// --- Data Definitions ---

const assessmentCategories = [
  {
    icon: "🏗️",
    title: "Code Architecture",
    criteria: [
      { text: "Tightly coupled components", severity: "HIGH", weight: 3 },
      { text: "Circular dependencies", severity: "MED", weight: 2 },
      { text: "Violation of SOLID principles", severity: "MED", weight: 2 },
      { text: "Inconsistent naming conventions", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "📝",
    title: "Code Quality",
    criteria: [
      { text: "Duplicated code blocks", severity: "HIGH", weight: 3 },
      { text: "Large functions/classes (>200 lines)", severity: "HIGH", weight: 3 },
      { text: "Deep nesting levels (>5)", severity: "MED", weight: 2 },
      { text: "Missing or poor comments", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🧪",
    title: "Testing & Documentation",
    criteria: [
      { text: "No unit tests for critical code", severity: "HIGH", weight: 3 },
      { text: "Test coverage below 60%", severity: "MED", weight: 2 },
      { text: "Outdated documentation", severity: "MED", weight: 2 },
      { text: "No API documentation", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "⚡",
    title: "Performance & Security",
    criteria: [
      { text: "Known security vulnerabilities", severity: "HIGH", weight: 3 },
      { text: "Performance bottlenecks", severity: "MED", weight: 2 },
      { text: "Memory leaks or inefficient queries", severity: "MED", weight: 2 },
      { text: "Unoptimized database queries", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🔧",
    title: "Maintenance & Dependencies",
    criteria: [
      { text: "Outdated dependencies with security risks", severity: "HIGH", weight: 3 },
      { text: "Hard-coded configuration values", severity: "MED", weight: 2 },
      { text: "Deprecated API usage", severity: "MED", weight: 2 },
      { text: "No automated build/deployment", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🏢",
    title: "Business Impact",
    criteria: [
      { text: "Frequent production incidents", severity: "HIGH", weight: 3 },
      { text: "Slow feature delivery", severity: "HIGH", weight: 3 },
      { text: "High developer onboarding time", severity: "MED", weight: 2 },
      { text: "Customer complaints about performance", severity: "LOW", weight: 1 },
    ],
  },
];

const monorepoCategories = [
  {
    icon: "📁",
    title: "Repository Structure",
    criteria: [
      { text: "Inconsistent folder structures between BE/FE", severity: "HIGH", weight: 3 },
      { text: "No shared tooling configuration", severity: "MED", weight: 2 },
      { text: "Duplicate dependencies across projects", severity: "MED", weight: 2 },
      { text: "Missing workspace configuration", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🔄",
    title: "Cross-Project Dependencies",
    criteria: [
      { text: "Circular dependencies between BE/FE", severity: "HIGH", weight: 3 },
      { text: "Tight coupling via shared database access", severity: "HIGH", weight: 3 },
      { text: "No API versioning strategy", severity: "MED", weight: 2 },
      { text: "Shared utilities without proper abstraction", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🚀",
    title: "Build & Deployment",
    criteria: [
      { text: "No incremental build system", severity: "HIGH", weight: 3 },
      { text: "All projects rebuild on any change", severity: "HIGH", weight: 3 },
      { text: "No dependency graph optimization", severity: "MED", weight: 2 },
      { text: "Manual deployment coordination", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🔧",
    title: "Frontend Specific",
    criteria: [
      { text: "Multiple incompatible state management approaches", severity: "HIGH", weight: 3 },
      { text: "Inconsistent component libraries/design systems", severity: "MED", weight: 2 },
      { text: "No type safety between FE/BE boundaries", severity: "MED", weight: 2 },
      { text: "Bundle size not optimized across apps", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "🗄️",
    title: "Backend Specific",
    criteria: [
      { text: "Shared database without proper boundaries", severity: "HIGH", weight: 3 },
      { text: "No service boundaries or API contracts", severity: "HIGH", weight: 3 },
      { text: "Inconsistent error handling across services", severity: "MED", weight: 2 },
      { text: "Different logging/monitoring approaches", severity: "LOW", weight: 1 },
    ],
  },
  {
    icon: "👥",
    title: "Team Coordination",
    criteria: [
      { text: "No code ownership model", severity: "HIGH", weight: 3 },
      { text: "Different coding standards per project", severity: "MED", weight: 2 },
      { text: "No shared development workflow", severity: "MED", weight: 2 },
      { text: "Knowledge silos between FE/BE teams", severity: "LOW", weight: 1 },
    ],
  },
];

const metricsCards = [
  {
    title: "Development Velocity",
    items: [
      "Story points completed per sprint",
      "Lead time for features",
      "Deployment frequency",
      "Time to fix bugs",
    ],
  },
  {
    title: "Code Quality Metrics",
    items: [
      "Cyclomatic complexity",
      "Code coverage percentage",
      "Duplication ratio",
      "Technical debt ratio",
    ],
  },
  {
    title: "Operational Metrics",
    items: [
      "Mean time to recovery (MTTR)",
      "Change failure rate",
      "System uptime",
      "Performance metrics",
    ],
  },
];

const prioritizationMatrix = [
  {
    color: "#e74c3c",
    textColor: "white",
    header: "Critical (Fix Now)",
    desc: "High impact, High effort\nSecurity vulnerabilities, System failures",
  },
  {
    color: "#f39c12",
    textColor: "white",
    header: "Quick Wins",
    desc: "High impact, Low effort\nCode cleanup, Documentation",
  },
  {
    color: "#3498db",
    textColor: "white",
    header: "Strategic",
    desc: "Medium impact, High effort\nArchitecture refactoring",
  },
  {
    color: "#95a5a6",
    textColor: "white",
    header: "Consider Later",
    desc: "Low impact, High effort\nNice-to-have improvements",
  },
  {
    color: "#27ae60",
    textColor: "white",
    header: "Easy Fixes",
    desc: "Medium impact, Low effort\nCode style, Minor bugs",
  },
  {
    color: "#f1c40f",
    textColor: "black",
    header: "Monitor",
    desc: "Low impact, Low effort\nKeep on radar",
  },
];

const trackingTemplate = [
  { label: "ID", value: "DEBT-001" },
  { label: "Category", value: "Code Quality, Architecture, Security, etc." },
  { label: "Description", value: "Clear description of the debt" },
  { label: "Impact", value: "High/Medium/Low" },
  { label: "Effort", value: "Hours/Days/Weeks estimate" },
  { label: "Priority", value: "Critical/High/Medium/Low" },
  { label: "Owner", value: "Assigned team/developer" },
  { label: "Due Date", value: "Target completion" },
  { label: "Status", value: "Open/In Progress/Resolved" },
];

// --- Utility Functions ---

function getMaxScore() {
  let sum = 0;
  for (const cat of assessmentCategories) {
    sum += cat.criteria.reduce((acc, c) => acc + c.weight, 0);
  }
  for (const cat of monorepoCategories) {
    sum += cat.criteria.reduce((acc, c) => acc + c.weight, 0);
  }
  return sum;
}

function getSeverityClass(severity: string) {
  switch (severity) {
    case "HIGH":
      return "high";
    case "MED":
      return "medium";
    case "LOW":
      return "low";
    default:
      return "";
  }
}

// --- Main Component ---

const TABS = [
  { id: "assessment", label: "📊 Assessment" },
  { id: "monorepo", label: "🏗️ Monorepo Specific" },
  { id: "metrics", label: "📈 Metrics" },
  { id: "prioritization", label: "🎯 Prioritization" },
  { id: "stakeholder", label: "👥 Stakeholder Report" },
  { id: "tracking", label: "📋 Tracking" },
];

type CheckedMap = { [key: string]: boolean };

function getCriteriaKey(tab: string, catIdx: number, critIdx: number) {
  return `${tab}-${catIdx}-${critIdx}`;
}

const TechDebtAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessment");
  const [checked, setChecked] = useState<CheckedMap>({});
  const [totalScore, setTotalScore] = useState(0);
  const maxScore = getMaxScore();

  // For stakeholder report
  const [stakeholderData, setStakeholderData] = useState({
    risk: "Low",
    riskColor: "#27ae60",
    impactText: (
      <>
        <p>
          <strong>Development Velocity:</strong> Minimal impact - operating at near optimal speed
        </p>
        <p>
          <strong>Maintenance Cost:</strong> 15-20% of development time spent on maintenance
        </p>
        <p>
          <strong>Risk Factors:</strong> Well-managed codebase with proactive maintenance
        </p>
      </>
    ),
    investmentText: (
      <>
        <p>
          <strong>Immediate:</strong> Continue current practices, monitor for new debt
        </p>
        <p>
          <strong>Short-term:</strong> Opportunistic improvements and preventive measures
        </p>
        <p>
          <strong>Long-term:</strong> Innovation and new technology adoption
        </p>
      </>
    ),
    resourceText: (
      <>
        <p>
          <strong>Team Allocation:</strong> 10-15% of capacity for continuous improvement
        </p>
        <p>
          <strong>Tools/Infrastructure:</strong> Investment in team productivity and innovation
        </p>
        <p>
          <strong>Training:</strong> Focus on advanced skills and emerging technologies
        </p>
      </>
    ),
  });

  // --- Handlers ---

  useEffect(() => {
    // Calculate score
    let score = 0;
    for (const key in checked) {
      if (checked[key]) {
        // Find weight
        const [tab, catIdx, critIdx] = key.split("-");
        let cat, crit;
        if (tab === "assessment") {
          cat = assessmentCategories[parseInt(catIdx)];
        } else if (tab === "monorepo") {
          cat = monorepoCategories[parseInt(catIdx)];
        }
        if (cat) {
          crit = cat.criteria[parseInt(critIdx)];
          if (crit) score += crit.weight;
        }
      }
    }
    setTotalScore(score);

    // Update stakeholder data
    let risk = "Low",
      riskColor = "#27ae60",
      impactText,
      investmentText,
      resourceText;
    if (score >= 60) {
      risk = "Critical";
      riskColor = "#e74c3c";
      impactText = (
        <>
          <p>
            <strong>Development Velocity:</strong> Severely impacted - 40-60% slower delivery
          </p>
          <p>
            <strong>Maintenance Cost:</strong> 70%+ of development time spent on maintenance
          </p>
          <p>
            <strong>Risk Factors:</strong> High probability of production failures, security breaches, and team burnout
          </p>
        </>
      );
      investmentText = (
        <>
          <p>
            <strong>Immediate (This Week):</strong> Emergency response team to address critical issues
          </p>
          <p>
            <strong>Short-term (1-2 months):</strong> Dedicated debt reduction team, halt new features temporarily
          </p>
          <p>
            <strong>Long-term (3-6 months):</strong> Major architectural overhaul and process restructuring
          </p>
        </>
      );
      resourceText = (
        <>
          <p>
            <strong>Team Allocation:</strong> 50-70% of capacity for immediate debt reduction
          </p>
          <p>
            <strong>Tools/Infrastructure:</strong> Emergency investment in monitoring, build systems, and automation
          </p>
          <p>
            <strong>Training:</strong> Intensive team restructuring and skills development
          </p>
        </>
      );
    } else if (score >= 40) {
      risk = "High";
      riskColor = "#f39c12";
      impactText = (
        <>
          <p>
            <strong>Development Velocity:</strong> Significantly impacted - 25-40% slower delivery
          </p>
          <p>
            <strong>Maintenance Cost:</strong> 50-60% of development time spent on maintenance
          </p>
          <p>
            <strong>Risk Factors:</strong> Regular production incidents and declining team morale
          </p>
        </>
      );
      investmentText = (
        <>
          <p>
            <strong>Immediate (Sprint 1-2):</strong> Address critical security and stability issues
          </p>
          <p>
            <strong>Short-term (1-2 months):</strong> Dedicated sprints for debt reduction, improve CI/CD
          </p>
          <p>
            <strong>Long-term (3-6 months):</strong> Systematic refactoring and architecture improvements
          </p>
        </>
      );
      resourceText = (
        <>
          <p>
            <strong>Team Allocation:</strong> 30-40% of sprint capacity for debt reduction
          </p>
          <p>
            <strong>Tools/Infrastructure:</strong> Investment in automated testing and deployment tools
          </p>
          <p>
            <strong>Training:</strong> Team alignment workshops and best practices training
          </p>
        </>
      );
    } else if (score >= 25) {
      risk = "Medium";
      riskColor = "#f1c40f";
      impactText = (
        <>
          <p>
            <strong>Development Velocity:</strong> Moderately impacted - 15-25% slower delivery
          </p>
          <p>
            <strong>Maintenance Cost:</strong> 30-40% of development time spent on maintenance
          </p>
          <p>
            <strong>Risk Factors:</strong> Occasional issues but manageable with current team
          </p>
        </>
      );
      investmentText = (
        <>
          <p>
            <strong>Immediate (Sprint 1-2):</strong> Address quick wins and documentation gaps
          </p>
          <p>
            <strong>Short-term (1-2 months):</strong> Regular debt reduction in each sprint
          </p>
          <p>
            <strong>Long-term (3-6 months):</strong> Planned architectural improvements
          </p>
        </>
      );
      resourceText = (
        <>
          <p>
            <strong>Team Allocation:</strong> 20-25% of sprint capacity for debt reduction
          </p>
          <p>
            <strong>Tools/Infrastructure:</strong> Gradual tooling improvements
          </p>
          <p>
            <strong>Training:</strong> Regular knowledge sharing and code review improvements
          </p>
        </>
      );
    } else {
      risk = "Low";
      riskColor = "#27ae60";
      impactText = (
        <>
          <p>
            <strong>Development Velocity:</strong> Minimal impact - operating at near optimal speed
          </p>
          <p>
            <strong>Maintenance Cost:</strong> 15-20% of development time spent on maintenance
          </p>
          <p>
            <strong>Risk Factors:</strong> Well-managed codebase with proactive maintenance
          </p>
        </>
      );
      investmentText = (
        <>
          <p>
            <strong>Immediate:</strong> Continue current practices, monitor for new debt
          </p>
          <p>
            <strong>Short-term:</strong> Opportunistic improvements and preventive measures
          </p>
          <p>
            <strong>Long-term:</strong> Innovation and new technology adoption
          </p>
        </>
      );
      resourceText = (
        <>
          <p>
            <strong>Team Allocation:</strong> 10-15% of capacity for continuous improvement
          </p>
          <p>
            <strong>Tools/Infrastructure:</strong> Investment in team productivity and innovation
          </p>
          <p>
            <strong>Training:</strong> Focus on advanced skills and emerging technologies
          </p>
        </>
      );
    }
    setStakeholderData({
      risk,
      riskColor,
      impactText,
      investmentText,
      resourceText,
    });
  }, [checked]);

  function handleCheck(tab: string, catIdx: number, critIdx: number) {
    const key = getCriteriaKey(tab, catIdx, critIdx);
    setChecked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // --- Export Handlers ---

  function exportResults() {
    const checkedItems: any[] = [];
    for (const key in checked) {
      if (checked[key]) {
        const [tab, catIdx, critIdx] = key.split("-");
        let cat, crit;
        if (tab === "assessment") {
          cat = assessmentCategories[parseInt(catIdx)];
        } else if (tab === "monorepo") {
          cat = monorepoCategories[parseInt(catIdx)];
        }
        if (cat) {
          crit = cat.criteria[parseInt(critIdx)];
          checkedItems.push({
            category: cat.title,
            text: crit.text,
            severity: crit.severity,
            weight: crit.weight,
          });
        }
      }
    }
    const report = {
      timestamp: new Date().toISOString(),
      totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100),
      identifiedIssues: checkedItems,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technical-debt-analysis-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportStakeholderReport() {
    const checkedItems: any[] = [];
    for (const key in checked) {
      if (checked[key]) {
        const [tab, catIdx, critIdx] = key.split("-");
        let cat, crit;
        if (tab === "assessment") {
          cat = assessmentCategories[parseInt(catIdx)];
        } else if (tab === "monorepo") {
          cat = monorepoCategories[parseInt(catIdx)];
        }
        if (cat) {
          crit = cat.criteria[parseInt(critIdx)];
          checkedItems.push({
            category: cat.title,
            issue: crit.text,
            severity: crit.severity,
            weight: crit.weight,
          });
        }
      }
    }
    const report = {
      executiveSummary: {
        assessmentDate: new Date().toISOString().split("T")[0],
        totalScore,
        maxScore,
        riskLevel: stakeholderData.risk,
        percentageDebt: Math.round((totalScore / maxScore) * 100),
      },
      keyFindings: checkedItems,
      recommendations: {
        immediate: "Address critical security and stability issues",
        shortTerm: "Implement quick wins and improve development workflow",
        longTerm: "Strategic architectural improvements and process optimization",
      },
      businessImpact: {
        developmentVelocity:
          totalScore >= 40
            ? "Significantly Impacted"
            : totalScore >= 25
            ? "Moderately Impacted"
            : "Minimal Impact",
        estimatedSlowdown:
          totalScore >= 60
            ? "40-60%"
            : totalScore >= 40
            ? "25-40%"
            : totalScore >= 25
            ? "15-25%"
            : "<15%",
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stakeholder-tech-debt-report-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Recommendations Section ---

  function renderRecommendations() {
    let recommendations = [];
    if (totalScore >= 40) {
      recommendations.push(
        <div
          className="recommendation-item"
          style={{ borderLeftColor: "#e74c3c" }}
          key="critical"
        >
          <h4>🚨 Critical Action Required</h4>
          <p>
            Your technical debt score is very high ({totalScore}/{maxScore}). Immediate intervention needed to prevent system degradation.
          </p>
        </div>
      );
    } else if (totalScore >= 25) {
      recommendations.push(
        <div
          className="recommendation-item"
          style={{ borderLeftColor: "#f39c12" }}
          key="significant"
        >
          <h4>⚠️ Significant Debt Present</h4>
          <p>
            Your technical debt score is concerning ({totalScore}/{maxScore}). Plan dedicated sprints for debt reduction.
          </p>
        </div>
      );
    } else if (totalScore >= 15) {
      recommendations.push(
        <div
          className="recommendation-item"
          style={{ borderLeftColor: "#f1c40f" }}
          key="moderate"
        >
          <h4>⚡ Moderate Debt Level</h4>
          <p>
            Your technical debt is manageable ({totalScore}/{maxScore}) but should be addressed proactively.
          </p>
        </div>
      );
    } else {
      recommendations.push(
        <div
          className="recommendation-item"
          style={{ borderLeftColor: "#27ae60" }}
          key="good"
        >
          <h4>✅ Good Technical Health</h4>
          <p>
            Your technical debt is low ({totalScore}/{maxScore}). Maintain current practices and monitor regularly.
          </p>
        </div>
      );
    }
    recommendations.push(
      <div className="recommendation-item" key="immediate">
        <h4>🚨 Immediate Actions (0-2 weeks)</h4>
        <p>
          Address critical security vulnerabilities and system stability issues. Focus on items that could cause production outages.
        </p>
      </div>,
      <div className="recommendation-item" key="quickwins">
        <h4>⚡ Quick Wins (2-4 weeks)</h4>
        <p>
          Implement low-effort, high-impact improvements like code cleanup, documentation updates, and automated testing.
        </p>
      </div>,
      <div className="recommendation-item" key="strategic">
        <h4>🏗️ Strategic Improvements (1-3 months)</h4>
        <p>
          Plan architectural refactoring, dependency updates, and performance optimizations that require significant effort.
        </p>
      </div>,
      <div className="recommendation-item" key="monitoring">
        <h4>📊 Ongoing Monitoring</h4>
        <p>
          Establish metrics tracking, code review processes, and regular debt assessment cycles to prevent future accumulation.
        </p>
      </div>
    );
    return recommendations;
  }

  // --- Renderers for Tabs ---

  function renderAssessmentTab(categories: typeof assessmentCategories, tab: string) {
    return (
      <div className="assessment-grid">
        {categories.map((cat, catIdx) => (
          <div className="assessment-card" key={cat.title}>
            <div className="card-title">
              <span className="card-icon">{cat.icon}</span>
              {cat.title}
            </div>
            <ul className="criteria-list">
              {cat.criteria.map((crit, critIdx) => {
                const key = getCriteriaKey(tab, catIdx, critIdx);
                return (
                  <li className="criteria-item" key={key}>
                    <input
                      type="checkbox"
                      className="criteria-checkbox"
                      checked={!!checked[key]}
                      onChange={() => handleCheck(tab, catIdx, critIdx)}
                      data-weight={crit.weight}
                    />
                    <span className="criteria-text">{crit.text}</span>
                    <span className={`severity-indicator ${getSeverityClass(crit.severity)}`}>
                      {crit.severity}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="container">
      <div className="header">
        <h1>🔧 Technical Debt Analysis</h1>
        <p>Comprehensive framework for identifying, measuring, and prioritizing technical debt</p>
      </div>
      <div className="main-content">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Monorepo Tab */}
        {activeTab === "monorepo" && (
          <div className="tab-content active" id="monorepo">
            <h2>🏗️ Monorepo Technical Debt Assessment</h2>
            {renderAssessmentTab(monorepoCategories, "monorepo")}
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="tab-content active" id="assessment">
            {renderAssessmentTab(assessmentCategories, "assessment")}
            <div className="score-section">
              <div className="score-display" id="totalScore">
                {totalScore}
              </div>
              <div className="score-label">Technical Debt Score</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  id="scoreProgress"
                  style={{
                    width: `${Math.round((totalScore / maxScore) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="recommendations" id="recommendationsContent">
              {renderRecommendations()}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="tab-content active" id="metrics">
            <h2>📈 Key Metrics to Track</h2>
            <div className="assessment-grid">
              {metricsCards.map((card) => (
                <div className="assessment-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <ul>
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prioritization Tab */}
        {activeTab === "prioritization" && (
          <div className="tab-content active" id="prioritization">
            <h2>🎯 Debt Prioritization Matrix</h2>
            <div className="priority-matrix">
              {prioritizationMatrix.map((cell) => (
                <div
                  className="matrix-cell"
                  key={cell.header}
                  style={{
                    background: cell.color,
                    color: cell.textColor,
                  }}
                >
                  <div className="matrix-header">{cell.header}</div>
                  <p>
                    {cell.desc.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stakeholder Report Tab */}
        {activeTab === "stakeholder" && (
          <div className="tab-content active" id="stakeholder">
            <h2>👥 Executive Summary & Stakeholder Report</h2>
            <div className="recommendations" id="stakeholderContent">
              <div className="recommendation-item">
                <h4>📊 Current Technical Debt Status</h4>
                <p>
                  <strong>Overall Score:</strong> <span id="stakeholderScore">{totalScore}</span>/
                  {maxScore} points
                </p>
                <p>
                  <strong>Risk Level:</strong>{" "}
                  <span id="riskLevel" style={{ color: stakeholderData.riskColor }}>
                    {stakeholderData.risk}
                  </span>
                </p>
                <p>
                  <strong>Assessment Date:</strong>{" "}
                  <span id="assessmentDate">{new Date().toLocaleDateString()}</span>
                </p>
              </div>
              <div className="recommendation-item">
                <h4>💰 Business Impact</h4>
                <div id="businessImpact">{stakeholderData.impactText}</div>
              </div>
              <div className="recommendation-item">
                <h4>🎯 Recommended Investment</h4>
                <div id="investmentPlan">{stakeholderData.investmentText}</div>
              </div>
              <div className="recommendation-item">
                <h4>📈 Success Metrics</h4>
                <ul>
                  <li>Reduction in build times by X%</li>
                  <li>Decrease in production incidents</li>
                  <li>Improved developer satisfaction scores</li>
                  <li>Faster feature delivery (lead time reduction)</li>
                </ul>
              </div>
              <div className="recommendation-item">
                <h4>🛠️ Resource Requirements</h4>
                <div id="resourcePlan">{stakeholderData.resourceText}</div>
              </div>
            </div>
            <button className="export-btn" onClick={exportStakeholderReport}>
              📊 Export Executive Report
            </button>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === "tracking" && (
          <div className="tab-content active" id="tracking">
            <h2>📋 Debt Tracking Template</h2>
            <div className="assessment-card">
              <h3>Debt Item Template</h3>
              <ul>
                {trackingTemplate.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                ))}
              </ul>
            </div>
            <button className="export-btn" onClick={exportResults}>
              📄 Export Analysis Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechDebtAnalysis;