export interface Certification {
  name: string;
  issuer: string;
  verifyUrl: string;
  badgeUrl?: string;
  year?: string;
}

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    verifyUrl: 'https://aws.amazon.com/verification',
    year: '2021',
  },
  {
    name: 'Aviatrix Certified Multi-Cloud Network Associate',
    issuer: 'Aviatrix',
    verifyUrl: 'https://www.aviatrix.com/certification',
    year: '2022',
  },
  {
    name: 'AWS Developer Associate',
    issuer: 'Amazon Web Services',
    verifyUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
    year: 'Present',
  },
];
