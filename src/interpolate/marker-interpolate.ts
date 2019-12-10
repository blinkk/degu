

export interface MarkersInterpolateMarkers {
    name: string,
    time: number
}

/**
 * A class that helps "marker" based timeline points into normalized progress
 * values.
 *
 * Example:
 * Given an object like this:
 * ```
 * const myMarkers = [
 *   { name: 'p1', time: 0.1},
 *   { name: 'p2', time: 2.3}
 *   { name: 'p3', time: 3.3}
 * ]
 *
 * ```
 * You can get normalized progress values by marker names.
 *
 * ```
 * const totalDuration = 5;
 * const myInterpolator = new MarkerInterpolate(myMarkers, 5);
 *
 * console.log(myInterpolater.getProgressByMarker('p1'))  // return 0.02  (0.1/5)
 * console.log(myInterpolater.getProgressByMarker('p2'))  // return 0.46  (2.3/5)
 * console.log(myInterpolater.getProgressByMarker('p3'))  // return 0.66  (3.3/5)
 *
 * ```
 */
export class MarkerInterpolate {

  private markers: Array<MarkersInterpolateMarkers>;
  private totalDuration: number;

  constructor(markers: Array<MarkersInterpolateMarkers>, totalDuration:number) {
      this.markers = markers;
      this.totalDuration = totalDuration;
  }

  getMarkers():Array<MarkersInterpolateMarkers> {
      return this.markers;
  }


  getMarkerByName(name:string) {
      return this.markers.filter((marker)=> {
          return marker.name == name;
      })[0];
  }

  getProgressByMarker(name:string):number {
      const marker = this.getMarkerByName(name);
      console.log(marker);
      return marker.time / this.totalDuration;
  }
}