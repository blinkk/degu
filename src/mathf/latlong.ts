import { mathf } from './mathf';


/**
 *
 *
 * This static class draws a lot to this stackoverflow link.
 * @see https://stackoverflow.com/questions/21279559/geolocation-closest-locationlat-long-from-my-position
 * @static
 */
export class latlong {
    public static pythagorasEquiRectangular(lat1: number, lon1: number, lat2: number, lon2: number) {
        lat1 = mathf.degreeToRadian(lat1);
        lat2 = mathf.degreeToRadian(lat2);
        lon1 = mathf.degreeToRadian(lon1);
        lon2 = mathf.degreeToRadian(lon2);
        var R = 6371; // km
        var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
        var y = (lat2 - lat1);
        var d = Math.sqrt(x * x + y * y) * R;
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
     * var result = logLong.nearestLatLong(myLat, myLong, location);
     *
     * console.log(result.closetIndex);
     * console.log(result.closestLocation);
     * ```
     * @param latitude number
     * @param longitude number
     * @param locations An array of lat/longs.  [ [lat,long], [lat,long]  ]
     * @return Object
     */
    public static nearestLatLong(latitude: number, longitude: number, locations:Array<Array<number>>):Object {
        var thres = 99999;
        var closest;

        for (var i = 0; i < locations.length; ++i) {
            var diff = latlong.pythagorasEquiRectangular(latitude, longitude, locations[i][0], locations[i][1]);
            if (diff < thres) {
                closest = i;
                thres = diff;
            }
        }

        return {
            closestLocation: locations[closest],
            closestIndex: closest
        }
    }
}