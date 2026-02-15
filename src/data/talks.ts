export interface Talk {
  title: string;
  event: string;
  date: string;
  /** Multiple image paths for a scrollable gallery, e.g. ['/images/talks/linux-1.jpg', '/images/talks/linux-2.jpg'] */
  images?: string[];
  slidesUrl?: string;
  videoUrl?: string;
}

export const talks: Talk[] = [
  {
    title: 'Intro to Linux - Workshop',
    event: 'Information Systems Club, Binghamton University',
    date: 'April 2025',
    images: ['/images/talks/lnx02.jpg','/images/talks/lnx03.jpg', '/images/talks/lnx04.jpg', '/images/talks/lnx07.jpg'],
    slidesUrl: 'https://docs.google.com/presentation/d/1bkpE9YEKuplNh4BrAW0ERlRh7GI28I7AsTaTXDSLYNQ/edit?usp=sharing',
  },
  {
    title: 'Intro to MySQL - Workshop',
    event: 'Information Systems Club, Binghamton University',
    date: 'Feb 2025',
    images: ['/images/talks/me-teaching.jpg','/images/talks/eric-teaching.jpg', '/images/talks/attendance.jpg', '/images/talks/mysql-workshop-winners.jpg'],
    slidesUrl: 'https://slides.com/example',
  },
];
