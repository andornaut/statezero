import { action, getState } from '../src';
import { clearStateThenResolve, incrementCount } from './helpers';

function Foo() {}

describe('action()', () => {
  beforeEach(clearStateThenResolve);

  it('mutates state', () => {
    incrementCount();

    expect(getState().count).to.equal(1);
  });

  describe('commit called with invalid "nextState" argument throw an error', () => {
    [new Foo(), null, undefined, 0, 1, []].forEach((nextState) => {
      it(`nextState: ${nextState}`, () => {
        action(({ commit }) => {
          expect(() => {
            commit(nextState);
          }).to.throw();
        })();
      });
    });
  });
});
