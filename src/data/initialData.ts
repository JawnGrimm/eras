import { PlayerProfile, Assignment, EvidenceItem, NpcRelation } from '../types';

export const createInitialPlayer = (): PlayerProfile => ({
  name: 'Enlil-barni',
  title: 'Apprentice Scribe',
  era: 'era-1',
  eraName: 'Era I: Sumerian Cuneiform (Uruk c. 3200 BCE)',
  careerXp: 150,
  historicalXp: 0,
  rank: 1,
  rankTitle: 'Apprentice Scribe',
  silver: 12,
  bread: 5,
  beer: 2,
  stress: 15,
  currentDay: 1,
  dateString: 'Day 1, Early Season of Inundation (c. 3200 BCE)',
  currentBlock: 1,
  blocksRemaining: 6,
  actionPointsPerDay: 6,
  workApSpentToday: 0,
  workingLate: false,
});

export const createInitialAssignments = (): Assignment[] => [
  {
    id: 'asgn-01',
    title: 'Temple Granary Tally Reconciliation',
    tier: 'Novice',
    employer: 'Inanna Temple Administration',
    description: 'Verify barley sacks delivered from the outer fields to the E-anna district storehouse against carrier wooden tags.',
    rewardSilver: 3,
    rewardCareerXp: 120,
    blockCost: 1,
    daysRemaining: 3,
    status: 'available',
  },
  {
    id: 'asgn-02',
    title: 'Wool Allocation Receipt',
    tier: 'Novice',
    employer: 'Palace Overseer of Textiles',
    description: 'Draft a certified reed-stylus clay tablet recording the distribution of sheared wool to the institutional weavers.',
    rewardSilver: 4,
    rewardCareerXp: 150,
    blockCost: 1,
    daysRemaining: 2,
    status: 'available',
  },
  {
    id: 'asgn-03',
    title: 'Metalworker Silver Ingot Weighing',
    tier: 'Adept',
    employer: 'Guild of Metalsmiths',
    description: 'Weigh and record certified copper and silver ingots received from overseas trade canoes.',
    rewardSilver: 6,
    rewardCareerXp: 220,
    blockCost: 2,
    daysRemaining: 3,
    status: 'available',
  },
];

export const createStorehouseEvidence = (): EvidenceItem[] => [
  {
    id: 'ev-01',
    code: 'E-01',
    title: 'Prior Closing-Balance Tablet',
    source: 'Temple Archive (Signed by Senior Scribe)',
    content: 'The storehouse began the accounting period with exactly 24 usable standard institutional measures of clean barley.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-02',
    code: 'E-02',
    title: 'Dispatch Tablet from Outer Fields',
    source: 'Carrier Foreman (Enlil-kisu)',
    content: '60 standard institutional measures were loaded onto river barges and dispatched to the central storehouse under official dispatch seal #4.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-03',
    code: 'E-03',
    title: 'Arrival Tally at Receiving Desk',
    source: 'Receiving Dock Log',
    content: '60 measures were physically unloaded and counted at the landing dock.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-04',
    code: 'E-04',
    title: 'Initial Receiving Inspection Tally',
    source: 'Receiving Official (Utu-mansum)',
    content: 'At intake inspection, 56 measures were classified as dry and usable, while 4 measures showed moisture damage and were segregated and held separately.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-05',
    code: 'E-05',
    title: 'Issue Instruction & Brewing-House Receipt',
    source: 'Brewing-House Representative (Nin-kasi)',
    content: '30 usable measures were authorized by temple decree and issued to the brewing-house operation. The representative confirms physical receipt of those 30 measures.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-06',
    code: 'E-06',
    title: 'Custody & Maintenance Log',
    source: 'Storehouse Steward (Ur-Nanna)',
    content: 'A severe rainstorm caused a roof leak over the north storage bay after intake. The leak lasted two days before repairs were made. Exact timing of moisture spread is unrecorded.',
    examined: false,
    blockCost: 0,
  },
  {
    id: 'ev-07',
    code: 'E-07',
    title: 'Current Physical Recount',
    source: 'Witnessed Recount with Steward',
    content: 'A physical recount finds 47 measures still usable and 7 damp and held. Total physical stock in storehouse is 54 measures (47 usable + 7 held).',
    examined: false,
    blockCost: 0,
  },
];

export const createTestCaseC1 = (): EvidenceItem => ({
  id: 'test-c1',
  code: 'C1',
  title: 'Test C-1: Release of Held Stock',
  source: 'Inspection & Steward Authorization',
  content: 'Subsequent drying inspection establishes that 5 of the 7 held measures have dried and returned to usable condition; 2 remain held. Steward authorizes return to usable balance without new receipt.',
  examined: false,
  blockCost: 0,
});

export const createTestCaseC2 = (): EvidenceItem => ({
  id: 'test-c2',
  code: 'C2',
  title: 'Test C-2: Short Delivery Discrepancy',
  source: 'River Landing Inspector',
  content: 'A separate dispatch authorized 20 measures, but physical unloading counted only 18 measures. No departure or route inspection establishes where the 2-measure shortage arose.',
  examined: false,
  blockCost: 0,
});

export const createInitialNpcs = (): NpcRelation[] => [
  {
    id: 'npc-senior-scribe',
    name: 'Shuruppak-ilu',
    role: 'Senior Scribe of Uruk',
    trust: 60,
    affinity: 50,
    description: 'A demanding master who values rigorous evidence over elegant handwriting.',
    dialogueUnlocked: true,
  },
  {
    id: 'npc-steward',
    name: 'Ur-Nanna',
    role: 'Storehouse Steward',
    trust: 55,
    affinity: 45,
    description: 'Responsible for storehouse physical stock and grain allocation security.',
    dialogueUnlocked: true,
  },
  {
    id: 'npc-receiving',
    name: 'Utu-mansum',
    role: 'Receiving Dock Official',
    trust: 50,
    affinity: 50,
    description: 'Witnesses intake and inspects incoming carrier shipments.',
    dialogueUnlocked: true,
  },
  {
    id: 'npc-carrier',
    name: 'Enlil-kisu',
    role: 'Carrier Foreman',
    trust: 45,
    affinity: 40,
    description: 'Manages river transport crews and barge dispatch.',
    dialogueUnlocked: true,
  },
  {
    id: 'npc-brewing',
    name: 'Nin-kasi',
    role: 'Brewing-House Representative',
    trust: 65,
    affinity: 60,
    description: 'Receives institutional barley rations for brewing operations.',
    dialogueUnlocked: true,
  },
];

// Backward-compatibility aliases (using factory functions or frozen clones if needed, or keeping them as factory calls)
export const initialPlayer = createInitialPlayer();
export const initialAssignments = createInitialAssignments();
export const storehouseEvidence = createStorehouseEvidence();
export const testCaseC1 = createTestCaseC1();
export const testCaseC2 = createTestCaseC2();
export const initialNpcs = createInitialNpcs();
