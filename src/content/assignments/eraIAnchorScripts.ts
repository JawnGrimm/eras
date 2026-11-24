/**
 * Era I Assignment anchor scripts.
 *
 * Semantic content model for the five authored anchors in
 * dev/GD-ERA1-ANCHORS-001.md. This file deliberately does not define
 * Assignment occurrence identity, eligibility predicates, rewards, AP costs,
 * recurrence scheduling, or persistence. Those belong to the shared
 * opportunity contract and versioned balance parameters.
 *
 * Historical confidence labels are preserved verbatim in meaning:
 * attested = supported by the cited corpus; inferred = defensible
 * interpretation; provisional = authored reconstruction, not source fact.
 */

export type EraIAnchorConfidence = 'attested' | 'inferred' | 'provisional';

export interface EraIAnchorEvidenceItem {
  readonly id: string;
  readonly description: string;
  readonly sourceBasis: string;
  readonly confidence: EraIAnchorConfidence;
  readonly establishes: readonly string[];
  readonly doesNotEstablish: readonly string[];
}

export interface EraIAnchorScript {
  readonly id: string;
  readonly title: string;
  readonly institutionalContext: 'commercial' | 'civic' | 'religious';
  /** All five anchors use the shared world pool; orientation is not a lock. */
  readonly pool: 'shared_world';
  readonly coreSituation: string;
  readonly historicalGrounding: {
    readonly attested: readonly string[];
    readonly inferred: readonly string[];
    readonly provisional: readonly string[];
    readonly excluded: readonly string[];
  };
  readonly participantsAndPressure: readonly string[];
  readonly playerRole: string;
  readonly authorityLimits: readonly string[];
  readonly evidence: readonly EraIAnchorEvidenceItem[];
  readonly playableWork: readonly string[];
  readonly judgmentChoices: readonly string[];
  readonly deliverable: string;
  readonly evaluation: {
    readonly careful: string;
    readonly partial: string;
    readonly careless: string;
  };
  readonly outcomes: readonly string[];
  readonly recovery: readonly string[];
  readonly recurrenceBoundary: readonly string[];
  readonly specialNotes?: readonly string[];
}

