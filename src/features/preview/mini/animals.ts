export type AnimalId =
  | 'mouse'
  | 'pig'
  | 'bunny'
  | 'frog'
  | 'bear'
  | 'ladybug'
  | 'chick'
  | 'cat'
  | 'elephant'
  | 'butterfly'
  | 'hedgehog'
  | 'owl'

export const ANIMALS: AnimalId[] = [
  'mouse',
  'pig',
  'bunny',
  'frog',
  'bear',
  'ladybug',
  'chick',
  'cat',
  'elephant',
  'butterfly',
  'hedgehog',
  'owl',
]

/** Border colours of toddler cards, cycled so neighbouring cards differ. */
export const CARD_COLORS = ['#9db4e0', '#8cc99a', '#f2c46d', '#b79be0', '#f3a86b', '#ef9fb0']

export function animalFor(index: number): AnimalId {
  return ANIMALS[index % ANIMALS.length] as AnimalId
}

export function colorFor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length] as string
}
