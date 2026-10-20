import { useTheme } from '../context/ThemeContext'
import { site } from '../data/site'

const DARK_BG =
  'linear-gradient(90deg, rgba(150, 150, 150, 0) 0%, rgba(180, 180, 180, 0.7) 30%, rgba(240, 240, 240, 1) 100%)'
const LIGHT_BG =
  'linear-gradient(90deg, rgba(13, 71, 161, 0.9) 0%, rgba(66, 133, 244, 0.85) 100%)'

function ActionButtons({ onOpenContact }) {
  return (
    <div className="flex w-full gap-3">
      <button
        type="button"
        onClick={onOpenContact}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-blue-100/80
                   bg-transparent py-3 text-sm font-semibold text-white
                   transition-[transform,background-color,box-shadow] duration-200
                   hover:bg-white/15 hover:shadow-[0_0_20px_rgba(147,197,253,0.35)]
                   active:scale-95"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="action-btn-label">Message</span>
      </button>
      <a
        href={site.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-blue-100/80
                   bg-transparent py-3 text-sm font-semibold text-white
                   transition-all duration-200 active:scale-95 hover:bg-white/10"
      >
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <span className="action-btn-label">GitHub</span>
      </a>
    </div>
  )
}

export default function ProfileCard({ onOpenContact }) {
  const { isDark, transitionState, transitionGif } = useTheme()

  return (
    <div className="card-enter bento-span profile-card relative col-span-3 row-span-3 overflow-hidden rounded-3xl bg-transparent">
      {/* Desktop layout — unchanged */}
      <div className="profile-card-desktop relative h-full min-h-[420px]">
        <div
          className="absolute inset-0 z-0 rounded-3xl transition-opacity duration-500 ease-out"
          style={{ background: DARK_BG, marginTop: '60%', opacity: isDark ? 1 : 0 }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-0 rounded-3xl transition-opacity duration-500 ease-out"
          style={{ background: LIGHT_BG, marginTop: '60%', opacity: isDark ? 0 : 1 }}
          aria-hidden
        />

        <img
          src={site.photo}
          alt={site.name}
          className="profile-image absolute inset-0 z-[1] h-full w-full object-cover object-top"
          style={{
            opacity: transitionState.imageOpacity,
            transition: 'opacity 0.35s ease-out',
          }}
          onError={(e) => {
            e.currentTarget.src =
              'https://ui-avatars.com/api/?name=Achilles+Rabina&size=400&background=1e3a8a&color=fff&font-size=0.4'
          }}
        />

        {transitionState.showGif ? (
          <img
            key={transitionState.gifKey}
            src={transitionGif}
            alt=""
            aria-hidden="true"
            className="transition-gif show"
            style={{
              opacity: transitionState.gifOpacity,
              transition: 'opacity 0.22s ease-out',
            }}
          />
        ) : null}

        <div
          className="absolute bottom-0 left-0 right-0 z-[2] flex w-full flex-col gap-4 px-6 py-6 text-white"
          style={{
            background:
              'linear-gradient(180deg, rgba(37, 99, 235, 0) 0%, rgba(37, 99, 235, 0.85) 60%, rgba(20, 84, 220, 1) 100%)',
          }}
        >
          <div>
            <h2 className="font-display text-lg font-bold leading-tight text-white">{site.name}</h2>
            <p className="mt-0.5 text-sm italic text-blue-100">{site.role}</p>
          </div>
          <ActionButtons onOpenContact={onOpenContact} />
        </div>
      </div>

      {/* Mobile / tablet — blue glass shell (matches About / Experience), icon CTAs */}
      <div className="profile-card-mobile relative items-stretch overflow-visible rounded-3xl">
        <div className="profile-card-mobile-photo relative w-[42%] min-h-[220px] flex-shrink-0">
          <img
            src={site.photo}
            alt={site.name}
            className="absolute inset-0 h-full w-full object-cover object-[center_10%]"
            onError={(e) => {
              e.currentTarget.src =
                'https://ui-avatars.com/api/?name=Achilles+Rabina&size=400&background=1e3a8a&color=fff&font-size=0.4'
            }}
          />
        </div>
        <div className="profile-card-mobile-info flex flex-1 flex-col justify-center gap-3 p-4 sm:p-5">
          <div className="profile-card-mobile-copy">
            <h2 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
              {site.name}
            </h2>
            <p className="mt-0.5 text-xs italic text-blue-100 sm:text-sm">{site.role}</p>
          </div>
          <div className="profile-card-mobile-actions">
            <ActionButtons onOpenContact={onOpenContact} />
          </div>
        </div>
      </div>
    </div>
  )
}
