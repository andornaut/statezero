import { startLogging, stopLogging } from "../src/logger";
import { subscribersAsync } from "../src/subscriptions";
import { clearStateThenResolve, incrementCount } from "./helpers";

describe("startLogging()", () => {
  beforeEach(() => clearStateThenResolve());

  afterEach(() => {
    stopLogging();
  });

  describe("when called without arguments", () => {
    it("should subscribe to state changes", () => {
      const initialCount = subscribersAsync.size;

      startLogging();

      expect(subscribersAsync.size).toBe(initialCount + 1);
    });
  });

  describe("when called twice", () => {
    it("should not create duplicate subscriptions", () => {
      const initialCount = subscribersAsync.size;

      startLogging();
      startLogging();

      expect(subscribersAsync.size).toBe(initialCount + 1);
    });
  });

  describe("when called with a custom logger", () => {
    it("should call the custom logger on state change", (done) => {
      const customLogger = jest.fn();

      startLogging(undefined, customLogger);
      incrementCount();

      setTimeout(() => {
        expect(customLogger).toHaveBeenCalled();
        expect(customLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            count: expect.objectContaining({
              changeType: "New",
              from: undefined,
              to: 1,
            }),
          }),
          ["changeType", "from", "to"],
        );
        done();
      });
    });
  });

  describe("when called with a selector", () => {
    it("should only log changes matching the selector", (done) => {
      const customLogger = jest.fn();

      startLogging("count", customLogger);
      incrementCount();

      setTimeout(() => {
        expect(customLogger).toHaveBeenCalled();
        done();
      });
    });
  });
});

describe("stopLogging()", () => {
  beforeEach(() => clearStateThenResolve());

  describe("when called after startLogging", () => {
    it("should unsubscribe from state changes", () => {
      startLogging();
      const countAfterStart = subscribersAsync.size;

      stopLogging();

      expect(subscribersAsync.size).toBe(countAfterStart - 1);
    });
  });

  describe("when called without prior startLogging", () => {
    it("should not throw an error", () => {
      expect(() => stopLogging()).not.toThrow();
    });
  });

  describe("when called twice", () => {
    it("should not throw an error", () => {
      startLogging();

      expect(() => {
        stopLogging();
        stopLogging();
      }).not.toThrow();
    });
  });

  describe("when called after stopLogging", () => {
    it("should not call the logger on subsequent state changes", (done) => {
      const customLogger = jest.fn();

      startLogging(undefined, customLogger);
      stopLogging();
      incrementCount();

      setTimeout(() => {
        expect(customLogger).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
