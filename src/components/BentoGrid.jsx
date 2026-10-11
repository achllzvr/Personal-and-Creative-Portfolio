import { useState } from 'react'
import portfolio from '../data/portfolio.json'
import AboutCard from './AboutCard'
import CertificationsCard from './CertificationsCard'
import ExperienceCard from './ExperienceCard'
import GalleryCard from './GalleryCard'
import ProfileCard from './ProfileCard'
import ProjectsCard from './ProjectsCard'
import RecommendationsCard from './RecommendationsCard'

export default function BentoGrid({ onOpenContact, skipEnter = false }) {
  const [galleryFocused, setGalleryFocused] = useState(false)

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/25 dark:bg-black/45
                    transition-opacity duration-300 ease-out pointer-events-none
                    ${galleryFocused ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      <main className={`bento-grid${skipEnter ? ' bento-grid--no-enter' : ''}`}>
        <ProfileCard onOpenContact={onOpenContact} />
        <AboutCard />
        <ExperienceCard items={portfolio.experience} />
        <ProjectsCard items={portfolio.projects} />
        <CertificationsCard items={portfolio.certifications} />
        <RecommendationsCard items={portfolio.recommendations} />
        <GalleryCard
          items={portfolio.gallery}
          focused={galleryFocused}
          onFocusChange={setGalleryFocused}
        />
      </main>
    </>
  )
}
