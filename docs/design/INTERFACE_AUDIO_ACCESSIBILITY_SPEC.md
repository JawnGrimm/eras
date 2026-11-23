# Interface, Audio, and Accessibility Specification

**Authority:** Supporting specification under [the canonical GDD](../GDD.md).  
**Status:** Consolidated from the approved GDD draft on 23 November 2026.

## 18. Interface and Visual Direction

### 18.1 General presentation

The interface should feel like a readable working environment rather than a conventional fantasy RPG menu covered in decorative text. The player needs clear information about people, evidence, choices, documents, resources, and consequences.

### 18.2 First-era visual identity

The opening Uruk setting uses:
- Warm clay and earth tones.
- Clay tablets, tags, and sealed clay dispatches.
- Impressed marks and seal imagery as visual motifs.
- Worn natural materials and restrained lighting.
- Clear text and strong visual hierarchy.

Suggested palette:
- Deep brown: `#2B1B17`.
- Warm limestone: `#FAEDCD`.
- Sand / ochre: `#D4A373`.
- Burnished amber: `#C86D33`.
- Neutral light: `#F4F1EA`.
- Neutral dark: `#1C1614`.

These colors are visual guidance, not a claim about a historically standardized Uruk palette.

### 18.3 Difficulty and information design

Difficulty may use green, yellow, and red markers as a modern interface convention:
- Green: routine.
- Yellow: demanding.
- Red: critical or complex.

Markers must be readable through labels or shapes as well as color. Difficulty is not urgency, and the interface should not imply a real-time countdown.

### 18.4 Era-specific material design
The presentation should evolve with the era: clay and seals in early Mesopotamia, materials and conventions appropriate to Egypt and later societies, manuscript and paper traditions where relevant, printed pages and presses, and digital documents and networked interfaces in the modern era. Important information must remain readable; decorative generated marks must not be presented as verified historical writing.

### 18.5 Notifications, event history, and morning reports

The player needs a selective way to stay informed about developments in the wider simulation without having to monitor every person, institution, process, or location continuously. The notification approach should take inspiration from strategy games such as *Total War*, adapted to the player's professional life rather than a territory- or army-management interface.

The presentation system should provide three complementary channels:

- **Immediate notifications:** Surface developments during the Workday when they warrant timely awareness or action. Urgent matters must not wait for the next morning report. Most notifications should inform rather than forcibly interrupt the player's current activity.
- **Persistent event log:** Preserve notifications and notable developments so the player can review items they dismissed or did not act on immediately. Entries should link to relevant people, institutions, records, assignments, Works, or locations when those references exist.
- **Daily morning report:** At the beginning of each new Workday, provide a concise briefing of relevant developments since the previous report. This is a regular daily feature, not a report generated only after an arbitrary number of events.

The morning report is for what is relevant to the player **right now**, at the beginning of the new Workday. It is not an exhaustive news bulletin or a feed of everything that happened in the world. Prioritize:
- Current circumstances affecting the player's personal, professional, social, or institutional situation.
- Approaching deadlines and commitments, including work, deliveries, appointments, decisions, and obligations coming due.
- Changes to ongoing matters the player already knows about.
- New opportunities that are plausibly within the player's reach or professional sphere.
- Warnings about emerging problems that could affect the player if left unattended.

Relevance is not limited to matters in which the player is already directly involved. A development elsewhere may be worth reporting when it creates a credible opportunity or consequence within the player's reach—for example, a nearby settlement's surplus creating demand for storage, transport, or recordkeeping. Conversely, proximity alone does not make an event relevant. Ordinary developments with no meaningful connection to the player's present circumstances or plausible opportunities should remain background information.

The report should distinguish what needs attention today from what the player should know today. An approaching deadline may deserve visibility without being an emergency; an opportunity may be worth knowing about without demanding immediate action. The report informs the player's priorities and use of the Workday's six Action Points but does not prescribe a task list.

Information must have a plausible path to the player through people, institutions, notices, correspondence, trade, travel, records, direct observation, or other appropriate sources. Do not present events as known merely because the simulation knows they occurred. Preserve source and uncertainty: market talk, testimony, allegations, and rumors are not automatically established facts. The player may receive useful information without every item becoming a quest or requiring action.

Contents must remain selective: do not repeat unchanged information merely to fill space, and group developments when they share an established cause or affected matter. The player remains free to decide what deserves attention.

Notifications and reports must distinguish established facts from testimony, allegations, attributed explanations, and unresolved interpretations. Grouping must reflect actual shared state rather than inventing a causal connection because events occurred near one another. Important developments should be discoverable through relevant people, records, and changed work as well as through notifications.

The attention system should distinguish at least these presentation needs conceptually: developments requiring timely interruption or prominence; developments relevant to the player's current work or focus; related changes suitable for a consolidated report; and background or resolved information that should remain inspectable without demanding attention. These are design categories, not a finalized notification taxonomy or numerical importance score. Urgency and broader significance are not interchangeable.

The exact notification thresholds, prioritization rules, delivery timing within a Workday, report layout, archive navigation, and handling of missed or repeated developments remain open design work. No runtime notification system or simulation architecture is implied by this interface decision.
The presentation should evolve with the era: clay and seals in early Mesopotamia, materials and conventions appropriate to Egypt and later societies, manuscript and paper traditions where relevant, printed pages and presses, and digital documents and networked interfaces in the modern era. Important information must remain readable; decorative generated marks must not be presented as verified historical writing.

---

## 21. Audio, Feedback, and Accessibility

Audio is optional and must never be required to understand gameplay. The current Era I tactile feedback uses procedural Web Audio synthesis only; it must not load audio files or introduce network requests. The audio engine must be safe to import and call in headless Node/Vitest environments, where browser audio APIs may be absent, and must fail silently rather than interrupt gameplay.

The audio context is created lazily from a user interaction and resumed when the browser reports it suspended. The player can mute or unmute feedback from the production header; the preference is stored under `scribe_audio_muted` in local storage, with unmuted as the default when no preference exists. Reduced-motion preference is not treated as an audio opt-out; the explicit audio mute control is authoritative. Failure to access browser storage or audio APIs is non-fatal. Audio is a redundant feedback layer, not a substitute for visual state changes or accessible labels.

The three current synthesized profiles are:
- **Stylus tap:** 35–45 ms descending triangle tone (320 Hz to 140 Hz) paired with a rapidly decaying high-passed micro-noise burst, for evidence examination and valid numeric draft commits.
- **Seal stamp:** 110–130 ms descending sine impact (approximately 118 Hz to 42 Hz) through a 220 Hz low-pass filter, for successful Assignment report submission and Senior Scribe disposition.
- **Settlement chime:** 550–700 ms dual sine resonance at 261.6 Hz and 523.2 Hz, with a 20 ms attack and long exponential release, after successful Workday settlement.

Do not attach sounds indiscriminately to every click. Trigger them from the corresponding successful or semantically meaningful interaction, and do not replay them from render effects. Ambient soundscapes and music are outside this tactile-feedback step.

Visual feedback is mandatory. The player must be able to understand:
- What action is available.
- What evidence supports a conclusion.
- What information is missing.
- What changed after submission or resolution.
- Why resources, stress, trust, reputation, or relationships changed.
- The character's current professional standing and, in plain language, the broad kinds of work and invitations that standing is likely to attract. This summary describes the character's known professional reach; it does not reveal opportunities or information that never reached them.

Text must remain readable, controls must be clearly labeled, and color must not be the sole way to communicate difficulty or status. Layout should accommodate different screen sizes and input methods without hiding required information.

---
