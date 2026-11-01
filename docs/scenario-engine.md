# Scenario engine

Kirjavõlu writes Christmas daily letter series (7 or 24 letters, one child or a
linked family series) with a scenario engine. Everything runs locally from
hand-written Estonian texts; there is no AI or external service at runtime, and
the same request and seed always give the same letters.

Other content types and occasions still use the older template generator
(`src/domain/generators`). The planning and validation layers are written so
that other occasions can move over one library at a time (see *Adding an
occasion*).

## Why the old letters felt assembled

The old `letterGenerator` built every letter from independent slots: a random
opening, a random "core" event, a random personal sentence ("Kuulsin, et sulle
meeldib …"), a random task and a random closing. Each slot was chosen from its own
pool, so

- a letter had no single topic – the parts had no causal connection;
- profile facts were inserted as standalone sentences, again and again;
- tasks and slogans were added to almost every letter;
- the serial story was a fixed list of beats with filler in between, and only the
  oldest child heard it;
- threads assumed the child had answered (“Ma nägin sinu märki!”, “Aitäh vastuse
  eest!”), and the secret-helper arc waited for a “JAH”.

## Architecture

```
request ─▶ planCollection (planner.ts) ─▶ CollectionPlan ─▶ renderPlan (render.ts) ─▶ letters
                 ▲                                                    │
         ScenarioLibrary (library.ts)                    validateCollection (validate.ts)
         src/data/scenarios/<occasion>/*
```

**Stage A – planning** (`src/domain/story/planner.ts`) decides the whole collection
before any text is written, in this order:

1. Frame: introduction on day 1, farewell on the last day, a Christmas Eve letter
   when 24 December falls inside a longer series.
2. Real family plans: family events and challenges (`familyEvents.ts`) take the
   whole letter of their day.
3. Paired sibling days (`familyPlan` in `linkedLetters.ts`): one plan row → both
   children's letters.
4. Secret helper (oldest reader with younger siblings, 12+ letters).
5. Story arc stages. Shared stages (star lost, wrong suspect, star found) happen on
   one day for every child; the others go to the band that tells them. A short
   series keeps only the required stages, spread evenly. A child whose days are
   too full to reach the ending does not start the arc.
6. Standalone episodes on all remaining days, chosen day by day for the whole
   family with a seeded score: personal hook wanted and allowed, tone, no repeated
   motif on neighbouring days, shared-world bonus, family duplicates last.
7. Activities and postscripts in day order: optional activities about every third
   letter (`length` "short" = none, "long" = every other), the answer of yesterday's
   puzzle as a P.S., the Sunday sweet and the house rule.

The plan is plain data (`PlannedDay[]`): scenario id, arc stage, personalization
ids, activity flag, postscripts, parent preparation, facts the child already knows.

**Stage B – rendering** (`src/domain/story/render.ts`) turns each planned day into
a letter using exactly the planned scenario variant, personal hooks, activity and
postscripts. It adds nothing else.

**Narrative state.** Scenarios declare `requires`, `until` and `establishes`
facts (`star-lost`, `feather-found`, `star-found`, …). The plan keeps one world
timeline (`facts`: fact → day). In a variant, `c.knows(fact)` is true when *this
child* was told it earlier and `c.happened(fact)` when it happened anywhere in the
world – e.g. the old elf mentions the silver dust the young elf found, but the
farewell only mentions the returned star to a child who heard the story.

**Shared world.** A scenario marked `world: true` is a canonical event: it is told
on one day only, to every child who hears it, each from their own helper's side
(`worldEvents` in the plan). At most one child per age band tells a scenario,
because the narrator is often its hero. The siblings' helpers appear by name
through `c.cast` (`older`, `young`, `tiny`); a single child meets workshop elves
instead (`STAND_IN_CAST` in `characters.ts`).

**Voices.** One explicitly written text per band (`older`, `young`, `toddler`);
the narrator's personality lives in the writing. `characters.ts` documents each
voice and holds their sign-offs.

| Band | Narrator | Writing |
| --- | --- | --- |
| older (≈8–12, independent reader) | old, thoughtful elf (Kõpsu-Mõpsu) | mechanisms and small mysteries, dry humour, ~400–520 characters |
| young (≈5–7) | young, lively elf (Tipp-Topp) | cooking and experiments, short sentences, ~250–380 characters |
| toddler (≈1–2, read aloud) | tiniest elf (Pisi-Pätsi) | one sound, movement or thing to look at, ≤150 characters, one paragraph |
| toddler, age 3+ (`readAloud`) | tiniest elf | the same episode as a little story: what happened, how it turned out, something to do together; 2–3 paragraphs, fits the reader poster |

The band comes from age and reading level (`ageBand`) and the difficulty setting
(`adjustBand`), so a strong six-year-old reader can get the older letters.

**Personalization** (`hooks.ts`, `data/topics.ts`). The parent picks topics for the
child from a list of about 40 (`TOPICS`, grouped: games and stories, animals, sport,
creativity, science, puzzles, cartoon characters, foods). Every topic is a hook;
free-text interests that match a topic's `match` count too. Free text that matches
nothing is only quoted in the short-letter templates: without a language model it
cannot be declined or woven into a story.

A scenario lists the hooks its story can carry and branches on `c.uses(hook)` inside
the event (the elf thinks of the child while solving the puzzle box – no “I heard
you like …”). Two topic scenarios (`data/scenarios/christmas/topics.ts`,
`topicSlot`) work with any topic: the elf tries the child's interest on a free
evening (`tryout`), and reindeer Välk catches it (`reindeer`); each topic brings
these middles hand-written, plus one-line toddler versions. The planner tells one
topic per such letter – the one the child has heard least about.
The planner only activates hooks that are in the profile and that really change
that band's text (`effectiveHooks`), at most `PERSONALIZATION.perHookPer24` times
per hook and `minGap` days apart, aiming at `share` of personal letters. The rest
of the collection is purely fictional.

**User actions are never assumed.** Puzzles reveal their answer in tomorrow's
P.S. without saying the child answered; the secret-helper invitation needs no
reply (keeping the secret is the agreement) and every mission is an offer;
challenge endings do not claim success.

## Validation

`validateCollection(plan, items, library)` reports, per child and family-wide:
duplicate scenarios, repeated paragraphs, repeated 6-word phrases, arc order,
chronology (`requires`/`until`), conflicting world events, unsupported or
unplanned personal facts, assumed child responses, invalid puzzles, toddler cards
with several paragraphs, missing milestones (introduction, 24 December, farewell),
mechanical personalization, moralizing slogans, dangling arcs, leaked secrets,
mismatched paired days and cards that are too long for the poster
(`CARD_LIMITS` warn below ≈8 pt, `CARD_HARD_LIMITS` overflow).

`validateLibrary(library)` checks the data itself: unique ids, every hook changes
some text, no neutral text mentions a hook, every fact is established somewhere,
paragraphs start with a capital, puzzles pass their `check()`, texts fit the card
budget with room for a postscript.

These checks catch structural problems. They do not prove that a letter is
funny, warm or well written – read the golden files for that.

## Reviewing a whole collection

`tests/golden.spec.ts` writes full collections to `docs/samples/`:

- `christmas-family.md` – Ruben, Jasper and Brita, 24 letters each (72 letters,
  with the parent sheet);
- `christmas-jasper-standalone.md` – one child without the story arc.

After changing a scenario or the planner, run `npx vitest run -u tests/golden.spec.ts`
and read the diff as a whole. Look for: the same motif on neighbouring days,
a topic change without a transition, a personal detail that sounds inserted, plot
contradictions, moral lessons, weak endings and a helper who sounds like another
helper.

## Editorial guidelines

- One event per letter, told from beginning to end: setup, what went wrong, what
  happened next, how it ended (or a deliberate cliffhanger).
- Letters are read in the morning: events happened “eile” or “täna öösel”.
- End on the story, not on a slogan. No “ole tubli”, no praise for things the
  child did not do, no “päkapikud näevad kõike”.
- Do not invent facts about the child or the siblings. Use the profile only
  through hooks.
- Never write as if the child replied, drew or left something.
- Toddler cards are for reading aloud: one paragraph, a sound or a movement to do
  together.
- Every toddler episode also has a `readAloud` version for children of three and
  over: a short story in 2–3 paragraphs (at most 380 characters) ending with
  something to do together. Their letters go on the poster, not the small cards.
- Helper names are only used in the nominative (subject); declining hyphenated
  names reads badly. Child names use `c.n('genitive')` etc.
- Keep within the card budget (see the lengths above).

## How to …

### Add a scenario

Add an object to the band file in `src/data/scenarios/christmas/` (`older.ts`,
`young.ts`, `toddler.ts`) or to `world.ts` if several helpers can tell it:

```ts
{
  id: 'snow-tunnel',                // stable, unique
  title: 'Tunnel ukse ees',         // shown on the parent sheet for shared events
  occasions: ['christmas'],
  role: 'standalone',
  tags: ['snow', 'home'],           // motifs; neighbouring days avoid the same tag
  tones: ['humorous'],              // preferred for this tone setting
  variants: {
    older: (c) => ['…', '…', '…'],  // one complete letter, paragraphs
  },
}
```

Optional fields: `hooks` + `c.uses(hook)` branches, `activities` per band
(`text`, `answer`, `reveal`, `prep`, `essential`, `check`), `world`, `needsSiblings`,
`earliest`, `requires` / `until` / `establishes`. Run `npx vitest run tests/story.spec.ts`
– the library validator will report missing branches, long texts or broken puzzles.

### Add an age-specific variant

Add the band key to `variants` (and `activities` if needed). A missing band means
the scenario is never planned for that band.

### Add a story arc

Write one scenario per stage (`role`: `introduction`, `discovery`, `development`,
`complication`, `climax`, `resolution`) with `requires` / `establishes` / `until`,
then a `StoryArc` with stages in order (`at` = target position 0…1, `required` for
short series, `shared` for one-day-for-everybody stages) and `resolves` = the
final fact. Register it in the occasion's library (`library.ts`).

### Add a fictional character

Shared-world characters (reindeer Välk, cat Nurr, owl Huugo, magpie Helmi) are
just written into scenarios – keep their traits consistent. A new narrator voice
is a new band text; describe it in `VOICES` (`characters.ts`). Persona names and
titles come from `personasFor` and can be changed by the parent.

### Add a topic

Add an id to `TopicId` and an entry to `TOPICS` (`data/topics.ts`) with `match`
(free-text profile fields), `mentions` (a word only a letter about this topic would
use – the validator reports unplanned mentions, so keep it narrow) and the four
texts for the topic scenarios. `validateLibrary` renders both topic scenarios with
every topic and checks card length and that no text mentions another topic. The
topic then shows up on the profile form. Hand-written scenarios can also branch on
`c.uses('<id>')`.

### Add an occasion

Create `src/data/scenarios/<occasion>/` with frame scenarios (`introduction`,
`farewell`), standalone episodes for each band and optionally an arc, register a
`ScenarioLibrary` in `library.ts`. `usesScenarioEngine` then routes daily series of
that occasion to the engine. Occasion-specific milestones (like 24 December) are
checked in `validateCollection`. Other content types (treasure hunts, puzzles)
can reuse the plan → render → validate split, but should keep their own plan
shape instead of pretending to be letters.

### Test a whole collection

```bash
npx vitest run tests/story.spec.ts      # engine, library and collection checks
npx vitest run -u tests/golden.spec.ts  # regenerate the sample collections
```

## Known limitations

- Only Christmas daily series (7 or 24 letters) use the engine. Single letters,
  3-letter series, one shared letter for several children and other occasions use
  the older generator (its reply-assuming texts were fixed, but its letters are
  still assembled from slots).
- Two children in the same age band share one perspective per scenario: the second
  child gets standalone episodes on stage days and fewer arc letters.
- A parent cannot yet confirm a child's real response; there are no conditional
  “if the child answered” branches. Stories are written to work without replies.
- Some longer older-reader letters print at 7.5–8 pt on the 24-card poster; the
  validator warns and the parent can shorten or switch to a page layout.
- Only topics from the list reach the story; other free-text interests are quoted in
  short letters only (by design – no generic “I heard you like X”). A series tells
  at most two topic stories per child (one per topic scenario), plus any
  hand-written scenario that branches on one of the child's topics.
- Regenerating one letter in an old creation (made before this change) uses the new
  engine for that letter only.
