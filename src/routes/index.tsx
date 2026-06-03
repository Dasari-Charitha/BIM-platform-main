import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: Index,
});

const curriculumPhases = [
  {
    title: "Phase 1",
    subtitle: "Foundations",
    modules: [
      "Digital Transformation in Civil Engineering",
      "Introduction to BIM",
      "The Construction Lifecycle & BIM Integration",
      "CAD vs BIM: Understanding the Shift",
      "BIM Standards, Protocols & Global Frameworks",
      "BIM Dimensions: 3D to 7D",
      "Infrastructure Digitization & Industry Landscape",
    ],
  },
  {
    title: "Phase 2",
    subtitle: "BIM Fundamentals",
    modules: [
      "BIM Workflow & Project Information Flow",
      "BIM Collaboration & Multi-Disciplinary Coordination",
      "BIM Data Management & Information Delivery",
      "Levels of Development (LOD) in BIM",
      "BIM Object Libraries & Families",
      "BIM Coordination Workflows",
      "BIM for Structural Engineering",
    ],
  },
  {
    title: "Phase 3",
    subtitle: "Construction & Project Management",
    modules: [
      "Construction Planning & Scheduling with BIM",
      "Construction Estimation & 5D BIM",
      "Bill of Quantities (BOQ) & Tendering",
      "Construction Site Management",
      "Construction Safety Planning with BIM",
      "Resource Management & Procurement in BIM",
      "Quality Control & As-Built Documentation",
    ],
  },
  {
    title: "Phase 4",
    subtitle: "Software Exposure",
    modules: [
      "Autodesk Revit: Interface & Navigation",
      "Autodesk Revit: Basic Modeling Workflow",
      "AutoCAD for Civil Engineers: Fundamentals",
      "Navisworks: Model Review & Coordination",
      "BIM 360 / ACC: Cloud Collaboration Platform",
      "Clash Detection & Model Coordination Basics",
      "BIM Software Ecosystem & Tool Integration",
    ],
  },
  {
    title: "Phase 5",
    subtitle: "Smart Infrastructure & Innovation",
    modules: [
      "Smart Cities & Digital Infrastructure",
      "Green Buildings & Sustainable Construction",
      "Digital Twins in Construction",
      "IoT in Construction & Smart Site Management",
      "AI & Machine Learning in BIM",
      "Drones, AR & VR in Construction",
      "Future of BIM & Industry 4.0 in Civil Engineering",
    ],
  },
  {
    title: "Phase 6",
    subtitle: "Advanced Industry Applications",
    modules: [
      "BIM in Metro Rail Projects",
      "BIM in Bridges & Highway Infrastructure",
      "BIM in Airports & Large Infrastructure",
      "BIM in Commercial & Residential Buildings",
      "BIM in Facility Management & Infrastructure Analytics",
    ],
  },
  {
    title: "Phase 7",
    subtitle: "Project Implementation",
    modules: [
      "Team Collaboration & BIM Workflows",
      "BIM Documentation, Reporting & Communication",
      "Presentation Skills for Engineers",
      "Case Study Analysis: Real-World BIM Projects",
      "Industry Readiness, Career Planning & Capstone Launch",
    ],
  },
];

