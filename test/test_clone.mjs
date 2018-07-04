import assert from 'assert';
import { clone } from '../src/clone.mjs';

const a = {
  b: {
    c: 'C',
    date: new Date(),
  },
  array: [1, 2],
};

const b = clone(a);

a.b.c = 'X';
assert.equal(a.b.c, 'X');
assert.equal(b.b.c, 'C');

a.array.push(3);
assert.equal(a.array.length, 3);
assert.equal(b.array.length, 2);

const originalTime = a.b.date.getTime();
a.b.date.setTime(0);
assert.equal(a.b.date.getTime(), 0);
assert.equal(b.b.date.getTime(), originalTime);
