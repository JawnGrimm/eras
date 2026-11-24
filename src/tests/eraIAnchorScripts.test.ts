import { describe, expect, it } from 'vitest';
import {
  ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS,
  validateEraIAssignmentAnchorPortfolio,
  type EraIAnchorScript,
} from '../content/assignments/eraIAnchorScripts';

describe('Era I Assignment anchor semantic catalog', () => {
  it('contains the five authored anchor identities exactly once', () => {
    expect(ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.map((script) => script.id)).toEqual([
      'ERA1-COM-01',
      'ERA1-COM-02',
      'ERA1-CIV-01',
      'ERA1-CIV-02',
      'ERA1-REL-01',
    ]);
    expect(validateEraIAssignmentAnchorPortfolio()).toEqual([]);
  });

  it('keeps all anchors in one shared world pool without orientation locks', () => {
    expect(ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.every((script) => script.pool === 'shared_world')).toBe(true);
    expect(ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.map((script) => script.institutionalContext)).toEqual([
      'commercial', 'commercial', 'civic', 'civic', 'religious',
    ]);
    for (const script of ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS) {
      expect(JSON.stringify(script)).not.toMatch(/martial.only|martial-exclusive/i);
    }
  });

  it('preserves the labor-group and grain-disbursement source separation', () => {
    const script = ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.find((item) => item.id === 'ERA1-CIV-02');
    expect(script).toBeDefined();
    const labor = script!.evidence.find((item) => item.id === 'labor-group-account');
    const grain = script!.evidence.find((item) => item.id === 'separate-grain-disbursement');
    expect(labor?.sourceBasis).toContain('W 9827');
    expect(grain?.sourceBasis).toContain('W 15897,c8');
    expect(labor?.doesNotEstablish.join(' ')).toMatch(/relationship to W 15897,c8/i);
    expect(grain?.doesNotEstablish.join(' ')).toMatch(/labor group in W 9827/i);
    expect(script!.specialNotes?.join(' ')).toMatch(/PROVISIONAL authored compensation option/i);
  });

  it('preserves the field-record chronology and readable-transcription limits', () => {
    const script = ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.find((item) => item.id === 'ERA1-CIV-01');
    expect(script).toBeDefined();
    expect(script!.historicalGrounding.attested.join(' ')).toMatch(/Uruk III/i);
    expect(script!.historicalGrounding.attested.join(' ')).toMatch(/Jemdet Nasr/i);
    expect(script!.authorityLimits.join(' ')).toMatch(/gameplay transcription/i);
    expect(script!.historicalGrounding.excluded.join(' ')).toMatch(/GAN2/i);
  });

  it('keeps the Inana supply categories distinct and avoids a universal schedule', () => {
    const script = ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.find((item) => item.id === 'ERA1-REL-01');
    expect(script).toBeDefined();
    expect(script!.specialNotes?.join(' ')).toMatch(/DUGb and cheese/i);
    expect(script!.specialNotes?.join(' ')).toMatch(/KU6 \/ SUḪUR/i);
    expect(script!.historicalGrounding.excluded.join(' ')).toMatch(/single kitchen, office, schedule/i);
  });

  it('rejects duplicate or incomplete authored content', () => {
    const duplicate = [
      ...ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS,
      ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS[0],
    ];
    expect(validateEraIAssignmentAnchorPortfolio(duplicate)).toContain('Anchor IDs must be unique.');

    const incomplete = ERA_I_ASSIGNMENT_ANCHOR_SCRIPTS.map((script, index) => index === 0
      ? { ...script, pool: 'orientation_locked' as EraIAnchorScript['pool'] }
      : script);
    expect(validateEraIAssignmentAnchorPortfolio(incomplete)).toContain(
      'ERA1-COM-01: anchor must use the shared world pool.',
    );
  });
});
