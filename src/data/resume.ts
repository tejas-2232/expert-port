export interface TimelineEntry {
  title: string;
  period: string;
  org: string;
  orgUrl: string;
  description?: string;
  bullets: string[];
}

export const workExperience: TimelineEntry[] = [
  {
    title: 'AI Research Assistant',
    period: 'Jan 2025 - June 2025',
    org: 'Binghamton University, New York',
    orgUrl: 'https://www.binghamton.edu/',
    bullets: [
      'Authored a research paper titled Optimal Device Sequencing and Kernel Assignment for Multiple Heterogeneous Machine Learning Accelerators accepted at the Great Lakes Symposium on VLSI 2025',
      'Improved hardware utilization by 15% for a heterogeneous set of ML accelerators by optimizing kernel placements for Cerebras CS-1',
      'Designed Pareto-optimized mapping strategies to maximize compute performance and improve overall efficiency on cloud',
    ],
  },
  {
    title: 'Cloud DevOps Automation Engineer',
    period: 'Nov 2020 - June 2023',
    org: 'Accenture Solutions Pvt. Ltd, India',
    orgUrl: 'https://www.accenture.com/us-en',
    description: 'I worked as a Cloud Automation DevOps engineer for almost 3 years. I have gained practical experience in deploying hybrid and robust cloud solutions on multiple cloud platforms.',
    bullets: [
      'Created 50+ Ansible playbooks integrating with Jenkins CI/CD and delivered technical support for hybrid cloud systems',
      'Reduced AWS VM provisioning time by 90% through Ansible scripts and streamlined post-deployment configurations',
      'Automated deploying of Apache, Tomcat web servers over 85 RedHat servers with security configurations as per client needs',
      'Drove down support ticket costs by 98% ($2,254→$46) and server provisioning costs by 98% ($511→$10.42) through cloud automation for a financial service client',
      'Designed resilient infrastructure using IaC and supported scalable deployments across Dev/UAT/Prod environments with AWS',
      'Reduced incident response time by 60% through on-call participation, real-time debugging, and implementing postmortem learnings',
      'Diagnosed network compliance drift across Cisco/Nexus switches and deployed automated fixes with 10x faster drift detection',
      'Automated user onboarding for Citrix VDI systems to map 700+ users and reduce efforts by 70% using PowerShell and Ansible',
    ],
  },
];

export const onCampus: TimelineEntry[] = [
  {
    title: 'University Police Student Assistant',
    period: 'Sep 2024 - May 2025',
    org: 'New York State University Police, New York, United States',
    orgUrl: 'https://www.binghamton.edu/',
    description: 'In my position as a Student Safety Assistant at New York State University Police, I played a crucial role in ensuring the safety of students on campus.',
    bullets: [
      'Responded promptly to base station calls to address any safety concerns.',
      'Provided timely assistance to building representatives to maintain a secure environment.',
      'Collaborated with the university police department to implement safety protocols and procedures.',
    ],
  },
  {
    title: 'Grill Manager',
    period: 'Aug 2024 - Dec 2024',
    org: 'Chick-N-Bap',
    orgUrl: 'http://www.chicknbap.com/',
    description: 'Managed the grill and cooked Korean dishes, handled customer orders and cleaned the grill for Chick-N-Bap, a Korean fast-food restaurant.',
    bullets: [
      'Korean BBQ Chicken',
      'Vegan Impossible Meat',
      'Korean Sweet and Spicy Chicken',
      'Korean BBQ Beef',
      'Korean Spicy Pork',
      'Korean fried chicken',
    ],
  },
];

export const education: TimelineEntry[] = [
  {
    title: "Master's Degree",
    period: 'August 2023 - June 2025',
    org: 'Binghamton University, NY, United States',
    orgUrl: 'https://www.binghamton.edu/',
    description: "Currently pursuing Master in Computer Science Degree at Binghamton University. I'm currently serving as Vice President of Education Intern at Information Systems Club (ISC).",
    bullets: [
      'Operating Systems',
      'Distributed Systems',
      'Database Management',
      'Design and Analysis of Algorithms',
      'Programming Languages',
      'Science of CyberSecurity',
    ],
  },
  {
    title: "Bachelor's Degree",
    period: '2016 - 2020',
    org: 'Sinhgad Academy of Engineering, Pune University, India',
    orgUrl: 'http://www.sinhgad.edu/',
    description: "Completed my Bachelor's Degree in Computer Science with First Class Grade.",
    bullets: [
      'Computer Graphics',
      'Cloud Computing',
      'Computer Organization and Architecture',
      'Machine Learning',
      'Artificial Intelligence',
      'Database Management',
      'Design and Analysis of Algorithms',
      'Computer Networks',
      'System Programming & Operating Systems',
    ],
  },
];