function Index() {
  const [showMore, setShowMore] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="bim-page">
      <header className="bim-navbar">
        <div className="bim-brand">
          <img src={logo} alt="SkillArion logo" />
          <div>
            <h2>SkillArion</h2>
            <p>Building Information Modeling</p>
          </div>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#learn">What you'll learn</a>
          <a href="#tracker">Tracker</a>
          <a href="#modules">Curriculum</a>
          <a href="#roadmap">Roadmap</a>
        </nav>

        <div className="bim-nav-actions">
          <ThemeToggle className="bim-theme-toggle" />

          <Link to="/auth" className="bim-login-btn">
            Student access
          </Link>
        </div>
      </header>

      <main>
        <section id="home" className="bim-hero">
          <p className="bim-eyebrow">Learning Plan</p>
          <h1>Building Information Modeling</h1>
          <p className="bim-hero-text">
            A 45-day BIM Fundamentals and Industry Readiness program for civil
            engineering students with locked lesson sequencing, lesson quizzes,
            module assessments, and visible progress tracking.
          </p>

          <div className="bim-stats">
            <div>
              <h3>45</h3>
              <p>Modules</p>
            </div>
            <div>
              <h3>180</h3>
              <p>Lessons</p>
            </div>
            <div>
              <h3>900</h3>
              <p>Lesson Quiz Questions</p>
            </div>
            <div>
              <h3>675</h3>
              <p>Module Assessment Questions</p>
            </div>
          </div>
        </section>

        <section id="about" className="bim-section">
          <h2>About this learning plan</h2>
          <p>
            The Building Information Modeling learning plan is designed for
            civil engineering students who want to understand how modern
            construction projects are planned, coordinated, visualized, and
            managed using digital tools.
          </p>

          {showMore && (
            <div>
              <p>
                This program introduces students to BIM fundamentals,
                construction lifecycle workflows, BIM dimensions, model
                coordination, quantity takeoff, scheduling, digital twins, smart
                infrastructure, and industry readiness skills.
              </p>
              <p>
                Students must complete the current lesson and pass its quiz
                before moving to the next lesson. After completing all four
                lessons in a module, the student takes a module quiz before
                unlocking the next module.
              </p>
            </div>
          )}

          <button
            className="bim-show-btn"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show less" : "Show more"}
          </button>
        </section>

        <section id="learn" className="bim-section">
          <p className="bim-eyebrow">What you'll learn</p>
          <h2>Skills students will gain after completing this BIM program</h2>

          <div className="bim-learn-grid">
            {[
              "BIM fundamentals",
              "Model-based workflows",
              "Software awareness",
              "Coordination skills",
              "Planning and estimation",
              "Industry readiness",
            ].map((item, index) => (
              <div className="bim-card" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item}</h3>
                <p>
                  Build practical understanding of BIM concepts and how they
                  apply to civil engineering project workflows.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="tracker" className="bim-section">
          <p className="bim-eyebrow">Status Tracking</p>
          <h2>Students unlock the next step only after completion.</h2>

          <div className="bim-tracker">
            {["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Module Quiz"].map(
              (item, index) => (
                <div
                  className={`bim-step ${
                    index < 2 ? "complete" : index === 2 ? "current" : "locked"
                  }`}
                  key={item}
                >
                  <span>{index === 4 ? "15Q" : `0${index + 1}`}</span>
                  <h3>{item}</h3>
                  <p>
                    {index < 2
                      ? "Complete + 5Q quiz passed"
                      : index === 2
                        ? "In progress"
                        : "Locked until previous step"}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        <section id="modules" className="bim-section">
          <p className="bim-eyebrow">Complete 45-Day Curriculum</p>
          <h2>Explore the BIM curriculum by phase</h2>

          <div className="bim-phase-tabs">
            {curriculumPhases.map((phase, index) => (
              <button
                key={phase.title}
                className={activePhase === index ? "active" : ""}
                onClick={() => setActivePhase(index)}
              >
                <span>{phase.title}</span>
                <strong>{phase.subtitle}</strong>
              </button>
            ))}
          </div>

          <div className="bim-phase-viewer">
            <div className="bim-phase-summary">
              <p>{curriculumPhases[activePhase].title}</p>
              <h3>{curriculumPhases[activePhase].subtitle}</h3>
              <span>
                {curriculumPhases[activePhase].modules.length} modules · 4
                lessons per module · 15-question module quiz
              </span>
            </div>

            <div className="bim-phase-modules">
              {curriculumPhases[activePhase].modules.map((moduleTitle, index) => {
                const globalModuleNumber =
                  curriculumPhases
                    .slice(0, activePhase)
                    .reduce((total, phase) => total + phase.modules.length, 0) +
                  index +
                  1;

                let status = "locked";
                let label = "Locked";
                let completedLessons = 0;

                if (globalModuleNumber <= 2) {
                  status = "complete";
                  label = "Complete";
                  completedLessons = 4;
                } else if (globalModuleNumber === 3) {
                  status = "current";
                  label = "In progress";
                  completedLessons = 2;
                }

                return (
                  <div className={`bim-module-card ${status}`} key={moduleTitle}>
                    <div className="bim-module-top">
                      <span>Module {String(globalModuleNumber).padStart(2, "0")}</span>
                      <b>{label}</b>
                    </div>
                    <h4>{moduleTitle}</h4>
                    <p>{completedLessons}/4 lessons completed</p>
                    <div className="bim-mini-progress">
                      {[1, 2, 3, 4].map((lesson) => (
                        <i
                          key={lesson}
                          className={lesson <= completedLessons ? "done" : ""}
                        />
                      ))}
                    </div>
                    <small>5Q per lesson · 15Q module quiz</small>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="roadmap" className="bim-roadmap">
          <p className="bim-eyebrow">Career Roadmap</p>
          <h2>From civil engineering student to BIM-ready professional</h2>

          <div className="bim-roadmap-grid">
            {[
              "Understand BIM",
              "Build Digital Models",
              "Coordinate Projects",
              "Plan, Estimate, Manage",
              "Become Industry Ready",
            ].map((item, index) => (
              <div className="bim-roadmap-card" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item}</h3>
                <p>
                  Move step by step through the digital construction workflow
                  used in professional BIM projects.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
