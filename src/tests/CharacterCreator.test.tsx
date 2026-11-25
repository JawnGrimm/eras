import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProductionSaveResetConfirmation, ProductionShellContent } from '../components/ProductionShell';
import { GameProvider } from '../state/GameProvider';
import type { ProductionStorage } from '../state/GameProvider';

class MemoryStorage implements ProductionStorage {
  getItem(): string | null { return null; }
  setItem(): void { throw new Error('Creator must not persist before confirmation.'); }
}

describe('Era I Character Creator entry flow', () => {
  it('presents the Creator instead of initializing or displaying a fixed-protagonist workday', () => {
    const markup = renderToStaticMarkup(createElement(GameProvider, { storage: new MemoryStorage() },
      createElement(ProductionShellContent)));
    expect(markup).toContain('Create your character');
    expect(markup).toContain('Professional orientation');
    expect(markup).toContain('Review character');
    expect(markup).not.toContain('Workday Hub');
    expect(markup).not.toContain('Enlil-barni');
  });
});


describe('Production save reset confirmation', () => {
  it('uses an accessible in-app dialog and explains that the current save is preserved until character confirmation', () => {
    const markup = renderToStaticMarkup(createElement(ProductionSaveResetConfirmation, {
      onCancel: () => {},
      onConfirm: () => {},
    }));
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="production-reset-confirmation-title"');
    expect(markup).toContain('Cancel');
    expect(markup).toContain('Open Character Creator');
    expect(markup).toContain('Your existing production save will remain untouched');
  });
});
