import { describe, expect, it } from 'vitest';

import { createSelection } from './selection';

interface Row {
  id: string;
}

describe('createSelection', () => {
  it('starts empty and derives ids/count from the selected rows', () => {
    const selection = createSelection<Row>((row) => row.id);
    expect(selection.count()).toBe(0);

    selection.selected.set([{ id: 'a' }, { id: 'b' }]);
    expect(selection.ids()).toEqual(['a', 'b']);
    expect(selection.count()).toBe(2);
  });

  it('clear() empties the selection (post-bulk-action reset)', () => {
    const selection = createSelection<Row>((row) => row.id);
    selection.selected.set([{ id: 'a' }]);
    selection.clear();
    expect(selection.selected()).toEqual([]);
    expect(selection.count()).toBe(0);
  });
});
