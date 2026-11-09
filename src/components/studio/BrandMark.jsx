import { useState } from 'react'

export function BrandMark({ logo, mark, color, label, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const showLogo = Boolean(logo) && !failed
  return (
    <div
      className={`brand-mark brand-mark--${size}${showLogo ? ' brand-mark--logo' : ' brand-mark--letters'}`}
      style={{ '--brand': color || '#1E4FE0' }}
      aria-label={label || mark || 'Brand'}
    >
      {showLogo ? (
        <img src={logo} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{mark || '?'}</span>
      )}
    </div>
  )
}
