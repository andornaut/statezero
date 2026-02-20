import { clone } from "../src/clone";

const createOriginal = () => ({
  array: [1, 2],
  b: {
    c: "C",
    date: new Date(),
  },
});

describe("clone()", () => {
  describe("when a function is in the state", () => {
    it("should be successful", () => {
      const original = {};
      original.fn = () => null;

      const cloned = clone(original);

      expect(typeof original.fn).toBe("function");
      expect(typeof cloned.fn).toBe("function");
    });
  });

  describe("when a cycle of objects exists", () => {
    it("should be successful", () => {
      const original = {};
      original.child = original;

      const cloned = clone(original);

      expect(cloned.child).toBe(cloned);
      expect(cloned.child).not.toBe(original);
    });
  });

  describe("when a cycle of arrays exists", () => {
    it("should be successful", () => {
      const arr = [];
      arr.push(arr);
      const original = { arr };

      const cloned = clone(original);

      expect(cloned.arr).toBe(cloned.arr[0]);
      expect(cloned.arr).not.toBe(original.arr[0]);
    });
  });

  describe("when mutating the cloned object's nested array", () => {
    it("should not mutate the original", () => {
      const original = createOriginal();
      const cloned = clone(original);

      cloned.array.push(3);

      expect(cloned.array.length).toBe(3);
      expect(original.array.length).toBe(2);
    });
  });

  describe("when mutating the original object's nested array", () => {
    it("should not mutate the clone", () => {
      const original = createOriginal();
      const cloned = clone(original);

      original.array.push(3);

      expect(original.array.length).toBe(3);
      expect(cloned.array.length).toBe(2);
    });
  });

  describe("when cloning a date", () => {
    it("should not mutate the clone", () => {
      const original = createOriginal();
      const cloned = clone(original);
      const originalTime = original.b.date.getTime();

      original.b.date.setTime(0);

      expect(original.b.date.getTime()).toBe(0);
      expect(cloned.b.date.getTime()).toBe(originalTime);
    });
  });

  describe("when assigning a new string value to the original object's nested property", () => {
    it("should not mutate the clone", () => {
      const original = createOriginal();
      const cloned = clone(original);

      original.b.c = "CHANGED";

      expect(original.b.c).toBe("CHANGED");
      expect(cloned.b.c).toBe("C");
    });
  });
});
