import creative from './creative.json'
import portfolio from './portfolio.json'
import { site } from './site'
import { asset } from '../utils/assets'

function stripHtml(text = '') {
  return String(text).replace(/<br\s*\/?>/gi, ' · ').replace(/<[^>]+>/g, '')
}

function isAchievement(item) {
  const t = `${item.title} ${item.description}`.toLowerCase()
  return (
    item.icon === '🏆' ||
    item.icon === '🚀' ||
    /gold|champion|runner|hackathon|dean|participant|rank/.test(t)
  )
}

const photo = (name) => asset(`assets/studio/photos/${name}`)
const logo = (name) => asset(`assets/studio/logos/${name}`)

/** Brand palettes — primary drives card/mark accents. */
export const brands = {
  sace: {
    name: 'SACE Student Council',
    colors: { primary: '#D4AF37', secondary: '#1E4FE0', tertiary: '#FFFFFF' },
    logo: logo('sace.jpg'),
    mark: 'SC',
  },
  soits: {
    name: 'SOITS',
    colors: { primary: '#E91E8C', secondary: '#111111', tertiary: '#FFFFFF' },
    logo: null,
    mark: 'SO',
  },
  nulipa: {
    name: 'NU Lipa / BSIT–MWA',
    colors: { primary: '#D4AF37', secondary: '#1E4FE0', tertiary: '#FFFFFF' },
    logo: logo('nu-lipa.png'),
    mark: 'NU',
  },
  tapus: {
    name: 'TAPUS!',
    colors: {
      primary: '#E53935',
      secondary: '#FFFFFF',
      tertiary: '#F5C518',
      quaternary: '#1E4FE0',
    },
    logo: logo('tapus.png'),
    mark: 'TP',
  },
  karbono: {
    name: 'Karbono',
    colors: { primary: '#2E7D32', secondary: '#F5F0E6', tertiary: '#FFFFFF' },
    logo: logo('karbono-mark.png'),
    mark: 'KB',
  },
  sight: {
    name: 'SIGHT',
    colors: { primary: '#1E4FE0', secondary: '#FFFFFF' },
    logo: logo('sight-mark.png'),
    mark: 'SI',
  },
  nulplay: {
    name: 'NULPlay',
    colors: { primary: '#1E4FE0', secondary: '#D4AF37', tertiary: '#FFFFFF' },
    logo: logo('nulplay.png'),
    mark: 'NP',
  },
  prism: {
    name: 'CHED PRISM',
    colors: { primary: '#1E4FE0', secondary: '#FFFFFF' },
    logo: logo('prism.png'),
    mark: 'PR',
  },
  heatmap: {
    name: 'NU Map',
    colors: { primary: '#1E4FE0', secondary: '#D4AF37', tertiary: '#FFFFFF' },
    logo: logo('heatmap.png'),
    mark: 'NM',
  },
  nutify: {
    name: 'NUtify',
    colors: { primary: '#1E4FE0', secondary: '#FFFFFF' },
    logo: logo('nutify-mark.png'),
    mark: 'NU',
  },
  tabulation: {
    name: 'NULP Tabulation',
    colors: { primary: '#1E4FE0', secondary: '#FFFFFF' },
    logo: null,
    mark: 'TB',
  },
  washette: {
    name: 'Washette',
    colors: { primary: '#2F6FED', secondary: '#FFFFFF' },
    logo: logo('washette.svg'),
    mark: 'WA',
  },
  ched: {
    name: 'CHED',
    colors: { primary: '#1E4FE0' },
    logo: logo('ched.svg'),
    mark: 'CH',
  },
}

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

const certs = portfolio.certifications ?? []

const achievementPhotoMap = [
  { match: /gold|worldskills/i, images: [photo('1st Gold Medal.jpg'), photo('2nd Gold Medal.jpg')] },
  {
    match: /runner|enigma|hackathon/i,
    images: [photo('Top 2 Hackathon.jpg'), photo('Breaking Enigma Hackathon 3.jpg')],
  },
  {
    match: /dean|honor|rank/i,
    images: [photo('Rank 1 First Honor.jpg'), photo('Rank 1 First Honor 2.jpg')],
  },
  { match: /dict|startup|participant/i, images: [photo('PSC1.jpg'), photo('PSC2.jpg')] },
]

