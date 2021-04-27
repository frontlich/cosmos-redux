import { createSelectors } from '../src/selectors';

test('selectors', () => {
  expect(typeof createSelectors('a', { a: 1 }).a === 'function').toBe(true);

  expect(typeof createSelectors('a', { b: { c: 1 } }).b.c === 'function').toBe(
    true
  );
});
