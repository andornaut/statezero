import cloneDeepWith from 'lodash/cloneDeepWith';
import isElement from 'lodash/isElement';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import { isImmutable } from './immutable';
import { getRoot, setRoot } from './root';

function cloneProp(customizer, value) {
  return typeof value === 'object' ? cloneDeepWith(value, customizer) : value;
}

/* Deep clone the given object.
 *
 * An empty object is returned for uncloneable values such as error objects, and WeakMaps; with the
 * exception of Functions and DOM Elements, which are returned as is.
 *
 * Getter descriptors are copied to cloned objects without modification, but non-getter descriptors are excluded.
 *
 * See lodash.clone() documentation for more (the description above applies where the two conflict):
 * https://lodash.com/docs/4.17.15#clone
 */
export function clone(obj) {
  const seen = new WeakMap();
  let root;

  function customizer(value) {
    if (isElement(value) || isFunction(value) || isImmutable(value)) {
      // Do not attempt to clone DOM nodes, immutable objects, or Function, but don't replace them with {} either, which
      // is what lodash would usually do. Leave them as is instead.
      return value;
    }
    if (!isPlainObject(value)) {
      // When customizer returns undefined, comparisons are handled by lodash
      // https://lodash.com/docs/4.17.10#clone
      return undefined;
    }

    let cloned = seen.get(value);
    if (cloned) {
      return cloned;
    }

    cloned = {};
    seen.set(value, cloned);

    if (!root) {
      root = cloned;
    }

    if (!getRoot(value)) {
      // There's a noticeable performance advantage to not retrieving descriptors and exiting early here.
      // We know that there are no getters if there is no ROOT, b/c defineGetters sets ROOT.
      // Even `cloned[ROOT] = root;` is costly, so we avoid that here too.
      for (const propName of Object.getOwnPropertyNames(value)) {
        cloned[propName] = cloneProp(customizer, value[propName]);
      }
      return cloned;
    }

    setRoot(cloned, root);
    for (const [propName, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (descriptor.get) {
        // Copy over getters as is.
        Object.defineProperty(cloned, propName, descriptor);
        continue;
      }
      cloned[propName] = cloneProp(customizer, descriptor.value);
    }
    return cloned;
  }

  return cloneDeepWith(obj, customizer);
}
