# statezero

Small, simple, functional JavaScript library for managing immutable state.

Statezero is used by [Jetstart - a library for building web interfaces](https://github.com/andornaut/jetstart).

## Installation

Install from [npm](https://www.npmjs.com/package/statezero).

```
npm install statezero --save
```

Import statezero functions.

```javascript
import { action, getState, subscribe } from 'statezero';
```

## Usage

Statezero maintains a single state graph, which is initialized to an empty object. Users can:

* Retrieve the current
  [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
  state by calling `getState()`
* Modify the state by calling "actions", which are defined using `action()`
* Subscribe to state change notifications by calling `subscribe()`
* Subscribe to a single state change notification by calling `subscribeOnce()`
* Unsubscribe from state change notifications by calling `unsubscribe()`
* Unsubscribe all subscribers by calling `unsubscribeAll()`
* Define [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
  (computed properties) by calling `defineGetter()`

### Immutable state

Statezero maintains a single, immutable, global state object. Once your code has a reference to a copy of the state -
by calling `getState()` - any changes that you attempt to make to it will not affect any other values returned by
`getState()`. Instead, you can modify state by calling "actions".

### Actions

Actions are functions that can modify state. They are defined by calling `action(fn, ...args)`, where "fn" is a function
that you define, "...args" are optional arguments that are passed to "fn" when the action is executed, and the return
value is a function that can modify state.

The function that you pass to `action()` is itself passed a `context` argument by statezero, and it can also accept
arbitrary additional arguments. Typically, you would destructure `context` into `{commit, state}`, where `commit` is a
function that can be used to set the new state and `state` is a mutable copy of the current state.

```javascript
const incrementCount = action(({ commit, state }) => {
  state.count = (state.count || 0) + 1;
  commit(state);
});

const setCount = action(({ commit, state }, count) => {
  state.count = count;
  commit(state);
});

setCount(1);
// getState().count is 1
incrementCount();
// getState().count is 2
setCount(5);
// getState().count is 5
```

### Subscribing to state change notifications

You can subscribe to state change notifications by calling `subscribe(fn, filter)`, where "fn" is a function that you
define, "filter" is an optional String, Array or Function that selects the part of the state that when changed will
trigger a call to "fn", and the return value is a subscription, which you can use to unsubscribe.

When the (optionally filtered) state changes, statezero will call your "fn" function with two arguments: `newState` and
`previousState`.

```javascript
const fn = (newState, previousState) => {
  console.log('From', JSON.stringify(previousState));
  console.log('To', JSON.stringify(newState));
};
subscribe(fn, 'a.b.c'); // String "filter" path in "dot notation"
subscribe(fn, ['a.b.c', 'd.e.f']); // Array "filter" paths in "dot notation"
subscribe(fn, state => state.a.b.c); // Function "filter"
subscribe(fn); // Undefined "filter" - subscribe to every state change
```

`newState` is the new/current state and `previousState` is the old state (just prior to the state change), the value of
each of which depends on the "filter" argument that you supplied.

| "filter" argument                           | Value of `newState` and `previousState`  |
| ------------------------------------------- | ---------------------------------------- |
| String path, eg. `"a.b"`                    | `getState().a.b`                         |
| Array of paths, eg. `["a", "c"]`            | `{ a: getState().a, c: getState().c }`   |
| Function, eg. `({ a, c } => { a, d: c.d })` | `{ a: getState().a, d: getState().c.d }` |
| Other, eg. `undefined`                      | `getState()`                             |

If you supplied a `String`, `Array` or `Function` "filter" argument to `subscribe()`, then you must unsubscribe by
passing the return value from `subscribe()` to `unsubscribe()`.

```javascript
const subscription = subscribe(console.log, 'a');

unsubscribe(subscription);
```

If you did not pass a "filter" argument, then you can unsubscribe as above, or you can simply pass the "fn" argument
to `unsubscribe()`.

```javascript
const fn = console.log;

subscribe(fn);

unsubscribe(fn);
```

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

The function that you pass to `defineGetter()` is itself passed a `state` argument by statezero, which corresponds to
the object on which the getter was defined. In the case of a top-level getter, this will be the return value of
`getState()`.

You can subscribe to state change notifications on getters using "filters" as with any other property of the state.

```javascript
defineGetter('countTimesTwo', state => state.count * 2);

subscribe(console.log, 'countTimesTwo');

// If `state.count` is changed to 1 to 2, then this prints "4 2"
```

You can also define nested getters.

```javascript
defineGetter('nested.countTimesTwo', nested => nested.count * 2);

subscribe(console.log, 'nested.countTimesTwo');

// If `state.nested.count` is changed from 2 to 3, then this prints "6 4"
```

See [./test](./test) for more examples.

## Developing

```
npm install
npm run build
npm run test
```
