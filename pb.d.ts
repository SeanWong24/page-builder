export type PBConfigImportMap = Record<string, string>;

export type PBConfigExternalReference = { from: string };

export type PBConfigNodeBase = {
  /** Only for processed config */
  base?: URL | string;
  imports?: PBConfigImportMap;
  props?: Record<string, unknown>;
  attrs?: Record<string, string>;
  styleSheets?: (string | PBConfigExternalReference)[];
  children?: (PBConfigChild | PBConfigExternalReference)[];
} & Partial<PBConfigExternalReference>;

export type PBConfigChild = { using: string } & PBConfigNodeBase;

export type PBConfigRoot = {
  faviconSrc?: string;
  pageTitle?: string;
} & PBConfigNodeBase;

export type PBConfig = PBConfigRoot | PBConfigChild;

export interface PBPlugin extends HTMLElement {
  __pb_apply_base_url: (url: string | URL) => URL;
}
