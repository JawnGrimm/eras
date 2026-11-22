import type { CareerProgressionPolicy, GameAction, GameState, TransitionResult } from '../state/types';
import { transitionCareerAction } from './careerProgression';
import { transitionWorldAction } from './worldSocial';
import { settleAssignmentOffers, transitionOpportunityAction } from './opportunities';
import { validateWorkDefinition } from '../works/workDefinition';
import type { WorkAssessment, WorkDefinition } from '../works/workDefinition';

function feedback(kind: 'success' | 'error' | 'info', code: string, message: string) {
  return { kind, code, message } as const;
}

function withNotice(state: GameState, category: 'settlement', message: string): GameState {
  const notice = {
    id: `notice-${state.calendar.dayNumber - 1}-${state.journal.notices.length + 1}`,
    dayNumber: state.calendar.dayNumber - 1,
    category,
    message,
    read: false,
  };
  return { ...state, journal: { ...state.journal, notices: [...state.journal.notices, notice] } };
}

/** Pure, deterministic state transition. UI feedback is ephemeral; notices are saved in GameState. */
export function transitionGame(state: GameState, action: GameAction, careerPolicy?: CareerProgressionPolicy, workCatalog: Readonly<Record<string, WorkDefinition<any>>> = {}): TransitionResult {
  const economy = state.actionEconomy;
  const person = state.world.people[state.player.currentCharacterId];
  const scribal = person?.scribal;
  if (!scribal) return { state, feedback: feedback('error', 'missing-active-character', 'The current character is unavailable.') };

  switch (action.type) {
    case 'AWARD_SKILL_XP':
    case 'AWARD_CAREER_XP':
    case 'PURCHASE_SKILL_LEVEL':
    case 'SET_PRIMARY_SPECIALIZATION':
      return transitionCareerAction(state, action, careerPolicy);
    case 'PRESENT_ASSIGNMENT':
    case 'ACCEPT_ASSIGNMENT':
    case 'DECLINE_ASSIGNMENT':
    case 'CANCEL_ASSIGNMENT':
    case 'COMPLETE_ASSIGNMENT':
    case 'PRESENT_CHALLENGE':
    case 'RESOLVE_CHALLENGE':
      return transitionOpportunityAction(state, action);
    case 'SET_INSTITUTIONAL_STANDING':
    case 'SET_RELATIONSHIP':
    case 'CREATE_INSTITUTION':
    case 'CREATE_APPOINTMENT':
    case 'END_APPOINTMENT':
    case 'CREATE_EVENT':
    case 'CREATE_RECORD':
    case 'AMEND_RECORD':
    case 'GRANT_KNOWLEDGE':
      return transitionWorldAction(state, action);
    case 'START_WORK': {
      const definition = workCatalog[action.workId];
      if (!definition) return { state, feedback: feedback('error', 'unknown-work', 'This Work is not registered in the active content catalog.') };
      if (validateWorkDefinition(definition).length) return { state, feedback: feedback('error', 'invalid-work-definition', 'This Work failed static content validation.') };
      if (state.works.activeWorkId !== null) return { state, feedback: feedback('error', 'work-already-active', 'Another Work is already active.') };
      if (state.historicalProgression.completedWorks.includes(action.workId)) return { state, feedback: feedback('error', 'work-already-completed', 'This Work has already been completed.') };
      const scenarioData = definition.createInitialProgress();
      if (!definition.validateScenarioData(scenarioData)) return { state, feedback: feedback('error', 'invalid-work-initial-state', 'The Work supplied invalid initial progress data.') };
      const progress = {
        status: 'active' as const, acquiredEvidence: [...definition.startingEvidence], examinedEvidence: [],
        workApSpentToday: 0, rewardGranted: false, completedActionIds: [],
        provisionContract: definition.provisionsContract, scenarioData, submissionCount: 0,
      };
      return { state: { ...state, works: { activeWorkId: action.workId, progress: { ...state.works.progress, [action.workId]: progress } } },
        feedback: feedback('success', 'work-started', definition.title) };
    }
    case 'ACQUIRE_WORK_EVIDENCE': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      const actionDefinition = definition?.actions.find((item) => item.id === action.actionId);
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active' || !actionDefinition) {
        return { state, feedback: feedback('error', 'invalid-work-evidence-action', 'The evidence action is unavailable for the active Work.') };
      }
      if (progress.completedActionIds.includes(action.actionId)) return { state, feedback: feedback('info', 'work-action-already-completed', 'This evidence action has already been completed.') };
      if ((actionDefinition.prerequisites ?? []).some((id) => !progress.completedActionIds.includes(id))) {
        return { state, feedback: feedback('error', 'work-action-prerequisite', 'A required earlier Work action has not been completed.') };
      }
      if (!Number.isInteger(actionDefinition.apCost) || actionDefinition.apCost < 0 || actionDefinition.apCost > economy.apRemaining) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining for this evidence action.') };
      }
      const grants = actionDefinition.grantsEvidence ?? [];
      if (grants.some((id) => !definition.evidence.some((item) => item.id === id))) {
        return { state, feedback: feedback('error', 'invalid-work-evidence-grant', 'The Work action references evidence that is not defined.') };
      }
      const acquired = [...new Set([...progress.acquiredEvidence, ...grants])];
      const examined = actionDefinition.autoExamine ? [...new Set([...progress.examinedEvidence, ...grants])] : progress.examinedEvidence;
      const nextProgress = { ...progress, acquiredEvidence: acquired, examinedEvidence: examined,
        completedActionIds: [...progress.completedActionIds, action.actionId],
        workApSpentToday: progress.workApSpentToday + actionDefinition.apCost };
      return { state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - actionDefinition.apCost },
        works: { ...state.works, progress: { ...state.works.progress, [action.workId]: nextProgress } } },
        feedback: feedback('success', 'work-evidence-acquired', actionDefinition.id) };
    }
    case 'EXAMINE_WORK_EVIDENCE': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !definition.evidence.some((item) => item.id === action.evidenceId) || !progress || !progress.acquiredEvidence.includes(action.evidenceId)) return { state, feedback: feedback('error', 'evidence-not-acquired', 'Acquire this evidence before examining it.') };
      if (progress.examinedEvidence.includes(action.evidenceId)) return { state, feedback: feedback('info', 'evidence-already-examined', 'Re-examining acquired evidence costs no AP.') };
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, examinedEvidence: [...progress.examinedEvidence, action.evidenceId] } } } },
        feedback: feedback('success', 'evidence-examined', 'Evidence examined.') };
    }
    case 'SET_WORK_SCENARIO_DATA': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || !definition.validateScenarioData(action.scenarioData)) {
        return { state, feedback: feedback('error', 'invalid-work-progress', 'The Work progress data is invalid or the Work is not active.') };
      }
      return { state: { ...state, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, scenarioData: action.scenarioData } } } }, feedback: null };
    }
    case 'SUBMIT_WORK': {
      const definition = workCatalog[action.workId];
      const progress = state.works.progress[action.workId];
      if (!definition || !progress || state.works.activeWorkId !== action.workId || progress.status !== 'active'
        || !definition.validateScenarioData(progress.scenarioData)) {
        return { state, feedback: feedback('error', 'work-not-submittable', 'This Work cannot be submitted in its current state.') };
      }
      const submissionCost = definition.submissionApCost ?? 0;
      if (!Number.isInteger(submissionCost) || submissionCost < 0 || submissionCost > economy.apRemaining) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining to submit this Work.') };
      }
      const context = { progress: progress.scenarioData, character: scribal };
      let assessment: WorkAssessment;
      try {
        const submission = definition.evaluateSubmission(context);
        assessment = definition.assessSubmission(submission, context);
      } catch {
        return { state, feedback: feedback('error', 'work-assessment-error', 'The Work assessment failed; no progress or AP was changed.') };
      }
      if (!assessment || !['accepted','revise','rejected'].includes(assessment.outcome) || typeof assessment.summary !== 'string' || !assessment.summary) {
        return { state, feedback: feedback('error', 'invalid-work-assessment', 'The Work assessment returned an invalid result; no progress or AP was changed.') };
      }
      const submissionCount = progress.submissionCount + 1;
      const apAfterSubmission = economy.apRemaining - submissionCost;
      const apSpentAfterSubmission = progress.workApSpentToday + submissionCost;
      if (assessment.outcome === 'accepted') {
        const grantReward = !progress.rewardGranted;
        const nextProgress = { ...progress, status: 'completed' as const, rewardGranted: true, submissionCount, workApSpentToday: apSpentAfterSubmission,
          lastAssessment: { ...assessment, assessedDay: state.calendar.dayNumber } };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission }, works: { activeWorkId: null, progress: { ...state.works.progress, [action.workId]: nextProgress } },
          historicalProgression: { historicalXp: state.historicalProgression.historicalXp + (grantReward ? definition.historicalXpReward : 0),
            completedWorks: state.historicalProgression.completedWorks.includes(action.workId) ? state.historicalProgression.completedWorks
              : [...state.historicalProgression.completedWorks, action.workId] } },
          feedback: feedback('success', 'work-completed', assessment.summary) };
      }
      let recovered: unknown;
      try { recovered = definition.recover(context, assessment); }
      catch { return { state, feedback: feedback('error', 'work-recovery-error', 'The Work recovery path failed; the prior progress was preserved.') }; }
      if (!definition.validateScenarioData(recovered)) return { state, feedback: feedback('error', 'invalid-work-recovery', 'The Work recovery path returned invalid progress; the prior state was preserved.') };
      return { state: { ...state, actionEconomy: { ...economy, apRemaining: apAfterSubmission }, works: { ...state.works, progress: { ...state.works.progress,
        [action.workId]: { ...progress, scenarioData: recovered, submissionCount, workApSpentToday: apSpentAfterSubmission,
          lastAssessment: { ...assessment, assessedDay: state.calendar.dayNumber } } } } },
        feedback: feedback('info', 'work-revision-needed', assessment.summary) };
    }
    case 'SPEND_AP': {
      if (!Number.isFinite(action.amount) || action.amount <= 0 || !Number.isInteger(action.amount)) {
        return { state, feedback: feedback('error', 'invalid-ap-cost', 'The AP cost must be a positive whole number.') };
      }
      if (action.workId !== undefined) {
        const progress = state.works.progress[action.workId];
        if (state.works.activeWorkId !== action.workId || !progress || progress.status !== 'active') {
          return { state, feedback: feedback('error', 'inactive-work-ap', 'Work AP must be charged to the currently active Work.') };
        }
        if (economy.apRemaining < action.amount) return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining today.') };
        return { state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - action.amount },
          works: { ...state.works, progress: { ...state.works.progress,
            [action.workId]: { ...progress, workApSpentToday: progress.workApSpentToday + action.amount } } } },
          feedback: feedback('success', 'ap-spent', action.reason) };
      }
      if (economy.apRemaining < action.amount) {
        return { state, feedback: feedback('error', 'insufficient-ap', 'There is not enough AP remaining today.') };
      }
      return {
        state: { ...state, actionEconomy: { ...economy, apRemaining: economy.apRemaining - action.amount } },
        feedback: feedback('success', 'ap-spent', action.reason),
      };
    }
    case 'ACTIVATE_OVERTIME': {
      if (economy.apRemaining !== 0 || economy.overtimeUsedToday) {
        return { state, feedback: feedback('error', 'overtime-unavailable', 'Overtime is available once, only after all allocated AP have been spent.') };
      }
      return {
        state: {
          ...state,
          actionEconomy: { ...economy, apRemaining: 1, overtimeUsedToday: true, nextDayApPenalty: true },
          world: {
            ...state.world,
            people: {
              ...state.world.people,
              [person.id]: { ...person, scribal: { ...scribal, stress: Math.min(100, scribal.stress + 5) } },
            },
          },
        },
        feedback: feedback('success', 'overtime-activated', 'One overtime AP is available. Stress increased by 5; tomorrow will have five AP.'),
      };
    }
    case 'END_DAY': {
      if (action.expectedDayNumber !== state.calendar.dayNumber) {
        return { state, feedback: feedback('error', 'stale-day-settlement', 'This Workday has already been settled or the calendar has changed.') };
      }
      if (economy.overtimeUsedToday && economy.apRemaining > 0) {
        return { state, feedback: feedback('error', 'overtime-ap-unspent', 'Spend the overtime AP before settling the day.') };
      }
      const activeProgress = state.works.activeWorkId ? state.works.progress[state.works.activeWorkId] : undefined;
      const contract = activeProgress?.status === 'active' ? activeProgress.provisionContract : undefined;
      const contractProvision = contract && activeProgress && activeProgress.workApSpentToday >= contract.minimumWorkApPerDay
        ? contract.provisionsPerQualifiedWorkday : 0;
      const availableProvisions = scribal.wallet.provisions + contractProvision;
      const hadProvision = availableProvisions > 0;
      const shortageWorkdays = hadProvision ? 0 : scribal.wallet.shortageWorkdays + 1;
      const updatedScribal = {
        ...scribal,
        wallet: {
          ...scribal.wallet,
          provisions: hadProvision ? availableProvisions - 1 : 0,
          shortageWorkdays,
        },
      };
      const withExpiredOffers = settleAssignmentOffers(state);
      let next = {
        ...withExpiredOffers,
        calendar: { ...state.calendar, dayNumber: state.calendar.dayNumber + 1 },
        works: { ...withExpiredOffers.works, progress: Object.fromEntries(Object.entries(withExpiredOffers.works.progress).map(([id, progress]) => [id, { ...progress, workApSpentToday: 0 }])) },
        actionEconomy: {
          dailyApAllocation: economy.nextDayApPenalty ? 5 as const : 6 as const,
          apRemaining: economy.nextDayApPenalty ? 5 : 6,
          overtimeUsedToday: false,
          nextDayApPenalty: false,
        },
        world: {
          ...withExpiredOffers.world,
          people: { ...withExpiredOffers.world.people, [person.id]: { ...person, scribal: updatedScribal } },
        },
      };
      if (hadProvision) {
        next = withNotice(next, 'settlement', contractProvision > 0
          ? `One contracted Work provision was earned and consumed for daily sustenance (${contractProvision} provision(s) awarded).`
          : 'One provision was consumed for daily sustenance.');
      } else {
        next = withNotice(next, 'settlement', shortageWorkdays <= 2
          ? `No provisions were available. Shortage day ${shortageWorkdays} of 2 grace days.`
          : 'No provisions were available for a third consecutive Workday. Shortage consequences begin.');
      }
      return { state: next, feedback: feedback('success', 'day-settled', 'The Workday has been settled.') };
    }
    case 'MARK_NOTICE_READ': {
      return {
        state: {
          ...state,
          journal: {
            ...state.journal,
            notices: state.journal.notices.map((notice) => notice.id === action.noticeId ? { ...notice, read: true } : notice),
          },
        },
        feedback: null,
      };
    }
    default:
      return { state, feedback: feedback('error', 'unsupported-action', 'This action is not supported by the current engine.') };
  }
}
