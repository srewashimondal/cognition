import './EmployeeHome.css';

export default function EmployeeHome() {
    return (
        <div className="employee-home">
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-content">
                    <h1>Welcome back, Alex! </h1>
                    <p>Continue your learning journey and achieve your goals</p>
                </div>
                <div className="welcome-icon">
                    <div className="icon-placeholder"></div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon courses-icon">📚</div>
                        <div className="stat-info">
                            <h3>10</h3>
                            <p>Total Courses</p>
                            <span className="stat-change positive">+2 this month</span>
                        </div>
                    </div>
                    <button className="see-details-btn">See Details →</button>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon workshop-icon">🎓</div>
                        <div className="stat-info">
                            <h3>4</h3>
                            <p>Workshops</p>
                            <span className="stat-change">Upcoming</span>
                        </div>
                    </div>
                    <button className="see-details-btn">See Details →</button>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon quiz-icon">📊</div>
                        <div className="stat-info">
                            <h3>8/10</h3>
                            <p>Average Quiz Score</p>
                            <span className="stat-change positive">+5% improvement</span>
                        </div>
                    </div>
                    <button className="see-details-btn">See Details →</button>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon cert-icon">🏆</div>
                        <div className="stat-info">
                            <h3>3</h3>
                            <p>Total Certificates</p>
                            <span className="stat-change">Earned</span>
                        </div>
                    </div>
                    <button className="see-details-btn">See Details →</button>
                </div>
            </div>

            {/* Learning Progress & Goals Section */}
            <div className="two-column-section">
                {/* Learning Streak */}
                <div className="streak-card">
                    <div className="streak-header">
                        <h3>🔥 Learning Streak</h3>
                    </div>
                    <div className="streak-content">
                        <div className="streak-number">5 Days</div>
                        <p className="streak-text">Keep it up! You're on a roll</p>
                        <div className="streak-days">
                            <div className="day-circle active">M</div>
                            <div className="day-circle active">T</div>
                            <div className="day-circle active">W</div>
                            <div className="day-circle active">T</div>
                            <div className="day-circle active">F</div>
                            <div className="day-circle">S</div>
                            <div className="day-circle">S</div>
                        </div>
                    </div>
                </div>

                {/* Monthly Learning Goal */}
                <div className="goal-card">
                    <div className="goal-header">
                        <h3>🎯 Monthly Learning Goal</h3>
                    </div>
                    <div className="goal-content">
                        <div className="goal-stats">
                            <span className="goal-current">12</span>
                            <span className="goal-divider">/</span>
                            <span className="goal-target">20 hours</span>
                        </div>
                        <div className="goal-progress-bar">
                            <div className="goal-progress-fill" style={{width: '60%'}}></div>
                        </div>
                        <p className="goal-text">60% complete - You're doing great!</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="section">
                <div className="section-header">
                    <h2>Upcoming Deadlines</h2>
                </div>
                <div className="deadlines-list">
                    <div className="deadline-item urgent">
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">24</span>
                                <span className="date-month">Jan</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Customer Service Excellence - Final Quiz</h4>
                            <p>Due in 3 days</p>
                        </div>
                        <div className="deadline-badge urgent-badge">Urgent</div>
                    </div>
                    <div className="deadline-item">
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">28</span>
                                <span className="date-month">Jan</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Figma Design Project Submission</h4>
                            <p>Due in 7 days</p>
                        </div>
                        <div className="deadline-badge">Upcoming</div>
                    </div>
                    <div className="deadline-item">
                        <div className="deadline-date">
                            <div className="date-box">
                                <span className="date-day">02</span>
                                <span className="date-month">Feb</span>
                            </div>
                        </div>
                        <div className="deadline-info">
                            <h4>Time Management Workshop Attendance</h4>
                            <p>Due in 12 days</p>
                        </div>
                        <div className="deadline-badge">Upcoming</div>
                    </div>
                </div>
            </div>

            {/* Recent Enrolled Courses */}
            <div className="section">
                <div className="section-header">
                    <h2>Recent Enrolled Course (12)</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="courses-grid">
                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview figma-preview">
                                <div className="preview-content">
                                    <span className="preview-text">Nothing great is made alone.</span>
                                </div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Figma for Beginners: Fundamentals of Figma App</h3>
                            <div className="course-meta">
                                <span className="progress-text">23%</span>
                                <span className="student-count">🧑‍🎓 147 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '23%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview webflow-preview">
                                <div className="preview-bar"></div>
                                <div className="preview-bar short"></div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Complete Web Design: from Figma to Webflow</h3>
                            <div className="course-meta">
                                <span className="progress-text">50%</span>
                                <span className="student-count">🧑‍🎓 145,075 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '50%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview class-preview">
                                <div className="preview-bar teal"></div>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Figma 2023: The Absolute Beginner to Pro Class in und...</h3>
                            <div className="course-meta">
                                <span className="progress-text">69%</span>
                                <span className="student-count">🧑‍🎓 241,133 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '69%'}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="course-card">
                        <div className="course-thumbnail">
                            <div className="course-preview notion-preview">
                                <div className="notion-grid">
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                    <div className="notion-item"></div>
                                </div>
                                <span className="notion-text">Personal Productivity</span>
                            </div>
                        </div>
                        <div className="course-info">
                            <p className="course-author">A Course by Rafasuddin Duana</p>
                            <h3 className="course-title">Mastering Managing Project with Notion</h3>
                            <div className="course-meta">
                                <span className="progress-text">90%</span>
                                <span className="student-count">🧑‍🎓 111 Students</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{width: '90%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills & Badges */}
            <div className="section">
                <div className="section-header">
                    <h2>🏅 Skills & Badges Earned</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="badges-grid">
                    <div className="badge-card">
                        <div className="badge-icon gold">🏆</div>
                        <h4>Design Master</h4>
                        <p>Completed 5 design courses</p>
                        <span className="badge-date">Earned Dec 2024</span>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon silver">⭐</div>
                        <h4>Quick Learner</h4>
                        <p>Finished 3 courses in 1 month</p>
                        <span className="badge-date">Earned Jan 2025</span>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon bronze">🎯</div>
                        <h4>Team Player</h4>
                        <p>Participated in 10 workshops</p>
                        <span className="badge-date">Earned Nov 2024</span>
                    </div>
                    <div className="badge-card locked">
                        <div className="badge-icon locked-icon">🔒</div>
                        <h4>Expert Level</h4>
                        <p>Complete 10 courses to unlock</p>
                        <span className="badge-progress">8/10 courses</span>
                    </div>
                </div>
            </div>

            {/* Recommended Courses */}
            <div className="section">
                <div className="section-header">
                    <h2>💡 Recommended For You</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="recommended-grid">
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-1">
                                <span className="rec-text">Advanced</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Based on your progress</span>
                            <h4>Advanced Figma Techniques</h4>
                            <p>Take your design skills to the next level</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-2">
                                <span className="rec-text">Leadership</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Popular in your department</span>
                            <h4>Effective Team Communication</h4>
                            <p>Master the art of workplace collaboration</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                    <div className="recommended-card">
                        <div className="recommended-thumbnail">
                            <div className="recommended-preview rec-3">
                                <span className="rec-text">Productivity</span>
                            </div>
                        </div>
                        <div className="recommended-info">
                            <span className="recommended-tag">Complete your collection</span>
                            <h4>Project Management Essentials</h4>
                            <p>Learn to manage projects like a pro</p>
                            <button className="enroll-btn">Enroll Now</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Enrolled Webinar */}
            <div className="section">
                <div className="section-header">
                    <h2>Recent Enrolled Webinar (8)</h2>
                    <button className="view-all-btn">View All</button>
                </div>
                <div className="webinar-grid">
                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview">
                                <span className="webinar-tag">Time Management</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>

                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview">
                                <span className="webinar-tag">Navigating Workplace</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>

                    <div className="webinar-card">
                        <div className="webinar-thumbnail">
                            <div className="webinar-preview upcoming">
                                <span className="webinar-tag">Customer Service</span>
                            </div>
                        </div>
                        <div className="webinar-info">
                            <p className="webinar-author">By John Doe</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}