import type { CompanionId } from './companions'

/**
 * The drawings of the three letter companions as SVG text, eight poses each. All three are
 * drawn like the brand mascot (MascotModern.vue): flat lavender shapes without outlines, dark
 * legs and short stroke arms without hands, dot eyes and a line mouth, and no cheeks. They
 * share one 130 × 140 drawing space, so the mascot, the päkapikk and the jänes stand at the
 * same height. Static and written here (no user text goes in), so the figures can be inlined
 * with `v-html` and print with the letter.
 */

const PAPER = '#AFA9EC'
const LAVENDER = '#7F77DD'
const LIMB = '#3C3489'
const INK = '#26215C'
const SEAL = '#D85A30'
const GOLD = '#F2C46D'
const PINK = '#ED93B1'
const CREAM = '#FFF8EE'

type EyeKind = 'dot' | 'side' | 'wide' | 'up' | 'down' | 'wink' | 'heart'
type MouthKind = 'smile' | 'open' | 'flat' | 'think' | 'w'

const line = (d: string, width = 3.5) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
const arm = (d: string) =>
  `<path d="${d}" fill="none" stroke="${LIMB}" stroke-width="7" stroke-linecap="round"/>`
const heart = (x: number, y: number, scale: number, fill: string) =>
  `<path transform="translate(${x} ${y}) scale(${scale})" d="M0 6C-10-6-22 6 0 22C22 6 10-6 0 6Z" fill="${fill}"/>`
const star = (x: number, y: number, scale: number) =>
  `<polygon transform="translate(${x} ${y}) scale(${scale})" points="0,-10 2.9,-3.1 10,-3.1 4.2,1.5 6.2,8.5 0,4.4 -6.2,8.5 -4.2,1.5 -10,-3.1 -2.9,-3.1" fill="${GOLD}"/>`
const sparkle = (x: number, y: number, scale: number, fill = GOLD) =>
  `<path transform="translate(${x} ${y}) scale(${scale})" d="M0-8Q1-1 8 0Q1 1 0 8Q-1 1-8 0Q-1-1 0-8Z" fill="${fill}"/>`
const text = (size: number, x: number, y: number, body: string) =>
  `<text x="${x}" y="${y}" font-family="inherit" font-weight="700" font-size="${size}" fill="${LAVENDER}">${body}</text>`
const zzz = (x: number, y: number) =>
  text(14, x, y, 'z') + text(11, x + 11, y - 14, 'z') + text(9, x + 19, y - 25, 'z')
const question = (x: number, y: number) => text(20, x, y, '?')
const confetti = () =>
  (
    [
      [14, 40, SEAL],
      [112, 30, GOLD],
      [24, 74, LAVENDER],
      [108, 62, SEAL],
      [8, 96, GOLD],
      [118, 92, PINK],
      [30, 18, GOLD],
      [92, 14, LAVENDER],
    ] as const
  )
    .map(([x, y, fill], i) =>
      i % 2
        ? `<circle cx="${x}" cy="${y}" r="2.6" fill="${fill}"/>`
        : `<rect x="${x}" y="${y}" width="6" height="3" rx="1" fill="${fill}" transform="rotate(${30 + i * 20} ${x} ${y})"/>`,
    )
    .join('')

/** `shine` puts a small white glint in round eyes; the brand mascot's own eyes have none. */
function eyes(kind: EyeKind, left: number, right: number, y: number, shine = false): string {
  const glint = (x: number, r: number) =>
    shine ? `<circle cx="${x - r}" cy="${y - r}" r="${r}" fill="#fff"/>` : ''
  const dot = (x: number) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${INK}"/>${glint(x, 1.5)}`
  const one = {
    dot,
    side: (x: number) => dot(x + 2.5),
    wide: (x: number) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${INK}"/>${glint(x, 2)}`,
    up: (x: number) => line(`M${x - 5} ${y + 1} Q${x} ${y - 5} ${x + 5} ${y + 1}`),
    down: (x: number) => line(`M${x - 5} ${y - 1} Q${x} ${y + 5} ${x + 5} ${y - 1}`),
    heart: (x: number) => heart(x, y - 5, 0.55, '#D4537E'),
  }
  if (kind === 'wink') return dot(left) + one.up(right)
  return one[kind](left) + one[kind](right)
}

function mouth(kind: MouthKind, x: number, y: number): string {
  if (kind === 'smile') return line(`M${x - 7} ${y} Q${x} ${y + 7} ${x + 7} ${y}`)
  if (kind === 'open')
    return `<path d="M${x - 8} ${y - 1} Q${x} ${y + 10} ${x + 8} ${y - 1} Z" fill="${INK}"/>`
  if (kind === 'think') return line(`M${x - 6} ${y + 4} Q${x + 1} ${y + 5} ${x + 6} ${y + 1}`)
  if (kind === 'w')
    return line(
      `M${x} ${y - 2} V${y} M${x} ${y} Q${x - 4} ${y + 6} ${x - 8} ${y + 1} M${x} ${y} Q${x + 4} ${y + 6} ${x + 8} ${y + 1}`,
      3,
    )
  return line(`M${x - 5} ${y + 3} L${x + 5} ${y + 3}`)
}

