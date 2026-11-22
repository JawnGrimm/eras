import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GameProvider } from '../state/GameProvider';
import { createNewGameState } from '../state/newGameState';
import { NumericDraftField, commitNumericDraftOnBlur, StorehouseWorkScreen } from '../components/StorehouseWorkScreen';

describe('StorehouseWorkScreen numeric draft field', () => {
  it('renders the account field and commits a valid typed value on the blur path', () => {
    const onCommit = vi.fn();
    const onInvalid = vi.fn();
    const markup = renderToStaticMarkup(createElement(NumericDraftField, {
      field: 'opening',
      value: undefined,
      onCommit,
    }));

    expect(markup).toContain('aria-label="Opening usable stock"');
    expect(markup).toContain('inputmode="numeric"');

    commitNumericDraftOnBlur('47', 'opening', undefined, onCommit, onInvalid);

    expect(onCommit).toHaveBeenCalledExactlyOnceWith('opening', 47);
    expect(onInvalid).not.toHaveBeenCalled();
  });

  it('renders the production Storehouse screen with its authored account fields', () => {
    const state = createNewGameState();
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

    commitNumericDraftOnBlur('4x7', 'opening', 24, onCommit, onInvalid);

    expect(onCommit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledOnce();
  });
});
