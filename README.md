# statezero

Small, simple, functional JavaScript library for managing immutable state.

Statezero is used by [Jetstart - a library for building web interfaces](https://github.com/andornaut/jetstart).

[React Hooks](https://reactjs.org/docs/hooks-intro.html) are provided via
[statezero-react-hooks](https://github.com/andornaut/statezero-react-hooks).

## Getting Started

Install from [npm](https://www.npmjs.com/package/statezero).

```bash
npm install statezero --save
```

Statezero is packaged as both ESM and UMD bundles, so it can be loaded in various environments:

### Browser Global

```html
<script src="./node_modules/statezero/dist/statezero.js"></script>
<script>
  const { action, subscribe } = window.statezero;
</script>
```

### ES6 Module

```javascript
import { action, subscribe } from "statezero";
```

### ES6 Module with tree shaking (not transpiled)

```javascript
// Note that the import path ends with '/src'
import { action, subscribe } from "statezero/src";
```

### Node

```javascript
const { action, subscribe } = require("statezero");
```

## Usage

Statezero maintains a single state graph, which is initialized to an empty object. Users can:

- Retrieve the current
  [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
  state by calling `getState()`
- Modify the state by calling the `setState()` action.
- Modify the state by calling other actions, which are defined using `action()`
- Set or replace immutable objects by calling `setImmutableState()`. Immutable objects can be replaced or deleted, but not mutated. statezero performs better when large objects are stored as immutable state.
- Subscribe to state change notifications by calling `subscribe()` or `subscribeSync()`
- Subscribe to a single state change notification by calling `subscribeOnce()` or `subscribeOnceSync()`
- Unsubscribe from state change notifications by calling `unsubscribe()`
- Unsubscribe all subscribers by calling `unsubscribeAll()`
- Define [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
  (computed properties) by calling `defineGetter()`

### State

Statezero maintains a single state graph. Once your code has a reference to a copy of the state object -
by calling `getState()` - any changes that you attempt to make to it will not affect any other values returned by
`getState()`. Instead, you should modify state by calling "actions".

`getState()` accepts an optional "selector" argument, which can be used to select a subset of the state to return.
"selector" should be a string path in dot notation, an Array of the same, or a Function.

```javascript
const setCount = action(({ commit, state }, count) => {
  state.count = count;
  state.countTimesTwo = count * 2;
  commit(state);
});

setCount(1);

getState(); // returns { count: 1 }
getState("count");
returns; // 1
getState(["count", "countTimesTwo"]);
// returns [1, 2]
```

### Actions

Actions are functions that can modify state. They are defined by calling `action(fn, ...args)`, where "fn" is a function
that you define, "...args" are optional arguments that are passed to "fn" when the action is executed, and the return
value is a function that can modify state.

The function that you pass to `action()` is itself passed a `context` argument by statezero, and it can also accept
arbitrary additional arguments. Typically, you would destructure `context` into `{ commit, state }`. `commit` is a
function that can be used to set the state; it accepts a single `nextState` argument, which must be a JSON-serializable
[plain object](https://lodash.com/docs/4.17.10#isPlainObject). `state` is a mutable copy of the current state.

Statezero ships with two actions:

`setState(selector, value)`, where "selector" is a string path in dot notation.
If "selector" is undefined, null or empty-string then the entire state is replaced by the supplied "value".

`setImmutableState(selector, obj)`, where "selector" is a string path in dot notation.
"selector" must be a non-empty string and "obj" must be plain object.

```javascript
const incrementCount = action(({ commit, state }) => {
  state.count = (state.count || 0) + 1;
  commit(state);
});

const setCount = (count) => setState("count", count);

setCount(1);
// getState().count is 1
incrementCount();
// getState().count is 2
setCount(5);
// getState().count is 5
```

### Immutable State

Objects that are added to the state via `setImmutableState()` can be deleted or replaced, but they cannot be mutated.
In order to change the value of one of the properties of an immutable state object, you must replace the entire object
using `setImmutableState()`. Immutable state can be useful in cases where you want to store especially large objects,
but do not wish to incur the performance penalty of tracking deep changes to all of its properties.

### Subscribing to state change notifications

You can subscribe to state change notifications by calling `subscribe(fn, selector)`, where "fn" is a function that you
define, "selector" is an optional String, Array or Function that selects the part of the state that when changed will
trigger a call to "fn", and the return value is a subscription, which you can use to unsubscribe.

When the state changes, statezero will call your "fn" function with two arguments: `nextState` and
`prevState`.

```javascript
const fn = (nextState, prevState, nextRootState) => {
  console.log("From", JSON.stringify(prevState));
  console.log("To", JSON.stringify(nextState));
  console.log("Root state", JSON.stringify(nextRootState));
};
subscribe(fn, "a.b.c"); // String "selector" path in dot notation
subscribe(fn, ["a.b.c", "d.e.f"]); // Array "selector" paths, each in dot notation
subscribe(fn, (state) => state.a.b.c); // Function "selector"
subscribe(fn); // Undefined "selector" - subscribe to every state change
```

`nextState` is the new/current state. `prevState` is the old state (just prior to the state change), the value of
each of which depends on the "selector" argument that you supplied. `nextRootState` is the new/current full state graph.

| "selector" argument                         | Value of `nextState` and `prevState`     |
| ------------------------------------------- | ---------------------------------------- |
| String path, eg. `"a.b"`                    | `getState().a.b`                         |
| Array of paths, eg. `["a", "c"]`            | `[getState().a, getState().c]`           |
| Function, eg. `({ a, c } => { a, d: c.d })` | `{ a: getState().a, d: getState().c.d }` |
| Other, eg. `undefined`                      | `getState()`                             |

If you supplied a `String`, `Array` or `Function` "selector" argument to `subscribe()`, then you must unsubscribe by
passing the return value from `subscribe()` to `unsubscribe()`.

```javascript
const subscription = subscribe(console.log, "a");

unsubscribe(subscription);
```

If you did not pass a "selector" argument, then you can unsubscribe as above, or you can simply pass the "fn" argument
to `unsubscribe()`.

```javascript
const fn = console.log;

subscribe(fn);

unsubscribe(fn);
```

#### Async vs Sync

Callbacks passed to `subscribe()` or `subscribeOnce()` are executed on relevant state changes on the
[next tick](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html). This is fine for many cases,
but if you want the callbacks to be invoked synchronously, then you can use `subscribeSync()` or `subscribeOnceSync()`.

### Getters a.k.a. Computed Properties

Getters are analogous to "computed properties" (see, for example,
[computed properties in Vuex](https://vuex.vuejs.org/guide/state.html#getting-vuex-state-into-vue-components)).
Getters are defined by calling `defineGetter(fn, path)`, where "fn" is a function that you define, which should return
the value of the property, and "path" is the
[dot notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors)
path of the
[getter Property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#Defining_getters_and_setters)
that you wish to define. Any non-existent ancestors in the "path" will be created as empty objects. Note that you should
avoid [cycles](https://en.wikipedia.org/wiki/Circular_dependency) in getters.

The function that you pass to `defineGetter()` is itself passed two arguments by statezero: `parent` and `root`.
`parent` corresponds to the object on which the getter was defined; in the case of a top-level getter, this is the
return value of `getState()`.
`root` corresponds to the return value of `getState()`.

You can subscribe to state change notifications on getters using "selectors" as with any other property of the state.

```javascript
defineGetter("countTimesTwo", (parent) => parent.count * 2);

subscribe(console.log, "countTimesTwo");

// If `state.count` is changed to 1 to 2, then this prints "4 2"
```

You can also define nested getters.

```javascript
defineGetter("nested.countTimesTwo", (parent) => parent.count * 2);

subscribe(console.log, "nested.countTimesTwo");

// If `state.nested.count` is changed from 2 to 3, then this prints "6 4"
```

Getter functions are called with the root state as the second argument.

```javascript
defineGetter("nested.countTimesTwoTimesRootCount", (parent, root) => parent.count * 2 * root.count);

subscribe(console.log, "nested.countTimesTwoTimesRootCount");

// If `state.count` is changed to 1 to 2 and `state.nested.count` is changed from 2 to 3, then this prints "12 4"
```

Getters can be
[enumerable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties).

```javascript
  // The last argument defaults to `false`
  defineGetter('nested.property', () => null, true);
  const { enumerable } = Object.getOwnPropertyDescriptor(getState().nested, 'property');
  console.log(enumerable);

  // Prints "true"
```

See [./test](./test) for more examples.

### Logging

```javascript
import { startLogging, stopLogging } from "statezero";

startLogging();

// When an action is called, a table is printed to the console which describes the changes.

stopLogging();
```

`startLogging(selector, logger)` accepts two optional arguments. `selector` can be used to selector the state changes that
are logged; if not specified then all changes are logged. `logger` can be used to override the default log function of
[`console.table`](https://developer.mozilla.org/en-US/docs/Web/API/Console/table).

## Developing

```bash
npm install
npm run build        # Development build (UMD + ESM)
npm run test         # Run tests with Jest
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint with zero-warning policy
npm run format       # Format code with prettier-eslint
```
