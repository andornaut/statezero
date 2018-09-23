import { clone } from '../src/clone';

const createOriginal = () => ({
  b: {
    c: 'C',
    date: new Date(),
  },
  array: [1, 2],
});

describe('clone()', () => {
  it('mutating original array property does not change clone', () => {
    const original = createOriginal();

    const cloned = clone(original);

    original.array.push(3);
    expect(original.array.length).to.equal(3);
    expect(cloned.array.length).to.equal(2);
  });

  it('mutating original date property does not change clone', () => {
    const original = createOriginal();

    const cloned = clone(original);

    const originalTime = original.b.date.getTime();
    original.b.date.setTime(0);
    expect(original.b.date.getTime()).to.equal(0);
    expect(cloned.b.date.getTime()).to.equal(originalTime);
  });

  it('mutating original string property does not change clone', () => {
    const original = createOriginal();

    const cloned = clone(original);

    original.b.c = 'CHANGED';
    expect(original.b.c).to.equal('CHANGED');
    expect(cloned.b.c).to.equal('C');
  });
});