function achievementImage(item, index) {
  const hit = achievementPhotoMap.find((row) => row.match.test(`${item.title} ${item.description}`))
  if (!hit) return null
  return hit.images[index % hit.images.length]
}

export const achievements = certs.filter(isAchievement).map((item, i) => {
  const hit = achievementPhotoMap.find((row) => row.match.test(`${item.title} ${item.description}`))
  return {
    title: item.title,
    detail: stripHtml(item.description),
    image: achievementImage(item, i),
    // every photo we have for this award (used by the detail view)
    images: hit ? hit.images : [],
    icon: 'award',
  }
})

const certPhotoMap = [{ match: /ic3/i, image: photo('IC3.jpg') }]

export const certifications = certs
  .filter((item) => !isAchievement(item))
  .map((item) => {
    const hit = certPhotoMap.find((row) => row.match.test(`${item.title} ${item.description}`))
    const skill = /java|network|ic3|html|css|sql/i.test(item.title)
    return {
      eyebrow: 'Certification',
      title: item.title,
      detail: stripHtml(item.description),
      image: hit?.image || null,
      icon: skill ? 'certificate' : 'medal',
    }
  })

export const about = {
  kicker: '01  /  A little about me',
  nameLead: 'Achilles Vonn',
  nameTail: 'D. Rabina.',
  role: 'Student / Mobile & Web Developer',
  body: "A consistent First Honor Dean's Lister and team leader. I build personal and academic coding solutions, learning through every project. Let's build something great together!",
  tags: [
    'Founder & entrepreneur',
    'UI / UX designer',
    'Backend developer',
    'Full-stack & mobile',
    '2× WorldSkills gold',
    'Hackathon runner-up',
    "First Honor Dean's Lister",
    'IT Specialist — Java & Networking',
    'IC3 · HTML · CSS · SQL',
    'BSIT – MWA, NU Lipa',
  ],
  caption: "Hello, I'm Achilles.",
  portrait: site.photo,
  railLabel: 'Recognition  /  Selected',
}

const ROLE_COPY = {
  President: 'Led the organization — direction, people, and the work that keeps a student body moving.',
  'Founder & Lead Developer':
    'Owned product end-to-end: architecture, shipping, and the loop from MVP to real users.',
  'Creatives Director':
    'Set visual direction for campaigns, events, and the identity that sits beside the code.',
  Secretary: 'Kept the organization moving: records, coordination, and quiet operational structure.',
  Student: 'Started the degree that turned classwork into products — mobile, web, and building in public.',
}

function brandForOrg(org = '') {
  const o = org.toLowerCase()
  if (o.includes('sace')) return brands.sace
  if (o.includes('soits')) return brands.soits
  if (o.includes('bsit') || o.includes('nu lipa')) return brands.nulipa
  if (o.includes('tapus')) return brands.tapus
  if (o.includes('karbono')) return brands.karbono
  return null
}