const gift = (x: number, y: number) =>
  `<rect x="${x - 13}" y="${y - 7}" width="26" height="19" rx="2" fill="${SEAL}"/><rect x="${x - 2.5}" y="${y - 7}" width="5" height="19" fill="${GOLD}"/><rect x="${x - 15}" y="${y - 13}" width="30" height="7" rx="2" fill="#993C1D"/><ellipse cx="${x - 5}" cy="${y - 17}" rx="5" ry="3.5" fill="${GOLD}"/><ellipse cx="${x + 5}" cy="${y - 17}" rx="5" ry="3.5" fill="${GOLD}"/>`
const letterProp = (x: number, y: number) =>
  `<rect x="${x - 17}" y="${y - 11}" width="34" height="22" rx="3" fill="${CREAM}"/><path d="M${x - 17} ${y - 9} L${x} ${y + 3} L${x + 17} ${y - 9}" fill="none" stroke="${PAPER}" stroke-width="2"/><circle cx="${x}" cy="${y + 3}" r="3" fill="${SEAL}"/>`
const flower = (x: number, y: number) =>
  `<path d="M${x} ${y} V${y + 38}" stroke="#1D9E75" stroke-width="3" stroke-linecap="round"/><ellipse cx="${x + 6}" cy="${y + 24}" rx="6" ry="3" fill="#1D9E75" transform="rotate(-30 ${x + 6} ${y + 24})"/>` +
  [0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<circle cx="${(x + 7 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(y + 7 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="5" fill="${PINK}"/>`,
    )
    .join('') +
  `<circle cx="${x}" cy="${y}" r="4" fill="${GOLD}"/>`
const carrot = (x: number, y: number) =>
  `<path d="M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 30} Z" fill="#EF9F27"/><ellipse cx="${x - 3}" cy="${y - 5}" rx="3" ry="7" fill="#1D9E75" transform="rotate(-18 ${x - 3} ${y - 5})"/><ellipse cx="${x + 3}" cy="${y - 5}" rx="3" ry="7" fill="#1D9E75" transform="rotate(18 ${x + 3} ${y - 5})"/>`
const paper = (x: number, y: number) =>
  `<g transform="rotate(-6 ${x} ${y})"><rect x="${x - 15}" y="${y - 10}" width="30" height="21" rx="2" fill="${CREAM}"/><path d="M${x - 9} ${y - 3}H${x + 9}M${x - 9} ${y + 4}H${x + 4}" stroke="${PAPER}" stroke-width="2" stroke-linecap="round"/></g>`
const pencil = (x1: number, y1: number, x2: number, y2: number) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/><line x1="${x2}" y1="${y2}" x2="${x2 + 1.5}" y2="${y2 - 2.5}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`

interface PoseSpec {
  eyes: EyeKind
  mouth: MouthKind
  /** Arms behind the body, or (`over`) in front of it. */
  arms: string
  over?: boolean
  /** Drawn in front of everything, inside the figure's tilt. */
  prop?: string
  /** Drawn around the figure: sparkles, hearts, a sleeping "z". */
  extra?: string
  tilt?: string
  /** The whole figure jumps up. */
  lift?: number
}

const legs = (left: number, right: number, top: number, height: number) =>
  `<rect x="${left}" y="${top}" width="10" height="${height}" rx="5" fill="${LIMB}"/><rect x="${right}" y="${top}" width="10" height="${height}" rx="5" fill="${LIMB}"/>`

// ----- Ümbrik: the brand mascot itself -----

