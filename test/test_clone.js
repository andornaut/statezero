import { clone } from '../src/clone';

const createOriginal = () => ({
  b: {
    c: 'C',
    date: new Date(),
  },
  array: [1, 2],
});

describe('clone()', () => {
  describe("when mutating the cloned object's nested array", () => {
    it('should not mutate the original', () => {
      const original = createOriginal();
      const cloned = clone(original);

      cloned.array.push(3);

      expect(cloned.array.length).to.equal(3);
      expect(original.array.length).to.equal(2);
    });
  });
  describe("when mutating the original object's nested array", () => {
    it('should not mutate the clone', () => {
      const original = createOriginal();
      const cloned = clone(original);

      original.array.push(3);

      expect(original.array.length).to.equal(3);
      expect(cloned.array.length).to.equal(2);
    });
  });

  describe("when mutating original object's nested date", () => {
    it('should not mutate the clone', () => {
      const original = createOriginal();
      const cloned = clone(original);
      const originalTime = original.b.date.getTime();

      original.b.date.setTime(0);

      expect(original.b.date.getTime()).to.equal(0);
      expect(cloned.b.date.getTime()).to.equal(originalTime);
    });
  });

  describe("when assigning a new string value to the original object's nested property", () => {
    it('should not mutate the clone', () => {
      const original = createOriginal();
      const cloned = clone(original);

      original.b.c = 'CHANGED';

      expect(original.b.c).to.equal('CHANGED');
      expect(cloned.b.c).to.equal('C');
    });
  });
});
