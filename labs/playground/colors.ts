/**
 * Color utility functions.
 * @see http://krazydad.com/tutorials/makecolors.php
 * @hidden
 */
export class colors {
  static rgbToHex(r: number, g: number, b: number) {
    return colors.byte2Hex(r) + colors.byte2Hex(g) + colors.byte2Hex(b);
  }

  static rgb2Color(r: number, g: number, b: number) {
    return '0x' + colors.byte2Hex(r) + colors.byte2Hex(g) + colors.byte2Hex(b);
  }

  static byte2Hex(n: number) {
    const nybHexString = '0123456789ABCDEF';
    return (
      String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
      nybHexString.substr(n & 0x0f, 1)
    );
  }

  static hexToRgb(hexValue: string) {
    const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hex = hexValue.replace(rgx, (m: any, r: any, g: any, b: any) => {
      return r + r + g + g + b + b;
    });
    const rgb: any = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  static hslToRgb(hslString: any) {
    const hsl: any = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslString);
    const h = parseInt(hsl[1]) / 360;
    const s = parseInt(hsl[2]) / 100;
    const l = parseInt(hsl[3]) / 100;
    const hue2rgb = function (p: any, q: any, t: any) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r: any, g: any, b: any;
    if (s == 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
  }
}
