/**
 * Type declarations for 'he' HTML entity encoder/decoder
 * https://github.com/mathiasbynens/he
 */
declare module 'he' {
  /**
   * Decodes HTML entities in a string
   */
  export function decode(
    text: string,
    options?: {
      isAttributeValue?: boolean;
      strict?: boolean;
    }
  ): string;

  /**
   * Encodes text to HTML entities
   */
  export function encode(
    text: string,
    options?: {
      useNamedReferences?: boolean;
      decimal?: boolean;
      encodeEverything?: boolean;
      strict?: boolean;
      allowUnsafeSymbols?: boolean;
    }
  ): string;

  /**
   * Escapes special characters in text
   */
  export function escape(text: string): string;

  /**
   * Unescapes HTML entities
   */
  export function unescape(
    text: string,
    options?: {
      isAttributeValue?: boolean;
      strict?: boolean;
    }
  ): string;
}
