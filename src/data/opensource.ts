export type OpenSourceType = 'maintainer' | 'contributor' | 'hacktoberfest';

export interface OpenSourceEntry {
  title: string;
  description: string;
  url: string;
  type: OpenSourceType;
  year?: string;
}

export const openSource: OpenSourceEntry[] = [
  {
    title: 'SPRUCE',
    description: 'Open-source GreenOps enrichment platform that estimates the environmental impact of cloud usage. Enriches AWS CUR reports with open source models and data (embodied emissions, energy, PUE, carbon intensity) using Apache Spark and Parquet. Contributed Docker and Java features.',
    url: 'https://github.com/DigitalPebble/spruce',
    type: 'contributor',
  },
  {
    title: 'Algorithmic JavaScript',
    description: 'Open-source repo for algorithms in JavaScript. Maintainer & contributor for HacktoberFest.',
    url: 'https://github.com/tejas-2232/Algorithmic_javascript',
    type: 'hacktoberfest',
    year: '2020',
  },
  {
    title: 'All-About-Ansible (AAA)',
    description: 'Ansible learning repository for beginners in cloud journey. Maintainer.',
    url: 'https://github.com/tejas-2232/All-About-Ansible-AAA-',
    type: 'maintainer',
  },
  {
    title: 'Serverless Resume API',
    description: 'Azure Functions + Bicep. Open-source project for serverless resume API.',
    url: 'https://github.com/tejas-2232/serverless-resume-api',
    type: 'maintainer',
  },
];
