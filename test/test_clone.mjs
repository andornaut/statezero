import { clone } from '../src/clone.mjs';

const createOriginal = () => ({
  b: {
    c: 'C',
    date: new Date(),
  },
  array: [1, 2],
});

test('mutating original array property does not change clone', () => {
  const original = createOriginal();

  const clonedA = clone(original);

  original.array.push(3);
  expect(original.array.length).toBe(3);
  expect(clonedA.array.length).toBe(2);
});

test('mutating original date property does not change clone', () => {
  const original = createOriginal();

  const clonedA = clone(original);

  const originalTime = original.b.date.getTime();
  original.b.date.setTime(0);
  expect(original.b.date.getTime()).toBe(0);
  expect(clonedA.b.date.getTime()).toBe(originalTime);
});

test('mutating original string property does not change clone', () => {
  const original = createOriginal();

  const clonedA = clone(original);

  original.b.c = 'CHANGED';
  expect(original.b.c).toBe('CHANGED');
  expect(clonedA.b.c).toBe('C');
});
