
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop$1() {}

	const identity = (x) => x;

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	// Adapted from https://github.com/then/is-promise/blob/master/index.js
	// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
	/**
	 * @param {any} value
	 * @returns {value is PromiseLike<any>}
	 */
	function is_promise(value) {
		return (
			!!value &&
			(typeof value === 'object' || typeof value === 'function') &&
			typeof (/** @type {any} */ (value).then) === 'function'
		);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @returns {void} */
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop$1;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	/** @returns {{}} */
	function exclude_internal_props(props) {
		const result = {};
		for (const k in props) if (k[0] !== '$') result[k] = props[k];
		return result;
	}

	/** @returns {{}} */
	function compute_rest_props(props, keys) {
		const rest = {};
		keys = new Set(keys);
		for (const k in props) if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
		return rest;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now$1 = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop$1;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop$1(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append$1(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append$1(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text$1(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text$1(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text$1('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr$1(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}
	/**
	 * List of attributes that should always be set through the attr method,
	 * because updating them through the property setter doesn't work reliably.
	 * In the example of `width`/`height`, the problem is that the setter only
	 * accepts numeric values, but the attribute can also be set to a string like `50%`.
	 * If this list becomes too big, rethink this approach.
	 */
	const always_set_through_set_attribute = ['width', 'height'];

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {{ [x: string]: string }} attributes
	 * @returns {void}
	 */
	function set_attributes(node, attributes) {
		// @ts-ignore
		const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
		for (const key in attributes) {
			if (attributes[key] == null) {
				node.removeAttribute(key);
			} else if (key === 'style') {
				node.style.cssText = attributes[key];
			} else if (key === '__value') {
				/** @type {any} */ (node).value = node[key] = attributes[key];
			} else if (
				descriptors[key] &&
				descriptors[key].set &&
				always_set_through_set_attribute.indexOf(key) === -1
			) {
				node[key] = attributes[key];
			} else {
				attr$1(node, key, attributes[key]);
			}
		}
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {{ [x: string]: string }} attributes
	 * @returns {void}
	 */
	function set_svg_attributes(node, attributes) {
		for (const key in attributes) {
			attr$1(node, key, attributes[key]);
		}
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children$1(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * Schedules a callback to run immediately before the component is updated after any state change.
	 *
	 * The first time the callback runs will be before the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#beforeupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function beforeUpdate(fn) {
		get_current_component().$$.before_update.push(fn);
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function afterUpdate(fn) {
		get_current_component().$$.after_update.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	/**
	 * Associates an arbitrary `context` object with the current component and the specified `key`
	 * and returns that object. The context is then available to children of the component
	 * (including slotted content) with `getContext`.
	 *
	 * Like lifecycle functions, this must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#setcontext
	 * @template T
	 * @param {any} key
	 * @param {T} context
	 * @returns {T}
	 */
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
		return context;
	}

	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * @template T
	 * @param {any} key
	 * @returns {T}
	 */
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {Promise<void>} */
	function tick() {
		schedule_update();
		return resolved_promise;
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update$1(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update$1($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ start(): void; invalidate(): void; end(): void; }}
	 */
	function create_in_transition(node, fn, params) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'in' };
		let config = fn(node, params, options);
		let running = false;
		let animation_name;
		let task;
		let uid = 0;

		/**
		 * @returns {void} */
		function cleanup() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop$1,
				css
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
			tick(0, 1);
			const start_time = now$1() + delay;
			const end_time = start_time + duration;
			if (task) task.abort();
			running = true;
			add_render_callback(() => dispatch(node, true, 'start'));
			task = loop$1((now) => {
				if (running) {
					if (now >= end_time) {
						tick(1, 0);
						dispatch(node, true, 'end');
						cleanup();
						return (running = false);
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(t, 1 - t);
					}
				}
				return running;
			});
		}
		let started = false;
		return {
			start() {
				if (started) return;
				started = true;
				delete_rule(node);
				if (is_function(config)) {
					config = config(options);
					wait().then(go);
				} else {
					go();
				}
			},
			invalidate() {
				started = false;
			},
			end() {
				if (running) {
					cleanup();
					running = false;
				}
			}
		};
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ end(reset: any): void; }}
	 */
	function create_out_transition(node, fn, params) {
		/** @type {TransitionOptions} */
		const options = { direction: 'out' };
		let config = fn(node, params, options);
		let running = true;
		let animation_name;
		const group = outros;
		group.r += 1;
		/** @type {boolean} */
		let original_inert_value;

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop$1,
				css
			} = config || null_transition;

			if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

			const start_time = now$1() + delay;
			const end_time = start_time + duration;
			add_render_callback(() => dispatch(node, false, 'start'));

			if ('inert' in node) {
				original_inert_value = /** @type {HTMLElement} */ (node).inert;
				node.inert = true;
			}

			loop$1((now) => {
				if (running) {
					if (now >= end_time) {
						tick(0, 1);
						dispatch(node, false, 'end');
						if (!--group.r) {
							// this will result in `end()` being called,
							// so we don't need to clean up here
							run_all(group.c);
						}
						return false;
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(1 - t, t);
					}
				}
				return running;
			});
		}

		if (is_function(config)) {
			wait().then(() => {
				// @ts-ignore
				config = config(options);
				go();
			});
		} else {
			go();
		}

		return {
			end(reset) {
				if (reset && 'inert' in node) {
					node.inert = original_inert_value;
				}
				if (reset && config.tick) {
					config.tick(1, 0);
				}
				if (running) {
					if (animation_name) delete_rule(node, animation_name);
					running = false;
				}
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/**
	 * @template T
	 * @param {Promise<T>} promise
	 * @param {import('./private.js').PromiseInfo<T>} info
	 * @returns {boolean}
	 */
	function handle_promise(promise, info) {
		const token = (info.token = {});
		/**
		 * @param {import('./private.js').FragmentFactory} type
		 * @param {0 | 1 | 2} index
		 * @param {number} [key]
		 * @param {any} [value]
		 * @returns {void}
		 */
		function update(type, index, key, value) {
			if (info.token !== token) return;
			info.resolved = value;
			let child_ctx = info.ctx;
			if (key !== undefined) {
				child_ctx = child_ctx.slice();
				child_ctx[key] = value;
			}
			const block = type && (info.current = type)(child_ctx);
			let needs_flush = false;
			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							group_outros();
							transition_out(block, 1, 1, () => {
								if (info.blocks[i] === block) {
									info.blocks[i] = null;
								}
							});
							check_outros();
						}
					});
				} else {
					info.block.d(1);
				}
				block.c();
				transition_in(block, 1);
				block.m(info.mount(), info.anchor);
				needs_flush = true;
			}
			info.block = block;
			if (info.blocks) info.blocks[index] = block;
			if (needs_flush) {
				flush();
			}
		}
		if (is_promise(promise)) {
			const current_component = get_current_component();
			promise.then(
				(value) => {
					set_current_component(current_component);
					update(info.then, 1, info.value, value);
					set_current_component(null);
				},
				(error) => {
					set_current_component(current_component);
					update(info.catch, 2, info.error, error);
					set_current_component(null);
					if (!info.hasCatch) {
						throw error;
					}
				}
			);
			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}
			info.resolved = /** @type {T} */ (promise);
		}
	}

	/** @returns {void} */
	function update_await_block_branch(info, ctx, dirty) {
		const child_ctx = ctx.slice();
		const { resolved } = info;
		if (info.current === info.then) {
			child_ctx[info.value] = resolved;
		}
		if (info.current === info.catch) {
			child_ctx[info.error] = resolved;
		}
		info.block.p(child_ctx, dirty);
	}

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	// keyed each functions:

	/** @returns {void} */
	function destroy_block(block, lookup) {
		block.d(1);
		lookup.delete(block.key);
	}

	/** @returns {void} */
	function outro_and_destroy_block(block, lookup) {
		transition_out(block, 1, 1, () => {
			lookup.delete(block.key);
		});
	}

	/** @returns {any[]} */
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length;
		let n = list.length;
		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();
		const updates = [];
		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);
			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else if (dynamic) {
				// defer updates until all the DOM shuffling is done
				updates.push(() => block.p(child_ctx, dirty));
			}
			new_lookup.set(key, (new_blocks[i] = block));
			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set();
		const did_move = new Set();
		/** @returns {void} */
		function insert(block) {
			transition_in(block, 1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}
		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;
			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			} else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			} else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			} else if (did_move.has(old_key)) {
				o--;
			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);
			} else {
				will_move.add(old_key);
				o--;
			}
		}
		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}
		while (n) insert(new_blocks[n - 1]);
		run_all(updates);
		return new_blocks;
	}

	/** @returns {void} */
	function validate_each_keys(ctx, list, get_context, get_key) {
		const keys = new Map();
		for (let i = 0; i < list.length; i++) {
			const key = get_key(get_context(ctx, list, i));
			if (keys.has(key)) {
				let value = '';
				try {
					value = `with value '${String(key)}' `;
				} catch (e) {
					// can't stringify
				}
				throw new Error(
					`Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
					key
				)} and ${i} ${value}are duplicates`
				);
			}
			keys.set(key, i);
		}
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop$1,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children$1(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop$1;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop$1;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION$1 = '4.2.20';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION$1, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append$1(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr$1(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	function construct_svelte_component_dev(component, props) {
		const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
		try {
			const instance = new component(props);
			if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
				throw new Error(error_message);
			}
			return instance;
		} catch (err) {
			const { message } = err;
			if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
				throw new Error(error_message);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/**
	 * SSR Window 4.0.2
	 * Better handling for window object in SSR environment
	 * https://github.com/nolimits4web/ssr-window
	 *
	 * Copyright 2021, Vladimir Kharlampidi
	 *
	 * Licensed under MIT
	 *
	 * Released on: December 13, 2021
	 */
	/* eslint-disable no-param-reassign */
	function isObject$3(obj) {
	    return (obj !== null &&
	        typeof obj === 'object' &&
	        'constructor' in obj &&
	        obj.constructor === Object);
	}
	function extend$3(target = {}, src = {}) {
	    Object.keys(src).forEach((key) => {
	        if (typeof target[key] === 'undefined')
	            target[key] = src[key];
	        else if (isObject$3(src[key]) &&
	            isObject$3(target[key]) &&
	            Object.keys(src[key]).length > 0) {
	            extend$3(target[key], src[key]);
	        }
	    });
	}

	const ssrDocument = {
	    body: {},
	    addEventListener() { },
	    removeEventListener() { },
	    activeElement: {
	        blur() { },
	        nodeName: '',
	    },
	    querySelector() {
	        return null;
	    },
	    querySelectorAll() {
	        return [];
	    },
	    getElementById() {
	        return null;
	    },
	    createEvent() {
	        return {
	            initEvent() { },
	        };
	    },
	    createElement() {
	        return {
	            children: [],
	            childNodes: [],
	            style: {},
	            setAttribute() { },
	            getElementsByTagName() {
	                return [];
	            },
	        };
	    },
	    createElementNS() {
	        return {};
	    },
	    importNode() {
	        return null;
	    },
	    location: {
	        hash: '',
	        host: '',
	        hostname: '',
	        href: '',
	        origin: '',
	        pathname: '',
	        protocol: '',
	        search: '',
	    },
	};
	function getDocument() {
	    const doc = typeof document !== 'undefined' ? document : {};
	    extend$3(doc, ssrDocument);
	    return doc;
	}

	const ssrWindow = {
	    document: ssrDocument,
	    navigator: {
	        userAgent: '',
	    },
	    location: {
	        hash: '',
	        host: '',
	        hostname: '',
	        href: '',
	        origin: '',
	        pathname: '',
	        protocol: '',
	        search: '',
	    },
	    history: {
	        replaceState() { },
	        pushState() { },
	        go() { },
	        back() { },
	    },
	    CustomEvent: function CustomEvent() {
	        return this;
	    },
	    addEventListener() { },
	    removeEventListener() { },
	    getComputedStyle() {
	        return {
	            getPropertyValue() {
	                return '';
	            },
	        };
	    },
	    Image() { },
	    Date() { },
	    screen: {},
	    setTimeout() { },
	    clearTimeout() { },
	    matchMedia() {
	        return {};
	    },
	    requestAnimationFrame(callback) {
	        if (typeof setTimeout === 'undefined') {
	            callback();
	            return null;
	        }
	        return setTimeout(callback, 0);
	    },
	    cancelAnimationFrame(id) {
	        if (typeof setTimeout === 'undefined') {
	            return;
	        }
	        clearTimeout(id);
	    },
	};
	function getWindow() {
	    const win = typeof window !== 'undefined' ? window : {};
	    extend$3(win, ssrWindow);
	    return win;
	}

	/**
	 * Dom7 4.0.6
	 * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
	 * https://framework7.io/docs/dom7.html
	 *
	 * Copyright 2023, Vladimir Kharlampidi
	 *
	 * Licensed under MIT
	 *
	 * Released on: February 2, 2023
	 */

	/* eslint-disable no-proto */
	function makeReactive(obj) {
	  const proto = obj.__proto__;
	  Object.defineProperty(obj, '__proto__', {
	    get() {
	      return proto;
	    },

	    set(value) {
	      proto.__proto__ = value;
	    }

	  });
	}

	class Dom7 extends Array {
	  constructor(items) {
	    if (typeof items === 'number') {
	      super(items);
	    } else {
	      super(...(items || []));
	      makeReactive(this);
	    }
	  }

	}

	function arrayFlat(arr = []) {
	  const res = [];
	  arr.forEach(el => {
	    if (Array.isArray(el)) {
	      res.push(...arrayFlat(el));
	    } else {
	      res.push(el);
	    }
	  });
	  return res;
	}
	function arrayFilter(arr, callback) {
	  return Array.prototype.filter.call(arr, callback);
	}
	function arrayUnique(arr) {
	  const uniqueArray = [];

	  for (let i = 0; i < arr.length; i += 1) {
	    if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
	  }

	  return uniqueArray;
	}

	// eslint-disable-next-line

	function qsa(selector, context) {
	  if (typeof selector !== 'string') {
	    return [selector];
	  }

	  const a = [];
	  const res = context.querySelectorAll(selector);

	  for (let i = 0; i < res.length; i += 1) {
	    a.push(res[i]);
	  }

	  return a;
	}

	function $(selector, context) {
	  const window = getWindow();
	  const document = getDocument();
	  let arr = [];

	  if (!context && selector instanceof Dom7) {
	    return selector;
	  }

	  if (!selector) {
	    return new Dom7(arr);
	  }

	  if (typeof selector === 'string') {
	    const html = selector.trim();

	    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
	      let toCreate = 'div';
	      if (html.indexOf('<li') === 0) toCreate = 'ul';
	      if (html.indexOf('<tr') === 0) toCreate = 'tbody';
	      if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
	      if (html.indexOf('<tbody') === 0) toCreate = 'table';
	      if (html.indexOf('<option') === 0) toCreate = 'select';
	      const tempParent = document.createElement(toCreate);
	      tempParent.innerHTML = html;

	      for (let i = 0; i < tempParent.childNodes.length; i += 1) {
	        arr.push(tempParent.childNodes[i]);
	      }
	    } else {
	      arr = qsa(selector.trim(), context || document);
	    } // arr = qsa(selector, document);

	  } else if (selector.nodeType || selector === window || selector === document) {
	    arr.push(selector);
	  } else if (Array.isArray(selector)) {
	    if (selector instanceof Dom7) return selector;
	    arr = selector;
	  }

	  return new Dom7(arrayUnique(arr));
	}

	$.fn = Dom7.prototype;

	// eslint-disable-next-line

	function addClass(...classes) {
	  const classNames = arrayFlat(classes.map(c => c.split(' ')));
	  this.forEach(el => {
	    el.classList.add(...classNames);
	  });
	  return this;
	}

	function removeClass(...classes) {
	  const classNames = arrayFlat(classes.map(c => c.split(' ')));
	  this.forEach(el => {
	    el.classList.remove(...classNames);
	  });
	  return this;
	}

	function toggleClass(...classes) {
	  const classNames = arrayFlat(classes.map(c => c.split(' ')));
	  this.forEach(el => {
	    classNames.forEach(className => {
	      el.classList.toggle(className);
	    });
	  });
	}

	function hasClass(...classes) {
	  const classNames = arrayFlat(classes.map(c => c.split(' ')));
	  return arrayFilter(this, el => {
	    return classNames.filter(className => el.classList.contains(className)).length > 0;
	  }).length > 0;
	}

	function attr(attrs, value) {
	  if (arguments.length === 1 && typeof attrs === 'string') {
	    // Get attr
	    if (this[0]) return this[0].getAttribute(attrs);
	    return undefined;
	  } // Set attrs


	  for (let i = 0; i < this.length; i += 1) {
	    if (arguments.length === 2) {
	      // String
	      this[i].setAttribute(attrs, value);
	    } else {
	      // Object
	      for (const attrName in attrs) {
	        this[i][attrName] = attrs[attrName];
	        this[i].setAttribute(attrName, attrs[attrName]);
	      }
	    }
	  }

	  return this;
	}

	function removeAttr(attr) {
	  for (let i = 0; i < this.length; i += 1) {
	    this[i].removeAttribute(attr);
	  }

	  return this;
	}

	function transform(transform) {
	  for (let i = 0; i < this.length; i += 1) {
	    this[i].style.transform = transform;
	  }

	  return this;
	}

	function transition$1(duration) {
	  for (let i = 0; i < this.length; i += 1) {
	    this[i].style.transitionDuration = typeof duration !== 'string' ? `${duration}ms` : duration;
	  }

	  return this;
	}

	function on(...args) {
	  let [eventType, targetSelector, listener, capture] = args;

	  if (typeof args[1] === 'function') {
	    [eventType, listener, capture] = args;
	    targetSelector = undefined;
	  }

	  if (!capture) capture = false;

	  function handleLiveEvent(e) {
	    const target = e.target;
	    if (!target) return;
	    const eventData = e.target.dom7EventData || [];

	    if (eventData.indexOf(e) < 0) {
	      eventData.unshift(e);
	    }

	    if ($(target).is(targetSelector)) listener.apply(target, eventData);else {
	      const parents = $(target).parents(); // eslint-disable-line

	      for (let k = 0; k < parents.length; k += 1) {
	        if ($(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
	      }
	    }
	  }

	  function handleEvent(e) {
	    const eventData = e && e.target ? e.target.dom7EventData || [] : [];

	    if (eventData.indexOf(e) < 0) {
	      eventData.unshift(e);
	    }

	    listener.apply(this, eventData);
	  }

	  const events = eventType.split(' ');
	  let j;

	  for (let i = 0; i < this.length; i += 1) {
	    const el = this[i];

	    if (!targetSelector) {
	      for (j = 0; j < events.length; j += 1) {
	        const event = events[j];
	        if (!el.dom7Listeners) el.dom7Listeners = {};
	        if (!el.dom7Listeners[event]) el.dom7Listeners[event] = [];
	        el.dom7Listeners[event].push({
	          listener,
	          proxyListener: handleEvent
	        });
	        el.addEventListener(event, handleEvent, capture);
	      }
	    } else {
	      // Live events
	      for (j = 0; j < events.length; j += 1) {
	        const event = events[j];
	        if (!el.dom7LiveListeners) el.dom7LiveListeners = {};
	        if (!el.dom7LiveListeners[event]) el.dom7LiveListeners[event] = [];
	        el.dom7LiveListeners[event].push({
	          listener,
	          proxyListener: handleLiveEvent
	        });
	        el.addEventListener(event, handleLiveEvent, capture);
	      }
	    }
	  }

	  return this;
	}

	function off(...args) {
	  let [eventType, targetSelector, listener, capture] = args;

	  if (typeof args[1] === 'function') {
	    [eventType, listener, capture] = args;
	    targetSelector = undefined;
	  }

	  if (!capture) capture = false;
	  const events = eventType.split(' ');

	  for (let i = 0; i < events.length; i += 1) {
	    const event = events[i];

	    for (let j = 0; j < this.length; j += 1) {
	      const el = this[j];
	      let handlers;

	      if (!targetSelector && el.dom7Listeners) {
	        handlers = el.dom7Listeners[event];
	      } else if (targetSelector && el.dom7LiveListeners) {
	        handlers = el.dom7LiveListeners[event];
	      }

	      if (handlers && handlers.length) {
	        for (let k = handlers.length - 1; k >= 0; k -= 1) {
	          const handler = handlers[k];

	          if (listener && handler.listener === listener) {
	            el.removeEventListener(event, handler.proxyListener, capture);
	            handlers.splice(k, 1);
	          } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
	            el.removeEventListener(event, handler.proxyListener, capture);
	            handlers.splice(k, 1);
	          } else if (!listener) {
	            el.removeEventListener(event, handler.proxyListener, capture);
	            handlers.splice(k, 1);
	          }
	        }
	      }
	    }
	  }

	  return this;
	}

	function trigger(...args) {
	  const window = getWindow();
	  const events = args[0].split(' ');
	  const eventData = args[1];

	  for (let i = 0; i < events.length; i += 1) {
	    const event = events[i];

	    for (let j = 0; j < this.length; j += 1) {
	      const el = this[j];

	      if (window.CustomEvent) {
	        const evt = new window.CustomEvent(event, {
	          detail: eventData,
	          bubbles: true,
	          cancelable: true
	        });
	        el.dom7EventData = args.filter((data, dataIndex) => dataIndex > 0);
	        el.dispatchEvent(evt);
	        el.dom7EventData = [];
	        delete el.dom7EventData;
	      }
	    }
	  }

	  return this;
	}

	function transitionEnd$1(callback) {
	  const dom = this;

	  function fireCallBack(e) {
	    if (e.target !== this) return;
	    callback.call(this, e);
	    dom.off('transitionend', fireCallBack);
	  }

	  if (callback) {
	    dom.on('transitionend', fireCallBack);
	  }

	  return this;
	}

	function outerWidth(includeMargins) {
	  if (this.length > 0) {
	    if (includeMargins) {
	      const styles = this.styles();
	      return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
	    }

	    return this[0].offsetWidth;
	  }

	  return null;
	}

	function outerHeight(includeMargins) {
	  if (this.length > 0) {
	    if (includeMargins) {
	      const styles = this.styles();
	      return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
	    }

	    return this[0].offsetHeight;
	  }

	  return null;
	}

	function offset() {
	  if (this.length > 0) {
	    const window = getWindow();
	    const document = getDocument();
	    const el = this[0];
	    const box = el.getBoundingClientRect();
	    const body = document.body;
	    const clientTop = el.clientTop || body.clientTop || 0;
	    const clientLeft = el.clientLeft || body.clientLeft || 0;
	    const scrollTop = el === window ? window.scrollY : el.scrollTop;
	    const scrollLeft = el === window ? window.scrollX : el.scrollLeft;
	    return {
	      top: box.top + scrollTop - clientTop,
	      left: box.left + scrollLeft - clientLeft
	    };
	  }

	  return null;
	}

	function styles() {
	  const window = getWindow();
	  if (this[0]) return window.getComputedStyle(this[0], null);
	  return {};
	}

	function css(props, value) {
	  const window = getWindow();
	  let i;

	  if (arguments.length === 1) {
	    if (typeof props === 'string') {
	      // .css('width')
	      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
	    } else {
	      // .css({ width: '100px' })
	      for (i = 0; i < this.length; i += 1) {
	        for (const prop in props) {
	          this[i].style[prop] = props[prop];
	        }
	      }

	      return this;
	    }
	  }

	  if (arguments.length === 2 && typeof props === 'string') {
	    // .css('width', '100px')
	    for (i = 0; i < this.length; i += 1) {
	      this[i].style[props] = value;
	    }

	    return this;
	  }

	  return this;
	}

	function each(callback) {
	  if (!callback) return this;
	  this.forEach((el, index) => {
	    callback.apply(el, [el, index]);
	  });
	  return this;
	}

	function filter(callback) {
	  const result = arrayFilter(this, callback);
	  return $(result);
	}

	function html(html) {
	  if (typeof html === 'undefined') {
	    return this[0] ? this[0].innerHTML : null;
	  }

	  for (let i = 0; i < this.length; i += 1) {
	    this[i].innerHTML = html;
	  }

	  return this;
	}

	function text(text) {
	  if (typeof text === 'undefined') {
	    return this[0] ? this[0].textContent.trim() : null;
	  }

	  for (let i = 0; i < this.length; i += 1) {
	    this[i].textContent = text;
	  }

	  return this;
	}

	function is(selector) {
	  const window = getWindow();
	  const document = getDocument();
	  const el = this[0];
	  let compareWith;
	  let i;
	  if (!el || typeof selector === 'undefined') return false;

	  if (typeof selector === 'string') {
	    if (el.matches) return el.matches(selector);
	    if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
	    if (el.msMatchesSelector) return el.msMatchesSelector(selector);
	    compareWith = $(selector);

	    for (i = 0; i < compareWith.length; i += 1) {
	      if (compareWith[i] === el) return true;
	    }

	    return false;
	  }

	  if (selector === document) {
	    return el === document;
	  }

	  if (selector === window) {
	    return el === window;
	  }

	  if (selector.nodeType || selector instanceof Dom7) {
	    compareWith = selector.nodeType ? [selector] : selector;

	    for (i = 0; i < compareWith.length; i += 1) {
	      if (compareWith[i] === el) return true;
	    }

	    return false;
	  }

	  return false;
	}

	function index() {
	  let child = this[0];
	  let i;

	  if (child) {
	    i = 0; // eslint-disable-next-line

	    while ((child = child.previousSibling) !== null) {
	      if (child.nodeType === 1) i += 1;
	    }

	    return i;
	  }

	  return undefined;
	}

	function eq(index) {
	  if (typeof index === 'undefined') return this;
	  const length = this.length;

	  if (index > length - 1) {
	    return $([]);
	  }

	  if (index < 0) {
	    const returnIndex = length + index;
	    if (returnIndex < 0) return $([]);
	    return $([this[returnIndex]]);
	  }

	  return $([this[index]]);
	}

	function append(...els) {
	  let newChild;
	  const document = getDocument();

	  for (let k = 0; k < els.length; k += 1) {
	    newChild = els[k];

	    for (let i = 0; i < this.length; i += 1) {
	      if (typeof newChild === 'string') {
	        const tempDiv = document.createElement('div');
	        tempDiv.innerHTML = newChild;

	        while (tempDiv.firstChild) {
	          this[i].appendChild(tempDiv.firstChild);
	        }
	      } else if (newChild instanceof Dom7) {
	        for (let j = 0; j < newChild.length; j += 1) {
	          this[i].appendChild(newChild[j]);
	        }
	      } else {
	        this[i].appendChild(newChild);
	      }
	    }
	  }

	  return this;
	}

	function prepend(newChild) {
	  const document = getDocument();
	  let i;
	  let j;

	  for (i = 0; i < this.length; i += 1) {
	    if (typeof newChild === 'string') {
	      const tempDiv = document.createElement('div');
	      tempDiv.innerHTML = newChild;

	      for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
	        this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
	      }
	    } else if (newChild instanceof Dom7) {
	      for (j = 0; j < newChild.length; j += 1) {
	        this[i].insertBefore(newChild[j], this[i].childNodes[0]);
	      }
	    } else {
	      this[i].insertBefore(newChild, this[i].childNodes[0]);
	    }
	  }

	  return this;
	}

	function next(selector) {
	  if (this.length > 0) {
	    if (selector) {
	      if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
	        return $([this[0].nextElementSibling]);
	      }

	      return $([]);
	    }

	    if (this[0].nextElementSibling) return $([this[0].nextElementSibling]);
	    return $([]);
	  }

	  return $([]);
	}

	function nextAll(selector) {
	  const nextEls = [];
	  let el = this[0];
	  if (!el) return $([]);

	  while (el.nextElementSibling) {
	    const next = el.nextElementSibling; // eslint-disable-line

	    if (selector) {
	      if ($(next).is(selector)) nextEls.push(next);
	    } else nextEls.push(next);

	    el = next;
	  }

	  return $(nextEls);
	}

	function prev(selector) {
	  if (this.length > 0) {
	    const el = this[0];

	    if (selector) {
	      if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
	        return $([el.previousElementSibling]);
	      }

	      return $([]);
	    }

	    if (el.previousElementSibling) return $([el.previousElementSibling]);
	    return $([]);
	  }

	  return $([]);
	}

	function prevAll(selector) {
	  const prevEls = [];
	  let el = this[0];
	  if (!el) return $([]);

	  while (el.previousElementSibling) {
	    const prev = el.previousElementSibling; // eslint-disable-line

	    if (selector) {
	      if ($(prev).is(selector)) prevEls.push(prev);
	    } else prevEls.push(prev);

	    el = prev;
	  }

	  return $(prevEls);
	}

	function parent(selector) {
	  const parents = []; // eslint-disable-line

	  for (let i = 0; i < this.length; i += 1) {
	    if (this[i].parentNode !== null) {
	      if (selector) {
	        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
	      } else {
	        parents.push(this[i].parentNode);
	      }
	    }
	  }

	  return $(parents);
	}

	function parents(selector) {
	  const parents = []; // eslint-disable-line

	  for (let i = 0; i < this.length; i += 1) {
	    let parent = this[i].parentNode; // eslint-disable-line

	    while (parent) {
	      if (selector) {
	        if ($(parent).is(selector)) parents.push(parent);
	      } else {
	        parents.push(parent);
	      }

	      parent = parent.parentNode;
	    }
	  }

	  return $(parents);
	}

	function closest(selector) {
	  let closest = this; // eslint-disable-line

	  if (typeof selector === 'undefined') {
	    return $([]);
	  }

	  if (!closest.is(selector)) {
	    closest = closest.parents(selector).eq(0);
	  }

	  return closest;
	}

	function find(selector) {
	  const foundElements = [];

	  for (let i = 0; i < this.length; i += 1) {
	    const found = this[i].querySelectorAll(selector);

	    for (let j = 0; j < found.length; j += 1) {
	      foundElements.push(found[j]);
	    }
	  }

	  return $(foundElements);
	}

	function children(selector) {
	  const children = []; // eslint-disable-line

	  for (let i = 0; i < this.length; i += 1) {
	    const childNodes = this[i].children;

	    for (let j = 0; j < childNodes.length; j += 1) {
	      if (!selector || $(childNodes[j]).is(selector)) {
	        children.push(childNodes[j]);
	      }
	    }
	  }

	  return $(children);
	}

	function remove() {
	  for (let i = 0; i < this.length; i += 1) {
	    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
	  }

	  return this;
	}

	const Methods = {
	  addClass,
	  removeClass,
	  hasClass,
	  toggleClass,
	  attr,
	  removeAttr,
	  transform,
	  transition: transition$1,
	  on,
	  off,
	  trigger,
	  transitionEnd: transitionEnd$1,
	  outerWidth,
	  outerHeight,
	  styles,
	  offset,
	  css,
	  each,
	  html,
	  text,
	  is,
	  index,
	  eq,
	  append,
	  prepend,
	  next,
	  nextAll,
	  prev,
	  prevAll,
	  parent,
	  parents,
	  closest,
	  find,
	  children,
	  filter,
	  remove
	};
	Object.keys(Methods).forEach(methodName => {
	  Object.defineProperty($.fn, methodName, {
	    value: Methods[methodName],
	    writable: true
	  });
	});

	function deleteProps(obj) {
	  const object = obj;
	  Object.keys(object).forEach(key => {
	    try {
	      object[key] = null;
	    } catch (e) {// no getter for object
	    }

	    try {
	      delete object[key];
	    } catch (e) {// something got wrong
	    }
	  });
	}

	function nextTick(callback, delay) {
	  if (delay === void 0) {
	    delay = 0;
	  }

	  return setTimeout(callback, delay);
	}

	function now() {
	  return Date.now();
	}

	function getComputedStyle$1(el) {
	  const window = getWindow();
	  let style;

	  if (window.getComputedStyle) {
	    style = window.getComputedStyle(el, null);
	  }

	  if (!style && el.currentStyle) {
	    style = el.currentStyle;
	  }

	  if (!style) {
	    style = el.style;
	  }

	  return style;
	}

	function getTranslate(el, axis) {
	  if (axis === void 0) {
	    axis = 'x';
	  }

	  const window = getWindow();
	  let matrix;
	  let curTransform;
	  let transformMatrix;
	  const curStyle = getComputedStyle$1(el);

	  if (window.WebKitCSSMatrix) {
	    curTransform = curStyle.transform || curStyle.webkitTransform;

	    if (curTransform.split(',').length > 6) {
	      curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
	    } // Some old versions of Webkit choke when 'none' is passed; pass
	    // empty string instead in this case


	    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
	  } else {
	    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
	    matrix = transformMatrix.toString().split(',');
	  }

	  if (axis === 'x') {
	    // Latest Chrome and webkits Fix
	    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; // Crazy IE10 Matrix
	    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); // Normal Browsers
	    else curTransform = parseFloat(matrix[4]);
	  }

	  if (axis === 'y') {
	    // Latest Chrome and webkits Fix
	    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; // Crazy IE10 Matrix
	    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); // Normal Browsers
	    else curTransform = parseFloat(matrix[5]);
	  }

	  return curTransform || 0;
	}

	function isObject$2(o) {
	  return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
	}

	function isNode(node) {
	  // eslint-disable-next-line
	  if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
	    return node instanceof HTMLElement;
	  }

	  return node && (node.nodeType === 1 || node.nodeType === 11);
	}

	function extend$2() {
	  const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
	  const noExtend = ['__proto__', 'constructor', 'prototype'];

	  for (let i = 1; i < arguments.length; i += 1) {
	    const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];

	    if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
	      const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);

	      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
	        const nextKey = keysArray[nextIndex];
	        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

	        if (desc !== undefined && desc.enumerable) {
	          if (isObject$2(to[nextKey]) && isObject$2(nextSource[nextKey])) {
	            if (nextSource[nextKey].__swiper__) {
	              to[nextKey] = nextSource[nextKey];
	            } else {
	              extend$2(to[nextKey], nextSource[nextKey]);
	            }
	          } else if (!isObject$2(to[nextKey]) && isObject$2(nextSource[nextKey])) {
	            to[nextKey] = {};

	            if (nextSource[nextKey].__swiper__) {
	              to[nextKey] = nextSource[nextKey];
	            } else {
	              extend$2(to[nextKey], nextSource[nextKey]);
	            }
	          } else {
	            to[nextKey] = nextSource[nextKey];
	          }
	        }
	      }
	    }
	  }

	  return to;
	}

	function setCSSProperty(el, varName, varValue) {
	  el.style.setProperty(varName, varValue);
	}

	function animateCSSModeScroll(_ref) {
	  let {
	    swiper,
	    targetPosition,
	    side
	  } = _ref;
	  const window = getWindow();
	  const startPosition = -swiper.translate;
	  let startTime = null;
	  let time;
	  const duration = swiper.params.speed;
	  swiper.wrapperEl.style.scrollSnapType = 'none';
	  window.cancelAnimationFrame(swiper.cssModeFrameID);
	  const dir = targetPosition > startPosition ? 'next' : 'prev';

	  const isOutOfBound = (current, target) => {
	    return dir === 'next' && current >= target || dir === 'prev' && current <= target;
	  };

	  const animate = () => {
	    time = new Date().getTime();

	    if (startTime === null) {
	      startTime = time;
	    }

	    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
	    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
	    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);

	    if (isOutOfBound(currentPosition, targetPosition)) {
	      currentPosition = targetPosition;
	    }

	    swiper.wrapperEl.scrollTo({
	      [side]: currentPosition
	    });

	    if (isOutOfBound(currentPosition, targetPosition)) {
	      swiper.wrapperEl.style.overflow = 'hidden';
	      swiper.wrapperEl.style.scrollSnapType = '';
	      setTimeout(() => {
	        swiper.wrapperEl.style.overflow = '';
	        swiper.wrapperEl.scrollTo({
	          [side]: currentPosition
	        });
	      });
	      window.cancelAnimationFrame(swiper.cssModeFrameID);
	      return;
	    }

	    swiper.cssModeFrameID = window.requestAnimationFrame(animate);
	  };

	  animate();
	}

	let support;

	function calcSupport() {
	  const window = getWindow();
	  const document = getDocument();
	  return {
	    smoothScroll: document.documentElement && 'scrollBehavior' in document.documentElement.style,
	    touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch),
	    passiveListener: function checkPassiveListener() {
	      let supportsPassive = false;

	      try {
	        const opts = Object.defineProperty({}, 'passive', {
	          // eslint-disable-next-line
	          get() {
	            supportsPassive = true;
	          }

	        });
	        window.addEventListener('testPassiveListener', null, opts);
	      } catch (e) {// No support
	      }

	      return supportsPassive;
	    }(),
	    gestures: function checkGestures() {
	      return 'ongesturestart' in window;
	    }()
	  };
	}

	function getSupport() {
	  if (!support) {
	    support = calcSupport();
	  }

	  return support;
	}

	let deviceCached;

	function calcDevice(_temp) {
	  let {
	    userAgent
	  } = _temp === void 0 ? {} : _temp;
	  const support = getSupport();
	  const window = getWindow();
	  const platform = window.navigator.platform;
	  const ua = userAgent || window.navigator.userAgent;
	  const device = {
	    ios: false,
	    android: false
	  };
	  const screenWidth = window.screen.width;
	  const screenHeight = window.screen.height;
	  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line

	  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
	  const windows = platform === 'Win32';
	  let macos = platform === 'MacIntel'; // iPadOs 13 fix

	  const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];

	  if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
	    ipad = ua.match(/(Version)\/([\d.]+)/);
	    if (!ipad) ipad = [0, 1, '13_0_0'];
	    macos = false;
	  } // Android


	  if (android && !windows) {
	    device.os = 'android';
	    device.android = true;
	  }

	  if (ipad || iphone || ipod) {
	    device.os = 'ios';
	    device.ios = true;
	  } // Export object


	  return device;
	}

	function getDevice(overrides) {
	  if (overrides === void 0) {
	    overrides = {};
	  }

	  if (!deviceCached) {
	    deviceCached = calcDevice(overrides);
	  }

	  return deviceCached;
	}

	let browser;

	function calcBrowser() {
	  const window = getWindow();

	  function isSafari() {
	    const ua = window.navigator.userAgent.toLowerCase();
	    return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
	  }

	  return {
	    isSafari: isSafari(),
	    isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent)
	  };
	}

	function getBrowser() {
	  if (!browser) {
	    browser = calcBrowser();
	  }

	  return browser;
	}

	function Resize(_ref) {
	  let {
	    swiper,
	    on,
	    emit
	  } = _ref;
	  const window = getWindow();
	  let observer = null;
	  let animationFrame = null;

	  const resizeHandler = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    emit('beforeResize');
	    emit('resize');
	  };

	  const createObserver = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    observer = new ResizeObserver(entries => {
	      animationFrame = window.requestAnimationFrame(() => {
	        const {
	          width,
	          height
	        } = swiper;
	        let newWidth = width;
	        let newHeight = height;
	        entries.forEach(_ref2 => {
	          let {
	            contentBoxSize,
	            contentRect,
	            target
	          } = _ref2;
	          if (target && target !== swiper.el) return;
	          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
	          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
	        });

	        if (newWidth !== width || newHeight !== height) {
	          resizeHandler();
	        }
	      });
	    });
	    observer.observe(swiper.el);
	  };

	  const removeObserver = () => {
	    if (animationFrame) {
	      window.cancelAnimationFrame(animationFrame);
	    }

	    if (observer && observer.unobserve && swiper.el) {
	      observer.unobserve(swiper.el);
	      observer = null;
	    }
	  };

	  const orientationChangeHandler = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    emit('orientationchange');
	  };

	  on('init', () => {
	    if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
	      createObserver();
	      return;
	    }

	    window.addEventListener('resize', resizeHandler);
	    window.addEventListener('orientationchange', orientationChangeHandler);
	  });
	  on('destroy', () => {
	    removeObserver();
	    window.removeEventListener('resize', resizeHandler);
	    window.removeEventListener('orientationchange', orientationChangeHandler);
	  });
	}

	function Observer(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  const observers = [];
	  const window = getWindow();

	  const attach = function (target, options) {
	    if (options === void 0) {
	      options = {};
	    }

	    const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
	    const observer = new ObserverFunc(mutations => {
	      // The observerUpdate event should only be triggered
	      // once despite the number of mutations.  Additional
	      // triggers are redundant and are very costly
	      if (mutations.length === 1) {
	        emit('observerUpdate', mutations[0]);
	        return;
	      }

	      const observerUpdate = function observerUpdate() {
	        emit('observerUpdate', mutations[0]);
	      };

	      if (window.requestAnimationFrame) {
	        window.requestAnimationFrame(observerUpdate);
	      } else {
	        window.setTimeout(observerUpdate, 0);
	      }
	    });
	    observer.observe(target, {
	      attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
	      childList: typeof options.childList === 'undefined' ? true : options.childList,
	      characterData: typeof options.characterData === 'undefined' ? true : options.characterData
	    });
	    observers.push(observer);
	  };

	  const init = () => {
	    if (!swiper.params.observer) return;

	    if (swiper.params.observeParents) {
	      const containerParents = swiper.$el.parents();

	      for (let i = 0; i < containerParents.length; i += 1) {
	        attach(containerParents[i]);
	      }
	    } // Observe container


	    attach(swiper.$el[0], {
	      childList: swiper.params.observeSlideChildren
	    }); // Observe wrapper

	    attach(swiper.$wrapperEl[0], {
	      attributes: false
	    });
	  };

	  const destroy = () => {
	    observers.forEach(observer => {
	      observer.disconnect();
	    });
	    observers.splice(0, observers.length);
	  };

	  extendParams({
	    observer: false,
	    observeParents: false,
	    observeSlideChildren: false
	  });
	  on('init', init);
	  on('destroy', destroy);
	}

	/* eslint-disable no-underscore-dangle */
	var eventsEmitter = {
	  on(events, handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;
	    const method = priority ? 'unshift' : 'push';
	    events.split(' ').forEach(event => {
	      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
	      self.eventsListeners[event][method](handler);
	    });
	    return self;
	  },

	  once(events, handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;

	    function onceHandler() {
	      self.off(events, onceHandler);

	      if (onceHandler.__emitterProxy) {
	        delete onceHandler.__emitterProxy;
	      }

	      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      handler.apply(self, args);
	    }

	    onceHandler.__emitterProxy = handler;
	    return self.on(events, onceHandler, priority);
	  },

	  onAny(handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;
	    const method = priority ? 'unshift' : 'push';

	    if (self.eventsAnyListeners.indexOf(handler) < 0) {
	      self.eventsAnyListeners[method](handler);
	    }

	    return self;
	  },

	  offAny(handler) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsAnyListeners) return self;
	    const index = self.eventsAnyListeners.indexOf(handler);

	    if (index >= 0) {
	      self.eventsAnyListeners.splice(index, 1);
	    }

	    return self;
	  },

	  off(events, handler) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsListeners) return self;
	    events.split(' ').forEach(event => {
	      if (typeof handler === 'undefined') {
	        self.eventsListeners[event] = [];
	      } else if (self.eventsListeners[event]) {
	        self.eventsListeners[event].forEach((eventHandler, index) => {
	          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
	            self.eventsListeners[event].splice(index, 1);
	          }
	        });
	      }
	    });
	    return self;
	  },

	  emit() {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsListeners) return self;
	    let events;
	    let data;
	    let context;

	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
	      events = args[0];
	      data = args.slice(1, args.length);
	      context = self;
	    } else {
	      events = args[0].events;
	      data = args[0].data;
	      context = args[0].context || self;
	    }

	    data.unshift(context);
	    const eventsArray = Array.isArray(events) ? events : events.split(' ');
	    eventsArray.forEach(event => {
	      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
	        self.eventsAnyListeners.forEach(eventHandler => {
	          eventHandler.apply(context, [event, ...data]);
	        });
	      }

	      if (self.eventsListeners && self.eventsListeners[event]) {
	        self.eventsListeners[event].forEach(eventHandler => {
	          eventHandler.apply(context, data);
	        });
	      }
	    });
	    return self;
	  }

	};

	function updateSize() {
	  const swiper = this;
	  let width;
	  let height;
	  const $el = swiper.$el;

	  if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
	    width = swiper.params.width;
	  } else {
	    width = $el[0].clientWidth;
	  }

	  if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
	    height = swiper.params.height;
	  } else {
	    height = $el[0].clientHeight;
	  }

	  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
	    return;
	  } // Subtract paddings


	  width = width - parseInt($el.css('padding-left') || 0, 10) - parseInt($el.css('padding-right') || 0, 10);
	  height = height - parseInt($el.css('padding-top') || 0, 10) - parseInt($el.css('padding-bottom') || 0, 10);
	  if (Number.isNaN(width)) width = 0;
	  if (Number.isNaN(height)) height = 0;
	  Object.assign(swiper, {
	    width,
	    height,
	    size: swiper.isHorizontal() ? width : height
	  });
	}

	function updateSlides() {
	  const swiper = this;

	  function getDirectionLabel(property) {
	    if (swiper.isHorizontal()) {
	      return property;
	    } // prettier-ignore


	    return {
	      'width': 'height',
	      'margin-top': 'margin-left',
	      'margin-bottom ': 'margin-right',
	      'margin-left': 'margin-top',
	      'margin-right': 'margin-bottom',
	      'padding-left': 'padding-top',
	      'padding-right': 'padding-bottom',
	      'marginRight': 'marginBottom'
	    }[property];
	  }

	  function getDirectionPropertyValue(node, label) {
	    return parseFloat(node.getPropertyValue(getDirectionLabel(label)) || 0);
	  }

	  const params = swiper.params;
	  const {
	    $wrapperEl,
	    size: swiperSize,
	    rtlTranslate: rtl,
	    wrongRTL
	  } = swiper;
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
	  const slides = $wrapperEl.children(`.${swiper.params.slideClass}`);
	  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
	  let snapGrid = [];
	  const slidesGrid = [];
	  const slidesSizesGrid = [];
	  let offsetBefore = params.slidesOffsetBefore;

	  if (typeof offsetBefore === 'function') {
	    offsetBefore = params.slidesOffsetBefore.call(swiper);
	  }

	  let offsetAfter = params.slidesOffsetAfter;

	  if (typeof offsetAfter === 'function') {
	    offsetAfter = params.slidesOffsetAfter.call(swiper);
	  }

	  const previousSnapGridLength = swiper.snapGrid.length;
	  const previousSlidesGridLength = swiper.slidesGrid.length;
	  let spaceBetween = params.spaceBetween;
	  let slidePosition = -offsetBefore;
	  let prevSlideSize = 0;
	  let index = 0;

	  if (typeof swiperSize === 'undefined') {
	    return;
	  }

	  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
	    spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
	  }

	  swiper.virtualSize = -spaceBetween; // reset margins

	  if (rtl) slides.css({
	    marginLeft: '',
	    marginBottom: '',
	    marginTop: ''
	  });else slides.css({
	    marginRight: '',
	    marginBottom: '',
	    marginTop: ''
	  }); // reset cssMode offsets

	  if (params.centeredSlides && params.cssMode) {
	    setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', '');
	    setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', '');
	  }

	  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;

	  if (gridEnabled) {
	    swiper.grid.initSlides(slidesLength);
	  } // Calc slides


	  let slideSize;
	  const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
	    return typeof params.breakpoints[key].slidesPerView !== 'undefined';
	  }).length > 0;

	  for (let i = 0; i < slidesLength; i += 1) {
	    slideSize = 0;
	    const slide = slides.eq(i);

	    if (gridEnabled) {
	      swiper.grid.updateSlide(i, slide, slidesLength, getDirectionLabel);
	    }

	    if (slide.css('display') === 'none') continue; // eslint-disable-line

	    if (params.slidesPerView === 'auto') {
	      if (shouldResetSlideSize) {
	        slides[i].style[getDirectionLabel('width')] = ``;
	      }

	      const slideStyles = getComputedStyle(slide[0]);
	      const currentTransform = slide[0].style.transform;
	      const currentWebKitTransform = slide[0].style.webkitTransform;

	      if (currentTransform) {
	        slide[0].style.transform = 'none';
	      }

	      if (currentWebKitTransform) {
	        slide[0].style.webkitTransform = 'none';
	      }

	      if (params.roundLengths) {
	        slideSize = swiper.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
	      } else {
	        // eslint-disable-next-line
	        const width = getDirectionPropertyValue(slideStyles, 'width');
	        const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
	        const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
	        const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
	        const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
	        const boxSizing = slideStyles.getPropertyValue('box-sizing');

	        if (boxSizing && boxSizing === 'border-box') {
	          slideSize = width + marginLeft + marginRight;
	        } else {
	          const {
	            clientWidth,
	            offsetWidth
	          } = slide[0];
	          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
	        }
	      }

	      if (currentTransform) {
	        slide[0].style.transform = currentTransform;
	      }

	      if (currentWebKitTransform) {
	        slide[0].style.webkitTransform = currentWebKitTransform;
	      }

	      if (params.roundLengths) slideSize = Math.floor(slideSize);
	    } else {
	      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
	      if (params.roundLengths) slideSize = Math.floor(slideSize);

	      if (slides[i]) {
	        slides[i].style[getDirectionLabel('width')] = `${slideSize}px`;
	      }
	    }

	    if (slides[i]) {
	      slides[i].swiperSlideSize = slideSize;
	    }

	    slidesSizesGrid.push(slideSize);

	    if (params.centeredSlides) {
	      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
	      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
	      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
	      if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
	      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
	      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
	      slidesGrid.push(slidePosition);
	    } else {
	      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
	      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
	      slidesGrid.push(slidePosition);
	      slidePosition = slidePosition + slideSize + spaceBetween;
	    }

	    swiper.virtualSize += slideSize + spaceBetween;
	    prevSlideSize = slideSize;
	    index += 1;
	  }

	  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;

	  if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
	    $wrapperEl.css({
	      width: `${swiper.virtualSize + params.spaceBetween}px`
	    });
	  }

	  if (params.setWrapperSize) {
	    $wrapperEl.css({
	      [getDirectionLabel('width')]: `${swiper.virtualSize + params.spaceBetween}px`
	    });
	  }

	  if (gridEnabled) {
	    swiper.grid.updateWrapperSize(slideSize, snapGrid, getDirectionLabel);
	  } // Remove last grid elements depending on width


	  if (!params.centeredSlides) {
	    const newSlidesGrid = [];

	    for (let i = 0; i < snapGrid.length; i += 1) {
	      let slidesGridItem = snapGrid[i];
	      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);

	      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
	        newSlidesGrid.push(slidesGridItem);
	      }
	    }

	    snapGrid = newSlidesGrid;

	    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
	      snapGrid.push(swiper.virtualSize - swiperSize);
	    }
	  }

	  if (snapGrid.length === 0) snapGrid = [0];

	  if (params.spaceBetween !== 0) {
	    const key = swiper.isHorizontal() && rtl ? 'marginLeft' : getDirectionLabel('marginRight');
	    slides.filter((_, slideIndex) => {
	      if (!params.cssMode) return true;

	      if (slideIndex === slides.length - 1) {
	        return false;
	      }

	      return true;
	    }).css({
	      [key]: `${spaceBetween}px`
	    });
	  }

	  if (params.centeredSlides && params.centeredSlidesBounds) {
	    let allSlidesSize = 0;
	    slidesSizesGrid.forEach(slideSizeValue => {
	      allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
	    });
	    allSlidesSize -= params.spaceBetween;
	    const maxSnap = allSlidesSize - swiperSize;
	    snapGrid = snapGrid.map(snap => {
	      if (snap < 0) return -offsetBefore;
	      if (snap > maxSnap) return maxSnap + offsetAfter;
	      return snap;
	    });
	  }

	  if (params.centerInsufficientSlides) {
	    let allSlidesSize = 0;
	    slidesSizesGrid.forEach(slideSizeValue => {
	      allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
	    });
	    allSlidesSize -= params.spaceBetween;

	    if (allSlidesSize < swiperSize) {
	      const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
	      snapGrid.forEach((snap, snapIndex) => {
	        snapGrid[snapIndex] = snap - allSlidesOffset;
	      });
	      slidesGrid.forEach((snap, snapIndex) => {
	        slidesGrid[snapIndex] = snap + allSlidesOffset;
	      });
	    }
	  }

	  Object.assign(swiper, {
	    slides,
	    snapGrid,
	    slidesGrid,
	    slidesSizesGrid
	  });

	  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
	    setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
	    setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
	    const addToSnapGrid = -swiper.snapGrid[0];
	    const addToSlidesGrid = -swiper.slidesGrid[0];
	    swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
	    swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
	  }

	  if (slidesLength !== previousSlidesLength) {
	    swiper.emit('slidesLengthChange');
	  }

	  if (snapGrid.length !== previousSnapGridLength) {
	    if (swiper.params.watchOverflow) swiper.checkOverflow();
	    swiper.emit('snapGridLengthChange');
	  }

	  if (slidesGrid.length !== previousSlidesGridLength) {
	    swiper.emit('slidesGridLengthChange');
	  }

	  if (params.watchSlidesProgress) {
	    swiper.updateSlidesOffset();
	  }

	  if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
	    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
	    const hasClassBackfaceClassAdded = swiper.$el.hasClass(backFaceHiddenClass);

	    if (slidesLength <= params.maxBackfaceHiddenSlides) {
	      if (!hasClassBackfaceClassAdded) swiper.$el.addClass(backFaceHiddenClass);
	    } else if (hasClassBackfaceClassAdded) {
	      swiper.$el.removeClass(backFaceHiddenClass);
	    }
	  }
	}

	function updateAutoHeight(speed) {
	  const swiper = this;
	  const activeSlides = [];
	  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	  let newHeight = 0;
	  let i;

	  if (typeof speed === 'number') {
	    swiper.setTransition(speed);
	  } else if (speed === true) {
	    swiper.setTransition(swiper.params.speed);
	  }

	  const getSlideByIndex = index => {
	    if (isVirtual) {
	      return swiper.slides.filter(el => parseInt(el.getAttribute('data-swiper-slide-index'), 10) === index)[0];
	    }

	    return swiper.slides.eq(index)[0];
	  }; // Find slides currently in view


	  if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
	    if (swiper.params.centeredSlides) {
	      (swiper.visibleSlides || $([])).each(slide => {
	        activeSlides.push(slide);
	      });
	    } else {
	      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
	        const index = swiper.activeIndex + i;
	        if (index > swiper.slides.length && !isVirtual) break;
	        activeSlides.push(getSlideByIndex(index));
	      }
	    }
	  } else {
	    activeSlides.push(getSlideByIndex(swiper.activeIndex));
	  } // Find new height from highest slide in view


	  for (i = 0; i < activeSlides.length; i += 1) {
	    if (typeof activeSlides[i] !== 'undefined') {
	      const height = activeSlides[i].offsetHeight;
	      newHeight = height > newHeight ? height : newHeight;
	    }
	  } // Update Height


	  if (newHeight || newHeight === 0) swiper.$wrapperEl.css('height', `${newHeight}px`);
	}

	function updateSlidesOffset() {
	  const swiper = this;
	  const slides = swiper.slides;

	  for (let i = 0; i < slides.length; i += 1) {
	    slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
	  }
	}

	function updateSlidesProgress(translate) {
	  if (translate === void 0) {
	    translate = this && this.translate || 0;
	  }

	  const swiper = this;
	  const params = swiper.params;
	  const {
	    slides,
	    rtlTranslate: rtl,
	    snapGrid
	  } = swiper;
	  if (slides.length === 0) return;
	  if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
	  let offsetCenter = -translate;
	  if (rtl) offsetCenter = translate; // Visible Slides

	  slides.removeClass(params.slideVisibleClass);
	  swiper.visibleSlidesIndexes = [];
	  swiper.visibleSlides = [];

	  for (let i = 0; i < slides.length; i += 1) {
	    const slide = slides[i];
	    let slideOffset = slide.swiperSlideOffset;

	    if (params.cssMode && params.centeredSlides) {
	      slideOffset -= slides[0].swiperSlideOffset;
	    }

	    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
	    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
	    const slideBefore = -(offsetCenter - slideOffset);
	    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
	    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;

	    if (isVisible) {
	      swiper.visibleSlides.push(slide);
	      swiper.visibleSlidesIndexes.push(i);
	      slides.eq(i).addClass(params.slideVisibleClass);
	    }

	    slide.progress = rtl ? -slideProgress : slideProgress;
	    slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
	  }

	  swiper.visibleSlides = $(swiper.visibleSlides);
	}

	function updateProgress(translate) {
	  const swiper = this;

	  if (typeof translate === 'undefined') {
	    const multiplier = swiper.rtlTranslate ? -1 : 1; // eslint-disable-next-line

	    translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
	  }

	  const params = swiper.params;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	  let {
	    progress,
	    isBeginning,
	    isEnd
	  } = swiper;
	  const wasBeginning = isBeginning;
	  const wasEnd = isEnd;

	  if (translatesDiff === 0) {
	    progress = 0;
	    isBeginning = true;
	    isEnd = true;
	  } else {
	    progress = (translate - swiper.minTranslate()) / translatesDiff;
	    isBeginning = progress <= 0;
	    isEnd = progress >= 1;
	  }

	  Object.assign(swiper, {
	    progress,
	    isBeginning,
	    isEnd
	  });
	  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);

	  if (isBeginning && !wasBeginning) {
	    swiper.emit('reachBeginning toEdge');
	  }

	  if (isEnd && !wasEnd) {
	    swiper.emit('reachEnd toEdge');
	  }

	  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
	    swiper.emit('fromEdge');
	  }

	  swiper.emit('progress', progress);
	}

	function updateSlidesClasses() {
	  const swiper = this;
	  const {
	    slides,
	    params,
	    $wrapperEl,
	    activeIndex,
	    realIndex
	  } = swiper;
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  slides.removeClass(`${params.slideActiveClass} ${params.slideNextClass} ${params.slidePrevClass} ${params.slideDuplicateActiveClass} ${params.slideDuplicateNextClass} ${params.slideDuplicatePrevClass}`);
	  let activeSlide;

	  if (isVirtual) {
	    activeSlide = swiper.$wrapperEl.find(`.${params.slideClass}[data-swiper-slide-index="${activeIndex}"]`);
	  } else {
	    activeSlide = slides.eq(activeIndex);
	  } // Active classes


	  activeSlide.addClass(params.slideActiveClass);

	  if (params.loop) {
	    // Duplicate to all looped slides
	    if (activeSlide.hasClass(params.slideDuplicateClass)) {
	      $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
	    } else {
	      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
	    }
	  } // Next Slide


	  let nextSlide = activeSlide.nextAll(`.${params.slideClass}`).eq(0).addClass(params.slideNextClass);

	  if (params.loop && nextSlide.length === 0) {
	    nextSlide = slides.eq(0);
	    nextSlide.addClass(params.slideNextClass);
	  } // Prev Slide


	  let prevSlide = activeSlide.prevAll(`.${params.slideClass}`).eq(0).addClass(params.slidePrevClass);

	  if (params.loop && prevSlide.length === 0) {
	    prevSlide = slides.eq(-1);
	    prevSlide.addClass(params.slidePrevClass);
	  }

	  if (params.loop) {
	    // Duplicate to all looped slides
	    if (nextSlide.hasClass(params.slideDuplicateClass)) {
	      $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
	    } else {
	      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
	    }

	    if (prevSlide.hasClass(params.slideDuplicateClass)) {
	      $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
	    } else {
	      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
	    }
	  }

	  swiper.emitSlidesClasses();
	}

	function updateActiveIndex(newActiveIndex) {
	  const swiper = this;
	  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	  const {
	    slidesGrid,
	    snapGrid,
	    params,
	    activeIndex: previousIndex,
	    realIndex: previousRealIndex,
	    snapIndex: previousSnapIndex
	  } = swiper;
	  let activeIndex = newActiveIndex;
	  let snapIndex;

	  if (typeof activeIndex === 'undefined') {
	    for (let i = 0; i < slidesGrid.length; i += 1) {
	      if (typeof slidesGrid[i + 1] !== 'undefined') {
	        if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
	          activeIndex = i;
	        } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
	          activeIndex = i + 1;
	        }
	      } else if (translate >= slidesGrid[i]) {
	        activeIndex = i;
	      }
	    } // Normalize slideIndex


	    if (params.normalizeSlideIndex) {
	      if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
	    }
	  }

	  if (snapGrid.indexOf(translate) >= 0) {
	    snapIndex = snapGrid.indexOf(translate);
	  } else {
	    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
	    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
	  }

	  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

	  if (activeIndex === previousIndex) {
	    if (snapIndex !== previousSnapIndex) {
	      swiper.snapIndex = snapIndex;
	      swiper.emit('snapIndexChange');
	    }

	    return;
	  } // Get real index


	  const realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);
	  Object.assign(swiper, {
	    snapIndex,
	    realIndex,
	    previousIndex,
	    activeIndex
	  });
	  swiper.emit('activeIndexChange');
	  swiper.emit('snapIndexChange');

	  if (previousRealIndex !== realIndex) {
	    swiper.emit('realIndexChange');
	  }

	  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
	    swiper.emit('slideChange');
	  }
	}

	function updateClickedSlide(e) {
	  const swiper = this;
	  const params = swiper.params;
	  const slide = $(e).closest(`.${params.slideClass}`)[0];
	  let slideFound = false;
	  let slideIndex;

	  if (slide) {
	    for (let i = 0; i < swiper.slides.length; i += 1) {
	      if (swiper.slides[i] === slide) {
	        slideFound = true;
	        slideIndex = i;
	        break;
	      }
	    }
	  }

	  if (slide && slideFound) {
	    swiper.clickedSlide = slide;

	    if (swiper.virtual && swiper.params.virtual.enabled) {
	      swiper.clickedIndex = parseInt($(slide).attr('data-swiper-slide-index'), 10);
	    } else {
	      swiper.clickedIndex = slideIndex;
	    }
	  } else {
	    swiper.clickedSlide = undefined;
	    swiper.clickedIndex = undefined;
	    return;
	  }

	  if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
	    swiper.slideToClickedSlide();
	  }
	}

	var update = {
	  updateSize,
	  updateSlides,
	  updateAutoHeight,
	  updateSlidesOffset,
	  updateSlidesProgress,
	  updateProgress,
	  updateSlidesClasses,
	  updateActiveIndex,
	  updateClickedSlide
	};

	function getSwiperTranslate(axis) {
	  if (axis === void 0) {
	    axis = this.isHorizontal() ? 'x' : 'y';
	  }

	  const swiper = this;
	  const {
	    params,
	    rtlTranslate: rtl,
	    translate,
	    $wrapperEl
	  } = swiper;

	  if (params.virtualTranslate) {
	    return rtl ? -translate : translate;
	  }

	  if (params.cssMode) {
	    return translate;
	  }

	  let currentTranslate = getTranslate($wrapperEl[0], axis);
	  if (rtl) currentTranslate = -currentTranslate;
	  return currentTranslate || 0;
	}

	function setTranslate(translate, byController) {
	  const swiper = this;
	  const {
	    rtlTranslate: rtl,
	    params,
	    $wrapperEl,
	    wrapperEl,
	    progress
	  } = swiper;
	  let x = 0;
	  let y = 0;
	  const z = 0;

	  if (swiper.isHorizontal()) {
	    x = rtl ? -translate : translate;
	  } else {
	    y = translate;
	  }

	  if (params.roundLengths) {
	    x = Math.floor(x);
	    y = Math.floor(y);
	  }

	  if (params.cssMode) {
	    wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
	  } else if (!params.virtualTranslate) {
	    $wrapperEl.transform(`translate3d(${x}px, ${y}px, ${z}px)`);
	  }

	  swiper.previousTranslate = swiper.translate;
	  swiper.translate = swiper.isHorizontal() ? x : y; // Check if we need to update progress

	  let newProgress;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

	  if (translatesDiff === 0) {
	    newProgress = 0;
	  } else {
	    newProgress = (translate - swiper.minTranslate()) / translatesDiff;
	  }

	  if (newProgress !== progress) {
	    swiper.updateProgress(translate);
	  }

	  swiper.emit('setTranslate', swiper.translate, byController);
	}

	function minTranslate() {
	  return -this.snapGrid[0];
	}

	function maxTranslate() {
	  return -this.snapGrid[this.snapGrid.length - 1];
	}

	function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
	  if (translate === void 0) {
	    translate = 0;
	  }

	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  if (translateBounds === void 0) {
	    translateBounds = true;
	  }

	  const swiper = this;
	  const {
	    params,
	    wrapperEl
	  } = swiper;

	  if (swiper.animating && params.preventInteractionOnTransition) {
	    return false;
	  }

	  const minTranslate = swiper.minTranslate();
	  const maxTranslate = swiper.maxTranslate();
	  let newTranslate;
	  if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate; // Update progress

	  swiper.updateProgress(newTranslate);

	  if (params.cssMode) {
	    const isH = swiper.isHorizontal();

	    if (speed === 0) {
	      wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
	    } else {
	      if (!swiper.support.smoothScroll) {
	        animateCSSModeScroll({
	          swiper,
	          targetPosition: -newTranslate,
	          side: isH ? 'left' : 'top'
	        });
	        return true;
	      }

	      wrapperEl.scrollTo({
	        [isH ? 'left' : 'top']: -newTranslate,
	        behavior: 'smooth'
	      });
	    }

	    return true;
	  }

	  if (speed === 0) {
	    swiper.setTransition(0);
	    swiper.setTranslate(newTranslate);

	    if (runCallbacks) {
	      swiper.emit('beforeTransitionStart', speed, internal);
	      swiper.emit('transitionEnd');
	    }
	  } else {
	    swiper.setTransition(speed);
	    swiper.setTranslate(newTranslate);

	    if (runCallbacks) {
	      swiper.emit('beforeTransitionStart', speed, internal);
	      swiper.emit('transitionStart');
	    }

	    if (!swiper.animating) {
	      swiper.animating = true;

	      if (!swiper.onTranslateToWrapperTransitionEnd) {
	        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
	          if (!swiper || swiper.destroyed) return;
	          if (e.target !== this) return;
	          swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
	          swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
	          swiper.onTranslateToWrapperTransitionEnd = null;
	          delete swiper.onTranslateToWrapperTransitionEnd;

	          if (runCallbacks) {
	            swiper.emit('transitionEnd');
	          }
	        };
	      }

	      swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
	      swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
	    }
	  }

	  return true;
	}

	var translate = {
	  getTranslate: getSwiperTranslate,
	  setTranslate,
	  minTranslate,
	  maxTranslate,
	  translateTo
	};

	function setTransition(duration, byController) {
	  const swiper = this;

	  if (!swiper.params.cssMode) {
	    swiper.$wrapperEl.transition(duration);
	  }

	  swiper.emit('setTransition', duration, byController);
	}

	function transitionEmit(_ref) {
	  let {
	    swiper,
	    runCallbacks,
	    direction,
	    step
	  } = _ref;
	  const {
	    activeIndex,
	    previousIndex
	  } = swiper;
	  let dir = direction;

	  if (!dir) {
	    if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
	  }

	  swiper.emit(`transition${step}`);

	  if (runCallbacks && activeIndex !== previousIndex) {
	    if (dir === 'reset') {
	      swiper.emit(`slideResetTransition${step}`);
	      return;
	    }

	    swiper.emit(`slideChangeTransition${step}`);

	    if (dir === 'next') {
	      swiper.emit(`slideNextTransition${step}`);
	    } else {
	      swiper.emit(`slidePrevTransition${step}`);
	    }
	  }
	}

	function transitionStart(runCallbacks, direction) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  const swiper = this;
	  const {
	    params
	  } = swiper;
	  if (params.cssMode) return;

	  if (params.autoHeight) {
	    swiper.updateAutoHeight();
	  }

	  transitionEmit({
	    swiper,
	    runCallbacks,
	    direction,
	    step: 'Start'
	  });
	}

	function transitionEnd(runCallbacks, direction) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  const swiper = this;
	  const {
	    params
	  } = swiper;
	  swiper.animating = false;
	  if (params.cssMode) return;
	  swiper.setTransition(0);
	  transitionEmit({
	    swiper,
	    runCallbacks,
	    direction,
	    step: 'End'
	  });
	}

	var transition = {
	  setTransition,
	  transitionStart,
	  transitionEnd
	};

	function slideTo(index, speed, runCallbacks, internal, initial) {
	  if (index === void 0) {
	    index = 0;
	  }

	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  if (typeof index !== 'number' && typeof index !== 'string') {
	    throw new Error(`The 'index' argument cannot have type other than 'number' or 'string'. [${typeof index}] given.`);
	  }

	  if (typeof index === 'string') {
	    /**
	     * The `index` argument converted from `string` to `number`.
	     * @type {number}
	     */
	    const indexAsNumber = parseInt(index, 10);
	    /**
	     * Determines whether the `index` argument is a valid `number`
	     * after being converted from the `string` type.
	     * @type {boolean}
	     */

	    const isValidNumber = isFinite(indexAsNumber);

	    if (!isValidNumber) {
	      throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
	    } // Knowing that the converted `index` is a valid number,
	    // we can update the original argument's value.


	    index = indexAsNumber;
	  }

	  const swiper = this;
	  let slideIndex = index;
	  if (slideIndex < 0) slideIndex = 0;
	  const {
	    params,
	    snapGrid,
	    slidesGrid,
	    previousIndex,
	    activeIndex,
	    rtlTranslate: rtl,
	    wrapperEl,
	    enabled
	  } = swiper;

	  if (swiper.animating && params.preventInteractionOnTransition || !enabled && !internal && !initial) {
	    return false;
	  }

	  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
	  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
	  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

	  if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
	    swiper.emit('beforeSlideChangeStart');
	  }

	  const translate = -snapGrid[snapIndex]; // Update progress

	  swiper.updateProgress(translate); // Normalize slideIndex

	  if (params.normalizeSlideIndex) {
	    for (let i = 0; i < slidesGrid.length; i += 1) {
	      const normalizedTranslate = -Math.floor(translate * 100);
	      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
	      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);

	      if (typeof slidesGrid[i + 1] !== 'undefined') {
	        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
	          slideIndex = i;
	        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
	          slideIndex = i + 1;
	        }
	      } else if (normalizedTranslate >= normalizedGrid) {
	        slideIndex = i;
	      }
	    }
	  } // Directions locks


	  if (swiper.initialized && slideIndex !== activeIndex) {
	    if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
	      return false;
	    }

	    if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
	      if ((activeIndex || 0) !== slideIndex) return false;
	    }
	  }

	  let direction;
	  if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset'; // Update Index

	  if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
	    swiper.updateActiveIndex(slideIndex); // Update Height

	    if (params.autoHeight) {
	      swiper.updateAutoHeight();
	    }

	    swiper.updateSlidesClasses();

	    if (params.effect !== 'slide') {
	      swiper.setTranslate(translate);
	    }

	    if (direction !== 'reset') {
	      swiper.transitionStart(runCallbacks, direction);
	      swiper.transitionEnd(runCallbacks, direction);
	    }

	    return false;
	  }

	  if (params.cssMode) {
	    const isH = swiper.isHorizontal();
	    const t = rtl ? translate : -translate;

	    if (speed === 0) {
	      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

	      if (isVirtual) {
	        swiper.wrapperEl.style.scrollSnapType = 'none';
	        swiper._immediateVirtual = true;
	      }

	      wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;

	      if (isVirtual) {
	        requestAnimationFrame(() => {
	          swiper.wrapperEl.style.scrollSnapType = '';
	          swiper._swiperImmediateVirtual = false;
	        });
	      }
	    } else {
	      if (!swiper.support.smoothScroll) {
	        animateCSSModeScroll({
	          swiper,
	          targetPosition: t,
	          side: isH ? 'left' : 'top'
	        });
	        return true;
	      }

	      wrapperEl.scrollTo({
	        [isH ? 'left' : 'top']: t,
	        behavior: 'smooth'
	      });
	    }

	    return true;
	  }

	  swiper.setTransition(speed);
	  swiper.setTranslate(translate);
	  swiper.updateActiveIndex(slideIndex);
	  swiper.updateSlidesClasses();
	  swiper.emit('beforeTransitionStart', speed, internal);
	  swiper.transitionStart(runCallbacks, direction);

	  if (speed === 0) {
	    swiper.transitionEnd(runCallbacks, direction);
	  } else if (!swiper.animating) {
	    swiper.animating = true;

	    if (!swiper.onSlideToWrapperTransitionEnd) {
	      swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
	        if (!swiper || swiper.destroyed) return;
	        if (e.target !== this) return;
	        swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
	        swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
	        swiper.onSlideToWrapperTransitionEnd = null;
	        delete swiper.onSlideToWrapperTransitionEnd;
	        swiper.transitionEnd(runCallbacks, direction);
	      };
	    }

	    swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
	    swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
	  }

	  return true;
	}

	function slideToLoop(index, speed, runCallbacks, internal) {
	  if (index === void 0) {
	    index = 0;
	  }

	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  if (typeof index === 'string') {
	    /**
	     * The `index` argument converted from `string` to `number`.
	     * @type {number}
	     */
	    const indexAsNumber = parseInt(index, 10);
	    /**
	     * Determines whether the `index` argument is a valid `number`
	     * after being converted from the `string` type.
	     * @type {boolean}
	     */

	    const isValidNumber = isFinite(indexAsNumber);

	    if (!isValidNumber) {
	      throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
	    } // Knowing that the converted `index` is a valid number,
	    // we can update the original argument's value.


	    index = indexAsNumber;
	  }

	  const swiper = this;
	  let newIndex = index;

	  if (swiper.params.loop) {
	    newIndex += swiper.loopedSlides;
	  }

	  return swiper.slideTo(newIndex, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slideNext(speed, runCallbacks, internal) {
	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  const swiper = this;
	  const {
	    animating,
	    enabled,
	    params
	  } = swiper;
	  if (!enabled) return swiper;
	  let perGroup = params.slidesPerGroup;

	  if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
	    perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
	  }

	  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;

	  if (params.loop) {
	    if (animating && params.loopPreventsSlide) return false;
	    swiper.loopFix(); // eslint-disable-next-line

	    swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
	  }

	  if (params.rewind && swiper.isEnd) {
	    return swiper.slideTo(0, speed, runCallbacks, internal);
	  }

	  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slidePrev(speed, runCallbacks, internal) {
	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  const swiper = this;
	  const {
	    params,
	    animating,
	    snapGrid,
	    slidesGrid,
	    rtlTranslate,
	    enabled
	  } = swiper;
	  if (!enabled) return swiper;

	  if (params.loop) {
	    if (animating && params.loopPreventsSlide) return false;
	    swiper.loopFix(); // eslint-disable-next-line

	    swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
	  }

	  const translate = rtlTranslate ? swiper.translate : -swiper.translate;

	  function normalize(val) {
	    if (val < 0) return -Math.floor(Math.abs(val));
	    return Math.floor(val);
	  }

	  const normalizedTranslate = normalize(translate);
	  const normalizedSnapGrid = snapGrid.map(val => normalize(val));
	  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];

	  if (typeof prevSnap === 'undefined' && params.cssMode) {
	    let prevSnapIndex;
	    snapGrid.forEach((snap, snapIndex) => {
	      if (normalizedTranslate >= snap) {
	        // prevSnap = snap;
	        prevSnapIndex = snapIndex;
	      }
	    });

	    if (typeof prevSnapIndex !== 'undefined') {
	      prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
	    }
	  }

	  let prevIndex = 0;

	  if (typeof prevSnap !== 'undefined') {
	    prevIndex = slidesGrid.indexOf(prevSnap);
	    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;

	    if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
	      prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
	      prevIndex = Math.max(prevIndex, 0);
	    }
	  }

	  if (params.rewind && swiper.isBeginning) {
	    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
	    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
	  }

	  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slideReset(speed, runCallbacks, internal) {
	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  const swiper = this;
	  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slideToClosest(speed, runCallbacks, internal, threshold) {
	  if (speed === void 0) {
	    speed = this.params.speed;
	  }

	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }

	  if (threshold === void 0) {
	    threshold = 0.5;
	  }

	  const swiper = this;
	  let index = swiper.activeIndex;
	  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
	  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
	  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;

	  if (translate >= swiper.snapGrid[snapIndex]) {
	    // The current translate is on or after the current snap index, so the choice
	    // is between the current index and the one after it.
	    const currentSnap = swiper.snapGrid[snapIndex];
	    const nextSnap = swiper.snapGrid[snapIndex + 1];

	    if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
	      index += swiper.params.slidesPerGroup;
	    }
	  } else {
	    // The current translate is before the current snap index, so the choice
	    // is between the current index and the one before it.
	    const prevSnap = swiper.snapGrid[snapIndex - 1];
	    const currentSnap = swiper.snapGrid[snapIndex];

	    if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
	      index -= swiper.params.slidesPerGroup;
	    }
	  }

	  index = Math.max(index, 0);
	  index = Math.min(index, swiper.slidesGrid.length - 1);
	  return swiper.slideTo(index, speed, runCallbacks, internal);
	}

	function slideToClickedSlide() {
	  const swiper = this;
	  const {
	    params,
	    $wrapperEl
	  } = swiper;
	  const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
	  let slideToIndex = swiper.clickedIndex;
	  let realIndex;

	  if (params.loop) {
	    if (swiper.animating) return;
	    realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);

	    if (params.centeredSlides) {
	      if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
	        swiper.loopFix();
	        slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
	        nextTick(() => {
	          swiper.slideTo(slideToIndex);
	        });
	      } else {
	        swiper.slideTo(slideToIndex);
	      }
	    } else if (slideToIndex > swiper.slides.length - slidesPerView) {
	      swiper.loopFix();
	      slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
	      nextTick(() => {
	        swiper.slideTo(slideToIndex);
	      });
	    } else {
	      swiper.slideTo(slideToIndex);
	    }
	  } else {
	    swiper.slideTo(slideToIndex);
	  }
	}

	var slide = {
	  slideTo,
	  slideToLoop,
	  slideNext,
	  slidePrev,
	  slideReset,
	  slideToClosest,
	  slideToClickedSlide
	};

	function loopCreate() {
	  const swiper = this;
	  const document = getDocument();
	  const {
	    params,
	    $wrapperEl
	  } = swiper; // Remove duplicated slides

	  const $selector = $wrapperEl.children().length > 0 ? $($wrapperEl.children()[0].parentNode) : $wrapperEl;
	  $selector.children(`.${params.slideClass}.${params.slideDuplicateClass}`).remove();
	  let slides = $selector.children(`.${params.slideClass}`);

	  if (params.loopFillGroupWithBlank) {
	    const blankSlidesNum = params.slidesPerGroup - slides.length % params.slidesPerGroup;

	    if (blankSlidesNum !== params.slidesPerGroup) {
	      for (let i = 0; i < blankSlidesNum; i += 1) {
	        const blankNode = $(document.createElement('div')).addClass(`${params.slideClass} ${params.slideBlankClass}`);
	        $selector.append(blankNode);
	      }

	      slides = $selector.children(`.${params.slideClass}`);
	    }
	  }

	  if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;
	  swiper.loopedSlides = Math.ceil(parseFloat(params.loopedSlides || params.slidesPerView, 10));
	  swiper.loopedSlides += params.loopAdditionalSlides;

	  if (swiper.loopedSlides > slides.length) {
	    swiper.loopedSlides = slides.length;
	  }

	  const prependSlides = [];
	  const appendSlides = [];
	  slides.each((el, index) => {
	    const slide = $(el);

	    if (index < swiper.loopedSlides) {
	      appendSlides.push(el);
	    }

	    if (index < slides.length && index >= slides.length - swiper.loopedSlides) {
	      prependSlides.push(el);
	    }

	    slide.attr('data-swiper-slide-index', index);
	  });

	  for (let i = 0; i < appendSlides.length; i += 1) {
	    $selector.append($(appendSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
	  }

	  for (let i = prependSlides.length - 1; i >= 0; i -= 1) {
	    $selector.prepend($(prependSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
	  }
	}

	function loopFix() {
	  const swiper = this;
	  swiper.emit('beforeLoopFix');
	  const {
	    activeIndex,
	    slides,
	    loopedSlides,
	    allowSlidePrev,
	    allowSlideNext,
	    snapGrid,
	    rtlTranslate: rtl
	  } = swiper;
	  let newIndex;
	  swiper.allowSlidePrev = true;
	  swiper.allowSlideNext = true;
	  const snapTranslate = -snapGrid[activeIndex];
	  const diff = snapTranslate - swiper.getTranslate(); // Fix For Negative Oversliding

	  if (activeIndex < loopedSlides) {
	    newIndex = slides.length - loopedSlides * 3 + activeIndex;
	    newIndex += loopedSlides;
	    const slideChanged = swiper.slideTo(newIndex, 0, false, true);

	    if (slideChanged && diff !== 0) {
	      swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
	    }
	  } else if (activeIndex >= slides.length - loopedSlides) {
	    // Fix For Positive Oversliding
	    newIndex = -slides.length + activeIndex + loopedSlides;
	    newIndex += loopedSlides;
	    const slideChanged = swiper.slideTo(newIndex, 0, false, true);

	    if (slideChanged && diff !== 0) {
	      swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
	    }
	  }

	  swiper.allowSlidePrev = allowSlidePrev;
	  swiper.allowSlideNext = allowSlideNext;
	  swiper.emit('loopFix');
	}

	function loopDestroy() {
	  const swiper = this;
	  const {
	    $wrapperEl,
	    params,
	    slides
	  } = swiper;
	  $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass},.${params.slideClass}.${params.slideBlankClass}`).remove();
	  slides.removeAttr('data-swiper-slide-index');
	}

	var loop = {
	  loopCreate,
	  loopFix,
	  loopDestroy
	};

	function setGrabCursor(moving) {
	  const swiper = this;
	  if (swiper.support.touch || !swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
	  const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
	  el.style.cursor = 'move';
	  el.style.cursor = moving ? 'grabbing' : 'grab';
	}

	function unsetGrabCursor() {
	  const swiper = this;

	  if (swiper.support.touch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
	    return;
	  }

	  swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
	}

	var grabCursor = {
	  setGrabCursor,
	  unsetGrabCursor
	};

	function closestElement(selector, base) {
	  if (base === void 0) {
	    base = this;
	  }

	  function __closestFrom(el) {
	    if (!el || el === getDocument() || el === getWindow()) return null;
	    if (el.assignedSlot) el = el.assignedSlot;
	    const found = el.closest(selector);

	    if (!found && !el.getRootNode) {
	      return null;
	    }

	    return found || __closestFrom(el.getRootNode().host);
	  }

	  return __closestFrom(base);
	}

	function onTouchStart(event) {
	  const swiper = this;
	  const document = getDocument();
	  const window = getWindow();
	  const data = swiper.touchEventsData;
	  const {
	    params,
	    touches,
	    enabled
	  } = swiper;
	  if (!enabled) return;

	  if (swiper.animating && params.preventInteractionOnTransition) {
	    return;
	  }

	  if (!swiper.animating && params.cssMode && params.loop) {
	    swiper.loopFix();
	  }

	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;
	  let $targetEl = $(e.target);

	  if (params.touchEventsTarget === 'wrapper') {
	    if (!$targetEl.closest(swiper.wrapperEl).length) return;
	  }

	  data.isTouchEvent = e.type === 'touchstart';
	  if (!data.isTouchEvent && 'which' in e && e.which === 3) return;
	  if (!data.isTouchEvent && 'button' in e && e.button > 0) return;
	  if (data.isTouched && data.isMoved) return; // change target el for shadow root component

	  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';

	  if (swipingClassHasValue && e.target && e.target.shadowRoot && event.path && event.path[0]) {
	    $targetEl = $(event.path[0]);
	  }

	  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
	  const isTargetShadow = !!(e.target && e.target.shadowRoot); // use closestElement for shadow root element to get the actual closest for nested shadow root element

	  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, $targetEl[0]) : $targetEl.closest(noSwipingSelector)[0])) {
	    swiper.allowClick = true;
	    return;
	  }

	  if (params.swipeHandler) {
	    if (!$targetEl.closest(params.swipeHandler)[0]) return;
	  }

	  touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
	  touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
	  const startX = touches.currentX;
	  const startY = touches.currentY; // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

	  const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
	  const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;

	  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
	    if (edgeSwipeDetection === 'prevent') {
	      event.preventDefault();
	    } else {
	      return;
	    }
	  }

	  Object.assign(data, {
	    isTouched: true,
	    isMoved: false,
	    allowTouchCallbacks: true,
	    isScrolling: undefined,
	    startMoving: undefined
	  });
	  touches.startX = startX;
	  touches.startY = startY;
	  data.touchStartTime = now();
	  swiper.allowClick = true;
	  swiper.updateSize();
	  swiper.swipeDirection = undefined;
	  if (params.threshold > 0) data.allowThresholdMove = false;

	  if (e.type !== 'touchstart') {
	    let preventDefault = true;

	    if ($targetEl.is(data.focusableElements)) {
	      preventDefault = false;

	      if ($targetEl[0].nodeName === 'SELECT') {
	        data.isTouched = false;
	      }
	    }

	    if (document.activeElement && $(document.activeElement).is(data.focusableElements) && document.activeElement !== $targetEl[0]) {
	      document.activeElement.blur();
	    }

	    const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;

	    if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !$targetEl[0].isContentEditable) {
	      e.preventDefault();
	    }
	  }

	  if (swiper.params.freeMode && swiper.params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
	    swiper.freeMode.onTouchStart();
	  }

	  swiper.emit('touchStart', e);
	}

	function onTouchMove(event) {
	  const document = getDocument();
	  const swiper = this;
	  const data = swiper.touchEventsData;
	  const {
	    params,
	    touches,
	    rtlTranslate: rtl,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;

	  if (!data.isTouched) {
	    if (data.startMoving && data.isScrolling) {
	      swiper.emit('touchMoveOpposite', e);
	    }

	    return;
	  }

	  if (data.isTouchEvent && e.type !== 'touchmove') return;
	  const targetTouch = e.type === 'touchmove' && e.targetTouches && (e.targetTouches[0] || e.changedTouches[0]);
	  const pageX = e.type === 'touchmove' ? targetTouch.pageX : e.pageX;
	  const pageY = e.type === 'touchmove' ? targetTouch.pageY : e.pageY;

	  if (e.preventedByNestedSwiper) {
	    touches.startX = pageX;
	    touches.startY = pageY;
	    return;
	  }

	  if (!swiper.allowTouchMove) {
	    if (!$(e.target).is(data.focusableElements)) {
	      swiper.allowClick = false;
	    }

	    if (data.isTouched) {
	      Object.assign(touches, {
	        startX: pageX,
	        startY: pageY,
	        currentX: pageX,
	        currentY: pageY
	      });
	      data.touchStartTime = now();
	    }

	    return;
	  }

	  if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
	    if (swiper.isVertical()) {
	      // Vertical
	      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
	        data.isTouched = false;
	        data.isMoved = false;
	        return;
	      }
	    } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
	      return;
	    }
	  }

	  if (data.isTouchEvent && document.activeElement) {
	    if (e.target === document.activeElement && $(e.target).is(data.focusableElements)) {
	      data.isMoved = true;
	      swiper.allowClick = false;
	      return;
	    }
	  }

	  if (data.allowTouchCallbacks) {
	    swiper.emit('touchMove', e);
	  }

	  if (e.targetTouches && e.targetTouches.length > 1) return;
	  touches.currentX = pageX;
	  touches.currentY = pageY;
	  const diffX = touches.currentX - touches.startX;
	  const diffY = touches.currentY - touches.startY;
	  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;

	  if (typeof data.isScrolling === 'undefined') {
	    let touchAngle;

	    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
	      data.isScrolling = false;
	    } else {
	      // eslint-disable-next-line
	      if (diffX * diffX + diffY * diffY >= 25) {
	        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
	        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
	      }
	    }
	  }

	  if (data.isScrolling) {
	    swiper.emit('touchMoveOpposite', e);
	  }

	  if (typeof data.startMoving === 'undefined') {
	    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
	      data.startMoving = true;
	    }
	  }

	  if (data.isScrolling) {
	    data.isTouched = false;
	    return;
	  }

	  if (!data.startMoving) {
	    return;
	  }

	  swiper.allowClick = false;

	  if (!params.cssMode && e.cancelable) {
	    e.preventDefault();
	  }

	  if (params.touchMoveStopPropagation && !params.nested) {
	    e.stopPropagation();
	  }

	  if (!data.isMoved) {
	    if (params.loop && !params.cssMode) {
	      swiper.loopFix();
	    }

	    data.startTranslate = swiper.getTranslate();
	    swiper.setTransition(0);

	    if (swiper.animating) {
	      swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
	    }

	    data.allowMomentumBounce = false; // Grab Cursor

	    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
	      swiper.setGrabCursor(true);
	    }

	    swiper.emit('sliderFirstMove', e);
	  }

	  swiper.emit('sliderMove', e);
	  data.isMoved = true;
	  let diff = swiper.isHorizontal() ? diffX : diffY;
	  touches.diff = diff;
	  diff *= params.touchRatio;
	  if (rtl) diff = -diff;
	  swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
	  data.currentTranslate = diff + data.startTranslate;
	  let disableParentSwiper = true;
	  let resistanceRatio = params.resistanceRatio;

	  if (params.touchReleaseOnEdges) {
	    resistanceRatio = 0;
	  }

	  if (diff > 0 && data.currentTranslate > swiper.minTranslate()) {
	    disableParentSwiper = false;
	    if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
	  } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
	    disableParentSwiper = false;
	    if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
	  }

	  if (disableParentSwiper) {
	    e.preventedByNestedSwiper = true;
	  } // Directions locks


	  if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
	    data.currentTranslate = data.startTranslate;
	  }

	  if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
	    data.currentTranslate = data.startTranslate;
	  }

	  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
	    data.currentTranslate = data.startTranslate;
	  } // Threshold


	  if (params.threshold > 0) {
	    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
	      if (!data.allowThresholdMove) {
	        data.allowThresholdMove = true;
	        touches.startX = touches.currentX;
	        touches.startY = touches.currentY;
	        data.currentTranslate = data.startTranslate;
	        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
	        return;
	      }
	    } else {
	      data.currentTranslate = data.startTranslate;
	      return;
	    }
	  }

	  if (!params.followFinger || params.cssMode) return; // Update active index in free mode

	  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
	    swiper.updateActiveIndex();
	    swiper.updateSlidesClasses();
	  }

	  if (swiper.params.freeMode && params.freeMode.enabled && swiper.freeMode) {
	    swiper.freeMode.onTouchMove();
	  } // Update progress


	  swiper.updateProgress(data.currentTranslate); // Update translate

	  swiper.setTranslate(data.currentTranslate);
	}

	function onTouchEnd(event) {
	  const swiper = this;
	  const data = swiper.touchEventsData;
	  const {
	    params,
	    touches,
	    rtlTranslate: rtl,
	    slidesGrid,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;

	  if (data.allowTouchCallbacks) {
	    swiper.emit('touchEnd', e);
	  }

	  data.allowTouchCallbacks = false;

	  if (!data.isTouched) {
	    if (data.isMoved && params.grabCursor) {
	      swiper.setGrabCursor(false);
	    }

	    data.isMoved = false;
	    data.startMoving = false;
	    return;
	  } // Return Grab Cursor


	  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
	    swiper.setGrabCursor(false);
	  } // Time diff


	  const touchEndTime = now();
	  const timeDiff = touchEndTime - data.touchStartTime; // Tap, doubleTap, Click

	  if (swiper.allowClick) {
	    const pathTree = e.path || e.composedPath && e.composedPath();
	    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target);
	    swiper.emit('tap click', e);

	    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
	      swiper.emit('doubleTap doubleClick', e);
	    }
	  }

	  data.lastClickTime = now();
	  nextTick(() => {
	    if (!swiper.destroyed) swiper.allowClick = true;
	  });

	  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
	    data.isTouched = false;
	    data.isMoved = false;
	    data.startMoving = false;
	    return;
	  }

	  data.isTouched = false;
	  data.isMoved = false;
	  data.startMoving = false;
	  let currentPos;

	  if (params.followFinger) {
	    currentPos = rtl ? swiper.translate : -swiper.translate;
	  } else {
	    currentPos = -data.currentTranslate;
	  }

	  if (params.cssMode) {
	    return;
	  }

	  if (swiper.params.freeMode && params.freeMode.enabled) {
	    swiper.freeMode.onTouchEnd({
	      currentPos
	    });
	    return;
	  } // Find current slide


	  let stopIndex = 0;
	  let groupSize = swiper.slidesSizesGrid[0];

	  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
	    const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

	    if (typeof slidesGrid[i + increment] !== 'undefined') {
	      if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
	        stopIndex = i;
	        groupSize = slidesGrid[i + increment] - slidesGrid[i];
	      }
	    } else if (currentPos >= slidesGrid[i]) {
	      stopIndex = i;
	      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
	    }
	  }

	  let rewindFirstIndex = null;
	  let rewindLastIndex = null;

	  if (params.rewind) {
	    if (swiper.isBeginning) {
	      rewindLastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
	    } else if (swiper.isEnd) {
	      rewindFirstIndex = 0;
	    }
	  } // Find current slide size


	  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
	  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

	  if (timeDiff > params.longSwipesMs) {
	    // Long touches
	    if (!params.longSwipes) {
	      swiper.slideTo(swiper.activeIndex);
	      return;
	    }

	    if (swiper.swipeDirection === 'next') {
	      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
	    }

	    if (swiper.swipeDirection === 'prev') {
	      if (ratio > 1 - params.longSwipesRatio) {
	        swiper.slideTo(stopIndex + increment);
	      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
	        swiper.slideTo(rewindLastIndex);
	      } else {
	        swiper.slideTo(stopIndex);
	      }
	    }
	  } else {
	    // Short swipes
	    if (!params.shortSwipes) {
	      swiper.slideTo(swiper.activeIndex);
	      return;
	    }

	    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);

	    if (!isNavButtonTarget) {
	      if (swiper.swipeDirection === 'next') {
	        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
	      }

	      if (swiper.swipeDirection === 'prev') {
	        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
	      }
	    } else if (e.target === swiper.navigation.nextEl) {
	      swiper.slideTo(stopIndex + increment);
	    } else {
	      swiper.slideTo(stopIndex);
	    }
	  }
	}

	function onResize() {
	  const swiper = this;
	  const {
	    params,
	    el
	  } = swiper;
	  if (el && el.offsetWidth === 0) return; // Breakpoints

	  if (params.breakpoints) {
	    swiper.setBreakpoint();
	  } // Save locks


	  const {
	    allowSlideNext,
	    allowSlidePrev,
	    snapGrid
	  } = swiper; // Disable locks on resize

	  swiper.allowSlideNext = true;
	  swiper.allowSlidePrev = true;
	  swiper.updateSize();
	  swiper.updateSlides();
	  swiper.updateSlidesClasses();

	  if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides) {
	    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
	  } else {
	    swiper.slideTo(swiper.activeIndex, 0, false, true);
	  }

	  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
	    swiper.autoplay.run();
	  } // Return locks after resize


	  swiper.allowSlidePrev = allowSlidePrev;
	  swiper.allowSlideNext = allowSlideNext;

	  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
	    swiper.checkOverflow();
	  }
	}

	function onClick(e) {
	  const swiper = this;
	  if (!swiper.enabled) return;

	  if (!swiper.allowClick) {
	    if (swiper.params.preventClicks) e.preventDefault();

	    if (swiper.params.preventClicksPropagation && swiper.animating) {
	      e.stopPropagation();
	      e.stopImmediatePropagation();
	    }
	  }
	}

	function onScroll() {
	  const swiper = this;
	  const {
	    wrapperEl,
	    rtlTranslate,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  swiper.previousTranslate = swiper.translate;

	  if (swiper.isHorizontal()) {
	    swiper.translate = -wrapperEl.scrollLeft;
	  } else {
	    swiper.translate = -wrapperEl.scrollTop;
	  } // eslint-disable-next-line


	  if (swiper.translate === 0) swiper.translate = 0;
	  swiper.updateActiveIndex();
	  swiper.updateSlidesClasses();
	  let newProgress;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

	  if (translatesDiff === 0) {
	    newProgress = 0;
	  } else {
	    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
	  }

	  if (newProgress !== swiper.progress) {
	    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
	  }

	  swiper.emit('setTranslate', swiper.translate, false);
	}

	let dummyEventAttached = false;

	function dummyEventListener() {}

	const events = (swiper, method) => {
	  const document = getDocument();
	  const {
	    params,
	    touchEvents,
	    el,
	    wrapperEl,
	    device,
	    support
	  } = swiper;
	  const capture = !!params.nested;
	  const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
	  const swiperMethod = method; // Touch Events

	  if (!support.touch) {
	    el[domMethod](touchEvents.start, swiper.onTouchStart, false);
	    document[domMethod](touchEvents.move, swiper.onTouchMove, capture);
	    document[domMethod](touchEvents.end, swiper.onTouchEnd, false);
	  } else {
	    const passiveListener = touchEvents.start === 'touchstart' && support.passiveListener && params.passiveListeners ? {
	      passive: true,
	      capture: false
	    } : false;
	    el[domMethod](touchEvents.start, swiper.onTouchStart, passiveListener);
	    el[domMethod](touchEvents.move, swiper.onTouchMove, support.passiveListener ? {
	      passive: false,
	      capture
	    } : capture);
	    el[domMethod](touchEvents.end, swiper.onTouchEnd, passiveListener);

	    if (touchEvents.cancel) {
	      el[domMethod](touchEvents.cancel, swiper.onTouchEnd, passiveListener);
	    }
	  } // Prevent Links Clicks


	  if (params.preventClicks || params.preventClicksPropagation) {
	    el[domMethod]('click', swiper.onClick, true);
	  }

	  if (params.cssMode) {
	    wrapperEl[domMethod]('scroll', swiper.onScroll);
	  } // Resize handler


	  if (params.updateOnWindowResize) {
	    swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
	  } else {
	    swiper[swiperMethod]('observerUpdate', onResize, true);
	  }
	};

	function attachEvents() {
	  const swiper = this;
	  const document = getDocument();
	  const {
	    params,
	    support
	  } = swiper;
	  swiper.onTouchStart = onTouchStart.bind(swiper);
	  swiper.onTouchMove = onTouchMove.bind(swiper);
	  swiper.onTouchEnd = onTouchEnd.bind(swiper);

	  if (params.cssMode) {
	    swiper.onScroll = onScroll.bind(swiper);
	  }

	  swiper.onClick = onClick.bind(swiper);

	  if (support.touch && !dummyEventAttached) {
	    document.addEventListener('touchstart', dummyEventListener);
	    dummyEventAttached = true;
	  }

	  events(swiper, 'on');
	}

	function detachEvents() {
	  const swiper = this;
	  events(swiper, 'off');
	}

	var events$1 = {
	  attachEvents,
	  detachEvents
	};

	const isGridEnabled = (swiper, params) => {
	  return swiper.grid && params.grid && params.grid.rows > 1;
	};

	function setBreakpoint() {
	  const swiper = this;
	  const {
	    activeIndex,
	    initialized,
	    loopedSlides = 0,
	    params,
	    $el
	  } = swiper;
	  const breakpoints = params.breakpoints;
	  if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return; // Get breakpoint for window width and update parameters

	  const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
	  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
	  const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
	  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
	  const wasMultiRow = isGridEnabled(swiper, params);
	  const isMultiRow = isGridEnabled(swiper, breakpointParams);
	  const wasEnabled = params.enabled;

	  if (wasMultiRow && !isMultiRow) {
	    $el.removeClass(`${params.containerModifierClass}grid ${params.containerModifierClass}grid-column`);
	    swiper.emitContainerClasses();
	  } else if (!wasMultiRow && isMultiRow) {
	    $el.addClass(`${params.containerModifierClass}grid`);

	    if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
	      $el.addClass(`${params.containerModifierClass}grid-column`);
	    }

	    swiper.emitContainerClasses();
	  } // Toggle navigation, pagination, scrollbar


	  ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
	    const wasModuleEnabled = params[prop] && params[prop].enabled;
	    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;

	    if (wasModuleEnabled && !isModuleEnabled) {
	      swiper[prop].disable();
	    }

	    if (!wasModuleEnabled && isModuleEnabled) {
	      swiper[prop].enable();
	    }
	  });
	  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
	  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

	  if (directionChanged && initialized) {
	    swiper.changeDirection();
	  }

	  extend$2(swiper.params, breakpointParams);
	  const isEnabled = swiper.params.enabled;
	  Object.assign(swiper, {
	    allowTouchMove: swiper.params.allowTouchMove,
	    allowSlideNext: swiper.params.allowSlideNext,
	    allowSlidePrev: swiper.params.allowSlidePrev
	  });

	  if (wasEnabled && !isEnabled) {
	    swiper.disable();
	  } else if (!wasEnabled && isEnabled) {
	    swiper.enable();
	  }

	  swiper.currentBreakpoint = breakpoint;
	  swiper.emit('_beforeBreakpoint', breakpointParams);

	  if (needsReLoop && initialized) {
	    swiper.loopDestroy();
	    swiper.loopCreate();
	    swiper.updateSlides();
	    swiper.slideTo(activeIndex - loopedSlides + swiper.loopedSlides, 0, false);
	  }

	  swiper.emit('breakpoint', breakpointParams);
	}

	function getBreakpoint(breakpoints, base, containerEl) {
	  if (base === void 0) {
	    base = 'window';
	  }

	  if (!breakpoints || base === 'container' && !containerEl) return undefined;
	  let breakpoint = false;
	  const window = getWindow();
	  const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
	  const points = Object.keys(breakpoints).map(point => {
	    if (typeof point === 'string' && point.indexOf('@') === 0) {
	      const minRatio = parseFloat(point.substr(1));
	      const value = currentHeight * minRatio;
	      return {
	        value,
	        point
	      };
	    }

	    return {
	      value: point,
	      point
	    };
	  });
	  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));

	  for (let i = 0; i < points.length; i += 1) {
	    const {
	      point,
	      value
	    } = points[i];

	    if (base === 'window') {
	      if (window.matchMedia(`(min-width: ${value}px)`).matches) {
	        breakpoint = point;
	      }
	    } else if (value <= containerEl.clientWidth) {
	      breakpoint = point;
	    }
	  }

	  return breakpoint || 'max';
	}

	var breakpoints = {
	  setBreakpoint,
	  getBreakpoint
	};

	function prepareClasses(entries, prefix) {
	  const resultClasses = [];
	  entries.forEach(item => {
	    if (typeof item === 'object') {
	      Object.keys(item).forEach(classNames => {
	        if (item[classNames]) {
	          resultClasses.push(prefix + classNames);
	        }
	      });
	    } else if (typeof item === 'string') {
	      resultClasses.push(prefix + item);
	    }
	  });
	  return resultClasses;
	}

	function addClasses() {
	  const swiper = this;
	  const {
	    classNames,
	    params,
	    rtl,
	    $el,
	    device,
	    support
	  } = swiper; // prettier-ignore

	  const suffixes = prepareClasses(['initialized', params.direction, {
	    'pointer-events': !support.touch
	  }, {
	    'free-mode': swiper.params.freeMode && params.freeMode.enabled
	  }, {
	    'autoheight': params.autoHeight
	  }, {
	    'rtl': rtl
	  }, {
	    'grid': params.grid && params.grid.rows > 1
	  }, {
	    'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
	  }, {
	    'android': device.android
	  }, {
	    'ios': device.ios
	  }, {
	    'css-mode': params.cssMode
	  }, {
	    'centered': params.cssMode && params.centeredSlides
	  }, {
	    'watch-progress': params.watchSlidesProgress
	  }], params.containerModifierClass);
	  classNames.push(...suffixes);
	  $el.addClass([...classNames].join(' '));
	  swiper.emitContainerClasses();
	}

	function removeClasses() {
	  const swiper = this;
	  const {
	    $el,
	    classNames
	  } = swiper;
	  $el.removeClass(classNames.join(' '));
	  swiper.emitContainerClasses();
	}

	var classes = {
	  addClasses,
	  removeClasses
	};

	function loadImage(imageEl, src, srcset, sizes, checkForComplete, callback) {
	  const window = getWindow();
	  let image;

	  function onReady() {
	    if (callback) callback();
	  }

	  const isPicture = $(imageEl).parent('picture')[0];

	  if (!isPicture && (!imageEl.complete || !checkForComplete)) {
	    if (src) {
	      image = new window.Image();
	      image.onload = onReady;
	      image.onerror = onReady;

	      if (sizes) {
	        image.sizes = sizes;
	      }

	      if (srcset) {
	        image.srcset = srcset;
	      }

	      if (src) {
	        image.src = src;
	      }
	    } else {
	      onReady();
	    }
	  } else {
	    // image already loaded...
	    onReady();
	  }
	}

	function preloadImages() {
	  const swiper = this;
	  swiper.imagesToLoad = swiper.$el.find('img');

	  function onReady() {
	    if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
	    if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;

	    if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
	      if (swiper.params.updateOnImagesReady) swiper.update();
	      swiper.emit('imagesReady');
	    }
	  }

	  for (let i = 0; i < swiper.imagesToLoad.length; i += 1) {
	    const imageEl = swiper.imagesToLoad[i];
	    swiper.loadImage(imageEl, imageEl.currentSrc || imageEl.getAttribute('src'), imageEl.srcset || imageEl.getAttribute('srcset'), imageEl.sizes || imageEl.getAttribute('sizes'), true, onReady);
	  }
	}

	var images = {
	  loadImage,
	  preloadImages
	};

	function checkOverflow() {
	  const swiper = this;
	  const {
	    isLocked: wasLocked,
	    params
	  } = swiper;
	  const {
	    slidesOffsetBefore
	  } = params;

	  if (slidesOffsetBefore) {
	    const lastSlideIndex = swiper.slides.length - 1;
	    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
	    swiper.isLocked = swiper.size > lastSlideRightEdge;
	  } else {
	    swiper.isLocked = swiper.snapGrid.length === 1;
	  }

	  if (params.allowSlideNext === true) {
	    swiper.allowSlideNext = !swiper.isLocked;
	  }

	  if (params.allowSlidePrev === true) {
	    swiper.allowSlidePrev = !swiper.isLocked;
	  }

	  if (wasLocked && wasLocked !== swiper.isLocked) {
	    swiper.isEnd = false;
	  }

	  if (wasLocked !== swiper.isLocked) {
	    swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
	  }
	}

	var checkOverflow$1 = {
	  checkOverflow
	};

	var defaults$2 = {
	  init: true,
	  direction: 'horizontal',
	  touchEventsTarget: 'wrapper',
	  initialSlide: 0,
	  speed: 300,
	  cssMode: false,
	  updateOnWindowResize: true,
	  resizeObserver: true,
	  nested: false,
	  createElements: false,
	  enabled: true,
	  focusableElements: 'input, select, option, textarea, button, video, label',
	  // Overrides
	  width: null,
	  height: null,
	  //
	  preventInteractionOnTransition: false,
	  // ssr
	  userAgent: null,
	  url: null,
	  // To support iOS's swipe-to-go-back gesture (when being used in-app).
	  edgeSwipeDetection: false,
	  edgeSwipeThreshold: 20,
	  // Autoheight
	  autoHeight: false,
	  // Set wrapper width
	  setWrapperSize: false,
	  // Virtual Translate
	  virtualTranslate: false,
	  // Effects
	  effect: 'slide',
	  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
	  // Breakpoints
	  breakpoints: undefined,
	  breakpointsBase: 'window',
	  // Slides grid
	  spaceBetween: 0,
	  slidesPerView: 1,
	  slidesPerGroup: 1,
	  slidesPerGroupSkip: 0,
	  slidesPerGroupAuto: false,
	  centeredSlides: false,
	  centeredSlidesBounds: false,
	  slidesOffsetBefore: 0,
	  // in px
	  slidesOffsetAfter: 0,
	  // in px
	  normalizeSlideIndex: true,
	  centerInsufficientSlides: false,
	  // Disable swiper and hide navigation when container not overflow
	  watchOverflow: true,
	  // Round length
	  roundLengths: false,
	  // Touches
	  touchRatio: 1,
	  touchAngle: 45,
	  simulateTouch: true,
	  shortSwipes: true,
	  longSwipes: true,
	  longSwipesRatio: 0.5,
	  longSwipesMs: 300,
	  followFinger: true,
	  allowTouchMove: true,
	  threshold: 0,
	  touchMoveStopPropagation: false,
	  touchStartPreventDefault: true,
	  touchStartForcePreventDefault: false,
	  touchReleaseOnEdges: false,
	  // Unique Navigation Elements
	  uniqueNavElements: true,
	  // Resistance
	  resistance: true,
	  resistanceRatio: 0.85,
	  // Progress
	  watchSlidesProgress: false,
	  // Cursor
	  grabCursor: false,
	  // Clicks
	  preventClicks: true,
	  preventClicksPropagation: true,
	  slideToClickedSlide: false,
	  // Images
	  preloadImages: true,
	  updateOnImagesReady: true,
	  // loop
	  loop: false,
	  loopAdditionalSlides: 0,
	  loopedSlides: null,
	  loopFillGroupWithBlank: false,
	  loopPreventsSlide: true,
	  // rewind
	  rewind: false,
	  // Swiping/no swiping
	  allowSlidePrev: true,
	  allowSlideNext: true,
	  swipeHandler: null,
	  // '.swipe-handler',
	  noSwiping: true,
	  noSwipingClass: 'swiper-no-swiping',
	  noSwipingSelector: null,
	  // Passive Listeners
	  passiveListeners: true,
	  maxBackfaceHiddenSlides: 10,
	  // NS
	  containerModifierClass: 'swiper-',
	  // NEW
	  slideClass: 'swiper-slide',
	  slideBlankClass: 'swiper-slide-invisible-blank',
	  slideActiveClass: 'swiper-slide-active',
	  slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
	  slideVisibleClass: 'swiper-slide-visible',
	  slideDuplicateClass: 'swiper-slide-duplicate',
	  slideNextClass: 'swiper-slide-next',
	  slideDuplicateNextClass: 'swiper-slide-duplicate-next',
	  slidePrevClass: 'swiper-slide-prev',
	  slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
	  wrapperClass: 'swiper-wrapper',
	  // Callbacks
	  runCallbacksOnInit: true,
	  // Internals
	  _emitClasses: false
	};

	function moduleExtendParams(params, allModulesParams) {
	  return function extendParams(obj) {
	    if (obj === void 0) {
	      obj = {};
	    }

	    const moduleParamName = Object.keys(obj)[0];
	    const moduleParams = obj[moduleParamName];

	    if (typeof moduleParams !== 'object' || moduleParams === null) {
	      extend$2(allModulesParams, obj);
	      return;
	    }

	    if (['navigation', 'pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] === true) {
	      params[moduleParamName] = {
	        auto: true
	      };
	    }

	    if (!(moduleParamName in params && 'enabled' in moduleParams)) {
	      extend$2(allModulesParams, obj);
	      return;
	    }

	    if (params[moduleParamName] === true) {
	      params[moduleParamName] = {
	        enabled: true
	      };
	    }

	    if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
	      params[moduleParamName].enabled = true;
	    }

	    if (!params[moduleParamName]) params[moduleParamName] = {
	      enabled: false
	    };
	    extend$2(allModulesParams, obj);
	  };
	}

	/* eslint no-param-reassign: "off" */
	const prototypes = {
	  eventsEmitter,
	  update,
	  translate,
	  transition,
	  slide,
	  loop,
	  grabCursor,
	  events: events$1,
	  breakpoints,
	  checkOverflow: checkOverflow$1,
	  classes,
	  images
	};
	const extendedDefaults = {};

	class Swiper {
	  constructor() {
	    let el;
	    let params;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
	      params = args[0];
	    } else {
	      [el, params] = args;
	    }

	    if (!params) params = {};
	    params = extend$2({}, params);
	    if (el && !params.el) params.el = el;

	    if (params.el && $(params.el).length > 1) {
	      const swipers = [];
	      $(params.el).each(containerEl => {
	        const newParams = extend$2({}, params, {
	          el: containerEl
	        });
	        swipers.push(new Swiper(newParams));
	      });
	      return swipers;
	    } // Swiper Instance


	    const swiper = this;
	    swiper.__swiper__ = true;
	    swiper.support = getSupport();
	    swiper.device = getDevice({
	      userAgent: params.userAgent
	    });
	    swiper.browser = getBrowser();
	    swiper.eventsListeners = {};
	    swiper.eventsAnyListeners = [];
	    swiper.modules = [...swiper.__modules__];

	    if (params.modules && Array.isArray(params.modules)) {
	      swiper.modules.push(...params.modules);
	    }

	    const allModulesParams = {};
	    swiper.modules.forEach(mod => {
	      mod({
	        swiper,
	        extendParams: moduleExtendParams(params, allModulesParams),
	        on: swiper.on.bind(swiper),
	        once: swiper.once.bind(swiper),
	        off: swiper.off.bind(swiper),
	        emit: swiper.emit.bind(swiper)
	      });
	    }); // Extend defaults with modules params

	    const swiperParams = extend$2({}, defaults$2, allModulesParams); // Extend defaults with passed params

	    swiper.params = extend$2({}, swiperParams, extendedDefaults, params);
	    swiper.originalParams = extend$2({}, swiper.params);
	    swiper.passedParams = extend$2({}, params); // add event listeners

	    if (swiper.params && swiper.params.on) {
	      Object.keys(swiper.params.on).forEach(eventName => {
	        swiper.on(eventName, swiper.params.on[eventName]);
	      });
	    }

	    if (swiper.params && swiper.params.onAny) {
	      swiper.onAny(swiper.params.onAny);
	    } // Save Dom lib


	    swiper.$ = $; // Extend Swiper

	    Object.assign(swiper, {
	      enabled: swiper.params.enabled,
	      el,
	      // Classes
	      classNames: [],
	      // Slides
	      slides: $(),
	      slidesGrid: [],
	      snapGrid: [],
	      slidesSizesGrid: [],

	      // isDirection
	      isHorizontal() {
	        return swiper.params.direction === 'horizontal';
	      },

	      isVertical() {
	        return swiper.params.direction === 'vertical';
	      },

	      // Indexes
	      activeIndex: 0,
	      realIndex: 0,
	      //
	      isBeginning: true,
	      isEnd: false,
	      // Props
	      translate: 0,
	      previousTranslate: 0,
	      progress: 0,
	      velocity: 0,
	      animating: false,
	      // Locks
	      allowSlideNext: swiper.params.allowSlideNext,
	      allowSlidePrev: swiper.params.allowSlidePrev,
	      // Touch Events
	      touchEvents: function touchEvents() {
	        const touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
	        const desktop = ['pointerdown', 'pointermove', 'pointerup'];
	        swiper.touchEventsTouch = {
	          start: touch[0],
	          move: touch[1],
	          end: touch[2],
	          cancel: touch[3]
	        };
	        swiper.touchEventsDesktop = {
	          start: desktop[0],
	          move: desktop[1],
	          end: desktop[2]
	        };
	        return swiper.support.touch || !swiper.params.simulateTouch ? swiper.touchEventsTouch : swiper.touchEventsDesktop;
	      }(),
	      touchEventsData: {
	        isTouched: undefined,
	        isMoved: undefined,
	        allowTouchCallbacks: undefined,
	        touchStartTime: undefined,
	        isScrolling: undefined,
	        currentTranslate: undefined,
	        startTranslate: undefined,
	        allowThresholdMove: undefined,
	        // Form elements to match
	        focusableElements: swiper.params.focusableElements,
	        // Last click time
	        lastClickTime: now(),
	        clickTimeout: undefined,
	        // Velocities
	        velocities: [],
	        allowMomentumBounce: undefined,
	        isTouchEvent: undefined,
	        startMoving: undefined
	      },
	      // Clicks
	      allowClick: true,
	      // Touches
	      allowTouchMove: swiper.params.allowTouchMove,
	      touches: {
	        startX: 0,
	        startY: 0,
	        currentX: 0,
	        currentY: 0,
	        diff: 0
	      },
	      // Images
	      imagesToLoad: [],
	      imagesLoaded: 0
	    });
	    swiper.emit('_swiper'); // Init

	    if (swiper.params.init) {
	      swiper.init();
	    } // Return app instance


	    return swiper;
	  }

	  enable() {
	    const swiper = this;
	    if (swiper.enabled) return;
	    swiper.enabled = true;

	    if (swiper.params.grabCursor) {
	      swiper.setGrabCursor();
	    }

	    swiper.emit('enable');
	  }

	  disable() {
	    const swiper = this;
	    if (!swiper.enabled) return;
	    swiper.enabled = false;

	    if (swiper.params.grabCursor) {
	      swiper.unsetGrabCursor();
	    }

	    swiper.emit('disable');
	  }

	  setProgress(progress, speed) {
	    const swiper = this;
	    progress = Math.min(Math.max(progress, 0), 1);
	    const min = swiper.minTranslate();
	    const max = swiper.maxTranslate();
	    const current = (max - min) * progress + min;
	    swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
	    swiper.updateActiveIndex();
	    swiper.updateSlidesClasses();
	  }

	  emitContainerClasses() {
	    const swiper = this;
	    if (!swiper.params._emitClasses || !swiper.el) return;
	    const cls = swiper.el.className.split(' ').filter(className => {
	      return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
	    });
	    swiper.emit('_containerClasses', cls.join(' '));
	  }

	  getSlideClasses(slideEl) {
	    const swiper = this;
	    if (swiper.destroyed) return '';
	    return slideEl.className.split(' ').filter(className => {
	      return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
	    }).join(' ');
	  }

	  emitSlidesClasses() {
	    const swiper = this;
	    if (!swiper.params._emitClasses || !swiper.el) return;
	    const updates = [];
	    swiper.slides.each(slideEl => {
	      const classNames = swiper.getSlideClasses(slideEl);
	      updates.push({
	        slideEl,
	        classNames
	      });
	      swiper.emit('_slideClass', slideEl, classNames);
	    });
	    swiper.emit('_slideClasses', updates);
	  }

	  slidesPerViewDynamic(view, exact) {
	    if (view === void 0) {
	      view = 'current';
	    }

	    if (exact === void 0) {
	      exact = false;
	    }

	    const swiper = this;
	    const {
	      params,
	      slides,
	      slidesGrid,
	      slidesSizesGrid,
	      size: swiperSize,
	      activeIndex
	    } = swiper;
	    let spv = 1;

	    if (params.centeredSlides) {
	      let slideSize = slides[activeIndex].swiperSlideSize;
	      let breakLoop;

	      for (let i = activeIndex + 1; i < slides.length; i += 1) {
	        if (slides[i] && !breakLoop) {
	          slideSize += slides[i].swiperSlideSize;
	          spv += 1;
	          if (slideSize > swiperSize) breakLoop = true;
	        }
	      }

	      for (let i = activeIndex - 1; i >= 0; i -= 1) {
	        if (slides[i] && !breakLoop) {
	          slideSize += slides[i].swiperSlideSize;
	          spv += 1;
	          if (slideSize > swiperSize) breakLoop = true;
	        }
	      }
	    } else {
	      // eslint-disable-next-line
	      if (view === 'current') {
	        for (let i = activeIndex + 1; i < slides.length; i += 1) {
	          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;

	          if (slideInView) {
	            spv += 1;
	          }
	        }
	      } else {
	        // previous
	        for (let i = activeIndex - 1; i >= 0; i -= 1) {
	          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;

	          if (slideInView) {
	            spv += 1;
	          }
	        }
	      }
	    }

	    return spv;
	  }

	  update() {
	    const swiper = this;
	    if (!swiper || swiper.destroyed) return;
	    const {
	      snapGrid,
	      params
	    } = swiper; // Breakpoints

	    if (params.breakpoints) {
	      swiper.setBreakpoint();
	    }

	    swiper.updateSize();
	    swiper.updateSlides();
	    swiper.updateProgress();
	    swiper.updateSlidesClasses();

	    function setTranslate() {
	      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
	      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
	      swiper.setTranslate(newTranslate);
	      swiper.updateActiveIndex();
	      swiper.updateSlidesClasses();
	    }

	    let translated;

	    if (swiper.params.freeMode && swiper.params.freeMode.enabled) {
	      setTranslate();

	      if (swiper.params.autoHeight) {
	        swiper.updateAutoHeight();
	      }
	    } else {
	      if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
	        translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
	      } else {
	        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
	      }

	      if (!translated) {
	        setTranslate();
	      }
	    }

	    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
	      swiper.checkOverflow();
	    }

	    swiper.emit('update');
	  }

	  changeDirection(newDirection, needUpdate) {
	    if (needUpdate === void 0) {
	      needUpdate = true;
	    }

	    const swiper = this;
	    const currentDirection = swiper.params.direction;

	    if (!newDirection) {
	      // eslint-disable-next-line
	      newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
	    }

	    if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
	      return swiper;
	    }

	    swiper.$el.removeClass(`${swiper.params.containerModifierClass}${currentDirection}`).addClass(`${swiper.params.containerModifierClass}${newDirection}`);
	    swiper.emitContainerClasses();
	    swiper.params.direction = newDirection;
	    swiper.slides.each(slideEl => {
	      if (newDirection === 'vertical') {
	        slideEl.style.width = '';
	      } else {
	        slideEl.style.height = '';
	      }
	    });
	    swiper.emit('changeDirection');
	    if (needUpdate) swiper.update();
	    return swiper;
	  }

	  changeLanguageDirection(direction) {
	    const swiper = this;
	    if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
	    swiper.rtl = direction === 'rtl';
	    swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;

	    if (swiper.rtl) {
	      swiper.$el.addClass(`${swiper.params.containerModifierClass}rtl`);
	      swiper.el.dir = 'rtl';
	    } else {
	      swiper.$el.removeClass(`${swiper.params.containerModifierClass}rtl`);
	      swiper.el.dir = 'ltr';
	    }

	    swiper.update();
	  }

	  mount(el) {
	    const swiper = this;
	    if (swiper.mounted) return true; // Find el

	    const $el = $(el || swiper.params.el);
	    el = $el[0];

	    if (!el) {
	      return false;
	    }

	    el.swiper = swiper;

	    const getWrapperSelector = () => {
	      return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
	    };

	    const getWrapper = () => {
	      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
	        const res = $(el.shadowRoot.querySelector(getWrapperSelector())); // Children needs to return slot items

	        res.children = options => $el.children(options);

	        return res;
	      }

	      if (!$el.children) {
	        return $($el).children(getWrapperSelector());
	      }

	      return $el.children(getWrapperSelector());
	    }; // Find Wrapper


	    let $wrapperEl = getWrapper();

	    if ($wrapperEl.length === 0 && swiper.params.createElements) {
	      const document = getDocument();
	      const wrapper = document.createElement('div');
	      $wrapperEl = $(wrapper);
	      wrapper.className = swiper.params.wrapperClass;
	      $el.append(wrapper);
	      $el.children(`.${swiper.params.slideClass}`).each(slideEl => {
	        $wrapperEl.append(slideEl);
	      });
	    }

	    Object.assign(swiper, {
	      $el,
	      el,
	      $wrapperEl,
	      wrapperEl: $wrapperEl[0],
	      mounted: true,
	      // RTL
	      rtl: el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl',
	      rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
	      wrongRTL: $wrapperEl.css('display') === '-webkit-box'
	    });
	    return true;
	  }

	  init(el) {
	    const swiper = this;
	    if (swiper.initialized) return swiper;
	    const mounted = swiper.mount(el);
	    if (mounted === false) return swiper;
	    swiper.emit('beforeInit'); // Set breakpoint

	    if (swiper.params.breakpoints) {
	      swiper.setBreakpoint();
	    } // Add Classes


	    swiper.addClasses(); // Create loop

	    if (swiper.params.loop) {
	      swiper.loopCreate();
	    } // Update size


	    swiper.updateSize(); // Update slides

	    swiper.updateSlides();

	    if (swiper.params.watchOverflow) {
	      swiper.checkOverflow();
	    } // Set Grab Cursor


	    if (swiper.params.grabCursor && swiper.enabled) {
	      swiper.setGrabCursor();
	    }

	    if (swiper.params.preloadImages) {
	      swiper.preloadImages();
	    } // Slide To Initial Slide


	    if (swiper.params.loop) {
	      swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit, false, true);
	    } else {
	      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
	    } // Attach events


	    swiper.attachEvents(); // Init Flag

	    swiper.initialized = true; // Emit

	    swiper.emit('init');
	    swiper.emit('afterInit');
	    return swiper;
	  }

	  destroy(deleteInstance, cleanStyles) {
	    if (deleteInstance === void 0) {
	      deleteInstance = true;
	    }

	    if (cleanStyles === void 0) {
	      cleanStyles = true;
	    }

	    const swiper = this;
	    const {
	      params,
	      $el,
	      $wrapperEl,
	      slides
	    } = swiper;

	    if (typeof swiper.params === 'undefined' || swiper.destroyed) {
	      return null;
	    }

	    swiper.emit('beforeDestroy'); // Init Flag

	    swiper.initialized = false; // Detach events

	    swiper.detachEvents(); // Destroy loop

	    if (params.loop) {
	      swiper.loopDestroy();
	    } // Cleanup styles


	    if (cleanStyles) {
	      swiper.removeClasses();
	      $el.removeAttr('style');
	      $wrapperEl.removeAttr('style');

	      if (slides && slides.length) {
	        slides.removeClass([params.slideVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass].join(' ')).removeAttr('style').removeAttr('data-swiper-slide-index');
	      }
	    }

	    swiper.emit('destroy'); // Detach emitter events

	    Object.keys(swiper.eventsListeners).forEach(eventName => {
	      swiper.off(eventName);
	    });

	    if (deleteInstance !== false) {
	      swiper.$el[0].swiper = null;
	      deleteProps(swiper);
	    }

	    swiper.destroyed = true;
	    return null;
	  }

	  static extendDefaults(newDefaults) {
	    extend$2(extendedDefaults, newDefaults);
	  }

	  static get extendedDefaults() {
	    return extendedDefaults;
	  }

	  static get defaults() {
	    return defaults$2;
	  }

	  static installModule(mod) {
	    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
	    const modules = Swiper.prototype.__modules__;

	    if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
	      modules.push(mod);
	    }
	  }

	  static use(module) {
	    if (Array.isArray(module)) {
	      module.forEach(m => Swiper.installModule(m));
	      return Swiper;
	    }

	    Swiper.installModule(module);
	    return Swiper;
	  }

	}

	Object.keys(prototypes).forEach(prototypeGroup => {
	  Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
	    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
	  });
	});
	Swiper.use([Resize, Observer]);

	function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
	  const document = getDocument();

	  if (swiper.params.createElements) {
	    Object.keys(checkProps).forEach(key => {
	      if (!params[key] && params.auto === true) {
	        let element = swiper.$el.children(`.${checkProps[key]}`)[0];

	        if (!element) {
	          element = document.createElement('div');
	          element.className = checkProps[key];
	          swiper.$el.append(element);
	        }

	        params[key] = element;
	        originalParams[key] = element;
	      }
	    });
	  }

	  return params;
	}

	function Navigation(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  extendParams({
	    navigation: {
	      nextEl: null,
	      prevEl: null,
	      hideOnClick: false,
	      disabledClass: 'swiper-button-disabled',
	      hiddenClass: 'swiper-button-hidden',
	      lockClass: 'swiper-button-lock',
	      navigationDisabledClass: 'swiper-navigation-disabled'
	    }
	  });
	  swiper.navigation = {
	    nextEl: null,
	    $nextEl: null,
	    prevEl: null,
	    $prevEl: null
	  };

	  function getEl(el) {
	    let $el;

	    if (el) {
	      $el = $(el);

	      if (swiper.params.uniqueNavElements && typeof el === 'string' && $el.length > 1 && swiper.$el.find(el).length === 1) {
	        $el = swiper.$el.find(el);
	      }
	    }

	    return $el;
	  }

	  function toggleEl($el, disabled) {
	    const params = swiper.params.navigation;

	    if ($el && $el.length > 0) {
	      $el[disabled ? 'addClass' : 'removeClass'](params.disabledClass);
	      if ($el[0] && $el[0].tagName === 'BUTTON') $el[0].disabled = disabled;

	      if (swiper.params.watchOverflow && swiper.enabled) {
	        $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
	      }
	    }
	  }

	  function update() {
	    // Update Navigation Buttons
	    if (swiper.params.loop) return;
	    const {
	      $nextEl,
	      $prevEl
	    } = swiper.navigation;
	    toggleEl($prevEl, swiper.isBeginning && !swiper.params.rewind);
	    toggleEl($nextEl, swiper.isEnd && !swiper.params.rewind);
	  }

	  function onPrevClick(e) {
	    e.preventDefault();
	    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
	    swiper.slidePrev();
	    emit('navigationPrev');
	  }

	  function onNextClick(e) {
	    e.preventDefault();
	    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
	    swiper.slideNext();
	    emit('navigationNext');
	  }

	  function init() {
	    const params = swiper.params.navigation;
	    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
	      nextEl: 'swiper-button-next',
	      prevEl: 'swiper-button-prev'
	    });
	    if (!(params.nextEl || params.prevEl)) return;
	    const $nextEl = getEl(params.nextEl);
	    const $prevEl = getEl(params.prevEl);

	    if ($nextEl && $nextEl.length > 0) {
	      $nextEl.on('click', onNextClick);
	    }

	    if ($prevEl && $prevEl.length > 0) {
	      $prevEl.on('click', onPrevClick);
	    }

	    Object.assign(swiper.navigation, {
	      $nextEl,
	      nextEl: $nextEl && $nextEl[0],
	      $prevEl,
	      prevEl: $prevEl && $prevEl[0]
	    });

	    if (!swiper.enabled) {
	      if ($nextEl) $nextEl.addClass(params.lockClass);
	      if ($prevEl) $prevEl.addClass(params.lockClass);
	    }
	  }

	  function destroy() {
	    const {
	      $nextEl,
	      $prevEl
	    } = swiper.navigation;

	    if ($nextEl && $nextEl.length) {
	      $nextEl.off('click', onNextClick);
	      $nextEl.removeClass(swiper.params.navigation.disabledClass);
	    }

	    if ($prevEl && $prevEl.length) {
	      $prevEl.off('click', onPrevClick);
	      $prevEl.removeClass(swiper.params.navigation.disabledClass);
	    }
	  }

	  on('init', () => {
	    if (swiper.params.navigation.enabled === false) {
	      // eslint-disable-next-line
	      disable();
	    } else {
	      init();
	      update();
	    }
	  });
	  on('toEdge fromEdge lock unlock', () => {
	    update();
	  });
	  on('destroy', () => {
	    destroy();
	  });
	  on('enable disable', () => {
	    const {
	      $nextEl,
	      $prevEl
	    } = swiper.navigation;

	    if ($nextEl) {
	      $nextEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
	    }

	    if ($prevEl) {
	      $prevEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
	    }
	  });
	  on('click', (_s, e) => {
	    const {
	      $nextEl,
	      $prevEl
	    } = swiper.navigation;
	    const targetEl = e.target;

	    if (swiper.params.navigation.hideOnClick && !$(targetEl).is($prevEl) && !$(targetEl).is($nextEl)) {
	      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
	      let isHidden;

	      if ($nextEl) {
	        isHidden = $nextEl.hasClass(swiper.params.navigation.hiddenClass);
	      } else if ($prevEl) {
	        isHidden = $prevEl.hasClass(swiper.params.navigation.hiddenClass);
	      }

	      if (isHidden === true) {
	        emit('navigationShow');
	      } else {
	        emit('navigationHide');
	      }

	      if ($nextEl) {
	        $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
	      }

	      if ($prevEl) {
	        $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
	      }
	    }
	  });

	  const enable = () => {
	    swiper.$el.removeClass(swiper.params.navigation.navigationDisabledClass);
	    init();
	    update();
	  };

	  const disable = () => {
	    swiper.$el.addClass(swiper.params.navigation.navigationDisabledClass);
	    destroy();
	  };

	  Object.assign(swiper.navigation, {
	    enable,
	    disable,
	    update,
	    init,
	    destroy
	  });
	}

	function classesToSelector(classes) {
	  if (classes === void 0) {
	    classes = '';
	  }

	  return `.${classes.trim().replace(/([\.:!\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
	}

	function Pagination(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  const pfx = 'swiper-pagination';
	  extendParams({
	    pagination: {
	      el: null,
	      bulletElement: 'span',
	      clickable: false,
	      hideOnClick: false,
	      renderBullet: null,
	      renderProgressbar: null,
	      renderFraction: null,
	      renderCustom: null,
	      progressbarOpposite: false,
	      type: 'bullets',
	      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
	      dynamicBullets: false,
	      dynamicMainBullets: 1,
	      formatFractionCurrent: number => number,
	      formatFractionTotal: number => number,
	      bulletClass: `${pfx}-bullet`,
	      bulletActiveClass: `${pfx}-bullet-active`,
	      modifierClass: `${pfx}-`,
	      currentClass: `${pfx}-current`,
	      totalClass: `${pfx}-total`,
	      hiddenClass: `${pfx}-hidden`,
	      progressbarFillClass: `${pfx}-progressbar-fill`,
	      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
	      clickableClass: `${pfx}-clickable`,
	      lockClass: `${pfx}-lock`,
	      horizontalClass: `${pfx}-horizontal`,
	      verticalClass: `${pfx}-vertical`,
	      paginationDisabledClass: `${pfx}-disabled`
	    }
	  });
	  swiper.pagination = {
	    el: null,
	    $el: null,
	    bullets: []
	  };
	  let bulletSize;
	  let dynamicBulletIndex = 0;

	  function isPaginationDisabled() {
	    return !swiper.params.pagination.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0;
	  }

	  function setSideBullets($bulletEl, position) {
	    const {
	      bulletActiveClass
	    } = swiper.params.pagination;
	    $bulletEl[position]().addClass(`${bulletActiveClass}-${position}`)[position]().addClass(`${bulletActiveClass}-${position}-${position}`);
	  }

	  function update() {
	    // Render || Update Pagination bullets/items
	    const rtl = swiper.rtl;
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
	    const $el = swiper.pagination.$el; // Current/Total

	    let current;
	    const total = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

	    if (swiper.params.loop) {
	      current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);

	      if (current > slidesLength - 1 - swiper.loopedSlides * 2) {
	        current -= slidesLength - swiper.loopedSlides * 2;
	      }

	      if (current > total - 1) current -= total;
	      if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
	    } else if (typeof swiper.snapIndex !== 'undefined') {
	      current = swiper.snapIndex;
	    } else {
	      current = swiper.activeIndex || 0;
	    } // Types


	    if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
	      const bullets = swiper.pagination.bullets;
	      let firstIndex;
	      let lastIndex;
	      let midIndex;

	      if (params.dynamicBullets) {
	        bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
	        $el.css(swiper.isHorizontal() ? 'width' : 'height', `${bulletSize * (params.dynamicMainBullets + 4)}px`);

	        if (params.dynamicMainBullets > 1 && swiper.previousIndex !== undefined) {
	          dynamicBulletIndex += current - (swiper.previousIndex - swiper.loopedSlides || 0);

	          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
	            dynamicBulletIndex = params.dynamicMainBullets - 1;
	          } else if (dynamicBulletIndex < 0) {
	            dynamicBulletIndex = 0;
	          }
	        }

	        firstIndex = Math.max(current - dynamicBulletIndex, 0);
	        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
	        midIndex = (lastIndex + firstIndex) / 2;
	      }

	      bullets.removeClass(['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`).join(' '));

	      if ($el.length > 1) {
	        bullets.each(bullet => {
	          const $bullet = $(bullet);
	          const bulletIndex = $bullet.index();

	          if (bulletIndex === current) {
	            $bullet.addClass(params.bulletActiveClass);
	          }

	          if (params.dynamicBullets) {
	            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
	              $bullet.addClass(`${params.bulletActiveClass}-main`);
	            }

	            if (bulletIndex === firstIndex) {
	              setSideBullets($bullet, 'prev');
	            }

	            if (bulletIndex === lastIndex) {
	              setSideBullets($bullet, 'next');
	            }
	          }
	        });
	      } else {
	        const $bullet = bullets.eq(current);
	        const bulletIndex = $bullet.index();
	        $bullet.addClass(params.bulletActiveClass);

	        if (params.dynamicBullets) {
	          const $firstDisplayedBullet = bullets.eq(firstIndex);
	          const $lastDisplayedBullet = bullets.eq(lastIndex);

	          for (let i = firstIndex; i <= lastIndex; i += 1) {
	            bullets.eq(i).addClass(`${params.bulletActiveClass}-main`);
	          }

	          if (swiper.params.loop) {
	            if (bulletIndex >= bullets.length) {
	              for (let i = params.dynamicMainBullets; i >= 0; i -= 1) {
	                bullets.eq(bullets.length - i).addClass(`${params.bulletActiveClass}-main`);
	              }

	              bullets.eq(bullets.length - params.dynamicMainBullets - 1).addClass(`${params.bulletActiveClass}-prev`);
	            } else {
	              setSideBullets($firstDisplayedBullet, 'prev');
	              setSideBullets($lastDisplayedBullet, 'next');
	            }
	          } else {
	            setSideBullets($firstDisplayedBullet, 'prev');
	            setSideBullets($lastDisplayedBullet, 'next');
	          }
	        }
	      }

	      if (params.dynamicBullets) {
	        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
	        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
	        const offsetProp = rtl ? 'right' : 'left';
	        bullets.css(swiper.isHorizontal() ? offsetProp : 'top', `${bulletsOffset}px`);
	      }
	    }

	    if (params.type === 'fraction') {
	      $el.find(classesToSelector(params.currentClass)).text(params.formatFractionCurrent(current + 1));
	      $el.find(classesToSelector(params.totalClass)).text(params.formatFractionTotal(total));
	    }

	    if (params.type === 'progressbar') {
	      let progressbarDirection;

	      if (params.progressbarOpposite) {
	        progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
	      } else {
	        progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
	      }

	      const scale = (current + 1) / total;
	      let scaleX = 1;
	      let scaleY = 1;

	      if (progressbarDirection === 'horizontal') {
	        scaleX = scale;
	      } else {
	        scaleY = scale;
	      }

	      $el.find(classesToSelector(params.progressbarFillClass)).transform(`translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`).transition(swiper.params.speed);
	    }

	    if (params.type === 'custom' && params.renderCustom) {
	      $el.html(params.renderCustom(swiper, current + 1, total));
	      emit('paginationRender', $el[0]);
	    } else {
	      emit('paginationUpdate', $el[0]);
	    }

	    if (swiper.params.watchOverflow && swiper.enabled) {
	      $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
	    }
	  }

	  function render() {
	    // Render Container
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
	    const $el = swiper.pagination.$el;
	    let paginationHTML = '';

	    if (params.type === 'bullets') {
	      let numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

	      if (swiper.params.freeMode && swiper.params.freeMode.enabled && !swiper.params.loop && numberOfBullets > slidesLength) {
	        numberOfBullets = slidesLength;
	      }

	      for (let i = 0; i < numberOfBullets; i += 1) {
	        if (params.renderBullet) {
	          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
	        } else {
	          paginationHTML += `<${params.bulletElement} class="${params.bulletClass}"></${params.bulletElement}>`;
	        }
	      }

	      $el.html(paginationHTML);
	      swiper.pagination.bullets = $el.find(classesToSelector(params.bulletClass));
	    }

	    if (params.type === 'fraction') {
	      if (params.renderFraction) {
	        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
	      } else {
	        paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
	      }

	      $el.html(paginationHTML);
	    }

	    if (params.type === 'progressbar') {
	      if (params.renderProgressbar) {
	        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
	      } else {
	        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
	      }

	      $el.html(paginationHTML);
	    }

	    if (params.type !== 'custom') {
	      emit('paginationRender', swiper.pagination.$el[0]);
	    }
	  }

	  function init() {
	    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
	      el: 'swiper-pagination'
	    });
	    const params = swiper.params.pagination;
	    if (!params.el) return;
	    let $el = $(params.el);
	    if ($el.length === 0) return;

	    if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1) {
	      $el = swiper.$el.find(params.el); // check if it belongs to another nested Swiper

	      if ($el.length > 1) {
	        $el = $el.filter(el => {
	          if ($(el).parents('.swiper')[0] !== swiper.el) return false;
	          return true;
	        });
	      }
	    }

	    if (params.type === 'bullets' && params.clickable) {
	      $el.addClass(params.clickableClass);
	    }

	    $el.addClass(params.modifierClass + params.type);
	    $el.addClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);

	    if (params.type === 'bullets' && params.dynamicBullets) {
	      $el.addClass(`${params.modifierClass}${params.type}-dynamic`);
	      dynamicBulletIndex = 0;

	      if (params.dynamicMainBullets < 1) {
	        params.dynamicMainBullets = 1;
	      }
	    }

	    if (params.type === 'progressbar' && params.progressbarOpposite) {
	      $el.addClass(params.progressbarOppositeClass);
	    }

	    if (params.clickable) {
	      $el.on('click', classesToSelector(params.bulletClass), function onClick(e) {
	        e.preventDefault();
	        let index = $(this).index() * swiper.params.slidesPerGroup;
	        if (swiper.params.loop) index += swiper.loopedSlides;
	        swiper.slideTo(index);
	      });
	    }

	    Object.assign(swiper.pagination, {
	      $el,
	      el: $el[0]
	    });

	    if (!swiper.enabled) {
	      $el.addClass(params.lockClass);
	    }
	  }

	  function destroy() {
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    const $el = swiper.pagination.$el;
	    $el.removeClass(params.hiddenClass);
	    $el.removeClass(params.modifierClass + params.type);
	    $el.removeClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
	    if (swiper.pagination.bullets && swiper.pagination.bullets.removeClass) swiper.pagination.bullets.removeClass(params.bulletActiveClass);

	    if (params.clickable) {
	      $el.off('click', classesToSelector(params.bulletClass));
	    }
	  }

	  on('init', () => {
	    if (swiper.params.pagination.enabled === false) {
	      // eslint-disable-next-line
	      disable();
	    } else {
	      init();
	      render();
	      update();
	    }
	  });
	  on('activeIndexChange', () => {
	    if (swiper.params.loop) {
	      update();
	    } else if (typeof swiper.snapIndex === 'undefined') {
	      update();
	    }
	  });
	  on('snapIndexChange', () => {
	    if (!swiper.params.loop) {
	      update();
	    }
	  });
	  on('slidesLengthChange', () => {
	    if (swiper.params.loop) {
	      render();
	      update();
	    }
	  });
	  on('snapGridLengthChange', () => {
	    if (!swiper.params.loop) {
	      render();
	      update();
	    }
	  });
	  on('destroy', () => {
	    destroy();
	  });
	  on('enable disable', () => {
	    const {
	      $el
	    } = swiper.pagination;

	    if ($el) {
	      $el[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.pagination.lockClass);
	    }
	  });
	  on('lock unlock', () => {
	    update();
	  });
	  on('click', (_s, e) => {
	    const targetEl = e.target;
	    const {
	      $el
	    } = swiper.pagination;

	    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && $el && $el.length > 0 && !$(targetEl).hasClass(swiper.params.pagination.bulletClass)) {
	      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
	      const isHidden = $el.hasClass(swiper.params.pagination.hiddenClass);

	      if (isHidden === true) {
	        emit('paginationShow');
	      } else {
	        emit('paginationHide');
	      }

	      $el.toggleClass(swiper.params.pagination.hiddenClass);
	    }
	  });

	  const enable = () => {
	    swiper.$el.removeClass(swiper.params.pagination.paginationDisabledClass);

	    if (swiper.pagination.$el) {
	      swiper.pagination.$el.removeClass(swiper.params.pagination.paginationDisabledClass);
	    }

	    init();
	    render();
	    update();
	  };

	  const disable = () => {
	    swiper.$el.addClass(swiper.params.pagination.paginationDisabledClass);

	    if (swiper.pagination.$el) {
	      swiper.pagination.$el.addClass(swiper.params.pagination.paginationDisabledClass);
	    }

	    destroy();
	  };

	  Object.assign(swiper.pagination, {
	    enable,
	    disable,
	    render,
	    update,
	    init,
	    destroy
	  });
	}

	/* eslint no-underscore-dangle: "off" */

	function Autoplay(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  let timeout;
	  swiper.autoplay = {
	    running: false,
	    paused: false
	  };
	  extendParams({
	    autoplay: {
	      enabled: false,
	      delay: 3000,
	      waitForTransition: true,
	      disableOnInteraction: true,
	      stopOnLastSlide: false,
	      reverseDirection: false,
	      pauseOnMouseEnter: false
	    }
	  });

	  function run() {
	    const $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
	    let delay = swiper.params.autoplay.delay;

	    if ($activeSlideEl.attr('data-swiper-autoplay')) {
	      delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
	    }

	    clearTimeout(timeout);
	    timeout = nextTick(() => {
	      let autoplayResult;

	      if (swiper.params.autoplay.reverseDirection) {
	        if (swiper.params.loop) {
	          swiper.loopFix();
	          autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
	          emit('autoplay');
	        } else if (!swiper.isBeginning) {
	          autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
	          emit('autoplay');
	        } else if (!swiper.params.autoplay.stopOnLastSlide) {
	          autoplayResult = swiper.slideTo(swiper.slides.length - 1, swiper.params.speed, true, true);
	          emit('autoplay');
	        } else {
	          stop();
	        }
	      } else if (swiper.params.loop) {
	        swiper.loopFix();
	        autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
	        emit('autoplay');
	      } else if (!swiper.isEnd) {
	        autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
	        emit('autoplay');
	      } else if (!swiper.params.autoplay.stopOnLastSlide) {
	        autoplayResult = swiper.slideTo(0, swiper.params.speed, true, true);
	        emit('autoplay');
	      } else {
	        stop();
	      }

	      if (swiper.params.cssMode && swiper.autoplay.running) run();else if (autoplayResult === false) {
	        run();
	      }
	    }, delay);
	  }

	  function start() {
	    if (typeof timeout !== 'undefined') return false;
	    if (swiper.autoplay.running) return false;
	    swiper.autoplay.running = true;
	    emit('autoplayStart');
	    run();
	    return true;
	  }

	  function stop() {
	    if (!swiper.autoplay.running) return false;
	    if (typeof timeout === 'undefined') return false;

	    if (timeout) {
	      clearTimeout(timeout);
	      timeout = undefined;
	    }

	    swiper.autoplay.running = false;
	    emit('autoplayStop');
	    return true;
	  }

	  function pause(speed) {
	    if (!swiper.autoplay.running) return;
	    if (swiper.autoplay.paused) return;
	    if (timeout) clearTimeout(timeout);
	    swiper.autoplay.paused = true;

	    if (speed === 0 || !swiper.params.autoplay.waitForTransition) {
	      swiper.autoplay.paused = false;
	      run();
	    } else {
	      ['transitionend', 'webkitTransitionEnd'].forEach(event => {
	        swiper.$wrapperEl[0].addEventListener(event, onTransitionEnd);
	      });
	    }
	  }

	  function onVisibilityChange() {
	    const document = getDocument();

	    if (document.visibilityState === 'hidden' && swiper.autoplay.running) {
	      pause();
	    }

	    if (document.visibilityState === 'visible' && swiper.autoplay.paused) {
	      run();
	      swiper.autoplay.paused = false;
	    }
	  }

	  function onTransitionEnd(e) {
	    if (!swiper || swiper.destroyed || !swiper.$wrapperEl) return;
	    if (e.target !== swiper.$wrapperEl[0]) return;
	    ['transitionend', 'webkitTransitionEnd'].forEach(event => {
	      swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
	    });
	    swiper.autoplay.paused = false;

	    if (!swiper.autoplay.running) {
	      stop();
	    } else {
	      run();
	    }
	  }

	  function onMouseEnter() {
	    if (swiper.params.autoplay.disableOnInteraction) {
	      stop();
	    } else {
	      emit('autoplayPause');
	      pause();
	    }

	    ['transitionend', 'webkitTransitionEnd'].forEach(event => {
	      swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
	    });
	  }

	  function onMouseLeave() {
	    if (swiper.params.autoplay.disableOnInteraction) {
	      return;
	    }

	    swiper.autoplay.paused = false;
	    emit('autoplayResume');
	    run();
	  }

	  function attachMouseEvents() {
	    if (swiper.params.autoplay.pauseOnMouseEnter) {
	      swiper.$el.on('mouseenter', onMouseEnter);
	      swiper.$el.on('mouseleave', onMouseLeave);
	    }
	  }

	  function detachMouseEvents() {
	    swiper.$el.off('mouseenter', onMouseEnter);
	    swiper.$el.off('mouseleave', onMouseLeave);
	  }

	  on('init', () => {
	    if (swiper.params.autoplay.enabled) {
	      start();
	      const document = getDocument();
	      document.addEventListener('visibilitychange', onVisibilityChange);
	      attachMouseEvents();
	    }
	  });
	  on('beforeTransitionStart', (_s, speed, internal) => {
	    if (swiper.autoplay.running) {
	      if (internal || !swiper.params.autoplay.disableOnInteraction) {
	        swiper.autoplay.pause(speed);
	      } else {
	        stop();
	      }
	    }
	  });
	  on('sliderFirstMove', () => {
	    if (swiper.autoplay.running) {
	      if (swiper.params.autoplay.disableOnInteraction) {
	        stop();
	      } else {
	        pause();
	      }
	    }
	  });
	  on('touchEnd', () => {
	    if (swiper.params.cssMode && swiper.autoplay.paused && !swiper.params.autoplay.disableOnInteraction) {
	      run();
	    }
	  });
	  on('destroy', () => {
	    detachMouseEvents();

	    if (swiper.autoplay.running) {
	      stop();
	    }

	    const document = getDocument();
	    document.removeEventListener('visibilitychange', onVisibilityChange);
	  });
	  Object.assign(swiper.autoplay, {
	    pause,
	    run,
	    start,
	    stop
	  });
	}

	function effectInit(params) {
	  const {
	    effect,
	    swiper,
	    on,
	    setTranslate,
	    setTransition,
	    overwriteParams,
	    perspective,
	    recreateShadows,
	    getEffectParams
	  } = params;
	  on('beforeInit', () => {
	    if (swiper.params.effect !== effect) return;
	    swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);

	    if (perspective && perspective()) {
	      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
	    }

	    const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
	    Object.assign(swiper.params, overwriteParamsResult);
	    Object.assign(swiper.originalParams, overwriteParamsResult);
	  });
	  on('setTranslate', () => {
	    if (swiper.params.effect !== effect) return;
	    setTranslate();
	  });
	  on('setTransition', (_s, duration) => {
	    if (swiper.params.effect !== effect) return;
	    setTransition(duration);
	  });
	  on('transitionEnd', () => {
	    if (swiper.params.effect !== effect) return;

	    if (recreateShadows) {
	      if (!getEffectParams || !getEffectParams().slideShadows) return; // remove shadows

	      swiper.slides.each(slideEl => {
	        const $slideEl = swiper.$(slideEl);
	        $slideEl.find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').remove();
	      }); // create new one

	      recreateShadows();
	    }
	  });
	  let requireUpdateOnVirtual;
	  on('virtualUpdate', () => {
	    if (swiper.params.effect !== effect) return;

	    if (!swiper.slides.length) {
	      requireUpdateOnVirtual = true;
	    }

	    requestAnimationFrame(() => {
	      if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
	        setTranslate();
	        requireUpdateOnVirtual = false;
	      }
	    });
	  });
	}

	function effectTarget(effectParams, $slideEl) {
	  if (effectParams.transformEl) {
	    return $slideEl.find(effectParams.transformEl).css({
	      'backface-visibility': 'hidden',
	      '-webkit-backface-visibility': 'hidden'
	    });
	  }

	  return $slideEl;
	}

	function effectVirtualTransitionEnd(_ref) {
	  let {
	    swiper,
	    duration,
	    transformEl,
	    allSlides
	  } = _ref;
	  const {
	    slides,
	    activeIndex,
	    $wrapperEl
	  } = swiper;

	  if (swiper.params.virtualTranslate && duration !== 0) {
	    let eventTriggered = false;
	    let $transitionEndTarget;

	    if (allSlides) {
	      $transitionEndTarget = transformEl ? slides.find(transformEl) : slides;
	    } else {
	      $transitionEndTarget = transformEl ? slides.eq(activeIndex).find(transformEl) : slides.eq(activeIndex);
	    }

	    $transitionEndTarget.transitionEnd(() => {
	      if (eventTriggered) return;
	      if (!swiper || swiper.destroyed) return;
	      eventTriggered = true;
	      swiper.animating = false;
	      const triggerEvents = ['webkitTransitionEnd', 'transitionend'];

	      for (let i = 0; i < triggerEvents.length; i += 1) {
	        $wrapperEl.trigger(triggerEvents[i]);
	      }
	    });
	  }
	}

	function EffectFade(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on
	  } = _ref;
	  extendParams({
	    fadeEffect: {
	      crossFade: false,
	      transformEl: null
	    }
	  });

	  const setTranslate = () => {
	    const {
	      slides
	    } = swiper;
	    const params = swiper.params.fadeEffect;

	    for (let i = 0; i < slides.length; i += 1) {
	      const $slideEl = swiper.slides.eq(i);
	      const offset = $slideEl[0].swiperSlideOffset;
	      let tx = -offset;
	      if (!swiper.params.virtualTranslate) tx -= swiper.translate;
	      let ty = 0;

	      if (!swiper.isHorizontal()) {
	        ty = tx;
	        tx = 0;
	      }

	      const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs($slideEl[0].progress), 0) : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
	      const $targetEl = effectTarget(params, $slideEl);
	      $targetEl.css({
	        opacity: slideOpacity
	      }).transform(`translate3d(${tx}px, ${ty}px, 0px)`);
	    }
	  };

	  const setTransition = duration => {
	    const {
	      transformEl
	    } = swiper.params.fadeEffect;
	    const $transitionElements = transformEl ? swiper.slides.find(transformEl) : swiper.slides;
	    $transitionElements.transition(duration);
	    effectVirtualTransitionEnd({
	      swiper,
	      duration,
	      transformEl,
	      allSlides: true
	    });
	  };

	  effectInit({
	    effect: 'fade',
	    swiper,
	    on,
	    setTranslate,
	    setTransition,
	    overwriteParams: () => ({
	      slidesPerView: 1,
	      slidesPerGroup: 1,
	      watchSlidesProgress: true,
	      spaceBetween: 0,
	      virtualTranslate: !swiper.params.cssMode
	    })
	  });
	}

	function isObject$1(o) {
	  return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
	}

	function extend$1(target, src) {
	  const noExtend = ['__proto__', 'constructor', 'prototype'];
	  Object.keys(src).filter(key => noExtend.indexOf(key) < 0).forEach(key => {
	    if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
	      if (src[key].__swiper__) target[key] = src[key];else extend$1(target[key], src[key]);
	    } else {
	      target[key] = src[key];
	    }
	  });
	}

	function needsNavigation(params) {
	  if (params === void 0) {
	    params = {};
	  }

	  return params.navigation && typeof params.navigation.nextEl === 'undefined' && typeof params.navigation.prevEl === 'undefined';
	}

	function needsPagination(params) {
	  if (params === void 0) {
	    params = {};
	  }

	  return params.pagination && typeof params.pagination.el === 'undefined';
	}

	function needsScrollbar(params) {
	  if (params === void 0) {
	    params = {};
	  }

	  return params.scrollbar && typeof params.scrollbar.el === 'undefined';
	}

	function uniqueClasses(classNames) {
	  if (classNames === void 0) {
	    classNames = '';
	  }

	  const classes = classNames.split(' ').map(c => c.trim()).filter(c => !!c);
	  const unique = [];
	  classes.forEach(c => {
	    if (unique.indexOf(c) < 0) unique.push(c);
	  });
	  return unique.join(' ');
	}

	/* underscore in name -> watch for changes */
	const paramsList = ['modules', 'init', '_direction', 'touchEventsTarget', 'initialSlide', '_speed', 'cssMode', 'updateOnWindowResize', 'resizeObserver', 'nested', 'focusableElements', '_enabled', '_width', '_height', 'preventInteractionOnTransition', 'userAgent', 'url', '_edgeSwipeDetection', '_edgeSwipeThreshold', '_freeMode', '_autoHeight', 'setWrapperSize', 'virtualTranslate', '_effect', 'breakpoints', '_spaceBetween', '_slidesPerView', 'maxBackfaceHiddenSlides', '_grid', '_slidesPerGroup', '_slidesPerGroupSkip', '_slidesPerGroupAuto', '_centeredSlides', '_centeredSlidesBounds', '_slidesOffsetBefore', '_slidesOffsetAfter', 'normalizeSlideIndex', '_centerInsufficientSlides', '_watchOverflow', 'roundLengths', 'touchRatio', 'touchAngle', 'simulateTouch', '_shortSwipes', '_longSwipes', 'longSwipesRatio', 'longSwipesMs', '_followFinger', 'allowTouchMove', '_threshold', 'touchMoveStopPropagation', 'touchStartPreventDefault', 'touchStartForcePreventDefault', 'touchReleaseOnEdges', 'uniqueNavElements', '_resistance', '_resistanceRatio', '_watchSlidesProgress', '_grabCursor', 'preventClicks', 'preventClicksPropagation', '_slideToClickedSlide', '_preloadImages', 'updateOnImagesReady', '_loop', '_loopAdditionalSlides', '_loopedSlides', '_loopFillGroupWithBlank', 'loopPreventsSlide', '_rewind', '_allowSlidePrev', '_allowSlideNext', '_swipeHandler', '_noSwiping', 'noSwipingClass', 'noSwipingSelector', 'passiveListeners', 'containerModifierClass', 'slideClass', 'slideBlankClass', 'slideActiveClass', 'slideDuplicateActiveClass', 'slideVisibleClass', 'slideDuplicateClass', 'slideNextClass', 'slideDuplicateNextClass', 'slidePrevClass', 'slideDuplicatePrevClass', 'wrapperClass', 'runCallbacksOnInit', 'observer', 'observeParents', 'observeSlideChildren', // modules
	'a11y', '_autoplay', '_controller', 'coverflowEffect', 'cubeEffect', 'fadeEffect', 'flipEffect', 'creativeEffect', 'cardsEffect', 'hashNavigation', 'history', 'keyboard', 'lazy', 'mousewheel', '_navigation', '_pagination', 'parallax', '_scrollbar', '_thumbs', 'virtual', 'zoom'];

	function getParams(obj, splitEvents) {
	  if (obj === void 0) {
	    obj = {};
	  }

	  if (splitEvents === void 0) {
	    splitEvents = true;
	  }

	  const params = {
	    on: {}
	  };
	  const events = {};
	  const passedParams = {};
	  extend$1(params, Swiper.defaults);
	  extend$1(params, Swiper.extendedDefaults);
	  params._emitClasses = true;
	  params.init = false;
	  const rest = {};
	  const allowedParams = paramsList.map(key => key.replace(/_/, ''));
	  const plainObj = Object.assign({}, obj);
	  Object.keys(plainObj).forEach(key => {
	    if (typeof obj[key] === 'undefined') return;

	    if (allowedParams.indexOf(key) >= 0) {
	      if (isObject$1(obj[key])) {
	        params[key] = {};
	        passedParams[key] = {};
	        extend$1(params[key], obj[key]);
	        extend$1(passedParams[key], obj[key]);
	      } else {
	        params[key] = obj[key];
	        passedParams[key] = obj[key];
	      }
	    } else if (key.search(/on[A-Z]/) === 0 && typeof obj[key] === 'function') {
	      if (splitEvents) {
	        events[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
	      } else {
	        params.on[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
	      }
	    } else {
	      rest[key] = obj[key];
	    }
	  });
	  ['navigation', 'pagination', 'scrollbar'].forEach(key => {
	    if (params[key] === true) params[key] = {};
	    if (params[key] === false) delete params[key];
	  });
	  return {
	    params,
	    passedParams,
	    rest,
	    events
	  };
	}

	function mountSwiper(_ref, swiperParams) {
	  let {
	    el,
	    nextEl,
	    prevEl,
	    paginationEl,
	    scrollbarEl,
	    swiper
	  } = _ref;

	  if (needsNavigation(swiperParams) && nextEl && prevEl) {
	    swiper.params.navigation.nextEl = nextEl;
	    swiper.originalParams.navigation.nextEl = nextEl;
	    swiper.params.navigation.prevEl = prevEl;
	    swiper.originalParams.navigation.prevEl = prevEl;
	  }

	  if (needsPagination(swiperParams) && paginationEl) {
	    swiper.params.pagination.el = paginationEl;
	    swiper.originalParams.pagination.el = paginationEl;
	  }

	  if (needsScrollbar(swiperParams) && scrollbarEl) {
	    swiper.params.scrollbar.el = scrollbarEl;
	    swiper.originalParams.scrollbar.el = scrollbarEl;
	  }

	  swiper.init(el);
	}

	function getChangedParams(swiperParams, oldParams, children, oldChildren, getKey) {
	  const keys = [];
	  if (!oldParams) return keys;

	  const addKey = key => {
	    if (keys.indexOf(key) < 0) keys.push(key);
	  };

	  if (children && oldChildren) {
	    const oldChildrenKeys = oldChildren.map(getKey);
	    const childrenKeys = children.map(getKey);
	    if (oldChildrenKeys.join('') !== childrenKeys.join('')) addKey('children');
	    if (oldChildren.length !== children.length) addKey('children');
	  }

	  const watchParams = paramsList.filter(key => key[0] === '_').map(key => key.replace(/_/, ''));
	  watchParams.forEach(key => {
	    if (key in swiperParams && key in oldParams) {
	      if (isObject$1(swiperParams[key]) && isObject$1(oldParams[key])) {
	        const newKeys = Object.keys(swiperParams[key]);
	        const oldKeys = Object.keys(oldParams[key]);

	        if (newKeys.length !== oldKeys.length) {
	          addKey(key);
	        } else {
	          newKeys.forEach(newKey => {
	            if (swiperParams[key][newKey] !== oldParams[key][newKey]) {
	              addKey(key);
	            }
	          });
	          oldKeys.forEach(oldKey => {
	            if (swiperParams[key][oldKey] !== oldParams[key][oldKey]) addKey(key);
	          });
	        }
	      } else if (swiperParams[key] !== oldParams[key]) {
	        addKey(key);
	      }
	    }
	  });
	  return keys;
	}

	function updateSwiper(_ref) {
	  let {
	    swiper,
	    slides,
	    passedParams,
	    changedParams,
	    nextEl,
	    prevEl,
	    scrollbarEl,
	    paginationEl
	  } = _ref;
	  const updateParams = changedParams.filter(key => key !== 'children' && key !== 'direction');
	  const {
	    params: currentParams,
	    pagination,
	    navigation,
	    scrollbar,
	    virtual,
	    thumbs
	  } = swiper;
	  let needThumbsInit;
	  let needControllerInit;
	  let needPaginationInit;
	  let needScrollbarInit;
	  let needNavigationInit;

	  if (changedParams.includes('thumbs') && passedParams.thumbs && passedParams.thumbs.swiper && currentParams.thumbs && !currentParams.thumbs.swiper) {
	    needThumbsInit = true;
	  }

	  if (changedParams.includes('controller') && passedParams.controller && passedParams.controller.control && currentParams.controller && !currentParams.controller.control) {
	    needControllerInit = true;
	  }

	  if (changedParams.includes('pagination') && passedParams.pagination && (passedParams.pagination.el || paginationEl) && (currentParams.pagination || currentParams.pagination === false) && pagination && !pagination.el) {
	    needPaginationInit = true;
	  }

	  if (changedParams.includes('scrollbar') && passedParams.scrollbar && (passedParams.scrollbar.el || scrollbarEl) && (currentParams.scrollbar || currentParams.scrollbar === false) && scrollbar && !scrollbar.el) {
	    needScrollbarInit = true;
	  }

	  if (changedParams.includes('navigation') && passedParams.navigation && (passedParams.navigation.prevEl || prevEl) && (passedParams.navigation.nextEl || nextEl) && (currentParams.navigation || currentParams.navigation === false) && navigation && !navigation.prevEl && !navigation.nextEl) {
	    needNavigationInit = true;
	  }

	  const destroyModule = mod => {
	    if (!swiper[mod]) return;
	    swiper[mod].destroy();

	    if (mod === 'navigation') {
	      currentParams[mod].prevEl = undefined;
	      currentParams[mod].nextEl = undefined;
	      swiper[mod].prevEl = undefined;
	      swiper[mod].nextEl = undefined;
	    } else {
	      currentParams[mod].el = undefined;
	      swiper[mod].el = undefined;
	    }
	  };

	  updateParams.forEach(key => {
	    if (isObject$1(currentParams[key]) && isObject$1(passedParams[key])) {
	      extend$1(currentParams[key], passedParams[key]);
	    } else {
	      const newValue = passedParams[key];

	      if ((newValue === true || newValue === false) && (key === 'navigation' || key === 'pagination' || key === 'scrollbar')) {
	        if (newValue === false) {
	          destroyModule(key);
	        }
	      } else {
	        currentParams[key] = passedParams[key];
	      }
	    }
	  });

	  if (updateParams.includes('controller') && !needControllerInit && swiper.controller && swiper.controller.control && currentParams.controller && currentParams.controller.control) {
	    swiper.controller.control = currentParams.controller.control;
	  }

	  if (changedParams.includes('children') && slides && virtual && currentParams.virtual.enabled) {
	    virtual.slides = slides;
	    virtual.update(true);
	  } else if (changedParams.includes('children') && swiper.lazy && swiper.params.lazy.enabled) {
	    swiper.lazy.load();
	  }

	  if (needThumbsInit) {
	    const initialized = thumbs.init();
	    if (initialized) thumbs.update(true);
	  }

	  if (needControllerInit) {
	    swiper.controller.control = currentParams.controller.control;
	  }

	  if (needPaginationInit) {
	    if (paginationEl) currentParams.pagination.el = paginationEl;
	    pagination.init();
	    pagination.render();
	    pagination.update();
	  }

	  if (needScrollbarInit) {
	    if (scrollbarEl) currentParams.scrollbar.el = scrollbarEl;
	    scrollbar.init();
	    scrollbar.updateSize();
	    scrollbar.setTranslate();
	  }

	  if (needNavigationInit) {
	    if (nextEl) currentParams.navigation.nextEl = nextEl;
	    if (prevEl) currentParams.navigation.prevEl = prevEl;
	    navigation.init();
	    navigation.update();
	  }

	  if (changedParams.includes('allowSlideNext')) {
	    swiper.allowSlideNext = passedParams.allowSlideNext;
	  }

	  if (changedParams.includes('allowSlidePrev')) {
	    swiper.allowSlidePrev = passedParams.allowSlidePrev;
	  }

	  if (changedParams.includes('direction')) {
	    swiper.changeDirection(passedParams.direction, false);
	  }

	  swiper.update();
	}

	/* node_modules\swiper\svelte\swiper.svelte generated by Svelte v4.2.20 */
	const file$m = "node_modules\\swiper\\svelte\\swiper.svelte";
	const get_container_end_slot_changes = dirty => ({});
	const get_container_end_slot_context = ctx => ({});
	const get_wrapper_end_slot_changes = dirty => ({});
	const get_wrapper_end_slot_context = ctx => ({});
	const get_default_slot_changes$3 = dirty => ({ virtualData: dirty & /*virtualData*/ 512 });
	const get_default_slot_context$3 = ctx => ({ virtualData: /*virtualData*/ ctx[9] });
	const get_wrapper_start_slot_changes = dirty => ({});
	const get_wrapper_start_slot_context = ctx => ({});
	const get_container_start_slot_changes = dirty => ({});
	const get_container_start_slot_context = ctx => ({});

	// (162:2) {#if needsNavigation(swiperParams)}
	function create_if_block_2(ctx) {
		let div0;
		let t;
		let div1;

		const block = {
			c: function create() {
				div0 = element("div");
				t = space();
				div1 = element("div");
				attr_dev(div0, "class", "swiper-button-prev");
				add_location(div0, file$m, 162, 4, 4264);
				attr_dev(div1, "class", "swiper-button-next");
				add_location(div1, file$m, 163, 4, 4322);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				/*div0_binding*/ ctx[13](div0);
				insert_dev(target, t, anchor);
				insert_dev(target, div1, anchor);
				/*div1_binding*/ ctx[14](div1);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div0);
					detach_dev(t);
					detach_dev(div1);
				}

				/*div0_binding*/ ctx[13](null);
				/*div1_binding*/ ctx[14](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(162:2) {#if needsNavigation(swiperParams)}",
			ctx
		});

		return block;
	}

	// (166:2) {#if needsScrollbar(swiperParams)}
	function create_if_block_1$3(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "swiper-scrollbar");
				add_location(div, file$m, 166, 4, 4425);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				/*div_binding*/ ctx[15](div);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				/*div_binding*/ ctx[15](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$3.name,
			type: "if",
			source: "(166:2) {#if needsScrollbar(swiperParams)}",
			ctx
		});

		return block;
	}

	// (169:2) {#if needsPagination(swiperParams)}
	function create_if_block$6(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "swiper-pagination");
				add_location(div, file$m, 169, 4, 4532);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				/*div_binding_1*/ ctx[16](div);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				/*div_binding_1*/ ctx[16](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$6.name,
			type: "if",
			source: "(169:2) {#if needsPagination(swiperParams)}",
			ctx
		});

		return block;
	}

	function create_fragment$D(ctx) {
		let div1;
		let t0;
		let div0;
		let t1;
		let t2;
		let t3;
		let show_if_2 = needsNavigation(/*swiperParams*/ ctx[2]);
		let t4;
		let show_if_1 = needsScrollbar(/*swiperParams*/ ctx[2]);
		let t5;
		let show_if = needsPagination(/*swiperParams*/ ctx[2]);
		let t6;
		let div1_class_value;
		let current;
		const container_start_slot_template = /*#slots*/ ctx[12]["container-start"];
		const container_start_slot = create_slot(container_start_slot_template, ctx, /*$$scope*/ ctx[11], get_container_start_slot_context);
		const wrapper_start_slot_template = /*#slots*/ ctx[12]["wrapper-start"];
		const wrapper_start_slot = create_slot(wrapper_start_slot_template, ctx, /*$$scope*/ ctx[11], get_wrapper_start_slot_context);
		const default_slot_template = /*#slots*/ ctx[12].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context$3);
		const wrapper_end_slot_template = /*#slots*/ ctx[12]["wrapper-end"];
		const wrapper_end_slot = create_slot(wrapper_end_slot_template, ctx, /*$$scope*/ ctx[11], get_wrapper_end_slot_context);
		let if_block0 = show_if_2 && create_if_block_2(ctx);
		let if_block1 = show_if_1 && create_if_block_1$3(ctx);
		let if_block2 = show_if && create_if_block$6(ctx);
		const container_end_slot_template = /*#slots*/ ctx[12]["container-end"];
		const container_end_slot = create_slot(container_end_slot_template, ctx, /*$$scope*/ ctx[11], get_container_end_slot_context);

		let div1_levels = [
			{
				class: div1_class_value = uniqueClasses(`${/*containerClasses*/ ctx[1]}${/*className*/ ctx[0] ? ` ${/*className*/ ctx[0]}` : ''}`)
			},
			/*restProps*/ ctx[3]
		];

		let div_data_1 = {};

		for (let i = 0; i < div1_levels.length; i += 1) {
			div_data_1 = assign(div_data_1, div1_levels[i]);
		}

		const block = {
			c: function create() {
				div1 = element("div");
				if (container_start_slot) container_start_slot.c();
				t0 = space();
				div0 = element("div");
				if (wrapper_start_slot) wrapper_start_slot.c();
				t1 = space();
				if (default_slot) default_slot.c();
				t2 = space();
				if (wrapper_end_slot) wrapper_end_slot.c();
				t3 = space();
				if (if_block0) if_block0.c();
				t4 = space();
				if (if_block1) if_block1.c();
				t5 = space();
				if (if_block2) if_block2.c();
				t6 = space();
				if (container_end_slot) container_end_slot.c();
				attr_dev(div0, "class", "swiper-wrapper");
				add_location(div0, file$m, 156, 2, 4091);
				set_attributes(div1, div_data_1);
				add_location(div1, file$m, 150, 0, 3926);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);

				if (container_start_slot) {
					container_start_slot.m(div1, null);
				}

				append_dev(div1, t0);
				append_dev(div1, div0);

				if (wrapper_start_slot) {
					wrapper_start_slot.m(div0, null);
				}

				append_dev(div0, t1);

				if (default_slot) {
					default_slot.m(div0, null);
				}

				append_dev(div0, t2);

				if (wrapper_end_slot) {
					wrapper_end_slot.m(div0, null);
				}

				append_dev(div1, t3);
				if (if_block0) if_block0.m(div1, null);
				append_dev(div1, t4);
				if (if_block1) if_block1.m(div1, null);
				append_dev(div1, t5);
				if (if_block2) if_block2.m(div1, null);
				append_dev(div1, t6);

				if (container_end_slot) {
					container_end_slot.m(div1, null);
				}

				/*div1_binding_1*/ ctx[17](div1);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (container_start_slot) {
					if (container_start_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
						update_slot_base(
							container_start_slot,
							container_start_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(container_start_slot_template, /*$$scope*/ ctx[11], dirty, get_container_start_slot_changes),
							get_container_start_slot_context
						);
					}
				}

				if (wrapper_start_slot) {
					if (wrapper_start_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
						update_slot_base(
							wrapper_start_slot,
							wrapper_start_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(wrapper_start_slot_template, /*$$scope*/ ctx[11], dirty, get_wrapper_start_slot_changes),
							get_wrapper_start_slot_context
						);
					}
				}

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, virtualData*/ 2560)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes$3),
							get_default_slot_context$3
						);
					}
				}

				if (wrapper_end_slot) {
					if (wrapper_end_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
						update_slot_base(
							wrapper_end_slot,
							wrapper_end_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(wrapper_end_slot_template, /*$$scope*/ ctx[11], dirty, get_wrapper_end_slot_changes),
							get_wrapper_end_slot_context
						);
					}
				}

				if (dirty & /*swiperParams*/ 4) show_if_2 = needsNavigation(/*swiperParams*/ ctx[2]);

				if (show_if_2) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_2(ctx);
						if_block0.c();
						if_block0.m(div1, t4);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (dirty & /*swiperParams*/ 4) show_if_1 = needsScrollbar(/*swiperParams*/ ctx[2]);

				if (show_if_1) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_1$3(ctx);
						if_block1.c();
						if_block1.m(div1, t5);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (dirty & /*swiperParams*/ 4) show_if = needsPagination(/*swiperParams*/ ctx[2]);

				if (show_if) {
					if (if_block2) {
						if_block2.p(ctx, dirty);
					} else {
						if_block2 = create_if_block$6(ctx);
						if_block2.c();
						if_block2.m(div1, t6);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}

				if (container_end_slot) {
					if (container_end_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
						update_slot_base(
							container_end_slot,
							container_end_slot_template,
							ctx,
							/*$$scope*/ ctx[11],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
							: get_slot_changes(container_end_slot_template, /*$$scope*/ ctx[11], dirty, get_container_end_slot_changes),
							get_container_end_slot_context
						);
					}
				}

				set_attributes(div1, div_data_1 = get_spread_update(div1_levels, [
					(!current || dirty & /*containerClasses, className*/ 3 && div1_class_value !== (div1_class_value = uniqueClasses(`${/*containerClasses*/ ctx[1]}${/*className*/ ctx[0] ? ` ${/*className*/ ctx[0]}` : ''}`))) && { class: div1_class_value },
					dirty & /*restProps*/ 8 && /*restProps*/ ctx[3]
				]));
			},
			i: function intro(local) {
				if (current) return;
				transition_in(container_start_slot, local);
				transition_in(wrapper_start_slot, local);
				transition_in(default_slot, local);
				transition_in(wrapper_end_slot, local);
				transition_in(container_end_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(container_start_slot, local);
				transition_out(wrapper_start_slot, local);
				transition_out(default_slot, local);
				transition_out(wrapper_end_slot, local);
				transition_out(container_end_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if (container_start_slot) container_start_slot.d(detaching);
				if (wrapper_start_slot) wrapper_start_slot.d(detaching);
				if (default_slot) default_slot.d(detaching);
				if (wrapper_end_slot) wrapper_end_slot.d(detaching);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				if (container_end_slot) container_end_slot.d(detaching);
				/*div1_binding_1*/ ctx[17](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$D.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$D($$self, $$props, $$invalidate) {
		const omit_props_names = ["class","swiper"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Swiper', slots, ['container-start','wrapper-start','default','wrapper-end','container-end']);
		const dispatch = createEventDispatcher();
		let { class: className = undefined } = $$props;
		let containerClasses = 'swiper';
		let breakpointChanged = false;
		let swiperInstance = null;
		let oldPassedParams = null;
		let paramsData;
		let swiperParams;
		let passedParams;
		let restProps;
		let swiperEl = null;
		let prevEl = null;
		let nextEl = null;
		let scrollbarEl = null;
		let paginationEl = null;
		let virtualData = { slides: [] };

		function swiper() {
			return swiperInstance;
		}

		const setVirtualData = data => {
			$$invalidate(9, virtualData = data);

			tick().then(() => {
				swiperInstance.$wrapperEl.children('.swiper-slide').each(el => {
					if (el.onSwiper) el.onSwiper(swiperInstance);
				});

				swiperInstance.updateSlides();
				swiperInstance.updateProgress();
				swiperInstance.updateSlidesClasses();

				if (swiperInstance.lazy && swiperInstance.params.lazy.enabled) {
					swiperInstance.lazy.load();
				}
			});
		};

		const calcParams = () => {
			paramsData = getParams($$restProps);
			$$invalidate(2, swiperParams = paramsData.params);
			passedParams = paramsData.passedParams;
			$$invalidate(3, restProps = paramsData.rest);
		};

		calcParams();
		oldPassedParams = passedParams;

		const onBeforeBreakpoint = () => {
			breakpointChanged = true;
		};

		swiperParams.onAny = (event, ...args) => {
			dispatch(event, args);
		};

		Object.assign(swiperParams.on, {
			_beforeBreakpoint: onBeforeBreakpoint,
			_containerClasses(_swiper, classes) {
				$$invalidate(1, containerClasses = classes);
			}
		});

		swiperInstance = new Swiper(swiperParams);
		setContext('swiper', swiperInstance);

		if (swiperInstance.virtual && swiperInstance.params.virtual.enabled) {
			const extendWith = {
				cache: false,
				renderExternal: data => {
					setVirtualData(data);

					if (swiperParams.virtual && swiperParams.virtual.renderExternal) {
						swiperParams.virtual.renderExternal(data);
					}
				},
				renderExternalUpdate: false
			};

			extend$1(swiperInstance.params.virtual, extendWith);
			extend$1(swiperInstance.originalParams.virtual, extendWith);
		}

		onMount(() => {
			if (!swiperEl) return;

			mountSwiper(
				{
					el: swiperEl,
					nextEl,
					prevEl,
					paginationEl,
					scrollbarEl,
					swiper: swiperInstance
				},
				swiperParams
			);

			dispatch('swiper', [swiperInstance]);
			if (swiperParams.virtual) return;

			swiperInstance.slides.each(el => {
				if (el.onSwiper) el.onSwiper(swiperInstance);
			});
		});

		afterUpdate(() => {
			if (!swiperInstance) return;
			calcParams();
			const changedParams = getChangedParams(passedParams, oldPassedParams);

			if ((changedParams.length || breakpointChanged) && swiperInstance && !swiperInstance.destroyed) {
				updateSwiper({
					swiper: swiperInstance,
					passedParams,
					changedParams,
					nextEl,
					prevEl,
					scrollbarEl,
					paginationEl
				});
			}

			breakpointChanged = false;
			oldPassedParams = passedParams;
		});

		onDestroy(() => {
			// eslint-disable-next-line
			if (typeof window !== 'undefined' && swiperInstance && !swiperInstance.destroyed) {
				swiperInstance.destroy(true, false);
			}
		});

		function div0_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				prevEl = $$value;
				$$invalidate(5, prevEl);
			});
		}

		function div1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				nextEl = $$value;
				$$invalidate(6, nextEl);
			});
		}

		function div_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				scrollbarEl = $$value;
				$$invalidate(7, scrollbarEl);
			});
		}

		function div_binding_1($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				paginationEl = $$value;
				$$invalidate(8, paginationEl);
			});
		}

		function div1_binding_1($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				swiperEl = $$value;
				$$invalidate(4, swiperEl);
			});
		}

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(27, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('class' in $$new_props) $$invalidate(0, className = $$new_props.class);
			if ('$$scope' in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			onMount,
			onDestroy,
			afterUpdate,
			createEventDispatcher,
			tick,
			setContext,
			Swiper,
			getParams,
			mountSwiper,
			needsScrollbar,
			needsNavigation,
			needsPagination,
			uniqueClasses,
			extend: extend$1,
			getChangedParams,
			updateSwiper,
			dispatch,
			className,
			containerClasses,
			breakpointChanged,
			swiperInstance,
			oldPassedParams,
			paramsData,
			swiperParams,
			passedParams,
			restProps,
			swiperEl,
			prevEl,
			nextEl,
			scrollbarEl,
			paginationEl,
			virtualData,
			swiper,
			setVirtualData,
			calcParams,
			onBeforeBreakpoint
		});

		$$self.$inject_state = $$new_props => {
			if ('className' in $$props) $$invalidate(0, className = $$new_props.className);
			if ('containerClasses' in $$props) $$invalidate(1, containerClasses = $$new_props.containerClasses);
			if ('breakpointChanged' in $$props) breakpointChanged = $$new_props.breakpointChanged;
			if ('swiperInstance' in $$props) swiperInstance = $$new_props.swiperInstance;
			if ('oldPassedParams' in $$props) oldPassedParams = $$new_props.oldPassedParams;
			if ('paramsData' in $$props) paramsData = $$new_props.paramsData;
			if ('swiperParams' in $$props) $$invalidate(2, swiperParams = $$new_props.swiperParams);
			if ('passedParams' in $$props) passedParams = $$new_props.passedParams;
			if ('restProps' in $$props) $$invalidate(3, restProps = $$new_props.restProps);
			if ('swiperEl' in $$props) $$invalidate(4, swiperEl = $$new_props.swiperEl);
			if ('prevEl' in $$props) $$invalidate(5, prevEl = $$new_props.prevEl);
			if ('nextEl' in $$props) $$invalidate(6, nextEl = $$new_props.nextEl);
			if ('scrollbarEl' in $$props) $$invalidate(7, scrollbarEl = $$new_props.scrollbarEl);
			if ('paginationEl' in $$props) $$invalidate(8, paginationEl = $$new_props.paginationEl);
			if ('virtualData' in $$props) $$invalidate(9, virtualData = $$new_props.virtualData);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			className,
			containerClasses,
			swiperParams,
			restProps,
			swiperEl,
			prevEl,
			nextEl,
			scrollbarEl,
			paginationEl,
			virtualData,
			swiper,
			$$scope,
			slots,
			div0_binding,
			div1_binding,
			div_binding,
			div_binding_1,
			div1_binding_1
		];
	}

	class Swiper_1 extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$D, create_fragment$D, safe_not_equal, { class: 0, swiper: 10 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Swiper_1",
				options,
				id: create_fragment$D.name
			});
		}

		get class() {
			throw new Error("<Swiper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Swiper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get swiper() {
			return this.$$.ctx[10];
		}

		set swiper(value) {
			throw new Error("<Swiper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* node_modules\swiper\svelte\swiper-slide.svelte generated by Svelte v4.2.20 */
	const file$l = "node_modules\\swiper\\svelte\\swiper-slide.svelte";
	const get_default_slot_changes_1$1 = dirty => ({ data: dirty & /*slideData*/ 32 });
	const get_default_slot_context_1$1 = ctx => ({ data: /*slideData*/ ctx[5] });
	const get_default_slot_changes$2 = dirty => ({ data: dirty & /*slideData*/ 32 });
	const get_default_slot_context$2 = ctx => ({ data: /*slideData*/ ctx[5] });

	// (92:2) {:else}
	function create_else_block$5(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context_1$1);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, slideData*/ 160)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[7],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes_1$1),
							get_default_slot_context_1$1
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$5.name,
			type: "else",
			source: "(92:2) {:else}",
			ctx
		});

		return block;
	}

	// (85:2) {#if zoom}
	function create_if_block$5(ctx) {
		let div;
		let div_data_swiper_zoom_value;
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$2);

		const block = {
			c: function create() {
				div = element("div");
				if (default_slot) default_slot.c();
				attr_dev(div, "class", "swiper-zoom-container");

				attr_dev(div, "data-swiper-zoom", div_data_swiper_zoom_value = typeof /*zoom*/ ctx[0] === 'number'
				? /*zoom*/ ctx[0]
				: undefined);

				add_location(div, file$l, 85, 4, 2126);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, slideData*/ 160)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[7],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$2),
							get_default_slot_context$2
						);
					}
				}

				if (!current || dirty & /*zoom*/ 1 && div_data_swiper_zoom_value !== (div_data_swiper_zoom_value = typeof /*zoom*/ ctx[0] === 'number'
				? /*zoom*/ ctx[0]
				: undefined)) {
					attr_dev(div, "data-swiper-zoom", div_data_swiper_zoom_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$5.name,
			type: "if",
			source: "(85:2) {#if zoom}",
			ctx
		});

		return block;
	}

	function create_fragment$C(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let div_class_value;
		let current;
		const if_block_creators = [create_if_block$5, create_else_block$5];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*zoom*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		let div_levels = [
			{
				class: div_class_value = uniqueClasses(`${/*slideClasses*/ ctx[3]}${/*className*/ ctx[2] ? ` ${/*className*/ ctx[2]}` : ''}`)
			},
			{
				"data-swiper-slide-index": /*virtualIndex*/ ctx[1]
			},
			/*$$restProps*/ ctx[6]
		];

		let div_data = {};

		for (let i = 0; i < div_levels.length; i += 1) {
			div_data = assign(div_data, div_levels[i]);
		}

		const block = {
			c: function create() {
				div = element("div");
				if_block.c();
				set_attributes(div, div_data);
				add_location(div, file$l, 78, 0, 1942);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				/*div_binding*/ ctx[9](div);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}

				set_attributes(div, div_data = get_spread_update(div_levels, [
					(!current || dirty & /*slideClasses, className*/ 12 && div_class_value !== (div_class_value = uniqueClasses(`${/*slideClasses*/ ctx[3]}${/*className*/ ctx[2] ? ` ${/*className*/ ctx[2]}` : ''}`))) && { class: div_class_value },
					(!current || dirty & /*virtualIndex*/ 2) && {
						"data-swiper-slide-index": /*virtualIndex*/ ctx[1]
					},
					dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
				]));
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if_blocks[current_block_type_index].d();
				/*div_binding*/ ctx[9](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$C.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$C($$self, $$props, $$invalidate) {
		let slideData;
		const omit_props_names = ["zoom","virtualIndex","class"];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Swiper_slide', slots, ['default']);
		let { zoom = undefined } = $$props;
		let { virtualIndex = undefined } = $$props;
		let { class: className = undefined } = $$props;
		let slideEl = null;
		let slideClasses = 'swiper-slide';
		let swiper = getContext('swiper');
		let eventAttached = false;

		const updateClasses = (_, el, classNames) => {
			if (el === slideEl) {
				$$invalidate(3, slideClasses = classNames);
			}
		};

		const attachEvent = () => {
			if (!swiper || eventAttached) return;
			swiper.on('_slideClass', updateClasses);
			eventAttached = true;
		};

		const detachEvent = () => {
			if (!swiper) return;
			swiper.off('_slideClass', updateClasses);
			eventAttached = false;
		};

		onMount(() => {
			if (typeof virtualIndex === 'undefined') return;

			$$invalidate(
				4,
				slideEl.onSwiper = _swiper => {
					swiper = _swiper;
					attachEvent();
				},
				slideEl
			);

			attachEvent();
		});

		afterUpdate(() => {
			if (!slideEl || !swiper) return;

			if (swiper.destroyed) {
				if (slideClasses !== 'swiper-slide') {
					$$invalidate(3, slideClasses = 'swiper-slide');
				}

				return;
			}

			attachEvent();
		});

		beforeUpdate(() => {
			attachEvent();
		});

		onDestroy(() => {
			if (!swiper) return;
			detachEvent();
		});

		function div_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				slideEl = $$value;
				$$invalidate(4, slideEl);
			});
		}

		$$self.$$set = $$new_props => {
			$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
			$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
			if ('zoom' in $$new_props) $$invalidate(0, zoom = $$new_props.zoom);
			if ('virtualIndex' in $$new_props) $$invalidate(1, virtualIndex = $$new_props.virtualIndex);
			if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
			if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			onMount,
			onDestroy,
			beforeUpdate,
			afterUpdate,
			setContext,
			getContext,
			uniqueClasses,
			zoom,
			virtualIndex,
			className,
			slideEl,
			slideClasses,
			swiper,
			eventAttached,
			updateClasses,
			attachEvent,
			detachEvent,
			slideData
		});

		$$self.$inject_state = $$new_props => {
			if ('zoom' in $$props) $$invalidate(0, zoom = $$new_props.zoom);
			if ('virtualIndex' in $$props) $$invalidate(1, virtualIndex = $$new_props.virtualIndex);
			if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
			if ('slideEl' in $$props) $$invalidate(4, slideEl = $$new_props.slideEl);
			if ('slideClasses' in $$props) $$invalidate(3, slideClasses = $$new_props.slideClasses);
			if ('swiper' in $$props) swiper = $$new_props.swiper;
			if ('eventAttached' in $$props) eventAttached = $$new_props.eventAttached;
			if ('slideData' in $$props) $$invalidate(5, slideData = $$new_props.slideData);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*slideClasses*/ 8) {
				$$invalidate(5, slideData = {
					isActive: slideClasses.indexOf('swiper-slide-active') >= 0 || slideClasses.indexOf('swiper-slide-duplicate-active') >= 0,
					isVisible: slideClasses.indexOf('swiper-slide-visible') >= 0,
					isDuplicate: slideClasses.indexOf('swiper-slide-duplicate') >= 0,
					isPrev: slideClasses.indexOf('swiper-slide-prev') >= 0 || slideClasses.indexOf('swiper-slide-duplicate-prev') >= 0,
					isNext: slideClasses.indexOf('swiper-slide-next') >= 0 || slideClasses.indexOf('swiper-slide-duplicate-next') >= 0
				});
			}
		};

		return [
			zoom,
			virtualIndex,
			className,
			slideClasses,
			slideEl,
			slideData,
			$$restProps,
			$$scope,
			slots,
			div_binding
		];
	}

	class Swiper_slide extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$C, create_fragment$C, safe_not_equal, { zoom: 0, virtualIndex: 1, class: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Swiper_slide",
				options,
				id: create_fragment$C.name
			});
		}

		get zoom() {
			throw new Error("<Swiper_slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set zoom(value) {
			throw new Error("<Swiper_slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get virtualIndex() {
			throw new Error("<Swiper_slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set virtualIndex(value) {
			throw new Error("<Swiper_slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get class() {
			throw new Error("<Swiper_slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Swiper_slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\example\SWIPER.svelte generated by Svelte v4.2.20 */
	const file$k = "src\\components\\example\\SWIPER.svelte";

	function get_each_context$a(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i];
		child_ctx[5] = i;
		return child_ctx;
	}

	// (41:2) {:catch error}
	function create_catch_block$b(ctx) {
		let p;
		let t0_value = /*error*/ ctx[6].message + "";
		let t0;
		let t1;

		const block = {
			c: function create() {
				p = element("p");
				t0 = text$1(t0_value);
				t1 = text$1(" : 에러가 발생되었습니다.");
				add_location(p, file$k, 41, 4, 2683);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, t0);
				append_dev(p, t1);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1 && t0_value !== (t0_value = /*error*/ ctx[6].message + "")) set_data_dev(t0, t0_value);
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$b.name,
			type: "catch",
			source: "(41:2) {:catch error}",
			ctx
		});

		return block;
	}

	// (26:2) {:then value}
	function create_then_block$b(ctx) {
		let swiper;
		let current;

		swiper = new Swiper_1({
				props: {
					modules: [Navigation, Pagination],
					spaceBetween: 50,
					slidesPerView: 5,
					loop: true,
					navigation: true,
					pagination: { clickable: true },
					$$slots: { default: [create_default_slot$7] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(swiper.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(swiper, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const swiper_changes = {};

				if (dirty & /*$$scope, promise*/ 129) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(swiper, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$b.name,
			type: "then",
			source: "(26:2) {:then value}",
			ctx
		});

		return block;
	}

	// (36:7) <SwiperSlide>
	function create_default_slot_1$6(ctx) {
		let img;
		let img_src_value;
		let t;

		const block = {
			c: function create() {
				img = element("img");
				t = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/w200${/*movie*/ ctx[3].poster_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "여행이미지");
				attr_dev(img, "width", "300");
				add_location(img, file$k, 36, 10, 2521);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/w200${/*movie*/ ctx[3].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(img);
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$6.name,
			type: "slot",
			source: "(36:7) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (35:4) {#each value.data.results as movie, i}
	function create_each_block$a(ctx) {
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$6] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(swiperslide.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const swiperslide_changes = {};

				if (dirty & /*$$scope, promise*/ 129) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$a.name,
			type: "each",
			source: "(35:4) {#each value.data.results as movie, i}",
			ctx
		});

		return block;
	}

	// (27:4) <Swiper      modules={[Navigation, Pagination]}      spaceBetween={50}      slidesPerView={5}      loop={true}      navigation      pagination={{ clickable: true }}    >
	function create_default_slot$7(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*value*/ ctx[2].data.results);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1) {
					each_value = ensure_array_like_dev(/*value*/ ctx[2].data.results);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$a(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$a(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$7.name,
			type: "slot",
			source: "(27:4) <Swiper      modules={[Navigation, Pagination]}      spaceBetween={50}      slidesPerView={5}      loop={true}      navigation      pagination={{ clickable: true }}    >",
			ctx
		});

		return block;
	}

	// (24:18)     <p>loading...</p>    {:then value}
	function create_pending_block$b(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element("p");
				p.textContent = "loading...";
				add_location(p, file$k, 24, 2, 2234);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$b.name,
			type: "pending",
			source: "(24:18)     <p>loading...</p>    {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$B(ctx) {
		let div;
		let promise_1;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$b,
			then: create_then_block$b,
			catch: create_catch_block$b,
			value: 2,
			error: 6,
			blocks: [,,,]
		};

		handle_promise(promise_1 = /*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				div = element("div");
				info.block.c();
				attr_dev(div, "class", "photo svelte-1xzgcbh");
				add_location(div, file$k, 22, 0, 2191);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				info.block.m(div, info.anchor = null);
				info.mount = () => div;
				info.anchor = null;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				info.ctx = ctx;

				if (dirty & /*promise*/ 1 && promise_1 !== (promise_1 = /*promise*/ ctx[0]) && handle_promise(promise_1, info)) ; else {
					update_await_block_branch(info, ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				info.block.d();
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$B.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$B($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('SWIPER', slots, []);

		const urls = [
			'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fk0adz%2Fbtsydna0uHj%2FAAAAAAAAAAAAAAAAAAAAAOWukE3A4Q_JH8SouR7GFkgpy-IuXUIVMoUTkqJ-1MX9%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DXhiNPriHvjGQqqCXJtZ2YkuEPN8%253D',
			'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fbmakiu%2FbtsyenIDeD8%2FAAAAAAAAAAAAAAAAAAAAAK3FkNnN-WrZrr7HLxnz1FF3Y4IEOtrP8QnXRixNTzW3%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DmZSzRmWql5ebleBQSxnb0qe9h7g%253D',
			'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fl6QZI%2FbtsynB6Vt9I%2FAAAAAAAAAAAAAAAAAAAAAFYj8_st59xrSI6JVqssepE19-9o98snrC01JPhQA1HY%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DZlNeFRk32iIGab70Vr2eKgRyEa0%253D',
			'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbaN3Yb%2FbtsypwK3WoE%2FAAAAAAAAAAAAAAAAAAAAAP7YIBJUOfJfundDX4ZoyTgRB2k3QWhAEmhb6fo83wrK%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3Di%252FY47saXiwMm3t2r41r8QHnkYOQ%253D',
			'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcfnV8L%2FbtsyaUglYOD%2FAAAAAAAAAAAAAAAAAAAAAE53IFR-ZBQ04gF7rns37zvrgxyLfHfhFBcoBd-myVCo%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DxwBHeaypwE6Od1qYQWNMn2%252BgVp8%253D'
		];

		let { promise } = $$props;

		$$self.$$.on_mount.push(function () {
			if (promise === undefined && !('promise' in $$props || $$self.$$.bound[$$self.$$.props['promise']])) {
				console.warn("<SWIPER> was created without expected prop 'promise'");
			}
		});

		const writable_props = ['promise'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SWIPER> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
		};

		$$self.$capture_state = () => ({
			urls,
			Navigation,
			Pagination,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			promise
		});

		$$self.$inject_state = $$props => {
			if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [promise];
	}

	class SWIPER extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$B, create_fragment$B, safe_not_equal, { promise: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "SWIPER",
				options,
				id: create_fragment$B.name
			});
		}

		get promise() {
			throw new Error("<SWIPER>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set promise(value) {
			throw new Error("<SWIPER>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\example\TMDB.svelte generated by Svelte v4.2.20 */
	const file$j = "src\\components\\example\\TMDB.svelte";

	function get_each_context$9(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[2] = list[i];
		return child_ctx;
	}

	// (15:0) {:catch error}
	function create_catch_block$a(ctx) {
		let p;
		let t0_value = /*error*/ ctx[5].message + "";
		let t0;
		let t1;

		const block = {
			c: function create() {
				p = element("p");
				t0 = text$1(t0_value);
				t1 = text$1(" : 에러가 발생되었습니다.");
				add_location(p, file$j, 15, 1, 335);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, t0);
				append_dev(p, t1);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1 && t0_value !== (t0_value = /*error*/ ctx[5].message + "")) set_data_dev(t0, t0_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$a.name,
			type: "catch",
			source: "(15:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (6:0) {:then value}
	function create_then_block$a(ctx) {
		let each_1_anchor;
		let each_value = ensure_array_like_dev(/*value*/ ctx[1].data.results);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1) {
					each_value = ensure_array_like_dev(/*value*/ ctx[1].data.results);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$9(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$9(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$a.name,
			type: "then",
			source: "(6:0) {:then value}",
			ctx
		});

		return block;
	}

	// (7:1) {#each value.data.results as movie}
	function create_each_block$9(ctx) {
		let article;
		let h3;
		let t0;
		let t1_value = /*movie*/ ctx[2].title + "";
		let t1;
		let t2;
		let p;
		let t3;
		let t4_value = /*movie*/ ctx[2].overview + "";
		let t4;
		let t5;
		let img;
		let img_src_value;
		let t6;
		let br;
		let t7;

		const block = {
			c: function create() {
				article = element("article");
				h3 = element("h3");
				t0 = text$1("영화명 : ");
				t1 = text$1(t1_value);
				t2 = space();
				p = element("p");
				t3 = text$1("설명: ");
				t4 = text$1(t4_value);
				t5 = space();
				img = element("img");
				t6 = space();
				br = element("br");
				t7 = space();
				add_location(h3, file$j, 8, 4, 153);
				add_location(p, file$j, 9, 2, 185);
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/w200${/*movie*/ ctx[2].poster_path}`)) attr_dev(img, "src", img_src_value);
				add_location(img, file$j, 10, 2, 216);
				add_location(br, file$j, 11, 2, 286);
				attr_dev(article, "class", "svelte-8g9o62");
				add_location(article, file$j, 7, 2, 138);
			},
			m: function mount(target, anchor) {
				insert_dev(target, article, anchor);
				append_dev(article, h3);
				append_dev(h3, t0);
				append_dev(h3, t1);
				append_dev(article, t2);
				append_dev(article, p);
				append_dev(p, t3);
				append_dev(p, t4);
				append_dev(article, t5);
				append_dev(article, img);
				append_dev(article, t6);
				append_dev(article, br);
				append_dev(article, t7);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*promise*/ 1 && t1_value !== (t1_value = /*movie*/ ctx[2].title + "")) set_data_dev(t1, t1_value);
				if (dirty & /*promise*/ 1 && t4_value !== (t4_value = /*movie*/ ctx[2].overview + "")) set_data_dev(t4, t4_value);

				if (dirty & /*promise*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/w200${/*movie*/ ctx[2].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(article);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$9.name,
			type: "each",
			source: "(7:1) {#each value.data.results as movie}",
			ctx
		});

		return block;
	}

	// (4:16)     <p>loading...</p>  {:then value}
	function create_pending_block$a(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element("p");
				p.textContent = "loading...";
				add_location(p, file$j, 4, 2, 64);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$a.name,
			type: "pending",
			source: "(4:16)     <p>loading...</p>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$A(ctx) {
		let await_block_anchor;
		let promise_1;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$a,
			then: create_then_block$a,
			catch: create_catch_block$a,
			value: 1,
			error: 5
		};

		handle_promise(promise_1 = /*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				info.ctx = ctx;

				if (dirty & /*promise*/ 1 && promise_1 !== (promise_1 = /*promise*/ ctx[0]) && handle_promise(promise_1, info)) ; else {
					update_await_block_branch(info, ctx, dirty);
				}
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$A.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$A($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TMDB', slots, []);
		let { promise } = $$props;

		$$self.$$.on_mount.push(function () {
			if (promise === undefined && !('promise' in $$props || $$self.$$.bound[$$self.$$.props['promise']])) {
				console.warn("<TMDB> was created without expected prop 'promise'");
			}
		});

		const writable_props = ['promise'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TMDB> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
		};

		$$self.$capture_state = () => ({ promise });

		$$self.$inject_state = $$props => {
			if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [promise];
	}

	class TMDB extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$A, create_fragment$A, safe_not_equal, { promise: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TMDB",
				options,
				id: create_fragment$A.name
			});
		}

		get promise() {
			throw new Error("<TMDB>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set promise(value) {
			throw new Error("<TMDB>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/**
	 * Create a bound version of a function with a specified `this` context
	 *
	 * @param {Function} fn - The function to bind
	 * @param {*} thisArg - The value to be passed as the `this` parameter
	 * @returns {Function} A new function that will call the original function with the specified `this` context
	 */
	function bind(fn, thisArg) {
	  return function wrap() {
	    return fn.apply(thisArg, arguments);
	  };
	}

	// utils is a library of generic helper functions non-specific to axios

	const { toString } = Object.prototype;
	const { getPrototypeOf } = Object;
	const { iterator, toStringTag } = Symbol;

	const kindOf = ((cache) => (thing) => {
	  const str = toString.call(thing);
	  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
	})(Object.create(null));

	const kindOfTest = (type) => {
	  type = type.toLowerCase();
	  return (thing) => kindOf(thing) === type;
	};

	const typeOfTest = (type) => (thing) => typeof thing === type;

	/**
	 * Determine if a value is a non-null object
	 *
	 * @param {Object} val The value to test
	 *
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	const { isArray } = Array;

	/**
	 * Determine if a value is undefined
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	const isUndefined = typeOfTest('undefined');

	/**
	 * Determine if a value is a Buffer
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a Buffer, otherwise false
	 */
	function isBuffer(val) {
	  return (
	    val !== null &&
	    !isUndefined(val) &&
	    val.constructor !== null &&
	    !isUndefined(val.constructor) &&
	    isFunction$1(val.constructor.isBuffer) &&
	    val.constructor.isBuffer(val)
	  );
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	const isArrayBuffer = kindOfTest('ArrayBuffer');

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  let result;
	  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = val && val.buffer && isArrayBuffer(val.buffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	const isString = typeOfTest('string');

	/**
	 * Determine if a value is a Function
	 *
	 * @param {*} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	const isFunction$1 = typeOfTest('function');

	/**
	 * Determine if a value is a Number
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	const isNumber = typeOfTest('number');

	/**
	 * Determine if a value is an Object
	 *
	 * @param {*} thing The value to test
	 *
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	const isObject = (thing) => thing !== null && typeof thing === 'object';

	/**
	 * Determine if a value is a Boolean
	 *
	 * @param {*} thing The value to test
	 * @returns {boolean} True if value is a Boolean, otherwise false
	 */
	const isBoolean = (thing) => thing === true || thing === false;

	/**
	 * Determine if a value is a plain Object
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a plain Object, otherwise false
	 */
	const isPlainObject = (val) => {
	  if (kindOf(val) !== 'object') {
	    return false;
	  }

	  const prototype = getPrototypeOf(val);
	  return (
	    (prototype === null ||
	      prototype === Object.prototype ||
	      Object.getPrototypeOf(prototype) === null) &&
	    !(toStringTag in val) &&
	    !(iterator in val)
	  );
	};

	/**
	 * Determine if a value is an empty object (safely handles Buffers)
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is an empty object, otherwise false
	 */
	const isEmptyObject = (val) => {
	  // Early return for non-objects or Buffers to prevent RangeError
	  if (!isObject(val) || isBuffer(val)) {
	    return false;
	  }

	  try {
	    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
	  } catch (e) {
	    // Fallback for any other objects that might cause RangeError with Object.keys()
	    return false;
	  }
	};

	/**
	 * Determine if a value is a Date
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	const isDate = kindOfTest('Date');

	/**
	 * Determine if a value is a File
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	const isFile = kindOfTest('File');

	/**
	 * Determine if a value is a React Native Blob
	 * React Native "blob": an object with a `uri` attribute. Optionally, it can
	 * also have a `name` and `type` attribute to specify filename and content type
	 *
	 * @see https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Network/FormData.js#L68-L71
	 * 
	 * @param {*} value The value to test
	 * 
	 * @returns {boolean} True if value is a React Native Blob, otherwise false
	 */
	const isReactNativeBlob = (value) => {
	  return !!(value && typeof value.uri !== 'undefined');
	};

	/**
	 * Determine if environment is React Native
	 * ReactNative `FormData` has a non-standard `getParts()` method
	 * 
	 * @param {*} formData The formData to test
	 * 
	 * @returns {boolean} True if environment is React Native, otherwise false
	 */
	const isReactNative = (formData) => formData && typeof formData.getParts !== 'undefined';

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	const isBlob = kindOfTest('Blob');

	/**
	 * Determine if a value is a FileList
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	const isFileList = kindOfTest('FileList');

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	const isStream = (val) => isObject(val) && isFunction$1(val.pipe);

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {*} thing The value to test
	 *
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function getGlobal() {
	  if (typeof globalThis !== 'undefined') return globalThis;
	  if (typeof self !== 'undefined') return self;
	  if (typeof window !== 'undefined') return window;
	  if (typeof global !== 'undefined') return global;
	  return {};
	}

	const G = getGlobal();
	const FormDataCtor = typeof G.FormData !== 'undefined' ? G.FormData : undefined;

	const isFormData = (thing) => {
	  if (!thing) return false;
	  if (FormDataCtor && thing instanceof FormDataCtor) return true;
	  // Reject plain objects inheriting directly from Object.prototype so prototype-pollution gadgets can't spoof FormData (GHSA-6chq-wfr3-2hj9).
	  const proto = getPrototypeOf(thing);
	  if (!proto || proto === Object.prototype) return false;
	  if (!isFunction$1(thing.append)) return false;
	  const kind = kindOf(thing);
	  return kind === 'formdata' ||
	    // detect form-data instance
	    (kind === 'object' && isFunction$1(thing.toString) && thing.toString() === '[object FormData]');
	};

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	const isURLSearchParams = kindOfTest('URLSearchParams');

	const [isReadableStream, isRequest, isResponse, isHeaders] = [
	  'ReadableStream',
	  'Request',
	  'Response',
	  'Headers',
	].map(kindOfTest);

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 *
	 * @returns {String} The String freed of excess whitespace
	 */
	const trim = (str) => {
	  return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array<unknown>} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 *
	 * @param {Object} [options]
	 * @param {Boolean} [options.allOwnKeys = false]
	 * @returns {any}
	 */
	function forEach(obj, fn, { allOwnKeys = false } = {}) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  let i;
	  let l;

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object') {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Buffer check
	    if (isBuffer(obj)) {
	      return;
	    }

	    // Iterate over object keys
	    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
	    const len = keys.length;
	    let key;

	    for (i = 0; i < len; i++) {
	      key = keys[i];
	      fn.call(null, obj[key], key, obj);
	    }
	  }
	}

	/**
	 * Finds a key in an object, case-insensitive, returning the actual key name.
	 * Returns null if the object is a Buffer or if no match is found.
	 *
	 * @param {Object} obj - The object to search.
	 * @param {string} key - The key to find (case-insensitive).
	 * @returns {?string} The actual key name if found, otherwise null.
	 */
	function findKey(obj, key) {
	  if (isBuffer(obj)) {
	    return null;
	  }

	  key = key.toLowerCase();
	  const keys = Object.keys(obj);
	  let i = keys.length;
	  let _key;
	  while (i-- > 0) {
	    _key = keys[i];
	    if (key === _key.toLowerCase()) {
	      return _key;
	    }
	  }
	  return null;
	}

	const _global = (() => {
	  /*eslint no-undef:0*/
	  if (typeof globalThis !== 'undefined') return globalThis;
	  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;
	})();

	const isContextDefined = (context) => !isUndefined(context) && context !== _global;

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * const result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 *
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  const { caseless, skipUndefined } = (isContextDefined(this) && this) || {};
	  const result = {};
	  const assignValue = (val, key) => {
	    // Skip dangerous property names to prevent prototype pollution
	    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
	      return;
	    }

	    const targetKey = (caseless && findKey(result, key)) || key;
	    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
	      result[targetKey] = merge(result[targetKey], val);
	    } else if (isPlainObject(val)) {
	      result[targetKey] = merge({}, val);
	    } else if (isArray(val)) {
	      result[targetKey] = val.slice();
	    } else if (!skipUndefined || !isUndefined(val)) {
	      result[targetKey] = val;
	    }
	  };

	  for (let i = 0, l = arguments.length; i < l; i++) {
	    arguments[i] && forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 *
	 * @param {Object} [options]
	 * @param {Boolean} [options.allOwnKeys]
	 * @returns {Object} The resulting value of object a
	 */
	const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
	  forEach(
	    b,
	    (val, key) => {
	      if (thisArg && isFunction$1(val)) {
	        Object.defineProperty(a, key, {
	          value: bind(val, thisArg),
	          writable: true,
	          enumerable: true,
	          configurable: true,
	        });
	      } else {
	        Object.defineProperty(a, key, {
	          value: val,
	          writable: true,
	          enumerable: true,
	          configurable: true,
	        });
	      }
	    },
	    { allOwnKeys }
	  );
	  return a;
	};

	/**
	 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	 *
	 * @param {string} content with BOM
	 *
	 * @returns {string} content value without BOM
	 */
	const stripBOM = (content) => {
	  if (content.charCodeAt(0) === 0xfeff) {
	    content = content.slice(1);
	  }
	  return content;
	};

	/**
	 * Inherit the prototype methods from one constructor into another
	 * @param {function} constructor
	 * @param {function} superConstructor
	 * @param {object} [props]
	 * @param {object} [descriptors]
	 *
	 * @returns {void}
	 */
	const inherits = (constructor, superConstructor, props, descriptors) => {
	  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
	  Object.defineProperty(constructor.prototype, 'constructor', {
	    value: constructor,
	    writable: true,
	    enumerable: false,
	    configurable: true,
	  });
	  Object.defineProperty(constructor, 'super', {
	    value: superConstructor.prototype,
	  });
	  props && Object.assign(constructor.prototype, props);
	};

	/**
	 * Resolve object with deep prototype chain to a flat object
	 * @param {Object} sourceObj source object
	 * @param {Object} [destObj]
	 * @param {Function|Boolean} [filter]
	 * @param {Function} [propFilter]
	 *
	 * @returns {Object}
	 */
	const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
	  let props;
	  let i;
	  let prop;
	  const merged = {};

	  destObj = destObj || {};
	  // eslint-disable-next-line no-eq-null,eqeqeq
	  if (sourceObj == null) return destObj;

	  do {
	    props = Object.getOwnPropertyNames(sourceObj);
	    i = props.length;
	    while (i-- > 0) {
	      prop = props[i];
	      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
	        destObj[prop] = sourceObj[prop];
	        merged[prop] = true;
	      }
	    }
	    sourceObj = filter !== false && getPrototypeOf(sourceObj);
	  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

	  return destObj;
	};

	/**
	 * Determines whether a string ends with the characters of a specified string
	 *
	 * @param {String} str
	 * @param {String} searchString
	 * @param {Number} [position= 0]
	 *
	 * @returns {boolean}
	 */
	const endsWith = (str, searchString, position) => {
	  str = String(str);
	  if (position === undefined || position > str.length) {
	    position = str.length;
	  }
	  position -= searchString.length;
	  const lastIndex = str.indexOf(searchString, position);
	  return lastIndex !== -1 && lastIndex === position;
	};

	/**
	 * Returns new array from array like object or null if failed
	 *
	 * @param {*} [thing]
	 *
	 * @returns {?Array}
	 */
	const toArray = (thing) => {
	  if (!thing) return null;
	  if (isArray(thing)) return thing;
	  let i = thing.length;
	  if (!isNumber(i)) return null;
	  const arr = new Array(i);
	  while (i-- > 0) {
	    arr[i] = thing[i];
	  }
	  return arr;
	};

	/**
	 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
	 * thing passed in is an instance of Uint8Array
	 *
	 * @param {TypedArray}
	 *
	 * @returns {Array}
	 */
	// eslint-disable-next-line func-names
	const isTypedArray = ((TypedArray) => {
	  // eslint-disable-next-line func-names
	  return (thing) => {
	    return TypedArray && thing instanceof TypedArray;
	  };
	})(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

	/**
	 * For each entry in the object, call the function with the key and value.
	 *
	 * @param {Object<any, any>} obj - The object to iterate over.
	 * @param {Function} fn - The function to call for each entry.
	 *
	 * @returns {void}
	 */
	const forEachEntry = (obj, fn) => {
	  const generator = obj && obj[iterator];

	  const _iterator = generator.call(obj);

	  let result;

	  while ((result = _iterator.next()) && !result.done) {
	    const pair = result.value;
	    fn.call(obj, pair[0], pair[1]);
	  }
	};

	/**
	 * It takes a regular expression and a string, and returns an array of all the matches
	 *
	 * @param {string} regExp - The regular expression to match against.
	 * @param {string} str - The string to search.
	 *
	 * @returns {Array<boolean>}
	 */
	const matchAll = (regExp, str) => {
	  let matches;
	  const arr = [];

	  while ((matches = regExp.exec(str)) !== null) {
	    arr.push(matches);
	  }

	  return arr;
	};

	/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
	const isHTMLForm = kindOfTest('HTMLFormElement');

	const toCamelCase = (str) => {
	  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
	    return p1.toUpperCase() + p2;
	  });
	};

	/* Creating a function that will check if an object has a property. */
	const hasOwnProperty = (
	  ({ hasOwnProperty }) =>
	  (obj, prop) =>
	    hasOwnProperty.call(obj, prop)
	)(Object.prototype);

	/**
	 * Determine if a value is a RegExp object
	 *
	 * @param {*} val The value to test
	 *
	 * @returns {boolean} True if value is a RegExp object, otherwise false
	 */
	const isRegExp = kindOfTest('RegExp');

	const reduceDescriptors = (obj, reducer) => {
	  const descriptors = Object.getOwnPropertyDescriptors(obj);
	  const reducedDescriptors = {};

	  forEach(descriptors, (descriptor, name) => {
	    let ret;
	    if ((ret = reducer(descriptor, name, obj)) !== false) {
	      reducedDescriptors[name] = ret || descriptor;
	    }
	  });

	  Object.defineProperties(obj, reducedDescriptors);
	};

	/**
	 * Makes all methods read-only
	 * @param {Object} obj
	 */

	const freezeMethods = (obj) => {
	  reduceDescriptors(obj, (descriptor, name) => {
	    // skip restricted props in strict mode
	    if (isFunction$1(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
	      return false;
	    }

	    const value = obj[name];

	    if (!isFunction$1(value)) return;

	    descriptor.enumerable = false;

	    if ('writable' in descriptor) {
	      descriptor.writable = false;
	      return;
	    }

	    if (!descriptor.set) {
	      descriptor.set = () => {
	        throw Error("Can not rewrite read-only method '" + name + "'");
	      };
	    }
	  });
	};

	/**
	 * Converts an array or a delimited string into an object set with values as keys and true as values.
	 * Useful for fast membership checks.
	 *
	 * @param {Array|string} arrayOrString - The array or string to convert.
	 * @param {string} delimiter - The delimiter to use if input is a string.
	 * @returns {Object} An object with keys from the array or string, values set to true.
	 */
	const toObjectSet = (arrayOrString, delimiter) => {
	  const obj = {};

	  const define = (arr) => {
	    arr.forEach((value) => {
	      obj[value] = true;
	    });
	  };

	  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

	  return obj;
	};

	const noop = () => {};

	const toFiniteNumber = (value, defaultValue) => {
	  return value != null && Number.isFinite((value = +value)) ? value : defaultValue;
	};

	/**
	 * If the thing is a FormData object, return true, otherwise return false.
	 *
	 * @param {unknown} thing - The thing to check.
	 *
	 * @returns {boolean}
	 */
	function isSpecCompliantForm(thing) {
	  return !!(
	    thing &&
	    isFunction$1(thing.append) &&
	    thing[toStringTag] === 'FormData' &&
	    thing[iterator]
	  );
	}

	/**
	 * Recursively converts an object to a JSON-compatible object, handling circular references and Buffers.
	 *
	 * @param {Object} obj - The object to convert.
	 * @returns {Object} The JSON-compatible object.
	 */
	const toJSONObject = (obj) => {
	  const stack = new Array(10);

	  const visit = (source, i) => {
	    if (isObject(source)) {
	      if (stack.indexOf(source) >= 0) {
	        return;
	      }

	      //Buffer check
	      if (isBuffer(source)) {
	        return source;
	      }

	      if (!('toJSON' in source)) {
	        stack[i] = source;
	        const target = isArray(source) ? [] : {};

	        forEach(source, (value, key) => {
	          const reducedValue = visit(value, i + 1);
	          !isUndefined(reducedValue) && (target[key] = reducedValue);
	        });

	        stack[i] = undefined;

	        return target;
	      }
	    }

	    return source;
	  };

	  return visit(obj, 0);
	};

	/**
	 * Determines if a value is an async function.
	 *
	 * @param {*} thing - The value to test.
	 * @returns {boolean} True if value is an async function, otherwise false.
	 */
	const isAsyncFn = kindOfTest('AsyncFunction');

	/**
	 * Determines if a value is thenable (has then and catch methods).
	 *
	 * @param {*} thing - The value to test.
	 * @returns {boolean} True if value is thenable, otherwise false.
	 */
	const isThenable = (thing) =>
	  thing &&
	  (isObject(thing) || isFunction$1(thing)) &&
	  isFunction$1(thing.then) &&
	  isFunction$1(thing.catch);

	// original code
	// https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

	/**
	 * Provides a cross-platform setImmediate implementation.
	 * Uses native setImmediate if available, otherwise falls back to postMessage or setTimeout.
	 *
	 * @param {boolean} setImmediateSupported - Whether setImmediate is supported.
	 * @param {boolean} postMessageSupported - Whether postMessage is supported.
	 * @returns {Function} A function to schedule a callback asynchronously.
	 */
	const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
	  if (setImmediateSupported) {
	    return setImmediate;
	  }

	  return postMessageSupported
	    ? ((token, callbacks) => {
	        _global.addEventListener(
	          'message',
	          ({ source, data }) => {
	            if (source === _global && data === token) {
	              callbacks.length && callbacks.shift()();
	            }
	          },
	          false
	        );

	        return (cb) => {
	          callbacks.push(cb);
	          _global.postMessage(token, '*');
	        };
	      })(`axios@${Math.random()}`, [])
	    : (cb) => setTimeout(cb);
	})(typeof setImmediate === 'function', isFunction$1(_global.postMessage));

	/**
	 * Schedules a microtask or asynchronous callback as soon as possible.
	 * Uses queueMicrotask if available, otherwise falls back to process.nextTick or _setImmediate.
	 *
	 * @type {Function}
	 */
	const asap =
	  typeof queueMicrotask !== 'undefined'
	    ? queueMicrotask.bind(_global)
	    : (typeof process !== 'undefined' && process.nextTick) || _setImmediate;

	// *********************

	const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);

	var utils$1 = {
	  isArray,
	  isArrayBuffer,
	  isBuffer,
	  isFormData,
	  isArrayBufferView,
	  isString,
	  isNumber,
	  isBoolean,
	  isObject,
	  isPlainObject,
	  isEmptyObject,
	  isReadableStream,
	  isRequest,
	  isResponse,
	  isHeaders,
	  isUndefined,
	  isDate,
	  isFile,
	  isReactNativeBlob,
	  isReactNative,
	  isBlob,
	  isRegExp,
	  isFunction: isFunction$1,
	  isStream,
	  isURLSearchParams,
	  isTypedArray,
	  isFileList,
	  forEach,
	  merge,
	  extend,
	  trim,
	  stripBOM,
	  inherits,
	  toFlatObject,
	  kindOf,
	  kindOfTest,
	  endsWith,
	  toArray,
	  forEachEntry,
	  matchAll,
	  isHTMLForm,
	  hasOwnProperty,
	  hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
	  reduceDescriptors,
	  freezeMethods,
	  toObjectSet,
	  toCamelCase,
	  noop,
	  toFiniteNumber,
	  findKey,
	  global: _global,
	  isContextDefined,
	  isSpecCompliantForm,
	  toJSONObject,
	  isAsyncFn,
	  isThenable,
	  setImmediate: _setImmediate,
	  asap,
	  isIterable,
	};

	class AxiosError extends Error {
	  static from(error, code, config, request, response, customProps) {
	    const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
	    axiosError.cause = error;
	    axiosError.name = error.name;

	    // Preserve status from the original error if not already set from response
	    if (error.status != null && axiosError.status == null) {
	      axiosError.status = error.status;
	    }

	    customProps && Object.assign(axiosError, customProps);
	    return axiosError;
	  }

	  /**
	   * Create an Error with the specified message, config, error code, request and response.
	   *
	   * @param {string} message The error message.
	   * @param {string} [code] The error code (for example, 'ECONNABORTED').
	   * @param {Object} [config] The config.
	   * @param {Object} [request] The request.
	   * @param {Object} [response] The response.
	   *
	   * @returns {Error} The created error.
	   */
	  constructor(message, code, config, request, response) {
	    super(message);

	    // Make message enumerable to maintain backward compatibility
	    // The native Error constructor sets message as non-enumerable,
	    // but axios < v1.13.3 had it as enumerable
	    Object.defineProperty(this, 'message', {
	      value: message,
	      enumerable: true,
	      writable: true,
	      configurable: true,
	    });

	    this.name = 'AxiosError';
	    this.isAxiosError = true;
	    code && (this.code = code);
	    config && (this.config = config);
	    request && (this.request = request);
	    if (response) {
	      this.response = response;
	      this.status = response.status;
	    }
	  }

	  toJSON() {
	    return {
	      // Standard
	      message: this.message,
	      name: this.name,
	      // Microsoft
	      description: this.description,
	      number: this.number,
	      // Mozilla
	      fileName: this.fileName,
	      lineNumber: this.lineNumber,
	      columnNumber: this.columnNumber,
	      stack: this.stack,
	      // Axios
	      config: utils$1.toJSONObject(this.config),
	      code: this.code,
	      status: this.status,
	    };
	  }
	}

	// This can be changed to static properties as soon as the parser options in .eslint.cjs are updated.
	AxiosError.ERR_BAD_OPTION_VALUE = 'ERR_BAD_OPTION_VALUE';
	AxiosError.ERR_BAD_OPTION = 'ERR_BAD_OPTION';
	AxiosError.ECONNABORTED = 'ECONNABORTED';
	AxiosError.ETIMEDOUT = 'ETIMEDOUT';
	AxiosError.ERR_NETWORK = 'ERR_NETWORK';
	AxiosError.ERR_FR_TOO_MANY_REDIRECTS = 'ERR_FR_TOO_MANY_REDIRECTS';
	AxiosError.ERR_DEPRECATED = 'ERR_DEPRECATED';
	AxiosError.ERR_BAD_RESPONSE = 'ERR_BAD_RESPONSE';
	AxiosError.ERR_BAD_REQUEST = 'ERR_BAD_REQUEST';
	AxiosError.ERR_CANCELED = 'ERR_CANCELED';
	AxiosError.ERR_NOT_SUPPORT = 'ERR_NOT_SUPPORT';
	AxiosError.ERR_INVALID_URL = 'ERR_INVALID_URL';
	AxiosError.ERR_FORM_DATA_DEPTH_EXCEEDED = 'ERR_FORM_DATA_DEPTH_EXCEEDED';

	var AxiosError$1 = AxiosError;

	// eslint-disable-next-line strict
	var httpAdapter = null;

	/**
	 * Determines if the given thing is a array or js object.
	 *
	 * @param {string} thing - The object or array to be visited.
	 *
	 * @returns {boolean}
	 */
	function isVisitable(thing) {
	  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
	}

	/**
	 * It removes the brackets from the end of a string
	 *
	 * @param {string} key - The key of the parameter.
	 *
	 * @returns {string} the key without the brackets.
	 */
	function removeBrackets(key) {
	  return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
	}

	/**
	 * It takes a path, a key, and a boolean, and returns a string
	 *
	 * @param {string} path - The path to the current key.
	 * @param {string} key - The key of the current object being iterated over.
	 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
	 *
	 * @returns {string} The path to the current key.
	 */
	function renderKey(path, key, dots) {
	  if (!path) return key;
	  return path
	    .concat(key)
	    .map(function each(token, i) {
	      // eslint-disable-next-line no-param-reassign
	      token = removeBrackets(token);
	      return !dots && i ? '[' + token + ']' : token;
	    })
	    .join(dots ? '.' : '');
	}

	/**
	 * If the array is an array and none of its elements are visitable, then it's a flat array.
	 *
	 * @param {Array<any>} arr - The array to check
	 *
	 * @returns {boolean}
	 */
	function isFlatArray(arr) {
	  return utils$1.isArray(arr) && !arr.some(isVisitable);
	}

	const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
	  return /^is[A-Z]/.test(prop);
	});

	/**
	 * Convert a data object to FormData
	 *
	 * @param {Object} obj
	 * @param {?Object} [formData]
	 * @param {?Object} [options]
	 * @param {Function} [options.visitor]
	 * @param {Boolean} [options.metaTokens = true]
	 * @param {Boolean} [options.dots = false]
	 * @param {?Boolean} [options.indexes = false]
	 *
	 * @returns {Object}
	 **/

	/**
	 * It converts an object into a FormData object
	 *
	 * @param {Object<any, any>} obj - The object to convert to form data.
	 * @param {string} formData - The FormData object to append to.
	 * @param {Object<string, any>} options
	 *
	 * @returns
	 */
	function toFormData(obj, formData, options) {
	  if (!utils$1.isObject(obj)) {
	    throw new TypeError('target must be an object');
	  }

	  // eslint-disable-next-line no-param-reassign
	  formData = formData || new (FormData)();

	  // eslint-disable-next-line no-param-reassign
	  options = utils$1.toFlatObject(
	    options,
	    {
	      metaTokens: true,
	      dots: false,
	      indexes: false,
	    },
	    false,
	    function defined(option, source) {
	      // eslint-disable-next-line no-eq-null,eqeqeq
	      return !utils$1.isUndefined(source[option]);
	    }
	  );

	  const metaTokens = options.metaTokens;
	  // eslint-disable-next-line no-use-before-define
	  const visitor = options.visitor || defaultVisitor;
	  const dots = options.dots;
	  const indexes = options.indexes;
	  const _Blob = options.Blob || (typeof Blob !== 'undefined' && Blob);
	  const maxDepth = options.maxDepth === undefined ? 100 : options.maxDepth;
	  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

	  if (!utils$1.isFunction(visitor)) {
	    throw new TypeError('visitor must be a function');
	  }

	  function convertValue(value) {
	    if (value === null) return '';

	    if (utils$1.isDate(value)) {
	      return value.toISOString();
	    }

	    if (utils$1.isBoolean(value)) {
	      return value.toString();
	    }

	    if (!useBlob && utils$1.isBlob(value)) {
	      throw new AxiosError$1('Blob is not supported. Use a Buffer instead.');
	    }

	    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
	      return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
	    }

	    return value;
	  }

	  /**
	   * Default visitor.
	   *
	   * @param {*} value
	   * @param {String|Number} key
	   * @param {Array<String|Number>} path
	   * @this {FormData}
	   *
	   * @returns {boolean} return true to visit the each prop of the value recursively
	   */
	  function defaultVisitor(value, key, path) {
	    let arr = value;

	    if (utils$1.isReactNative(formData) && utils$1.isReactNativeBlob(value)) {
	      formData.append(renderKey(path, key, dots), convertValue(value));
	      return false;
	    }

	    if (value && !path && typeof value === 'object') {
	      if (utils$1.endsWith(key, '{}')) {
	        // eslint-disable-next-line no-param-reassign
	        key = metaTokens ? key : key.slice(0, -2);
	        // eslint-disable-next-line no-param-reassign
	        value = JSON.stringify(value);
	      } else if (
	        (utils$1.isArray(value) && isFlatArray(value)) ||
	        ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value)))
	      ) {
	        // eslint-disable-next-line no-param-reassign
	        key = removeBrackets(key);

	        arr.forEach(function each(el, index) {
	          !(utils$1.isUndefined(el) || el === null) &&
	            formData.append(
	              // eslint-disable-next-line no-nested-ternary
	              indexes === true
	                ? renderKey([key], index, dots)
	                : indexes === null
	                  ? key
	                  : key + '[]',
	              convertValue(el)
	            );
	        });
	        return false;
	      }
	    }

	    if (isVisitable(value)) {
	      return true;
	    }

	    formData.append(renderKey(path, key, dots), convertValue(value));

	    return false;
	  }

	  const stack = [];

	  const exposedHelpers = Object.assign(predicates, {
	    defaultVisitor,
	    convertValue,
	    isVisitable,
	  });

	  function build(value, path, depth = 0) {
	    if (utils$1.isUndefined(value)) return;

	    if (depth > maxDepth) {
	      throw new AxiosError$1(
	        'Object is too deeply nested (' + depth + ' levels). Max depth: ' + maxDepth,
	        AxiosError$1.ERR_FORM_DATA_DEPTH_EXCEEDED
	      );
	    }

	    if (stack.indexOf(value) !== -1) {
	      throw Error('Circular reference detected in ' + path.join('.'));
	    }

	    stack.push(value);

	    utils$1.forEach(value, function each(el, key) {
	      const result =
	        !(utils$1.isUndefined(el) || el === null) &&
	        visitor.call(formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers);

	      if (result === true) {
	        build(el, path ? path.concat(key) : [key], depth + 1);
	      }
	    });

	    stack.pop();
	  }

	  if (!utils$1.isObject(obj)) {
	    throw new TypeError('data must be an object');
	  }

	  build(obj);

	  return formData;
	}

	/**
	 * It encodes a string by replacing all characters that are not in the unreserved set with
	 * their percent-encoded equivalents
	 *
	 * @param {string} str - The string to encode.
	 *
	 * @returns {string} The encoded string.
	 */
	function encode$1(str) {
	  const charMap = {
	    '!': '%21',
	    "'": '%27',
	    '(': '%28',
	    ')': '%29',
	    '~': '%7E',
	    '%20': '+',
	  };
	  return encodeURIComponent(str).replace(/[!'()~]|%20/g, function replacer(match) {
	    return charMap[match];
	  });
	}

	/**
	 * It takes a params object and converts it to a FormData object
	 *
	 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
	 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
	 *
	 * @returns {void}
	 */
	function AxiosURLSearchParams(params, options) {
	  this._pairs = [];

	  params && toFormData(params, this, options);
	}

	const prototype = AxiosURLSearchParams.prototype;

	prototype.append = function append(name, value) {
	  this._pairs.push([name, value]);
	};

	prototype.toString = function toString(encoder) {
	  const _encode = encoder
	    ? function (value) {
	        return encoder.call(this, value, encode$1);
	      }
	    : encode$1;

	  return this._pairs
	    .map(function each(pair) {
	      return _encode(pair[0]) + '=' + _encode(pair[1]);
	    }, '')
	    .join('&');
	};

	/**
	 * It replaces URL-encoded forms of `:`, `$`, `,`, and spaces with
	 * their plain counterparts (`:`, `$`, `,`, `+`).
	 *
	 * @param {string} val The value to be encoded.
	 *
	 * @returns {string} The encoded value.
	 */
	function encode(val) {
	  return encodeURIComponent(val)
	    .replace(/%3A/gi, ':')
	    .replace(/%24/g, '$')
	    .replace(/%2C/gi, ',')
	    .replace(/%20/g, '+');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @param {?(object|Function)} options
	 *
	 * @returns {string} The formatted url
	 */
	function buildURL(url, params, options) {
	  if (!params) {
	    return url;
	  }

	  const _encode = (options && options.encode) || encode;

	  const _options = utils$1.isFunction(options)
	    ? {
	        serialize: options,
	      }
	    : options;

	  const serializeFn = _options && _options.serialize;

	  let serializedParams;

	  if (serializeFn) {
	    serializedParams = serializeFn(params, _options);
	  } else {
	    serializedParams = utils$1.isURLSearchParams(params)
	      ? params.toString()
	      : new AxiosURLSearchParams(params, _options).toString(_encode);
	  }

	  if (serializedParams) {
	    const hashmarkIndex = url.indexOf('#');

	    if (hashmarkIndex !== -1) {
	      url = url.slice(0, hashmarkIndex);
	    }
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	}

	class InterceptorManager {
	  constructor() {
	    this.handlers = [];
	  }

	  /**
	   * Add a new interceptor to the stack
	   *
	   * @param {Function} fulfilled The function to handle `then` for a `Promise`
	   * @param {Function} rejected The function to handle `reject` for a `Promise`
	   * @param {Object} options The options for the interceptor, synchronous and runWhen
	   *
	   * @return {Number} An ID used to remove interceptor later
	   */
	  use(fulfilled, rejected, options) {
	    this.handlers.push({
	      fulfilled,
	      rejected,
	      synchronous: options ? options.synchronous : false,
	      runWhen: options ? options.runWhen : null,
	    });
	    return this.handlers.length - 1;
	  }

	  /**
	   * Remove an interceptor from the stack
	   *
	   * @param {Number} id The ID that was returned by `use`
	   *
	   * @returns {void}
	   */
	  eject(id) {
	    if (this.handlers[id]) {
	      this.handlers[id] = null;
	    }
	  }

	  /**
	   * Clear all interceptors from the stack
	   *
	   * @returns {void}
	   */
	  clear() {
	    if (this.handlers) {
	      this.handlers = [];
	    }
	  }

	  /**
	   * Iterate over all the registered interceptors
	   *
	   * This method is particularly useful for skipping over any
	   * interceptors that may have become `null` calling `eject`.
	   *
	   * @param {Function} fn The function to call for each interceptor
	   *
	   * @returns {void}
	   */
	  forEach(fn) {
	    utils$1.forEach(this.handlers, function forEachHandler(h) {
	      if (h !== null) {
	        fn(h);
	      }
	    });
	  }
	}

	var InterceptorManager$1 = InterceptorManager;

	var transitionalDefaults = {
	  silentJSONParsing: true,
	  forcedJSONParsing: true,
	  clarifyTimeoutError: false,
	  legacyInterceptorReqResOrdering: true,
	};

	var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

	var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

	var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

	var platform$1 = {
	  isBrowser: true,
	  classes: {
	    URLSearchParams: URLSearchParams$1,
	    FormData: FormData$1,
	    Blob: Blob$1,
	  },
	  protocols: ['http', 'https', 'file', 'blob', 'url', 'data'],
	};

	const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

	const _navigator = (typeof navigator === 'object' && navigator) || undefined;

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 * nativescript
	 *  navigator.product -> 'NativeScript' or 'NS'
	 *
	 * @returns {boolean}
	 */
	const hasStandardBrowserEnv =
	  hasBrowserEnv &&
	  (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

	/**
	 * Determine if we're running in a standard browser webWorker environment
	 *
	 * Although the `isStandardBrowserEnv` method indicates that
	 * `allows axios to run in a web worker`, the WebWorker will still be
	 * filtered out due to its judgment standard
	 * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
	 * This leads to a problem when axios post `FormData` in webWorker
	 */
	const hasStandardBrowserWebWorkerEnv = (() => {
	  return (
	    typeof WorkerGlobalScope !== 'undefined' &&
	    // eslint-disable-next-line no-undef
	    self instanceof WorkerGlobalScope &&
	    typeof self.importScripts === 'function'
	  );
	})();

	const origin = (hasBrowserEnv && window.location.href) || 'http://localhost';

	var utils = /*#__PURE__*/Object.freeze({
		__proto__: null,
		hasBrowserEnv: hasBrowserEnv,
		hasStandardBrowserEnv: hasStandardBrowserEnv,
		hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
		navigator: _navigator,
		origin: origin
	});

	var platform = {
	  ...utils,
	  ...platform$1,
	};

	function toURLEncodedForm(data, options) {
	  return toFormData(data, new platform.classes.URLSearchParams(), {
	    visitor: function (value, key, path, helpers) {
	      if (platform.isNode && utils$1.isBuffer(value)) {
	        this.append(key, value.toString('base64'));
	        return false;
	      }

	      return helpers.defaultVisitor.apply(this, arguments);
	    },
	    ...options,
	  });
	}

	/**
	 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
	 *
	 * @param {string} name - The name of the property to get.
	 *
	 * @returns An array of strings.
	 */
	function parsePropPath(name) {
	  // foo[x][y][z]
	  // foo.x.y.z
	  // foo-x-y-z
	  // foo x y z
	  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
	    return match[0] === '[]' ? '' : match[1] || match[0];
	  });
	}

	/**
	 * Convert an array to an object.
	 *
	 * @param {Array<any>} arr - The array to convert to an object.
	 *
	 * @returns An object with the same keys and values as the array.
	 */
	function arrayToObject(arr) {
	  const obj = {};
	  const keys = Object.keys(arr);
	  let i;
	  const len = keys.length;
	  let key;
	  for (i = 0; i < len; i++) {
	    key = keys[i];
	    obj[key] = arr[key];
	  }
	  return obj;
	}

	/**
	 * It takes a FormData object and returns a JavaScript object
	 *
	 * @param {string} formData The FormData object to convert to JSON.
	 *
	 * @returns {Object<string, any> | null} The converted object.
	 */
	function formDataToJSON(formData) {
	  function buildPath(path, value, target, index) {
	    let name = path[index++];

	    if (name === '__proto__') return true;

	    const isNumericKey = Number.isFinite(+name);
	    const isLast = index >= path.length;
	    name = !name && utils$1.isArray(target) ? target.length : name;

	    if (isLast) {
	      if (utils$1.hasOwnProp(target, name)) {
	        target[name] = utils$1.isArray(target[name])
	          ? target[name].concat(value)
	          : [target[name], value];
	      } else {
	        target[name] = value;
	      }

	      return !isNumericKey;
	    }

	    if (!target[name] || !utils$1.isObject(target[name])) {
	      target[name] = [];
	    }

	    const result = buildPath(path, value, target[name], index);

	    if (result && utils$1.isArray(target[name])) {
	      target[name] = arrayToObject(target[name]);
	    }

	    return !isNumericKey;
	  }

	  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
	    const obj = {};

	    utils$1.forEachEntry(formData, (name, value) => {
	      buildPath(parsePropPath(name), value, obj, 0);
	    });

	    return obj;
	  }

	  return null;
	}

	const own = (obj, key) => (obj != null && utils$1.hasOwnProp(obj, key) ? obj[key] : undefined);

	/**
	 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
	 * of the input
	 *
	 * @param {any} rawValue - The value to be stringified.
	 * @param {Function} parser - A function that parses a string into a JavaScript object.
	 * @param {Function} encoder - A function that takes a value and returns a string.
	 *
	 * @returns {string} A stringified version of the rawValue.
	 */
	function stringifySafely(rawValue, parser, encoder) {
	  if (utils$1.isString(rawValue)) {
	    try {
	      (parser || JSON.parse)(rawValue);
	      return utils$1.trim(rawValue);
	    } catch (e) {
	      if (e.name !== 'SyntaxError') {
	        throw e;
	      }
	    }
	  }

	  return (encoder || JSON.stringify)(rawValue);
	}

	const defaults = {
	  transitional: transitionalDefaults,

	  adapter: ['xhr', 'http', 'fetch'],

	  transformRequest: [
	    function transformRequest(data, headers) {
	      const contentType = headers.getContentType() || '';
	      const hasJSONContentType = contentType.indexOf('application/json') > -1;
	      const isObjectPayload = utils$1.isObject(data);

	      if (isObjectPayload && utils$1.isHTMLForm(data)) {
	        data = new FormData(data);
	      }

	      const isFormData = utils$1.isFormData(data);

	      if (isFormData) {
	        return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
	      }

	      if (
	        utils$1.isArrayBuffer(data) ||
	        utils$1.isBuffer(data) ||
	        utils$1.isStream(data) ||
	        utils$1.isFile(data) ||
	        utils$1.isBlob(data) ||
	        utils$1.isReadableStream(data)
	      ) {
	        return data;
	      }
	      if (utils$1.isArrayBufferView(data)) {
	        return data.buffer;
	      }
	      if (utils$1.isURLSearchParams(data)) {
	        headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
	        return data.toString();
	      }

	      let isFileList;

	      if (isObjectPayload) {
	        const formSerializer = own(this, 'formSerializer');
	        if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
	          return toURLEncodedForm(data, formSerializer).toString();
	        }

	        if (
	          (isFileList = utils$1.isFileList(data)) ||
	          contentType.indexOf('multipart/form-data') > -1
	        ) {
	          const env = own(this, 'env');
	          const _FormData = env && env.FormData;

	          return toFormData(
	            isFileList ? { 'files[]': data } : data,
	            _FormData && new _FormData(),
	            formSerializer
	          );
	        }
	      }

	      if (isObjectPayload || hasJSONContentType) {
	        headers.setContentType('application/json', false);
	        return stringifySafely(data);
	      }

	      return data;
	    },
	  ],

	  transformResponse: [
	    function transformResponse(data) {
	      const transitional = own(this, 'transitional') || defaults.transitional;
	      const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
	      const responseType = own(this, 'responseType');
	      const JSONRequested = responseType === 'json';

	      if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
	        return data;
	      }

	      if (
	        data &&
	        utils$1.isString(data) &&
	        ((forcedJSONParsing && !responseType) || JSONRequested)
	      ) {
	        const silentJSONParsing = transitional && transitional.silentJSONParsing;
	        const strictJSONParsing = !silentJSONParsing && JSONRequested;

	        try {
	          return JSON.parse(data, own(this, 'parseReviver'));
	        } catch (e) {
	          if (strictJSONParsing) {
	            if (e.name === 'SyntaxError') {
	              throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, own(this, 'response'));
	            }
	            throw e;
	          }
	        }
	      }

	      return data;
	    },
	  ],

	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,
	  maxBodyLength: -1,

	  env: {
	    FormData: platform.classes.FormData,
	    Blob: platform.classes.Blob,
	  },

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  },

	  headers: {
	    common: {
	      Accept: 'application/json, text/plain, */*',
	      'Content-Type': undefined,
	    },
	  },
	};

	utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
	  defaults.headers[method] = {};
	});

	var defaults$1 = defaults;

	// RawAxiosHeaders whose duplicates are ignored by node
	// c.f. https://nodejs.org/api/http.html#http_message_headers
	const ignoreDuplicateOf = utils$1.toObjectSet([
	  'age',
	  'authorization',
	  'content-length',
	  'content-type',
	  'etag',
	  'expires',
	  'from',
	  'host',
	  'if-modified-since',
	  'if-unmodified-since',
	  'last-modified',
	  'location',
	  'max-forwards',
	  'proxy-authorization',
	  'referer',
	  'retry-after',
	  'user-agent',
	]);

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} rawHeaders Headers needing to be parsed
	 *
	 * @returns {Object} Headers parsed into an object
	 */
	var parseHeaders = (rawHeaders) => {
	  const parsed = {};
	  let key;
	  let val;
	  let i;

	  rawHeaders &&
	    rawHeaders.split('\n').forEach(function parser(line) {
	      i = line.indexOf(':');
	      key = line.substring(0, i).trim().toLowerCase();
	      val = line.substring(i + 1).trim();

	      if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
	        return;
	      }

	      if (key === 'set-cookie') {
	        if (parsed[key]) {
	          parsed[key].push(val);
	        } else {
	          parsed[key] = [val];
	        }
	      } else {
	        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	      }
	    });

	  return parsed;
	};

	const $internals = Symbol('internals');

	const INVALID_HEADER_VALUE_CHARS_RE = /[^\x09\x20-\x7E\x80-\xFF]/g;

	function trimSPorHTAB(str) {
	  let start = 0;
	  let end = str.length;

	  while (start < end) {
	    const code = str.charCodeAt(start);

	    if (code !== 0x09 && code !== 0x20) {
	      break;
	    }

	    start += 1;
	  }

	  while (end > start) {
	    const code = str.charCodeAt(end - 1);

	    if (code !== 0x09 && code !== 0x20) {
	      break;
	    }

	    end -= 1;
	  }

	  return start === 0 && end === str.length ? str : str.slice(start, end);
	}

	function normalizeHeader(header) {
	  return header && String(header).trim().toLowerCase();
	}

	function sanitizeHeaderValue(str) {
	  return trimSPorHTAB(str.replace(INVALID_HEADER_VALUE_CHARS_RE, ''));
	}

	function normalizeValue(value) {
	  if (value === false || value == null) {
	    return value;
	  }

	  return utils$1.isArray(value) ? value.map(normalizeValue) : sanitizeHeaderValue(String(value));
	}

	function parseTokens(str) {
	  const tokens = Object.create(null);
	  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
	  let match;

	  while ((match = tokensRE.exec(str))) {
	    tokens[match[1]] = match[2];
	  }

	  return tokens;
	}

	const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

	function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
	  if (utils$1.isFunction(filter)) {
	    return filter.call(this, value, header);
	  }

	  if (isHeaderNameFilter) {
	    value = header;
	  }

	  if (!utils$1.isString(value)) return;

	  if (utils$1.isString(filter)) {
	    return value.indexOf(filter) !== -1;
	  }

	  if (utils$1.isRegExp(filter)) {
	    return filter.test(value);
	  }
	}

	function formatHeader(header) {
	  return header
	    .trim()
	    .toLowerCase()
	    .replace(/([a-z\d])(\w*)/g, (w, char, str) => {
	      return char.toUpperCase() + str;
	    });
	}

	function buildAccessors(obj, header) {
	  const accessorName = utils$1.toCamelCase(' ' + header);

	  ['get', 'set', 'has'].forEach((methodName) => {
	    Object.defineProperty(obj, methodName + accessorName, {
	      value: function (arg1, arg2, arg3) {
	        return this[methodName].call(this, header, arg1, arg2, arg3);
	      },
	      configurable: true,
	    });
	  });
	}

	class AxiosHeaders {
	  constructor(headers) {
	    headers && this.set(headers);
	  }

	  set(header, valueOrRewrite, rewrite) {
	    const self = this;

	    function setHeader(_value, _header, _rewrite) {
	      const lHeader = normalizeHeader(_header);

	      if (!lHeader) {
	        throw new Error('header name must be a non-empty string');
	      }

	      const key = utils$1.findKey(self, lHeader);

	      if (
	        !key ||
	        self[key] === undefined ||
	        _rewrite === true ||
	        (_rewrite === undefined && self[key] !== false)
	      ) {
	        self[key || _header] = normalizeValue(_value);
	      }
	    }

	    const setHeaders = (headers, _rewrite) =>
	      utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

	    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
	      setHeaders(header, valueOrRewrite);
	    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
	      setHeaders(parseHeaders(header), valueOrRewrite);
	    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
	      let obj = {},
	        dest,
	        key;
	      for (const entry of header) {
	        if (!utils$1.isArray(entry)) {
	          throw TypeError('Object iterator must return a key-value pair');
	        }

	        obj[(key = entry[0])] = (dest = obj[key])
	          ? utils$1.isArray(dest)
	            ? [...dest, entry[1]]
	            : [dest, entry[1]]
	          : entry[1];
	      }

	      setHeaders(obj, valueOrRewrite);
	    } else {
	      header != null && setHeader(valueOrRewrite, header, rewrite);
	    }

	    return this;
	  }

	  get(header, parser) {
	    header = normalizeHeader(header);

	    if (header) {
	      const key = utils$1.findKey(this, header);

	      if (key) {
	        const value = this[key];

	        if (!parser) {
	          return value;
	        }

	        if (parser === true) {
	          return parseTokens(value);
	        }

	        if (utils$1.isFunction(parser)) {
	          return parser.call(this, value, key);
	        }

	        if (utils$1.isRegExp(parser)) {
	          return parser.exec(value);
	        }

	        throw new TypeError('parser must be boolean|regexp|function');
	      }
	    }
	  }

	  has(header, matcher) {
	    header = normalizeHeader(header);

	    if (header) {
	      const key = utils$1.findKey(this, header);

	      return !!(
	        key &&
	        this[key] !== undefined &&
	        (!matcher || matchHeaderValue(this, this[key], key, matcher))
	      );
	    }

	    return false;
	  }

	  delete(header, matcher) {
	    const self = this;
	    let deleted = false;

	    function deleteHeader(_header) {
	      _header = normalizeHeader(_header);

	      if (_header) {
	        const key = utils$1.findKey(self, _header);

	        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
	          delete self[key];

	          deleted = true;
	        }
	      }
	    }

	    if (utils$1.isArray(header)) {
	      header.forEach(deleteHeader);
	    } else {
	      deleteHeader(header);
	    }

	    return deleted;
	  }

	  clear(matcher) {
	    const keys = Object.keys(this);
	    let i = keys.length;
	    let deleted = false;

	    while (i--) {
	      const key = keys[i];
	      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
	        delete this[key];
	        deleted = true;
	      }
	    }

	    return deleted;
	  }

	  normalize(format) {
	    const self = this;
	    const headers = {};

	    utils$1.forEach(this, (value, header) => {
	      const key = utils$1.findKey(headers, header);

	      if (key) {
	        self[key] = normalizeValue(value);
	        delete self[header];
	        return;
	      }

	      const normalized = format ? formatHeader(header) : String(header).trim();

	      if (normalized !== header) {
	        delete self[header];
	      }

	      self[normalized] = normalizeValue(value);

	      headers[normalized] = true;
	    });

	    return this;
	  }

	  concat(...targets) {
	    return this.constructor.concat(this, ...targets);
	  }

	  toJSON(asStrings) {
	    const obj = Object.create(null);

	    utils$1.forEach(this, (value, header) => {
	      value != null &&
	        value !== false &&
	        (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
	    });

	    return obj;
	  }

	  [Symbol.iterator]() {
	    return Object.entries(this.toJSON())[Symbol.iterator]();
	  }

	  toString() {
	    return Object.entries(this.toJSON())
	      .map(([header, value]) => header + ': ' + value)
	      .join('\n');
	  }

	  getSetCookie() {
	    return this.get('set-cookie') || [];
	  }

	  get [Symbol.toStringTag]() {
	    return 'AxiosHeaders';
	  }

	  static from(thing) {
	    return thing instanceof this ? thing : new this(thing);
	  }

	  static concat(first, ...targets) {
	    const computed = new this(first);

	    targets.forEach((target) => computed.set(target));

	    return computed;
	  }

	  static accessor(header) {
	    const internals =
	      (this[$internals] =
	      this[$internals] =
	        {
	          accessors: {},
	        });

	    const accessors = internals.accessors;
	    const prototype = this.prototype;

	    function defineAccessor(_header) {
	      const lHeader = normalizeHeader(_header);

	      if (!accessors[lHeader]) {
	        buildAccessors(prototype, _header);
	        accessors[lHeader] = true;
	      }
	    }

	    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

	    return this;
	  }
	}

	AxiosHeaders.accessor([
	  'Content-Type',
	  'Content-Length',
	  'Accept',
	  'Accept-Encoding',
	  'User-Agent',
	  'Authorization',
	]);

	// reserved names hotfix
	utils$1.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
	  let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
	  return {
	    get: () => value,
	    set(headerValue) {
	      this[mapped] = headerValue;
	    },
	  };
	});

	utils$1.freezeMethods(AxiosHeaders);

	var AxiosHeaders$1 = AxiosHeaders;

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Array|Function} fns A single function or Array of functions
	 * @param {?Object} response The response object
	 *
	 * @returns {*} The resulting transformed data
	 */
	function transformData(fns, response) {
	  const config = this || defaults$1;
	  const context = response || config;
	  const headers = AxiosHeaders$1.from(context.headers);
	  let data = context.data;

	  utils$1.forEach(fns, function transform(fn) {
	    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
	  });

	  headers.normalize();

	  return data;
	}

	function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	}

	class CanceledError extends AxiosError$1 {
	  /**
	   * A `CanceledError` is an object that is thrown when an operation is canceled.
	   *
	   * @param {string=} message The message.
	   * @param {Object=} config The config.
	   * @param {Object=} request The request.
	   *
	   * @returns {CanceledError} The created error.
	   */
	  constructor(message, config, request) {
	    super(message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
	    this.name = 'CanceledError';
	    this.__CANCEL__ = true;
	  }
	}

	var CanceledError$1 = CanceledError;

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 *
	 * @returns {object} The response.
	 */
	function settle(resolve, reject, response) {
	  const validateStatus = response.config.validateStatus;
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(
	      new AxiosError$1(
	        'Request failed with status code ' + response.status,
	        [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][
	          Math.floor(response.status / 100) - 4
	        ],
	        response.config,
	        response.request,
	        response
	      )
	    );
	  }
	}

	function parseProtocol(url) {
	  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
	  return (match && match[1]) || '';
	}

	/**
	 * Calculate data maxRate
	 * @param {Number} [samplesCount= 10]
	 * @param {Number} [min= 1000]
	 * @returns {Function}
	 */
	function speedometer(samplesCount, min) {
	  samplesCount = samplesCount || 10;
	  const bytes = new Array(samplesCount);
	  const timestamps = new Array(samplesCount);
	  let head = 0;
	  let tail = 0;
	  let firstSampleTS;

	  min = min !== undefined ? min : 1000;

	  return function push(chunkLength) {
	    const now = Date.now();

	    const startedAt = timestamps[tail];

	    if (!firstSampleTS) {
	      firstSampleTS = now;
	    }

	    bytes[head] = chunkLength;
	    timestamps[head] = now;

	    let i = tail;
	    let bytesCount = 0;

	    while (i !== head) {
	      bytesCount += bytes[i++];
	      i = i % samplesCount;
	    }

	    head = (head + 1) % samplesCount;

	    if (head === tail) {
	      tail = (tail + 1) % samplesCount;
	    }

	    if (now - firstSampleTS < min) {
	      return;
	    }

	    const passed = startedAt && now - startedAt;

	    return passed ? Math.round((bytesCount * 1000) / passed) : undefined;
	  };
	}

	/**
	 * Throttle decorator
	 * @param {Function} fn
	 * @param {Number} freq
	 * @return {Function}
	 */
	function throttle(fn, freq) {
	  let timestamp = 0;
	  let threshold = 1000 / freq;
	  let lastArgs;
	  let timer;

	  const invoke = (args, now = Date.now()) => {
	    timestamp = now;
	    lastArgs = null;
	    if (timer) {
	      clearTimeout(timer);
	      timer = null;
	    }
	    fn(...args);
	  };

	  const throttled = (...args) => {
	    const now = Date.now();
	    const passed = now - timestamp;
	    if (passed >= threshold) {
	      invoke(args, now);
	    } else {
	      lastArgs = args;
	      if (!timer) {
	        timer = setTimeout(() => {
	          timer = null;
	          invoke(lastArgs);
	        }, threshold - passed);
	      }
	    }
	  };

	  const flush = () => lastArgs && invoke(lastArgs);

	  return [throttled, flush];
	}

	const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
	  let bytesNotified = 0;
	  const _speedometer = speedometer(50, 250);

	  return throttle((e) => {
	    const rawLoaded = e.loaded;
	    const total = e.lengthComputable ? e.total : undefined;
	    const loaded = total != null ? Math.min(rawLoaded, total) : rawLoaded;
	    const progressBytes = Math.max(0, loaded - bytesNotified);
	    const rate = _speedometer(progressBytes);

	    bytesNotified = Math.max(bytesNotified, loaded);

	    const data = {
	      loaded,
	      total,
	      progress: total ? loaded / total : undefined,
	      bytes: progressBytes,
	      rate: rate ? rate : undefined,
	      estimated: rate && total ? (total - loaded) / rate : undefined,
	      event: e,
	      lengthComputable: total != null,
	      [isDownloadStream ? 'download' : 'upload']: true,
	    };

	    listener(data);
	  }, freq);
	};

	const progressEventDecorator = (total, throttled) => {
	  const lengthComputable = total != null;

	  return [
	    (loaded) =>
	      throttled[0]({
	        lengthComputable,
	        total,
	        loaded,
	      }),
	    throttled[1],
	  ];
	};

	const asyncDecorator =
	  (fn) =>
	  (...args) =>
	    utils$1.asap(() => fn(...args));

	var isURLSameOrigin = platform.hasStandardBrowserEnv
	  ? ((origin, isMSIE) => (url) => {
	      url = new URL(url, platform.origin);

	      return (
	        origin.protocol === url.protocol &&
	        origin.host === url.host &&
	        (isMSIE || origin.port === url.port)
	      );
	    })(
	      new URL(platform.origin),
	      platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
	    )
	  : () => true;

	var cookies = platform.hasStandardBrowserEnv
	  ? // Standard browser envs support document.cookie
	    {
	      write(name, value, expires, path, domain, secure, sameSite) {
	        if (typeof document === 'undefined') return;

	        const cookie = [`${name}=${encodeURIComponent(value)}`];

	        if (utils$1.isNumber(expires)) {
	          cookie.push(`expires=${new Date(expires).toUTCString()}`);
	        }
	        if (utils$1.isString(path)) {
	          cookie.push(`path=${path}`);
	        }
	        if (utils$1.isString(domain)) {
	          cookie.push(`domain=${domain}`);
	        }
	        if (secure === true) {
	          cookie.push('secure');
	        }
	        if (utils$1.isString(sameSite)) {
	          cookie.push(`SameSite=${sameSite}`);
	        }

	        document.cookie = cookie.join('; ');
	      },

	      read(name) {
	        if (typeof document === 'undefined') return null;
	        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
	        return match ? decodeURIComponent(match[1]) : null;
	      },

	      remove(name) {
	        this.write(name, '', Date.now() - 86400000, '/');
	      },
	    }
	  : // Non-standard browser env (web workers, react-native) lack needed support.
	    {
	      write() {},
	      read() {
	        return null;
	      },
	      remove() {},
	    };

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 *
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  if (typeof url !== 'string') {
	    return false;
	  }

	  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	}

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 *
	 * @returns {string} The combined URL
	 */
	function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	}

	/**
	 * Creates a new URL by combining the baseURL with the requestedURL,
	 * only when the requestedURL is not already an absolute URL.
	 * If the requestURL is absolute, this function returns the requestedURL untouched.
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} requestedURL Absolute or relative URL to combine
	 *
	 * @returns {string} The combined full path
	 */
	function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
	  let isRelativeUrl = !isAbsoluteURL(requestedURL);
	  if (baseURL && (isRelativeUrl || allowAbsoluteUrls === false)) {
	    return combineURLs(baseURL, requestedURL);
	  }
	  return requestedURL;
	}

	const headersToObject = (thing) => (thing instanceof AxiosHeaders$1 ? { ...thing } : thing);

	/**
	 * Config-specific merge-function which creates a new config-object
	 * by merging two configuration objects together.
	 *
	 * @param {Object} config1
	 * @param {Object} config2
	 *
	 * @returns {Object} New object resulting from merging config2 to config1
	 */
	function mergeConfig(config1, config2) {
	  // eslint-disable-next-line no-param-reassign
	  config2 = config2 || {};

	  // Use a null-prototype object so that downstream reads such as `config.auth`
	  // or `config.baseURL` cannot inherit polluted values from Object.prototype
	  // (see GHSA-q8qp-cvcw-x6jj). `hasOwnProperty` is restored as a non-enumerable
	  // own slot to preserve ergonomics for user code that relies on it.
	  const config = Object.create(null);
	  Object.defineProperty(config, 'hasOwnProperty', {
	    value: Object.prototype.hasOwnProperty,
	    enumerable: false,
	    writable: true,
	    configurable: true,
	  });

	  function getMergedValue(target, source, prop, caseless) {
	    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
	      return utils$1.merge.call({ caseless }, target, source);
	    } else if (utils$1.isPlainObject(source)) {
	      return utils$1.merge({}, source);
	    } else if (utils$1.isArray(source)) {
	      return source.slice();
	    }
	    return source;
	  }

	  function mergeDeepProperties(a, b, prop, caseless) {
	    if (!utils$1.isUndefined(b)) {
	      return getMergedValue(a, b, prop, caseless);
	    } else if (!utils$1.isUndefined(a)) {
	      return getMergedValue(undefined, a, prop, caseless);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function valueFromConfig2(a, b) {
	    if (!utils$1.isUndefined(b)) {
	      return getMergedValue(undefined, b);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function defaultToConfig2(a, b) {
	    if (!utils$1.isUndefined(b)) {
	      return getMergedValue(undefined, b);
	    } else if (!utils$1.isUndefined(a)) {
	      return getMergedValue(undefined, a);
	    }
	  }

	  // eslint-disable-next-line consistent-return
	  function mergeDirectKeys(a, b, prop) {
	    if (utils$1.hasOwnProp(config2, prop)) {
	      return getMergedValue(a, b);
	    } else if (utils$1.hasOwnProp(config1, prop)) {
	      return getMergedValue(undefined, a);
	    }
	  }

	  const mergeMap = {
	    url: valueFromConfig2,
	    method: valueFromConfig2,
	    data: valueFromConfig2,
	    baseURL: defaultToConfig2,
	    transformRequest: defaultToConfig2,
	    transformResponse: defaultToConfig2,
	    paramsSerializer: defaultToConfig2,
	    timeout: defaultToConfig2,
	    timeoutMessage: defaultToConfig2,
	    withCredentials: defaultToConfig2,
	    withXSRFToken: defaultToConfig2,
	    adapter: defaultToConfig2,
	    responseType: defaultToConfig2,
	    xsrfCookieName: defaultToConfig2,
	    xsrfHeaderName: defaultToConfig2,
	    onUploadProgress: defaultToConfig2,
	    onDownloadProgress: defaultToConfig2,
	    decompress: defaultToConfig2,
	    maxContentLength: defaultToConfig2,
	    maxBodyLength: defaultToConfig2,
	    beforeRedirect: defaultToConfig2,
	    transport: defaultToConfig2,
	    httpAgent: defaultToConfig2,
	    httpsAgent: defaultToConfig2,
	    cancelToken: defaultToConfig2,
	    socketPath: defaultToConfig2,
	    allowedSocketPaths: defaultToConfig2,
	    responseEncoding: defaultToConfig2,
	    validateStatus: mergeDirectKeys,
	    headers: (a, b, prop) =>
	      mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true),
	  };

	  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
	    if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
	    const merge = utils$1.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
	    const a = utils$1.hasOwnProp(config1, prop) ? config1[prop] : undefined;
	    const b = utils$1.hasOwnProp(config2, prop) ? config2[prop] : undefined;
	    const configValue = merge(a, b, prop);
	    (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
	  });

	  return config;
	}

	var resolveConfig = (config) => {
	  const newConfig = mergeConfig({}, config);

	  // Read only own properties to prevent prototype pollution gadgets
	  // (e.g. Object.prototype.baseURL = 'https://evil.com'). See GHSA-q8qp-cvcw-x6jj.
	  const own = (key) => (utils$1.hasOwnProp(newConfig, key) ? newConfig[key] : undefined);

	  const data = own('data');
	  let withXSRFToken = own('withXSRFToken');
	  const xsrfHeaderName = own('xsrfHeaderName');
	  const xsrfCookieName = own('xsrfCookieName');
	  let headers = own('headers');
	  const auth = own('auth');
	  const baseURL = own('baseURL');
	  const allowAbsoluteUrls = own('allowAbsoluteUrls');
	  const url = own('url');

	  newConfig.headers = headers = AxiosHeaders$1.from(headers);

	  newConfig.url = buildURL(
	    buildFullPath(baseURL, url, allowAbsoluteUrls),
	    config.params,
	    config.paramsSerializer
	  );

	  // HTTP basic authentication
	  if (auth) {
	    headers.set(
	      'Authorization',
	      'Basic ' +
	        btoa(
	          (auth.username || '') +
	            ':' +
	            (auth.password ? unescape(encodeURIComponent(auth.password)) : '')
	        )
	    );
	  }

	  if (utils$1.isFormData(data)) {
	    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
	      headers.setContentType(undefined); // browser handles it
	    } else if (utils$1.isFunction(data.getHeaders)) {
	      // Node.js FormData (like form-data package)
	      const formHeaders = data.getHeaders();
	      // Only set safe headers to avoid overwriting security headers
	      const allowedHeaders = ['content-type', 'content-length'];
	      Object.entries(formHeaders).forEach(([key, val]) => {
	        if (allowedHeaders.includes(key.toLowerCase())) {
	          headers.set(key, val);
	        }
	      });
	    }
	  }

	  // Add xsrf header
	  // This is only done if running in a standard browser environment.
	  // Specifically not if we're in a web worker, or react-native.

	  if (platform.hasStandardBrowserEnv) {
	    if (utils$1.isFunction(withXSRFToken)) {
	      withXSRFToken = withXSRFToken(newConfig);
	    }

	    // Strict boolean check — prevents proto-pollution gadgets (e.g. Object.prototype.withXSRFToken = 1)
	    // and misconfigurations (e.g. "false") from short-circuiting the same-origin check and leaking
	    // the XSRF token cross-origin. See GHSA-xx6v-rp6x-q39c.
	    const shouldSendXSRF =
	      withXSRFToken === true ||
	      (withXSRFToken == null && isURLSameOrigin(newConfig.url));

	    if (shouldSendXSRF) {
	      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

	      if (xsrfValue) {
	        headers.set(xsrfHeaderName, xsrfValue);
	      }
	    }
	  }

	  return newConfig;
	};

	const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

	var xhrAdapter = isXHRAdapterSupported &&
	  function (config) {
	    return new Promise(function dispatchXhrRequest(resolve, reject) {
	      const _config = resolveConfig(config);
	      let requestData = _config.data;
	      const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
	      let { responseType, onUploadProgress, onDownloadProgress } = _config;
	      let onCanceled;
	      let uploadThrottled, downloadThrottled;
	      let flushUpload, flushDownload;

	      function done() {
	        flushUpload && flushUpload(); // flush events
	        flushDownload && flushDownload(); // flush events

	        _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

	        _config.signal && _config.signal.removeEventListener('abort', onCanceled);
	      }

	      let request = new XMLHttpRequest();

	      request.open(_config.method.toUpperCase(), _config.url, true);

	      // Set the request timeout in MS
	      request.timeout = _config.timeout;

	      function onloadend() {
	        if (!request) {
	          return;
	        }
	        // Prepare the response
	        const responseHeaders = AxiosHeaders$1.from(
	          'getAllResponseHeaders' in request && request.getAllResponseHeaders()
	        );
	        const responseData =
	          !responseType || responseType === 'text' || responseType === 'json'
	            ? request.responseText
	            : request.response;
	        const response = {
	          data: responseData,
	          status: request.status,
	          statusText: request.statusText,
	          headers: responseHeaders,
	          config,
	          request,
	        };

	        settle(
	          function _resolve(value) {
	            resolve(value);
	            done();
	          },
	          function _reject(err) {
	            reject(err);
	            done();
	          },
	          response
	        );

	        // Clean up request
	        request = null;
	      }

	      if ('onloadend' in request) {
	        // Use onloadend if available
	        request.onloadend = onloadend;
	      } else {
	        // Listen for ready state to emulate onloadend
	        request.onreadystatechange = function handleLoad() {
	          if (!request || request.readyState !== 4) {
	            return;
	          }

	          // The request errored out and we didn't get a response, this will be
	          // handled by onerror instead
	          // With one exception: request that using file: protocol, most browsers
	          // will return status as 0 even though it's a successful request
	          if (
	            request.status === 0 &&
	            !(request.responseURL && request.responseURL.indexOf('file:') === 0)
	          ) {
	            return;
	          }
	          // readystate handler is calling before onerror or ontimeout handlers,
	          // so we should call onloadend on the next 'tick'
	          setTimeout(onloadend);
	        };
	      }

	      // Handle browser request cancellation (as opposed to a manual cancellation)
	      request.onabort = function handleAbort() {
	        if (!request) {
	          return;
	        }

	        reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

	        // Clean up request
	        request = null;
	      };

	      // Handle low level network errors
	      request.onerror = function handleError(event) {
	        // Browsers deliver a ProgressEvent in XHR onerror
	        // (message may be empty; when present, surface it)
	        // See https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/error_event
	        const msg = event && event.message ? event.message : 'Network Error';
	        const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
	        // attach the underlying event for consumers who want details
	        err.event = event || null;
	        reject(err);
	        request = null;
	      };

	      // Handle timeout
	      request.ontimeout = function handleTimeout() {
	        let timeoutErrorMessage = _config.timeout
	          ? 'timeout of ' + _config.timeout + 'ms exceeded'
	          : 'timeout exceeded';
	        const transitional = _config.transitional || transitionalDefaults;
	        if (_config.timeoutErrorMessage) {
	          timeoutErrorMessage = _config.timeoutErrorMessage;
	        }
	        reject(
	          new AxiosError$1(
	            timeoutErrorMessage,
	            transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
	            config,
	            request
	          )
	        );

	        // Clean up request
	        request = null;
	      };

	      // Remove Content-Type if data is undefined
	      requestData === undefined && requestHeaders.setContentType(null);

	      // Add headers to the request
	      if ('setRequestHeader' in request) {
	        utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
	          request.setRequestHeader(key, val);
	        });
	      }

	      // Add withCredentials to request if needed
	      if (!utils$1.isUndefined(_config.withCredentials)) {
	        request.withCredentials = !!_config.withCredentials;
	      }

	      // Add responseType to request if needed
	      if (responseType && responseType !== 'json') {
	        request.responseType = _config.responseType;
	      }

	      // Handle progress if needed
	      if (onDownloadProgress) {
	        [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
	        request.addEventListener('progress', downloadThrottled);
	      }

	      // Not all browsers support upload events
	      if (onUploadProgress && request.upload) {
	        [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);

	        request.upload.addEventListener('progress', uploadThrottled);

	        request.upload.addEventListener('loadend', flushUpload);
	      }

	      if (_config.cancelToken || _config.signal) {
	        // Handle cancellation
	        // eslint-disable-next-line func-names
	        onCanceled = (cancel) => {
	          if (!request) {
	            return;
	          }
	          reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
	          request.abort();
	          request = null;
	        };

	        _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
	        if (_config.signal) {
	          _config.signal.aborted
	            ? onCanceled()
	            : _config.signal.addEventListener('abort', onCanceled);
	        }
	      }

	      const protocol = parseProtocol(_config.url);

	      if (protocol && platform.protocols.indexOf(protocol) === -1) {
	        reject(
	          new AxiosError$1(
	            'Unsupported protocol ' + protocol + ':',
	            AxiosError$1.ERR_BAD_REQUEST,
	            config
	          )
	        );
	        return;
	      }

	      // Send the request
	      request.send(requestData || null);
	    });
	  };

	const composeSignals = (signals, timeout) => {
	  const { length } = (signals = signals ? signals.filter(Boolean) : []);

	  if (timeout || length) {
	    let controller = new AbortController();

	    let aborted;

	    const onabort = function (reason) {
	      if (!aborted) {
	        aborted = true;
	        unsubscribe();
	        const err = reason instanceof Error ? reason : this.reason;
	        controller.abort(
	          err instanceof AxiosError$1
	            ? err
	            : new CanceledError$1(err instanceof Error ? err.message : err)
	        );
	      }
	    };

	    let timer =
	      timeout &&
	      setTimeout(() => {
	        timer = null;
	        onabort(new AxiosError$1(`timeout of ${timeout}ms exceeded`, AxiosError$1.ETIMEDOUT));
	      }, timeout);

	    const unsubscribe = () => {
	      if (signals) {
	        timer && clearTimeout(timer);
	        timer = null;
	        signals.forEach((signal) => {
	          signal.unsubscribe
	            ? signal.unsubscribe(onabort)
	            : signal.removeEventListener('abort', onabort);
	        });
	        signals = null;
	      }
	    };

	    signals.forEach((signal) => signal.addEventListener('abort', onabort));

	    const { signal } = controller;

	    signal.unsubscribe = () => utils$1.asap(unsubscribe);

	    return signal;
	  }
	};

	var composeSignals$1 = composeSignals;

	const streamChunk = function* (chunk, chunkSize) {
	  let len = chunk.byteLength;

	  if (!chunkSize || len < chunkSize) {
	    yield chunk;
	    return;
	  }

	  let pos = 0;
	  let end;

	  while (pos < len) {
	    end = pos + chunkSize;
	    yield chunk.slice(pos, end);
	    pos = end;
	  }
	};

	const readBytes = async function* (iterable, chunkSize) {
	  for await (const chunk of readStream(iterable)) {
	    yield* streamChunk(chunk, chunkSize);
	  }
	};

	const readStream = async function* (stream) {
	  if (stream[Symbol.asyncIterator]) {
	    yield* stream;
	    return;
	  }

	  const reader = stream.getReader();
	  try {
	    for (;;) {
	      const { done, value } = await reader.read();
	      if (done) {
	        break;
	      }
	      yield value;
	    }
	  } finally {
	    await reader.cancel();
	  }
	};

	const trackStream = (stream, chunkSize, onProgress, onFinish) => {
	  const iterator = readBytes(stream, chunkSize);

	  let bytes = 0;
	  let done;
	  let _onFinish = (e) => {
	    if (!done) {
	      done = true;
	      onFinish && onFinish(e);
	    }
	  };

	  return new ReadableStream(
	    {
	      async pull(controller) {
	        try {
	          const { done, value } = await iterator.next();

	          if (done) {
	            _onFinish();
	            controller.close();
	            return;
	          }

	          let len = value.byteLength;
	          if (onProgress) {
	            let loadedBytes = (bytes += len);
	            onProgress(loadedBytes);
	          }
	          controller.enqueue(new Uint8Array(value));
	        } catch (err) {
	          _onFinish(err);
	          throw err;
	        }
	      },
	      cancel(reason) {
	        _onFinish(reason);
	        return iterator.return();
	      },
	    },
	    {
	      highWaterMark: 2,
	    }
	  );
	};

	const DEFAULT_CHUNK_SIZE = 64 * 1024;

	const { isFunction } = utils$1;

	const globalFetchAPI = (({ Request, Response }) => ({
	  Request,
	  Response,
	}))(utils$1.global);

	const { ReadableStream: ReadableStream$1, TextEncoder } = utils$1.global;

	const test = (fn, ...args) => {
	  try {
	    return !!fn(...args);
	  } catch (e) {
	    return false;
	  }
	};

	const factory = (env) => {
	  env = utils$1.merge.call(
	    {
	      skipUndefined: true,
	    },
	    globalFetchAPI,
	    env
	  );

	  const { fetch: envFetch, Request, Response } = env;
	  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === 'function';
	  const isRequestSupported = isFunction(Request);
	  const isResponseSupported = isFunction(Response);

	  if (!isFetchSupported) {
	    return false;
	  }

	  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);

	  const encodeText =
	    isFetchSupported &&
	    (typeof TextEncoder === 'function'
	      ? (
	          (encoder) => (str) =>
	            encoder.encode(str)
	        )(new TextEncoder())
	      : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));

	  const supportsRequestStream =
	    isRequestSupported &&
	    isReadableStreamSupported &&
	    test(() => {
	      let duplexAccessed = false;

	      const request = new Request(platform.origin, {
	        body: new ReadableStream$1(),
	        method: 'POST',
	        get duplex() {
	          duplexAccessed = true;
	          return 'half';
	        },
	      });

	      const hasContentType = request.headers.has('Content-Type');

	      if (request.body != null) {
	        request.body.cancel();
	      }

	      return duplexAccessed && !hasContentType;
	    });

	  const supportsResponseStream =
	    isResponseSupported &&
	    isReadableStreamSupported &&
	    test(() => utils$1.isReadableStream(new Response('').body));

	  const resolvers = {
	    stream: supportsResponseStream && ((res) => res.body),
	  };

	  isFetchSupported &&
	    (() => {
	      ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach((type) => {
	        !resolvers[type] &&
	          (resolvers[type] = (res, config) => {
	            let method = res && res[type];

	            if (method) {
	              return method.call(res);
	            }

	            throw new AxiosError$1(
	              `Response type '${type}' is not supported`,
	              AxiosError$1.ERR_NOT_SUPPORT,
	              config
	            );
	          });
	      });
	    })();

	  const getBodyLength = async (body) => {
	    if (body == null) {
	      return 0;
	    }

	    if (utils$1.isBlob(body)) {
	      return body.size;
	    }

	    if (utils$1.isSpecCompliantForm(body)) {
	      const _request = new Request(platform.origin, {
	        method: 'POST',
	        body,
	      });
	      return (await _request.arrayBuffer()).byteLength;
	    }

	    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
	      return body.byteLength;
	    }

	    if (utils$1.isURLSearchParams(body)) {
	      body = body + '';
	    }

	    if (utils$1.isString(body)) {
	      return (await encodeText(body)).byteLength;
	    }
	  };

	  const resolveBodyLength = async (headers, body) => {
	    const length = utils$1.toFiniteNumber(headers.getContentLength());

	    return length == null ? getBodyLength(body) : length;
	  };

	  return async (config) => {
	    let {
	      url,
	      method,
	      data,
	      signal,
	      cancelToken,
	      timeout,
	      onDownloadProgress,
	      onUploadProgress,
	      responseType,
	      headers,
	      withCredentials = 'same-origin',
	      fetchOptions,
	    } = resolveConfig(config);

	    let _fetch = envFetch || fetch;

	    responseType = responseType ? (responseType + '').toLowerCase() : 'text';

	    let composedSignal = composeSignals$1(
	      [signal, cancelToken && cancelToken.toAbortSignal()],
	      timeout
	    );

	    let request = null;

	    const unsubscribe =
	      composedSignal &&
	      composedSignal.unsubscribe &&
	      (() => {
	        composedSignal.unsubscribe();
	      });

	    let requestContentLength;

	    try {
	      if (
	        onUploadProgress &&
	        supportsRequestStream &&
	        method !== 'get' &&
	        method !== 'head' &&
	        (requestContentLength = await resolveBodyLength(headers, data)) !== 0
	      ) {
	        let _request = new Request(url, {
	          method: 'POST',
	          body: data,
	          duplex: 'half',
	        });

	        let contentTypeHeader;

	        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
	          headers.setContentType(contentTypeHeader);
	        }

	        if (_request.body) {
	          const [onProgress, flush] = progressEventDecorator(
	            requestContentLength,
	            progressEventReducer(asyncDecorator(onUploadProgress))
	          );

	          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
	        }
	      }

	      if (!utils$1.isString(withCredentials)) {
	        withCredentials = withCredentials ? 'include' : 'omit';
	      }

	      // Cloudflare Workers throws when credentials are defined
	      // see https://github.com/cloudflare/workerd/issues/902
	      const isCredentialsSupported = isRequestSupported && 'credentials' in Request.prototype;

	      // If data is FormData and Content-Type is multipart/form-data without boundary,
	      // delete it so fetch can set it correctly with the boundary
	      if (utils$1.isFormData(data)) {
	        const contentType = headers.getContentType();
	        if (
	          contentType &&
	          /^multipart\/form-data/i.test(contentType) &&
	          !/boundary=/i.test(contentType)
	        ) {
	          headers.delete('content-type');
	        }
	      }

	      const resolvedOptions = {
	        ...fetchOptions,
	        signal: composedSignal,
	        method: method.toUpperCase(),
	        headers: headers.normalize().toJSON(),
	        body: data,
	        duplex: 'half',
	        credentials: isCredentialsSupported ? withCredentials : undefined,
	      };

	      request = isRequestSupported && new Request(url, resolvedOptions);

	      let response = await (isRequestSupported
	        ? _fetch(request, fetchOptions)
	        : _fetch(url, resolvedOptions));

	      const isStreamResponse =
	        supportsResponseStream && (responseType === 'stream' || responseType === 'response');

	      if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
	        const options = {};

	        ['status', 'statusText', 'headers'].forEach((prop) => {
	          options[prop] = response[prop];
	        });

	        const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

	        const [onProgress, flush] =
	          (onDownloadProgress &&
	            progressEventDecorator(
	              responseContentLength,
	              progressEventReducer(asyncDecorator(onDownloadProgress), true)
	            )) ||
	          [];

	        response = new Response(
	          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
	            flush && flush();
	            unsubscribe && unsubscribe();
	          }),
	          options
	        );
	      }

	      responseType = responseType || 'text';

	      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](
	        response,
	        config
	      );

	      !isStreamResponse && unsubscribe && unsubscribe();

	      return await new Promise((resolve, reject) => {
	        settle(resolve, reject, {
	          data: responseData,
	          headers: AxiosHeaders$1.from(response.headers),
	          status: response.status,
	          statusText: response.statusText,
	          config,
	          request,
	        });
	      });
	    } catch (err) {
	      unsubscribe && unsubscribe();

	      if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
	        throw Object.assign(
	          new AxiosError$1(
	            'Network Error',
	            AxiosError$1.ERR_NETWORK,
	            config,
	            request,
	            err && err.response
	          ),
	          {
	            cause: err.cause || err,
	          }
	        );
	      }

	      throw AxiosError$1.from(err, err && err.code, config, request, err && err.response);
	    }
	  };
	};

	const seedCache = new Map();

	const getFetch$1 = (config) => {
	  let env = (config && config.env) || {};
	  const { fetch, Request, Response } = env;
	  const seeds = [Request, Response, fetch];

	  let len = seeds.length,
	    i = len,
	    seed,
	    target,
	    map = seedCache;

	  while (i--) {
	    seed = seeds[i];
	    target = map.get(seed);

	    target === undefined && map.set(seed, (target = i ? new Map() : factory(env)));

	    map = target;
	  }

	  return target;
	};

	getFetch$1();

	/**
	 * Known adapters mapping.
	 * Provides environment-specific adapters for Axios:
	 * - `http` for Node.js
	 * - `xhr` for browsers
	 * - `fetch` for fetch API-based requests
	 *
	 * @type {Object<string, Function|Object>}
	 */
	const knownAdapters = {
	  http: httpAdapter,
	  xhr: xhrAdapter,
	  fetch: {
	    get: getFetch$1,
	  },
	};

	// Assign adapter names for easier debugging and identification
	utils$1.forEach(knownAdapters, (fn, value) => {
	  if (fn) {
	    try {
	      Object.defineProperty(fn, 'name', { value });
	    } catch (e) {
	      // eslint-disable-next-line no-empty
	    }
	    Object.defineProperty(fn, 'adapterName', { value });
	  }
	});

	/**
	 * Render a rejection reason string for unknown or unsupported adapters
	 *
	 * @param {string} reason
	 * @returns {string}
	 */
	const renderReason = (reason) => `- ${reason}`;

	/**
	 * Check if the adapter is resolved (function, null, or false)
	 *
	 * @param {Function|null|false} adapter
	 * @returns {boolean}
	 */
	const isResolvedHandle = (adapter) =>
	  utils$1.isFunction(adapter) || adapter === null || adapter === false;

	/**
	 * Get the first suitable adapter from the provided list.
	 * Tries each adapter in order until a supported one is found.
	 * Throws an AxiosError if no adapter is suitable.
	 *
	 * @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
	 * @param {Object} config - Axios request configuration
	 * @throws {AxiosError} If no suitable adapter is available
	 * @returns {Function} The resolved adapter function
	 */
	function getAdapter(adapters, config) {
	  adapters = utils$1.isArray(adapters) ? adapters : [adapters];

	  const { length } = adapters;
	  let nameOrAdapter;
	  let adapter;

	  const rejectedReasons = {};

	  for (let i = 0; i < length; i++) {
	    nameOrAdapter = adapters[i];
	    let id;

	    adapter = nameOrAdapter;

	    if (!isResolvedHandle(nameOrAdapter)) {
	      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

	      if (adapter === undefined) {
	        throw new AxiosError$1(`Unknown adapter '${id}'`);
	      }
	    }

	    if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
	      break;
	    }

	    rejectedReasons[id || '#' + i] = adapter;
	  }

	  if (!adapter) {
	    const reasons = Object.entries(rejectedReasons).map(
	      ([id, state]) =>
	        `adapter ${id} ` +
	        (state === false ? 'is not supported by the environment' : 'is not available in the build')
	    );

	    let s = length
	      ? reasons.length > 1
	        ? 'since :\n' + reasons.map(renderReason).join('\n')
	        : ' ' + renderReason(reasons[0])
	      : 'as no adapter specified';

	    throw new AxiosError$1(
	      `There is no suitable adapter to dispatch the request ` + s,
	      'ERR_NOT_SUPPORT'
	    );
	  }

	  return adapter;
	}

	/**
	 * Exports Axios adapters and utility to resolve an adapter
	 */
	var adapters = {
	  /**
	   * Resolve an adapter from a list of adapter names or functions.
	   * @type {Function}
	   */
	  getAdapter,

	  /**
	   * Exposes all known adapters
	   * @type {Object<string, Function|Object>}
	   */
	  adapters: knownAdapters,
	};

	/**
	 * Throws a `CanceledError` if cancellation has been requested.
	 *
	 * @param {Object} config The config that is to be used for the request
	 *
	 * @returns {void}
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }

	  if (config.signal && config.signal.aborted) {
	    throw new CanceledError$1(null, config);
	  }
	}

	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 *
	 * @returns {Promise} The Promise to be fulfilled
	 */
	function dispatchRequest(config) {
	  throwIfCancellationRequested(config);

	  config.headers = AxiosHeaders$1.from(config.headers);

	  // Transform request data
	  config.data = transformData.call(config, config.transformRequest);

	  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
	    config.headers.setContentType('application/x-www-form-urlencoded', false);
	  }

	  const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter, config);

	  return adapter(config).then(
	    function onAdapterResolution(response) {
	      throwIfCancellationRequested(config);

	      // Transform response data
	      response.data = transformData.call(config, config.transformResponse, response);

	      response.headers = AxiosHeaders$1.from(response.headers);

	      return response;
	    },
	    function onAdapterRejection(reason) {
	      if (!isCancel(reason)) {
	        throwIfCancellationRequested(config);

	        // Transform response data
	        if (reason && reason.response) {
	          reason.response.data = transformData.call(
	            config,
	            config.transformResponse,
	            reason.response
	          );
	          reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
	        }
	      }

	      return Promise.reject(reason);
	    }
	  );
	}

	const VERSION = "1.15.2";

	const validators$1 = {};

	// eslint-disable-next-line func-names
	['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
	  validators$1[type] = function validator(thing) {
	    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
	  };
	});

	const deprecatedWarnings = {};

	/**
	 * Transitional option validator
	 *
	 * @param {function|boolean?} validator - set to false if the transitional option has been removed
	 * @param {string?} version - deprecated version / removed since version
	 * @param {string?} message - some message with additional info
	 *
	 * @returns {function}
	 */
	validators$1.transitional = function transitional(validator, version, message) {
	  function formatMessage(opt, desc) {
	    return (
	      '[Axios v' +
	      VERSION +
	      "] Transitional option '" +
	      opt +
	      "'" +
	      desc +
	      (message ? '. ' + message : '')
	    );
	  }

	  // eslint-disable-next-line func-names
	  return (value, opt, opts) => {
	    if (validator === false) {
	      throw new AxiosError$1(
	        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
	        AxiosError$1.ERR_DEPRECATED
	      );
	    }

	    if (version && !deprecatedWarnings[opt]) {
	      deprecatedWarnings[opt] = true;
	      // eslint-disable-next-line no-console
	      console.warn(
	        formatMessage(
	          opt,
	          ' has been deprecated since v' + version + ' and will be removed in the near future'
	        )
	      );
	    }

	    return validator ? validator(value, opt, opts) : true;
	  };
	};

	validators$1.spelling = function spelling(correctSpelling) {
	  return (value, opt) => {
	    // eslint-disable-next-line no-console
	    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
	    return true;
	  };
	};

	/**
	 * Assert object's properties type
	 *
	 * @param {object} options
	 * @param {object} schema
	 * @param {boolean?} allowUnknown
	 *
	 * @returns {object}
	 */

	function assertOptions(options, schema, allowUnknown) {
	  if (typeof options !== 'object') {
	    throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
	  }
	  const keys = Object.keys(options);
	  let i = keys.length;
	  while (i-- > 0) {
	    const opt = keys[i];
	    // Use hasOwnProperty so a polluted Object.prototype.<opt> cannot supply
	    // a non-function validator and cause a TypeError. See GHSA-q8qp-cvcw-x6jj.
	    const validator = Object.prototype.hasOwnProperty.call(schema, opt) ? schema[opt] : undefined;
	    if (validator) {
	      const value = options[opt];
	      const result = value === undefined || validator(value, opt, options);
	      if (result !== true) {
	        throw new AxiosError$1(
	          'option ' + opt + ' must be ' + result,
	          AxiosError$1.ERR_BAD_OPTION_VALUE
	        );
	      }
	      continue;
	    }
	    if (allowUnknown !== true) {
	      throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
	    }
	  }
	}

	var validator = {
	  assertOptions,
	  validators: validators$1,
	};

	const validators = validator.validators;

	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 *
	 * @return {Axios} A new instance of Axios
	 */
	class Axios {
	  constructor(instanceConfig) {
	    this.defaults = instanceConfig || {};
	    this.interceptors = {
	      request: new InterceptorManager$1(),
	      response: new InterceptorManager$1(),
	    };
	  }

	  /**
	   * Dispatch a request
	   *
	   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
	   * @param {?Object} config
	   *
	   * @returns {Promise} The Promise to be fulfilled
	   */
	  async request(configOrUrl, config) {
	    try {
	      return await this._request(configOrUrl, config);
	    } catch (err) {
	      if (err instanceof Error) {
	        let dummy = {};

	        Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

	        // slice off the Error: ... line
	        const stack = (() => {
	          if (!dummy.stack) {
	            return '';
	          }

	          const firstNewlineIndex = dummy.stack.indexOf('\n');

	          return firstNewlineIndex === -1 ? '' : dummy.stack.slice(firstNewlineIndex + 1);
	        })();
	        try {
	          if (!err.stack) {
	            err.stack = stack;
	            // match without the 2 top stack lines
	          } else if (stack) {
	            const firstNewlineIndex = stack.indexOf('\n');
	            const secondNewlineIndex =
	              firstNewlineIndex === -1 ? -1 : stack.indexOf('\n', firstNewlineIndex + 1);
	            const stackWithoutTwoTopLines =
	              secondNewlineIndex === -1 ? '' : stack.slice(secondNewlineIndex + 1);

	            if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
	              err.stack += '\n' + stack;
	            }
	          }
	        } catch (e) {
	          // ignore the case where "stack" is an un-writable property
	        }
	      }

	      throw err;
	    }
	  }

	  _request(configOrUrl, config) {
	    /*eslint no-param-reassign:0*/
	    // Allow for axios('example/url'[, config]) a la fetch API
	    if (typeof configOrUrl === 'string') {
	      config = config || {};
	      config.url = configOrUrl;
	    } else {
	      config = configOrUrl || {};
	    }

	    config = mergeConfig(this.defaults, config);

	    const { transitional, paramsSerializer, headers } = config;

	    if (transitional !== undefined) {
	      validator.assertOptions(
	        transitional,
	        {
	          silentJSONParsing: validators.transitional(validators.boolean),
	          forcedJSONParsing: validators.transitional(validators.boolean),
	          clarifyTimeoutError: validators.transitional(validators.boolean),
	          legacyInterceptorReqResOrdering: validators.transitional(validators.boolean),
	        },
	        false
	      );
	    }

	    if (paramsSerializer != null) {
	      if (utils$1.isFunction(paramsSerializer)) {
	        config.paramsSerializer = {
	          serialize: paramsSerializer,
	        };
	      } else {
	        validator.assertOptions(
	          paramsSerializer,
	          {
	            encode: validators.function,
	            serialize: validators.function,
	          },
	          true
	        );
	      }
	    }

	    // Set config.allowAbsoluteUrls
	    if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
	      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
	    } else {
	      config.allowAbsoluteUrls = true;
	    }

	    validator.assertOptions(
	      config,
	      {
	        baseUrl: validators.spelling('baseURL'),
	        withXsrfToken: validators.spelling('withXSRFToken'),
	      },
	      true
	    );

	    // Set config.method
	    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

	    // Flatten headers
	    let contextHeaders = headers && utils$1.merge(headers.common, headers[config.method]);

	    headers &&
	      utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], (method) => {
	        delete headers[method];
	      });

	    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

	    // filter out skipped interceptors
	    const requestInterceptorChain = [];
	    let synchronousRequestInterceptors = true;
	    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
	        return;
	      }

	      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

	      const transitional = config.transitional || transitionalDefaults;
	      const legacyInterceptorReqResOrdering =
	        transitional && transitional.legacyInterceptorReqResOrdering;

	      if (legacyInterceptorReqResOrdering) {
	        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
	      } else {
	        requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	      }
	    });

	    const responseInterceptorChain = [];
	    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	    });

	    let promise;
	    let i = 0;
	    let len;

	    if (!synchronousRequestInterceptors) {
	      const chain = [dispatchRequest.bind(this), undefined];
	      chain.unshift(...requestInterceptorChain);
	      chain.push(...responseInterceptorChain);
	      len = chain.length;

	      promise = Promise.resolve(config);

	      while (i < len) {
	        promise = promise.then(chain[i++], chain[i++]);
	      }

	      return promise;
	    }

	    len = requestInterceptorChain.length;

	    let newConfig = config;

	    while (i < len) {
	      const onFulfilled = requestInterceptorChain[i++];
	      const onRejected = requestInterceptorChain[i++];
	      try {
	        newConfig = onFulfilled(newConfig);
	      } catch (error) {
	        onRejected.call(this, error);
	        break;
	      }
	    }

	    try {
	      promise = dispatchRequest.call(this, newConfig);
	    } catch (error) {
	      return Promise.reject(error);
	    }

	    i = 0;
	    len = responseInterceptorChain.length;

	    while (i < len) {
	      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
	    }

	    return promise;
	  }

	  getUri(config) {
	    config = mergeConfig(this.defaults, config);
	    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
	    return buildURL(fullPath, config.params, config.paramsSerializer);
	  }
	}

	// Provide aliases for supported request methods
	utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function (url, config) {
	    return this.request(
	      mergeConfig(config || {}, {
	        method,
	        url,
	        data: (config || {}).data,
	      })
	    );
	  };
	});

	utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  function generateHTTPMethod(isForm) {
	    return function httpMethod(url, data, config) {
	      return this.request(
	        mergeConfig(config || {}, {
	          method,
	          headers: isForm
	            ? {
	                'Content-Type': 'multipart/form-data',
	              }
	            : {},
	          url,
	          data,
	        })
	      );
	    };
	  }

	  Axios.prototype[method] = generateHTTPMethod();

	  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
	});

	var Axios$1 = Axios;

	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @param {Function} executor The executor function.
	 *
	 * @returns {CancelToken}
	 */
	class CancelToken {
	  constructor(executor) {
	    if (typeof executor !== 'function') {
	      throw new TypeError('executor must be a function.');
	    }

	    let resolvePromise;

	    this.promise = new Promise(function promiseExecutor(resolve) {
	      resolvePromise = resolve;
	    });

	    const token = this;

	    // eslint-disable-next-line func-names
	    this.promise.then((cancel) => {
	      if (!token._listeners) return;

	      let i = token._listeners.length;

	      while (i-- > 0) {
	        token._listeners[i](cancel);
	      }
	      token._listeners = null;
	    });

	    // eslint-disable-next-line func-names
	    this.promise.then = (onfulfilled) => {
	      let _resolve;
	      // eslint-disable-next-line func-names
	      const promise = new Promise((resolve) => {
	        token.subscribe(resolve);
	        _resolve = resolve;
	      }).then(onfulfilled);

	      promise.cancel = function reject() {
	        token.unsubscribe(_resolve);
	      };

	      return promise;
	    };

	    executor(function cancel(message, config, request) {
	      if (token.reason) {
	        // Cancellation has already been requested
	        return;
	      }

	      token.reason = new CanceledError$1(message, config, request);
	      resolvePromise(token.reason);
	    });
	  }

	  /**
	   * Throws a `CanceledError` if cancellation has been requested.
	   */
	  throwIfRequested() {
	    if (this.reason) {
	      throw this.reason;
	    }
	  }

	  /**
	   * Subscribe to the cancel signal
	   */

	  subscribe(listener) {
	    if (this.reason) {
	      listener(this.reason);
	      return;
	    }

	    if (this._listeners) {
	      this._listeners.push(listener);
	    } else {
	      this._listeners = [listener];
	    }
	  }

	  /**
	   * Unsubscribe from the cancel signal
	   */

	  unsubscribe(listener) {
	    if (!this._listeners) {
	      return;
	    }
	    const index = this._listeners.indexOf(listener);
	    if (index !== -1) {
	      this._listeners.splice(index, 1);
	    }
	  }

	  toAbortSignal() {
	    const controller = new AbortController();

	    const abort = (err) => {
	      controller.abort(err);
	    };

	    this.subscribe(abort);

	    controller.signal.unsubscribe = () => this.unsubscribe(abort);

	    return controller.signal;
	  }

	  /**
	   * Returns an object that contains a new `CancelToken` and a function that, when called,
	   * cancels the `CancelToken`.
	   */
	  static source() {
	    let cancel;
	    const token = new CancelToken(function executor(c) {
	      cancel = c;
	    });
	    return {
	      token,
	      cancel,
	    };
	  }
	}

	var CancelToken$1 = CancelToken;

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  const args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 *
	 * @returns {Function}
	 */
	function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	}

	/**
	 * Determines whether the payload is an error thrown by Axios
	 *
	 * @param {*} payload The value to test
	 *
	 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
	 */
	function isAxiosError(payload) {
	  return utils$1.isObject(payload) && payload.isAxiosError === true;
	}

	const HttpStatusCode = {
	  Continue: 100,
	  SwitchingProtocols: 101,
	  Processing: 102,
	  EarlyHints: 103,
	  Ok: 200,
	  Created: 201,
	  Accepted: 202,
	  NonAuthoritativeInformation: 203,
	  NoContent: 204,
	  ResetContent: 205,
	  PartialContent: 206,
	  MultiStatus: 207,
	  AlreadyReported: 208,
	  ImUsed: 226,
	  MultipleChoices: 300,
	  MovedPermanently: 301,
	  Found: 302,
	  SeeOther: 303,
	  NotModified: 304,
	  UseProxy: 305,
	  Unused: 306,
	  TemporaryRedirect: 307,
	  PermanentRedirect: 308,
	  BadRequest: 400,
	  Unauthorized: 401,
	  PaymentRequired: 402,
	  Forbidden: 403,
	  NotFound: 404,
	  MethodNotAllowed: 405,
	  NotAcceptable: 406,
	  ProxyAuthenticationRequired: 407,
	  RequestTimeout: 408,
	  Conflict: 409,
	  Gone: 410,
	  LengthRequired: 411,
	  PreconditionFailed: 412,
	  PayloadTooLarge: 413,
	  UriTooLong: 414,
	  UnsupportedMediaType: 415,
	  RangeNotSatisfiable: 416,
	  ExpectationFailed: 417,
	  ImATeapot: 418,
	  MisdirectedRequest: 421,
	  UnprocessableEntity: 422,
	  Locked: 423,
	  FailedDependency: 424,
	  TooEarly: 425,
	  UpgradeRequired: 426,
	  PreconditionRequired: 428,
	  TooManyRequests: 429,
	  RequestHeaderFieldsTooLarge: 431,
	  UnavailableForLegalReasons: 451,
	  InternalServerError: 500,
	  NotImplemented: 501,
	  BadGateway: 502,
	  ServiceUnavailable: 503,
	  GatewayTimeout: 504,
	  HttpVersionNotSupported: 505,
	  VariantAlsoNegotiates: 506,
	  InsufficientStorage: 507,
	  LoopDetected: 508,
	  NotExtended: 510,
	  NetworkAuthenticationRequired: 511,
	  WebServerIsDown: 521,
	  ConnectionTimedOut: 522,
	  OriginIsUnreachable: 523,
	  TimeoutOccurred: 524,
	  SslHandshakeFailed: 525,
	  InvalidSslCertificate: 526,
	};

	Object.entries(HttpStatusCode).forEach(([key, value]) => {
	  HttpStatusCode[value] = key;
	});

	var HttpStatusCode$1 = HttpStatusCode;

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 *
	 * @returns {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  const context = new Axios$1(defaultConfig);
	  const instance = bind(Axios$1.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });

	  // Copy context to instance
	  utils$1.extend(instance, context, null, { allOwnKeys: true });

	  // Factory for creating new instances
	  instance.create = function create(instanceConfig) {
	    return createInstance(mergeConfig(defaultConfig, instanceConfig));
	  };

	  return instance;
	}

	// Create the default instance to be exported
	const axios = createInstance(defaults$1);

	// Expose Axios class to allow class inheritance
	axios.Axios = Axios$1;

	// Expose Cancel & CancelToken
	axios.CanceledError = CanceledError$1;
	axios.CancelToken = CancelToken$1;
	axios.isCancel = isCancel;
	axios.VERSION = VERSION;
	axios.toFormData = toFormData;

	// Expose AxiosError class
	axios.AxiosError = AxiosError$1;

	// alias for CanceledError for backward compatibility
	axios.Cancel = axios.CanceledError;

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};

	axios.spread = spread;

	// Expose isAxiosError
	axios.isAxiosError = isAxiosError;

	// Expose mergeConfig
	axios.mergeConfig = mergeConfig;

	axios.AxiosHeaders = AxiosHeaders$1;

	axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

	axios.getAdapter = adapters.getAdapter;

	axios.HttpStatusCode = HttpStatusCode$1;

	axios.default = axios;

	// this module should only have a default export
	var axios$1 = axios;

	/* src\components\example\Example.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$a, console: console_1 } = globals;

	function create_fragment$z(ctx) {
		let swiper;
		let t;
		let tmdb;
		let current;

		swiper = new SWIPER({
				props: { promise: /*promise*/ ctx[0] },
				$$inline: true
			});

		tmdb = new TMDB({
				props: { promise: /*promise*/ ctx[0] },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(swiper.$$.fragment);
				t = space();
				create_component(tmdb.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error_1$a("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(swiper, target, anchor);
				insert_dev(target, t, anchor);
				mount_component(tmdb, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(swiper.$$.fragment, local);
				transition_in(tmdb.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiper.$$.fragment, local);
				transition_out(tmdb.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}

				destroy_component(swiper, detaching);
				destroy_component(tmdb, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$z.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$z($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Example', slots, []);

		const options = {
			method: 'GET',
			url: 'https://api.themoviedb.org/3/movie/now_playing',
			params: { language: 'ko', page: '1' },
			headers: {
				accept: 'application/json',
				Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
			}
		};

		let movies = [];

		const getMovies = async () => {
			try {
				const res = await axios$1.request(options);
				movies = await res.data.results;
				console.log(movies);
				return res;
			} catch(error) {
				throw new Error(error);
			}
		};

		let promise = getMovies();
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Example> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			SWIPER,
			TMDB,
			axios: axios$1,
			options,
			movies,
			getMovies,
			promise
		});

		$$self.$inject_state = $$props => {
			if ('movies' in $$props) movies = $$props.movies;
			if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [promise];
	}

	class Example extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Example",
				options,
				id: create_fragment$z.name
			});
		}
	}

	const LOCATION = {};
	const ROUTER = {};
	const HISTORY = {};

	/**
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const PARAM = /^:(.+)/;
	const SEGMENT_POINTS = 4;
	const STATIC_POINTS = 3;
	const DYNAMIC_POINTS = 2;
	const SPLAT_PENALTY = 1;
	const ROOT_POINTS = 1;

	/**
	 * Split up the URI into segments delimited by `/`
	 * Strip starting/ending `/`
	 * @param {string} uri
	 * @return {string[]}
	 */
	const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
	/**
	 * Strip `str` of potential start and end `/`
	 * @param {string} string
	 * @return {string}
	 */
	const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
	/**
	 * Score a route depending on how its individual segments look
	 * @param {object} route
	 * @param {number} index
	 * @return {object}
	 */
	const rankRoute = (route, index) => {
	    const score = route.default
	        ? 0
	        : segmentize(route.path).reduce((score, segment) => {
	              score += SEGMENT_POINTS;

	              if (segment === "") {
	                  score += ROOT_POINTS;
	              } else if (PARAM.test(segment)) {
	                  score += DYNAMIC_POINTS;
	              } else if (segment[0] === "*") {
	                  score -= SEGMENT_POINTS + SPLAT_PENALTY;
	              } else {
	                  score += STATIC_POINTS;
	              }

	              return score;
	          }, 0);

	    return { route, score, index };
	};
	/**
	 * Give a score to all routes and sort them on that
	 * If two routes have the exact same score, we go by index instead
	 * @param {object[]} routes
	 * @return {object[]}
	 */
	const rankRoutes = (routes) =>
	    routes
	        .map(rankRoute)
	        .sort((a, b) =>
	            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
	        );
	/**
	 * Ranks and picks the best route to match. Each segment gets the highest
	 * amount of points, then the type of segment gets an additional amount of
	 * points where
	 *
	 *  static > dynamic > splat > root
	 *
	 * This way we don't have to worry about the order of our routes, let the
	 * computers do it.
	 *
	 * A route looks like this
	 *
	 *  { path, default, value }
	 *
	 * And a returned match looks like:
	 *
	 *  { route, params, uri }
	 *
	 * @param {object[]} routes
	 * @param {string} uri
	 * @return {?object}
	 */
	const pick = (routes, uri) => {
	    let match;
	    let default_;

	    const [uriPathname] = uri.split("?");
	    const uriSegments = segmentize(uriPathname);
	    const isRootUri = uriSegments[0] === "";
	    const ranked = rankRoutes(routes);

	    for (let i = 0, l = ranked.length; i < l; i++) {
	        const route = ranked[i].route;
	        let missed = false;

	        if (route.default) {
	            default_ = {
	                route,
	                params: {},
	                uri,
	            };
	            continue;
	        }

	        const routeSegments = segmentize(route.path);
	        const params = {};
	        const max = Math.max(uriSegments.length, routeSegments.length);
	        let index = 0;

	        for (; index < max; index++) {
	            const routeSegment = routeSegments[index];
	            const uriSegment = uriSegments[index];

	            if (routeSegment && routeSegment[0] === "*") {
	                // Hit a splat, just grab the rest, and return a match
	                // uri:   /files/documents/work
	                // route: /files/* or /files/*splatname
	                const splatName =
	                    routeSegment === "*" ? "*" : routeSegment.slice(1);

	                params[splatName] = uriSegments
	                    .slice(index)
	                    .map(decodeURIComponent)
	                    .join("/");
	                break;
	            }

	            if (typeof uriSegment === "undefined") {
	                // URI is shorter than the route, no match
	                // uri:   /users
	                // route: /users/:userId
	                missed = true;
	                break;
	            }

	            const dynamicMatch = PARAM.exec(routeSegment);

	            if (dynamicMatch && !isRootUri) {
	                const value = decodeURIComponent(uriSegment);
	                params[dynamicMatch[1]] = value;
	            } else if (routeSegment !== uriSegment) {
	                // Current segments don't match, not dynamic, not splat, so no match
	                // uri:   /users/123/settings
	                // route: /users/:id/profile
	                missed = true;
	                break;
	            }
	        }

	        if (!missed) {
	            match = {
	                route,
	                params,
	                uri: "/" + uriSegments.slice(0, index).join("/"),
	            };
	            break;
	        }
	    }

	    return match || default_ || null;
	};
	/**
	 * Combines the `basepath` and the `path` into one path.
	 * @param {string} basepath
	 * @param {string} path
	 */
	const combinePaths = (basepath, path) =>
	    `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
	/**
	 * Decides whether a given `event` should result in a navigation or not.
	 * @param {object} event
	 */
	const shouldNavigate = (event) =>
	    !event.defaultPrevented &&
	    event.button === 0 &&
	    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

	// svelte seems to kill anchor.host value in ie11, so fall back to checking href
	const hostMatches = (anchor) => {
	    const host = location.host;
	    return (
	        anchor.host === host ||
	        anchor.href.indexOf(`https://${host}`) === 0 ||
	        anchor.href.indexOf(`http://${host}`) === 0
	    );
	};

	const canUseDOM = () =>
	    typeof window !== "undefined" &&
	    "document" in window &&
	    "location" in window;

	/* node_modules\svelte-routing\src\Route.svelte generated by Svelte v4.2.20 */
	const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
	const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

	// (42:0) {#if $activeRoute && $activeRoute.route === route}
	function create_if_block$4(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_1$2, create_else_block$4];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*component*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$4.name,
			type: "if",
			source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
			ctx
		});

		return block;
	}

	// (51:4) {:else}
	function create_else_block$4(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[8].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[7],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
							get_default_slot_context$1
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$4.name,
			type: "else",
			source: "(51:4) {:else}",
			ctx
		});

		return block;
	}

	// (43:4) {#if component}
	function create_if_block_1$2(ctx) {
		let await_block_anchor;
		let promise;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: false,
			pending: create_pending_block$9,
			then: create_then_block$9,
			catch: create_catch_block$9,
			value: 12,
			blocks: [,,,]
		};

		handle_promise(promise = /*component*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				info.ctx = ctx;

				if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
					update_await_block_branch(info, ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$2.name,
			type: "if",
			source: "(43:4) {#if component}",
			ctx
		});

		return block;
	}

	// (1:0) <script>     import { getContext, onDestroy }
	function create_catch_block$9(ctx) {
		const block = {
			c: noop$1,
			m: noop$1,
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: noop$1
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$9.name,
			type: "catch",
			source: "(1:0) <script>     import { getContext, onDestroy }",
			ctx
		});

		return block;
	}

	// (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
	function create_then_block$9(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
		var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			if (dirty !== undefined && dirty & /*routeParams, routeProps*/ 12) {
				switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
				]));
			}

			return {
				props: switch_instance_props,
				$$inline: true
			};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
					? get_spread_update(switch_instance_spread_levels, [
							dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
							dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
						])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$9.name,
			type: "then",
			source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
			ctx
		});

		return block;
	}

	// (1:0) <script>     import { getContext, onDestroy }
	function create_pending_block$9(ctx) {
		const block = {
			c: noop$1,
			m: noop$1,
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: noop$1
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$9.name,
			type: "pending",
			source: "(1:0) <script>     import { getContext, onDestroy }",
			ctx
		});

		return block;
	}

	function create_fragment$y(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$4(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*$activeRoute*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$4(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$y.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$y($$self, $$props, $$invalidate) {
		let $activeRoute;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Route', slots, ['default']);
		let { path = "" } = $$props;
		let { component = null } = $$props;
		let routeParams = {};
		let routeProps = {};
		const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

		const route = {
			path,
			// If no path prop is given, this Route will act as the default Route
			// that is rendered if no other Route in the Router is a match.
			default: path === ""
		};

		registerRoute(route);

		onDestroy(() => {
			unregisterRoute(route);
		});

		$$self.$$set = $$new_props => {
			$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
			if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
			if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
			if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
		};

		$$self.$capture_state = () => ({
			getContext,
			onDestroy,
			ROUTER,
			canUseDOM,
			path,
			component,
			routeParams,
			routeProps,
			registerRoute,
			unregisterRoute,
			activeRoute,
			route,
			$activeRoute
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
			if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
			if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
			if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
			if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($activeRoute && $activeRoute.route === route) {
				$$invalidate(2, routeParams = $activeRoute.params);
				const { component: c, path, ...rest } = $$props;
				$$invalidate(3, routeProps = rest);

				if (c) {
					if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
				}

				canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			component,
			$activeRoute,
			routeParams,
			routeProps,
			activeRoute,
			route,
			path,
			$$scope,
			slots
		];
	}

	class Route extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$y, create_fragment$y, safe_not_equal, { path: 6, component: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Route",
				options,
				id: create_fragment$y.name
			});
		}

		get path() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set path(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get component() {
			throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set component(value) {
			throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const subscriber_queue = [];

	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#readable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe
		};
	}

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop$1) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop$1) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop$1;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @overload
	 * @param {S} stores - input stores
	 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
	 * @param {T} [initial_value] - initial value
	 * @returns {import('./public.js').Readable<T>}
	 */

	/**
	 * @template {import('./private.js').Stores} S
	 * @template T
	 * @param {S} stores
	 * @param {Function} fn
	 * @param {T} [initial_value]
	 * @returns {import('./public.js').Readable<T>}
	 */
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		/** @type {Array<import('./public.js').Readable<any>>} */
		const stores_array = single ? [stores] : stores;
		if (!stores_array.every(Boolean)) {
			throw new Error('derived() expects stores as input, got a falsy value');
		}
		const auto = fn.length < 2;
		return readable(initial_value, (set, update) => {
			let started = false;
			const values = [];
			let pending = 0;
			let cleanup = noop$1;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set, update);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop$1;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (started) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					}
				)
			);
			started = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
				// We need to set this to false because callbacks can still happen despite having unsubscribed:
				// Callbacks might already be placed in the queue which doesn't know it should no longer
				// invoke this derived store.
				started = false;
			};
		});
	}

	/**
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const getLocation = (source) => {
	    return {
	        ...source.location,
	        state: source.history.state,
	        key: (source.history.state && source.history.state.key) || "initial",
	    };
	};
	const createHistory = (source) => {
	    const listeners = [];
	    let location = getLocation(source);

	    return {
	        get location() {
	            return location;
	        },

	        listen(listener) {
	            listeners.push(listener);

	            const popstateListener = () => {
	                location = getLocation(source);
	                listener({ location, action: "POP" });
	            };

	            source.addEventListener("popstate", popstateListener);

	            return () => {
	                source.removeEventListener("popstate", popstateListener);
	                const index = listeners.indexOf(listener);
	                listeners.splice(index, 1);
	            };
	        },

	        navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
	            state = { ...state, key: Date.now() + "" };
	            // try...catch iOS Safari limits to 100 pushState calls
	            try {
	                if (replace) source.history.replaceState(state, "", to);
	                else source.history.pushState(state, "", to);
	            } catch (e) {
	                source.location[replace ? "replace" : "assign"](to);
	            }
	            location = getLocation(source);
	            listeners.forEach((listener) =>
	                listener({ location, action: "PUSH", preserveScroll })
	            );
	            if(blurActiveElement) document.activeElement.blur();
	        },
	    };
	};
	// Stores history entries in memory for testing or other platforms like Native
	const createMemorySource = (initialPathname = "/") => {
	    let index = 0;
	    const stack = [{ pathname: initialPathname, search: "" }];
	    const states = [];

	    return {
	        get location() {
	            return stack[index];
	        },
	        addEventListener(name, fn) {},
	        removeEventListener(name, fn) {},
	        history: {
	            get entries() {
	                return stack;
	            },
	            get index() {
	                return index;
	            },
	            get state() {
	                return states[index];
	            },
	            pushState(state, _, uri) {
	                const [pathname, search = ""] = uri.split("?");
	                index++;
	                stack.push({ pathname, search });
	                states.push(state);
	            },
	            replaceState(state, _, uri) {
	                const [pathname, search = ""] = uri.split("?");
	                stack[index] = { pathname, search };
	                states[index] = state;
	            },
	        },
	    };
	};
	// Global history uses window.history as the source if available,
	// otherwise a memory history
	const globalHistory = createHistory(
	    canUseDOM() ? window : createMemorySource()
	);
	const { navigate } = globalHistory;

	/* node_modules\svelte-routing\src\Router.svelte generated by Svelte v4.2.20 */

	const { Object: Object_1 } = globals;
	const file$i = "node_modules\\svelte-routing\\src\\Router.svelte";

	const get_default_slot_changes_1 = dirty => ({
		route: dirty & /*$activeRoute*/ 4,
		location: dirty & /*$location*/ 2
	});

	const get_default_slot_context_1 = ctx => ({
		route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
		location: /*$location*/ ctx[1]
	});

	const get_default_slot_changes = dirty => ({
		route: dirty & /*$activeRoute*/ 4,
		location: dirty & /*$location*/ 2
	});

	const get_default_slot_context = ctx => ({
		route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
		location: /*$location*/ ctx[1]
	});

	// (143:0) {:else}
	function create_else_block$3(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[15].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[14],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
							get_default_slot_context_1
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$3.name,
			type: "else",
			source: "(143:0) {:else}",
			ctx
		});

		return block;
	}

	// (134:0) {#if viewtransition}
	function create_if_block$3(ctx) {
		let previous_key = /*$location*/ ctx[1].pathname;
		let key_block_anchor;
		let current;
		let key_block = create_key_block(ctx);

		const block = {
			c: function create() {
				key_block.c();
				key_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				key_block.m(target, anchor);
				insert_dev(target, key_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
					group_outros();
					transition_out(key_block, 1, 1, noop$1);
					check_outros();
					key_block = create_key_block(ctx);
					key_block.c();
					transition_in(key_block, 1);
					key_block.m(key_block_anchor.parentNode, key_block_anchor);
				} else {
					key_block.p(ctx, dirty);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(key_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(key_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(key_block_anchor);
				}

				key_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$3.name,
			type: "if",
			source: "(134:0) {#if viewtransition}",
			ctx
		});

		return block;
	}

	// (135:4) {#key $location.pathname}
	function create_key_block(ctx) {
		let div;
		let div_intro;
		let div_outro;
		let current;
		const default_slot_template = /*#slots*/ ctx[15].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

		const block = {
			c: function create() {
				div = element("div");
				if (default_slot) default_slot.c();
				add_location(div, file$i, 135, 8, 4659);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[14],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
							get_default_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div_outro) div_outro.end(1);
						div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
						div_intro.start();
					});
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				if (div_intro) div_intro.invalidate();

				if (local) {
					div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (default_slot) default_slot.d(detaching);
				if (detaching && div_outro) div_outro.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_key_block.name,
			type: "key",
			source: "(135:4) {#key $location.pathname}",
			ctx
		});

		return block;
	}

	function create_fragment$x(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$3, create_else_block$3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*viewtransition*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$x.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$x($$self, $$props, $$invalidate) {
		let $location;
		let $routes;
		let $base;
		let $activeRoute;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Router', slots, ['default']);
		let { basepath = "/" } = $$props;
		let { url = null } = $$props;
		let { viewtransition = null } = $$props;
		let { history = globalHistory } = $$props;

		const viewtransitionFn = (node, _, direction) => {
			const vt = viewtransition(direction);
			if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
		};

		setContext(HISTORY, history);
		const locationContext = getContext(LOCATION);
		const routerContext = getContext(ROUTER);
		const routes = writable([]);
		validate_store(routes, 'routes');
		component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
		const activeRoute = writable(null);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
		let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

		// If locationContext is not set, this is the topmost Router in the tree.
		// If the `url` prop is given we force the location to it.
		const location = locationContext || writable(url ? { pathname: url } : history.location);

		validate_store(location, 'location');
		component_subscribe($$self, location, value => $$invalidate(1, $location = value));

		// If routerContext is set, the routerBase of the parent Router
		// will be the base for this Router's descendants.
		// If routerContext is not set, the path and resolved uri will both
		// have the value of the basepath prop.
		const base = routerContext
		? routerContext.routerBase
		: writable({ path: basepath, uri: basepath });

		validate_store(base, 'base');
		component_subscribe($$self, base, value => $$invalidate(13, $base = value));

		const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
			// If there is no activeRoute, the routerBase will be identical to the base.
			if (!activeRoute) return base;

			const { path: basepath } = base;
			const { route, uri } = activeRoute;

			// Remove the potential /* or /*splatname from
			// the end of the child Routes relative paths.
			const path = route.default
			? basepath
			: route.path.replace(/\*.*$/, "");

			return { path, uri };
		});

		const registerRoute = route => {
			const { path: basepath } = $base;
			let { path } = route;

			// We store the original path in the _path property so we can reuse
			// it when the basepath changes. The only thing that matters is that
			// the route reference is intact, so mutation is fine.
			route._path = path;

			route.path = combinePaths(basepath, path);

			if (typeof window === "undefined") {
				// In SSR we should set the activeRoute immediately if it is a match.
				// If there are more Routes being registered after a match is found,
				// we just skip them.
				if (hasActiveRoute) return;

				const matchingRoute = pick([route], $location.pathname);

				if (matchingRoute) {
					activeRoute.set(matchingRoute);
					hasActiveRoute = true;
				}
			} else {
				routes.update(rs => [...rs, route]);
			}
		};

		const unregisterRoute = route => {
			routes.update(rs => rs.filter(r => r !== route));
		};

		let preserveScroll = false;

		if (!locationContext) {
			// The topmost Router in the tree is responsible for updating
			// the location store and supplying it through context.
			onMount(() => {
				const unlisten = history.listen(event => {
					$$invalidate(11, preserveScroll = event.preserveScroll || false);
					location.set(event.location);
				});

				return unlisten;
			});

			setContext(LOCATION, location);
		}

		setContext(ROUTER, {
			activeRoute,
			base,
			routerBase,
			registerRoute,
			unregisterRoute
		});

		const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
			if ('url' in $$props) $$invalidate(9, url = $$props.url);
			if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
			if ('history' in $$props) $$invalidate(10, history = $$props.history);
			if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			getContext,
			onMount,
			setContext,
			derived,
			writable,
			HISTORY,
			LOCATION,
			ROUTER,
			globalHistory,
			combinePaths,
			pick,
			basepath,
			url,
			viewtransition,
			history,
			viewtransitionFn,
			locationContext,
			routerContext,
			routes,
			activeRoute,
			hasActiveRoute,
			location,
			base,
			routerBase,
			registerRoute,
			unregisterRoute,
			preserveScroll,
			$location,
			$routes,
			$base,
			$activeRoute
		});

		$$self.$inject_state = $$props => {
			if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
			if ('url' in $$props) $$invalidate(9, url = $$props.url);
			if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
			if ('history' in $$props) $$invalidate(10, history = $$props.history);
			if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
			if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*$base*/ 8192) {
				// This reactive statement will update all the Routes' path when
				// the basepath changes.
				{
					const { path: basepath } = $base;
					routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
				}
			}

			if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
				// This reactive statement will be run when the Router is created
				// when there are no Routes and then again the following tick, so it
				// will not find an active Route in SSR and in the browser it will only
				// pick an active Route after all Routes have been registered.
				{
					const bestMatch = pick($routes, $location.pathname);
					activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
				}
			}
		};

		return [
			viewtransition,
			$location,
			$activeRoute,
			viewtransitionFn,
			routes,
			activeRoute,
			location,
			base,
			basepath,
			url,
			history,
			preserveScroll,
			$routes,
			$base,
			$$scope,
			slots
		];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$x, create_fragment$x, safe_not_equal, {
				basepath: 8,
				url: 9,
				viewtransition: 0,
				history: 10
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Router",
				options,
				id: create_fragment$x.name
			});
		}

		get basepath() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set basepath(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get url() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set url(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get viewtransition() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set viewtransition(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get history() {
			throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set history(value) {
			throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/**
	 * A link action that can be added to <a href=""> tags rather
	 * than using the <Link> component.
	 *
	 * Example:
	 * ```html
	 * <a href="/post/{postId}" use:link>{post.title}</a>
	 * ```
	 */
	const link = (node) => {
	    const onClick = (event) => {
	        const anchor = event.currentTarget;

	        if (
	            (anchor.target === "" || anchor.target === "_self") &&
	            hostMatches(anchor) &&
	            shouldNavigate(event)
	        ) {
	            event.preventDefault();
	            navigate(anchor.pathname + anchor.search, {
	                replace: anchor.hasAttribute("replace"),
	                preserveScroll: anchor.hasAttribute("preserveScroll"),
	            });
	        }
	    };

	    node.addEventListener("click", onClick);

	    return {
	        destroy() {
	            node.removeEventListener("click", onClick);
	        },
	    };
	};
	/**
	 * An action to be added at a root element of your application to
	 * capture all relative links and push them onto the history stack.
	 *
	 * Example:
	 * ```html
	 * <div use:links>
	 *   <Router>
	 *     <Route path="/" component={Home} />
	 *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
	 *     {#each projects as project}
	 *       <a href="/p/{project.id}">{project.title}</a>
	 *     {/each}
	 *   </Router>
	 * </div>
	 * ```
	 */
	const links = (node) => {
	    const findClosest = (tagName, el) => {
	        while (el && el.tagName !== tagName) el = el.parentNode;
	        return el;
	    };

	    const onClick = (event) => {
	        const anchor = findClosest("A", event.target);
	        if (
	            anchor &&
	            (anchor.target === "" || anchor.target === "_self") &&
	            hostMatches(anchor) &&
	            shouldNavigate(event) &&
	            !anchor.hasAttribute("noroute")
	        ) {
	            event.preventDefault();
	            navigate(anchor.pathname + anchor.search, {
	                replace: anchor.hasAttribute("replace"),
	                preserveScroll: anchor.hasAttribute("preserveScroll"),
	            });
	        }
	    };

	    node.addEventListener("click", onClick);

	    return {
	        destroy() {
	            node.removeEventListener("click", onClick);
	        },
	    };
	};

	const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
	const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
	  const colonSeparated = value.split(":");
	  if (value.slice(0, 1) === "@") {
	    if (colonSeparated.length < 2 || colonSeparated.length > 3) {
	      return null;
	    }
	    provider = colonSeparated.shift().slice(1);
	  }
	  if (colonSeparated.length > 3 || !colonSeparated.length) {
	    return null;
	  }
	  if (colonSeparated.length > 1) {
	    const name2 = colonSeparated.pop();
	    const prefix = colonSeparated.pop();
	    const result = {
	      // Allow provider without '@': "provider:prefix:name"
	      provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
	      prefix,
	      name: name2
	    };
	    return validate && !validateIconName(result) ? null : result;
	  }
	  const name = colonSeparated[0];
	  const dashSeparated = name.split("-");
	  if (dashSeparated.length > 1) {
	    const result = {
	      provider,
	      prefix: dashSeparated.shift(),
	      name: dashSeparated.join("-")
	    };
	    return validate && !validateIconName(result) ? null : result;
	  }
	  if (allowSimpleName && provider === "") {
	    const result = {
	      provider,
	      prefix: "",
	      name
	    };
	    return validate && !validateIconName(result, allowSimpleName) ? null : result;
	  }
	  return null;
	};
	const validateIconName = (icon, allowSimpleName) => {
	  if (!icon) {
	    return false;
	  }
	  return !!// Check prefix: cannot be empty, unless allowSimpleName is enabled
	  // Check name: cannot be empty
	  ((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
	};

	const defaultIconDimensions = Object.freeze(
	  {
	    left: 0,
	    top: 0,
	    width: 16,
	    height: 16
	  }
	);
	const defaultIconTransformations = Object.freeze({
	  rotate: 0,
	  vFlip: false,
	  hFlip: false
	});
	const defaultIconProps = Object.freeze({
	  ...defaultIconDimensions,
	  ...defaultIconTransformations
	});
	const defaultExtendedIconProps = Object.freeze({
	  ...defaultIconProps,
	  body: "",
	  hidden: false
	});

	function mergeIconTransformations(obj1, obj2) {
	  const result = {};
	  if (!obj1.hFlip !== !obj2.hFlip) {
	    result.hFlip = true;
	  }
	  if (!obj1.vFlip !== !obj2.vFlip) {
	    result.vFlip = true;
	  }
	  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
	  if (rotate) {
	    result.rotate = rotate;
	  }
	  return result;
	}

	function mergeIconData(parent, child) {
	  const result = mergeIconTransformations(parent, child);
	  for (const key in defaultExtendedIconProps) {
	    if (key in defaultIconTransformations) {
	      if (key in parent && !(key in result)) {
	        result[key] = defaultIconTransformations[key];
	      }
	    } else if (key in child) {
	      result[key] = child[key];
	    } else if (key in parent) {
	      result[key] = parent[key];
	    }
	  }
	  return result;
	}

	function getIconsTree(data, names) {
	  const icons = data.icons;
	  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
	  const resolved = /* @__PURE__ */ Object.create(null);
	  function resolve(name) {
	    if (icons[name]) {
	      return resolved[name] = [];
	    }
	    if (!(name in resolved)) {
	      resolved[name] = null;
	      const parent = aliases[name] && aliases[name].parent;
	      const value = parent && resolve(parent);
	      if (value) {
	        resolved[name] = [parent].concat(value);
	      }
	    }
	    return resolved[name];
	  }
	  (Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
	  return resolved;
	}

	function internalGetIconData(data, name, tree) {
	  const icons = data.icons;
	  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
	  let currentProps = {};
	  function parse(name2) {
	    currentProps = mergeIconData(
	      icons[name2] || aliases[name2],
	      currentProps
	    );
	  }
	  parse(name);
	  tree.forEach(parse);
	  return mergeIconData(data, currentProps);
	}

	function parseIconSet(data, callback) {
	  const names = [];
	  if (typeof data !== "object" || typeof data.icons !== "object") {
	    return names;
	  }
	  if (data.not_found instanceof Array) {
	    data.not_found.forEach((name) => {
	      callback(name, null);
	      names.push(name);
	    });
	  }
	  const tree = getIconsTree(data);
	  for (const name in tree) {
	    const item = tree[name];
	    if (item) {
	      callback(name, internalGetIconData(data, name, item));
	      names.push(name);
	    }
	  }
	  return names;
	}

	const optionalPropertyDefaults = {
	  provider: "",
	  aliases: {},
	  not_found: {},
	  ...defaultIconDimensions
	};
	function checkOptionalProps(item, defaults) {
	  for (const prop in defaults) {
	    if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
	      return false;
	    }
	  }
	  return true;
	}
	function quicklyValidateIconSet(obj) {
	  if (typeof obj !== "object" || obj === null) {
	    return null;
	  }
	  const data = obj;
	  if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
	    return null;
	  }
	  if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
	    return null;
	  }
	  const icons = data.icons;
	  for (const name in icons) {
	    const icon = icons[name];
	    if (
	      // Name cannot be empty
	      !name || // Must have body
	      typeof icon.body !== "string" || // Check other props
	      !checkOptionalProps(
	        icon,
	        defaultExtendedIconProps
	      )
	    ) {
	      return null;
	    }
	  }
	  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
	  for (const name in aliases) {
	    const icon = aliases[name];
	    const parent = icon.parent;
	    if (
	      // Name cannot be empty
	      !name || // Parent must be set and point to existing icon
	      typeof parent !== "string" || !icons[parent] && !aliases[parent] || // Check other props
	      !checkOptionalProps(
	        icon,
	        defaultExtendedIconProps
	      )
	    ) {
	      return null;
	    }
	  }
	  return data;
	}

	const dataStorage = /* @__PURE__ */ Object.create(null);
	function newStorage(provider, prefix) {
	  return {
	    provider,
	    prefix,
	    icons: /* @__PURE__ */ Object.create(null),
	    missing: /* @__PURE__ */ new Set()
	  };
	}
	function getStorage(provider, prefix) {
	  const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
	  return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
	}
	function addIconSet(storage, data) {
	  if (!quicklyValidateIconSet(data)) {
	    return [];
	  }
	  return parseIconSet(data, (name, icon) => {
	    if (icon) {
	      storage.icons[name] = icon;
	    } else {
	      storage.missing.add(name);
	    }
	  });
	}
	function addIconToStorage(storage, name, icon) {
	  try {
	    if (typeof icon.body === "string") {
	      storage.icons[name] = { ...icon };
	      return true;
	    }
	  } catch (err) {
	  }
	  return false;
	}
	function listIcons(provider, prefix) {
	  let allIcons = [];
	  const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
	  providers.forEach((provider2) => {
	    const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
	    prefixes.forEach((prefix2) => {
	      const storage = getStorage(provider2, prefix2);
	      allIcons = allIcons.concat(
	        Object.keys(storage.icons).map(
	          (name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name
	        )
	      );
	    });
	  });
	  return allIcons;
	}

	let simpleNames = false;
	function allowSimpleNames(allow) {
	  if (typeof allow === "boolean") {
	    simpleNames = allow;
	  }
	  return simpleNames;
	}
	function getIconData(name) {
	  const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
	  if (icon) {
	    const storage = getStorage(icon.provider, icon.prefix);
	    const iconName = icon.name;
	    return storage.icons[iconName] || (storage.missing.has(iconName) ? null : void 0);
	  }
	}
	function addIcon(name, data) {
	  const icon = stringToIcon(name, true, simpleNames);
	  if (!icon) {
	    return false;
	  }
	  const storage = getStorage(icon.provider, icon.prefix);
	  if (data) {
	    return addIconToStorage(storage, icon.name, data);
	  } else {
	    storage.missing.add(icon.name);
	    return true;
	  }
	}
	function addCollection(data, provider) {
	  if (typeof data !== "object") {
	    return false;
	  }
	  if (typeof provider !== "string") {
	    provider = data.provider || "";
	  }
	  if (simpleNames && !provider && !data.prefix) {
	    let added = false;
	    if (quicklyValidateIconSet(data)) {
	      data.prefix = "";
	      parseIconSet(data, (name, icon) => {
	        if (addIcon(name, icon)) {
	          added = true;
	        }
	      });
	    }
	    return added;
	  }
	  const prefix = data.prefix;
	  if (!validateIconName({
	    provider,
	    prefix,
	    name: "a"
	  })) {
	    return false;
	  }
	  const storage = getStorage(provider, prefix);
	  return !!addIconSet(storage, data);
	}
	function iconLoaded(name) {
	  return !!getIconData(name);
	}
	function getIcon(name) {
	  const result = getIconData(name);
	  return result ? {
	    ...defaultIconProps,
	    ...result
	  } : result;
	}

	const defaultIconSizeCustomisations = Object.freeze({
	  width: null,
	  height: null
	});
	const defaultIconCustomisations = Object.freeze({
	  // Dimensions
	  ...defaultIconSizeCustomisations,
	  // Transformations
	  ...defaultIconTransformations
	});

	const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
	const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
	function calculateSize(size, ratio, precision) {
	  if (ratio === 1) {
	    return size;
	  }
	  precision = precision || 100;
	  if (typeof size === "number") {
	    return Math.ceil(size * ratio * precision) / precision;
	  }
	  if (typeof size !== "string") {
	    return size;
	  }
	  const oldParts = size.split(unitsSplit);
	  if (oldParts === null || !oldParts.length) {
	    return size;
	  }
	  const newParts = [];
	  let code = oldParts.shift();
	  let isNumber = unitsTest.test(code);
	  while (true) {
	    if (isNumber) {
	      const num = parseFloat(code);
	      if (isNaN(num)) {
	        newParts.push(code);
	      } else {
	        newParts.push(Math.ceil(num * ratio * precision) / precision);
	      }
	    } else {
	      newParts.push(code);
	    }
	    code = oldParts.shift();
	    if (code === void 0) {
	      return newParts.join("");
	    }
	    isNumber = !isNumber;
	  }
	}

	function splitSVGDefs(content, tag = "defs") {
	  let defs = "";
	  const index = content.indexOf("<" + tag);
	  while (index >= 0) {
	    const start = content.indexOf(">", index);
	    const end = content.indexOf("</" + tag);
	    if (start === -1 || end === -1) {
	      break;
	    }
	    const endEnd = content.indexOf(">", end);
	    if (endEnd === -1) {
	      break;
	    }
	    defs += content.slice(start + 1, end).trim();
	    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
	  }
	  return {
	    defs,
	    content
	  };
	}
	function mergeDefsAndContent(defs, content) {
	  return defs ? "<defs>" + defs + "</defs>" + content : content;
	}
	function wrapSVGContent(body, start, end) {
	  const split = splitSVGDefs(body);
	  return mergeDefsAndContent(split.defs, start + split.content + end);
	}

	const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
	function iconToSVG(icon, customisations) {
	  const fullIcon = {
	    ...defaultIconProps,
	    ...icon
	  };
	  const fullCustomisations = {
	    ...defaultIconCustomisations,
	    ...customisations
	  };
	  const box = {
	    left: fullIcon.left,
	    top: fullIcon.top,
	    width: fullIcon.width,
	    height: fullIcon.height
	  };
	  let body = fullIcon.body;
	  [fullIcon, fullCustomisations].forEach((props) => {
	    const transformations = [];
	    const hFlip = props.hFlip;
	    const vFlip = props.vFlip;
	    let rotation = props.rotate;
	    if (hFlip) {
	      if (vFlip) {
	        rotation += 2;
	      } else {
	        transformations.push(
	          "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
	        );
	        transformations.push("scale(-1 1)");
	        box.top = box.left = 0;
	      }
	    } else if (vFlip) {
	      transformations.push(
	        "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
	      );
	      transformations.push("scale(1 -1)");
	      box.top = box.left = 0;
	    }
	    let tempValue;
	    if (rotation < 0) {
	      rotation -= Math.floor(rotation / 4) * 4;
	    }
	    rotation = rotation % 4;
	    switch (rotation) {
	      case 1:
	        tempValue = box.height / 2 + box.top;
	        transformations.unshift(
	          "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
	        );
	        break;
	      case 2:
	        transformations.unshift(
	          "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
	        );
	        break;
	      case 3:
	        tempValue = box.width / 2 + box.left;
	        transformations.unshift(
	          "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
	        );
	        break;
	    }
	    if (rotation % 2 === 1) {
	      if (box.left !== box.top) {
	        tempValue = box.left;
	        box.left = box.top;
	        box.top = tempValue;
	      }
	      if (box.width !== box.height) {
	        tempValue = box.width;
	        box.width = box.height;
	        box.height = tempValue;
	      }
	    }
	    if (transformations.length) {
	      body = wrapSVGContent(
	        body,
	        '<g transform="' + transformations.join(" ") + '">',
	        "</g>"
	      );
	    }
	  });
	  const customisationsWidth = fullCustomisations.width;
	  const customisationsHeight = fullCustomisations.height;
	  const boxWidth = box.width;
	  const boxHeight = box.height;
	  let width;
	  let height;
	  if (customisationsWidth === null) {
	    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
	    width = calculateSize(height, boxWidth / boxHeight);
	  } else {
	    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
	    height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
	  }
	  const attributes = {};
	  const setAttr = (prop, value) => {
	    if (!isUnsetKeyword(value)) {
	      attributes[prop] = value.toString();
	    }
	  };
	  setAttr("width", width);
	  setAttr("height", height);
	  const viewBox = [box.left, box.top, boxWidth, boxHeight];
	  attributes.viewBox = viewBox.join(" ");
	  return {
	    attributes,
	    viewBox,
	    body
	  };
	}

	const regex = /\sid="(\S+)"/g;
	const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
	let counter = 0;
	function replaceIDs(body, prefix = randomPrefix) {
	  const ids = [];
	  let match;
	  while (match = regex.exec(body)) {
	    ids.push(match[1]);
	  }
	  if (!ids.length) {
	    return body;
	  }
	  const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
	  ids.forEach((id) => {
	    const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
	    const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	    body = body.replace(
	      // Allowed characters before id: [#;"]
	      // Allowed characters after id: [)"], .[a-z]
	      new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"),
	      "$1" + newID + suffix + "$3"
	    );
	  });
	  body = body.replace(new RegExp(suffix, "g"), "");
	  return body;
	}

	const storage = /* @__PURE__ */ Object.create(null);
	function setAPIModule(provider, item) {
	  storage[provider] = item;
	}
	function getAPIModule(provider) {
	  return storage[provider] || storage[""];
	}

	function createAPIConfig(source) {
	  let resources;
	  if (typeof source.resources === "string") {
	    resources = [source.resources];
	  } else {
	    resources = source.resources;
	    if (!(resources instanceof Array) || !resources.length) {
	      return null;
	    }
	  }
	  const result = {
	    // API hosts
	    resources,
	    // Root path
	    path: source.path || "/",
	    // URL length limit
	    maxURL: source.maxURL || 500,
	    // Timeout before next host is used.
	    rotate: source.rotate || 750,
	    // Timeout before failing query.
	    timeout: source.timeout || 5e3,
	    // Randomise default API end point.
	    random: source.random === true,
	    // Start index
	    index: source.index || 0,
	    // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
	    dataAfterTimeout: source.dataAfterTimeout !== false
	  };
	  return result;
	}
	const configStorage = /* @__PURE__ */ Object.create(null);
	const fallBackAPISources = [
	  "https://api.simplesvg.com",
	  "https://api.unisvg.com"
	];
	const fallBackAPI = [];
	while (fallBackAPISources.length > 0) {
	  if (fallBackAPISources.length === 1) {
	    fallBackAPI.push(fallBackAPISources.shift());
	  } else {
	    if (Math.random() > 0.5) {
	      fallBackAPI.push(fallBackAPISources.shift());
	    } else {
	      fallBackAPI.push(fallBackAPISources.pop());
	    }
	  }
	}
	configStorage[""] = createAPIConfig({
	  resources: ["https://api.iconify.design"].concat(fallBackAPI)
	});
	function addAPIProvider(provider, customConfig) {
	  const config = createAPIConfig(customConfig);
	  if (config === null) {
	    return false;
	  }
	  configStorage[provider] = config;
	  return true;
	}
	function getAPIConfig(provider) {
	  return configStorage[provider];
	}
	function listAPIProviders() {
	  return Object.keys(configStorage);
	}

	const detectFetch = () => {
	  let callback;
	  try {
	    callback = fetch;
	    if (typeof callback === "function") {
	      return callback;
	    }
	  } catch (err) {
	  }
	};
	let fetchModule = detectFetch();
	function setFetch(fetch2) {
	  fetchModule = fetch2;
	}
	function getFetch() {
	  return fetchModule;
	}
	function calculateMaxLength(provider, prefix) {
	  const config = getAPIConfig(provider);
	  if (!config) {
	    return 0;
	  }
	  let result;
	  if (!config.maxURL) {
	    result = 0;
	  } else {
	    let maxHostLength = 0;
	    config.resources.forEach((item) => {
	      const host = item;
	      maxHostLength = Math.max(maxHostLength, host.length);
	    });
	    const url = prefix + ".json?icons=";
	    result = config.maxURL - maxHostLength - config.path.length - url.length;
	  }
	  return result;
	}
	function shouldAbort(status) {
	  return status === 404;
	}
	const prepare = (provider, prefix, icons) => {
	  const results = [];
	  const maxLength = calculateMaxLength(provider, prefix);
	  const type = "icons";
	  let item = {
	    type,
	    provider,
	    prefix,
	    icons: []
	  };
	  let length = 0;
	  icons.forEach((name, index) => {
	    length += name.length + 1;
	    if (length >= maxLength && index > 0) {
	      results.push(item);
	      item = {
	        type,
	        provider,
	        prefix,
	        icons: []
	      };
	      length = name.length;
	    }
	    item.icons.push(name);
	  });
	  results.push(item);
	  return results;
	};
	function getPath(provider) {
	  if (typeof provider === "string") {
	    const config = getAPIConfig(provider);
	    if (config) {
	      return config.path;
	    }
	  }
	  return "/";
	}
	const send = (host, params, callback) => {
	  if (!fetchModule) {
	    callback("abort", 424);
	    return;
	  }
	  let path = getPath(params.provider);
	  switch (params.type) {
	    case "icons": {
	      const prefix = params.prefix;
	      const icons = params.icons;
	      const iconsList = icons.join(",");
	      const urlParams = new URLSearchParams({
	        icons: iconsList
	      });
	      path += prefix + ".json?" + urlParams.toString();
	      break;
	    }
	    case "custom": {
	      const uri = params.uri;
	      path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
	      break;
	    }
	    default:
	      callback("abort", 400);
	      return;
	  }
	  let defaultError = 503;
	  fetchModule(host + path).then((response) => {
	    const status = response.status;
	    if (status !== 200) {
	      setTimeout(() => {
	        callback(shouldAbort(status) ? "abort" : "next", status);
	      });
	      return;
	    }
	    defaultError = 501;
	    return response.json();
	  }).then((data) => {
	    if (typeof data !== "object" || data === null) {
	      setTimeout(() => {
	        if (data === 404) {
	          callback("abort", data);
	        } else {
	          callback("next", defaultError);
	        }
	      });
	      return;
	    }
	    setTimeout(() => {
	      callback("success", data);
	    });
	  }).catch(() => {
	    callback("next", defaultError);
	  });
	};
	const fetchAPIModule = {
	  prepare,
	  send
	};

	function sortIcons(icons) {
	  const result = {
	    loaded: [],
	    missing: [],
	    pending: []
	  };
	  const storage = /* @__PURE__ */ Object.create(null);
	  icons.sort((a, b) => {
	    if (a.provider !== b.provider) {
	      return a.provider.localeCompare(b.provider);
	    }
	    if (a.prefix !== b.prefix) {
	      return a.prefix.localeCompare(b.prefix);
	    }
	    return a.name.localeCompare(b.name);
	  });
	  let lastIcon = {
	    provider: "",
	    prefix: "",
	    name: ""
	  };
	  icons.forEach((icon) => {
	    if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
	      return;
	    }
	    lastIcon = icon;
	    const provider = icon.provider;
	    const prefix = icon.prefix;
	    const name = icon.name;
	    const providerStorage = storage[provider] || (storage[provider] = /* @__PURE__ */ Object.create(null));
	    const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
	    let list;
	    if (name in localStorage.icons) {
	      list = result.loaded;
	    } else if (prefix === "" || localStorage.missing.has(name)) {
	      list = result.missing;
	    } else {
	      list = result.pending;
	    }
	    const item = {
	      provider,
	      prefix,
	      name
	    };
	    list.push(item);
	  });
	  return result;
	}

	function removeCallback(storages, id) {
	  storages.forEach((storage) => {
	    const items = storage.loaderCallbacks;
	    if (items) {
	      storage.loaderCallbacks = items.filter((row) => row.id !== id);
	    }
	  });
	}
	function updateCallbacks(storage) {
	  if (!storage.pendingCallbacksFlag) {
	    storage.pendingCallbacksFlag = true;
	    setTimeout(() => {
	      storage.pendingCallbacksFlag = false;
	      const items = storage.loaderCallbacks ? storage.loaderCallbacks.slice(0) : [];
	      if (!items.length) {
	        return;
	      }
	      let hasPending = false;
	      const provider = storage.provider;
	      const prefix = storage.prefix;
	      items.forEach((item) => {
	        const icons = item.icons;
	        const oldLength = icons.pending.length;
	        icons.pending = icons.pending.filter((icon) => {
	          if (icon.prefix !== prefix) {
	            return true;
	          }
	          const name = icon.name;
	          if (storage.icons[name]) {
	            icons.loaded.push({
	              provider,
	              prefix,
	              name
	            });
	          } else if (storage.missing.has(name)) {
	            icons.missing.push({
	              provider,
	              prefix,
	              name
	            });
	          } else {
	            hasPending = true;
	            return true;
	          }
	          return false;
	        });
	        if (icons.pending.length !== oldLength) {
	          if (!hasPending) {
	            removeCallback([storage], item.id);
	          }
	          item.callback(
	            icons.loaded.slice(0),
	            icons.missing.slice(0),
	            icons.pending.slice(0),
	            item.abort
	          );
	        }
	      });
	    });
	  }
	}
	let idCounter = 0;
	function storeCallback(callback, icons, pendingSources) {
	  const id = idCounter++;
	  const abort = removeCallback.bind(null, pendingSources, id);
	  if (!icons.pending.length) {
	    return abort;
	  }
	  const item = {
	    id,
	    icons,
	    callback,
	    abort
	  };
	  pendingSources.forEach((storage) => {
	    (storage.loaderCallbacks || (storage.loaderCallbacks = [])).push(item);
	  });
	  return abort;
	}

	function listToIcons(list, validate = true, simpleNames = false) {
	  const result = [];
	  list.forEach((item) => {
	    const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames) : item;
	    if (icon) {
	      result.push(icon);
	    }
	  });
	  return result;
	}

	// src/config.ts
	var defaultConfig = {
	  resources: [],
	  index: 0,
	  timeout: 2e3,
	  rotate: 750,
	  random: false,
	  dataAfterTimeout: false
	};

	// src/query.ts
	function sendQuery(config, payload, query, done) {
	  const resourcesCount = config.resources.length;
	  const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
	  let resources;
	  if (config.random) {
	    let list = config.resources.slice(0);
	    resources = [];
	    while (list.length > 1) {
	      const nextIndex = Math.floor(Math.random() * list.length);
	      resources.push(list[nextIndex]);
	      list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
	    }
	    resources = resources.concat(list);
	  } else {
	    resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
	  }
	  const startTime = Date.now();
	  let status = "pending";
	  let queriesSent = 0;
	  let lastError;
	  let timer = null;
	  let queue = [];
	  let doneCallbacks = [];
	  if (typeof done === "function") {
	    doneCallbacks.push(done);
	  }
	  function resetTimer() {
	    if (timer) {
	      clearTimeout(timer);
	      timer = null;
	    }
	  }
	  function abort() {
	    if (status === "pending") {
	      status = "aborted";
	    }
	    resetTimer();
	    queue.forEach((item) => {
	      if (item.status === "pending") {
	        item.status = "aborted";
	      }
	    });
	    queue = [];
	  }
	  function subscribe(callback, overwrite) {
	    if (overwrite) {
	      doneCallbacks = [];
	    }
	    if (typeof callback === "function") {
	      doneCallbacks.push(callback);
	    }
	  }
	  function getQueryStatus() {
	    return {
	      startTime,
	      payload,
	      status,
	      queriesSent,
	      queriesPending: queue.length,
	      subscribe,
	      abort
	    };
	  }
	  function failQuery() {
	    status = "failed";
	    doneCallbacks.forEach((callback) => {
	      callback(void 0, lastError);
	    });
	  }
	  function clearQueue() {
	    queue.forEach((item) => {
	      if (item.status === "pending") {
	        item.status = "aborted";
	      }
	    });
	    queue = [];
	  }
	  function moduleResponse(item, response, data) {
	    const isError = response !== "success";
	    queue = queue.filter((queued) => queued !== item);
	    switch (status) {
	      case "pending":
	        break;
	      case "failed":
	        if (isError || !config.dataAfterTimeout) {
	          return;
	        }
	        break;
	      default:
	        return;
	    }
	    if (response === "abort") {
	      lastError = data;
	      failQuery();
	      return;
	    }
	    if (isError) {
	      lastError = data;
	      if (!queue.length) {
	        if (!resources.length) {
	          failQuery();
	        } else {
	          execNext();
	        }
	      }
	      return;
	    }
	    resetTimer();
	    clearQueue();
	    if (!config.random) {
	      const index = config.resources.indexOf(item.resource);
	      if (index !== -1 && index !== config.index) {
	        config.index = index;
	      }
	    }
	    status = "completed";
	    doneCallbacks.forEach((callback) => {
	      callback(data);
	    });
	  }
	  function execNext() {
	    if (status !== "pending") {
	      return;
	    }
	    resetTimer();
	    const resource = resources.shift();
	    if (resource === void 0) {
	      if (queue.length) {
	        timer = setTimeout(() => {
	          resetTimer();
	          if (status === "pending") {
	            clearQueue();
	            failQuery();
	          }
	        }, config.timeout);
	        return;
	      }
	      failQuery();
	      return;
	    }
	    const item = {
	      status: "pending",
	      resource,
	      callback: (status2, data) => {
	        moduleResponse(item, status2, data);
	      }
	    };
	    queue.push(item);
	    queriesSent++;
	    timer = setTimeout(execNext, config.rotate);
	    query(resource, payload, item.callback);
	  }
	  setTimeout(execNext);
	  return getQueryStatus;
	}

	// src/index.ts
	function initRedundancy(cfg) {
	  const config = {
	    ...defaultConfig,
	    ...cfg
	  };
	  let queries = [];
	  function cleanup() {
	    queries = queries.filter((item) => item().status === "pending");
	  }
	  function query(payload, queryCallback, doneCallback) {
	    const query2 = sendQuery(
	      config,
	      payload,
	      queryCallback,
	      (data, error) => {
	        cleanup();
	        if (doneCallback) {
	          doneCallback(data, error);
	        }
	      }
	    );
	    queries.push(query2);
	    return query2;
	  }
	  function find(callback) {
	    return queries.find((value) => {
	      return callback(value);
	    }) || null;
	  }
	  const instance = {
	    query,
	    find,
	    setIndex: (index) => {
	      config.index = index;
	    },
	    getIndex: () => config.index,
	    cleanup
	  };
	  return instance;
	}

	function emptyCallback$1() {
	}
	const redundancyCache = /* @__PURE__ */ Object.create(null);
	function getRedundancyCache(provider) {
	  if (!redundancyCache[provider]) {
	    const config = getAPIConfig(provider);
	    if (!config) {
	      return;
	    }
	    const redundancy = initRedundancy(config);
	    const cachedReundancy = {
	      config,
	      redundancy
	    };
	    redundancyCache[provider] = cachedReundancy;
	  }
	  return redundancyCache[provider];
	}
	function sendAPIQuery(target, query, callback) {
	  let redundancy;
	  let send;
	  if (typeof target === "string") {
	    const api = getAPIModule(target);
	    if (!api) {
	      callback(void 0, 424);
	      return emptyCallback$1;
	    }
	    send = api.send;
	    const cached = getRedundancyCache(target);
	    if (cached) {
	      redundancy = cached.redundancy;
	    }
	  } else {
	    const config = createAPIConfig(target);
	    if (config) {
	      redundancy = initRedundancy(config);
	      const moduleKey = target.resources ? target.resources[0] : "";
	      const api = getAPIModule(moduleKey);
	      if (api) {
	        send = api.send;
	      }
	    }
	  }
	  if (!redundancy || !send) {
	    callback(void 0, 424);
	    return emptyCallback$1;
	  }
	  return redundancy.query(query, send, callback)().abort;
	}

	function emptyCallback() {
	}
	function loadedNewIcons(storage) {
	  if (!storage.iconsLoaderFlag) {
	    storage.iconsLoaderFlag = true;
	    setTimeout(() => {
	      storage.iconsLoaderFlag = false;
	      updateCallbacks(storage);
	    });
	  }
	}
	function checkIconNamesForAPI(icons) {
	  const valid = [];
	  const invalid = [];
	  icons.forEach((name) => {
	    (name.match(matchIconName) ? valid : invalid).push(name);
	  });
	  return {
	    valid,
	    invalid
	  };
	}
	function parseLoaderResponse(storage, icons, data) {
	  function checkMissing() {
	    const pending = storage.pendingIcons;
	    icons.forEach((name) => {
	      if (pending) {
	        pending.delete(name);
	      }
	      if (!storage.icons[name]) {
	        storage.missing.add(name);
	      }
	    });
	  }
	  if (data && typeof data === "object") {
	    try {
	      const parsed = addIconSet(storage, data);
	      if (!parsed.length) {
	        checkMissing();
	        return;
	      }
	    } catch (err) {
	      console.error(err);
	    }
	  }
	  checkMissing();
	  loadedNewIcons(storage);
	}
	function parsePossiblyAsyncResponse(response, callback) {
	  if (response instanceof Promise) {
	    response.then((data) => {
	      callback(data);
	    }).catch(() => {
	      callback(null);
	    });
	  } else {
	    callback(response);
	  }
	}
	function loadNewIcons(storage, icons) {
	  if (!storage.iconsToLoad) {
	    storage.iconsToLoad = icons;
	  } else {
	    storage.iconsToLoad = storage.iconsToLoad.concat(icons).sort();
	  }
	  if (!storage.iconsQueueFlag) {
	    storage.iconsQueueFlag = true;
	    setTimeout(() => {
	      storage.iconsQueueFlag = false;
	      const { provider, prefix } = storage;
	      const icons2 = storage.iconsToLoad;
	      delete storage.iconsToLoad;
	      if (!icons2 || !icons2.length) {
	        return;
	      }
	      const customIconLoader = storage.loadIcon;
	      if (storage.loadIcons && (icons2.length > 1 || !customIconLoader)) {
	        parsePossiblyAsyncResponse(
	          storage.loadIcons(icons2, prefix, provider),
	          (data) => {
	            parseLoaderResponse(storage, icons2, data);
	          }
	        );
	        return;
	      }
	      if (customIconLoader) {
	        icons2.forEach((name) => {
	          const response = customIconLoader(name, prefix, provider);
	          parsePossiblyAsyncResponse(response, (data) => {
	            const iconSet = data ? {
	              prefix,
	              icons: {
	                [name]: data
	              }
	            } : null;
	            parseLoaderResponse(storage, [name], iconSet);
	          });
	        });
	        return;
	      }
	      const { valid, invalid } = checkIconNamesForAPI(icons2);
	      if (invalid.length) {
	        parseLoaderResponse(storage, invalid, null);
	      }
	      if (!valid.length) {
	        return;
	      }
	      const api = prefix.match(matchIconName) ? getAPIModule(provider) : null;
	      if (!api) {
	        parseLoaderResponse(storage, valid, null);
	        return;
	      }
	      const params = api.prepare(provider, prefix, valid);
	      params.forEach((item) => {
	        sendAPIQuery(provider, item, (data) => {
	          parseLoaderResponse(storage, item.icons, data);
	        });
	      });
	    });
	  }
	}
	const loadIcons = (icons, callback) => {
	  const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
	  const sortedIcons = sortIcons(cleanedIcons);
	  if (!sortedIcons.pending.length) {
	    let callCallback = true;
	    if (callback) {
	      setTimeout(() => {
	        if (callCallback) {
	          callback(
	            sortedIcons.loaded,
	            sortedIcons.missing,
	            sortedIcons.pending,
	            emptyCallback
	          );
	        }
	      });
	    }
	    return () => {
	      callCallback = false;
	    };
	  }
	  const newIcons = /* @__PURE__ */ Object.create(null);
	  const sources = [];
	  let lastProvider, lastPrefix;
	  sortedIcons.pending.forEach((icon) => {
	    const { provider, prefix } = icon;
	    if (prefix === lastPrefix && provider === lastProvider) {
	      return;
	    }
	    lastProvider = provider;
	    lastPrefix = prefix;
	    sources.push(getStorage(provider, prefix));
	    const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
	    if (!providerNewIcons[prefix]) {
	      providerNewIcons[prefix] = [];
	    }
	  });
	  sortedIcons.pending.forEach((icon) => {
	    const { provider, prefix, name } = icon;
	    const storage = getStorage(provider, prefix);
	    const pendingQueue = storage.pendingIcons || (storage.pendingIcons = /* @__PURE__ */ new Set());
	    if (!pendingQueue.has(name)) {
	      pendingQueue.add(name);
	      newIcons[provider][prefix].push(name);
	    }
	  });
	  sources.forEach((storage) => {
	    const list = newIcons[storage.provider][storage.prefix];
	    if (list.length) {
	      loadNewIcons(storage, list);
	    }
	  });
	  return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
	};
	const loadIcon = (icon) => {
	  return new Promise((fulfill, reject) => {
	    const iconObj = typeof icon === "string" ? stringToIcon(icon, true) : icon;
	    if (!iconObj) {
	      reject(icon);
	      return;
	    }
	    loadIcons([iconObj || icon], (loaded) => {
	      if (loaded.length && iconObj) {
	        const data = getIconData(iconObj);
	        if (data) {
	          fulfill({
	            ...defaultIconProps,
	            ...data
	          });
	          return;
	        }
	      }
	      reject(icon);
	    });
	  });
	};

	function setCustomIconsLoader(loader, prefix, provider) {
	  getStorage(provider || "", prefix).loadIcons = loader;
	}
	function setCustomIconLoader(loader, prefix, provider) {
	  getStorage(provider || "", prefix).loadIcon = loader;
	}

	function mergeCustomisations(defaults, item) {
	  const result = {
	    ...defaults
	  };
	  for (const key in item) {
	    const value = item[key];
	    const valueType = typeof value;
	    if (key in defaultIconSizeCustomisations) {
	      if (value === null || value && (valueType === "string" || valueType === "number")) {
	        result[key] = value;
	      }
	    } else if (valueType === typeof result[key]) {
	      result[key] = key === "rotate" ? value % 4 : value;
	    }
	  }
	  return result;
	}

	const separator = /[\s,]+/;
	function flipFromString(custom, flip) {
	  flip.split(separator).forEach((str) => {
	    const value = str.trim();
	    switch (value) {
	      case "horizontal":
	        custom.hFlip = true;
	        break;
	      case "vertical":
	        custom.vFlip = true;
	        break;
	    }
	  });
	}

	function rotateFromString(value, defaultValue = 0) {
	  const units = value.replace(/^-?[0-9.]*/, "");
	  function cleanup(value2) {
	    while (value2 < 0) {
	      value2 += 4;
	    }
	    return value2 % 4;
	  }
	  if (units === "") {
	    const num = parseInt(value);
	    return isNaN(num) ? 0 : cleanup(num);
	  } else if (units !== value) {
	    let split = 0;
	    switch (units) {
	      case "%":
	        split = 25;
	        break;
	      case "deg":
	        split = 90;
	    }
	    if (split) {
	      let num = parseFloat(value.slice(0, value.length - units.length));
	      if (isNaN(num)) {
	        return 0;
	      }
	      num = num / split;
	      return num % 1 === 0 ? cleanup(num) : 0;
	    }
	  }
	  return defaultValue;
	}

	function iconToHTML(body, attributes) {
	  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
	  for (const attr in attributes) {
	    renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
	  }
	  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
	}

	function encodeSVGforURL(svg) {
	  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
	}
	function svgToData(svg) {
	  return "data:image/svg+xml," + encodeSVGforURL(svg);
	}
	function svgToURL(svg) {
	  return 'url("' + svgToData(svg) + '")';
	}

	const defaultExtendedIconCustomisations = {
	    ...defaultIconCustomisations,
	    inline: false,
	};

	/**
	 * Default SVG attributes
	 */
	const svgDefaults = {
	    'xmlns': 'http://www.w3.org/2000/svg',
	    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
	    'aria-hidden': true,
	    'role': 'img',
	};
	/**
	 * Style modes
	 */
	const commonProps = {
	    display: 'inline-block',
	};
	const monotoneProps = {
	    'background-color': 'currentColor',
	};
	const coloredProps = {
	    'background-color': 'transparent',
	};
	// Dynamically add common props to variables above
	const propsToAdd = {
	    image: 'var(--svg)',
	    repeat: 'no-repeat',
	    size: '100% 100%',
	};
	const propsToAddTo = {
	    '-webkit-mask': monotoneProps,
	    'mask': monotoneProps,
	    'background': coloredProps,
	};
	for (const prefix in propsToAddTo) {
	    const list = propsToAddTo[prefix];
	    for (const prop in propsToAdd) {
	        list[prefix + '-' + prop] = propsToAdd[prop];
	    }
	}
	/**
	 * Fix size: add 'px' to numbers
	 */
	function fixSize(value) {
	    return value + (value.match(/^[-0-9.]+$/) ? 'px' : '');
	}
	/**
	 * Generate icon from properties
	 */
	function render(
	// Icon must be validated before calling this function
	icon, 
	// Properties
	props) {
	    const customisations = mergeCustomisations(defaultExtendedIconCustomisations, props);
	    // Check mode
	    const mode = props.mode || 'svg';
	    const componentProps = (mode === 'svg' ? { ...svgDefaults } : {});
	    if (icon.body.indexOf('xlink:') === -1) {
	        delete componentProps['xmlns:xlink'];
	    }
	    // Create style if missing
	    let style = typeof props.style === 'string' ? props.style : '';
	    // Get element properties
	    for (let key in props) {
	        const value = props[key];
	        if (value === void 0) {
	            continue;
	        }
	        switch (key) {
	            // Properties to ignore
	            case 'icon':
	            case 'style':
	            case 'onLoad':
	            case 'mode':
	            case 'ssr':
	                break;
	            // Boolean attributes
	            case 'inline':
	            case 'hFlip':
	            case 'vFlip':
	                customisations[key] =
	                    value === true || value === 'true' || value === 1;
	                break;
	            // Flip as string: 'horizontal,vertical'
	            case 'flip':
	                if (typeof value === 'string') {
	                    flipFromString(customisations, value);
	                }
	                break;
	            // Color: copy to style, add extra ';' in case style is missing it
	            case 'color':
	                style =
	                    style +
	                        (style.length > 0 && style.trim().slice(-1) !== ';'
	                            ? ';'
	                            : '') +
	                        'color: ' +
	                        value +
	                        '; ';
	                break;
	            // Rotation as string
	            case 'rotate':
	                if (typeof value === 'string') {
	                    customisations[key] = rotateFromString(value);
	                }
	                else if (typeof value === 'number') {
	                    customisations[key] = value;
	                }
	                break;
	            // Remove aria-hidden
	            case 'ariaHidden':
	            case 'aria-hidden':
	                if (value !== true && value !== 'true') {
	                    delete componentProps['aria-hidden'];
	                }
	                break;
	            default:
	                if (key.slice(0, 3) === 'on:') {
	                    // Svelte event
	                    break;
	                }
	                // Copy missing property if it does not exist in customisations
	                if (defaultExtendedIconCustomisations[key] === void 0) {
	                    componentProps[key] = value;
	                }
	        }
	    }
	    // Generate icon
	    const item = iconToSVG(icon, customisations);
	    const renderAttribs = item.attributes;
	    // Inline display
	    if (customisations.inline) {
	        // Style overrides it
	        style = 'vertical-align: -0.125em; ' + style;
	    }
	    if (mode === 'svg') {
	        // Add icon stuff
	        Object.assign(componentProps, renderAttribs);
	        // Style
	        if (style !== '') {
	            componentProps.style = style;
	        }
	        // Counter for ids based on "id" property to render icons consistently on server and client
	        let localCounter = 0;
	        let id = props.id;
	        if (typeof id === 'string') {
	            // Convert '-' to '_' to avoid errors in animations
	            id = id.replace(/-/g, '_');
	        }
	        // Generate HTML
	        return {
	            svg: true,
	            attributes: componentProps,
	            body: replaceIDs(item.body, id ? () => id + 'ID' + localCounter++ : 'iconifySvelte'),
	        };
	    }
	    // Render <span> with style
	    const { body, width, height } = icon;
	    const useMask = mode === 'mask' ||
	        (mode === 'bg' ? false : body.indexOf('currentColor') !== -1);
	    // Generate SVG
	    const html = iconToHTML(body, {
	        ...renderAttribs,
	        width: width + '',
	        height: height + '',
	    });
	    // Generate style
	    const url = svgToURL(html);
	    const styles = {
	        '--svg': url,
	    };
	    const size = (prop) => {
	        const value = renderAttribs[prop];
	        if (value) {
	            styles[prop] = fixSize(value);
	        }
	    };
	    size('width');
	    size('height');
	    Object.assign(styles, commonProps, useMask ? monotoneProps : coloredProps);
	    let customStyle = '';
	    for (const key in styles) {
	        customStyle += key + ': ' + styles[key] + ';';
	    }
	    componentProps.style = customStyle + style;
	    return {
	        svg: false,
	        attributes: componentProps,
	    };
	}

	/**
	 * Enable cache
	 *
	 * @deprecated No longer used
	 */
	function enableCache(storage) {
	    //
	}
	/**
	 * Disable cache
	 *
	 * @deprecated No longer used
	 */
	function disableCache(storage) {
	    //
	}
	/**
	 * Initialise stuff
	 */
	// Enable short names
	allowSimpleNames(true);
	// Set API module
	setAPIModule('', fetchAPIModule);
	/**
	 * Browser stuff
	 */
	if (typeof document !== 'undefined' && typeof window !== 'undefined') {
	    const _window = window;
	    // Load icons from global "IconifyPreload"
	    if (_window.IconifyPreload !== void 0) {
	        const preload = _window.IconifyPreload;
	        const err = 'Invalid IconifyPreload syntax.';
	        if (typeof preload === 'object' && preload !== null) {
	            (preload instanceof Array ? preload : [preload]).forEach((item) => {
	                try {
	                    if (
	                    // Check if item is an object and not null/array
	                    typeof item !== 'object' ||
	                        item === null ||
	                        item instanceof Array ||
	                        // Check for 'icons' and 'prefix'
	                        typeof item.icons !== 'object' ||
	                        typeof item.prefix !== 'string' ||
	                        // Add icon set
	                        !addCollection(item)) {
	                        console.error(err);
	                    }
	                }
	                catch (e) {
	                    console.error(err);
	                }
	            });
	        }
	    }
	    // Set API from global "IconifyProviders"
	    if (_window.IconifyProviders !== void 0) {
	        const providers = _window.IconifyProviders;
	        if (typeof providers === 'object' && providers !== null) {
	            for (let key in providers) {
	                const err = 'IconifyProviders[' + key + '] is invalid.';
	                try {
	                    const value = providers[key];
	                    if (typeof value !== 'object' ||
	                        !value ||
	                        value.resources === void 0) {
	                        continue;
	                    }
	                    if (!addAPIProvider(key, value)) {
	                        console.error(err);
	                    }
	                }
	                catch (e) {
	                    console.error(err);
	                }
	            }
	        }
	    }
	}
	/**
	 * Check if component needs to be updated
	 */
	function checkIconState(icon, state, mounted, callback, onload) {
	    // Abort loading icon
	    function abortLoading() {
	        if (state.loading) {
	            state.loading.abort();
	            state.loading = null;
	        }
	    }
	    // Icon is an object
	    if (typeof icon === 'object' &&
	        icon !== null &&
	        typeof icon.body === 'string') {
	        // Stop loading
	        state.name = '';
	        abortLoading();
	        return { data: { ...defaultIconProps, ...icon } };
	    }
	    // Invalid icon?
	    let iconName;
	    if (typeof icon !== 'string' ||
	        (iconName = stringToIcon(icon, false, true)) === null) {
	        abortLoading();
	        return null;
	    }
	    // Load icon
	    const data = getIconData(iconName);
	    if (!data) {
	        // Icon data is not available
	        // Do not load icon until component is mounted
	        if (mounted && (!state.loading || state.loading.name !== icon)) {
	            // New icon to load
	            abortLoading();
	            state.name = '';
	            state.loading = {
	                name: icon,
	                abort: loadIcons([iconName], callback),
	            };
	        }
	        return null;
	    }
	    // Icon data is available
	    abortLoading();
	    if (state.name !== icon) {
	        state.name = icon;
	        if (onload && !state.destroyed) {
	            onload(icon);
	        }
	    }
	    // Add classes
	    const classes = ['iconify'];
	    if (iconName.prefix !== '') {
	        classes.push('iconify--' + iconName.prefix);
	    }
	    if (iconName.provider !== '') {
	        classes.push('iconify--' + iconName.provider);
	    }
	    return { data, classes };
	}
	/**
	 * Generate icon
	 */
	function generateIcon(icon, props) {
	    return icon
	        ? render({
	            ...defaultIconProps,
	            ...icon,
	        }, props)
	        : null;
	}
	/**
	 * Internal API
	 */
	const _api = {
	    getAPIConfig,
	    setAPIModule,
	    sendAPIQuery,
	    setFetch,
	    getFetch,
	    listAPIProviders,
	};

	/* node_modules\@iconify\svelte\dist\Icon.svelte generated by Svelte v4.2.20 */
	const file$h = "node_modules\\@iconify\\svelte\\dist\\Icon.svelte";

	// (115:0) {#if data}
	function create_if_block$2(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*data*/ ctx[0].svg) return create_if_block_1$1;
			return create_else_block$2;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(115:0) {#if data}",
			ctx
		});

		return block;
	}

	// (120:1) {:else}
	function create_else_block$2(ctx) {
		let span;
		let span_levels = [/*data*/ ctx[0].attributes];
		let span_data = {};

		for (let i = 0; i < span_levels.length; i += 1) {
			span_data = assign(span_data, span_levels[i]);
		}

		const block = {
			c: function create() {
				span = element("span");
				set_attributes(span, span_data);
				add_location(span, file$h, 120, 2, 2257);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			p: function update(ctx, dirty) {
				set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$2.name,
			type: "else",
			source: "(120:1) {:else}",
			ctx
		});

		return block;
	}

	// (116:1) {#if data.svg}
	function create_if_block_1$1(ctx) {
		let svg;
		let raw_value = /*data*/ ctx[0].body + "";
		let svg_levels = [/*data*/ ctx[0].attributes];
		let svg_data = {};

		for (let i = 0; i < svg_levels.length; i += 1) {
			svg_data = assign(svg_data, svg_levels[i]);
		}

		const block = {
			c: function create() {
				svg = svg_element("svg");
				set_svg_attributes(svg, svg_data);
				add_location(svg, file$h, 116, 2, 2189);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				svg.innerHTML = raw_value;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(116:1) {#if data.svg}",
			ctx
		});

		return block;
	}

	function create_fragment$w(ctx) {
		let if_block_anchor;
		let if_block = /*data*/ ctx[0] && create_if_block$2(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, [dirty]) {
				if (/*data*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$w.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$w($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Icon', slots, []);

		const state = {
			// Last icon name
			name: '',
			// Loading status
			loading: null,
			// Destroyed status
			destroyed: false
		};

		// Mounted status
		let mounted = false;

		// Callback counter
		let counter = 0;

		// Generated data
		let data;

		const onLoad = icon => {
			// Legacy onLoad property
			if (typeof $$props.onLoad === 'function') {
				$$props.onLoad(icon);
			}

			// on:load event
			const dispatch = createEventDispatcher();

			dispatch('load', { icon });
		};

		// Increase counter when loaded to force re-calculation of data
		function loaded() {
			$$invalidate(3, counter++, counter);
		}

		// Force re-render
		onMount(() => {
			$$invalidate(2, mounted = true);
		});

		// Abort loading when component is destroyed
		onDestroy(() => {
			$$invalidate(1, state.destroyed = true, state);

			if (state.loading) {
				state.loading.abort();
				$$invalidate(1, state.loading = null, state);
			}
		});

		$$self.$$set = $$new_props => {
			$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		};

		$$self.$capture_state = () => ({
			enableCache,
			disableCache,
			iconLoaded,
			iconExists: iconLoaded,
			getIcon,
			listIcons,
			addIcon,
			addCollection,
			calculateSize,
			replaceIDs,
			buildIcon: iconToSVG,
			loadIcons,
			loadIcon,
			setCustomIconLoader,
			setCustomIconsLoader,
			addAPIProvider,
			_api,
			onMount,
			onDestroy,
			createEventDispatcher,
			checkIconState,
			generateIcon,
			state,
			mounted,
			counter,
			data,
			onLoad,
			loaded
		});

		$$self.$inject_state = $$new_props => {
			$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
			if ('mounted' in $$props) $$invalidate(2, mounted = $$new_props.mounted);
			if ('counter' in $$props) $$invalidate(3, counter = $$new_props.counter);
			if ('data' in $$props) $$invalidate(0, data = $$new_props.data);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			{
				const isMounted = !!$$props.ssr || mounted;
				const iconData = checkIconState($$props.icon, state, isMounted, loaded, onLoad);
				$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

				if (data && iconData.classes) {
					// Add classes
					$$invalidate(
						0,
						data.attributes['class'] = (typeof $$props['class'] === 'string'
						? $$props['class'] + ' '
						: '') + iconData.classes.join(' '),
						data
					);
				}
			}
		};

		$$props = exclude_internal_props($$props);
		return [data, state, mounted, counter];
	}

	class Icon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Icon",
				options,
				id: create_fragment$w.name
			});
		}
	}

	/* src\components\common\Header.svelte generated by Svelte v4.2.20 */
	const file$g = "src\\components\\common\\Header.svelte";

	function create_fragment$v(ctx) {
		let header;
		let h1;
		let a0;
		let img;
		let img_src_value;
		let t0;
		let ul;
		let li0;
		let icon;
		let t1;
		let a1;
		let t2;
		let t3;
		let li1;
		let a2;
		let t4;
		let t5;
		let li2;
		let a3;
		let t6;
		let t7;
		let li3;
		let a4;
		let t8;
		let current;
		let mounted;
		let dispose;

		icon = new Icon({
				props: {
					icon: "ic:round-live-tv",
					color: "white",
					height: "28"
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				header = element("header");
				h1 = element("h1");
				a0 = element("a");
				img = element("img");
				t0 = space();
				ul = element("ul");
				li0 = element("li");
				create_component(icon.$$.fragment);
				t1 = space();
				a1 = element("a");
				t2 = text$1("현재상영작");
				t3 = space();
				li1 = element("li");
				a2 = element("a");
				t4 = text$1("인기영화");
				t5 = space();
				li2 = element("li");
				a3 = element("a");
				t6 = text$1("개봉예정작");
				t7 = space();
				li3 = element("li");
				a4 = element("a");
				t8 = text$1("높은평점");
				if (!src_url_equal(img.src, img_src_value = "img/moving_logo.svg")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "무빙로고");
				add_location(img, file$g, 27, 107, 744);
				attr_dev(a0, "href", `${CONFIG.BASE_URL}/`);
				toggle_class(a0, "active", /*current*/ ctx[1] === '');
				add_location(a0, file$g, 27, 6, 643);
				add_location(h1, file$g, 27, 2, 639);
				attr_dev(a1, "href", `${CONFIG.BASE_URL}/now`);
				toggle_class(a1, "active", /*current*/ ctx[1] === 'now');
				add_location(a1, file$g, 31, 6, 897);
				add_location(li0, file$g, 29, 4, 819);
				attr_dev(a2, "href", `${CONFIG.BASE_URL}/popular`);
				toggle_class(a2, "active", /*current*/ ctx[1] === 'popular');
				add_location(a2, file$g, 34, 6, 1036);
				add_location(li1, file$g, 33, 4, 1024);
				attr_dev(a3, "href", `${CONFIG.BASE_URL}/upcoming`);
				toggle_class(a3, "active", /*current*/ ctx[1] === 'upcoming');
				add_location(a3, file$g, 37, 6, 1186);
				add_location(li2, file$g, 36, 4, 1174);
				attr_dev(a4, "href", `${CONFIG.BASE_URL}/top`);
				toggle_class(a4, "active", /*current*/ ctx[1] === 'top');
				add_location(a4, file$g, 40, 6, 1340);
				add_location(li3, file$g, 39, 4, 1328);
				add_location(ul, file$g, 28, 2, 799);
				toggle_class(header, "active", /*active*/ ctx[0]);
				add_location(header, file$g, 26, 0, 614);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, header, anchor);
				append_dev(header, h1);
				append_dev(h1, a0);
				append_dev(a0, img);
				append_dev(header, t0);
				append_dev(header, ul);
				append_dev(ul, li0);
				mount_component(icon, li0, null);
				append_dev(li0, t1);
				append_dev(li0, a1);
				append_dev(a1, t2);
				append_dev(ul, t3);
				append_dev(ul, li1);
				append_dev(li1, a2);
				append_dev(a2, t4);
				append_dev(ul, t5);
				append_dev(ul, li2);
				append_dev(li2, a3);
				append_dev(a3, t6);
				append_dev(ul, t7);
				append_dev(ul, li3);
				append_dev(li3, a4);
				append_dev(a4, t8);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(link.call(null, a0)),
						listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false, false),
						listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
						listen_dev(a2, "click", /*click_handler_2*/ ctx[4], false, false, false, false),
						listen_dev(a3, "click", /*click_handler_3*/ ctx[5], false, false, false, false),
						listen_dev(a4, "click", /*click_handler_4*/ ctx[6], false, false, false, false),
						action_destroyer(links.call(null, ul))
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*current*/ 2) {
					toggle_class(a0, "active", /*current*/ ctx[1] === '');
				}

				if (!current || dirty & /*current*/ 2) {
					toggle_class(a1, "active", /*current*/ ctx[1] === 'now');
				}

				if (!current || dirty & /*current*/ 2) {
					toggle_class(a2, "active", /*current*/ ctx[1] === 'popular');
				}

				if (!current || dirty & /*current*/ 2) {
					toggle_class(a3, "active", /*current*/ ctx[1] === 'upcoming');
				}

				if (!current || dirty & /*current*/ 2) {
					toggle_class(a4, "active", /*current*/ ctx[1] === 'top');
				}

				if (!current || dirty & /*active*/ 1) {
					toggle_class(header, "active", /*active*/ ctx[0]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(header);
				}

				destroy_component(icon);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$v.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$v($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Header', slots, []);

		onMount(() => {
			window.addEventListener("scroll", handleScroll);

			/* const timer = setInterval(() => {
	}, 100) */
			return () => {
				/* clearInterval(timer) */
				window.removeEventListener("scroll", handleScroll);
			};
		});

		let active = false;

		const handleScroll = () => {
			let windowTop = window.scrollY;

			if (windowTop > 50) {
				$$invalidate(0, active = true);
				return;
			}

			$$invalidate(0, active = false);
		};

		let current = '';
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
		});

		const click_handler = () => $$invalidate(1, current = '');
		const click_handler_1 = () => $$invalidate(1, current = 'now');
		const click_handler_2 = () => $$invalidate(1, current = 'popular');
		const click_handler_3 = () => $$invalidate(1, current = 'upcoming');
		const click_handler_4 = () => $$invalidate(1, current = 'top');

		$$self.$capture_state = () => ({
			links,
			link,
			Icon,
			onMount,
			active,
			handleScroll,
			current
		});

		$$self.$inject_state = $$props => {
			if ('active' in $$props) $$invalidate(0, active = $$props.active);
			if ('current' in $$props) $$invalidate(1, current = $$props.current);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			active,
			current,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4
		];
	}

	class Header extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Header",
				options,
				id: create_fragment$v.name
			});
		}
	}

	var sns=[{id:1,name:"youtube",img:"img/sns01.svg",url:"https://www.youtube.com"},{id:2,name:"instagram",img:"img/sns02.svg",url:"https://www.instagram.com"},{id:3,name:"twitter",img:"img/sns03.svg",url:"https://twitter.com"},{id:4,name:"facebook",img:"img/sns04.svg",url:"https://www.facebook.com"}];var sns$1 = {sns:sns};

	var SNS = /*#__PURE__*/Object.freeze({
		__proto__: null,
		default: sns$1,
		sns: sns
	});

	/* src\components\common\Footer.svelte generated by Svelte v4.2.20 */
	const file$f = "src\\components\\common\\Footer.svelte";

	function get_each_context$8(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[2] = list[i];
		child_ctx[4] = i;
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i];
		child_ctx[4] = i;
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[4] = i;
		return child_ctx;
	}

	function get_each_context_3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		child_ctx[4] = i;
		return child_ctx;
	}

	// (27:6) {#each footerMenus as footerMenu, index (footerMenu)}
	function create_each_block_3(key_1, ctx) {
		let li;
		let a;

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				li = element("li");
				a = element("a");
				a.textContent = `${/*footerMenu*/ ctx[9]}`;
				attr_dev(a, "href", "#!");
				add_location(a, file$f, 27, 12, 982);
				add_location(li, file$f, 27, 8, 978);
				this.first = li;
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, a);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_3.name,
			type: "each",
			source: "(27:6) {#each footerMenus as footerMenu, index (footerMenu)}",
			ctx
		});

		return block;
	}

	// (35:12) {#each footerText as text, index (text)}
	function create_each_block_2(key_1, ctx) {
		let span;

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				span = element("span");
				span.textContent = `${/*text*/ ctx[7]}`;
				add_location(span, file$f, 35, 14, 1246);
				this.first = span;
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_2.name,
			type: "each",
			source: "(35:12) {#each footerText as text, index (text)}",
			ctx
		});

		return block;
	}

	// (33:8) {#each footerTexts as footerText, index (footerText)}
	function create_each_block_1(key_1, ctx) {
		let p;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let t;
		let each_value_2 = ensure_array_like_dev(/*footerText*/ ctx[5]);
		const get_key = ctx => /*text*/ ctx[7];
		validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

		for (let i = 0; i < each_value_2.length; i += 1) {
			let child_ctx = get_each_context_2(ctx, each_value_2, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
		}

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				p = element("p");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t = space();
				add_location(p, file$f, 33, 10, 1173);
				this.first = p;
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(p, null);
					}
				}

				append_dev(p, t);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (dirty & /*footerTexts*/ 2) {
					each_value_2 = ensure_array_like_dev(/*footerText*/ ctx[5]);
					validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, p, destroy_block, create_each_block_2, t, get_each_context_2);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(33:8) {#each footerTexts as footerText, index (footerText)}",
			ctx
		});

		return block;
	}

	// (43:6) {#each SNS.sns as sns, index (sns)}
	function create_each_block$8(key_1, ctx) {
		let li;
		let a;
		let img;
		let img_src_value;
		let t;

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				li = element("li");
				a = element("a");
				img = element("img");
				t = space();
				if (!src_url_equal(img.src, img_src_value = /*sns*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", /*sns*/ ctx[2].name);
				add_location(img, file$f, 45, 12, 1483);
				attr_dev(a, "href", /*sns*/ ctx[2].url);
				attr_dev(a, "target", "_blank");
				add_location(a, file$f, 44, 10, 1435);
				add_location(li, file$f, 43, 8, 1419);
				this.first = li;
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, a);
				append_dev(a, img);
				append_dev(li, t);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$8.name,
			type: "each",
			source: "(43:6) {#each SNS.sns as sns, index (sns)}",
			ctx
		});

		return block;
	}

	function create_fragment$u(ctx) {
		let footer;
		let div2;
		let div0;
		let h3;
		let t1;
		let a0;
		let t3;
		let div1;
		let ul0;
		let li0;
		let a1;
		let t5;
		let li1;
		let a2;
		let t7;
		let div4;
		let ul1;
		let each_blocks_2 = [];
		let each0_lookup = new Map();
		let t8;
		let div3;
		let ul2;
		let each_blocks_1 = [];
		let each1_lookup = new Map();
		let t9;
		let ul3;
		let each_blocks = [];
		let each2_lookup = new Map();
		let each_value_3 = ensure_array_like_dev(/*footerMenus*/ ctx[0]);
		const get_key = ctx => /*footerMenu*/ ctx[9];
		validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);

		for (let i = 0; i < each_value_3.length; i += 1) {
			let child_ctx = get_each_context_3(ctx, each_value_3, i);
			let key = get_key(child_ctx);
			each0_lookup.set(key, each_blocks_2[i] = create_each_block_3(key, child_ctx));
		}

		let each_value_1 = ensure_array_like_dev(/*footerTexts*/ ctx[1]);
		const get_key_1 = ctx => /*footerText*/ ctx[5];
		validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_1);

		for (let i = 0; i < each_value_1.length; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i);
			let key = get_key_1(child_ctx);
			each1_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
		}

		let each_value = ensure_array_like_dev(sns);
		const get_key_2 = ctx => /*sns*/ ctx[2];
		validate_each_keys(ctx, each_value, get_each_context$8, get_key_2);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$8(ctx, each_value, i);
			let key = get_key_2(child_ctx);
			each2_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
		}

		const block = {
			c: function create() {
				footer = element("footer");
				div2 = element("div");
				div0 = element("div");
				h3 = element("h3");
				h3.textContent = "공지사항";
				t1 = space();
				a0 = element("a");
				a0.textContent = "[안내] 개인정보처리방침 개정 안내 (2023년 11월 3일)";
				t3 = space();
				div1 = element("div");
				ul0 = element("ul");
				li0 = element("li");
				a1 = element("a");
				a1.textContent = "브랜드 바로가기 +";
				t5 = space();
				li1 = element("li");
				a2 = element("a");
				a2.textContent = "그룹 계열사 바로가기 +";
				t7 = space();
				div4 = element("div");
				ul1 = element("ul");

				for (let i = 0; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].c();
				}

				t8 = space();
				div3 = element("div");
				ul2 = element("ul");

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t9 = space();
				ul3 = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				add_location(h3, file$f, 14, 6, 605);
				attr_dev(a0, "href", "#!");
				add_location(a0, file$f, 15, 6, 626);
				attr_dev(div0, "class", "notice");
				add_location(div0, file$f, 13, 4, 577);
				attr_dev(a1, "href", "#!");
				add_location(a1, file$f, 19, 12, 741);
				add_location(li0, file$f, 19, 8, 737);
				attr_dev(a2, "href", "#!");
				add_location(a2, file$f, 20, 12, 787);
				add_location(li1, file$f, 20, 8, 783);
				add_location(ul0, file$f, 18, 6, 723);
				attr_dev(div1, "class", "family");
				add_location(div1, file$f, 17, 4, 695);
				attr_dev(div2, "class", "f_top");
				add_location(div2, file$f, 12, 2, 552);
				attr_dev(ul1, "class", "f_nav");
				add_location(ul1, file$f, 25, 4, 889);
				attr_dev(ul2, "class", "f_title");
				add_location(ul2, file$f, 31, 6, 1078);
				attr_dev(div3, "class", "f_bottom");
				add_location(div3, file$f, 30, 4, 1048);
				attr_dev(ul3, "class", "sns");
				add_location(ul3, file$f, 41, 4, 1350);
				attr_dev(div4, "class", "f_bottom");
				add_location(div4, file$f, 24, 2, 861);
				add_location(footer, file$f, 11, 0, 540);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, footer, anchor);
				append_dev(footer, div2);
				append_dev(div2, div0);
				append_dev(div0, h3);
				append_dev(div0, t1);
				append_dev(div0, a0);
				append_dev(div2, t3);
				append_dev(div2, div1);
				append_dev(div1, ul0);
				append_dev(ul0, li0);
				append_dev(li0, a1);
				append_dev(ul0, t5);
				append_dev(ul0, li1);
				append_dev(li1, a2);
				append_dev(footer, t7);
				append_dev(footer, div4);
				append_dev(div4, ul1);

				for (let i = 0; i < each_blocks_2.length; i += 1) {
					if (each_blocks_2[i]) {
						each_blocks_2[i].m(ul1, null);
					}
				}

				append_dev(div4, t8);
				append_dev(div4, div3);
				append_dev(div3, ul2);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(ul2, null);
					}
				}

				append_dev(div4, t9);
				append_dev(div4, ul3);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul3, null);
					}
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*footerMenus*/ 1) {
					each_value_3 = ensure_array_like_dev(/*footerMenus*/ ctx[0]);
					validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);
					each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key, 1, ctx, each_value_3, each0_lookup, ul1, destroy_block, create_each_block_3, null, get_each_context_3);
				}

				if (dirty & /*footerTexts*/ 2) {
					each_value_1 = ensure_array_like_dev(/*footerTexts*/ ctx[1]);
					validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_1);
					each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_1, 1, ctx, each_value_1, each1_lookup, ul2, destroy_block, create_each_block_1, null, get_each_context_1);
				}
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(footer);
				}

				for (let i = 0; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d();
				}

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d();
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$u.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$u($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Footer', slots, []);
		const footerMenus = ['고객센터', '이용약관', '개인정보처리방침', '청소년 보호정책', '법적고지', '이벤트', '인재채용'];

		const footerTexts = [
			[
				'대표이사 : OSSAM',
				'사업자정보확인',
				'사업자등록번호 : 000-00-00000',
				'통신판매신고번호 : 2023-서울마포-0000호'
			],
			['사업장 : 서울특별시 마포구 상암산로 00, DMC디지털큐브 00층(상암동)', '호스팅사업자 : 엠브이올리브네트웍스(주)'],
			[
				'고객문의 바로가기',
				'대표메일 : mving@google.com',
				'고객센터 : 0000-0000 (평일/주말 09시~18시, 공휴일 휴무)'
			],
			[
				'ooo 시청자 상담실 (편성 문의 및 시청자 의견) : 000-000-0000',
				'Moving 고객센터(방송편성문의) : 0000-0000'
			]
		];

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ SNS, footerMenus, footerTexts });
		return [footerMenus, footerTexts];
	}

	class Footer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Footer",
				options,
				id: create_fragment$u.name
			});
		}
	}

	/* src\components\common\Error.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$9 } = globals;
	const file$e = "src\\components\\common\\Error.svelte";

	function create_fragment$t(ctx) {
		let div;
		let icon;
		let t0;
		let h3;
		let t1;
		let span;
		let t3;
		let t4;
		let p0;
		let t5;
		let br0;
		let t6;
		let br1;
		let t7;
		let t8;
		let a0;
		let t10;
		let p1;
		let t12;
		let ul;
		let li;
		let a1;
		let current;
		let mounted;
		let dispose;

		icon = new Icon({
				props: { icon: "jam:alert" },
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(icon.$$.fragment);
				t0 = space();
				h3 = element("h3");
				t1 = text$1("죄송합니다. ");
				span = element("span");
				span.textContent = "시스템 에러";
				t3 = text$1("입니다.");
				t4 = space();
				p0 = element("p");
				t5 = text$1("현재 시스템 오류가 발생했습니다. ");
				br0 = element("br");
				t6 = text$1("\r\n      새로 고침 단추를 클릭하거나 나중에 다시 시도하십시오. ");
				br1 = element("br");
				t7 = text$1("\r\n      주소 표시줄에 페이지 주소를 입력하셨다면 올바르게 입력되었는지 확인하십시오.");
				t8 = space();
				a0 = element("a");
				a0.textContent = "고객센터문의하기 >";
				t10 = space();
				p1 = element("p");
				p1.textContent = "전화 : 0000-0000(평일 09시~18시) / 이메일 moving@gmail.com";
				t12 = space();
				ul = element("ul");
				li = element("li");
				a1 = element("a");
				a1.textContent = "메인페이지로 이동";
				attr_dev(span, "class", "red");
				add_location(span, file$e, 6, 13, 169);
				add_location(h3, file$e, 6, 2, 158);
				add_location(br0, file$e, 8, 25, 265);
				add_location(br1, file$e, 9, 37, 310);
				attr_dev(p0, "class", "basic_explain");
				add_location(p0, file$e, 7, 2, 213);
				attr_dev(a0, "href", "#!");
				add_location(a0, file$e, 12, 2, 378);
				attr_dev(p1, "class", "inquiry_explain");
				add_location(p1, file$e, 13, 2, 412);
				attr_dev(a1, "href", "/svelte4-basic-moving/");
				add_location(a1, file$e, 15, 8, 527);
				add_location(li, file$e, 15, 4, 523);
				attr_dev(ul, "class", "page_btn");
				add_location(ul, file$e, 14, 2, 496);
				attr_dev(div, "class", "error_box");
				add_location(div, file$e, 4, 0, 102);
			},
			l: function claim(nodes) {
				throw new Error_1$9("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(icon, div, null);
				append_dev(div, t0);
				append_dev(div, h3);
				append_dev(h3, t1);
				append_dev(h3, span);
				append_dev(h3, t3);
				append_dev(div, t4);
				append_dev(div, p0);
				append_dev(p0, t5);
				append_dev(p0, br0);
				append_dev(p0, t6);
				append_dev(p0, br1);
				append_dev(p0, t7);
				append_dev(div, t8);
				append_dev(div, a0);
				append_dev(div, t10);
				append_dev(div, p1);
				append_dev(div, t12);
				append_dev(div, ul);
				append_dev(ul, li);
				append_dev(li, a1);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(link.call(null, a1));
					mounted = true;
				}
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(icon);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$t.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$t($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Error', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Icon, link });
		return [];
	}

	let Error$1 = class Error extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Error",
				options,
				id: create_fragment$t.name
			});
		}
	};

	const durationUnitRegex = /[a-zA-Z]/;
	const range = (size, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);
	// export const characterRange = (startChar, endChar) =>
	//   String.fromCharCode(
	//     ...range(
	//       endChar.charCodeAt(0) - startChar.charCodeAt(0),
	//       startChar.charCodeAt(0)
	//     )
	//   );
	// export const zip = (arr, ...arrs) =>
	//   arr.map((val, i) => arrs.reduce((list, curr) => [...list, curr[i]], [val]));

	/* node_modules\svelte-loading-spinners\SyncLoader.svelte generated by Svelte v4.2.20 */
	const file$d = "node_modules\\svelte-loading-spinners\\SyncLoader.svelte";

	function get_each_context$7(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		return child_ctx;
	}

	// (12:1) {#each range(3, 1) as i}
	function create_each_block$7(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				attr_dev(div, "class", "dot svelte-14x3x60");
				set_style(div, "--dotSize", +/*size*/ ctx[3] * 0.25 + /*unit*/ ctx[1]);
				set_style(div, "--color", /*color*/ ctx[0]);
				set_style(div, "animation-delay", /*i*/ ctx[7] * (+/*durationNum*/ ctx[6] / 10) + /*durationUnit*/ ctx[5]);
				toggle_class(div, "pause-animation", /*pause*/ ctx[4]);
				add_location(div, file$d, 12, 2, 433);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*size, unit*/ 10) {
					set_style(div, "--dotSize", +/*size*/ ctx[3] * 0.25 + /*unit*/ ctx[1]);
				}

				if (dirty & /*color*/ 1) {
					set_style(div, "--color", /*color*/ ctx[0]);
				}

				if (dirty & /*pause*/ 16) {
					toggle_class(div, "pause-animation", /*pause*/ ctx[4]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$7.name,
			type: "each",
			source: "(12:1) {#each range(3, 1) as i}",
			ctx
		});

		return block;
	}

	function create_fragment$s(ctx) {
		let div;
		let each_value = ensure_array_like_dev(range(3, 1));
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, "class", "wrapper svelte-14x3x60");
				set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
				set_style(div, "--duration", /*duration*/ ctx[2]);
				add_location(div, file$d, 10, 0, 330);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*size, unit, color, durationNum, durationUnit, pause*/ 123) {
					each_value = ensure_array_like_dev(range(3, 1));
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$7(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$7(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*size, unit*/ 10) {
					set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
				}

				if (dirty & /*duration*/ 4) {
					set_style(div, "--duration", /*duration*/ ctx[2]);
				}
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$s.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$s($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('SyncLoader', slots, []);
		let { color = '#FF3E00' } = $$props;
		let { unit = 'px' } = $$props;
		let { duration = '0.6s' } = $$props;
		let { size = '60' } = $$props;
		let { pause = false } = $$props;
		let durationUnit = duration.match(durationUnitRegex)?.[0] ?? 's';
		let durationNum = duration.replace(durationUnitRegex, '');
		const writable_props = ['color', 'unit', 'duration', 'size', 'pause'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SyncLoader> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
			if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
			if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
			if ('size' in $$props) $$invalidate(3, size = $$props.size);
			if ('pause' in $$props) $$invalidate(4, pause = $$props.pause);
		};

		$$self.$capture_state = () => ({
			range,
			durationUnitRegex,
			color,
			unit,
			duration,
			size,
			pause,
			durationUnit,
			durationNum
		});

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
			if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
			if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
			if ('size' in $$props) $$invalidate(3, size = $$props.size);
			if ('pause' in $$props) $$invalidate(4, pause = $$props.pause);
			if ('durationUnit' in $$props) $$invalidate(5, durationUnit = $$props.durationUnit);
			if ('durationNum' in $$props) $$invalidate(6, durationNum = $$props.durationNum);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color, unit, duration, size, pause, durationUnit, durationNum];
	}

	class SyncLoader extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$s, create_fragment$s, safe_not_equal, {
				color: 0,
				unit: 1,
				duration: 2,
				size: 3,
				pause: 4
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "SyncLoader",
				options,
				id: create_fragment$s.name
			});
		}

		get color() {
			throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get unit() {
			throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set unit(value) {
			throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get duration() {
			throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set duration(value) {
			throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get size() {
			throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set size(value) {
			throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get pause() {
			throw new Error("<SyncLoader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set pause(value) {
			throw new Error("<SyncLoader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\common\MainLoading.svelte generated by Svelte v4.2.20 */
	const file$c = "src\\components\\common\\MainLoading.svelte";

	function create_fragment$r(ctx) {
		let main;
		let div;
		let syncloader;
		let t;
		let img;
		let img_src_value;
		let current;

		syncloader = new SyncLoader({
				props: {
					size: "60",
					color: "#01b4e4",
					unit: "px",
					duration: "1s"
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				main = element("main");
				div = element("div");
				create_component(syncloader.$$.fragment);
				t = space();
				img = element("img");
				attr_dev(div, "class", "loading_bar");
				add_location(div, file$c, 4, 2, 87);
				if (!src_url_equal(img.src, img_src_value = "img/main_loading.png")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "메인로딩이미지");
				attr_dev(img, "class", "loading_img");
				add_location(img, file$c, 7, 2, 196);
				add_location(main, file$c, 3, 0, 77);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				append_dev(main, div);
				mount_component(syncloader, div, null);
				append_dev(main, t);
				append_dev(main, img);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(syncloader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(syncloader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				destroy_component(syncloader);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$r.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$r($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('MainLoading', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainLoading> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ SyncLoader });
		return [];
	}

	class MainLoading extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "MainLoading",
				options,
				id: create_fragment$r.name
			});
		}
	}

	/* src\components\main\MainList.svelte generated by Svelte v4.2.20 */
	const file$b = "src\\components\\main\\MainList.svelte";

	function get_each_context$6(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (53:10) {:else}
	function create_else_block$1(ctx) {
		let t_value = /*main*/ ctx[7].overview + "";
		let t;

		const block = {
			c: function create() {
				t = text$1(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*mains*/ 1 && t_value !== (t_value = /*main*/ ctx[7].overview + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(53:10) {:else}",
			ctx
		});

		return block;
	}

	// (51:10) {#if main.overview === ''}
	function create_if_block$1(ctx) {
		let t0;
		let t1_value = /*main*/ ctx[7].title + "";
		let t1;
		let t2;

		const block = {
			c: function create() {
				t0 = text$1("새롭게 개봉한 [");
				t1 = text$1(t1_value);
				t2 = text$1("]를 만나볼까요?");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, t2, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*mains*/ 1 && t1_value !== (t1_value = /*main*/ ctx[7].title + "")) set_data_dev(t1, t1_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(51:10) {#if main.overview === ''}",
			ctx
		});

		return block;
	}

	// (47:6) <SwiperSlide>
	function create_default_slot_1$5(ctx) {
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let h3;
		let t1_value = /*main*/ ctx[7].title + "";
		let t1;
		let t2;
		let p;
		let t3;
		let a;
		let t4;
		let a_href_value;
		let t5;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*main*/ ctx[7].overview === '') return create_if_block$1;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				img = element("img");
				t0 = space();
				h3 = element("h3");
				t1 = text$1(t1_value);
				t2 = space();
				p = element("p");
				if_block.c();
				t3 = space();
				a = element("a");
				t4 = text$1("자세히보기");
				t5 = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*main*/ ctx[7].backdrop_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*main*/ ctx[7].title);
				add_location(img, file$b, 47, 8, 1129);
				add_location(h3, file$b, 48, 8, 1227);
				add_location(p, file$b, 49, 8, 1258);
				attr_dev(a, "href", a_href_value = `${CONFIG.BASE_URL}/now/${/*main*/ ctx[7].id}`);
				add_location(a, file$b, 56, 8, 1432);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, h3, anchor);
				append_dev(h3, t1);
				insert_dev(target, t2, anchor);
				insert_dev(target, p, anchor);
				if_block.m(p, null);
				insert_dev(target, t3, anchor);
				insert_dev(target, a, anchor);
				append_dev(a, t4);
				insert_dev(target, t5, anchor);

				if (!mounted) {
					dispose = action_destroyer(link.call(null, a));
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*mains*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*main*/ ctx[7].backdrop_path}`)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*mains*/ 1 && img_alt_value !== (img_alt_value = /*main*/ ctx[7].title)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if (dirty & /*mains*/ 1 && t1_value !== (t1_value = /*main*/ ctx[7].title + "")) set_data_dev(t1, t1_value);

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(p, null);
					}
				}

				if (dirty & /*mains*/ 1 && a_href_value !== (a_href_value = `${CONFIG.BASE_URL}/now/${/*main*/ ctx[7].id}`)) {
					attr_dev(a, "href", a_href_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(img);
					detach_dev(t0);
					detach_dev(h3);
					detach_dev(t2);
					detach_dev(p);
					detach_dev(t3);
					detach_dev(a);
					detach_dev(t5);
				}

				if_block.d();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$5.name,
			type: "slot",
			source: "(47:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (46:4) {#each mains as main, index (main)}
	function create_each_block$6(key_1, ctx) {
		let first;
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$5] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				create_component(swiperslide.$$.fragment);
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const swiperslide_changes = {};

				if (dirty & /*$$scope, mains*/ 1025) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
				}

				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$6.name,
			type: "each",
			source: "(46:4) {#each mains as main, index (main)}",
			ctx
		});

		return block;
	}

	// (35:2) <Swiper      modules={[Autoplay, Pagination, EffectFade]}      pagination={{clickable: true}}      effect={'fade'}      autoplay={{        delay: 3000,        ableOnInteraction: false,      }}      class="mainSwiper"      bind:this={swiper}    >
	function create_default_slot$6(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*mains*/ ctx[0]);
		const get_key = ctx => /*main*/ ctx[7];
		validate_each_keys(ctx, each_value, get_each_context$6, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$6(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*CONFIG, mains*/ 1) {
					each_value = ensure_array_like_dev(/*mains*/ ctx[0]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context$6, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$6, each_1_anchor, get_each_context$6);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$6.name,
			type: "slot",
			source: "(35:2) <Swiper      modules={[Autoplay, Pagination, EffectFade]}      pagination={{clickable: true}}      effect={'fade'}      autoplay={{        delay: 3000,        ableOnInteraction: false,      }}      class=\\\"mainSwiper\\\"      bind:this={swiper}    >",
			ctx
		});

		return block;
	}

	function create_fragment$q(ctx) {
		let main_1;
		let swiper_1;
		let t0;
		let div;
		let button0;
		let t1;
		let button1;
		let current;
		let mounted;
		let dispose;

		let swiper_1_props = {
			modules: [Autoplay, Pagination, EffectFade],
			pagination: { clickable: true },
			effect: 'fade',
			autoplay: { delay: 3000, ableOnInteraction: false },
			class: "mainSwiper",
			$$slots: { default: [create_default_slot$6] },
			$$scope: { ctx }
		};

		swiper_1 = new Swiper_1({ props: swiper_1_props, $$inline: true });
		/*swiper_1_binding*/ ctx[5](swiper_1);

		const block = {
			c: function create() {
				main_1 = element("main");
				create_component(swiper_1.$$.fragment);
				t0 = space();
				div = element("div");
				button0 = element("button");
				button0.innerHTML = ``;
				t1 = space();
				button1 = element("button");
				button1.innerHTML = ``;
				attr_dev(button0, "class", "btn_pause");
				toggle_class(button0, "active", /*cnt*/ ctx[2] === true);
				add_location(button0, file$b, 61, 4, 1584);
				attr_dev(button1, "class", "btn_play");
				toggle_class(button1, "active", /*cnt*/ ctx[2] === false);
				add_location(button1, file$b, 67, 4, 1711);
				attr_dev(div, "class", "swiper-playpause");
				add_location(div, file$b, 60, 2, 1548);
				add_location(main_1, file$b, 33, 0, 802);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main_1, anchor);
				mount_component(swiper_1, main_1, null);
				append_dev(main_1, t0);
				append_dev(main_1, div);
				append_dev(div, button0);
				append_dev(div, t1);
				append_dev(div, button1);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*onHandleClick*/ ctx[3], false, false, false, false),
						listen_dev(button1, "click", /*onHandleClick*/ ctx[3], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const swiper_1_changes = {};

				if (dirty & /*$$scope, mains*/ 1025) {
					swiper_1_changes.$$scope = { dirty, ctx };
				}

				swiper_1.$set(swiper_1_changes);

				if (!current || dirty & /*cnt*/ 4) {
					toggle_class(button0, "active", /*cnt*/ ctx[2] === true);
				}

				if (!current || dirty & /*cnt*/ 4) {
					toggle_class(button1, "active", /*cnt*/ ctx[2] === false);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiper_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiper_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main_1);
				}

				/*swiper_1_binding*/ ctx[5](null);
				destroy_component(swiper_1);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$q.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$q($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('MainList', slots, []);
		let { datas } = $$props;
		let mains = [];
		const random = Math.floor(Math.random() * 15);
		mains = datas.slice(random, random + 5);
		let swiper;

		onMount(() => {
			const swiperinstance = document.querySelector('.mainSwiper').swiper;
			$$invalidate(1, swiper = swiperinstance);
		});

		let cnt = false;

		const onHandleClick = () => {
			if (cnt) {
				swiper.autoplay.start();
				return;
			}

			swiper.autoplay.stop();
			$$invalidate(2, cnt = !cnt);
		};

		$$self.$$.on_mount.push(function () {
			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<MainList> was created without expected prop 'datas'");
			}
		});

		const writable_props = ['datas'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainList> was created with unknown prop '${key}'`);
		});

		function swiper_1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				swiper = $$value;
				$$invalidate(1, swiper);
			});
		}

		$$self.$$set = $$props => {
			if ('datas' in $$props) $$invalidate(4, datas = $$props.datas);
		};

		$$self.$capture_state = () => ({
			onMount,
			link,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Autoplay,
			Pagination,
			EffectFade,
			datas,
			mains,
			random,
			swiper,
			cnt,
			onHandleClick
		});

		$$self.$inject_state = $$props => {
			if ('datas' in $$props) $$invalidate(4, datas = $$props.datas);
			if ('mains' in $$props) $$invalidate(0, mains = $$props.mains);
			if ('swiper' in $$props) $$invalidate(1, swiper = $$props.swiper);
			if ('cnt' in $$props) $$invalidate(2, cnt = $$props.cnt);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [mains, swiper, cnt, onHandleClick, datas, swiper_1_binding];
	}

	class MainList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$q, create_fragment$q, safe_not_equal, { datas: 4 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "MainList",
				options,
				id: create_fragment$q.name
			});
		}

		get datas() {
			throw new Error("<MainList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<MainList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const setDatas = (url) => {
	  const options = {
	    method: 'GET',
	    url,
	    params: {
	      language: 'ko',
	      page: '1'
	    },
	    headers: {
	      accept: 'application/json',
	      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
	    }
	  };
	  const getDatas = async () => {
	    try {
	      const res = await axios$1.request(options);
	      return res;
	    } catch (error) {
	      throw new Error(errror)
	    }
	  };
	  const { subscribe } = writable(getDatas());
	  return {
	    subscribe,
	  }
	};

	const setGenres = (url) => {
	  const options = {
	    method: 'GET',
	    url,
	    params: {
	      language: 'ko',
	    },
	    headers: {
	      accept: 'application/json',
	      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNDdjYzYzMzBhZGRlNDk4OWEzMTRjYTk4NjZjNWM0YSIsIm5iZiI6MTcwOTA0ODU3OC4xMTM5OTk4LCJzdWIiOiI2NWRlMDMwMmE4OTRkNjAxODcwZDgzYjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Uq_kyfrmNB3wyRJIQKmw7L9MI0E4sdx3al8c_N1t8QU'
	    }
	  };
	  const getGenres = async () => {
	    try {
	      const res = await axios$1.request(options);
	      return res;
	    } catch (error) {
	      throw new Error(errror)
	    }
	  };
	  const { subscribe } = writable(getGenres());
	  return {
	    subscribe,
	  }
	};

	const BASIC_URL = "https://api.themoviedb.org/3/movie/";

	const nows = setDatas(`${BASIC_URL}now_playing`);
	const populars = setDatas(`${BASIC_URL}popular`);
	const tops = setDatas(`${BASIC_URL}top_rated`);
	const upcomings = setDatas(`${BASIC_URL}upcoming`);
	const genres = setGenres('https://api.themoviedb.org/3/genre/movie/list');

	/* src\containers\MainListContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$8 } = globals;

	// (13:0) {:catch error}
	function create_catch_block$8(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$8.name,
			type: "catch",
			source: "(13:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (11:0) {:then value}
	function create_then_block$8(ctx) {
		let mainlist;
		let current;

		mainlist = new MainList({
				props: { datas: /*value*/ ctx[2].data.results },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(mainlist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainlist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainlist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainlist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainlist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$8.name,
			type: "then",
			source: "(11:0) {:then value}",
			ctx
		});

		return block;
	}

	// (9:16)     <MainLoading/>  {:then value}
	function create_pending_block$8(ctx) {
		let mainloading;
		let current;
		mainloading = new MainLoading({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainloading.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainloading, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainloading.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainloading.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainloading, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$8.name,
			type: "pending",
			source: "(9:16)     <MainLoading/>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$p(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$8,
			then: create_then_block$8,
			catch: create_catch_block$8,
			value: 2,
			error: 3,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$8("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$p.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$p($$self, $$props, $$invalidate) {
		let $nows;
		validate_store(nows, 'nows');
		component_subscribe($$self, nows, $$value => $$invalidate(1, $nows = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('MainListContainer', slots, []);
		const promise = $nows;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainListContainer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Error: Error$1,
			MainLoading,
			MainList,
			nows,
			promise,
			$nows
		});

		return [promise];
	}

	class MainListContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "MainListContainer",
				options,
				id: create_fragment$p.name
			});
		}
	}

	/* src\components\common\LoadingList.svelte generated by Svelte v4.2.20 */
	const file$a = "src\\components\\common\\LoadingList.svelte";

	function get_each_context$5(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		child_ctx[3] = i;
		return child_ctx;
	}

	// (20:6) <SwiperSlide>
	function create_default_slot_1$4(ctx) {
		let figure;
		let div;
		let t0;
		let figcaption;
		let t1;

		const block = {
			c: function create() {
				figure = element("figure");
				div = element("div");
				t0 = space();
				figcaption = element("figcaption");
				t1 = space();
				attr_dev(div, "class", "img_wrap");
				add_location(div, file$a, 21, 10, 535);
				add_location(figcaption, file$a, 22, 10, 575);
				attr_dev(figure, "class", "ex");
				add_location(figure, file$a, 20, 8, 504);
			},
			m: function mount(target, anchor) {
				insert_dev(target, figure, anchor);
				append_dev(figure, div);
				append_dev(figure, t0);
				append_dev(figure, figcaption);
				insert_dev(target, t1, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(figure);
					detach_dev(t1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$4.name,
			type: "slot",
			source: "(20:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (19:4) {#each loadingArray as loading, index}
	function create_each_block$5(ctx) {
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$4] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(swiperslide.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const swiperslide_changes = {};

				if (dirty & /*$$scope*/ 16) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$5.name,
			type: "each",
			source: "(19:4) {#each loadingArray as loading, index}",
			ctx
		});

		return block;
	}

	// (13:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >
	function create_default_slot$5(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*loadingArray*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$5.name,
			type: "slot",
			source: "(13:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >",
			ctx
		});

		return block;
	}

	function create_fragment$o(ctx) {
		let section;
		let h2;
		let t1;
		let swiper;
		let current;

		swiper = new Swiper_1({
				props: {
					modules: [Navigation],
					spaceBetween: 10,
					sildesPerView: 7.2,
					navigation: true,
					$$slots: { default: [create_default_slot$5] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				section = element("section");
				h2 = element("h2");
				h2.textContent = "예시 타이틀";
				t1 = space();
				create_component(swiper.$$.fragment);
				attr_dev(h2, "class", "ex");
				add_location(h2, file$a, 11, 2, 288);
				attr_dev(section, "class", "list_box");
				add_location(section, file$a, 10, 0, 258);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				append_dev(section, h2);
				append_dev(section, t1);
				mount_component(swiper, section, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const swiper_changes = {};

				if (dirty & /*$$scope*/ 16) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}

				destroy_component(swiper);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$o.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$o($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('LoadingList', slots, []);
		let loadingArray = [];
		for (let i = 0; i < 20; i++) loadingArray.push("");
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoadingList> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Navigation,
			loadingArray
		});

		$$self.$inject_state = $$props => {
			if ('loadingArray' in $$props) $$invalidate(0, loadingArray = $$props.loadingArray);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [loadingArray];
	}

	class LoadingList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "LoadingList",
				options,
				id: create_fragment$o.name
			});
		}
	}

	/* src\components\common\H2Title.svelte generated by Svelte v4.2.20 */
	const file$9 = "src\\components\\common\\H2Title.svelte";

	function create_fragment$n(ctx) {
		let h2;
		let t;

		const block = {
			c: function create() {
				h2 = element("h2");
				t = text$1(/*name*/ ctx[0]);
				add_location(h2, file$9, 3, 0, 41);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
				append_dev(h2, t);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(h2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$n.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$n($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('H2Title', slots, []);
		let { name } = $$props;

		$$self.$$.on_mount.push(function () {
			if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
				console.warn("<H2Title> was created without expected prop 'name'");
			}
		});

		const writable_props = ['name'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<H2Title> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('name' in $$props) $$invalidate(0, name = $$props.name);
		};

		$$self.$capture_state = () => ({ name });

		$$self.$inject_state = $$props => {
			if ('name' in $$props) $$invalidate(0, name = $$props.name);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [name];
	}

	class H2Title extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$n, create_fragment$n, safe_not_equal, { name: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "H2Title",
				options,
				id: create_fragment$n.name
			});
		}

		get name() {
			throw new Error("<H2Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set name(value) {
			throw new Error("<H2Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\sub\NowList.svelte generated by Svelte v4.2.20 */
	const file$8 = "src\\components\\sub\\NowList.svelte";

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		child_ctx[3] = i;
		return child_ctx;
	}

	// (22:6) <SwiperSlide>
	function create_default_slot_1$3(ctx) {
		let a;
		let figure;
		let div;
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let figcaption;
		let t1_value = /*now*/ ctx[1].title + "";
		let t1;
		let a_href_value;
		let t2;

		const block = {
			c: function create() {
				a = element("a");
				figure = element("figure");
				div = element("div");
				img = element("img");
				t0 = space();
				figcaption = element("figcaption");
				t1 = text$1(t1_value);
				t2 = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*now*/ ctx[1].title);
				add_location(img, file$8, 25, 14, 671);
				attr_dev(div, "class", "img_wrap");
				add_location(div, file$8, 24, 12, 633);
				add_location(figcaption, file$8, 27, 12, 789);
				add_location(figure, file$8, 23, 10, 611);
				attr_dev(a, "href", a_href_value = `${CONFIG.BASE_URL}/now/${/*now*/ ctx[1].id}`);
				add_location(a, file$8, 22, 8, 552);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, figure);
				append_dev(figure, div);
				append_dev(div, img);
				append_dev(figure, t0);
				append_dev(figure, figcaption);
				append_dev(figcaption, t1);
				insert_dev(target, t2, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*datas*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*datas*/ 1 && img_alt_value !== (img_alt_value = /*now*/ ctx[1].title)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if (dirty & /*datas*/ 1 && t1_value !== (t1_value = /*now*/ ctx[1].title + "")) set_data_dev(t1, t1_value);

				if (dirty & /*datas*/ 1 && a_href_value !== (a_href_value = `${CONFIG.BASE_URL}/now/${/*now*/ ctx[1].id}`)) {
					attr_dev(a, "href", a_href_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$3.name,
			type: "slot",
			source: "(22:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (21:4) {#each datas as now, index (now)}
	function create_each_block$4(key_1, ctx) {
		let first;
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$3] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				create_component(swiperslide.$$.fragment);
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const swiperslide_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
				}

				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$4.name,
			type: "each",
			source: "(21:4) {#each datas as now, index (now)}",
			ctx
		});

		return block;
	}

	// (15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >
	function create_default_slot$4(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
		const get_key = ctx => /*now*/ ctx[1];
		validate_each_keys(ctx, each_value, get_each_context$4, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$4(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*CONFIG, datas*/ 1) {
					each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context$4, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$4, each_1_anchor, get_each_context$4);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$4.name,
			type: "slot",
			source: "(15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >",
			ctx
		});

		return block;
	}

	function create_fragment$m(ctx) {
		let section;
		let h2title;
		let t;
		let swiper;
		let current;
		let mounted;
		let dispose;

		h2title = new H2Title({
				props: { name: "새로 개봉한 현재 상영작" },
				$$inline: true
			});

		swiper = new Swiper_1({
				props: {
					modules: [Navigation],
					spaceBetween: 10,
					sildesPerView: 7.2,
					navigation: true,
					$$slots: { default: [create_default_slot$4] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				section = element("section");
				create_component(h2title.$$.fragment);
				t = space();
				create_component(swiper.$$.fragment);
				attr_dev(section, "class", "list_box");
				add_location(section, file$8, 12, 0, 296);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				mount_component(h2title, section, null);
				append_dev(section, t);
				mount_component(swiper, section, null);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(links.call(null, section));
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const swiper_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(h2title.$$.fragment, local);
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(h2title.$$.fragment, local);
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}

				destroy_component(h2title);
				destroy_component(swiper);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$m.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$m($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NowList', slots, []);
		let { datas } = $$props;

		$$self.$$.on_mount.push(function () {
			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<NowList> was created without expected prop 'datas'");
			}
		});

		const writable_props = ['datas'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NowList> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		$$self.$capture_state = () => ({
			H2Title,
			links,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Navigation,
			datas
		});

		$$self.$inject_state = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [datas];
	}

	class NowList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$m, create_fragment$m, safe_not_equal, { datas: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NowList",
				options,
				id: create_fragment$m.name
			});
		}

		get datas() {
			throw new Error("<NowList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<NowList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\NowListContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$7 } = globals;

	// (13:0) {:catch error}
	function create_catch_block$7(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$7.name,
			type: "catch",
			source: "(13:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (11:0) {:then value}
	function create_then_block$7(ctx) {
		let nowlist;
		let current;

		nowlist = new NowList({
				props: { datas: /*value*/ ctx[2].data.results },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(nowlist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(nowlist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(nowlist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(nowlist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(nowlist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$7.name,
			type: "then",
			source: "(11:0) {:then value}",
			ctx
		});

		return block;
	}

	// (9:16)     <LoadingList/>  {:then value}
	function create_pending_block$7(ctx) {
		let loadinglist;
		let current;
		loadinglist = new LoadingList({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loadinglist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loadinglist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(loadinglist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loadinglist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loadinglist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$7.name,
			type: "pending",
			source: "(9:16)     <LoadingList/>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$l(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$7,
			then: create_then_block$7,
			catch: create_catch_block$7,
			value: 2,
			error: 3,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$7("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$l.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$l($$self, $$props, $$invalidate) {
		let $nows;
		validate_store(nows, 'nows');
		component_subscribe($$self, nows, $$value => $$invalidate(1, $nows = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NowListContainer', slots, []);
		const promise = $nows;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NowListContainer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Error: Error$1,
			LoadingList,
			NowList,
			nows,
			promise,
			$nows
		});

		return [promise];
	}

	class NowListContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NowListContainer",
				options,
				id: create_fragment$l.name
			});
		}
	}

	/* src\components\sub\PopularList.svelte generated by Svelte v4.2.20 */
	const file$7 = "src\\components\\sub\\PopularList.svelte";

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		child_ctx[3] = i;
		return child_ctx;
	}

	// (22:6) <SwiperSlide>
	function create_default_slot_1$2(ctx) {
		let a;
		let figure;
		let div;
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let figcaption;
		let t1_value = /*now*/ ctx[1].title + "";
		let t1;
		let a_href_value;
		let t2;

		const block = {
			c: function create() {
				a = element("a");
				figure = element("figure");
				div = element("div");
				img = element("img");
				t0 = space();
				figcaption = element("figcaption");
				t1 = text$1(t1_value);
				t2 = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*now*/ ctx[1].title);
				add_location(img, file$7, 25, 14, 676);
				attr_dev(div, "class", "img_wrap");
				add_location(div, file$7, 24, 12, 638);
				add_location(figcaption, file$7, 27, 12, 794);
				add_location(figure, file$7, 23, 10, 616);
				attr_dev(a, "href", a_href_value = `${CONFIG.BASE_URL}/popular/${/*now*/ ctx[1].id}`);
				add_location(a, file$7, 22, 8, 553);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, figure);
				append_dev(figure, div);
				append_dev(div, img);
				append_dev(figure, t0);
				append_dev(figure, figcaption);
				append_dev(figcaption, t1);
				insert_dev(target, t2, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*datas*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*datas*/ 1 && img_alt_value !== (img_alt_value = /*now*/ ctx[1].title)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if (dirty & /*datas*/ 1 && t1_value !== (t1_value = /*now*/ ctx[1].title + "")) set_data_dev(t1, t1_value);

				if (dirty & /*datas*/ 1 && a_href_value !== (a_href_value = `${CONFIG.BASE_URL}/popular/${/*now*/ ctx[1].id}`)) {
					attr_dev(a, "href", a_href_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$2.name,
			type: "slot",
			source: "(22:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (21:4) {#each datas as now, index (now)}
	function create_each_block$3(key_1, ctx) {
		let first;
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				create_component(swiperslide.$$.fragment);
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const swiperslide_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
				}

				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$3.name,
			type: "each",
			source: "(21:4) {#each datas as now, index (now)}",
			ctx
		});

		return block;
	}

	// (15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >
	function create_default_slot$3(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
		const get_key = ctx => /*now*/ ctx[1];
		validate_each_keys(ctx, each_value, get_each_context$3, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$3(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*CONFIG, datas*/ 1) {
					each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context$3, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$3.name,
			type: "slot",
			source: "(15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >",
			ctx
		});

		return block;
	}

	function create_fragment$k(ctx) {
		let section;
		let h2title;
		let t;
		let swiper;
		let current;
		let mounted;
		let dispose;

		h2title = new H2Title({
				props: { name: "현재 가장 인기 있는 영화" },
				$$inline: true
			});

		swiper = new Swiper_1({
				props: {
					modules: [Navigation],
					spaceBetween: 10,
					sildesPerView: 7.2,
					navigation: true,
					$$slots: { default: [create_default_slot$3] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				section = element("section");
				create_component(h2title.$$.fragment);
				t = space();
				create_component(swiper.$$.fragment);
				attr_dev(section, "class", "list_box");
				add_location(section, file$7, 12, 0, 296);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				mount_component(h2title, section, null);
				append_dev(section, t);
				mount_component(swiper, section, null);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(links.call(null, section));
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const swiper_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(h2title.$$.fragment, local);
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(h2title.$$.fragment, local);
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}

				destroy_component(h2title);
				destroy_component(swiper);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$k.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$k($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopularList', slots, []);
		let { datas } = $$props;

		$$self.$$.on_mount.push(function () {
			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<PopularList> was created without expected prop 'datas'");
			}
		});

		const writable_props = ['datas'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PopularList> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		$$self.$capture_state = () => ({
			H2Title,
			links,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Navigation,
			datas
		});

		$$self.$inject_state = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [datas];
	}

	class PopularList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$k, create_fragment$k, safe_not_equal, { datas: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PopularList",
				options,
				id: create_fragment$k.name
			});
		}

		get datas() {
			throw new Error("<PopularList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<PopularList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\PopularListContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$6 } = globals;

	// (13:0) {:catch error}
	function create_catch_block$6(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$6.name,
			type: "catch",
			source: "(13:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (11:0) {:then value}
	function create_then_block$6(ctx) {
		let popularlist;
		let current;

		popularlist = new PopularList({
				props: { datas: /*value*/ ctx[2].data.results },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(popularlist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(popularlist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(popularlist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popularlist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(popularlist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$6.name,
			type: "then",
			source: "(11:0) {:then value}",
			ctx
		});

		return block;
	}

	// (9:16)     <LoadingList/>  {:then value}
	function create_pending_block$6(ctx) {
		let loadinglist;
		let current;
		loadinglist = new LoadingList({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loadinglist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loadinglist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(loadinglist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loadinglist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loadinglist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$6.name,
			type: "pending",
			source: "(9:16)     <LoadingList/>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$j(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$6,
			then: create_then_block$6,
			catch: create_catch_block$6,
			value: 2,
			error: 3,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$6("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$j.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$j($$self, $$props, $$invalidate) {
		let $populars;
		validate_store(populars, 'populars');
		component_subscribe($$self, populars, $$value => $$invalidate(1, $populars = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopularListContainer', slots, []);
		const promise = $populars;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PopularListContainer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Error: Error$1,
			LoadingList,
			PopularList,
			populars,
			promise,
			$populars
		});

		return [promise];
	}

	class PopularListContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PopularListContainer",
				options,
				id: create_fragment$j.name
			});
		}
	}

	/* src\components\sub\UpComingList.svelte generated by Svelte v4.2.20 */
	const file$6 = "src\\components\\sub\\UpComingList.svelte";

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		child_ctx[3] = i;
		return child_ctx;
	}

	// (22:6) <SwiperSlide>
	function create_default_slot_1$1(ctx) {
		let a;
		let figure;
		let div;
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let figcaption;
		let t1_value = /*now*/ ctx[1].title + "";
		let t1;
		let a_href_value;
		let t2;

		const block = {
			c: function create() {
				a = element("a");
				figure = element("figure");
				div = element("div");
				img = element("img");
				t0 = space();
				figcaption = element("figcaption");
				t1 = text$1(t1_value);
				t2 = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*now*/ ctx[1].title);
				add_location(img, file$6, 25, 14, 677);
				attr_dev(div, "class", "img_wrap");
				add_location(div, file$6, 24, 12, 639);
				add_location(figcaption, file$6, 27, 12, 795);
				add_location(figure, file$6, 23, 10, 617);
				attr_dev(a, "href", a_href_value = `${CONFIG.BASE_URL}/upcoming/${/*now*/ ctx[1].id}`);
				add_location(a, file$6, 22, 8, 553);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, figure);
				append_dev(figure, div);
				append_dev(div, img);
				append_dev(figure, t0);
				append_dev(figure, figcaption);
				append_dev(figcaption, t1);
				insert_dev(target, t2, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*datas*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*datas*/ 1 && img_alt_value !== (img_alt_value = /*now*/ ctx[1].title)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if (dirty & /*datas*/ 1 && t1_value !== (t1_value = /*now*/ ctx[1].title + "")) set_data_dev(t1, t1_value);

				if (dirty & /*datas*/ 1 && a_href_value !== (a_href_value = `${CONFIG.BASE_URL}/upcoming/${/*now*/ ctx[1].id}`)) {
					attr_dev(a, "href", a_href_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1$1.name,
			type: "slot",
			source: "(22:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (21:4) {#each datas as now, index (now)}
	function create_each_block$2(key_1, ctx) {
		let first;
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1$1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				create_component(swiperslide.$$.fragment);
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const swiperslide_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
				}

				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$2.name,
			type: "each",
			source: "(21:4) {#each datas as now, index (now)}",
			ctx
		});

		return block;
	}

	// (15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >
	function create_default_slot$2(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
		const get_key = ctx => /*now*/ ctx[1];
		validate_each_keys(ctx, each_value, get_each_context$2, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$2(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*CONFIG, datas*/ 1) {
					each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context$2, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$2.name,
			type: "slot",
			source: "(15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >",
			ctx
		});

		return block;
	}

	function create_fragment$i(ctx) {
		let section;
		let h2title;
		let t;
		let swiper;
		let current;
		let mounted;
		let dispose;

		h2title = new H2Title({
				props: { name: "곧 개봉할 흥미로운 예정작" },
				$$inline: true
			});

		swiper = new Swiper_1({
				props: {
					modules: [Navigation],
					spaceBetween: 10,
					sildesPerView: 7.2,
					navigation: true,
					$$slots: { default: [create_default_slot$2] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				section = element("section");
				create_component(h2title.$$.fragment);
				t = space();
				create_component(swiper.$$.fragment);
				attr_dev(section, "class", "list_box");
				add_location(section, file$6, 12, 0, 296);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				mount_component(h2title, section, null);
				append_dev(section, t);
				mount_component(swiper, section, null);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(links.call(null, section));
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const swiper_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(h2title.$$.fragment, local);
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(h2title.$$.fragment, local);
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}

				destroy_component(h2title);
				destroy_component(swiper);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$i.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$i($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UpComingList', slots, []);
		let { datas } = $$props;

		$$self.$$.on_mount.push(function () {
			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<UpComingList> was created without expected prop 'datas'");
			}
		});

		const writable_props = ['datas'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpComingList> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		$$self.$capture_state = () => ({
			H2Title,
			links,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Navigation,
			datas
		});

		$$self.$inject_state = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [datas];
	}

	class UpComingList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$i, create_fragment$i, safe_not_equal, { datas: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "UpComingList",
				options,
				id: create_fragment$i.name
			});
		}

		get datas() {
			throw new Error("<UpComingList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<UpComingList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\UpComingListContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$5 } = globals;

	// (13:0) {:catch error}
	function create_catch_block$5(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$5.name,
			type: "catch",
			source: "(13:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (11:0) {:then value}
	function create_then_block$5(ctx) {
		let upcominglist;
		let current;

		upcominglist = new UpComingList({
				props: { datas: /*value*/ ctx[2].data.results },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(upcominglist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(upcominglist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(upcominglist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(upcominglist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(upcominglist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$5.name,
			type: "then",
			source: "(11:0) {:then value}",
			ctx
		});

		return block;
	}

	// (9:16)     <LoadingList/>  {:then value}
	function create_pending_block$5(ctx) {
		let loadinglist;
		let current;
		loadinglist = new LoadingList({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loadinglist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loadinglist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(loadinglist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loadinglist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loadinglist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$5.name,
			type: "pending",
			source: "(9:16)     <LoadingList/>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$h(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$5,
			then: create_then_block$5,
			catch: create_catch_block$5,
			value: 2,
			error: 3,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$5("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$h.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$h($$self, $$props, $$invalidate) {
		let $upcomings;
		validate_store(upcomings, 'upcomings');
		component_subscribe($$self, upcomings, $$value => $$invalidate(1, $upcomings = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UpComingListContainer', slots, []);
		const promise = $upcomings;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpComingListContainer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Error: Error$1,
			LoadingList,
			UpComingList,
			upcomings,
			promise,
			$upcomings
		});

		return [promise];
	}

	class UpComingListContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "UpComingListContainer",
				options,
				id: create_fragment$h.name
			});
		}
	}

	/* src\components\sub\TopList.svelte generated by Svelte v4.2.20 */
	const file$5 = "src\\components\\sub\\TopList.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		child_ctx[3] = i;
		return child_ctx;
	}

	// (22:6) <SwiperSlide>
	function create_default_slot_1(ctx) {
		let a;
		let figure;
		let div;
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let figcaption;
		let t1_value = /*now*/ ctx[1].title + "";
		let t1;
		let a_href_value;
		let t2;

		const block = {
			c: function create() {
				a = element("a");
				figure = element("figure");
				div = element("div");
				img = element("img");
				t0 = space();
				figcaption = element("figcaption");
				t1 = text$1(t1_value);
				t2 = space();
				if (!src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*now*/ ctx[1].title);
				add_location(img, file$5, 25, 14, 677);
				attr_dev(div, "class", "img_wrap");
				add_location(div, file$5, 24, 12, 639);
				add_location(figcaption, file$5, 27, 12, 795);
				add_location(figure, file$5, 23, 10, 617);
				attr_dev(a, "href", a_href_value = `${CONFIG.BASE_URL}/top/${/*now*/ ctx[1].id}`);
				add_location(a, file$5, 22, 8, 558);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, figure);
				append_dev(figure, div);
				append_dev(div, img);
				append_dev(figure, t0);
				append_dev(figure, figcaption);
				append_dev(figcaption, t1);
				insert_dev(target, t2, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*datas*/ 1 && !src_url_equal(img.src, img_src_value = `https://image.tmdb.org/t/p/original/${/*now*/ ctx[1].poster_path}`)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*datas*/ 1 && img_alt_value !== (img_alt_value = /*now*/ ctx[1].title)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if (dirty & /*datas*/ 1 && t1_value !== (t1_value = /*now*/ ctx[1].title + "")) set_data_dev(t1, t1_value);

				if (dirty & /*datas*/ 1 && a_href_value !== (a_href_value = `${CONFIG.BASE_URL}/top/${/*now*/ ctx[1].id}`)) {
					attr_dev(a, "href", a_href_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
					detach_dev(t2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot_1.name,
			type: "slot",
			source: "(22:6) <SwiperSlide>",
			ctx
		});

		return block;
	}

	// (21:4) {#each datas as now, index (now)}
	function create_each_block$1(key_1, ctx) {
		let first;
		let swiperslide;
		let current;

		swiperslide = new Swiper_slide({
				props: {
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				create_component(swiperslide.$$.fragment);
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				mount_component(swiperslide, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const swiperslide_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiperslide_changes.$$scope = { dirty, ctx };
				}

				swiperslide.$set(swiperslide_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(swiperslide.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(swiperslide.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
				}

				destroy_component(swiperslide, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(21:4) {#each datas as now, index (now)}",
			ctx
		});

		return block;
	}

	// (15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >
	function create_default_slot$1(ctx) {
		let each_blocks = [];
		let each_1_lookup = new Map();
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
		const get_key = ctx => /*now*/ ctx[1];
		validate_each_keys(ctx, each_value, get_each_context$1, get_key);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$1(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
		}

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*CONFIG, datas*/ 1) {
					each_value = ensure_array_like_dev(/*datas*/ ctx[0]);
					group_outros();
					validate_each_keys(ctx, each_value, get_each_context$1, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d(detaching);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot$1.name,
			type: "slot",
			source: "(15:2) <Swiper      modules={[Navigation]}      spaceBetween={10}      sildesPerView={7.2}      navigation={true}    >",
			ctx
		});

		return block;
	}

	function create_fragment$g(ctx) {
		let section;
		let h2title;
		let t;
		let swiper;
		let current;
		let mounted;
		let dispose;

		h2title = new H2Title({
				props: { name: "클래스는 영원하다! 높은 평점 영화" },
				$$inline: true
			});

		swiper = new Swiper_1({
				props: {
					modules: [Navigation],
					spaceBetween: 10,
					sildesPerView: 7.2,
					navigation: true,
					$$slots: { default: [create_default_slot$1] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				section = element("section");
				create_component(h2title.$$.fragment);
				t = space();
				create_component(swiper.$$.fragment);
				attr_dev(section, "class", "list_box");
				add_location(section, file$5, 12, 0, 296);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				mount_component(h2title, section, null);
				append_dev(section, t);
				mount_component(swiper, section, null);
				current = true;

				if (!mounted) {
					dispose = action_destroyer(links.call(null, section));
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const swiper_changes = {};

				if (dirty & /*$$scope, datas*/ 17) {
					swiper_changes.$$scope = { dirty, ctx };
				}

				swiper.$set(swiper_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(h2title.$$.fragment, local);
				transition_in(swiper.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(h2title.$$.fragment, local);
				transition_out(swiper.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(section);
				}

				destroy_component(h2title);
				destroy_component(swiper);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$g.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$g($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TopList', slots, []);
		let { datas } = $$props;

		$$self.$$.on_mount.push(function () {
			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<TopList> was created without expected prop 'datas'");
			}
		});

		const writable_props = ['datas'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopList> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		$$self.$capture_state = () => ({
			H2Title,
			links,
			Swiper: Swiper_1,
			SwiperSlide: Swiper_slide,
			Navigation,
			datas
		});

		$$self.$inject_state = $$props => {
			if ('datas' in $$props) $$invalidate(0, datas = $$props.datas);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [datas];
	}

	class TopList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$g, create_fragment$g, safe_not_equal, { datas: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TopList",
				options,
				id: create_fragment$g.name
			});
		}

		get datas() {
			throw new Error("<TopList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<TopList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\TopListContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$4 } = globals;

	// (13:0) {:catch error}
	function create_catch_block$4(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$4.name,
			type: "catch",
			source: "(13:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (11:0) {:then value}
	function create_then_block$4(ctx) {
		let toplist;
		let current;

		toplist = new TopList({
				props: { datas: /*value*/ ctx[2].data.results },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(toplist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(toplist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(toplist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(toplist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(toplist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$4.name,
			type: "then",
			source: "(11:0) {:then value}",
			ctx
		});

		return block;
	}

	// (9:16)     <LoadingList/>  {:then value}
	function create_pending_block$4(ctx) {
		let loadinglist;
		let current;
		loadinglist = new LoadingList({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loadinglist.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loadinglist, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(loadinglist.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loadinglist.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loadinglist, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$4.name,
			type: "pending",
			source: "(9:16)     <LoadingList/>  {:then value}",
			ctx
		});

		return block;
	}

	function create_fragment$f(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$4,
			then: create_then_block$4,
			catch: create_catch_block$4,
			value: 2,
			error: 3,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[0], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$4("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$f.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$f($$self, $$props, $$invalidate) {
		let $tops;
		validate_store(tops, 'tops');
		component_subscribe($$self, tops, $$value => $$invalidate(1, $tops = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TopListContainer', slots, []);
		const promise = $tops;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopListContainer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Error: Error$1,
			LoadingList,
			TopList,
			tops,
			promise,
			$tops
		});

		return [promise];
	}

	class TopListContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TopListContainer",
				options,
				id: create_fragment$f.name
			});
		}
	}

	/* src\pages\MainPage.svelte generated by Svelte v4.2.20 */

	function create_fragment$e(ctx) {
		let mainlistcontainer;
		let t0;
		let nowlistcontainer;
		let t1;
		let popularlistcontainer;
		let t2;
		let upcominglistcontainer;
		let t3;
		let toplistcontainer;
		let current;
		mainlistcontainer = new MainListContainer({ $$inline: true });
		nowlistcontainer = new NowListContainer({ $$inline: true });
		popularlistcontainer = new PopularListContainer({ $$inline: true });
		upcominglistcontainer = new UpComingListContainer({ $$inline: true });
		toplistcontainer = new TopListContainer({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainlistcontainer.$$.fragment);
				t0 = space();
				create_component(nowlistcontainer.$$.fragment);
				t1 = space();
				create_component(popularlistcontainer.$$.fragment);
				t2 = space();
				create_component(upcominglistcontainer.$$.fragment);
				t3 = space();
				create_component(toplistcontainer.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(mainlistcontainer, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(nowlistcontainer, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(popularlistcontainer, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(upcominglistcontainer, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(toplistcontainer, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainlistcontainer.$$.fragment, local);
				transition_in(nowlistcontainer.$$.fragment, local);
				transition_in(popularlistcontainer.$$.fragment, local);
				transition_in(upcominglistcontainer.$$.fragment, local);
				transition_in(toplistcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainlistcontainer.$$.fragment, local);
				transition_out(nowlistcontainer.$$.fragment, local);
				transition_out(popularlistcontainer.$$.fragment, local);
				transition_out(upcominglistcontainer.$$.fragment, local);
				transition_out(toplistcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(t3);
				}

				destroy_component(mainlistcontainer, detaching);
				destroy_component(nowlistcontainer, detaching);
				destroy_component(popularlistcontainer, detaching);
				destroy_component(upcominglistcontainer, detaching);
				destroy_component(toplistcontainer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$e.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$e($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('MainPage', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainPage> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			MainListContainer,
			NowListContainer,
			PopularListContainer,
			UpComingListContainer,
			TopListContainer
		});

		return [];
	}

	class MainPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "MainPage",
				options,
				id: create_fragment$e.name
			});
		}
	}

	/* src\pages\NowPage.svelte generated by Svelte v4.2.20 */
	const file$4 = "src\\pages\\NowPage.svelte";

	function create_fragment$d(ctx) {
		let div;
		let nowlistcontainer;
		let current;
		nowlistcontainer = new NowListContainer({ $$inline: true });

		const block = {
			c: function create() {
				div = element("div");
				create_component(nowlistcontainer.$$.fragment);
				attr_dev(div, "class", "sub_page");
				add_location(div, file$4, 3, 0, 94);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(nowlistcontainer, div, null);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(nowlistcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(nowlistcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(nowlistcontainer);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$d.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$d($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NowPage', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NowPage> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ NowListContainer });
		return [];
	}

	class NowPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NowPage",
				options,
				id: create_fragment$d.name
			});
		}
	}

	/* src\pages\PopularPage.svelte generated by Svelte v4.2.20 */
	const file$3 = "src\\pages\\PopularPage.svelte";

	function create_fragment$c(ctx) {
		let div;
		let popularlistcontainer;
		let current;
		popularlistcontainer = new PopularListContainer({ $$inline: true });

		const block = {
			c: function create() {
				div = element("div");
				create_component(popularlistcontainer.$$.fragment);
				attr_dev(div, "class", "sub_page");
				add_location(div, file$3, 3, 0, 104);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popularlistcontainer, div, null);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(popularlistcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popularlistcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(popularlistcontainer);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$c.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$c($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopularPage', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PopularPage> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ PopularListContainer });
		return [];
	}

	class PopularPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PopularPage",
				options,
				id: create_fragment$c.name
			});
		}
	}

	/* src\pages\UpcomingPage.svelte generated by Svelte v4.2.20 */
	const file$2 = "src\\pages\\UpcomingPage.svelte";

	function create_fragment$b(ctx) {
		let div;
		let upcominglistcontainer;
		let current;
		upcominglistcontainer = new UpComingListContainer({ $$inline: true });

		const block = {
			c: function create() {
				div = element("div");
				create_component(upcominglistcontainer.$$.fragment);
				attr_dev(div, "class", "sub_page");
				add_location(div, file$2, 3, 0, 106);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(upcominglistcontainer, div, null);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(upcominglistcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(upcominglistcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(upcominglistcontainer);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$b.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$b($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UpcomingPage', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpcomingPage> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ UpComingListContainer });
		return [];
	}

	class UpcomingPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "UpcomingPage",
				options,
				id: create_fragment$b.name
			});
		}
	}

	/* src\pages\TopPage.svelte generated by Svelte v4.2.20 */
	const file$1 = "src\\pages\\TopPage.svelte";

	function create_fragment$a(ctx) {
		let div;
		let toplistcontainer;
		let current;
		toplistcontainer = new TopListContainer({ $$inline: true });

		const block = {
			c: function create() {
				div = element("div");
				create_component(toplistcontainer.$$.fragment);
				attr_dev(div, "class", "sub_page");
				add_location(div, file$1, 3, 0, 96);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(toplistcontainer, div, null);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(toplistcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(toplistcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(toplistcontainer);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$a.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$a($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TopPage', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopPage> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ TopListContainer });
		return [];
	}

	class TopPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TopPage",
				options,
				id: create_fragment$a.name
			});
		}
	}

	/* src\components\common\ListSub.svelte generated by Svelte v4.2.20 */
	const file = "src\\components\\common\\ListSub.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[12] = list[i];
		child_ctx[14] = i;
		return child_ctx;
	}

	// (26:8) {#if release_date}
	function create_if_block_1(ctx) {
		let li;

		const block = {
			c: function create() {
				li = element("li");
				li.textContent = `${/*release_date*/ ctx[4]}`;
				add_location(li, file, 26, 10, 787);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(26:8) {#if release_date}",
			ctx
		});

		return block;
	}

	// (29:8) {#each genre_ko_ids as genre_ko_id, i}
	function create_each_block(ctx) {
		let li;

		const block = {
			c: function create() {
				li = element("li");
				li.textContent = `${/*genre_ko_id*/ ctx[12]}`;
				add_location(li, file, 29, 10, 885);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(29:8) {#each genre_ko_ids as genre_ko_id, i}",
			ctx
		});

		return block;
	}

	// (45:10) {:else}
	function create_else_block(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text$1(/*overview*/ ctx[1]);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(45:10) {:else}",
			ctx
		});

		return block;
	}

	// (43:10) {#if overview === ''}
	function create_if_block(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text$1("설명은 업데이트되면 추가하겠습니다.");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(43:10) {#if overview === ''}",
			ctx
		});

		return block;
	}

	function create_fragment$9(ctx) {
		let div3;
		let img0;
		let img0_src_value;
		let t0;
		let div2;
		let div0;
		let h2;
		let t5;
		let ul0;
		let t6;
		let t7;
		let ul1;
		let li0;
		let a0;
		let t9;
		let li1;
		let a1;
		let icon0;
		let t10;
		let t11;
		let li2;
		let a2;
		let icon1;
		let t12;
		let t13;
		let p;
		let t14;
		let div1;
		let img1;
		let img1_src_value;
		let t15;
		let icon2;
		let current;
		let if_block0 = /*release_date*/ ctx[4] && create_if_block_1(ctx);
		let each_value = ensure_array_like_dev(/*genre_ko_ids*/ ctx[6]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		icon0 = new Icon({
				props: { icon: "clarity:heart-line" },
				$$inline: true
			});

		icon1 = new Icon({
				props: { icon: "octicon:share-24" },
				$$inline: true
			});

		function select_block_type(ctx, dirty) {
			if (/*overview*/ ctx[1] === '') return create_if_block;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block1 = current_block_type(ctx);
		icon2 = new Icon({ $$inline: true });

		const block = {
			c: function create() {
				div3 = element("div");
				img0 = element("img");
				t0 = space();
				div2 = element("div");
				div0 = element("div");
				h2 = element("h2");
				h2.textContent = `${/*title*/ ctx[5]}(${/*original_title*/ ctx[0]})`;
				t5 = space();
				ul0 = element("ul");
				if (if_block0) if_block0.c();
				t6 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t7 = space();
				ul1 = element("ul");
				li0 = element("li");
				a0 = element("a");
				a0.textContent = "▶ 영화 시청하기";
				t9 = space();
				li1 = element("li");
				a1 = element("a");
				create_component(icon0.$$.fragment);
				t10 = text$1("찜");
				t11 = space();
				li2 = element("li");
				a2 = element("a");
				create_component(icon1.$$.fragment);
				t12 = text$1("공유");
				t13 = space();
				p = element("p");
				if_block1.c();
				t14 = space();
				div1 = element("div");
				img1 = element("img");
				t15 = space();
				create_component(icon2.$$.fragment);
				if (!src_url_equal(img0.src, img0_src_value = `https://image.tmdb.org/t/p/original/${/*backdrop_path*/ ctx[3]}`)) attr_dev(img0, "src", img0_src_value);
				attr_dev(img0, "alt", /*title*/ ctx[5]);
				attr_dev(img0, "class", "contentsBg");
				add_location(img0, file, 20, 2, 519);
				add_location(h2, file, 23, 6, 688);
				attr_dev(ul0, "class", "info");
				add_location(ul0, file, 24, 6, 730);
				attr_dev(a0, "href", "#!");
				add_location(a0, file, 33, 29, 992);
				attr_dev(li0, "class", "view_btn");
				add_location(li0, file, 33, 8, 971);
				attr_dev(a1, "href", "#!");
				add_location(a1, file, 35, 10, 1070);
				attr_dev(li1, "class", "bookmark_btn");
				add_location(li1, file, 34, 8, 1033);
				attr_dev(a2, "href", "#!");
				add_location(a2, file, 38, 10, 1181);
				attr_dev(li2, "class", "share_btn");
				add_location(li2, file, 37, 8, 1147);
				attr_dev(ul1, "class", "btn");
				add_location(ul1, file, 32, 6, 945);
				add_location(p, file, 41, 6, 1268);
				attr_dev(div0, "class", "contents_left");
				add_location(div0, file, 22, 4, 653);
				if (!src_url_equal(img1.src, img1_src_value = `https://image.tmdb.org/t/p/original/${/*poster_path*/ ctx[2]}`)) attr_dev(img1, "src", img1_src_value);
				attr_dev(img1, "alt", /*title*/ ctx[5]);
				add_location(img1, file, 50, 6, 1460);
				attr_dev(div1, "class", "poster_wrap");
				add_location(div1, file, 49, 4, 1427);
				attr_dev(div2, "class", "contents_wrap");
				add_location(div2, file, 21, 2, 620);
				attr_dev(div3, "class", "subpage_box");
				add_location(div3, file, 19, 0, 490);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				append_dev(div3, img0);
				append_dev(div3, t0);
				append_dev(div3, div2);
				append_dev(div2, div0);
				append_dev(div0, h2);
				append_dev(div0, t5);
				append_dev(div0, ul0);
				if (if_block0) if_block0.m(ul0, null);
				append_dev(ul0, t6);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul0, null);
					}
				}

				append_dev(div0, t7);
				append_dev(div0, ul1);
				append_dev(ul1, li0);
				append_dev(li0, a0);
				append_dev(ul1, t9);
				append_dev(ul1, li1);
				append_dev(li1, a1);
				mount_component(icon0, a1, null);
				append_dev(a1, t10);
				append_dev(ul1, t11);
				append_dev(ul1, li2);
				append_dev(li2, a2);
				mount_component(icon1, a2, null);
				append_dev(a2, t12);
				append_dev(div0, t13);
				append_dev(div0, p);
				if_block1.m(p, null);
				append_dev(div2, t14);
				append_dev(div2, div1);
				append_dev(div1, img1);
				append_dev(div3, t15);
				mount_component(icon2, div3, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*release_date*/ ctx[4]) if_block0.p(ctx, dirty);

				if (dirty & /*genre_ko_ids*/ 64) {
					each_value = ensure_array_like_dev(/*genre_ko_ids*/ ctx[6]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul0, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if_block1.p(ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon0.$$.fragment, local);
				transition_in(icon1.$$.fragment, local);
				transition_in(icon2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon0.$$.fragment, local);
				transition_out(icon1.$$.fragment, local);
				transition_out(icon2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div3);
				}

				if (if_block0) if_block0.d();
				destroy_each(each_blocks, detaching);
				destroy_component(icon0);
				destroy_component(icon1);
				if_block1.d();
				destroy_component(icon2);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ListSub', slots, []);
		let { id } = $$props;
		let { datas } = $$props;
		let { genres } = $$props;

		const data = datas.filter(data => {
			return data.id === id;
		});

		const { genre_ids, original_title, overview, poster_path, backdrop_path, release_date, title } = data[0];
		let genre_ko_ids = [];

		for (let i in genre_ids) {
			for (let j in genres) {
				if (genre_ids[i] === genres[j].id) genre_ko_ids.push(genres[j].name);
			}
		}

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<ListSub> was created without expected prop 'id'");
			}

			if (datas === undefined && !('datas' in $$props || $$self.$$.bound[$$self.$$.props['datas']])) {
				console.warn("<ListSub> was created without expected prop 'datas'");
			}

			if (genres === undefined && !('genres' in $$props || $$self.$$.bound[$$self.$$.props['genres']])) {
				console.warn("<ListSub> was created without expected prop 'genres'");
			}
		});

		const writable_props = ['id', 'datas', 'genres'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListSub> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(7, id = $$props.id);
			if ('datas' in $$props) $$invalidate(8, datas = $$props.datas);
			if ('genres' in $$props) $$invalidate(9, genres = $$props.genres);
		};

		$$self.$capture_state = () => ({
			Icon,
			id,
			datas,
			genres,
			data,
			genre_ids,
			original_title,
			overview,
			poster_path,
			backdrop_path,
			release_date,
			title,
			genre_ko_ids
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(7, id = $$props.id);
			if ('datas' in $$props) $$invalidate(8, datas = $$props.datas);
			if ('genres' in $$props) $$invalidate(9, genres = $$props.genres);
			if ('genre_ko_ids' in $$props) $$invalidate(6, genre_ko_ids = $$props.genre_ko_ids);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			original_title,
			overview,
			poster_path,
			backdrop_path,
			release_date,
			title,
			genre_ko_ids,
			id,
			datas,
			genres
		];
	}

	class ListSub extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { id: 7, datas: 8, genres: 9 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ListSub",
				options,
				id: create_fragment$9.name
			});
		}

		get id() {
			throw new Error("<ListSub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<ListSub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get datas() {
			throw new Error("<ListSub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set datas(value) {
			throw new Error("<ListSub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get genres() {
			throw new Error("<ListSub>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set genres(value) {
			throw new Error("<ListSub>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\NowContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$3 } = globals;

	function get_then_context$3(ctx) {
		ctx[4] = ctx[6][0];
		ctx[5] = ctx[6][1];
	}

	// (16:0) {:catch error}
	function create_catch_block$3(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$3.name,
			type: "catch",
			source: "(16:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (14:0) {:then [now, genres]}
	function create_then_block$3(ctx) {
		get_then_context$3(ctx);
		let listsub;
		let current;

		listsub = new ListSub({
				props: {
					id: /*id*/ ctx[0],
					datas: /*now*/ ctx[4].data.results,
					genres: /*genres*/ ctx[5].data.genres
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(listsub.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(listsub, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				get_then_context$3(ctx);
				const listsub_changes = {};
				if (dirty & /*id*/ 1) listsub_changes.id = /*id*/ ctx[0];
				listsub.$set(listsub_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listsub.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(listsub.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(listsub, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$3.name,
			type: "then",
			source: "(14:0) {:then [now, genres]}",
			ctx
		});

		return block;
	}

	// (12:16)     <MainLoading/>  {:then [now, genres]}
	function create_pending_block$3(ctx) {
		let mainloading;
		let current;
		mainloading = new MainLoading({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainloading.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainloading, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainloading.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainloading.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainloading, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$3.name,
			type: "pending",
			source: "(12:16)     <MainLoading/>  {:then [now, genres]}",
			ctx
		});

		return block;
	}

	function create_fragment$8(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$3,
			then: create_then_block$3,
			catch: create_catch_block$3,
			value: 6,
			error: 7,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[1], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props, $$invalidate) {
		let $genres;
		let $nows;
		validate_store(genres, 'genres');
		component_subscribe($$self, genres, $$value => $$invalidate(2, $genres = $$value));
		validate_store(nows, 'nows');
		component_subscribe($$self, nows, $$value => $$invalidate(3, $nows = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NowContainer', slots, []);
		const promise = Promise.all([$nows, $genres]);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<NowContainer> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NowContainer> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			Error: Error$1,
			ListSub,
			MainLoading,
			nows,
			genres,
			promise,
			id,
			$genres,
			$nows
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id, promise];
	}

	class NowContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NowContainer",
				options,
				id: create_fragment$8.name
			});
		}

		get id() {
			throw new Error_1$3("<NowContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error_1$3("<NowContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\pages\NowSubPage.svelte generated by Svelte v4.2.20 */

	function create_fragment$7(ctx) {
		let nowcontainer;
		let current;

		nowcontainer = new NowContainer({
				props: { id: parseInt(/*id*/ ctx[0], 10) },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(nowcontainer.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(nowcontainer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const nowcontainer_changes = {};
				if (dirty & /*id*/ 1) nowcontainer_changes.id = parseInt(/*id*/ ctx[0], 10);
				nowcontainer.$set(nowcontainer_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(nowcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(nowcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(nowcontainer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('NowSubPage', slots, []);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<NowSubPage> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NowSubPage> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({ NowContainer, id });

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id];
	}

	class NowSubPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "NowSubPage",
				options,
				id: create_fragment$7.name
			});
		}

		get id() {
			throw new Error("<NowSubPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<NowSubPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\PopularContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$2 } = globals;

	function get_then_context$2(ctx) {
		ctx[4] = ctx[6][0];
		ctx[5] = ctx[6][1];
	}

	// (16:0) {:catch error}
	function create_catch_block$2(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$2.name,
			type: "catch",
			source: "(16:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (14:0) {:then [now, genres]}
	function create_then_block$2(ctx) {
		get_then_context$2(ctx);
		let listsub;
		let current;

		listsub = new ListSub({
				props: {
					id: /*id*/ ctx[0],
					datas: /*now*/ ctx[4].data.results,
					genres: /*genres*/ ctx[5].data.genres
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(listsub.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(listsub, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				get_then_context$2(ctx);
				const listsub_changes = {};
				if (dirty & /*id*/ 1) listsub_changes.id = /*id*/ ctx[0];
				listsub.$set(listsub_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listsub.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(listsub.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(listsub, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$2.name,
			type: "then",
			source: "(14:0) {:then [now, genres]}",
			ctx
		});

		return block;
	}

	// (12:16)     <MainLoading/>  {:then [now, genres]}
	function create_pending_block$2(ctx) {
		let mainloading;
		let current;
		mainloading = new MainLoading({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainloading.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainloading, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainloading.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainloading.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainloading, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$2.name,
			type: "pending",
			source: "(12:16)     <MainLoading/>  {:then [now, genres]}",
			ctx
		});

		return block;
	}

	function create_fragment$6(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$2,
			then: create_then_block$2,
			catch: create_catch_block$2,
			value: 6,
			error: 7,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[1], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		let $genres;
		let $populars;
		validate_store(genres, 'genres');
		component_subscribe($$self, genres, $$value => $$invalidate(2, $genres = $$value));
		validate_store(populars, 'populars');
		component_subscribe($$self, populars, $$value => $$invalidate(3, $populars = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopularContainer', slots, []);
		const promise = Promise.all([$populars, $genres]);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<PopularContainer> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PopularContainer> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			Error: Error$1,
			ListSub,
			MainLoading,
			populars,
			genres,
			promise,
			id,
			$genres,
			$populars
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id, promise];
	}

	class PopularContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PopularContainer",
				options,
				id: create_fragment$6.name
			});
		}

		get id() {
			throw new Error_1$2("<PopularContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error_1$2("<PopularContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\pages\PopularSubPage.svelte generated by Svelte v4.2.20 */

	function create_fragment$5(ctx) {
		let popularcontainer;
		let current;

		popularcontainer = new PopularContainer({
				props: { id: parseInt(/*id*/ ctx[0], 10) },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(popularcontainer.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(popularcontainer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const popularcontainer_changes = {};
				if (dirty & /*id*/ 1) popularcontainer_changes.id = parseInt(/*id*/ ctx[0], 10);
				popularcontainer.$set(popularcontainer_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popularcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popularcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(popularcontainer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopularSubPage', slots, []);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<PopularSubPage> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PopularSubPage> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({ PopularContainer, id });

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id];
	}

	class PopularSubPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PopularSubPage",
				options,
				id: create_fragment$5.name
			});
		}

		get id() {
			throw new Error("<PopularSubPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<PopularSubPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\UpComingContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1$1 } = globals;

	function get_then_context$1(ctx) {
		ctx[4] = ctx[6][0];
		ctx[5] = ctx[6][1];
	}

	// (16:0) {:catch error}
	function create_catch_block$1(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block$1.name,
			type: "catch",
			source: "(16:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (14:0) {:then [now, genres]}
	function create_then_block$1(ctx) {
		get_then_context$1(ctx);
		let listsub;
		let current;

		listsub = new ListSub({
				props: {
					id: /*id*/ ctx[0],
					datas: /*now*/ ctx[4].data.results,
					genres: /*genres*/ ctx[5].data.genres
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(listsub.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(listsub, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				get_then_context$1(ctx);
				const listsub_changes = {};
				if (dirty & /*id*/ 1) listsub_changes.id = /*id*/ ctx[0];
				listsub.$set(listsub_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listsub.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(listsub.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(listsub, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block$1.name,
			type: "then",
			source: "(14:0) {:then [now, genres]}",
			ctx
		});

		return block;
	}

	// (12:16)     <MainLoading/>  {:then [now, genres]}
	function create_pending_block$1(ctx) {
		let mainloading;
		let current;
		mainloading = new MainLoading({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainloading.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainloading, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainloading.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainloading.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainloading, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block$1.name,
			type: "pending",
			source: "(12:16)     <MainLoading/>  {:then [now, genres]}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block$1,
			then: create_then_block$1,
			catch: create_catch_block$1,
			value: 6,
			error: 7,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[1], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let $genres;
		let $upcomings;
		validate_store(genres, 'genres');
		component_subscribe($$self, genres, $$value => $$invalidate(2, $genres = $$value));
		validate_store(upcomings, 'upcomings');
		component_subscribe($$self, upcomings, $$value => $$invalidate(3, $upcomings = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UpComingContainer', slots, []);
		const promise = Promise.all([$upcomings, $genres]);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<UpComingContainer> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpComingContainer> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			Error: Error$1,
			ListSub,
			MainLoading,
			upcomings,
			genres,
			promise,
			id,
			$genres,
			$upcomings
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id, promise];
	}

	class UpComingContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "UpComingContainer",
				options,
				id: create_fragment$4.name
			});
		}

		get id() {
			throw new Error_1$1("<UpComingContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error_1$1("<UpComingContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\pages\UpcomingSubPage.svelte generated by Svelte v4.2.20 */

	function create_fragment$3(ctx) {
		let upcomingcontainer;
		let current;

		upcomingcontainer = new UpComingContainer({
				props: { id: parseInt(/*id*/ ctx[0], 10) },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(upcomingcontainer.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(upcomingcontainer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const upcomingcontainer_changes = {};
				if (dirty & /*id*/ 1) upcomingcontainer_changes.id = parseInt(/*id*/ ctx[0], 10);
				upcomingcontainer.$set(upcomingcontainer_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(upcomingcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(upcomingcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(upcomingcontainer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UpcomingSubPage', slots, []);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<UpcomingSubPage> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpcomingSubPage> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({ UpComingContainer, id });

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id];
	}

	class UpcomingSubPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "UpcomingSubPage",
				options,
				id: create_fragment$3.name
			});
		}

		get id() {
			throw new Error("<UpcomingSubPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<UpcomingSubPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\containers\TopContainer.svelte generated by Svelte v4.2.20 */

	const { Error: Error_1 } = globals;

	function get_then_context(ctx) {
		ctx[4] = ctx[6][0];
		ctx[5] = ctx[6][1];
	}

	// (16:0) {:catch error}
	function create_catch_block(ctx) {
		let error_1;
		let current;
		error_1 = new Error$1({ $$inline: true });

		const block = {
			c: function create() {
				create_component(error_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(error_1, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(error_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(error_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(error_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_catch_block.name,
			type: "catch",
			source: "(16:0) {:catch error}",
			ctx
		});

		return block;
	}

	// (14:0) {:then [now, genres]}
	function create_then_block(ctx) {
		get_then_context(ctx);
		let listsub;
		let current;

		listsub = new ListSub({
				props: {
					id: /*id*/ ctx[0],
					datas: /*now*/ ctx[4].data.results,
					genres: /*genres*/ ctx[5].data.genres
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(listsub.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(listsub, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				get_then_context(ctx);
				const listsub_changes = {};
				if (dirty & /*id*/ 1) listsub_changes.id = /*id*/ ctx[0];
				listsub.$set(listsub_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listsub.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(listsub.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(listsub, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_then_block.name,
			type: "then",
			source: "(14:0) {:then [now, genres]}",
			ctx
		});

		return block;
	}

	// (12:16)     <MainLoading/>  {:then [now, genres]}
	function create_pending_block(ctx) {
		let mainloading;
		let current;
		mainloading = new MainLoading({ $$inline: true });

		const block = {
			c: function create() {
				create_component(mainloading.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mainloading, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(mainloading.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mainloading.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mainloading, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_pending_block.name,
			type: "pending",
			source: "(12:16)     <MainLoading/>  {:then [now, genres]}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let await_block_anchor;
		let current;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: true,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 6,
			error: 7,
			blocks: [,,,]
		};

		handle_promise(/*promise*/ ctx[1], info);

		const block = {
			c: function create() {
				await_block_anchor = empty();
				info.block.c();
			},
			l: function claim(nodes) {
				throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(info.block);
				current = true;
			},
			o: function outro(local) {
				for (let i = 0; i < 3; i += 1) {
					const block = info.blocks[i];
					transition_out(block);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(await_block_anchor);
				}

				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $genres;
		let $tops;
		validate_store(genres, 'genres');
		component_subscribe($$self, genres, $$value => $$invalidate(2, $genres = $$value));
		validate_store(tops, 'tops');
		component_subscribe($$self, tops, $$value => $$invalidate(3, $tops = $$value));
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TopContainer', slots, []);
		const promise = Promise.all([$tops, $genres]);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<TopContainer> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopContainer> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({
			Error: Error$1,
			ListSub,
			MainLoading,
			tops,
			genres,
			promise,
			id,
			$genres,
			$tops
		});

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id, promise];
	}

	class TopContainer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TopContainer",
				options,
				id: create_fragment$2.name
			});
		}

		get id() {
			throw new Error_1("<TopContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error_1("<TopContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\pages\TopSubPage.svelte generated by Svelte v4.2.20 */

	function create_fragment$1(ctx) {
		let topcontainer;
		let current;

		topcontainer = new TopContainer({
				props: { id: parseInt(/*id*/ ctx[0], 10) },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(topcontainer.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				mount_component(topcontainer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const topcontainer_changes = {};
				if (dirty & /*id*/ 1) topcontainer_changes.id = parseInt(/*id*/ ctx[0], 10);
				topcontainer.$set(topcontainer_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(topcontainer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(topcontainer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(topcontainer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TopSubPage', slots, []);
		let { id } = $$props;

		$$self.$$.on_mount.push(function () {
			if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
				console.warn("<TopSubPage> was created without expected prop 'id'");
			}
		});

		const writable_props = ['id'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopSubPage> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		$$self.$capture_state = () => ({ TopContainer, id });

		$$self.$inject_state = $$props => {
			if ('id' in $$props) $$invalidate(0, id = $$props.id);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id];
	}

	class TopSubPage extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TopSubPage",
				options,
				id: create_fragment$1.name
			});
		}

		get id() {
			throw new Error("<TopSubPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<TopSubPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\App.svelte generated by Svelte v4.2.20 */

	// (28:0) <Router {url}>
	function create_default_slot(ctx) {
		let route0;
		let t0;
		let route1;
		let t1;
		let route2;
		let t2;
		let route3;
		let t3;
		let route4;
		let t4;
		let route5;
		let t5;
		let route6;
		let t6;
		let route7;
		let t7;
		let route8;
		let current;

		route0 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/`,
					component: MainPage
				},
				$$inline: true
			});

		route1 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/now`,
					component: NowPage
				},
				$$inline: true
			});

		route2 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/popular`,
					component: PopularPage
				},
				$$inline: true
			});

		route3 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/upcoming`,
					component: UpcomingPage
				},
				$$inline: true
			});

		route4 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/top`,
					component: TopPage
				},
				$$inline: true
			});

		route5 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/now/:id`,
					component: NowSubPage
				},
				$$inline: true
			});

		route6 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/popular/:id`,
					component: PopularSubPage
				},
				$$inline: true
			});

		route7 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/upcoming/:id`,
					component: UpcomingSubPage
				},
				$$inline: true
			});

		route8 = new Route({
				props: {
					path: `${CONFIG.BASE_URL}/top/:id`,
					component: TopSubPage
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(route0.$$.fragment);
				t0 = space();
				create_component(route1.$$.fragment);
				t1 = space();
				create_component(route2.$$.fragment);
				t2 = space();
				create_component(route3.$$.fragment);
				t3 = space();
				create_component(route4.$$.fragment);
				t4 = space();
				create_component(route5.$$.fragment);
				t5 = space();
				create_component(route6.$$.fragment);
				t6 = space();
				create_component(route7.$$.fragment);
				t7 = space();
				create_component(route8.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(route0, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(route1, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(route2, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(route3, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(route4, target, anchor);
				insert_dev(target, t4, anchor);
				mount_component(route5, target, anchor);
				insert_dev(target, t5, anchor);
				mount_component(route6, target, anchor);
				insert_dev(target, t6, anchor);
				mount_component(route7, target, anchor);
				insert_dev(target, t7, anchor);
				mount_component(route8, target, anchor);
				current = true;
			},
			p: noop$1,
			i: function intro(local) {
				if (current) return;
				transition_in(route0.$$.fragment, local);
				transition_in(route1.$$.fragment, local);
				transition_in(route2.$$.fragment, local);
				transition_in(route3.$$.fragment, local);
				transition_in(route4.$$.fragment, local);
				transition_in(route5.$$.fragment, local);
				transition_in(route6.$$.fragment, local);
				transition_in(route7.$$.fragment, local);
				transition_in(route8.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(route0.$$.fragment, local);
				transition_out(route1.$$.fragment, local);
				transition_out(route2.$$.fragment, local);
				transition_out(route3.$$.fragment, local);
				transition_out(route4.$$.fragment, local);
				transition_out(route5.$$.fragment, local);
				transition_out(route6.$$.fragment, local);
				transition_out(route7.$$.fragment, local);
				transition_out(route8.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
					detach_dev(t2);
					detach_dev(t3);
					detach_dev(t4);
					detach_dev(t5);
					detach_dev(t6);
					detach_dev(t7);
				}

				destroy_component(route0, detaching);
				destroy_component(route1, detaching);
				destroy_component(route2, detaching);
				destroy_component(route3, detaching);
				destroy_component(route4, detaching);
				destroy_component(route5, detaching);
				destroy_component(route6, detaching);
				destroy_component(route7, detaching);
				destroy_component(route8, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_default_slot.name,
			type: "slot",
			source: "(28:0) <Router {url}>",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let t0;
		let header;
		let t1;
		let router;
		let t2;
		let footer;
		let current;
		header = new Header({ $$inline: true });

		router = new Router({
				props: {
					url: /*url*/ ctx[0],
					$$slots: { default: [create_default_slot] },
					$$scope: { ctx }
				},
				$$inline: true
			});

		footer = new Footer({ $$inline: true });

		const block = {
			c: function create() {
				t0 = space();
				create_component(header.$$.fragment);
				t1 = space();
				create_component(router.$$.fragment);
				t2 = space();
				create_component(footer.$$.fragment);
				document.title = "MOVING";
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t0, anchor);
				mount_component(header, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(router, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(footer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const router_changes = {};
				if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

				if (dirty & /*$$scope*/ 2) {
					router_changes.$$scope = { dirty, ctx };
				}

				router.$set(router_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(header.$$.fragment, local);
				transition_in(router.$$.fragment, local);
				transition_in(footer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(header.$$.fragment, local);
				transition_out(router.$$.fragment, local);
				transition_out(footer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t0);
					detach_dev(t1);
					detach_dev(t2);
				}

				destroy_component(header, detaching);
				destroy_component(router, detaching);
				destroy_component(footer, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		let { url } = $$props;

		$$self.$$.on_mount.push(function () {
			if (url === undefined && !('url' in $$props || $$self.$$.bound[$$self.$$.props['url']])) {
				console.warn("<App> was created without expected prop 'url'");
			}
		});

		const writable_props = ['url'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('url' in $$props) $$invalidate(0, url = $$props.url);
		};

		$$self.$capture_state = () => ({
			Example,
			Router,
			Route,
			Header,
			Footer,
			MainPage,
			NowPage,
			PopularPage,
			UpcomingPage,
			TopPage,
			NowSubPage,
			PopularSubPage,
			UpcomingSubPage,
			TopSubPage,
			url
		});

		$$self.$inject_state = $$props => {
			if ('url' in $$props) $$invalidate(0, url = $$props.url);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [url];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}

		get url() {
			throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set url(value) {
			throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const app = new App({
		target: document.body,
		props: {
			name: 'world'
		}
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
