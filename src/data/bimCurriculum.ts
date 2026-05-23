import modules1to15 from "@/content/modules-1-15.json";
import modules16to30 from "@/content/modules-16-30.json";
import modules31to45 from "@/content/modules-31-45.json";
export type QuizQuestion = {
  question: string;
  options: string[];
  answer?: number;
  answers?: number[];
  type?: "single" | "multiple";
};

export type Lesson = {
  title: string;
  durationMinutes: number;
  content: string[];
  quiz: QuizQuestion[];
};

export type BimModule = {
  id: number;
  title: string;
  phase: string;
  objective: string;
  practicalActivity: string;
  industryApplication: string;
  learningOutcome: string;
  durationMinutes: number;
  lessons: Lesson[];
  moduleQuiz: QuizQuestion[];
};

type CustomModule = Partial<BimModule> & {
  id: number;
};

const pdfModules = [
  {
    "id": 1,
    "title": "DIGITAL TRANSFORMATION IN CIVIL ENGINEERING",
    "objective": "Understand how digitalization is reshaping the civil engineering industry.",
    "practicalActivity": "Prepare a comparison chart: Traditional vs Digital Construction workflow",
    "industryApplication": "Global firms like Laing O'Rourke, L&T, and Turner Construction adopting digital- first strategies",
    "learningOutcome": "Students can articulate the need and scope of digital transformation in their profession.",
    "lessonTitles": [
      "The evolution of civil engineering from paper to digital",
      "Key drivers of digital transformation in construction",
      "Industry 4.0 and its impact on infrastructure",
      "The role of engineers in a digitized construction ecosystem"
    ]
  },
  {
    "id": 2,
    "title": "INTRODUCTION TO BIM",
    "objective": "Build a foundational understanding of what BIM is, how it differs from CAD, and its role in construction.",
    "practicalActivity": "Study real-world BIM project images and identify BIM elements on screen",
    "industryApplication": "UK Mandate for BIM Level 2, BIM adoption in Indian smart city projects",
    "learningOutcome": "Students understand BIM as a collaborative process and can differentiate it from traditional drafting.",
    "lessonTitles": [
      "What is Building Information Modeling (BIM)?",
      "BIM vs CAD – concepts and key differences",
      "The BIM maturity model (Levels 0 to 3)",
      "BIM as a process, not just a software",
      "Key stakeholders in a BIM environment",
      "Overview of global BIM adoption"
    ]
  },
  {
    "id": 3,
    "title": "THE CONSTRUCTION LIFECYCLE & BIM INTEGRATION",
    "objective": "Map the stages of a construction project and understand how BIM integrates into each stage.",
    "practicalActivity": "Map a local infrastructure project lifecycle and identify where BIM adds value",
    "industryApplication": "Airport and metro projects using BIM across entire project lifecycle",
    "learningOutcome": "Students can describe the end-to-end role of BIM across a project's life.",
    "lessonTitles": [
      "Project lifecycle: Pre-design, Design, Construction, Operations, Demolition",
      "BIM applications at each lifecycle stage",
      "The concept of a 'single source of truth' in BIM",
      "Common Information Environment (CIE)",
      "BIM data handover between project phases"
    ]
  },
  {
    "id": 4,
    "title": "CAD VS BIM: UNDERSTANDING THE SHIFT",
    "objective": "Understand the technical and conceptual differences between CAD and BIM.",
    "practicalActivity": "Review sample 2D CAD drawings and equivalent BIM models, note the differences",
    "industryApplication": "Infrastructure firms mandating BIM adoption for tenders above ₹500 crore in India",
    "learningOutcome": "Students can explain why BIM is superior to CAD for complex construction projects.",
    "lessonTitles": [
      "Evolution from manual drafting to CAD to BIM",
      "2D drawings vs 3D intelligent models",
      "Parametric modeling vs geometry-based drafting",
      "BIM objects and their embedded data",
      "Why firms are transitioning from CAD to BIM",
      "Limitations of CAD in complex projects"
    ]
  },
  {
    "id": 5,
    "title": "BIM STANDARDS, PROTOCOLS & GLOBAL FRAMEWORKS",
    "objective": "Familiarize students with key BIM standards, government mandates, and protocols used in the industry.",
    "practicalActivity": "Read a sample BIM Execution Plan document and identify its key components",
    "industryApplication": "Government of India smart city and PMGSY road projects adopting BIM mandates",
    "learningOutcome": "Students understand BIM governance, standards, and documentation requirements.",
    "lessonTitles": [
      "ISO 19650 – BIM international standard overview",
      "National BIM Standards and India's BIM Policy",
      "BIM Execution Plan (BEP): purpose and structure",
      "Information Delivery Milestones (IDM)",
      "Level of Development (LOD) – 100 to 500",
      "BIM roles: BIM Manager, Coordinator, Modeler"
    ]
  },
  {
    "id": 6,
    "title": "BIM DIMENSIONS: 3D TO 7D",
    "objective": "Understand the seven dimensions of BIM and their practical applications in construction.",
    "practicalActivity": "Review a 4D BIM simulation video of a construction project and identify sequencing",
    "industryApplication": "Dubai, Singapore, and Mumbai metro projects using 4D-5D BIM for scheduling and cost control",
    "learningOutcome": "Students can explain BIM dimensions and identify their practical uses.",
    "lessonTitles": [
      "3D BIM – 3D spatial visualization and modeling",
      "4D BIM – Time simulation and construction sequencing",
      "5D BIM – Cost estimation and budget management",
      "6D BIM – Sustainability and energy analysis",
      "7D BIM – Facilities management and operations",
      "Real-world applications of multi-dimensional BIM"
    ]
  },
  {
    "id": 7,
    "title": "INFRASTRUCTURE DIGITIZATION & INDUSTRY LANDSCAPE",
    "objective": "Understand the global and Indian landscape of digital infrastructure and BIM adoption.",
    "practicalActivity": "Research and present: Top 3 BIM project case studies from India",
    "industryApplication": "Bangalore Metro, Mumbai Coastal Road, NHAI highway projects using BIM",
    "learningOutcome": "Students gain awareness of the industry landscape and career potential in BIM.",
    "lessonTitles": [
      "Global BIM market size and growth trends",
      "BIM adoption in India: current status and government push",
      "Key sectors driving BIM growth: Airports, Metros, Highways, Smart Cities",
      "Top BIM-adopting companies in India and globally",
      "Career landscape in BIM and digital construction",
      "Overview of digital construction tools and platforms"
    ]
  },
  {
    "id": 8,
    "title": "BIM WORKFLOW & PROJECT INFORMATION FLOW",
    "objective": "Understand how information flows in a BIM-based project from inception to delivery.",
    "practicalActivity": "Trace an information flow diagram for a residential building project using BIM",
    "industryApplication": "Aconex and BIM 360 used by L&T and Shapoorji Pallonji for project info management",
    "learningOutcome": "Students can describe BIM information workflows and identify data exchange protocols.",
    "lessonTitles": [
      "The BIM workflow from design to construction",
      "Project Information Model (PIM) vs Asset Information Model (AIM)",
      "Information flow between architects, engineers, and contractors",
      "Data exchange formats: IFC, COBie, BCF",
      "BIM collaboration platforms overview",
      "Common data environments (CDE)"
    ]
  },
  {
    "id": 9,
    "title": "BIM COLLABORATION & MULTI-DISCIPLINARY COORDINATION",
    "objective": "Understand how BIM enables collaboration between architects, structural engineers, MEP engineers, and contractors.",
    "practicalActivity": "Review a federated model screenshot and identify three clash types",
    "industryApplication": "Commercial building projects where MEP and structural clash detection saved millions",
    "learningOutcome": "Students understand BIM's role in team collaboration and clash prevention.",
    "lessonTitles": [
      "Multi-disciplinary design coordination using BIM",
      "Federated models: combining architectural, structural, MEP",
      "Clash detection: hard clash, soft clash, workflow clash",
      "Role of the BIM Coordinator in a project",
      "Collaborative BIM platforms and access management",
      "Coordination meetings and model review processes"
    ]
  },
  {
    "id": 10,
    "title": "BIM DATA MANAGEMENT & INFORMATION DELIVERY",
    "objective": "Understand how BIM manages construction data throughout the project lifecycle.",
    "practicalActivity": "Create a simple attribute table for 5 construction elements (walls, columns, beams, doors, windows)",
    "industryApplication": "Airport facility managers using BIM data for maintenance management post- construction",
    "learningOutcome": "Students can identify, describe, and organize BIM data attributes.",
    "lessonTitles": [
      "Types of data in BIM: graphical vs non-graphical",
      "Attributes, parameters, and properties of BIM objects",
      "Naming conventions and data standards",
      "Model auditing and quality control",
      "Data extraction for reports and schedules",
      "Using BIM data for facility management"
    ]
  },
  {
    "id": 11,
    "title": "LEVELS OF DEVELOPMENT (LOD) IN BIM",
    "objective": "Understand LOD framework and its role in model quality and contract deliverables.",
    "practicalActivity": "Categorize images of BIM models into appropriate LOD levels",
    "industryApplication": "MEP contractors in UAE using LOD 400 for prefabrication and off-site manufacturing",
    "learningOutcome": "Students can apply the LOD framework to real-world BIM deliverables.",
    "lessonTitles": [
      "LOD 100 – Conceptual design and massing",
      "LOD 200 – Schematic design with approximate geometry",
      "LOD 300 – Detailed design with exact geometry and specifications",
      "LOD 350 – Construction-ready model with coordination data",
      "LOD 400 – Fabrication-level detail",
      "LOD 500 – As-built model for facility management",
      "Applying LOD in project contracts and deliverables"
    ]
  },
  {
    "id": 12,
    "title": "BIM OBJECT LIBRARIES & FAMILIES",
    "objective": "Understand BIM object libraries, parametric families, and their role in efficient modeling.",
    "practicalActivity": "Browse a BIM object library and identify 10 structural and architectural objects",
    "industryApplication": "Precast manufacturers providing BIM-ready objects for structural projects",
    "learningOutcome": "Students understand BIM families and can navigate BIM content libraries.",
    "lessonTitles": [
      "What are BIM objects and families?",
      "System families vs loadable families vs in-place families",
      "Using standard BIM libraries (NBS, Revit content library)",
      "Creating and modifying simple parametric families",
      "BIM content management in a project",
      "Sharing and managing families across teams"
    ]
  },
  {
    "id": 13,
    "title": "BIM COORDINATION WORKFLOWS",
    "objective": "Learn industry-standard workflows for model coordination between project stakeholders.",
    "practicalActivity": "Follow a sample coordination workflow for a 5-storey commercial building",
    "industryApplication": "Real coordination workflows from Indian metro rail projects",
    "learningOutcome": "Students can follow and describe a multi-disciplinary BIM coordination workflow.",
    "lessonTitles": [
      "Model Coordination Plan: purpose and structure",
      "Coordination zones and discipline breakdowns",
      "Grid setup and shared project coordinates",
      "Model handover protocols",
      "Issue tracking and RFI management in BIM",
      "BIM audit checklists and model reviews"
    ]
  },
  {
    "id": 14,
    "title": "BIM FOR STRUCTURAL ENGINEERING",
    "objective": "Understand how BIM is applied specifically in structural engineering analysis, design, and coordination.",
    "practicalActivity": "Review structural BIM model screenshots and identify core elements",
    "industryApplication": "High-rise towers in Mumbai and Hyderabad using integrated structural BIM workflows",
    "learningOutcome": "Students understand how structural engineering is implemented within BIM workflows.",
    "lessonTitles": [
      "Structural BIM elements: foundations, columns, beams, slabs, walls",
      "Integrating structural analysis with BIM (e.g., Revit + ETABS)",
      "Structural model quality control",
      "Rebar modeling and detailing in BIM",
      "BIM for precast and prefabricated structures",
      "Case study: Structural BIM in a high-rise building"
    ]
  },
  {
    "id": 15,
    "title": "CONSTRUCTION PLANNING & SCHEDULING WITH BIM",
    "objective": "Understand how 4D BIM enables construction planning, scheduling, and timeline management.",
    "practicalActivity": "Review a 4D BIM simulation and map construction tasks to model elements",
    "industryApplication": "L&T Construction using 4D BIM for metro station construction scheduling",
    "learningOutcome": "Students can describe how 4D BIM enables visual project planning.",
    "lessonTitles": [
      "Fundamentals of construction planning",
      "Work Breakdown Structure (WBS) and construction tasks",
      "Introduction to 4D BIM and time simulation",
      "Gantt charts vs BIM-based scheduling",
      "Linking model elements to project schedules",
      "Visual construction simulation and milestone tracking"
    ]
  },
  {
    "id": 16,
    "title": "CONSTRUCTION ESTIMATION & 5D BIM",
    "objective": "Understand 5D BIM and how it integrates cost with the 3D model for accurate estimation.",
    "practicalActivity": "Perform a basic quantity takeoff from a BIM model view using measurement notes",
    "industryApplication": "Real estate developers using 5D BIM for pre-sales cost estimation and investor reporting",
    "learningOutcome": "Students understand the connection between BIM models and cost estimation.",
    "lessonTitles": [
      "Basics of construction cost estimation",
      "Bill of Quantities (BOQ): purpose and structure",
      "Introduction to 5D BIM: cost integrated with model",
      "Quantity takeoff from BIM models",
      "Cost databases and rate analysis in BIM",
      "BIM-based budget monitoring during construction"
    ]
  },
  {
    "id": 17,
    "title": "BILL OF QUANTITIES (BOQ) & TENDERING",
    "objective": "Learn how to prepare and interpret a BOQ in the context of BIM-enabled projects.",
    "practicalActivity": "Review a sample BOQ for a residential villa and identify 10 key items",
    "industryApplication": "Government infrastructure tenders in India requiring BIM-based BOQs",
    "learningOutcome": "Students can read, interpret, and discuss a BOQ in a construction project.",
    "lessonTitles": [
      "What is a BOQ and why it matters",
      "BOQ structure: sections, items, units, rates",
      "NMM4 and CESMM3 measurement standards",
      "BOQ from BIM vs manual quantity take-off",
      "Digital tendering process overview",
      "Using BIM data for competitive tendering"
    ]
  },
  {
    "id": 18,
    "title": "CONSTRUCTION SITE MANAGEMENT",
    "objective": "Understand the fundamentals of construction site management and how BIM supports it.",
    "practicalActivity": "Study a site layout plan and identify BIM-integrated site management elements",
    "industryApplication": "Shapoorji Pallonji using mobile BIM for on-site quality checks",
    "learningOutcome": "Students understand how BIM connects design intent to on-site execution.",
    "lessonTitles": [
      "Site organization and temporary works planning",
      "Site logistics: material delivery, storage, movement",
      "Daily and weekly site reporting practices",
      "Mobile BIM: using models on-site",
      "BIM for issue logging and site observations",
      "RFI and submittal workflows in construction"
    ]
  },
  {
    "id": 19,
    "title": "RESOURCE MANAGEMENT & PROCUREMENT IN BIM",
    "objective": "Understand how BIM supports resource planning, procurement, and supply chain management.",
    "practicalActivity": "Create a resource planning worksheet for a simple construction phase using BIM data",
    "industryApplication": "AECOM and Turner Construction using BIM for supply chain and logistics optimization",
    "learningOutcome": "Students understand how BIM data drives resource planning and procurement.",
    "lessonTitles": [
      "Resource management in construction: materials, labor, equipment",
      "BIM-linked procurement planning",
      "Material scheduling from BIM data",
      "Subcontractor coordination using shared BIM models",
      "Procurement lead times and just-in-time delivery",
      "Digital material tracking in construction"
    ]
  },
  {
    "id": 20,
    "title": "CONSTRUCTION SAFETY PLANNING WITH BIM",
    "objective": "Understand how BIM is used for safety planning, hazard identification, and risk management on site.",
    "practicalActivity": "Identify safety hazards in a construction BIM model view using visual analysis",
    "industryApplication": "Mumbai Metro safety planning using BIM-based hazard visualization",
    "learningOutcome": "Students can describe how BIM enhances construction safety planning.",
    "lessonTitles": [
      "Introduction to construction safety and regulations",
      "Common construction hazards and risk management",
      "BIM for safety visualization and planning",
      "4D BIM for safety sequence analysis",
      "Digital safety protocols and checklist integration",
      "Case study: BIM for safety in high-rise and underground construction"
    ]
  },
  {
    "id": 21,
    "title": "QUALITY CONTROL & AS-BUILT DOCUMENTATION",
    "objective": "Understand BIM's role in quality management and as-built documentation through the construction process.",
    "practicalActivity": "Compare a design model vs an as-built model image and identify differences",
    "industryApplication": "Smart building developers using BIM as-built data for facilities management post- handover",
    "learningOutcome": "Students understand quality management and final handover documentation using BIM.",
    "lessonTitles": [
      "Quality management in construction: ISO 9001 context",
      "BIM for quality inspection and punch list management",
      "As-built modeling: capturing site changes in the BIM model",
      "Digital handover and COBie data exchange",
      "Document management and version control",
      "Final inspection and project closeout with BIM"
    ]
  },
  {
    "id": 22,
    "title": "AUTODESK REVIT – INTERFACE & NAVIGATION",
    "objective": "Familiarize students with the Revit environment, interface, and basic navigation concepts.",
    "practicalActivity": "Open a sample Revit file and navigate through various views; identify elements",
    "industryApplication": "Used by architects and structural engineers in India, UAE, and US projects",
    "learningOutcome": "Students can navigate the Revit interface and identify its core components.",
    "lessonTitles": [
      "Autodesk Revit: purpose and industry use",
      "The Revit interface: ribbon, project browser, properties panel",
      "Understanding views: floor plans, sections, elevations, 3D",
      "Navigating 3D models: orbit, pan, zoom",
      "Project templates and project setup",
      "Model families and basic element types in Revit"
    ]
  },
  {
    "id": 23,
    "title": "AUTODESK REVIT – BASIC MODELING WORKFLOW",
    "objective": "Understand the basic workflow for creating and modifying elements in Revit.",
    "practicalActivity": "Follow a guided tutorial: create a simple single-storey building in Revit",
    "industryApplication": "Residential and commercial building design firms using Revit as primary BIM platform",
    "learningOutcome": "Students complete a guided Revit modeling exercise and understand the basic workflow.",
    "lessonTitles": [
      "Creating walls, floors, roofs, and ceilings",
      "Placing doors and windows from families",
      "Adding structural columns and beams",
      "Working with grids and levels",
      "Basic annotation: dimensions, tags, text",
      "Model display modes and visual graphics settings"
    ]
  },
  {
    "id": 24,
    "title": "AUTOCAD FOR CIVIL ENGINEERS – FUNDAMENTALS",
    "objective": "Understand the role of AutoCAD in civil engineering and its relationship with BIM.",
    "practicalActivity": "Review a civil engineering AutoCAD drawing and identify layers and annotations",
    "industryApplication": "NHAI and state PWD departments using AutoCAD for road and bridge documentation",
    "learningOutcome": "Students understand AutoCAD fundamentals and their integration with BIM.",
    "lessonTitles": [
      "AutoCAD interface and workspace introduction",
      "Basic drawing commands: line, arc, polyline, circle",
      "Layer management and drawing standards",
      "Dimensioning and annotation",
      "Drawing civil engineering elements: roads, profiles, contours",
      "Exporting AutoCAD drawings to BIM workflows"
    ]
  },
  {
    "id": 25,
    "title": "NAVISWORKS – MODEL REVIEW & COORDINATION",
    "objective": "Understand how Navisworks is used for model review, clash detection, and project coordination.",
    "practicalActivity": "Review a Navisworks clash report from a sample project and categorize clashes",
    "industryApplication": "MEP coordination in high-rise buildings using Navisworks to avoid costly site changes",
    "learningOutcome": "Students understand clash detection workflow and can interpret Navisworks results.",
    "lessonTitles": [
      "Introduction to Autodesk Navisworks",
      "Importing and aggregating models from different software",
      "Navigating models in Navisworks",
      "Clash Detective: setting up clash tests",
      "Reviewing and categorizing clashes",
      "Creating clash reports and sharing with the team"
    ]
  },
  {
    "id": 26,
    "title": "BIM 360 / ACC – CLOUD COLLABORATION PLATFORM",
    "objective": "Understand Autodesk BIM 360 (ACC) as a cloud platform for project collaboration.",
    "practicalActivity": "Explore a sample BIM 360 project: navigate documents, issues, and model viewer",
    "industryApplication": "L&T, AFCONS, and Tata Projects using BIM 360 for project collaboration in India",
    "learningOutcome": "Students understand cloud-based BIM collaboration and can navigate BIM 360.",
    "lessonTitles": [
      "Introduction to Autodesk Construction Cloud (ACC)",
      "Project setup and user management on BIM 360",
      "Document management: uploading, versioning, sharing",
      "Model viewer: navigating models in the browser",
      "Issue tracking and RFI management on BIM 360",
      "Mobile access: using BIM 360 on tablets and phones"
    ]
  },
  {
    "id": 27,
    "title": "CLASH DETECTION & MODEL COORDINATION BASICS",
    "objective": "Understand the process of clash detection and model coordination in a BIM project.",
    "practicalActivity": "Identify and categorize 5 clashes from a federated model coordination report",
    "industryApplication": "Hospital and airport MEP coordination projects using systematic clash detection processes",
    "learningOutcome": "Students can perform basic clash detection analysis and communicate findings.",
    "lessonTitles": [
      "Types of clashes: hard, soft, and workflow",
      "Clash detection process and tolerance settings",
      "Prioritizing and resolving clashes",
      "Coordination meetings and clash review workflows",
      "Documenting resolutions: BCF format",
      "Impact of unresolved clashes on construction cost"
    ]
  },
  {
    "id": 28,
    "title": "BIM SOFTWARE ECOSYSTEM & TOOL INTEGRATION",
    "objective": "Understand the landscape of BIM software and how different tools integrate within a BIM workflow.",
    "practicalActivity": "Create a software ecosystem diagram for a typical infrastructure project",
    "industryApplication": "Multi-software environments used in major Indian infrastructure firms",
    "learningOutcome": "Students understand how BIM tools integrate and communicate in a project ecosystem.",
    "lessonTitles": [
      "Overview of the BIM software ecosystem",
      "Interoperability and data exchange between tools",
      "IFC file format and open BIM standards",
      "Other BIM tools: Tekla, ArchiCAD, Civil 3D, OpenBIM",
      "BIM to analysis: Revit to ETABS/STAAD integration",
      "Selecting the right software for project requirements"
    ]
  },
  {
    "id": 29,
    "title": "SMART CITIES & DIGITAL INFRASTRUCTURE",
    "objective": "Understand the concept of smart cities and how BIM supports intelligent infrastructure development.",
    "practicalActivity": "Map the BIM applications in a smart city zone planning exercise",
    "industryApplication": "Pune, Ahmedabad, and Surat Smart City projects using GIS and BIM integration",
    "learningOutcome": "Students understand the intersection of BIM and smart city development.",
    "lessonTitles": [
      "What is a Smart City? Concepts and components",
      "Smart infrastructure: roads, utilities, sensors, data",
      "BIM as the backbone of smart city planning",
      "India's Smart Cities Mission: overview and projects",
      "Digital twin concept introduction",
      "Case study: Singapore's virtual city model"
    ]
  },
  {
    "id": 30,
    "title": "GREEN BUILDINGS & SUSTAINABLE CONSTRUCTION",
    "objective": "Understand sustainable construction principles and how BIM enables green building design.",
    "practicalActivity": "Review a LEED scorecard and identify BIM-enabled credits",
    "industryApplication": "Embassy REIT green building portfolio using BIM for sustainability certification",
    "learningOutcome": "Students can explain how BIM supports sustainable building design and certification.",
    "lessonTitles": [
      "Principles of sustainable construction",
      "Green building rating systems: LEED, GRIHA, BEE",
      "BIM for energy analysis and thermal performance (6D BIM)",
      "Daylighting, ventilation, and water efficiency modeling",
      "Embodied carbon and lifecycle assessment in BIM",
      "Case study: a LEED Platinum certified BIM project"
    ]
  },
  {
    "id": 31,
    "title": "DIGITAL TWINS IN CONSTRUCTION",
    "objective": "Understand digital twins and their application in infrastructure management.",
    "practicalActivity": "Trace the data flow from a physical building to a digital twin schematic",
    "industryApplication": "Heathrow Airport and Singapore's Changi Airport using digital twins for operations",
    "learningOutcome": "Students understand digital twins and can describe their construction use cases.",
    "lessonTitles": [
      "What is a Digital Twin?",
      "BIM as the foundation of a digital twin",
      "Types of digital twins: component, system, process",
      "Real-time data integration with digital twins (IoT + BIM)",
      "Case studies: digital twins in airports and bridges",
      "Digital twin for infrastructure lifecycle management"
    ]
  },
  {
    "id": 32,
    "title": "IOT IN CONSTRUCTION & SMART SITE MANAGEMENT",
    "objective": "Understand IoT applications in construction and their integration with BIM.",
    "practicalActivity": "Design an IoT sensor placement plan for a construction site (diagram/sketch)",
    "industryApplication": "Skanska and Bechtel using IoT for real-time safety and quality monitoring",
    "learningOutcome": "Students understand how IoT enhances construction site intelligence.",
    "lessonTitles": [
      "Introduction to IoT and connected sensors",
      "IoT applications: temperature, humidity, structural health monitoring",
      "Smart helmets, wristbands, and wearables on site",
      "IoT data integration with BIM models",
      "Real-time site monitoring dashboards",
      "Construction safety enhancement with IoT"
    ]
  },
  {
    "id": 33,
    "title": "AI & MACHINE LEARNING IN BIM",
    "objective": "Understand how Artificial Intelligence is transforming BIM and construction workflows.",
    "practicalActivity": "Explore a sample generative design outcome and evaluate its parameters",
    "industryApplication": "Autodesk's Generative Design tool used by Zaha Hadid Architects",
    "learningOutcome": "Students understand the current and future role of AI in BIM workflows.",
    "lessonTitles": [
      "Introduction to AI and ML concepts for non-programmers",
      "AI in design optimization and generative design",
      "Machine learning for construction schedule prediction",
      "AI-based clash detection and resolution",
      "Automated quantity takeoff using AI",
      "Future AI applications in BIM: what's coming?"
    ]
  },
  {
    "id": 34,
    "title": "DRONES, AR & VR IN CONSTRUCTION",
    "objective": "Understand how drones, augmented reality, and virtual reality are being used in modern construction.",
    "practicalActivity": "Review a drone-generated point cloud and compare it to a BIM model",
    "industryApplication": "Gammon India using drones for bridge construction progress monitoring",
    "learningOutcome": "Students understand drone, AR, and VR integration with BIM in construction.",
    "lessonTitles": [
      "Drone applications in construction: site survey, progress monitoring",
      "Photogrammetry and point cloud data from drones",
      "Augmented Reality (AR): overlaying BIM models on site",
      "Virtual Reality (VR): design review and client walkthroughs",
      "AR/VR hardware: HoloLens, Oculus, and mobile platforms",
      "Case study: BIM + Drone integration in an infrastructure project"
    ]
  },
  {
    "id": 35,
    "title": "FUTURE OF BIM & INDUSTRY 4.0 IN CIVIL ENGINEERING",
    "objective": "Understand the future trajectory of BIM and the role of Industry 4.0 technologies in civil engineering.",
    "practicalActivity": "Create a personal 'Future Skills Roadmap' poster for a BIM-enabled civil engineer career",
    "industryApplication": "Skanska, Bechtel, and AECOM 2030 strategy reports on Industry 4.0",
    "learningOutcome": "Students understand future technology trends and can position themselves for the BIM-driven industry.",
    "lessonTitles": [
      "Industry 4.0 and its five pillars in construction",
      "OpenBIM and the future of interoperability",
      "BIM and blockchain for contract management",
      "3D printing in construction enabled by BIM data",
      "Robotics and automation in BIM-driven construction",
      "The civil engineer of 2030: skills and mindset required"
    ]
  },
  {
    "id": 36,
    "title": "BIM IN METRO RAIL PROJECTS",
    "objective": "Apply BIM knowledge to the complex domain of metro rail infrastructure.",
    "practicalActivity": "Study a metro station cross-section and map BIM elements to each discipline",
    "industryApplication": "Bangalore Metro, Mumbai Metro Lines 2A, 7 – comprehensive BIM implementation",
    "learningOutcome": "Students understand BIM application in complex metro rail infrastructure.",
    "lessonTitles": [
      "Overview of metro rail BIM requirements",
      "Underground and elevated structure modeling",
      "Tunnel modeling: TBM drives and cut-and-cover sections",
      "Station design and cross-discipline coordination",
      "4D BIM for phased metro construction",
      "Case study: Bangalore Metro Phase 2 BIM implementation"
    ]
  },
  {
    "id": 37,
    "title": "BIM IN BRIDGES & HIGHWAY INFRASTRUCTURE",
    "objective": "Understand how BIM is applied in bridge design, construction, and highway infrastructure.",
    "practicalActivity": "Review a bridge BIM model and identify structural, geotechnical, and civil elements",
    "industryApplication": "NHAI using BIM for Bharatmala expressways and bridge construction",
    "learningOutcome": "Students understand BIM's role in bridge and highway infrastructure.",
    "lessonTitles": [
      "BIM standards for bridges: ISO 19650 application",
      "Structural modeling of bridge components",
      "Civil 3D for highway and road alignment modeling",
      "4D construction sequencing for bridge projects",
      "Quantity takeoff and cost estimation for bridges",
      "Case study: BIM in a cable-stayed bridge project"
    ]
  },
  {
    "id": 38,
    "title": "BIM IN AIRPORTS & LARGE INFRASTRUCTURE",
    "objective": "Explore how BIM is applied in airport design, construction, and operations.",
    "practicalActivity": "Map BIM applications across the different zones of an airport",
    "industryApplication": "Navi Mumbai Airport, Kempegowda Airport expansion – BIM implementation strategies",
    "learningOutcome": "Students understand BIM's application in large-scale airport projects.",
    "lessonTitles": [
      "Complexity of airport infrastructure: terminals, runways, services",
      "Multi-discipline coordination in airport BIM projects",
      "4D BIM for phased airport expansion",
      "BIM for airport FM and passenger experience",
      "Digital twin for airport operations management",
      "Case study: Navi Mumbai International Airport BIM strategy"
    ]
  },
  {
    "id": 39,
    "title": "BIM IN COMMERCIAL & RESIDENTIAL BUILDINGS",
    "objective": "Understand BIM applications in everyday commercial and residential building projects.",
    "practicalActivity": "Compare two project approaches: one with BIM, one without – identify efficiency gains",
    "industryApplication": "Godrej Properties, DLF, and Prestige Group using BIM for residential development",
    "learningOutcome": "Students understand BIM's value in everyday building projects relevant to Indian markets.",
    "lessonTitles": [
      "BIM for residential development: townships and housing",
      "Commercial building BIM: offices, malls, hotels",
      "Interior design integration with architectural BIM",
      "BIM for interior quantity takeoff and material selection",
      "Real estate pre-sales: BIM-based visualizations",
      "Case study: BIM in a high-rise residential tower, India"
    ]
  },
  {
    "id": 40,
    "title": "BIM IN FACILITY MANAGEMENT & INFRASTRUCTURE ANALYTICS",
    "objective": "Understand how BIM supports facility management and data analytics after construction.",
    "practicalActivity": "Identify 10 types of data from a BIM model useful for facilities management teams",
    "industryApplication": "Embassy Office Parks using BIM FM data for smart building operations in Pune and Bengaluru",
    "learningOutcome": "Students understand the post-construction value of BIM in facilities and asset management.",
    "lessonTitles": [
      "7D BIM and facilities management",
      "Asset management using BIM data",
      "Preventive and predictive maintenance through BIM",
      "Energy management using 6D BIM data",
      "Infrastructure performance analytics",
      "Case study: BIM-based FM in a smart commercial campus"
    ]
  },
  {
    "id": 41,
    "title": "TEAM COLLABORATION & BIM WORKFLOWS",
    "objective": "Develop skills for collaborative work within a BIM team environment.",
    "practicalActivity": "Conduct a mock BIM coordination meeting: roles, agenda, issue log",
    "industryApplication": "Multinational project teams on NEOM, Saudi Arabia using remote BIM collaboration",
    "learningOutcome": "Students can collaborate effectively within a BIM team environment.",
    "lessonTitles": [
      "Team structures in BIM projects: roles and responsibilities",
      "Collaboration tools: shared models, cloud storage, BCF",
      "Communication protocols within BIM teams",
      "Conflict resolution in multi-disciplinary teams",
      "BIM meeting best practices and agenda setting",
      "Collaborative documentation and version control"
    ]
  },
  {
    "id": 42,
    "title": "BIM DOCUMENTATION, REPORTING & COMMUNICATION",
    "objective": "Develop professional documentation and communication skills for BIM project environments.",
    "practicalActivity": "Draft a one-page BIM Coordination Report for a mock project",
    "industryApplication": "Consulting firms requiring standardized BIM reporting for government clients",
    "learningOutcome": "Students can prepare professional BIM documentation and communicate findings.",
    "lessonTitles": [
      "Types of BIM project documents: BEP, EIR, CIC BIM Protocol",
      "Writing professional BIM reports and coordination minutes",
      "Preparing model audit reports",
      "Creating BIM progress reports for clients",
      "Drawing extraction and sheet production from BIM",
      "Professional email and communication in engineering projects"
    ]
  },
  {
    "id": 43,
    "title": "PRESENTATION SKILLS FOR ENGINEERS",
    "objective": "Develop strong technical presentation skills for engineering and BIM contexts.",
    "practicalActivity": "Prepare a 5-slide BIM project overview presentation and present to the cohort",
    "industryApplication": "Consulting firms requiring engineers to present BIM strategies to public sector clients",
    "learningOutcome": "Students can prepare and deliver professional technical presentations.",
    "lessonTitles": [
      "Structuring a technical presentation: problem-solution-impact",
      "Visual communication: diagrams, infographics, model screenshots",
      "Presenting to clients, stakeholders, and management",
      "Handling Q&A in technical presentations",
      "Digital presentation tools and best practices",
      "Case study presentation analysis: what made it excellent"
    ]
  },
  {
    "id": 44,
    "title": "CASE STUDY ANALYSIS: REAL-WORLD BIM PROJECTS",
    "objective": "Develop critical analysis skills by examining real-world BIM implementation case studies.",
    "practicalActivity": "Teams analyze one case study each and present findings to the cohort",
    "industryApplication": "Cross-sector learning from metro, road, aviation, and urban development projects",
    "learningOutcome": "Students can critically analyze BIM project implementation and extract actionable learnings.",
    "lessonTitles": [
      "How to analyze a BIM project case study",
      "Case study: Mumbai Coastal Road BIM Implementation",
      "Case study: Bangalore Metro Phase 2",
      "Case study: Amaravati Capital City Project",
      "Case study: Dubai Expo 2020 BIM workflow",
      "Lessons learned and industry best practices"
    ]
  },
  {
    "id": 45,
    "title": "INDUSTRY READINESS, CAREER PLANNING & CAPSTONE LAUNCH",
    "objective": "Consolidate learning, assess industry readiness, and formally launch the Capstone Project.",
    "practicalActivity": "Complete a personal BIM competency checklist and career roadmap exercise",
    "industryApplication": "Industry recruitment standards from AECOM, WSP, Stantec, and top Indian infra firms",
    "learningOutcome": "Students are career-ready with a clear BIM career plan and capstone project underway.",
    "lessonTitles": [
      "Self-assessment: BIM competency checklist",
      "Building your BIM portfolio: what to include",
      "BIM career pathways: Modeler, Coordinator, Manager, Consultant",
      "Resume building for BIM and digital construction roles",
      "LinkedIn and professional profile optimization",
      "Capstone project briefing: teams, roles, deliverables, timeline"
    ]
  }
] as const;

