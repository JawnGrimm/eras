export type EraId = 'era-1' | 'era-2' | 'era-3' | 'era-4' | 'era-5' | 'era-6' | 'era-7';

export interface PlayerProfile {
  name: string;
  title: string; // e.g. "Apprentice Scribe"
  era: EraId;
  eraName: string; // "Era I: Sumerian Cuneiform (Uruk c. 3200 BCE)"
  careerXp: number;
  historicalXp: number;
  rank: number; // 1 to 7
  rankTitle: string;
  silver: number;
  bread: number;
  beer: number;
  stress: number; // 0 to 100
  currentDay: number; // in-game days
  dateString: string; // e.g. "Year 1, Month 3, Day 12 (c. 3200 BCE)"
  currentBlock: number; // 1–6: ordinal position in the current Workday
  blocksRemaining: number; // remaining Action Points (maximum 6)
  actionPointsPerDay?: number; // save-schema marker for the six-AP economy
  workApSpentToday?: number; // AP spent on the active mandatory Work today
  workingLate: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  tier: 'Novice' | 'Adept' | 'Expert' | 'Perilous';
  employer: string;
  description: string;
  rewardSilver: number;
  rewardCareerXp: number;
  blockCost: number; // Time blocks required (1 or 2)
  daysRemaining: number; // expires in 3 days if not accepted
  status: 'available' | 'active' | 'completed' | 'expired' | 'cancelled';
  requiredFields?: {
    sender: string;
    recipient: string;
    expectedQuantity: number;
    correctItem: string;
  };
}

export interface EvidenceItem {
  id: string;
  code: string; // e.g. "E-01"
  title: string;
  source: string;
  content: string;
  examined: boolean;
  blockCost: number; // 0 blocks for Free Thinking (reading held evidence)
}

export type RegisterDesignType = 'movement_ledger' | 'compact_balance';

export interface StorehouseWorkState {
  stage: 'A_INVESTIGATE' | 'B_DESIGN' | 'C_TEST' | 'D_ADOPT' | 'COMPLETED';
  examinedEvidence: string[];
  registerDesign: RegisterDesignType | null;
  registerConfigured: boolean;
  testC1Passed: boolean;
  testC2Passed: boolean;
  auditCompleted: boolean;
  adopted: boolean;
  adoptionType: RegisterDesignType | 'provisional' | 'rejected' | null;
  completedActions?: string[];
  findingRuling?: 'status_change_cause_unestablished' | 'roof_leak_reported_unproven' | 'stock_loss' | 'carrier_blame' | null;
  initialEntriesDrafted?: boolean;
  initialEntriesValid?: boolean;
  initialRecord?: {
    openingUsable?: number;
    dispatched?: number;
    received?: number;
    intakeUsable?: number;
    intakeHeld?: number;
    laterUsable?: number;
    laterHeld?: number;
    issueQuantity?: number;
    statusTransfer?: number;
    closingTotal?: number;
    issueRecipient?: 'brewing_house' | 'steward' | 'unknown';
    issueAuthority?: 'temple_decree' | 'none';
    dispatchFrom?: 'outer_fields' | 'unknown';
    dispatchTo?: 'central_storehouse' | 'other';
    issuePurpose?: 'brewing_operation' | 'unknown';
    recordLocation?: 'central_storehouse' | 'unknown';
    responsibleRecorder?: 'apprentice_under_senior_scribe' | 'unknown';
    recordSequence?: 'opening_dispatch_intake_issue_recount' | 'unknown';
  };
  sourceReferences?: string[];
  sourceNotationAdded?: boolean;
  seniorReviewCompleted?: boolean;
  c1EvidenceRetrieved?: boolean;
  c1EntryRecorded?: boolean;
  c1Ruling?: 'status_transfer' | 'new_receipt' | null;
  c1Record?: { transferred?: number; heldRemaining?: number; totalStockChange?: number };
  c1SupplementAdded?: boolean;
  c1AuditAttempts?: number;
  c2EvidenceRetrieved?: boolean;
  c2EntryRecorded?: boolean;
  c2Ruling?: 'discrepancy_pending' | 'full_receipt' | 'carrier_at_fault' | null;
  c2Record?: { dispatched?: number; received?: number; discrepancy?: number };
  c2SupplementAdded?: boolean;
  c2AuditAttempts?: number;
  finalAuditPassed?: boolean;
  institutionalReviewCompleted?: boolean;
  presentationCompleted?: boolean;
  revisionPasses?: number;
  revisionFocus?: 'dispatch_receipt' | 'status_history' | 'responsibility' | null;
  registerEnhancements?: Array<'dispatch_receipt' | 'status_history' | 'responsibility'>;
  adoptionCondition?: string | null;
  rewardGranted?: boolean;
}

export interface NpcRelation {
  id: string;
  name: string;
  role: string;
  trust: number; // 0 to 100
  affinity: number; // 0 to 100
  description: string;
  dialogueUnlocked: boolean;
}
