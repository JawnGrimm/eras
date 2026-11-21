/**
 * Scribe of Eras - Character & Reputation System (src/engine/CharacterSystem.ts)
 * Manages personal NPC relationships, professional reputation, institutional standing, and successor legacy.
 */

export interface ProfessionalReputation {
  competence: number; // 0 to 100 (accuracy and meticulousness)
  reliability: number; // 0 to 100 (meeting deadlines and terms)
  discretion: number; // 0 to 100 (handling sensitive matters)
  judgment: number; // 0 to 100 (fairness and evidence-based records)
}

export interface InstitutionalStanding {
  institutionId: string;
  name: string;
  standing: number; // -100 to 100
  title: string;
}

export interface CharacterSystemState {
  reputation: ProfessionalReputation;
  institutions: InstitutionalStanding[];
}

export function createInitialReputation(): ProfessionalReputation {
  return {
    competence: 50,
    reliability: 50,
    discretion: 50,
    judgment: 50,
  };
}

export function createInitialInstitutions(): InstitutionalStanding[] {
  return [
    {
      institutionId: 'inst-inanna',
      name: 'Inanna Temple Administration',
      standing: 20,
      title: 'Associated Temple Scribe',
    },
    {
      institutionId: 'inst-palace',
      name: 'Palace Overseer of Textiles & Grain',
      standing: 10,
      title: 'Junior Institutional Scribe',
    },
    {
      institutionId: 'inst-guild',
      name: 'Guild of Metalsmiths & Merchants',
      standing: 15,
      title: 'Registered Independent Assayer',
    },
  ];
}
