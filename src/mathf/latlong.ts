import {mathf} from './mathf';

/**
 *
 *
 * This static class draws a lot to this stackoverflow link.
 * @see https://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position
 * @static
 */
export class latlong {
  public static getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    lat1 = mathf.degreeToRadian(lat1);
    lat2 = mathf.degreeToRadian(lat2);
    lon1 = mathf.degreeToRadian(lon1);
    lon2 = mathf.degreeToRadian(lon2);
    const R = 6371; // km
    const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    const y = lat2 - lat1;
    const d = Math.sqrt(x * x + y * y) * R;
    return d;
  }

  /**
   * Given a lat/longs, finds the closets lat,long in list of lat/longs
   * ```ts
   *
   * var locations = [
   *   [lat, long],
   *   [lat, long],
   *   [lat, long],
   *   [lat, long],
   * ];
   *
   * var result = logLong.nearestLatLong(myLat, myLong, locations);
   *
   * console.log(result.closetIndex);
   * console.log(result.closestLocation);
   * ```
   * @param latitude number
   * @param longitude number
   * @param locations An array of lat/longs.  [ [lat,long], [lat,long]  ]
   * @return Object
   */
  public static nearestLatLong(
    latitude: number,
    longitude: number,
    locations: Array<Array<number>>
  ): Object {
    let thres = 99999;
    let closest;

    for (let i = 0; i < locations.length; ++i) {
      const diff = latlong.getDistance(
        latitude,
        longitude,
        locations[i][0],
        locations[i][1]
      );
      if (diff < thres) {
        closest = i;
        thres = diff;
      }
    }

    return {
      closestLocation: closest ? locations[closest] : null,
      closestIndex: closest,
    };
  }

  /**
   * Given your current location and  a list of lat/longs, finds the distance of each.
   *
   * ```ts
   *
   * var locations = [
   *   [lat, long],
   *   [lat, long],
   *   [lat, long],
   *   [lat, long],
   * ];
   *
   * var result = logLong.getDistanceToLatLongs(myLat, myLong, locations);
   *
   * console.log(result);
   *
   * //  [
   *         {
   *             'lat' : xxx,
   *             'long': xxx,
   *             'distanceKm': x (number)
   *             'distanceMiles': x (number)
   *         }
   *         ...
   *     ]
   * ```
   */
  public static getDistanceToLatLongs(
    lat: number,
    long: number,
    locations: Array<Array<number>>
  ): Array<Object> {
    const result: Array<Object> = [];
    for (let i = 0; i < locations.length; ++i) {
      const diff = latlong.getDistance(
        lat,
        long,
        locations[i][0],
        locations[i][1]
      );
      const latLongInfo = {
        lat: locations[i][0],
        long: locations[i][1],
        distanceKm: diff,
        distanceMiles: diff * 0.621371,
      };
      result.push(latLongInfo);
    }

    return result;
  }
}
