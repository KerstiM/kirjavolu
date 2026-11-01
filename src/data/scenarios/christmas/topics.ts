import type { Scenario, ScenarioContext } from '../../../domain/story/types'
import { TOPICS, type Topic } from '../../topics'

/**
 * Two stories that work with any topic of the profile list: the helper tries the
 * child's interest on a free evening, and reindeer Välk catches the same interest.
 * The topic brings its own hand-written middle (data/topics.ts); the frame around it
 * is the same for every topic. The planner picks one of the child's topics per letter.
 */

const ALL_TOPICS = TOPICS.map((topic) => topic.id)

/** Only called for a planned topic letter; the fallback keeps sample rendering safe. */
const topicOf = (c: ScenarioContext): Topic => c.topic ?? (TOPICS[0] as Topic)

export const TOPIC_SCENARIOS: Scenario[] = [
  {
    id: 'topic-tryout',
    title: 'Päkapiku vaba õhtu',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ALL_TOPICS,
    onlyWithHook: true,
    topicSlot: true,
    tags: ['hobby', 'free-evening'],
    tones: ['humorous', 'heartwarming'],
    earliest: 2,
    variants: {
      older: (c) => [
        'Eile oli töökojas vaba õhtu ja ma mõtlesin sinu peale.',
        topicOf(c).tryout,
        'Nüüd saan aru, miks see sulle nii meeldib. Homme proovin uuesti – ja seekord paremini.',
      ],
      young: (c) => [
        'Eile oli töökojas vaba õhtu ja ma mõtlesin sinu peale.',
        topicOf(c).tryout,
        'Nüüd saan aru, miks see sulle nii meeldib. Homme proovin uuesti!',
      ],
      toddler: (c) => [topicOf(c).toddlerTryout],
    },
    readAloud: (c) => [
      'Eile oli töökojas vaba õhtu ja ma mõtlesin sinu peale.',
      topicOf(c).tryout,
      'Nüüd saan aru, miks see sulle nii meeldib!',
    ],
  },
  {
    id: 'topic-reindeer',
    title: 'Välgu uus huvi',
    occasions: ['christmas'],
    role: 'standalone',
    hooks: ALL_TOPICS,
    onlyWithHook: true,
    topicSlot: true,
    tags: ['reindeer', 'hobby'],
    tones: ['humorous', 'magical'],
    earliest: 3,
    variants: {
      older: (c) => [
        'Põhjapõder Välk käitub viimasel ajal imelikult.',
        topicOf(c).reindeer,
        'Ma ei tea, kust ta selle mõtte sai. Aga mul on kahtlus, et keegi on talle sinust rääkinud.',
      ],
      young: (c) => [
        'Põhjapõder Välk käitub viimasel ajal imelikult.',
        topicOf(c).reindeer,
        'Kust ta selle mõtte sai? Kahtlustan, et keegi on talle sinust rääkinud.',
      ],
      toddler: (c) => [topicOf(c).toddlerReindeer],
    },
    readAloud: (c) => [
      'Põhjapõder Välk käitub viimasel ajal imelikult.',
      topicOf(c).reindeer,
      'Kes küll talle sinust rääkis?',
    ],
  },
]
