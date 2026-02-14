export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  githubUrl: string;
}

export const projects: Project[] = [
  {
    id: 'serverless-resume-api',
    title: 'Serverless Resume API',
    tagline: 'Deploying sample resume on Azure',
    description: 'Serverless Resume API using Azure Functions and Bicep',
    image: '/images/serverless-computing.jpg',
    category: 'Cloud Projects',
    githubUrl: 'https://github.com/tejas-2232/serverless-resume-api',
  },
  {
    id: 'hacktoberfest',
    title: 'HacktoberFest Project',
    tagline: 'OpenSource Repository Maintainer',
    description: 'OpenSource Project repository for HacktoberFest 2020 | Maintainer+Contributor role',
    image: '/images/hack_2020-1.png',
    category: 'opensource',
    githubUrl: 'https://github.com/tejas-2232/Algorithmic_javascript',
  },
  {
    id: 'python-for-all',
    title: 'Python For All',
    tagline: 'Python Learning',
    description: 'A repository for learners who want to start out with python OR for quick refresher',
    image: '/images/python6.jpeg',
    category: 'Learning & Development',
    githubUrl: 'https://github.com/tejas-2232',
  },
  {
    id: 'awesome-ansible',
    title: 'Awesome Ansible',
    tagline: 'Ansible Modules and PlayBooks',
    description: 'A complete Ansible learning repository for beginners in cloud journey',
    image: '/images/ansible-1024-535.webp',
    category: 'Cloud Solutions',
    githubUrl: 'https://github.com/tejas-2232/All-About-Ansible-AAA-/tree/main',
  },
];
