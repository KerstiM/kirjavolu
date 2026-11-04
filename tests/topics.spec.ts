import { describe, expect, it } from 'vitest'
import { CHRISTMAS_LIBRARY } from '@/domain/story/library'
import { planCollection } from '@/domain/story/planner'
import { renderPlan } from '@/domain/story/render'
import { profileHooks } from '@/domain/story/hooks'
import { validateCollection } from '@/domain/story/validate'
import { childLines } from '@/domain/generators/personal'
import { findInterestHooks } from '@/data/templates/interests'
import {
  getTopic,
  interestTexts,
  LISTED_TOPICS,
  storyTopics,
  TOPIC_GROUPS,
  TOPICS,
  upgradeTopics,
  type TopicId,
} from '@/data/topics'
import { migrate, SCHEMA_VERSION } from '@/utils/storage'
import type { ChildProfile, RequestFor } from '@/domain/models'
import { makeRequest, PAARU } from './helpers'

const child = (fields: Partial<ChildProfile>, age = 7): ChildProfile => ({
  ...PAARU,
  id: `topics-${JSON.stringify(fields)}-${age}`,
  name: 'Mia',
  age,
  topics: [],
  topicNotes: {},
  interests: [],
  favorites: [],
  foods: [],
  details: '',
  ...fields,
})

function series(kid: ChildProfile) {
  const request = makeRequest('letter', {
    seed: 99,
    occasionId: 'christmas',
    children: [kid],
    options: { startDate: '2026-12-01', connected: false },
  }) as RequestFor<'letter'>
  const plan = planCollection(request, CHRISTMAS_LIBRARY)
  return { plan, items: renderPlan(plan, CHRISTMAS_LIBRARY, request) }
}

const NARROW = TOPICS.filter((topic) => topic.within)

describe('the topic list', () => {
  it('shows a few broad topics in every group', () => {
    expect(LISTED_TOPICS.length).toBeGreaterThanOrEqual(25)
    expect(LISTED_TOPICS.length).toBeLessThanOrEqual(30)
    for (const group of TOPIC_GROUPS) {
      expect(LISTED_TOPICS.filter((topic) => topic.group === group.id).length, group.id).toBeGreaterThanOrEqual(3)
    }
    for (const topic of LISTED_TOPICS) {
      expect(topic.within, topic.id).toBeUndefined()
      expect(topic.hint, topic.id).toMatch(/^nt /)
    }
  })

  it('keeps every narrower topic and its stories, under a listed topic or the foods', () => {
    for (const topic of NARROW) {
      expect(topic.group, topic.id).toBeUndefined()
      if (topic.within !== 'foods') expect(getTopic(topic.within!).group, topic.id).toBeDefined()
      expect(topic.note, topic.id).toBeTruthy()
      expect(topic.match.test(topic.note!), `${topic.id}: „${topic.note}“`).toBe(true)
    }
  })

  it('gives a label no lines meant for another interest', () => {
    // „Talisport“ once read as a ball game in the short letters.
    expect(findInterestHooks(['Talverõõmud', 'Turnimine ja ronimine', 'Muinasjutud ja fantaasiamaailmad'])).toEqual([])
    expect(findInterestHooks(['Pallimängud']).map((hook) => hook.id)).toEqual(['ball'])
  })

  it('never reads a narrower topic out of a broad label', () => {
    for (const listed of LISTED_TOPICS) {
      const found = NARROW.filter((narrow) => narrow.match.test(listed.label)).map((narrow) => narrow.id)
      expect(found, listed.id).toEqual([])
    }
  })
})