const customModules = [
  ...(modules1to15 as unknown as CustomModule[]),
  ...(modules16to30 as unknown as CustomModule[]),
  ...(modules31to45 as unknown as CustomModule[]),
];

function getCustomModule(moduleId: number) {
  return customModules.find((module) => module.id === moduleId);
}

function getPhase(moduleId: number) {
  if (moduleId <= 7) return "Phase 1: Foundations";
  if (moduleId <= 14) return "Phase 2: BIM Fundamentals";
  if (moduleId <= 21) return "Phase 3: Construction & Project Management";
  if (moduleId <= 28) return "Phase 4: Software Exposure";
  if (moduleId <= 35) return "Phase 5: Smart Infrastructure & Innovation";
  if (moduleId <= 40) return "Phase 6: Advanced Industry Applications";
  return "Phase 7: Project Implementation";
}

function makeLessonQuiz(moduleTitle: string, lessonTitle: string): QuizQuestion[] {
  return Array.from({ length: 5 }, (_, index) => ({
    question: `${lessonTitle}: checkpoint ${index + 1} - which option best supports this BIM learning outcome?`,
    options: [
      "Connect the concept to a real BIM project workflow",
      "Skip documentation and coordination requirements",
      "Use only manual drafting without project information",
      "Ignore collaboration between disciplines",
    ],
    answer: 0,
  }));
}

