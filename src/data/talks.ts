export interface Talk {
  title: string;
  event: string;
  date: string;
  slidesUrl?: string;
  videoUrl?: string;
}

export const talks: Talk[] = [
  {
    title: 'Intro to Linux - Workshop',
    event: 'Information Systems Club, Binghamton University',
    date: 'April 2025',
    slidesUrl: 'https://docs.google.com/presentation/d/1bkpE9YEKuplNh4BrAW0ERlRh7GI28I7AsTaTXDSLYNQ/edit?usp=sharing',

  },
  {
    title: 'Intro to MySQL - Workshop',
    event: 'Information Systems Club, Binghamton University',
    date: 'Feb 2025',
    slidesUrl: 'https://slides.com/example',
  },
];
