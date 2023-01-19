import {EventManager, EventDispatcher} from '../ui/events';
import * as time from './time';

export interface TimerConfig {
  // Duration in ms.
  duration: number;
  // Whether to repeat the timer.  If false, runs
  // only once.  Defaults to false.
  repeat?: boolean;
}

enum TimerEvent {
  START = 'START',
  PAUSED = 'PAUSED',
  UNPAUSED = 'UNPAUSED',
  TRIGGERED = 'TRIGGERED',
}

/**
 * A subscribable timer.
 *
 * Basic Usage:
 *
 * ```ts
 * const myTimer = new Timer({
 *    duration: 5000,
 *    repeat: false
 * })
 *
 * // Called on timer is triggered
 * myTimer.on(Timer.Event.TRIGGERED, ()=> {
 *    console.log('timer is done');
 * })
 *
 * // Start it.
 * myTimer.start();
 *
 * // Later dispose it.
 * myTimer.dispose();
 * ```
 *
 * Advanced Usage - repeating timer and pause / unpausing.
 *
 * ```ts
 * const myTimer = new Timer({
 *    duration: 5000,
 *    repeat: true
 * })
 *
 * // Called every 5000ms.
 * myTimer.on(Timer.Event.TRIGGERED, ()=> {
 *    console.log('timer is done');
 * })
 *
 * myTimer.start();
 *
 * // Later
 * myTimer.pause();
 * myTimer.unpause();
 *
 * // Call this on page disposal to prevent any timers running later.
 * myTimer.dispose();
 *
 * ```
 *
 */
export class Timer implements EventDispatcher {
  private eventManager: EventManager;
  private settings: TimerConfig;
  private timerId: number | null = null;
  private startTime: number | null = null;
  private timeRemaining: number | null = null;
  constructor(config?: TimerConfig) {
    this.eventManager = new EventManager();
    this.settings = {
      ...{
        duration: 5000,
        repeat: false,
      },
      ...(config || {}),
    };
  }

  static Event = TimerEvent;

  start() {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }

    this.startTime = Date.now();
    this.eventManager.dispatch(Timer.Event.START);
    this.createTimer(this.settings.duration);
  }

  private createTimer(duration: number) {
    this.timerId = window.setTimeout(() => {
      this.eventManager.dispatch(Timer.Event.TRIGGERED);

      // If repeating start again.
      if (this.settings.repeat) {
        this.start();
      } else {
        this.dispose();
      }
    }, duration);
  }

  pause() {
    this.eventManager.dispatch(Timer.Event.PAUSED);

    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }
    this.timeRemaining =
      this.settings.duration - (Date.now() - (this.startTime || 0));
  }

  unpause() {
    const timePast = this.settings.duration - this.timeRemaining!;
    this.startTime = Date.now() - timePast;
    this.eventManager.dispatch(Timer.Event.UNPAUSED);
    this.createTimer(this.timeRemaining!);
  }

  on(event: string, callback: Function) {
    this.eventManager.on(event, callback);
  }

  off(event: string, callback: Function) {
    this.eventManager.off(event, callback);
  }

  dispose() {
    this.eventManager.dispose();
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }
  }
}
