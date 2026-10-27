import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

export const CANONICAL_BRANCHES = [
  {
    id: 'branch-ce',
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Structural Analysis, Geotechnical Engineering, Environmental Infrastructure & Transportation'
  },
  {
    id: 'branch-cse',
    name: 'Computer Science and Engineering (CSE)',
    code: 'CSE',
    description: 'Core Computing, Data Structures & Algorithms, Operating Systems, Database Systems & Software Engineering'
  },
  {
    id: 'branch-etc',
    name: 'Electronics & Telecommunication Engineering',
    code: 'ETC',
    description: 'Signal Processing, Embedded Systems, VLSI Design, Telecommunications & Microprocessors'
  },
  {
    id: 'branch-ee',
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Power Systems, Electrical Machines, Control Systems, Power Electronics & Smart Grids'
  },
  {
    id: 'branch-it',
    name: 'Information Technology',
    code: 'IT',
    description: 'Cloud Computing, Full-Stack Web Technologies, Enterprise Networks & Database Systems'
  },
  {
    id: 'branch-me',
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Thermodynamics, Fluid Mechanics, Kinematics, CAD/CAM, Manufacturing & Mechatronics'
  },
  {
    id: 'branch-ai',
    name: 'Artificial Intelligence (AI)',
    code: 'AI',
    description: 'Machine Learning, Deep Learning, Neural Networks, Natural Language Processing & Computer Vision'
  },
  {
    id: 'branch-cs-ds',
    name: 'Computer Science & Engineering (Data Science)',
    code: 'CSE-DS',
    description: 'Big Data Analytics, Predictive Modeling, Statistical Inference & Data Engineering'
  },
  {
    id: 'branch-cs-cyber',
    name: 'Computer Science & Engineering (Cyber Security)',
    code: 'CSE-CY',
    description: 'Network Defense, Cryptography, Ethical Hacking, Threat Intelligence & Cloud Security'
  },
  {
    id: 'branch-csbs',
    name: 'Computer Science and Business Systems (in partnership with TCS)',
    code: 'CSBS',
    description: 'Enterprise Systems, Business Intelligence, Corporate IT Strategy & FinTech Systems'
  },
  {
    id: 'branch-iiot',
    name: 'Industrial IoT',
    code: 'IIOT',
    description: 'Sensors & Actuators, SCADA/PLC Systems, Edge Computing, Smart Industry 4.0 & Industrial Automation'
  },
  {
    id: 'branch-robotics-ai',
    name: 'Robotics and Artificial Intelligence',
    code: 'ROBOTICS-AI',
    description: 'Autonomous Robotics, Kinematics & Dynamics, Computer Vision, ROS & Reinforcement Learning'
  }
];

const NEW_SUBJECTS = [
  {
    id: 'sub-ai-ml',
    name: 'Machine Learning & Artificial Intelligence',
    code: 'AIML',
    branch_id: 'branch-ai',
    description: 'Supervised & Unsupervised Learning, Deep Neural Networks, Model Optimization'
  },
  {
    id: 'sub-data-science',
    name: 'Data Science & Big Data Analytics',
    code: 'DSBDA',
    branch_id: 'branch-cs-ds',
    description: 'Exploratory Data Analysis, Feature Engineering, Distributed Data Processing'
  },
  {
    id: 'sub-cyber-sec',
    name: 'Cyber Security & Network Defense',
    code: 'CSND',
    branch_id: 'branch-cs-cyber',
    description: 'Cryptographic Protocols, Penetration Testing, Zero Trust Architecture'
  },
  {
    id: 'sub-csbs-systems',
    name: 'Business Analytics & Enterprise Systems',
    code: 'BAES',
    branch_id: 'branch-csbs',
    description: 'TCS Industry Curriculum, Enterprise Resource Planning, Financial Analytics'
  },
  {
    id: 'sub-iiot-sensors',
    name: 'Industrial IoT & Sensor Networks',
    code: 'IIOTSN',
    branch_id: 'branch-iiot',
    description: 'Industry 4.0, Wireless Sensor Networks, MQTT/CoAP Protocols & Edge Processing'
  },
  {
    id: 'sub-robotics-ai',
    name: 'Robotics & Autonomous Systems',
    code: 'RAS',
    branch_id: 'branch-robotics-ai',
    description: 'Kinematics, Trajectory Planning, ROS, SLAM & Robot Vision'
  }
];

const NEW_JOB_ROLES = [
  {
    id: 'role-cyber-analyst',
    title: 'Cyber Security Analyst',
    branch_id: 'branch-cs-cyber',
    description: 'Identify threats, conduct penetration tests, and secure cloud/enterprise perimeters.',
    expected_skills: ['Network Security', 'Cryptography', 'SIEM', 'Linux', 'Vulnerability Assessment']
  },
  {
    id: 'role-csbs-consultant',
    title: 'Business Systems Consultant',
    branch_id: 'branch-csbs',
    description: 'Bridge business requirements with enterprise technology architectures.',
    expected_skills: ['ERP Systems', 'Business Intelligence', 'SQL', 'Process Modeling', 'Cloud Platforms']
  },
  {
    id: 'role-iiot-engineer',
    title: 'Industrial IoT & Automation Engineer',
    branch_id: 'branch-iiot',
    description: 'Design and deploy connected industrial smart factory systems and telemetry pipelines.',
    expected_skills: ['Embedded C', 'MQTT', 'PLC/SCADA', 'Sensors', 'Edge Computing']
  },
  {
    id: 'role-robotics-eng',
    title: 'Robotics & Autonomous Systems Engineer',
    branch_id: 'branch-robotics-ai',
    description: 'Develop autonomous mobile robots, manipulation algorithms, and perception pipelines.',
    expected_skills: ['ROS 2', 'C++', 'Python', 'Kinematics', 'Computer Vision', 'Control Theory']
  }
];

export function runUpdate() {
  console.log('[Update Branches]: Reading fixtures from:', FIXTURES_FILE);
  const data = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf8'));

  // 1. Replace branches array
  data.branches = CANONICAL_BRANCHES;

  // 2. Map existing subjects
  data.subjects = data.subjects.map(s => {
    if (s.branch_id === 'branch-ece') {
      return { ...s, branch_id: 'branch-etc' };
    }
    return s;
  });

  // Add new subjects if not present
  for (const ns of NEW_SUBJECTS) {
    if (!data.subjects.some(s => s.id === ns.id)) {
      data.subjects.push(ns);
    }
  }

  // 3. Update jobRoles
  data.jobRoles = data.jobRoles.map(r => {
    if (r.branch_id === 'branch-aids') return { ...r, branch_id: 'branch-cs-ds' };
    if (r.branch_id === 'branch-aiml') return { ...r, branch_id: 'branch-ai' };
    if (r.branch_id === 'branch-ece') return { ...r, branch_id: 'branch-etc' };
    return r;
  });

  for (const nr of NEW_JOB_ROLES) {
    if (!data.jobRoles.some(r => r.id === nr.id)) {
      data.jobRoles.push(nr);
    }
  }

  fs.writeFileSync(FIXTURES_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('[Update Branches]: Successfully updated static_fixtures.json with 12 canonical branches!');
}

if (process.argv[1] && process.argv[1].endsWith('updateBranches.js')) {
  runUpdate();
}
