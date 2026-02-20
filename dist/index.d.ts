// TypeScript definitions for statezero

export type Selector<T = any> = string | string[] | ((state: any) => T) | undefined;

export interface ActionContext {
  commit: (nextState: Record<string, any>) => void;
  state: Record<string, any>;
}

export type ActionFunction<TArgs extends any[] = any[], TReturn = void> = (
  context: ActionContext,
  ...args: TArgs
) => TReturn;

export type Action<TArgs extends any[] = any[], TReturn = void> = (...args: TArgs) => TReturn;

export type SubscriberCallback<T = any> = (
  nextState: T,
  prevState: T,
  nextRootState: any
) => void;

export type Subscription = SubscriberCallback;

export type GetterFunction = (parent: any, root: any) => any;

/**
 * Create an action that can modify state
 */
export function action<TArgs extends any[] = any[], TReturn = void>(
  fn: ActionFunction<TArgs, TReturn>
): Action<TArgs, TReturn>;

/**
 * Get the current state or a subset of it
 */
export function getState(): any;
export function getState<T = any>(selector: string): T;
export function getState<T = any>(selector: string[]): T[];
export function getState<T = any>(selector: (state: any) => T): T;

/**
 * Set state at the given selector path
 */
export const setState: Action<[selector: string | undefined | null, value: any], void>;

/**
 * Set immutable state at the given selector path
 */
export function setImmutableState(selector: string, obj: Record<string, any>): void;

/**
 * Subscribe to state changes
 */
export function subscribe<T = any>(
  callback: SubscriberCallback<T>,
  selector?: Selector<T>,
  isSync?: boolean
): Subscription;

/**
 * Subscribe to state changes synchronously
 */
export function subscribeSync<T = any>(
  callback: SubscriberCallback<T>,
  selector?: Selector<T>
): Subscription;

/**
 * Subscribe to a single state change
 */
export function subscribeOnce<T = any>(
  callback: SubscriberCallback<T>,
  selector?: Selector<T>,
  isSync?: boolean
): Subscription;

/**
 * Subscribe to a single state change synchronously
 */
export function subscribeOnceSync<T = any>(
  callback: SubscriberCallback<T>,
  selector?: Selector<T>
): Subscription;

/**
 * Unsubscribe from state changes
 */
export function unsubscribe(subscription: Subscription): void;

/**
 * Unsubscribe all subscribers
 */
export function unsubscribeAll(): void;

/**
 * Define a getter (computed property) on the state
 */
export const defineGetter: Action<
  [path: string | string[], fn: GetterFunction, enumerable?: boolean],
  void
>;

/**
 * Start logging state changes
 */
export function startLogging(
  selector?: Selector,
  logger?: (properties: any, columns: string[]) => void
): void;

/**
 * Stop logging state changes
 */
export function stopLogging(): void;

/**
 * Async subscribers set
 */
export const subscribersAsync: Set<SubscriberCallback>;

/**
 * Sync subscribers set
 */
export const subscribersSync: Set<SubscriberCallback>;
