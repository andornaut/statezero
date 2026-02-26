// TypeScript definitions for statezero

/**
 * The root state type. Users can override this via module augmentation:
 * @example
 * declare module 'statezero' {
 *   interface StateSchema {
 *     count: number;
 *     user: { name: string };
 *   }
 * }
 */
export interface StateSchema {
  [key: string]: unknown;
}

/**
 * A selector for selecting a portion of state.
 * Can be a dot-notation path, array of paths, selector function, or undefined for full state.
 */
export type Selector<TState = StateSchema, TSelected = unknown> =
  | string
  | string[]
  | ((state: TState) => TSelected)
  | undefined;

/**
 * Context provided to action functions
 */
export interface ActionContext<TState = StateSchema> {
  /** Commits the modified state, triggering subscriptions */
  commit: (nextState: TState) => void;
  /** A mutable clone of the current state */
  state: TState;
}

/**
 * Function signature for action definitions
 */
export type ActionFunction<TState = StateSchema, TArgs extends unknown[] = unknown[], TReturn = void> = (
  context: ActionContext<TState>,
  ...args: TArgs
) => TReturn;

/**
 * The callable action returned by action()
 */
export type Action<TArgs extends unknown[] = unknown[], TReturn = void> = (...args: TArgs) => TReturn;

/**
 * Callback function for state change subscriptions
 */
export type SubscriberCallback<TSelected = unknown, TState = StateSchema> = (
  nextState: TSelected,
  prevState: TSelected,
  nextRootState: TState
) => void;

/**
 * A subscription handle returned by subscribe functions, used for unsubscribing
 */
export type Subscription<TSelected = unknown, TState = StateSchema> = SubscriberCallback<TSelected, TState>;

/**
 * Function signature for getters (computed properties)
 * @param parent - The parent object on which the getter is defined
 * @param root - The root state object
 */
export type GetterFunction<TState = StateSchema, TReturn = unknown> = (parent: unknown, root: TState) => TReturn;

/**
 * Log entry for state change differences
 */
export interface LogDiffEntry {
  changeType: "New" | "Changed" | "Deleted" | "Array changed";
  from: unknown;
  to: unknown;
}

/**
 * Properties passed to the logger function
 */
export type LogProperties = Record<string, LogDiffEntry>;

/**
 * Logger function signature for startLogging
 */
export type LoggerFunction = (properties: LogProperties, columns: ["changeType", "from", "to"]) => void;

/**
 * Create an action that can modify state.
 * Actions receive a context with a mutable state clone and a commit function.
 *
 * @example
 * const incrementCount = action(({ commit, state }) => {
 *   state.count = (state.count || 0) + 1;
 *   commit(state);
 * });
 */
export function action<TArgs extends unknown[] = unknown[], TReturn = void>(
  fn: ActionFunction<StateSchema, TArgs, TReturn>
): Action<TArgs, TReturn>;

/**
 * Get the current state or a subset of it.
 *
 * @example
 * getState(); // returns full state
 * getState('user.name'); // returns state.user.name
 * getState(['count', 'user.name']); // returns [state.count, state.user.name]
 * getState(state => state.count * 2); // returns computed value
 */
export function getState(): StateSchema;
export function getState<T = unknown>(selector: string): T;
export function getState<T = unknown>(selector: string[]): T[];
export function getState<T = unknown>(selector: (state: StateSchema) => T): T;

/**
 * Set state at the given selector path.
 * If selector is undefined, null, or empty string, replaces the entire state.
 *
 * @example
 * setState('count', 1);
 * setState('user.name', 'Alice');
 * setState('', { count: 0 }); // replaces entire state
 */
export const setState: Action<[selector: string | undefined | null, value: unknown], void>;

/**
 * Set immutable state at the given selector path.
 * Immutable objects can be replaced or deleted, but not mutated.
 * Attempting to mutate an immutable object will throw an error.
 *
 * @param selector - A non-empty dot-notation path string
 * @param obj - A plain object to store as immutable
 */
export function setImmutableState(selector: string, obj: Record<string, unknown>): void;

/**
 * Subscribe to state changes.
 * Returns a subscription handle for unsubscribing.
 *
 * @param callback - Function called when selected state changes
 * @param selector - Optional selector to filter which state changes trigger the callback
 * @param isSync - If true, callback is called synchronously; otherwise debounced to next tick
 *
 * @example
 * const subscription = subscribe((count) => console.log(count), 'count');
 * unsubscribe(subscription);
 */
export function subscribe<T = unknown>(
  callback: SubscriberCallback<T>,
  selector?: Selector<StateSchema, T>,
  isSync?: boolean
): Subscription<T>;

/**
 * Subscribe to state changes synchronously.
 * Callbacks are invoked immediately on each state change.
 */
export function subscribeSync<T = unknown>(
  callback: SubscriberCallback<T>,
  selector?: Selector<StateSchema, T>
): Subscription<T>;

/**
 * Subscribe to a single state change, then automatically unsubscribe.
 */
export function subscribeOnce<T = unknown>(
  callback: SubscriberCallback<T>,
  selector?: Selector<StateSchema, T>,
  isSync?: boolean
): Subscription<T>;

/**
 * Subscribe to a single state change synchronously, then automatically unsubscribe.
 */
export function subscribeOnceSync<T = unknown>(
  callback: SubscriberCallback<T>,
  selector?: Selector<StateSchema, T>
): Subscription<T>;

/**
 * Unsubscribe from state changes.
 * Pass the subscription handle returned by subscribe functions.
 */
export function unsubscribe(subscription: Subscription): void;

/**
 * Unsubscribe all subscribers (both async and sync).
 */
export function unsubscribeAll(): void;

/**
 * Define a getter (computed property) on the state.
 * Getters are re-evaluated on each access.
 *
 * @param path - Dot-notation path or array path for the getter
 * @param fn - Function that computes the getter value
 * @param enumerable - Whether the property shows up during enumeration (default: false)
 *
 * @example
 * defineGetter('countTimesTwo', (parent) => parent.count * 2);
 * defineGetter('nested.computed', (parent, root) => parent.value + root.count);
 */
export const defineGetter: Action<[path: string | string[], fn: GetterFunction, enumerable?: boolean], void>;

/**
 * Start logging state changes to the console.
 * Uses console.table by default to display a diff of changes.
 *
 * @param selector - Optional selector to filter which changes are logged
 * @param logger - Optional custom logger function (default: console.table)
 */
export function startLogging(selector?: Selector, logger?: LoggerFunction): void;

/**
 * Stop logging state changes.
 */
export function stopLogging(): void;

/**
 * Set of async subscribers (debounced to next tick)
 */
export const subscribersAsync: Set<SubscriberCallback>;

/**
 * Set of sync subscribers (called immediately)
 */
export const subscribersSync: Set<SubscriberCallback>;
