import { describe, expect, it } from 'vitest';
import { applyClosingAssessment, CLOSING_RECEIPT_SCHEDULE } from '../engine/closingReceipt';
import { createInitialGameState, INITIAL_PERSON_ID } from '../state/initialState';
import { getInitializedScribal } from '../state/scribalState';
import type { AssignmentAssessmentCategory } from '../state/types';

const institutionId = 'institution-uruk-temple-storehouse' as never;
const receiverId = 'person-ur-nanna' as never;
function apply(category: AssignmentAssessmentCategory) {
  return applyClosingAssessment(createInitialGameState(), {
    receiptId: `receipt-${category}`, title: 'Test report', disposition: 'Qualified finding',
    assessment: category, rationale: 'Authored rationale.', reaction: 'Authored receiver reaction.',
    baseCareerXp: 12, institutionId, receiverPersonId: receiverId,
    currencyDelta: 10, provisionsDelta: 1,
    compensationTiming: 'Contracted pay is payable in full at preliminary Day-Close.',
  })!;
}

describe('shared Closing Receipt assessment schedule', () => {
  it('uses the approved Career XP multipliers and quality deltas', () => {
    expect(CLOSING_RECEIPT_SCHEDULE).toEqual({
      Thorough: { careerXpMultiplier: 1, judgment: 3, institutionalStanding: 1, trust: 2, respect: 1 },
      Defensible: { careerXpMultiplier: 0.75, judgment: 2, institutionalStanding: 1, trust: 1, respect: 1 },
      Incomplete: { careerXpMultiplier: 0.5, judgment: 0, institutionalStanding: 0, trust: 0, respect: 0 },
      Overreached: { careerXpMultiplier: 0.25, judgment: -4, institutionalStanding: -2, trust: -4, respect: -3 },
    });
    expect(getInitializedScribal(apply('Thorough').state.world.people[INITIAL_PERSON_ID])?.careerXp).toBe(162);
    expect(getInitializedScribal(apply('Defensible').state.world.people[INITIAL_PERSON_ID])?.careerXp).toBe(159);
    expect(getInitializedScribal(apply('Incomplete').state.world.people[INITIAL_PERSON_ID])?.careerXp).toBe(156);
    expect(getInitializedScribal(apply('Overreached').state.world.people[INITIAL_PERSON_ID])?.careerXp).toBe(153);
  });

  it('applies recipient relationships in the receiver-to-player direction and records actual deltas', () => {
    const thorough = apply('Thorough');
    expect(getInitializedScribal(thorough.state.world.people[INITIAL_PERSON_ID])?.professionalReputation.judgment).toBe(53);
    expect(getInitializedScribal(thorough.state.world.people[INITIAL_PERSON_ID])?.institutionalStanding[institutionId]).toBe(51);
    expect(thorough.state.world.relationships[receiverId]?.[INITIAL_PERSON_ID]?.dimensions).toMatchObject({ trust: 52, respect: 51 });
    expect(thorough.state.world.relationships[INITIAL_PERSON_ID]?.[receiverId]).toBeUndefined();
    expect(thorough.receipt.deltas).toEqual({
      currency: 10, provisions: 1, careerXp: 12, judgment: 3,
      institutionalStanding: 1, trust: 2, respect: 1,
    });
    expect(thorough.receipt.dayNumber).toBe(1);
    expect(thorough.receipt.receiverName).toBe('Ur-Nanna');
    expect(thorough.receipt.institutionName).toBe('Temple Storehouse');
  });

  it('does not alter quality or create a relationship for an Incomplete assessment', () => {
    const incomplete = apply('Incomplete');
    const scribal = getInitializedScribal(incomplete.state.world.people[INITIAL_PERSON_ID])!;
    expect(scribal.professionalReputation.judgment).toBe(50);
    expect(scribal.institutionalStanding[institutionId]).toBeUndefined();
    expect(incomplete.state.world.relationships[receiverId]?.[INITIAL_PERSON_ID]).toBeUndefined();
    expect(incomplete.receipt.deltas).toMatchObject({ careerXp: 6, judgment: 0, institutionalStanding: 0, trust: 0, respect: 0 });
  });

  it('keeps contracted resources visible without crediting them through the assessment helper', () => {
    const result = apply('Overreached');
    const scribal = getInitializedScribal(result.state.world.people[INITIAL_PERSON_ID])!;
    expect(scribal.wallet.money).toBe(12);
    expect(scribal.wallet.provisions).toBe(5);
    expect(result.receipt.deltas.currency).toBe(10);
    expect(result.receipt.deltas.provisions).toBe(1);
    expect(result.receipt.compensationTiming).toContain('preliminary Day-Close');
  });

  it('clamps quality dimensions and reports the actual applied deltas', () => {
    const base = createInitialGameState();
    const person = base.world.people[INITIAL_PERSON_ID];
    const scribal = getInitializedScribal(person)!;
    const bounded: typeof base = {
      ...base,
      world: {
        ...base.world,
        people: { ...base.world.people, [INITIAL_PERSON_ID]: { ...person, scribal: {
          ...scribal, professionalReputation: { ...scribal.professionalReputation, judgment: 2 },
          institutionalStanding: { [institutionId]: 1 },
        } } },
        relationships: {
          ...base.world.relationships,
          [receiverId]: { [INITIAL_PERSON_ID]: { dimensions: { trust: 1, respect: 2, affection: 50, resentment: 0, rivalry: 0 }, history: [] } },
        },
      },
    };
    const result = applyClosingAssessment(bounded, {
      receiptId: 'receipt-clamped', title: 'Test', disposition: 'Overreached',
      assessment: 'Overreached', rationale: 'Rationale', reaction: 'Reaction', baseCareerXp: 12,
      institutionId, receiverPersonId: receiverId,
    })!;
    expect(result.receipt.deltas).toMatchObject({ judgment: -2, institutionalStanding: -1, trust: -1, respect: -2 });
  });
});
