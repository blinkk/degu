

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

}