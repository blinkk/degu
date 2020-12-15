import { USER_AGENT_STRING } from '../string';
import { MultiValueMap } from '../../map/multi-value';
import { map } from '../../iterable-iterator/map';
import { reverseMap } from '../../map/reverse-map';
import { is } from '../..';
import { stringf } from '../../string/stringf';

type TOffset = [string, number];

abstract class Browser {

  static getAsCSSModifier() {
    return this.browserName.toLowerCase().replace(/\s/, '-');
  }

  static getName(): string {
    return this.browserName;
  }

  static isCurrentBrowser(): boolean {
    return this.getUaids().some((uaid: string) =>
      stringf.contains(USER_AGENT_STRING, uaid)
    );
  }

  static getVersion(): number {
    const [unusedA, offsets]: [string, TOffset[]] = this.uaidsWithOffsets.find(
      ([uaid, unusedB]: [string, TOffset[]]) => stringf.contains(USER_AGENT_STRING, uaid)
    );

    const [browserName, offsetToVersionNumber]: TOffset =
      offsets.find(
        (offset: TOffset) => stringf.contains(USER_AGENT_STRING, <string>offset[0]));

    const startIndex: number =
      USER_AGENT_STRING.indexOf(<string>browserName) + offsetToVersionNumber;

    const rawVersion = USER_AGENT_STRING.substring(startIndex);

    const trimmedVersion: string = rawVersion
      .split(';')[0]
      .split(' ')[0]
      .split(')')[0];
    return parseFloat(trimmedVersion);
  }

  static getMajorVersion(): number {
    return Math.floor(this.getVersion());
  }

  static getSupportedStyleValue(
    genericStyleProperty: string,
    genericStyleValue: string
  ): string {
    const supportedValue =
      this.genericStyleValueToSupported
        .get([genericStyleProperty, genericStyleValue]);
    return is.defined(supportedValue) ? supportedValue : genericStyleValue;
  }

  static getGenericStyleValue(
    genericStyleProperty: string,
    supportedStyleValue: string
  ): string {
    const genericValue =
      this.getSupportedStyleValueToGenericMap_()
        .get([genericStyleProperty, supportedStyleValue]);
    return is.defined(genericValue) ? genericValue : supportedStyleValue;
  }

  static getSupportedStyleProperty(
    genericStyleProperty: string
  ): string {
    const supportedProperty =
      this.genericStylePropertyToSupported.get(genericStyleProperty);
    return is.defined(supportedProperty) ?
      supportedProperty : genericStyleProperty;
  }

  static getGenericStyleProperty(
    supportedStyleProperty: string
  ): string {
    const genericProperty =
      this.getSupportedStylePropertyToGenericMap_().get(supportedStyleProperty);
    return is.defined(genericProperty) ?
      genericProperty : supportedStyleProperty;
  }
  protected static browserName: string;
  protected static uaidsWithOffsets: Array<[string, TOffset[]]> = [];
  protected static genericStylePropertyToSupported: Map<string, string> =
    new Map();
  protected static supportedStylePropertyToGeneric: Map<string, string>;
  protected static genericStyleValueToSupported
    : MultiValueMap<string, string> = new MultiValueMap();
  protected static supportedStyleValueToGeneric: MultiValueMap<string, string>;

  protected static getUaids(): string[] {
    return this.uaidsWithOffsets.map(([uaid, x]: [string, TOffset[]]) => uaid);
  }

  protected static getSupportedStyleValueToGenericMap_(
    // void
  ): MultiValueMap<string, string> {
    if (!this.supportedStyleValueToGeneric) {
      this.supportedStyleValueToGeneric =
        new MultiValueMap([
          ...map<[string[], string], [string[], string]>(
            this.genericStyleValueToSupported.entries(),
            ([[genericProperty, genericValue], supportedValue]) => {
              return [[genericProperty, supportedValue], genericValue];
            })
        ]);
    }
    return this.supportedStyleValueToGeneric;
  }

  protected static getSupportedStylePropertyToGenericMap_() {
    if (!this.supportedStylePropertyToGeneric) {
      this.supportedStylePropertyToGeneric =
        reverseMap(this.genericStylePropertyToSupported);
    }
    return this.supportedStylePropertyToGeneric;
  }
}

export { Browser, TOffset };