export const ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS: readonly EraIAnchorScript[] = [
  {
    id: 'ERA1-COM-01',
    title: 'Sealed Vessel and Textile Consignment',
    institutionalContext: 'commercial',
    pool: 'shared_world',
    coreSituation: 'A consignment is being received or checked within an institutionally mediated movement of goods. The evidence may reconcile, reveal a limited custody discrepancy, or leave a material gap. A receiving worker wants the goods cleared before the day closes; a recorder wants a defensible account before accepting responsibility.',
    historicalGrounding: {
      attested: [
        'Uruk IV administrative records include commodity quantities, warehouse entries and exits, tags, and sealing.',
        'Archaeological and textual evidence supports movement of textiles and vessels within and between cities.',
      ],
      inferred: [
        'An institutionally mediated receipt and custody review is a defensible playable setting.',
      ],
      provisional: [
        'A broken seal or tag/quantity discrepancy is an authored incident; the exact junior-scribe procedure and escalation path are game reconstruction.',
      ],
      excluded: [
        'A universal consignment form, private merchant house, standardized carrier contract, or apprentice authority to release or detain goods.',
        'A permanent trade network or assumed long-distance origin not supplied by the active matter.',
      ],
    },
    participantsAndPressure: [
      'A receiving worker or responsible recorder requests comparison of tag/tablet information with the physical or reported consignment.',
      'The receiving worker wants clearance before the day closes; the recorder wants a defensible account before accepting responsibility.',
      'The active matter supplies the named counterparty and location; neither participant’s preferred conclusion substitutes for evidence.',
    ],
    playerRole: 'Under supervision, the apprentice may inspect presented tag/seal evidence, compare recorded quantities and entries, identify agreement or conflict, and report uncertainty.',
    authorityLimits: [
      'The apprentice may not accuse the carrier, decide ownership, authorize release, or alter the authoritative record.',
      'A responsible recorder or custodian retains the decision to verify goods, seek another record, request a recount, or proceed.',
    ],
    evidence: [
      {
        id: 'consignment-tag',
        description: 'The relevant tag or tag transcription, with source identity.',
        sourceBasis: 'Active consignment/custody matter; physical tag or identified transcription.',
        confidence: 'provisional',
        establishes: ['The identity and notation actually present on the supplied tag evidence.'],
        doesNotEstablish: ['The truth of an unrelated quantity entry or the cause of a discrepancy.'],
      },
      {
        id: 'consignment-seal',
        description: 'Associated seal or custody observation, only if the occurrence supplies one.',
        sourceBasis: 'Active matter observation with its source identity.',
        confidence: 'provisional',
        establishes: ['Only the observed seal/custody condition at the stated point.'],
        doesNotEstablish: ['Theft, fraud, negligence, or where a discrepancy arose.'],
      },
      {
        id: 'consignment-quantity',
        description: 'The commodity quantity record.',
        sourceBasis: 'The specific record identified by the active matter.',
        confidence: 'attested',
        establishes: ['The quantity and commodity notation recorded in that source.'],
        doesNotEstablish: ['A conversion between unlike quantity systems or an unsupported physical count.'],
      },
      {
        id: 'consignment-receipt',
        description: 'The receiving or warehouse entry used for comparison.',
        sourceBasis: 'The specific receiving/warehouse record identified by the active matter.',
        confidence: 'attested',
        establishes: ['What the receiving entry records.'],
        doesNotEstablish: ['The cause or responsible party for any mismatch.'],
      },
    ],
    playableWork: [
      'Identify the commodity and quantity notation actually used; do not convert unlike systems.',
      'Compare tag identity and recorded quantity with the receiving entry.',
      'Compare seal/custody evidence only to the extent the instance supplies it.',
      'Classify the result as consistent, inconsistent, or insufficient evidence.',
      'Submit a concise receipt note confirming a clean match, identifying a specific discrepancy, or stating why the evidence cannot support clearance.',
    ],
    judgmentChoices: [
      'Confirm receipt when tag, custody evidence, and quantity entry genuinely agree.',
      'Record a limited mismatch and recommend the specific check still needed.',
      'Recommend holding the decision because a key source is absent, while explaining the cost of delay.',
      'Certify clearance under pressure despite a visible conflict, or accuse the carrier without evidence.',
    ],
    deliverable: 'A comparison report linking each relevant source and stating the agreement, mismatch, or missing evidence.',
    evaluation: {
      careful: 'A justified clean receipt or precise exception report with provenance; accuracy is not synonymous with finding fault.',
      partial: 'A plausible conclusion that omits provenance or leaves a source unexamined.',
      careless: 'Invents a quantity, treats a broken seal as proof of theft, or certifies away a visible conflict.',
    },
    outcomes: [
      'A responsible recorder or custodian decides whether to verify the goods, seek another record, request a recount, or proceed.',
      'The report may prevent unsupported certification but does not itself decide release or liability.',
    ],
    recovery: [
      'A supervisor may require a corrected report or additional review if the apprentice overstates the evidence.',
      'Do not force punishment or presume guilt.',
    ],
    recurrenceBoundary: [
      'A new occurrence requires a materially new consignment/custody matter with its own source evidence, counterparty, commodity-compatible quantity notation, and receiving context.',
      'Changing only a name or number is not new content. Do not combine unrelated tags, seals, commodities, or institutions.',
    ],
  },
  {
    id: 'ERA1-COM-02',
    title: 'Brewing-Ingredient Account Reconciliation',
    institutionalContext: 'commercial',
    pool: 'shared_world',
    coreSituation: 'A recorder asks the apprentice to check an account involving grain products/groats and malt. The account may reconcile, contain a simple copying/subtotal error, or remain uncertain because a reading is unclear. A brewer is concerned an apparent shortfall will reduce the quantity credited to his work; a supervisor wants the account closed promptly.',
    historicalGrounding: {
      attested: [
        'MSVO 3, 51/52/55 include records involving grain products/groats and malt, totals/subtotals, and distinct numerical notations.',
        'Some readings and destinations in this corpus remain uncertain.',
      ],
      inferred: [
        'A junior scribe comparing entries and account totals is a bounded administrative task.',
      ],
      provisional: [
        'The specific mismatch and the apprentice’s review procedure are authored reconstruction.',
      ],
      excluded: [
        'A two-supplier delivery dispute, fixed grain-to-beer ratio, or uncertain reading/destination resolved as settled fact.',
        'An assumption that all listed goods were delivered together or used in one standardized recipe.',
      ],
    },
    participantsAndPressure: [
      'A responsible recorder needs a second check of an account containing relevant grain-product/groat entries and, where the instance calls for it, malt entries.',
      'The brewer may press for entries to be accepted as written; the recorder may prefer a quick correction.',
      'Neither concern establishes what the numbers mean.',
    ],
    playerRole: 'The apprentice may recalculate entries using the notation represented in each source, compare subtotal/total relationships, and report the inconsistency.',
    authorityLimits: [
      'The apprentice does not decide the final destination or use of the goods, alter an authoritative account, or accuse a supplier or worker.',
      'A responsible recorder may accept a clean account, correct a copying error, consult the source tablet, or request a second check.',
    ],
    evidence: [
      {
        id: 'brewing-grain-account',
        description: 'A source account with grain-product/groat entries.',
        sourceBasis: 'MSVO 3, 51/52/55 corpus; exact source selected by the active matter.',
        confidence: 'attested',
        establishes: ['The entries and numerical notation present in the selected account.'],
        doesNotEstablish: ['A conversion to malt notation or a fixed recipe ratio.'],
      },
      {
        id: 'brewing-malt-account',
        description: 'A source account with malt entries, where the instance calls for it.',
        sourceBasis: 'MSVO 3, 51/52/55 corpus; exact source selected by the active matter.',
        confidence: 'attested',
        establishes: ['The malt entries and notation present in the selected account.'],
        doesNotEstablish: ['That malt and grain products were one delivery or shared one unit.'],
      },
      {
        id: 'brewing-totals',
        description: 'Relevant subtotals, totals, and explicitly linked carry-forward.',
        sourceBasis: 'The selected source account(s).',
        confidence: 'attested',
        establishes: ['Arithmetic relationships supported by the displayed entries.'],
        doesNotEstablish: ['Any unsupported carry-forward, conversion, or destination.'],
      },
      {
        id: 'brewing-reading-note',
        description: 'A provenance and reading note for uncertain signs or destinations.',
        sourceBasis: 'Source publication and the active content instance.',
        confidence: 'inferred',
        establishes: ['Which reading or destination is uncertain.'],
        doesNotEstablish: ['A definitive resolution of that uncertainty.'],
      },
    ],
    playableWork: [
      'Read each entry in its own commodity and numerical notation.',
      'Recalculate only sums supported by the displayed entries.',
      'Compare the recalculated amount with the written subtotal/total.',
      'Decide whether the account reconciles, contains a copying/subtotal error, or cannot be resolved from the displayed evidence.',
      'Submit the arithmetic and identify the exact entry or reading supporting the conclusion.',
    ],
    judgmentChoices: [
      'Confirm a clean account, even if that disappoints someone expecting an adjustment.',
      'Identify a simple scribe’s copying error and show the corrected subtotal without assigning motive.',
      'Flag an uncertain reading and recommend checking the source before changing the account.',
      'Alter the account to protect the brewer’s allocation or satisfy the supervisor’s deadline without evidentiary support.',
    ],
    deliverable: 'An account-check note showing source entries, arithmetic, written total, and any uncertainty.',
    evaluation: {
      careful: 'Reproducible work whether the result is a clean reconciliation, demonstrable copying error, or unresolved reading.',
      partial: 'Omits an intermediate arithmetic step or provenance.',
      careless: 'Uses an unsupported ratio, conflates categories, or changes figures to satisfy pressure.',
    },
    outcomes: [
      'A responsible recorder may accept the clean account, correct a copying error, consult the source tablet, or request a second check.',
      'If the brewer’s allocation is affected, the recorder explains what the account does and does not establish; do not assume dishonesty or that a disputed quantity is owed.',
    ],
    recovery: [
      'If the apprentice’s arithmetic is wrong, a supervisor can return it for a second pass.',
      'Preserve the original evidence and make any correction traceable.',
    ],
    recurrenceBoundary: [
      'A new occurrence requires a distinct account/matter with compatible grain-product or malt entries and a real total/subtotal relationship.',
      'Do not generate arbitrary discrepancies, cross-combine unrelated tablets, or turn uncertain commodity readings into deterministic facts.',
    ],
  },
  {
    id: 'ERA1-CIV-01',
    title: 'Field Measurement and Area Reconciliation',
    institutionalContext: 'civic',
    pool: 'shared_world',
    coreSituation: 'A recorder asks for a practical check of a parcel account before its figures are copied into a working summary. The account may balance cleanly, omit a parcel subtotal, or contain a straightforward dimension-to-area discrepancy. This is readable arithmetic, not a specialist surveying examination.',
    historicalGrounding: {
      attested: [
        'MSVO 1, 2 and MSVO 1, 3 preserve field measurement/area records.',
        'Their catalogued chronology/provenience is uncertain; they are catalogued Uruk III and often attributed to Jemdet Nasr.',
      ],
      inferred: [
        'Rechecking recorded dimensions and area arithmetic is a defensible administrative exercise.',
      ],
      provisional: [
        'The specific mismatch and apprentice review request are reconstructed.',
        'Any playable numerical example not directly verified in the source publication must be labelled PROVISIONAL.',
      ],
      excluded: [
        'Yield-share, boundary, ownership, or allocation disputes.',
        'A claim that the source tablets are securely excavated Late Uruk documents or belong to a precise site not established by evidence.',
        'A requirement for the player to decode GAN2 fractions or derive specialist metrology.',
      ],
    },
    participantsAndPressure: [
      'A responsible recorder asks for a second arithmetic check before figures are copied into a working summary.',
      'The actual record identity and provenance qualification must be shown in the content instance.',
    ],
    playerRole: 'The apprentice may check parcel subtotals, identify an omitted line, or compare clearly presented dimensions and area using a simple explicit relationship supplied in the playable instance.',
    authorityLimits: [
      'Present values in human-readable standard measures; any simplified display must be labelled a readable gameplay transcription, not ancient notation.',
      'The apprentice cannot survey land, establish a boundary, determine ownership, allocate yield, or order a remeasurement.',
    ],
    evidence: [
      {
        id: 'field-measure-record',
        description: 'The measurement record or a clearly identified teaching copy.',
        sourceBasis: 'MSVO 1, 2 and MSVO 1, 3; exact record identity and catalogue qualification retained.',
        confidence: 'attested',
        establishes: ['The field measurement/area record and its catalogued contents.'],
        doesNotEstablish: ['A secure Late Uruk date, precise excavation location, ownership, or yield entitlement.'],
      },
      {
        id: 'field-readable-summary',
        description: 'A readable working summary with parcel dimensions, line items, and subtotals.',
        sourceBasis: 'Source-based teaching transcription; simplified values explicitly identified as gameplay transcription.',
        confidence: 'provisional',
        establishes: ['The values presented for the bounded arithmetic exercise.'],
        doesNotEstablish: ['That modern standard-measure notation appeared on the ancient tablet.'],
      },
      {
        id: 'field-provenance-note',
        description: 'A provenance note retaining uncertain chronology/provenience.',
        sourceBasis: 'Catalogue and source publication.',
        confidence: 'attested',
        establishes: ['The stated catalogue qualification.'],
        doesNotEstablish: ['A more precise chronology or findspot.'],
      },
    ],
    playableWork: [
      'Read parcel lines and displayed standard-measure values.',
      'Add supplied parcel subtotals or compare simple dimension/area figures.',
      'Identify whether the account balances, omits a line, or contains a clear arithmetic discrepancy.',
      'State the calculation in a short, checkable note.',
    ],
    judgmentChoices: [
      'Confirm that figures reconcile and return a clean check.',
      'Identify an omitted parcel subtotal or simple copying error.',
      'Ask for clarification where the source transcription itself is unclear.',
      'Claim the arithmetic establishes a boundary, ownership, or yield entitlement.',
    ],
    deliverable: 'A measurement-check note showing source values, method, recalculation, and uncertainty.',
    evaluation: {
      careful: 'Transparent and accessible work that may confirm a clean account or isolate a simple omission/error.',
      partial: 'Spots the issue but leaves one addition or source check unfinished.',
      careless: 'Turns arithmetic into an unsupported land claim or invents a conversion.',
    },
    outcomes: [
      'A responsible official may request the source reading be checked, ask an appropriately situated person for a new measurement, or correct an arithmetic record.',
      'Those actions are not automatic and do not establish that the land itself is wrongly measured.',
    ],
    recovery: [
      'An incomplete report can be returned for a documented second calculation.',
    ],
    recurrenceBoundary: [
      'A new occurrence requires a distinct field-measurement record and a supported arithmetic check.',
      'Preserve the source chronology/provenience caveat in every occurrence.',
      'Do not instantiate yield-share, boundary, or allocation disputes from this seed.',
    ],
  },
  {
    id: 'ERA1-CIV-02',
    title: 'Labor-Group Records and Grain Disbursement',
    institutionalContext: 'civic',
    pool: 'shared_world',
    coreSituation: 'A reviewer needs a labor-group account checked before a work group is released from its current obligation. The group leader wants figures settled so people can leave; a supervisor is concerned the day’s recorded total is incomplete. A separate grain-disbursement record is included for a distinct administrative question.',
    historicalGrounding: {
      attested: [
        'W 9827 records laborer group accounts/totals.',
        'Separately, W 15897,c8 records grain disbursed to/consumed as rations by high-ranking officials.',
      ],
      inferred: [
        'Each record supports a bounded administrative comparison of its own contents.',
      ],
      provisional: [
        'Pairing these two evidence types in one accountability review is a game reconstruction.',
        'The pairing remains provisional unless new research establishes a connection.',
      ],
      excluded: [
        'The records do not establish the same people, institution, workflow, date, or a standardized work-gang ration system.',
        'Do not present the grain disbursement as the ration issue for the laborers in W 9827.',
        'Do not invent a missing ration ledger linking the records.',
      ],
    },
    participantsAndPressure: [
      'A responsible administrator asks the apprentice to check a labor-group total and separately summarize a grain-disbursement record brought into the same review.',
      'The group leader’s urgency is understandable but does not link the records.',
      'The narrative must state plainly that the records are separate and their relationship is not established.',
    ],
    playerRole: 'The apprentice may verify group-account arithmetic, identify the separate disbursement’s recorded recipient/category as the source permits, and report whether the records do or do not establish a link.',
    authorityLimits: [
      'The apprentice cannot claim the grain was owed to the labor group, accuse an official of withholding rations, or authorize redistribution.',
      'A responsible reviewer retains authority to accept the check, request clarification, or seek other records.',
    ],
    evidence: [
      {
        id: 'labor-group-account',
        description: 'W 9827 or an explicitly identified source-based transcription/teaching copy of the labor-group account and total.',
        sourceBasis: 'W 9827.',
        confidence: 'attested',
        establishes: ['The labor-group account and its own recorded total.'],
        doesNotEstablish: ['Any relationship to W 15897,c8 or entitlement to its recorded grain.'],
      },
      {
        id: 'separate-grain-disbursement',
        description: 'W 15897,c8 or an explicitly identified source-based transcription/teaching copy of the grain disbursement.',
        sourceBasis: 'W 15897,c8; Englund and Nissen (2005), OIMP 32, p. 66, pl. 81.',
        confidence: 'attested',
        establishes: ['The grain disbursement as recorded for the recipient/category the source supports.'],
        doesNotEstablish: ['That the grain was issued to the labor group in W 9827.'],
      },
      {
        id: 'separate-record-provenance',
        description: 'Separate provenance notes for each record and a bounded review instruction.',
        sourceBasis: 'The respective source publications; pairing is a separate game reconstruction.',
        confidence: 'provisional',
        establishes: ['The records’ distinct source identities and the limited comparison question.'],
        doesNotEstablish: ['A shared date, institution, workflow, beneficiary, or ration obligation.'],
      },
    ],
    playableWork: [
      'Check whether the labor-group total reconciles internally; it may be correct or contain a simple arithmetic/copying error.',
      'Summarize what the separate disbursement record actually states.',
      'State whether the records establish any connection; the approved baseline does not.',
      'Submit a two-part note preserving each record’s identity.',
    ],
    judgmentChoices: [
      'Confirm the labor-group total and report the separate disbursement accurately.',
      'Identify and document a simple error in the labor-group account.',
      'Ask for another record before claiming the disbursement concerns this group.',
      'Tell the group leader the grain was theirs, or accuse an official of diversion, without a linking source.',
    ],
    deliverable: 'A two-part accountability note: (A) labor-group arithmetic and (B) separate disbursement summary, followed by a statement of what cannot be concluded.',
    evaluation: {
      careful: 'May confirm the group total; explicitly preserves the evidentiary boundary when the group leader presses for a quick answer.',
      partial: 'Checks one record but fails to summarize the other or omits the limitation.',
      careless: 'Invents a link, beneficiary, obligation, or accusation.',
    },
    outcomes: [
      'A responsible reviewer may accept the arithmetic check, request clarification of the disbursement record, or seek other records.',
      'No outcome may imply that grain was due to the labor group unless a separate, explicitly sourced future content instance establishes that link.',
    ],
    recovery: [
      'If the apprentice conflates the records, the supervisor can require a corrected note that separates fact from inference.',
    ],
    recurrenceBoundary: [
      'A recurrence may use a new labor-group record or a separate disbursement record only when the active matter supplies it.',
      'The pairing remains explicitly provisional unless new research establishes a connection.',
      'Do not turn this into a routine work-gang ration audit or generic laborer provisioning system.',
    ],
    specialNotes: [
      'PROVISIONAL authored compensation option: this Assignment may offer a stated quantity of Provisions-in-kind for completing the account check, with terms disclosed before acceptance.',
      'This is the apprentice’s compensation under this specific playable contract; it is not a claim that W 15897,c8 records provisions for the W 9827 labor group.',
      'Use approved versioned Era I compensation parameters; no quantity or permanent reward is defined by the anchor script.',
    ],
  },
  {
    id: 'ERA1-REL-01',
    title: 'Inana Offering Records and Sanctuary Supply',
    institutionalContext: 'religious',
    pool: 'shared_world',
    coreSituation: 'A person responsible for an Inana-related offering asks for a review of relevant entries before deciding whether recorded goods are accounted for. The records may be complete, contain a simple copying omission, or leave genuine uncertainty. A participant is concerned a late correction will complicate preparations; another wants the record closed as written.',
    historicalGrounding: {
      attested: [
        'Archaic Uruk offering records are associated with Inana.',
        'The broader archaic commodity corpus includes dairy products and fish categories.',
      ],
      inferred: [
        'A bounded review of offering entries and associated goods within overlapping cultic/economic administration is plausible.',
      ],
      provisional: [
        'Combining particular goods in one supply review, a shortage, a ritual interruption, a schedule, and the junior-scribe response are reconstructions.',
      ],
      excluded: [
        'A single kitchen, office, schedule, or standardized supply chain.',
        'A separate modern church administration or an assumption that religious and economic administration are institutionally isolated.',
        'An established shortage or interrupted rite absent an explicitly reviewed provisional instance.',
      ],
    },
    participantsAndPressure: [
      'A responsible cultic/institutional participant requests a check of identified offering entries or associated goods.',
      'The active instance identifies exactly which records and commodity categories are involved.',
      'Human pressure comes from the consequences of delay or premature closure, not a melodramatic threat.',
    ],
    playerRole: 'The apprentice may compare relevant entries, preserve distinct commodity categories and notations, identify what is recorded versus absent, and report the discrepancy.',
    authorityLimits: [
      'The responsible authority decides whether to verify, correct, substitute, or proceed.',
      'The apprentice does not determine ritual validity, invent a replacement offering, or declare that a rite must be interrupted.',
    ],
    evidence: [
      {
        id: 'inana-offering-record',
        description: 'The specific Inana-associated offering record or source-based transcription.',
        sourceBasis: 'Szarzyńska (1993), “Offerings for the Goddess Inana in Archaic Uruk.”',
        confidence: 'attested',
        establishes: ['The entries and categories actually present in the identified offering record.'],
        doesNotEstablish: ['A universal sanctuary schedule or an automatically implied shortage.'],
      },
      {
        id: 'sanctuary-additional-goods',
        description: 'Any additional commodity record included in the instance, separately identified with its own source and confidence.',
        sourceBasis: 'The broader archaic commodity corpus; exact source must be supplied by the active matter.',
        confidence: 'attested',
        establishes: ['Only the category and entry represented by that separate source.'],
        doesNotEstablish: ['That dairy and fish categories appear together in one attested record or share a common unit.'],
      },
      {
        id: 'inana-review-instruction',
        description: 'The instruction explaining the limited question being checked.',
        sourceBasis: 'Authored game context attached to the active matter.',
        confidence: 'provisional',
        establishes: ['The scope of the apprentice’s requested review.'],
        doesNotEstablish: ['A fixed office, kitchen, schedule, shortage, or ritual consequence.'],
      },
      {
        id: 'inana-provenance-notes',
        description: 'Provenance notes distinguishing directly attested offering evidence from broader commodity-corpus evidence.',
        sourceBasis: 'Szarzyńska (1993) and the specific commodity source(s) selected for the instance.',
        confidence: 'attested',
        establishes: ['Which source supports each displayed entry.'],
        doesNotEstablish: ['An unsupported relationship between distinct records.'],
      },
    ],
    playableWork: [
      'Identify which entries are directly associated with the offering record.',
      'Identify any additional goods record as a separate source.',
      'Compare only like categories and compatible notations.',
      'Determine whether supplied entries reconcile, contain a simple copying omission, or leave the question unresolved.',
      'Submit evidence with a clear distinction between attested record content and inferred institutional context.',
    ],
    judgmentChoices: [
      'Confirm that offering entries reconcile and report the clean check.',
      'Identify a specific copying omission in the supplied record and show its source.',
      'Request another source where evidence cannot establish whether goods are missing.',
      'Declare a shortage, ritual interruption, or substitute offering beyond the evidence and apprentice’s authority.',
    ],
    deliverable: 'An offering/supply review note identifying each source, category, notation, comparison, and unresolved question.',
    evaluation: {
      careful: 'Confirms a clean account or identifies a bounded record error while preserving source distinctions and leaving ritual/institutional decisions to the responsible person.',
      partial: 'Identifies a possible issue but omits a source or confidence qualification.',
      careless: 'Invents a common schedule, kitchen, unit, shortage, or ritual consequence.',
    },
    outcomes: [
      'The responsible authority may request a further record check, correct an entry, or decide to proceed.',
      'A specific shortage or ritual interruption may occur only in an authored instance whose evidence and reconstruction are explicitly reviewed and marked provisional.',
    ],
    recovery: [
      'If the apprentice overstates the record, the report can be returned for correction.',
      'Do not impose an automatic spiritual or social penalty.',
    ],
    recurrenceBoundary: [
      'A new occurrence requires a distinct Inana-related offering matter and its own identified records.',
      'Additional dairy or fish evidence may be included only when the active matter supports the specific category and source relationship.',
      'Do not reuse the same record under a new shortage label or imply a universal sanctuary supply schedule.',
    ],
    specialNotes: [
      'Dairy categories (including DUGb and cheese) and fish categories (KU6 / SUḪUR) remain distinct where used.',
      'Do not force them into one common unit or imply they appear together in a single attested record.',
    ],
  },
] as const;

