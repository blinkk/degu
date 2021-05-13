/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dat from 'dat.gui';
import * as is from '../is/is';
import * as color from '../mathf/color';


export interface DatGuifFolder {
  name: string;
  // Date Gui folder instance.
  gui: dat.GUI;
}

export interface guiDisplayConfig {
  keyName: string;
  /**
   * Optional min value to cap number range.
   */
  min?: number;
  /**
   * Optional max value to cap number range.
   */
  max?: number;
  /**
   * Optional step value.
   */
  step?: number;

  /**
   * Optional step value.
   */
  options?: any;

  /**
   * Optional call back when this config update.
   */
  callback: Function;
}

/**
 * Wrapper around https://github.com/dataarts/dat.gui/blob/master/API.md
 * to make an object output easier.
 *
 * ```ts
 *
 * const gui = new Datguif();
 *
 * // Register an update callback.
 * gui.onUpdate(()=> {
 *   console.log('gui controls updated');
 * })
 *
 *
 * gui.addFolder('Lights').open();
 * gui.addFolder('Other Config');
 *
 *
 * // Add a subfolder to lights
 * gui.addFolder('Directional Lights', 'Lights');
 * gui.addFolder('Atmosphere Lights', 'Lights');
 *
 *
 * const otherConfig = {
 *   'scale': 0.5,
 *   'optimize': false
 * }
 *
 * const directionalLight = {
 *   'intensity': 0.5,
 *   'show': false,
 *   'castShadow': true,
 * }
 *
 *
 * // Add the directional light to the Directional Lights folder.
 * // Only show intensity and castShadow properties.
 * gui.addObjectToFolder('Directional Lights',
 *   directionalLights,
 *  [
 *   { keyName: 'castShadow'},
 *   { keyName: 'intensity', min: 0, max: 100, callback: ()=> {
 *        console.log('intensity just changed');
 *   }},
 *   { keyName: 'ease', ['linear', 'easeInOutQuad']}
 * ]);
 *
 *
 * // Add the scale option to the Other config folder.
 * gui.addObjectPropertyToFolder(
 *   'Other Config',
 *   otherConfig,
 *  {
 *    keyname: 'scale'
 *  }
 * )
 *
 *
 * // Add functions.
 * guid.addToFolder(
 *  ()=> {
 *    // refresh code.
 *    console.log('hohoho');
 *  },
 *  'Refresh'
 * )
 *
 *
 * ```
 */
export class Datguif {
  private gui: dat.GUI;
  private folders: Array<DatGuifFolder>;
  private updateCallbacks: Array<Function>;

  constructor(
    //@see https://github.com/dataarts/dat.gui/blob/master/API.md#new_GUI_new
    guiParams: dat.GUIParams
  ) {
    const options: any = guiParams;
    if (!options) {
      options.load = JSON;
    }

    this.gui = new dat.GUI(options);
    this.folders = [];
    this.updateCallbacks = [];
  }

  getGui(): dat.GUI {
    return this.gui;
  }

  /**
   * Adds an update callback.
   */
  onUpdate(callback: Function) {
    this.updateCallbacks.push(callback);
  }

  runUpdate() {
    this.updateCallbacks.forEach(callback => {
      callback();
    });
  }

  // Adds a to level button
  addButton(label: string, callback: Function) {
    const id = label.replace(' ', '_');
    const obj: any = {};
    obj[id] = callback;
    this.gui.add(obj, label.replace(' ', '_'));
  }

  /**
   *
   * Add a folder to the datguif system.
   *
   * @param folderName
   * @param parentFolder
   */
  addFolder(folderName: string, parentFolderName?: string): dat.GUI {
    let folder;
    if (this.folderExists(folderName)) {
      throw new Error('Folder names must be unique');
    }

    if (parentFolderName) {
      const parentFolder: dat.GUI = this.getFolder(parentFolderName).gui;
      folder = parentFolder.addFolder(folderName);
    } else {
      folder = this.gui.addFolder(folderName);
    }
    this.folders.push({
      name: folderName,
      gui: folder,
    });
    return folder;
  }

  /**
   * Checks if a folder of a given name already exists.
   */
  folderExists(folderName: string): boolean {
    const folder = this.folders.filter(f => {
      return f.name === folderName;
    })[0];

    return !!folder;
  }

  getFolder(folderName: string): DatGuifFolder {
    const folder = this.folders.filter(f => {
      return f.name === folderName;
    })[0];

    if (!folder) {
      throw new Error('No folder named:' + folder + ' was found');
    }

    return folder;
  }

  addToFolder(folderName: string, obj: Object, keyName: string) {
    const folder = this.getFolder(folderName);
    folder.gui.add(obj, keyName);
  }

  addObjectPropertyToFolder(
    folderName: string,
    obj: any,
    config: guiDisplayConfig
  ) {
    const folder = this.getFolder(folderName);
    const value = obj[config.keyName];

    if (!is.defined(value)) {
      return;
    }

    // If this looks "color" like.  Convert it to color and then handle
    // the update when it comes back. (Support for Three.Color)
    if (value.r && value.g && value.b) {
      const colorObj: any = {};
      colorObj[config.keyName] = color.normalizedRgbToRgb(
        color.colorRgbToRgb(value)
      );

      folder.gui.addColor(colorObj, config.keyName).onChange(() => {
        // // Convert it back.
        const converted = {
          r: color.rgbToNormalizedRgb(colorObj[config.keyName])[0],
          g: color.rgbToNormalizedRgb(colorObj[config.keyName])[1],
          b: color.rgbToNormalizedRgb(colorObj[config.keyName])[2],
        };
        obj[config.keyName] = converted;

        config.callback && config.callback();
        this.runUpdate();
      });

      return;
    }

    // Support for #FFFFFF type colors.
    if (is.cssHex(value)) {
      folder.gui.addColor(obj, config.keyName).onChange(() => {
        config.callback && config.callback();
        this.runUpdate();
      });
      return;
    }

    if (is.defined(config.options)) {
      folder.gui.add(obj, config.keyName, config.options).onChange(() => {
        config.callback && config.callback();
        this.runUpdate();
      });
      return;
    }

    if (is.defined(config.min) && is.defined(config.max)) {
      folder.gui
        .add(obj, config.keyName, +config.min!, +config.max!)
        .step(config.step || 0.1)
        .onChange(() => {
          config.callback && config.callback();
          this.runUpdate();
        });
      return;
    }

    folder.gui.add(obj, config.keyName).onChange(() => {
      config.callback && config.callback();
      this.runUpdate();
    });
  }

  addObjectToFolder(
    folderName: string,
    obj: Object,
    mapping: Array<guiDisplayConfig>
  ) {
    this.gui.remember(obj);
    for (const key in obj) {
      // Check if this key should be displayed.
      const config = mapping.filter(c => {
        return c.keyName === key;
      })[0];

      if (config) {
        this.addObjectPropertyToFolder(folderName, obj, config);
      }
    }
  }
}
/* eslint-enable */
