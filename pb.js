// @ts-check
/**
 * @typedef {import("./pb").PBConfigChild} PBConfigChild
 * @typedef {import("./pb").PBConfigRoot} PBConfigRoot
 * @typedef {import("./pb").PBConfig} PBConfig
 */

const elementMap = new Map();

export class PageBuilderHost extends HTMLElement {
  static get observedAttributes() {
    return ["config-src"];
  }

  /** @type {PBConfigRoot | undefined} */
  #config;

  get configSrc() {
    return this.getAttribute("config-src");
  }
  set configSrc(value) {
    this.setAttribute("config-src", value ?? "");
    this.#updateConfig();
  }

  attributechChangedCallback(name, _oldValue, newValue) {
    if (name === "configSrc") {
      this.configSrc = newValue;
    }
  }

  async connectedCallback() {
    this.#updateConfig();
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#applyDefaultStyleSheet();
  }

  async #updateConfig() {
    await this.#loadConfig(this.configSrc, document.baseURI).then((config) => {
      this.#config = config;
      this.#updatePageTitle();
      this.#updateFavicon();
      this.#render();
    });
  }

  #applyDefaultStyleSheet() {
    if (!this.shadowRoot?.adoptedStyleSheets) {
      return;
    }
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(/* css */ `
      :host {
        display: block;
      }
      :not(:defined) {
        display: none;
      }
      div {
        color: red;
      }
    `);
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  #render() {
    if (!this.#config || !this.shadowRoot) {
      return;
    }
    this.#applyStyleSheets(
      this.shadowRoot,
      this.#config.styleSheets,
      this.#config.base
    );
    this.#renderChildren(
      this.shadowRoot,
      this.#config.children,
      this.#config.imports,
      this.#config.base
    );
  }

  #renderChildren(
    target,
    childConfigs,
    inheritedImports = {},
    /** @type {URL | string| undefined} */
    inheritedBase = document.baseURI
  ) {
    if (!target || !childConfigs) {
      return;
    }
    target.append(
      ...(childConfigs?.map((childConfig) => {
        const imports = { ...inheritedImports, ...childConfig.imports };
        const base = new URL(childConfig.base ?? "", inheritedBase);
        const element = document.createElement(
          elementMap.get(new URL(imports[childConfig.using], base).href) ??
            childConfig.using
        );
        Object.assign(element, childConfig.props);
        element.setAttribute("pb-name", childConfig.using);
        element.__pb_apply_base_url = (url) => new URL(url, base);
        setTimeout(() => {
          if (element.shadowRoot) {
            this.#applyStyleSheets(
              element.shadowRoot,
              childConfig.styleSheets,
              base
            );
          }
        });
        if (childConfig.children) {
          this.#renderChildren(
            element,
            childConfig.children,
            {
              ...imports,
              ...childConfig.imports,
            },
            base
          );
        }
        return element;
      }) ?? [])
    );
  }

  async #loadConfig(from, base = document.baseURI) {
    try {
      const url = new URL(from, base);
      /** @type {PBConfig} */
      const config = await fetch(url).then((response) => response.json());
      for (const src of Object.values(config.imports ?? {})) {
        await this.#importElement(src, url);
      }
      const children = await Promise.all(
        config?.children?.map(async (child) => {
          if (child.from) {
            return await this.#loadConfig(new URL(child.from, url));
          }
          return child;
        }) ?? []
      );
      config.children = /** @type {PBConfigChild[]} */ (
        children.filter(Boolean)
      );
      return { ...config, base: url };
    } catch {}
  }

  async #applyStyleSheets(target, styleSheets, base) {
    if (!target?.adoptedStyleSheets || !styleSheets) {
      return;
    }
    target.adoptedStyleSheets = [
      ...target.adoptedStyleSheets,
      ...(await Promise.all(
        styleSheets?.map(async (css) => {
          const styleSheet = new CSSStyleSheet();
          if (css.from) {
            try {
              const cssText = await fetch(new URL(css.from, base)).then(
                (response) => response.text()
              );
              styleSheet.replaceSync(cssText ?? "");
              return styleSheet;
            } catch {}
          }
          styleSheet.replaceSync(css);
          return styleSheet;
        }) ?? []
      )),
    ];
  }

  async #importElement(from, base) {
    const url = new URL(from, base).href;
    if (elementMap.has(url)) {
      return elementMap.get(url);
    }
    const tagName = `pb-el-${elementMap.size}`;
    const module = await import(url);
    customElements.define(tagName, module.default);
    elementMap.set(url, tagName);
  }

  #updatePageTitle() {
    if (this.#config?.pageTitle == null) {
      return;
    }
    document.title = this.#config?.pageTitle;
  }

  #updateFavicon() {
    if (this.#config?.faviconSrc == null) {
      return;
    }
    /** @type {HTMLLinkElement | null} */
    const link = document.querySelector("link[rel=icon]");
    if (link) {
      link.href = new URL(this.#config?.faviconSrc, this.#config?.base).href;
    }
  }
}

customElements.define("pb-host", PageBuilderHost);