const REQUIRED_ANCHOR_IDS = [
  'ERA1-COM-01',
  'ERA1-COM-02',
  'ERA1-CIV-01',
  'ERA1-CIV-02',
  'ERA1-REL-01',
] as const;

/**
 * Structural validation for the authored portfolio. This is content QA only;
 * it is not an eligibility, occurrence, balance, or save-state validator.
 */
export function validateEraIAssignmentAnchorPortfolio(
  scripts: readonly EraIAnchorScript[] = ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS,
): string[] {
  const issues: string[] = [];
  const ids = scripts.map((script) => script.id);
  if (scripts.length !== REQUIRED_ANCHOR_IDS.length) {
    issues.push(`Era I anchor portfolio must contain exactly ${REQUIRED_ANCHOR_IDS.length} anchors.`);
  }
  if (new Set(ids).size !== ids.length) issues.push('Anchor IDs must be unique.');
  for (const requiredId of REQUIRED_ANCHOR_IDS) {
    if (!ids.includes(requiredId)) issues.push(`Missing required Era I anchor: ${requiredId}.`);
  }
  for (const script of scripts) {
    if (script.pool !== 'shared_world') issues.push(`${script.id}: anchor must use the shared world pool.`);
    if (!script.title.trim() || !script.coreSituation.trim() || !script.playerRole.trim() || !script.deliverable.trim()) {
      issues.push(`${script.id}: title, situation, player role, and deliverable are required.`);
    }
    if (!script.historicalGrounding.attested.length || !script.historicalGrounding.provisional.length) {
      issues.push(`${script.id}: attested grounding and explicit provisional boundaries are required.`);
    }
    if (!script.evidence.length || script.evidence.some((item) => !item.sourceBasis.trim()
      || !item.establishes.length || !item.doesNotEstablish.length)) {
      issues.push(`${script.id}: each evidence item needs source basis, establishes, and does-not-establish boundaries.`);
    }
    if (!script.playableWork.length || !script.judgmentChoices.length || !script.outcomes.length
      || !script.recovery.length || !script.recurrenceBoundary.length) {
      issues.push(`${script.id}: playable work, judgment, outcomes, recovery, and recurrence are required.`);
    }
  }
  return issues;
}