function makeModuleQuiz(moduleTitle: string): QuizQuestion[] {
  return Array.from({ length: 15 }, (_, index) => ({
    question: `${moduleTitle}: module assessment question ${index + 1}`,
    options: [
      "Use BIM information to improve planning, coordination, delivery, and operations",
      "Avoid model data during project decision-making",
      "Work without checking standards or deliverables",
      "Treat BIM as only a drawing tool",
    ],
    answer: 0,
  }));
}

export const bimCurriculum: BimModule[] = pdfModules.map((module) => {
  const customModule = getCustomModule(module.id);

  if (customModule?.lessons?.length) {
    return {
      id: module.id,
      title: customModule.title || module.title,
      phase: customModule.phase || getPhase(module.id),
      objective: customModule.objective || module.objective,
      practicalActivity:
        customModule.practicalActivity || module.practicalActivity,
      industryApplication:
        customModule.industryApplication || module.industryApplication,
      learningOutcome: customModule.learningOutcome || module.learningOutcome,
      durationMinutes: customModule.durationMinutes || 60,
      lessons: customModule.lessons,
      moduleQuiz:
        customModule.moduleQuiz?.length
          ? customModule.moduleQuiz
          : makeModuleQuiz(customModule.title || module.title),
    };
  }

  const lessonDuration = Math.max(
    8,
    Math.round(60 / module.lessonTitles.length)
  );

  return {
    id: module.id,
    title: module.title,
    phase: getPhase(module.id),
    objective: module.objective,
    practicalActivity: module.practicalActivity,
    industryApplication: module.industryApplication,
    learningOutcome: module.learningOutcome,
    durationMinutes: 60,
    lessons: module.lessonTitles.map((lessonTitle, index) => ({
      title: `Lesson ${index + 1}: ${lessonTitle}`,
      durationMinutes: lessonDuration,
      content: [
        module.objective,
        `Focus topic: ${lessonTitle}.`,
        `Practical activity: ${module.practicalActivity}`,
        `Industry application: ${module.industryApplication}`,
        `Learning outcome: ${module.learningOutcome}`,
      ].filter(Boolean),
      quiz: makeLessonQuiz(module.title, lessonTitle),
    })),
    moduleQuiz: makeModuleQuiz(module.title),
  };
});
