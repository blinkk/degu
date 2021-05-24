/**
 * Gets a specific cookie entry by name.
 * @param name
 *
 * ```ts
 * cookie.getItem('myCookie'); // return cookie value.
 * ```
 */
export function getItem(name: string) {
  const result = document.cookie.match(
    '(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)'
  );
  return result ? result.pop() : '';
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
export function setItem(name: string, value: string, days: number) {
  let expires;
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '';
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

/**
 * Deletes a given cookie by name.
 * @param name
 */
export function deleteItem(name: string) {
  setItem(name, '', -1);
}

/**
 * A helper class to work with cookies.
 */
export const cookies = {
  getItem,
  setItem,
  deleteItem,
};
