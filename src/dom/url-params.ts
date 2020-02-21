
/**
 * Utility classes for url manipulation.
 */
export class urlParams {


    /**
     * Checks if a given param is present in the url AND is set to 'true'
     *
     * ```
     * urlParams.isTrue('sup');
     *
     * // http://mydomain.com?sup=true --> true
     * // http://mydomain.com?hello&sup=true  --> true
     *
     * // http://mydomain.com --> false
     * // http://mydomain.com?sup --> false
     * // http://mydomain.com?sup=false --> false
     * ```
     */
    static isTrue(paramName:string):boolean {
        let param = window.location.search.split(paramName + '=')[1];
        param = param && param.split('&')[0];
        return param == 'true';
    }

    /**
     * Checks if a given param is present in the url AND is set to 'true'
     *
     * ```
     * urlParams.getValue('sup');
     *
     * // http://mydomain.com?sup=hello --> hello
     * // http://mydomain.com?hello&sup=hello  --> hello
     *
     * // http://mydomain.com --> null
     * // http://mydomain.com?sup --> null
     * ```
     */
    static getValue(paramName:string):string {
        let param = window.location.search.split(paramName + '=')[1];
        param = param && param.split('&')[0];
        return param || null;
    }


    /**
     * Allows you to loop through each url param.
     *
     * ```
     * Given: mydomain.com?name=scott&location=mars
     *
     * const params = urlParams.asObject(window.location.search);
     *
     * console.log(params); // { name: "scott", location: "mars"}
     *
     * ```
     * @param callback
     */
    static asObject(url:string):Object  {
        const query = url.substr(1);
        let result = {};
        query.split("&").forEach((section:any)=> {
          let item = section.split("=");

          if(item[0] == "") {
              return;
          }

          result[item[0]] = decodeURIComponent(item[1]);
        });

        return result;
    }

}