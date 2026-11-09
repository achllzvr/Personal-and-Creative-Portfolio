/** Solar-style duotone icons for awards & certifications (no npm dependency). */

const SIZE = 40

function DuotoneSvg({ children, className = '', title }) {
  return (
    <svg
      className={`solar-duotone ${className}`.trim()}
      width={SIZE}
      height={SIZE}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {children}
    </svg>
  )
}

/** Certificate — Solar Duotone “diploma / document with seal” vibe */
export function CertificateIcon({ className, title = 'Certificate' }) {
  return (
    <DuotoneSvg className={className} title={title}>
      <path
        d="M6.5 3.75h11A1.75 1.75 0 0 1 19.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-11A1.75 1.75 0 0 1 4.75 18.5v-13A1.75 1.75 0 0 1 6.5 3.75Z"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M7.75 8.25h8.5M7.75 11.25h8.5M7.75 14.25h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="16.25" cy="16.5" r="2.35" fill="currentColor" opacity="0.55" />
      <path
        d="M15.35 16.5h1.8M16.25 15.6v1.8"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M6.5 3.75h11A1.75 1.75 0 0 1 19.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-11A1.75 1.75 0 0 1 4.75 18.5v-13A1.75 1.75 0 0 1 6.5 3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </DuotoneSvg>
  )
}

/** Award / medal — Solar Duotone medal with ribbon */
export function AwardIcon({ className, title = 'Award' }) {
  return (
    <DuotoneSvg className={className} title={title}>
      <path
        d="M9.2 3.5 8 8.2h8L14.8 3.5"
        fill="currentColor"
        opacity="0.22"
      />
      <path
        d="M9.2 3.5 8 8.2h8L14.8 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14.25" r="5" fill="currentColor" opacity="0.28" />
      <circle cx="12" cy="14.25" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="14.25" r="2.15" fill="currentColor" opacity="0.65" />
      <path
        d="M10.2 3.5v4.2M13.8 3.5v4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </DuotoneSvg>
  )
}

/** Medal variant for skills certs */
export function MedalIcon({ className, title = 'Medal' }) {
  return (
    <DuotoneSvg className={className} title={title}>
      <path
        d="M8.5 3.75h7l-1.2 4.6H9.7L8.5 3.75Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M8.5 3.75h7l-1.2 4.6H9.7L8.5 3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14.5" r="5.25" fill="currentColor" opacity="0.25" />
      <circle cx="12" cy="14.5" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 11.6v5.8M9.9 14.5h4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </DuotoneSvg>
  )
}

export function SolarIcon({ name, className }) {
  if (name === 'award') return <AwardIcon className={className} />
  if (name === 'medal') return <MedalIcon className={className} />
  return <CertificateIcon className={className} />
}
