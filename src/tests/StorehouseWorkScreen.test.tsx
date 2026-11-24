import React, { createElement } from 'react';
import { TEST_CHARACTER_CREATION } from './fixtures/newGameCharacter';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GameProvider } from '../state/GameProvider';
import { createNewGameState } from '../state/newGameState';
import { NumericDraftField, commitNumericDraftOnBlur, StorehouseWorkScreen } from '../components/StorehouseWorkScreen';

describe('StorehouseWorkScreen numeric draft field', () => {
  it('renders the account field and commits a valid typed value on the blur path', () => {
    const onCommit = vi.fn();
    const onInvalid = vi.fn();
    const onCommitSuccess = vi.fn();
    const markup = renderToStaticMarkup(createElement(NumericDraftField, {
      field: 'opening',
      value: undefined,
      onCommit,
    }));

    expect(markup).toContain('aria-label="Opening usable stock"');
    expect(markup).toContain('inputMode="numeric"');

    commitNumericDraftOnBlur('47', 'opening', onCommit, onInvalid, onCommitSuccess);

    expect(onCommit).toHaveBeenCalledExactlyOnceWith('opening', 47);
    expect(onInvalid).not.toHaveBeenCalled();
    expect(onCommitSuccess).toHaveBeenCalledOnce();
  });

  it('renders the production Storehouse screen with its authored account fields', () => {
    const state = createNewGameState(TEST_CHARACTER_CREATION);
    const markup = renderToStaticMarkup(
      createElement(GameProvider, { initialState: state },
        createElement(StorehouseWorkScreen, { onBack: () => undefined }),
      ),
    );

    expect(markup).toContain('The Storehouse Reckoning');
    expect(markup).toContain('Opening usable stock');
    expect(markup).toContain('Submit for assessment');
  });

  it('rejects non-digit input and restores the previous field value', () => {
    const onCommit = vi.fn();
    const onInvalid = vi.fn();
    const onCommitSuccess = vi.fn();

    commitNumericDraftOnBlur('4x7', 'opening', onCommit, onInvalid, onCommitSuccess);

    expect(onCommit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledOnce();
    expect(onCommitSuccess).not.toHaveBeenCalled();
  });
});
