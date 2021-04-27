import { createSelectors } from '../src/selectors';

test('selectors', () => {
  expect(typeof createSelectors('a', { a: 1 }).a === 'function').toBe(true);

  expect(typeof createSelectors('a', { b: { c: 1 } }).b.c === 'function').toBe(
    true
  );

  expect(() => createSelectors('a', { dependencies: '' })).not.toThrowError();

  expect(() => {
    process.env.NODE_ENV = 'development';
    createSelectors('a', { dependencies: {} });
  }).toThrowError('创建selectors时，state中的属性名不能为dependencies');
});
