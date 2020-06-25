


/**
 * A helper class to work with cookies.
 */
export class cookies {



    /**
     * Gets a specific cookie entry by name.
     * @param name
     *
     * ```ts
     * cookie.getItem('myCookie'); // return cookie value.
     * ```
     */
    static getItem(name: string) {
        let result = document.cookie.match("(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)")
        return result ? result.pop() : ""
    }



    /**
     * Sets a specific cookie.
     * @param name
     * @param value
     * @param days
     * ```ts
     * cookie.setItem('userOptedOut', 'true', 10000); // return cookie value.
     * ```
     * https://stackoverflow.com/questions/7215547/how-to-update-and-delete-a-cookie
     */
    static setItem(name: string, value: string, days: number) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toUTCString();
        } else {
            var expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }


    /**
     * Deletes a given cookie by name.
     * @param name
     */
    static deleteItem(name:string) {
        cookies.setItem(name,"",-1);
    }


}