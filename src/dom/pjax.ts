/**
 * A simple class that implements fetches.
 */
export class pjax {



    /**
     *  Makes a fetch to url and filter the result with a query selector.
     *
     *
     * ```
     * import { pjax } from 'yano-js/lib/dom/pjax';
     *
     * pjax.fetch('/my-page', '.hello-div').then((result)=> {
     *
     *    console.log(result['queryHtml']);  // The fetch result.  HTML as string.
     *    console.log(result['fullPageHtml']);  // The full page html of the fetch paged.
     *    console.log(result['head']);  // The head content of the fetched page.
     *
     *
     *    // Inject the result into a page.
     *    document.querySelector('.mydiv').innerH:TML = result['queryHtml'];
     *
     *    // Update the head if you want.
     *    document.querySelector('head').innerHTML = result['head'];
     *
     * })
     * ```
     *
     * @param url
     * @param querySelector
     */
    static fetch(
        // The URL to fetch.
        url:string,
        // After fetching, filter the result by running a query selector.
        querySelector:string
        ):Promise<Object> {
        return new Promise((resolve, error) => {
            fetch(url).then((response)=> {
                return response.text();
            }).then((html:string)=> {
                resolve({
                    queryHtml: pjax.queryHtmlString(html, querySelector),
                    fullPageHtml: html,
                    head: pjax.getHead(html)
                });
            }).catch((err)=> {
                error(err);
            })
        });
    }


    /**
     * Given an html string, queires the content.
     */
    static queryHtmlString(html:string, targetElementQuerySelection:string):string {
        let tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = html;
        return tmp.body.querySelector(targetElementQuerySelection).innerHTML;
    }


    /**
     * Given an html string, returns the head.
     */
    static getHead(html:string) {
        let tmp = document.implementation.createHTMLDocument();
        tmp.documentElement.innerHTML = html;
        return tmp.head.innerHTML;
    }


}