function letterMark(name = '') {
  const words = String(name)
    .replace(/[!/–—-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  const clean = String(name).replace(/[^a-zA-Z0-9]/g, '')
  if (clean.length <= 4) return clean.toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

function experienceCategory(item) {
  const role = String(item.role || '').toLowerCase()
  const org = String(item.organization || '').toLowerCase()
  // Work first: founder / product / business ventures
  if (role.includes('founder') || org.includes('tapus') || org.includes('karbono')) {
    return 'work'
  }
  // Everything campus / degree-side is academic
  return 'academic'
}

const CATEGORY_META = {
  work: {
    label: 'Work',
    tag: 'Work experience',
    foot: 'Product  /  Work',
    rail: 'Work  /  Upcoming',
  },
  academic: {
    label: 'Academic',
    tag: 'Academic experience',
    foot: 'Campus  /  Academic',
    rail: 'Academic  /  Upcoming',
  },
}

function mapExperienceRole(item) {
  const brand = brandForOrg(item.organization)
  const category = experienceCategory(item)
  const meta = CATEGORY_META[category]
  return {
    year: item.year,
    title: item.role,
    org: item.organization,
    body: ROLE_COPY[item.role] || `${item.role} at ${item.organization}.`,
    category,
    categoryLabel: meta.label,
    tag: meta.tag,
    foot: meta.foot,
    logo: brand?.logo || null,
    mark: brand?.mark || letterMark(item.organization),
    brandColor: brand?.colors?.primary || '#1E4FE0',
    brandColors: brand?.colors || { primary: '#1E4FE0' },
  }
}

const rawRoles = (portfolio.experience ?? []).map(mapExperienceRole)
const workRoles = rawRoles.filter((r) => r.category === 'work')
const academicRoles = rawRoles.filter((r) => r.category === 'academic')

export const experience = {
  kicker: '02  /  Experience',
  headlineLead: 'Learning.',
  headlineTail: 'Building. Leading.',
  railLabel: 'The journey  /  Upcoming',
  /** Work first, then academic — one continuous scroll track. */
  roles: [...workRoles, ...academicRoles],
  workCount: workRoles.length,
  academicCount: academicRoles.length,
}

/** Display titles & casing matched to brand / folder names. */
const PROJECT_META = {
  sight: {
    brand: 'sight',
    display: 'SIGHT',
    word: 'SIGHT',
    subtitle: 'Eye-health companion for kids, parents, and clinics',
  },
  nulplay: {
    brand: 'nulplay',
    display: 'NULPlay',
    word: 'NULPlay',
    subtitle: 'Campus music queue that actually ships',
  },
  tapus: {
    brand: 'tapus',
    display: 'TAPUS!',
    word: 'TAPUS!',
    subtitle: 'Customer Shop and Internal Management System',
  },
  karbono: {
    brand: 'karbono',
    display: 'Karbono',
    word: 'Karbono',
    subtitle: 'Green mobility and carbon-aware product work',
  },
  prism: {
    brand: 'prism',
    display: 'CHED PRISM',
    word: 'PRISM',
    subtitle: 'CHED R4A research & innovation surface',
  },
  heatmap: {
    brand: 'heatmap',
    display: 'NU Map',
    word: 'NU Map',
    subtitle: 'NULP student heatmap for campus flow',
  },
  nutify: {
    brand: 'nutify',
    display: 'NUtify',
    word: 'NUtify',
    subtitle: "Backup NUtify '26 · Mobile · Files",
  },
  tabulation: {
    brand: 'tabulation',
    display: 'NULP Tabulation',
    word: 'Tabulation',
    subtitle: 'Event scoring and live tabulation',
  },
  washette: {
    brand: 'washette',
    display: 'Washette',
    word: 'Washette',
    subtitle: 'Laundry operations, simplified',
  },
}

function brandForProject(id = '') {
  const meta = PROJECT_META[id]
  return meta ? brands[meta.brand] : null
}

export const projects = {
  kicker: '03  /  Selected projects',
  railLabel: 'Project stack  /  Live',
  items: (creative ?? []).map((item) => {
    const link = item.links?.find((l) => l.href && l.href !== '#')
    const meta = PROJECT_META[item.id] || {}
    const brand = brandForProject(item.id)
    const mark = brand?.mark || letterMark(meta.display || item.name)
    return {
      id: item.id,
      mark: `${mark.charAt(0)}.`,
      markText: mark,
      word: meta.word || item.name,
      title: meta.display || item.name,
      subtitle: meta.subtitle || item.tagline,
      tagline: item.tagline,
      tag: item.status,
      href: link?.href || '',
      hrefLabel: link?.label || item.status,
      stack: item.tech ?? [],
      description: item.description,
      problem: item.problem || '',
      solution: item.solution || '',
      features: item.features ?? [],
      uniqueness: item.uniqueness || '',
      role: item.role || '',
      year: item.year || '',
      links: item.links ?? [],
      images: (item.images ?? []).map((src) => asset(src)),
      logo: brand?.logo || null,
      brandColor: brand?.colors?.primary || '#1E4FE0',
      brandColors: brand?.colors || { primary: '#1E4FE0' },
    }
  }),
}

export const contact = {
  kicker: '04  /  Get in touch',
  titleLead: "Let’s build",
  titleTail: 'something.',
  lede: "Have a project or a question? I’d love to hear it.",
  socials: [
    { label: 'GitHub', href: site.socials.github },
    { label: 'LinkedIn', href: site.socials.linkedin },
    { label: 'Instagram', href: site.socials.instagram },
  ],
}

/** All collected photos + portrait. `r` = width / height of the full (uncropped) image. */
const contactPhotoFiles = [
  { file: 'chi_photo.png', root: true, alt: 'Portrait of Achilles', r: 0.559 },
  { file: 'NULPlay Onsite.jpg', alt: 'NULPlay onsite', r: 0.8 },
  { file: 'TAPUS! Soft Launch Cover Photo.jpg', alt: 'TAPUS soft launch', r: 2.702 },
  { file: 'SOITS President.jpg', alt: 'SOITS presidency', r: 1 },
  { file: 'CHED AI.jpg', alt: 'CHED RAISE event', r: 1.333 },
  { file: 'The Filipino Times.jpg', alt: 'The Filipino Times feature', r: 1.778 },
  { file: 'Breaking Enigma Hackathon 3.jpg', alt: 'Breaking Enigma Hackathon', r: 0.8 },
  { file: 'CD.jpg', alt: 'Campus moment', r: 1 },
  { file: 'Rank 1 First Honor.jpg', alt: 'First Honor recognition', r: 1 },
  { file: 'Rank 1 First Honor 2.jpg', alt: 'First Honor recognition', r: 1 },
  { file: '1st Gold Medal.jpg', alt: 'WorldSkills gold medal', r: 1 },
  { file: '2nd Gold Medal.jpg', alt: 'WorldSkills gold medal', r: 1 },
  { file: 'Top 2 Hackathon.jpg', alt: 'Hackathon runner-up', r: 1 },
  { file: 'IC3.jpg', alt: 'IC3 certification', r: 1 },
  { file: 'PSC1.jpg', alt: 'DICT startup participant', r: 1.333 },
  { file: 'PSC2.jpg', alt: 'DICT startup participant', r: 2.224 },
  { file: 'SACE SC Logo.jpg', alt: 'SACE Student Council', r: 1 },
]

/**
 * Desktop photocard layout. The scatter field is exactly the content column wide, so each side of
 * the form gets two columns x five rows of cells. Every photo keeps its full aspect ratio and is
 * "contained" in its cell (nothing cropped); x / y are the cell centres, in percent of the field.
 */
const CELL_W = 104
const CELL_H = 90
const COLS = [6, 17.4]
const ROWS = [10, 30, 50, 70, 90]
// small deterministic jitter so the cards look dropped on a table, not placed on a grid
const JITTER = [
  [0, 1], [1.2, -1.5], [-0.8, 0.8], [0.6, 1.6], [-1, -0.6], [1.4, 0.6], [0.4, -1.2], [-1.2, 1.2], [0.8, 0.2],
]
const SLOT_ORDER = [
  [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4],
]
const tilts = [-4.5, 3.5, -2.5, 4, -3.5, 2.5, -4, 3, -2, 4.5, -3, 2, -5, 3.8, -2.8, 4.2, -3.8]

function slotFor(i) {
  const side = i % 2 // 0 = left, 1 = right
  const [col, row] = SLOT_ORDER[Math.floor(i / 2) % SLOT_ORDER.length]
  const [jx, jy] = JITTER[Math.floor(i / 2) % JITTER.length]
  const cx = COLS[col] + jx
  return {
    x: side === 0 ? cx : 100 - cx,
    y: ROWS[row] + jy * 1.6,
  }
}

export const contactPhotos = contactPhotoFiles.map((item, i) => {
  const { x, y } = slotFor(i)
  const w = item.r >= CELL_W / CELL_H ? CELL_W : CELL_H * item.r
  return {
    src: item.root ? site.photo : photo(item.file),
    alt: item.alt,
    rotate: tilts[i % tilts.length],
    ratio: item.r,
    x,
    y,
    w: Math.round(w * 10) / 10,
  }
})

/** Mobile / compact bands — full set split across top & bottom. */
export const contactBands = {
  top: contactPhotos.slice(0, Math.ceil(contactPhotos.length / 2)),
  bottom: contactPhotos.slice(Math.ceil(contactPhotos.length / 2)),
}

/** @deprecated kept for any leftover imports — prefer contactPhotos */
export const contactSides = {
  left: contactPhotos.filter((_, i) => i % 2 === 0),
  right: contactPhotos.filter((_, i) => i % 2 === 1),
}

export const phaseWeights = {
  about: 0.16,
  experience: 0.34,
  projects: 0.34,
  contact: 0.16,
}
