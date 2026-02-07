import './SimulationPerformance.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { moduleAttempts } from '../../../../../dummy_data/modulesAttempt_data';
import back_arrow from '../../../../../assets/icons/orange-left-arrow.svg';
import ActionButton from '../../../../../components/ActionButton/ActionButton';

export default function SimulationPerformance() {
  console.log("SimulationPerformance mounted");
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  const moduleAttempt = useMemo(() => {
    return moduleAttempts.find(attempt => attempt.moduleInfo.id === Number(moduleId));
  }, [moduleId]);

  if (!moduleAttempt) {
    return <div className="simulation-performance">Module not found</div>;
  }

  // Aggregate evaluation data from all completed lessons
  const aggregatedEvaluation = useMemo(() => {
    const completedLessons = moduleAttempt.lessons?.filter(
      lesson => lesson.status === 'completed' && lesson.evaluation
    ) || [];

    const allStrengths = completedLessons
      .map(lesson => lesson.evaluation?.strengths || '')
      .filter(s => s.length > 0);
    
    const allShortcomings = completedLessons
      .map(lesson => lesson.evaluation?.shortcomings || '')
      .filter(s => s.length > 0);

    const overallFeedback = completedLessons.length > 0
      ? completedLessons[completedLessons.length - 1].evaluation?.overallFeedback || ''
      : '';

    return {
      strengths: allStrengths,
      shortcomings: allShortcomings,
      overallFeedback
    };
  }, [moduleAttempt]);

  const timeSpent = useMemo(() => {
    const completedLessons = moduleAttempt.lessons?.filter(
      lesson => lesson.status === 'completed'
    ) || [];
    const totalMinutes = completedLessons.reduce(
      (sum, lesson) => sum + (lesson.lessonInfo.duration || 0), 
      0
    );
    return `${totalMinutes} min`;
  }, [moduleAttempt]);

  const completionDate = moduleAttempt.completionDate;
  
  /*useMemo(() => {
    if (moduleAttempt.lessons && moduleAttempt.lessons.length > 0) {
      return moduleAttempt.lessons[moduleAttempt.lessons.length - 1].lessonInfo.dueDate;
    }
    return 'N/A';
  }, [moduleAttempt]);*/

  const overallScore = moduleAttempt.score || 0;

  const colorByScore = (score: number) => {
    if (score > 89) {
      return "green";
    }

    if (score < 89 && score > 79) {
      return "blue"
    }

    if (score < 79 && score > 59) {
      return "orange"
    }

    if (score < 59) {
      return "red"
    }
  };

  const performanceData = {
    moduleTitle: moduleAttempt.moduleInfo.title,
    completionDate: completionDate,
    overallScore: overallScore,
    timeSpent: timeSpent,
    attemptsCount: 1,
    strengths: aggregatedEvaluation.strengths,
    shortcomings: aggregatedEvaluation.shortcomings,
    overallFeedback: aggregatedEvaluation.overallFeedback,

    skillBreakdown: [
      { skill: "SKU Recognition", score: 92, benchmark: 85 },
      { skill: "Brand Recognition", score: 88, benchmark: 80 },
      { skill: "Inventory Management", score: 75, benchmark: 75 },
      { skill: "Customer Communication", score: 80, benchmark: 78 },
      { skill: "Problem Resolution", score: 70, benchmark: 72 }
    ],
    keyMetrics: [
      { label: "Accuracy Rate", value: `${overallScore}%`, trend: "+5%", positive: true },
      { label: "Avg Response Time", value: "12s", trend: "-2s", positive: true },
      { label: "Completion Rate", value: `${moduleAttempt.percent}%`, trend: "—", positive: true },
      { label: "Customer Satisfaction", value: "4.2/5", trend: "+0.3", positive: true }
    ],
    actionableInsights: [
      {
        title: "Develop Probing Question Skills",
        description: "Practice asking clarifying questions when customers provide vague requests. Review the 'Advanced Customer Communication' module.",
        priority: "high"
      },
      {
        title: "Strengthen Out-of-Stock Handling",
        description: "Study alternative product recommendations and inventory update procedures to handle stock issues more confidently.",
        priority: "medium"
      },
      {
        title: "Maintain Strong Product Knowledge",
        description: "Your SKU and brand recognition is excellent. Continue periodic reviews to stay updated on new products.",
        priority: "low"
      }
    ],
    scenarioPerformance: [
      { scenario: "Exact Product Request", correct: 8, total: 10, accuracy: 80 },
      { scenario: "Vague Product Description", correct: 6, total: 10, accuracy: 60 },
      { scenario: "Inventory Check", correct: 7, total: 8, accuracy: 87 },
      { scenario: "Alternative Suggestions", correct: 5, total: 7, accuracy: 71 }
    ]
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="simulation-performance">
      {/* Header */}
      <div className="performance-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <img src={back_arrow} />
            </button>
            <div className="header-text">
              <h1>Module Performance</h1>
              <p className="subtitle">{performanceData.moduleTitle}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="completion-date">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2H2V14H14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 1V3M5 1V3M2 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Completed {performanceData.completionDate}
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview Card */}
      <div className="score-overview-card">
        <div className="score-main">
          <div className="score-circle">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="54" className="score-bg-circle" />
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                className={`score-progress-circle ${colorByScore(overallScore)}`}
                style={{
                  strokeDasharray: `${(performanceData.overallScore / 100) * 339.292} 339.292`
                }}
              />
            </svg>
            <div className="score-text" >
              <span className={`score-number ${colorByScore(overallScore)}`}>{performanceData.overallScore}</span>
              <span className="score-label">Overall Score</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-detail-item">
              <span className="detail-label">Time Spent</span>
              <span className="detail-value">{performanceData.timeSpent}</span>
            </div>
            <div className="score-detail-item">
              <span className="detail-label">Attempts</span>
              <span className="detail-value">{performanceData.attemptsCount}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="key-metrics">
          {performanceData.keyMetrics.map((metric, idx) => (
            <div key={idx} className="metric-item">
              <span className="metric-label">{metric.label}</span>
              <div className="metric-value-row">
                <span className="metric-value">{metric.value}</span>
                <span className={`metric-trend ${metric.positive ? 'positive' : 'negative'}`}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="performance-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed Analysis
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="overview-content">
          {/* Cognition Evaluation */}
          <div className="evaluation-section">
            <h2 className="section-title">Cognition Evaluation & Feedback</h2>
            <div className="evaluation-grid">
              <div className="evaluation-box strengths">
                <div className="box-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0L12.2451 7.75486H20L13.8775 12.2451L16.1225 20L10 15.5097L3.87746 20L6.12254 12.2451L0 7.75486H7.75486L10 0Z" fill="#15803d"/>
                  </svg>
                  <h3>Strengths</h3>
                </div>
                {performanceData.strengths.length > 0 ? (
                  <div className="evaluation-text">
                    {performanceData.strengths.map((strength, idx) => (
                      <p key={idx}>{strength}</p>
                    ))}
                  </div>
                ) : (
                  <p>No evaluation data available yet.</p>
                )}
              </div>

              <div className="evaluation-box shortcomings">
                <div className="box-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0L10 14M10 18L10 18.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <h3>Areas for Improvement</h3>
                </div>
                {performanceData.shortcomings.length > 0 ? (
                  <div className="evaluation-text">
                    {performanceData.shortcomings.map((shortcoming, idx) => (
                      <p key={idx}>{shortcoming}</p>
                    ))}
                  </div>
                ) : (
                  <p>No evaluation data available yet.</p>
                )}
              </div>
            </div>

            <div className="evaluation-box feedback">
              <div className="box-header">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 2H18V13H6L2 17V2Z" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Overall Feedback</h3>
              </div>
              <p>{performanceData.overallFeedback || 'Complete the module to receive feedback.'}</p>
            </div>
          </div>

          {/* Action Items */}
          <div className="action-items-section">
            <h2 className="section-title">Recommended Next Steps</h2>
            <div className="action-items-grid">
              {performanceData.actionableInsights.map((insight, idx) => (
                <div key={idx} className={`action-item priority-${insight.priority}`}>
                  <div className="action-header">
                    <h4>{insight.title}</h4>
                    <span className={`priority-badge ${insight.priority}`}>
                      {insight.priority === 'high' ? 'High Priority' : insight.priority === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <p>{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="detailed-content">
          {/* Skill Breakdown */}
          <div className="skill-breakdown-section">
            <h2 className="section-title">Skill Performance Breakdown</h2>
            <div className="skill-bars">
              {performanceData.skillBreakdown.map((skill, idx) => (
                <div key={idx} className="skill-bar-item">
                  <div className="skill-bar-header">
                    <span className="skill-name">{skill.skill}</span>
                    <div className="skill-scores">
                      <span className="your-score">{skill.score}%</span>
                      <span className="benchmark-score">Benchmark: {skill.benchmark}%</span>
                    </div>
                  </div>
                  <div className="skill-bar-container">
                    <div 
                      className="skill-bar-fill" 
                      style={{ width: `${skill.score}%` }}
                    />
                    <div 
                      className="benchmark-marker" 
                      style={{ left: `${skill.benchmark}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Performance */}
          <div className="scenario-performance-section">
            <h2 className="section-title">Performance by Scenario Type</h2>
            <div className="scenario-grid">
              {performanceData.scenarioPerformance.map((scenario, idx) => (
                <div key={idx} className="scenario-card">
                  <h4>{scenario.scenario}</h4>
                  <div className="scenario-stats">
                    <div className="scenario-accuracy">
                      <span className="accuracy-number">{scenario.accuracy}%</span>
                      <span className="accuracy-label">Accuracy</span>
                    </div>
                    <div className="scenario-attempts">
                      <span className="attempts-text">{scenario.correct}/{scenario.total} correct</span>
                    </div>
                  </div>
                  <div className="scenario-bar">
                    <div 
                      className="scenario-bar-fill" 
                      style={{ width: `${scenario.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="performance-actions">
        <ActionButton buttonType={"play"} text={"Retake Module"} />
        <ActionButton buttonType={"go"} text={"Return to Modules"} reversed={true} onClick={() => navigate(-1)}/>
      </div>
    </div>
  );
}