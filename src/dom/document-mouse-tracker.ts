
import { MouseTracker } from './mouse-tracker';


/**
 * A global singleton instance of the mouse tracker attached to the document body.
 */
const documentMouseTracker = new MouseTracker(document.body, () => { }, false);
export default documentMouseTracker;