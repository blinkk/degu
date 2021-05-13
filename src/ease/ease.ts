/**
 * Eases the value in with a Sine curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeInSine(t: number) {
  return t === 0 || t === 1 ? t : 1 - Math.cos(t * (Math.PI / 2));
}

/**
 * Eases the value out with a Sine curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeOutSine(t: number) {
  return t === 0 || t === 1 ? t : Math.sin(t * (Math.PI / 2));
}

/**
 * Eases the value in and out with a Sine curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeInOutSine(t: number) {
  return t === 0 || t === 1 ? t : -0.5 * (Math.cos(Math.PI * t) - 1);
}

/**
 * Eases the value in with a quadratic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeInQuad(t: number) {
  return t === 0 || t === 1 ? t : t * t;
}

/**
 * Eases the value out with a quadratic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeOutQuad(t: number) {
  return t === 0 || t === 1 ? t : t * (2 - t);
}

/**
 * Eases the value in with a cubic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInCubic(t: number) {
  return t === 0 || t === 1 ? t : t * t * t;
}

/**
 * Eases the value in and out with a quadratic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeInOutQuad(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return 2 * t * t;
  } else {
    return -1 + (4 - 2 * t) * t;
  }
}

/**
 * Eases the value out with a cubic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutCubic(t: number) {
  return t === 0 || t === 1 ? t : --t * t * t + 1;
}

/**
 * Eases the value in and out with a cubic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 */
export function easeInOutCubic(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return 4 * t * t * t;
  } else {
    return (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
}

/**
 * Eases the value in with a quartic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInQuart(t: number) {
  return t === 0 || t === 1 ? t : t * t * t * t;
}

/**
 * Eases the value out with a quartic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutQuart(t: number) {
  return t === 0 || t === 1 ? t : 1 - --t * t * t * t;
}

/**
 * Eases the value in and out with a quartic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutQuart(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return 8 * t * t * t * t;
  } else {
    return 1 - 8 * --t * t * t * t;
  }
}

/**
 * Eases the value in with a quintic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInQuint(t: number) {
  return t === 0 || t === 1 ? t : t * t * t * t * t;
}

/**
 * Eases the value out with a quintic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutQuint(t: number) {
  return t === 0 || t === 1 ? t : 1 + --t * t * t * t * t;
}

/**
 * Eases the value in and out with a quintic curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutQuint(t: number) {
  return t === 0 || t === 1
    ? t
    : t < 0.5
    ? 16 * t * t * t * t * t
    : 1 + 16 * --t * t * t * t * t;
}

/**
 * Eases the value in with an exponential curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInExpo(t: number) {
  return t === 0 || t === 1 ? t : Math.pow(2, 10 * (t - 1));
}

/**
 * Eases the value out with an exponential curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutExpo(t: number) {
  return t === 0 || t === 1 ? t : 1 - Math.pow(2, -10 * t);
}

/**
 * Eases the value in and out with an exponential curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return 0.5 * Math.pow(2, 10 * (t * 2 - 1));
  } else {
    return 0.5 * (2 - Math.pow(2, -10 * (t * 2 - 1)));
  }
}

/**
 * Eases the value in with a circular curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInCirc(t: number) {
  return t === 0 || t === 1 ? t : 1 - Math.sqrt(1 - t * t);
}

/**
 * Eases the value out with a circular curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutCirc(t: number) {
  return t === 0 || t === 1 ? t : Math.sqrt(1 - (t - 1) * (t - 1));
}

/**
 * Eases the value in and out with a circular curve.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutCirc(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return -0.5 * (Math.sqrt(1 - t * t * 4) - 1);
  } else {
    return 0.5 * (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1);
  }
}

/**
 * Eases the value in after bounding backwards at the beginning.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInBack(t: number) {
  return t === 0 || t === 1 ? t : t * t * (2.70158 * t - 1.70158);
}

/**
 * Eases the value out after bounding past the end point and back.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutBack(t: number) {
  return t === 0 || t === 1
    ? t
    : (t - 1) * (t - 1) * (2.70158 * (t - 1) + 1.70158) + 1;
}

/**
 * Eases the value in and out with an initial and ending movement beyond the
 * full range.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutBack(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return 0.5 * (t * 2) * (t * 2) * (3.5949095 * (t * 2) - 2.5949095);
  } else {
    return (
      0.5 *
      ((t * 2 - 2) * (t * 2 - 2) * (3.5949095 * (t * 2 - 2) + 2.5949095) + 2)
    );
  }
}

/**
 * Eases the value in with an elastic springy motion.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInElastic(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else {
    return (
      -1 *
      (Math.pow(2, 10 * (t - 1)) *
        Math.sin(((t - 1.075) * (2 * Math.PI)) / 0.3))
    );
  }
}

/**
 * Eases the value out with an elastic springy motion.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutElastic(t: number) {
  return t === 0 || t === 1
    ? t
    : Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
}

/**
 * Eases the value in and out with an elastic springy motion.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutElastic(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return (
      -0.5 *
      (Math.pow(2, 10 * (t * 2 - 1)) *
        Math.sin(((t * 2 - 1.1125) * 2 * Math.PI) / 0.45))
    );
  } else {
    return (
      0.5 *
        Math.pow(2, -10 * (t * 2 - 1)) *
        Math.sin(((t * 2 - 1.1125) * 2 * Math.PI) / 0.45) +
      1
    );
  }
}

/**
 * Eases the value in with a simple physics bounce.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInBounce(t: number) {
  return t === 0 || t === 1 ? t : 1 - easeOutBounce(1 - t);
}

/**
 * Eases the value out with a simple physics bounce.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeOutBounce(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t - 1.5 / 2.75) * (t - 1.5 / 2.75) + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t - 2.25 / 2.75) * (t - 2.25 / 2.75) + 0.9375;
  } else {
    return 7.5625 * (t - 2.625 / 2.75) * (t - 2.625 / 2.75) + 0.984375;
  }
}

/**
 * Eases the value in and out with starting and ending bounces.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function easeInOutBounce(t: number) {
  if (t === 0 || t === 1) {
    return t;
  } else if (t < 0.5) {
    return EASE.easeInBounce(t * 2) * 0.5;
  } else {
    return EASE.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
  }
}

/**
 * Returns the value without any easing. This is only useful if a script is
 * expecting an easing method, but one isn't needed in that instance.
 * @param {number} t Input between 0 and 1.
 * @return {number} Output between 0 and 1.
 *
 */
export function linear(t: number) {
  return t;
}
/**
 * Basis easing functions.
 * @see https://easings.net/en for nice visualization of each.
 *
 */
export const EASE = {
  easeInBack,
  easeInBounce,
  easeInCirc,
  easeInCubic,
  easeInElastic,
  easeInExpo,
  easeInOutBack,
  easeInOutBounce,
  easeInOutCubic,
  easeInOutElastic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutSine,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  easeOutBack,
  easeOutBounce,
  easeOutCirc,
  easeOutCubic,
  easeOutElastic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutSine,
  linear,
};
