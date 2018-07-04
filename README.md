# statezero

Small, simple, functional JavaScript library for managing immutable state.

## Installation

```
npm install statezero --save
```

Include the statezero bundle that matches your environment:

```
ls -1 node_modules/statezero/dist/
statezero.cjs.js
statezero.esm.js
statezero.umd.js
```

## Usage

Statezero maintains a single state graph, which is initialized to an empty object. Applications can modify the state
by calling "actions"; or retrieve the current state by calling `getState()`; or subscribe to state changes by
calling `subscribe(callback, filter)` (and unsubscribe with `unsubscribe(callback)`).

| Function     | Arguments                        | Return Value                                                     | Description                                                                                                                                                                                                                             |
| ------------ | -------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| action       | `fn({ commit, state }, ...args)` | Function which accepts `...args` parameters and can modify state | Returns a function which can be used to modify the state. `commit` is a function which can be used to modify the state. `state` is the current state object.                                                                            |
| getState     | -                                | State object                                                     | Returns a [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) state object                                                                                                         |
| subscribe    | callback, filter                 | subscription which can be used to unsubscribe                    | Register a callback to be invoked whenever the state changes. If `filter` is given (as a string, path or filter function), then the callback will be passed the filtered state and will only be called when the filtered state changes. |
| unsubscribe  | subscription                     | -                                                                | Removes a previously subscribed `subscription` which is either the callback function passed to `subscribe()`, or if a filter was also supplied to `subscribe()`, then this should be the return value from `subscribe()`                |
| defineGetter | path, fn                         | -                                                                | Define a getter on the stabe object                                                                                                                                                                                                     |

See [./test](./test) for more examples.

## Developing

```
npm install
npm run build
```
