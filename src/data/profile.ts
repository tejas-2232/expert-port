export const profile = {
  name: 'Tejas Bachhav',
  title: 'Aspiring Cloud Engineer',
  taglines: ['Aspiring Cloud Engineer', 'Infrastructure as Code', 'Hybrid Cloud Solutions'],
  quote: 'Dare to dream big; your code can reshape the world.',
  bio: `A Computer Science Master student at State University of New York, Binghamton with excellent academic background
and diverse skillset. Experienced in developing cloud solutions on AWS, GCP and Azure.
I am well versed with Ansible, Terraform, Jenkins, Docker, Linux distros, Python and basics of Java.`,
  image: '/images/tejas_linkedin_img.jpeg',
  fullName: 'Tejas Bachhav',
  birthDate: 'June 1st',
  website: 'https://www.tejasbachhav.cloud',
  email: 'tejasbachhav98@gmail.com',
  resumePdf: '/files/Tejas-Bachhav-Resume.pdf',
  skills: [
    'Ansible',
    'Terraform',
    'Amazon EKS',
    'Agentic AI',
    'Google ADK',
    'Docker',
    'Kubernetes',
    'AWS S3 Storage',
    'GCP Cloud Build',
    'Amazon EC2',
    'Azure SQL Managed Instance',
    'Linux Administration',
    'Postman',
  ],
  languages: [
    { name: 'English', level: 'Full Professional Proficiency' },
    { name: 'Spanish', level: 'Basic Proficiency' },
    { name: 'Hindi', level: 'Professional Working Proficiency' },
    { name: 'Marathi', level: 'Native or Bilingual Proficiency' },
  ],
} as const;

export const socials = [
  { href: 'https://www.linkedin.com/in/tejasbachhav/', label: 'LinkedIn' },
  { href: 'https://github.com/tejas-2232', label: 'GitHub' },
  { href: 'https://www.youtube.com/@tejasbachhav3921', label: 'YouTube' },
  { href: 'https://www.hackerrank.com/profile/codez_x', label: 'HackerRank' },
  { href: 'https://twitter.com/bachhav_tejas', label: 'Twitter' },
] as const;

export const stats = [
  { value: '10', label: 'Crazy Ideas' },
  { value: '200', label: 'Coffee Sessions' },
  { value: '7800', label: 'Hours of coding' },
] as const;
