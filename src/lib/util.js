/* eslint camelcase: [0] */
/* eslint no-unused-vars: [0] */
const print = s => console.log(`[util] ${s}`);

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.trunc(Math.random() * (max - min + 1)) + min;

// Get the norm for `val` between `min` and `max`.
// Ex. norm(75, 0, 100) ---> 0.75
const norm = (val, min, max) => (val - min) / (max - min);

// Apply `norm` (the linear interpolate value) to the range
// between `min` and `max` (usually between `0` and `1`).
// Ex. lerp(0.5, 0, 100) ---> 50
const lerp = (norm, min, max) => min + (max - min) * norm;

// Limit the value to a certain range.
// Ex. clamp(5000, 0, 100) ---> 100
const clamp = (val, min, max) => Math.min(
  Math.max(val, Math.min(min, max)),
  Math.max(min, max)
);

// Get a distance between two points.
const distance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt((dx * dx) + (dy * dy));
};

const deg = a => a * (180 / Math.PI);
const rad = a => a * (Math.PI / 180);

// Find the radian from `p2` to `p1`.
// Ex. deg(angle({ x: 10, y: 10 }, { x: 0, y: 0 })) ---> 45
const angle = (p1, p2) => Math.atan2(p1.y - p2.y, p1.x - p2.x);

// See if the value falls within the given range.
const inRange = (val, min, max) => (val >= min && val <= max);

// See if `x` and `y` falls into the bounds made by `rect`.
const withinRect = (p, rect) => (
  inRange(p.x, rect.x, rect.x + rect.width) &&
    inRange(p.y, rect.y, rect.y + rect.height)
);

// See if the given point falls within the arc's radius.
const withinArc = (p, a) => distance(p, a) <= a.radius;

/**
 * Restricts the sequential calls to allow only one call per given period of time.
 * @function
 * @param {Function} f - Function for which you want the debounce effect.
 * @param {number} wait - Period of time to limit the function call.
 * @param {Object} [context=] - Optional. Specify when a certain context is needed upon the function call.
 * @returns {Function}
 * @example
 * window.addEventListener(
 *   'resize',
 *   debounce(resize.bind(this), 150),
 *   false
 * );
 */
const debounce = (f, wait, context = this) => {
  let timeout = null;
  let args = null;
  const g = () => Reflect.apply(f, context, args);
  return (...o) => {
    args = o;
    if (timeout) {
      clearTimeout(timeout);
    }
    else {
      g(); // For the first time...
    }
    timeout = setTimeout(g, wait);
  };
};

export default {
  rand,
  randInt,
  norm,
  lerp,
  clamp,
  distance,
  deg,
  rad,
  angle,
  inRange,
  withinRect,
  withinArc,
  debounce
}
