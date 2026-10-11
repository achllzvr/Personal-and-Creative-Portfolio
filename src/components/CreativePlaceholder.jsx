import VariableFontHoverByLetter from './VariableFontHoverByLetter'

/**
 * Creative portfolio entry — weight-hover intro, viewport-centered.
 */
export default function CreativePlaceholder() {
  return (
    <section
      className="pointer-events-none flex min-h-dvh items-center justify-center px-4"
      aria-label="Creative portfolio introduction"
    >
      <h2 className="sr-only">hi, I&apos;m achilles</h2>
      <div className="pointer-events-auto max-w-full">
        <VariableFontHoverByLetter
          label="hi, I'm achilles"
          fromWeight={400}
          toWeight={900}
          staggerDuration={30}
          staggerFrom="random"
          gradientMatch="achi"
          className="justify-center text-center text-blue-900 dark:text-white"
          style={{ width: 'auto', maxWidth: '100%' }}
        />
      </div>
    </section>
  )
}