describe('older profiles', () => {
  const old = child({
    topics: ['football', 'rubik', 'riddles', 'porridge', 'dinosaurs', 'peppa', 'unknown' as TopicId],
    topicNotes: undefined,
    foods: [],
  })

  it('moves narrow picks under the broader topic or among the foods', () => {
    const upgraded = upgradeTopics(old)
    expect(upgraded.topics).toEqual(['ballgames', 'riddles', 'dinosaurs', 'characters'])
    expect(upgraded.topicNotes).toEqual({
      ballgames: 'jalgpall',
      riddles: 'Rubiku kuubik',
      characters: 'Põrsas Peppa',
    })
    expect(upgraded.foods).toEqual(['riisipuder'])
    expect(upgradeTopics(upgraded)).toEqual(upgraded)
  })

  it('keeps the stories of every topic an older profile picked', () => {
    for (const topic of TOPICS) {
      const before = child({ topics: [topic.id], topicNotes: undefined })
      const after = upgradeTopics(before)
      expect(profileHooks(after).has(topic.id), topic.id).toBe(true)
      for (const hook of profileHooks(before)) expect(profileHooks(after).has(hook), `${topic.id}/${hook}`).toBe(true)
    }
  })

  it('keeps what the parent already wrote and does not repeat it', () => {
    const upgraded = upgradeTopics(child({ topics: ['ballgames', 'football'], topicNotes: { ballgames: 'jalgpall, ujumine' } }))
    expect(upgraded.topicNotes).toEqual({ ballgames: 'jalgpall, ujumine' })
    const appended = upgradeTopics(child({ topics: ['ballgames', 'basketball'], topicNotes: { ballgames: 'võrkpall' } }))
    expect(appended.topicNotes).toEqual({ ballgames: 'võrkpall, korvpall' })
  })

  it('are upgraded when the browser loads them', () => {
    const state = migrate({
      schemaVersion: SCHEMA_VERSION,
      children: [{ ...old, topicNotes: undefined }],
      creations: [],
      demoSeeded: true,
    })
    expect(state.children[0]).toMatchObject({
      name: 'Mia',
      topics: ['ballgames', 'riddles', 'dinosaurs', 'characters'],
      foods: ['riisipuder'],
    })
  })
})

describe('broad topics and the parent’s own words', () => {
  it('tells a broad topic without assuming a narrower one', () => {
    for (const listed of LISTED_TOPICS) {
      const kid = child({ topics: [listed.id] })
      const hooks = profileHooks(kid)
      expect([...hooks], listed.id).toEqual([listed.id])
      const { plan, items } = series(kid)
      expect(plan.days.some((d) => d.personalizationIds.includes(listed.id)), listed.id).toBe(true)
      const errors = validateCollection(plan, items, CHRISTMAS_LIBRARY).filter((i) => i.severity === 'error')
      expect(errors, listed.id).toEqual([])
      const text = items.map((item) => item.body).join('\n')
      for (const narrow of NARROW) expect(narrow.mentions.test(text), `${listed.id} → ${narrow.id}`).toBe(false)
    }
  })

  it('“Pallimängud: korvpall” tells about basketball, never about football', () => {
    const kid = child({ topics: ['ballgames', 'dinosaurs'], topicNotes: { ballgames: 'korvpall' } })
    expect(storyTopics(kid).map((topic) => topic.id)).toEqual(['basketball', 'dinosaurs'])
    const { plan, items } = series(kid)
    const told = plan.days.flatMap((d) => d.personalizationIds)
    expect(told).toContain('basketball')
    // The broad story comes last: the two topic letters go to what the parent named.
    expect(told).not.toContain('ballgames')
    const text = items.map((item) => item.body).join('\n')
    expect(text).toMatch(/korvpall/i)
    expect(text).not.toMatch(/jalgpall/i)
    expect(validateCollection(plan, items, CHRISTMAS_LIBRARY).filter((i) => i.severity === 'error')).toEqual([])
  })

  it('brings Peppa’s stories to a toddler who likes cartoons', () => {
    const kid = child({ topics: ['characters'], topicNotes: { characters: 'Peppa, Muumid' } }, 2)
    expect(profileHooks(kid).has('peppa')).toBe(true)
    const { items } = series(kid)
    expect(items.map((item) => item.body).join('\n')).toMatch(/Peppa/)
  })

  it('uses the parent’s words in the shorter letters', () => {
    const kid = child({ topics: ['videogames', 'boardgames'], topicNotes: { videogames: 'Minecraft', boardgames: 'Uno' } })
    expect(interestTexts(kid)).toEqual(['Minecraft', 'Uno'])
    const lines = childLines(kid).join('\n')
    expect(lines).toMatch(/Minecraft/)
    expect(lines).toMatch(/„Uno“/)
    // Uno is no chess: the board game story stays the general one.
    expect(lines).not.toMatch(/malet|ratsu/i)
  })

  it('falls back to the label when nothing is written', () => {
    const kid = child({ topics: ['vehicles'], topicNotes: { vehicles: '  ' } })
    expect(interestTexts(kid)).toEqual(['Sõidukid ja masinad'])
    expect(storyTopics(kid).map((topic) => topic.id)).toEqual(['vehicles'])
    expect(childLines(kid).join('\n')).not.toMatch(/autodest|rongidest|võidusõiduauto/i)
  })
})
