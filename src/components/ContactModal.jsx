import { useEffect, useId, useRef, useState } from 'react'
import { site } from '../data/site'

const initialForm = { name: '', email: '', message: '' }
const EXIT_MS = 220

export default function ContactModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState('closed') // closed | open | closing
  const titleId = useId()
  const closeBtnRef = useRef(null)
  const panelRef = useRef(null)

  // Mount when opening
  useEffect(() => {
    if (!open) return undefined
    setMounted(true)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('open'))
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  // Begin exit when closing while still mounted
  useEffect(() => {
    if (open || !mounted) return undefined
    setPhase('closing')
    const t = setTimeout(() => {
      setMounted(false)
      setPhase('closed')
    }, EXIT_MS)
    return () => clearTimeout(t)
  }, [open, mounted])

  useEffect(() => {
    if (phase !== 'open') return undefined
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [phase, onClose])

  useEffect(() => {
    if (!open) {
      setStatus('idle')
      setErrorMsg('')
      setForm(initialForm)
    }
  }, [open])

  if (!mounted) return null

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const requestClose = () => {
    if (phase === 'closing') return
    onClose()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!site.formspreeEndpoint) {
      setStatus('error')
      setErrorMsg('Formspree endpoint is not configured. Set VITE_FORMSPREE_ENDPOINT.')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(site.formspreeEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  const overlayClass =
    phase === 'closing' ? 'is-closing' : phase === 'open' ? 'is-open' : ''

  return (
    <div
      className={`contact-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${overlayClass}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="contact-modal-panel relative w-full max-w-4xl rounded-3xl
                   bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700
                   border border-white/25 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.55)]
                   overflow-hidden md:overflow-visible"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={requestClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full
                     bg-white/15 hover:bg-white/25 text-white
                     transition-transform duration-200 hover:scale-105 active:scale-95
                     flex items-center justify-center z-30"
          aria-label="Close contact form"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row relative min-h-[420px] md:min-h-[480px]">
          {/* Desktop socials + breakout photo */}
          <div className="relative hidden md:block w-80 flex-shrink-0 contact-modal-stagger">
            <img
              src={site.photo}
              alt={site.name}
              className="absolute bottom-0 left-0 w-[300px] h-[118%] object-cover object-top rounded-l-3xl z-20
                         drop-shadow-2xl pointer-events-none"
              onError={(e) => {
                e.currentTarget.src =
                  'https://ui-avatars.com/api/?name=Achilles+Rabina&size=500&background=1e3a8a&color=fff'
              }}
            />
            <div className="relative flex flex-col justify-end h-full p-8 z-30 bg-gradient-to-t from-blue-900/70 via-blue-900/20 to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                <h3 id={titleId} className="font-display font-bold text-lg text-white mb-2 drop-shadow-md">
                  My Socials
                </h3>
                <p className="text-sm text-white/90 mb-5 leading-relaxed drop-shadow-sm">
                  Connect with me here!
                </p>
                <SocialIcons />
              </div>
            </div>
          </div>

          <div className="flex-1 p-5 sm:p-8 flex flex-col justify-center contact-modal-stagger">
            <div className="md:hidden mb-5 contact-modal-stagger">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={site.photo}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-white/40"
                />
                <div>
                  <h3 className="font-display font-bold text-base text-white">Get In Touch</h3>
                  <p className="text-xs text-white/80">Connect on socials or send a message</p>
                </div>
              </div>
              <SocialIcons />
            </div>

            <div className="rounded-2xl p-5 sm:p-6 bg-white/12 border border-white/25 shadow-inner contact-modal-stagger">
              <h3 className="font-display font-bold text-lg text-white mb-5 hidden md:block">Get In Touch</h3>

              {status === 'success' ? (
                <div className="flex flex-col items-start gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-400/90 text-blue-900 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-white leading-relaxed">
                    Thanks for reaching out — your message was sent successfully.
                  </p>
                  <button
                    type="button"
                    onClick={requestClose}
                    className="mt-2 text-sm font-semibold text-yellow-300 hover:text-yellow-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                  <div>
                    <label className="block text-sm text-white/90 mb-2 font-medium" htmlFor="contact-name">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={onChange}
                      placeholder="Your name"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/90 mb-2 font-medium" htmlFor="contact-email">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={onChange}
                      placeholder="your@email.com"
                      className="form-input"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm text-white/90 mb-2 font-medium" htmlFor="contact-message">
                      Subject
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      required
                      value={form.message}
                      onChange={onChange}
                      placeholder="Your message…"
                      className="form-input resize-none pr-14"
                    />

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="absolute bottom-3 right-3 w-12 h-12 rounded-full
                                 bg-yellow-400 hover:bg-yellow-300
                                 shadow-lg shadow-yellow-500/35
                                 flex items-center justify-center
                                 hover:scale-105 transition-transform duration-200 active:scale-95
                                 cursor-pointer z-30 disabled:opacity-60 disabled:hover:scale-100"
                      aria-label="Send message"
                    >
                      {status === 'submitting' ? (
                        <span className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-5 h-5 text-blue-900 rotate-45"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {status === 'error' ? (
                    <p className="text-xs text-yellow-200">{errorMsg}</p>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialIcons() {
  const linkClass =
    'w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 active:scale-95'

  return (
    <div className="flex gap-3">
      <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass} title="LinkedIn">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className={linkClass} title="GitHub">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </a>
      <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className={linkClass} title="Instagram">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      </a>
    </div>
  )
}