const MASCOT: PoseSpec[] = [
  { eyes: 'dot', mouth: 'smile', arms: arm('M16 78 L6 92') + arm('M114 72 L124 52') },
  {
    eyes: 'up',
    mouth: 'open',
    arms: arm('M16 70 L6 50') + arm('M114 70 L124 50'),
    extra: sparkle(22, 14, 1.3) + sparkle(108, 8, 1),
  },
  {
    eyes: 'dot',
    mouth: 'think',
    arms: arm('M16 80 L6 94') + arm('M114 74 Q124 62 112 52'),
    extra: `<circle cx="98" cy="18" r="3" fill="${PAPER}"/><circle cx="86" cy="10" r="4" fill="${PAPER}"/>`,
  },
  { eyes: 'wide', mouth: 'open', arms: arm('M16 70 L4 60') + arm('M114 70 L126 60') },
  {
    eyes: 'down',
    mouth: 'flat',
    arms: arm('M16 80 L8 98') + arm('M114 80 L122 98'),
    extra: zzz(96, 34),
    tilt: 'rotate(4 65 126)',
  },
  {
    eyes: 'up',
    mouth: 'smile',
    arms: arm('M16 78 L40 100') + arm('M114 78 L90 100'),
    over: true,
    extra:
      heart(104, 10, 0.8, '#D4537E') + heart(14, 22, 0.5, PINK) + heart(92, -6, 0.4, '#D4537E'),
  },
  {
    eyes: 'dot',
    mouth: 'smile',
    arms: arm('M16 78 L6 92') + arm('M114 72 L122 44'),
    extra: star(124, 28, 1.5),
  },
  {
    eyes: 'dot',
    mouth: 'open',
    arms: arm('M16 72 L-2 84') + arm('M114 66 L128 48'),
    extra: `<path d="M-14 50H4M-18 62H0M-12 74H6" stroke="#C9C5F2" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    tilt: 'rotate(9 65 126)',
  },
]

function mascot(pose: PoseSpec): string {
  return (
    legs(42, 78, 104, 22) +
    (pose.over ? '' : pose.arms) +
    `<rect x="14" y="28" width="102" height="82" rx="8" fill="${PAPER}"/>` +
    `<path d="M17 107 L37 92 M113 107 L93 92" fill="none" stroke="${LAVENDER}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M14 36 Q14 28 22 28 L108 28 Q116 28 116 36 L65 68 Z" fill="${LAVENDER}"/><circle cx="65" cy="66" r="7" fill="${SEAL}"/>` +
    eyes(pose.eyes, 46, 84, 83) +
    mouth(pose.mouth, 65, 91) +
    (pose.over ? pose.arms : '') +
    (pose.prop ?? '')
  )
}

// ----- Päkapikk -----

const SKIN = '#F8D5B8'

const ELF: PoseSpec[] = [
  { eyes: 'up', mouth: 'open', arms: arm('M44 104 L30 120') + arm('M86 104 L104 82') },
  {
    eyes: 'wide',
    mouth: 'open',
    arms: arm('M44 106 L52 120') + arm('M86 106 L78 120'),
    over: true,
    prop: letterProp(65, 118),
  },
  {
    eyes: 'up',
    mouth: 'smile',
    arms: arm('M44 104 L30 120') + arm('M86 104 L98 92'),
    extra: heart(106, 70, 0.7, '#D4537E') + heart(116, 52, 0.4, PINK),
  },
  {
    eyes: 'dot',
    mouth: 'smile',
    arms: arm('M44 106 L52 120') + arm('M86 106 L80 118'),
    over: true,
    prop: paper(50, 120) + pencil(80, 118, 96, 98),
  },
  {
    eyes: 'up',
    mouth: 'open',
    arms: arm('M44 106 L52 118') + arm('M86 106 L78 118'),
    over: true,
    prop: gift(65, 118),
    extra: sparkle(20, 62, 1) + sparkle(112, 54, 0.8) + sparkle(116, 92, 0.6, PINK),
  },
  {
    eyes: 'down',
    mouth: 'flat',
    arms: arm('M44 104 L34 124') + arm('M86 104 L96 124'),
    extra: zzz(98, 40),
  },
  {
    eyes: 'up',
    mouth: 'open',
    arms: arm('M44 104 L26 82') + arm('M86 104 L104 82'),
    extra: confetti(),
  },
  {
    eyes: 'side',
    mouth: 'think',
    arms: arm('M44 104 L30 120') + arm('M86 106 L76 94'),
    over: true,
    extra: question(104, 44),
  },
]

function elf(pose: PoseSpec): string {
  return (
    legs(48, 72, 112, 16) +
    (pose.over ? '' : pose.arms) +
    `<rect x="40" y="94" width="50" height="26" rx="12" fill="${LAVENDER}"/><rect x="40" y="108" width="50" height="5" fill="${LIMB}"/><rect x="61" y="106.5" width="8" height="8" rx="2" fill="${GOLD}"/>` +
    `<path d="M37 70 Q26 68 21 61 Q23 78 38 84 Z" fill="${SKIN}"/><path d="M93 70 Q104 68 109 61 Q107 78 92 84 Z" fill="${SKIN}"/>` +
    `<circle cx="65" cy="72" r="30" fill="${SKIN}"/>` +
    `<circle cx="54" cy="104" r="8" fill="${CREAM}"/><circle cx="65" cy="108" r="9" fill="${CREAM}"/><circle cx="76" cy="104" r="8" fill="${CREAM}"/>` +
    `<path d="M36 56 Q40 26 76 8 Q68 32 94 56 Z" fill="${SEAL}"/><circle cx="77" cy="8" r="7" fill="${CREAM}"/><rect x="33" y="50" width="64" height="12" rx="6" fill="${CREAM}"/>` +
    eyes(pose.eyes, 53, 77, 74, true) +
    `<ellipse cx="65" cy="82" rx="4" ry="3" fill="#EE9C8C"/>` +
    mouth(pose.mouth, 65, 87) +
    (pose.over ? pose.arms : '') +
    (pose.prop ?? '')
  )
}

// ----- Jänes -----

const FUR = '#EEEDFE'

interface BunnyPose extends PoseSpec {
  /** Tilt of each ear, in degrees. */
  ears: [number, number]
}

const BUNNY: BunnyPose[] = [
  { eyes: 'up', mouth: 'w', ears: [-8, 18], arms: arm('M44 100 L30 118') + arm('M86 100 L104 78') },
  {
    eyes: 'down',
    mouth: 'w',
    ears: [-130, 130],
    arms: arm('M44 100 L60 118') + arm('M86 100 L70 118'),
    over: true,
    extra: zzz(100, 38),
  },
  {
    eyes: 'wide',
    mouth: 'open',
    ears: [-3, 3],
    arms: arm('M44 100 L30 118') + arm('M86 102 L100 110'),
    prop: carrot(104, 100),
  },
  {
    eyes: 'up',
    mouth: 'w',
    ears: [-8, 8],
    arms: arm('M44 100 L30 118') + arm('M86 102 L100 108'),
    prop: flower(104, 86),
  },
  {
    eyes: 'up',
    mouth: 'open',
    ears: [-6, 6],
    arms: arm('M44 100 L16 92') + arm('M86 100 L114 92'),
    extra: heart(112, 56, 0.7, '#D4537E') + heart(8, 56, 0.5, PINK),
  },
  {
    eyes: 'up',
    mouth: 'open',
    ears: [-26, 26],
    arms: arm('M44 100 L26 78') + arm('M86 100 L104 78'),
    lift: 10,
    extra: sparkle(18, 120, 0.9) + sparkle(112, 122, 0.8, PINK),
  },
  {
    eyes: 'side',
    mouth: 'think',
    ears: [-8, 34],
    arms: arm('M44 100 L30 118') + arm('M86 102 L88 84'),
    over: true,
    extra: question(104, 40),
  },
  {
    eyes: 'heart',
    mouth: 'w',
    ears: [-3, 3],
    arms: arm('M44 100 L58 112') + arm('M86 100 L72 112'),
    over: true,
    extra: heart(104, 34, 0.6, '#D4537E') + heart(16, 44, 0.45, PINK),
  },
]

function bunny(pose: BunnyPose): string {
  const ears = [52, 78]
    .map(
      (x, i) =>
        `<g transform="rotate(${pose.ears[i]} ${x} 50)"><ellipse cx="${x}" cy="26" rx="9" ry="25" fill="${FUR}"/><ellipse cx="${x}" cy="29" rx="4.5" ry="16" fill="#F4C0D1"/></g>`,
    )
    .join('')
  const figure =
    legs(48, 72, 112, 16) +
    ears +
    (pose.over ? '' : pose.arms) +
    `<ellipse cx="65" cy="102" rx="24" ry="22" fill="#D9D6FA"/>` +
    `<ellipse cx="65" cy="70" rx="32" ry="28" fill="${FUR}"/>` +
    eyes(pose.eyes, 52, 78, 68, true) +
    `<ellipse cx="65" cy="74" rx="3.5" ry="2.6" fill="${PINK}"/>` +
    mouth(pose.mouth, 65, 78) +
    (pose.over ? pose.arms : '') +
    (pose.prop ?? '')
  return `<g${pose.lift ? ` transform="translate(0 -${pose.lift})"` : ''}>${figure}</g>`
}

/** How many poses each companion has. */
export const POSE_COUNT = ELF.length

/** One companion's pose as a finished `<svg>`; `pose` wraps around. */
export function companionSvg(id: CompanionId, pose: number): string {
  const index = ((pose % POSE_COUNT) + POSE_COUNT) % POSE_COUNT
  const spec = id === 'pakapikk' ? ELF[index]! : id === 'umbrik' ? MASCOT[index]! : BUNNY[index]!
  const art =
    id === 'pakapikk' ? elf(spec) : id === 'umbrik' ? mascot(spec) : bunny(spec as BunnyPose)
  const lifted = id === 'janes' && (spec as BunnyPose).lift
  const shadow = `<ellipse cx="65" cy="129" rx="${lifted ? 22 : 30}" ry="4" fill="#000" opacity=".08"/>`
  return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g transform="translate(35 50) scale(1.3)">${shadow}<g${spec.tilt ? ` transform="${spec.tilt}"` : ''}>${art}</g>${spec.extra ?? ''}</g></svg>`
}
