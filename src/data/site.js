import { asset } from '../utils/assets'

export const site = {
  title: 'Personal Portfolio',
  name: 'Achilles Vonn D. Rabina',
  role: 'Full-Stack Developer / Startup Founder',
  photo: asset('assets/images/chi_photo.png'),
  transitionGif: asset('assets/images/chi_loop.gif'),
  logo: asset('assets/images/AVR_Logo_Redesign.png'),
  githubUrl: 'https://github.com/achllzvr',
  socials: {
    linkedin: 'https://www.linkedin.com/in/avrabina',
    github: 'https://github.com/achllzvr',
    instagram: 'https://www.instagram.com/achllzvr',
  },
  about: {
    paragraphs: [
      {
        type: 'bio',
        text: 'Innovative Full-Stack Developer and Startup Founder specializing in React, Laravel, and Flutter. My',
        links: [
          { label: 'skills', href: '#projects' },
          { label: 'experience', href: '#experience' },
        ],
        after: 'span end-to-end product work — from MVP and UI/UX to market validation and commercial deployment.',
      },
    ],
    tagline: "Let's build something great together!",
  },
  formspreeEndpoint: import.meta.env.VITE_FORMSPREE_ENDPOINT || '',
}
