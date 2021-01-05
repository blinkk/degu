

export class stringf {

    /**
     * Slugifies a string.
     * https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1
     */
    static slugify(str:string) {
        const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
        const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
        const p = new RegExp(a.split('').join('|'), 'g')

        return str.toString().toLowerCase()
          .replace(/\s+/g, '-')
          .replace(p, c => b.charAt(a.indexOf(c)))
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '')
    }


    /**
     * A basic zero padding.
     *
     *
     * ```
     * stringf.zeroPad('1') ---> 01
     * stringf.zeroPad('0') ---> 00
     * stringf.zeroPad('9') ---> 09
     * stringf.zeroPad('10') ---> 10
     * stringf.zeroPad('22') ---> 10
     * ```
     *
     * @param str
     */
    static zeroPad(str: string) {
       if (str.toString().length == 1) {
           str  = "0" + str;
        }
        return str;
    }


    // https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    static uuid():string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }


    /**
     * Given a number, outputs it with commas.
     * @param x
     */
    static numberWithCommas(x:number):string {
      return x.toLocaleString();
    }



    /**
     * Only returns alpha numberic values.  Handy for quick sanitization
     * in selext cases.
     * @param x
     */
    static alphaNumeric(x:string):string {
        return x && x.replace(/[^A-Za-z0-9\.]/gi,'');
    }

    static numeric(x:string):string {
       return x && x.replace(/[^0-9\.]/gi,'');
    }
}
