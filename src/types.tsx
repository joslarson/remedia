type LooseQueryObject = {
  [key: string]: string | Function | boolean | number | undefined;
};

export interface QueryObject extends LooseQueryObject {
  all?: boolean;
  print?: boolean;
  screen?: boolean;
  speech?: boolean;

  anyHover?: 'none' | 'hover';

  anyPointer?: 'none' | 'coarse' | 'fine';

  aspectRatio?: string;
  maxAspectRatio?: string;
  minAspectRatio?: string;

  color?: boolean;
  minColor?: number;
  maxColor?: number;

  colorGamut?: 'srgb' | 'p3' | 'rec2020';

  colorIndex?: boolean;
  minColorIndex?: number;
  maxColorIndex?: number;

  deviceAspectRatio?: string;
  maxDeviceAspectRatio?: string;
  minDeviceAspectRatio?: string;

  deviceHeight?: number | string;
  maxDeviceHeight?: number | string;
  minDeviceHeight?: number | string;

  deviceWidth?: number | string;
  maxDeviceWidth?: number | string;
  minDeviceWidth?: number | string;

  displayMode?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

  forcedColors?: 'none' | 'active';

  grid?: 0 | 1;

  height?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;

  hover?: 'none' | 'hover';

  invertedColors?: 'inverted' | 'none';

  lightLevel?: 'dim' | 'normal' | 'washed';

  monochrome?: boolean;
  minMonochrome?: number;
  maxMonochrome?: number;

  orientation?: 'portrait' | 'landscape';

  overflowBlock?: 'none' | 'scroll' | 'optional-paged' | 'paged';

  overflowInline?: 'none' | 'scroll';

  pointer?: 'none' | 'coarse' | 'fine';

  prefersColorScheme?: 'no-preference' | 'light' | 'dark';

  prefersContrast?: 'no-preference' | 'high' | 'low';

  prefersReducedMotion?: 'no-preference' | 'reduce';

  prefersReducedTransparency?: 'no-preference' | 'reduce';

  scan?: 'interlace' | 'progressive';

  scripting?: 'none' | 'initial-only' | 'enabled';

  update?: 'none' | 'slow' | 'fast';

  /**
   * Matches on the exact width of supplied numeric value.
   * If a number is provided it will be converted to a pixel value.
   * */
  width?: number | string;
  /**
   * Matches on widths less than or equal to the supplied numeric value.
   * If a number is provided it will be converted to a pixel value.
   * */
  maxWidth?: number | string;
  /**
   * Matches on widths greater than or equal to the supplied numeric value.
   * If a number is provided it will be converted to a pixel value.
   */
  minWidth?: number | string;
}
