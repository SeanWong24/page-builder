import {
  css,
  html,
  LitElement,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

export class PageBuilderHost extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    :not(:defined) {
      display: none;
    }
  `;

  static properties = {
    configSrc: { type: String, attribute: "config-src", reflect: true },
    _config: { type: Object, state: true },
    _themeSrc: { type: String, state: true },
  };

  #configSrc;
  get configSrc() {
    return this.#configSrc;
  }
  set configSrc(value) {
    this.#configSrc = value;
    this.#loadConfig();
  }

  render() {
    return html`
      <pb-shell
        theme-src=${this._themeSrc}
        .shellProps=${this._config?.shellProps}
      ></pb-shell>
    `;
  }

  async #loadConfig() {
    try {
      this._config = await fetch(
        new URL(this.configSrc, document.baseURI)
      ).then((response) => response.json());
      this.#updateFavicon();
      this.#updatePageTitle();
      this.#defineShellElement();
      this._themeSrc = this._config?.themeSrc;
    } catch {}
  }

  async #defineShellElement() {
    try {
      const shellModule = await import(this._config?.shellSrc);
      const shellConstructor = shellModule.default;
      customElements.define("pb-shell", shellConstructor);
    } catch {}
  }

  async #updatePageTitle() {
    if (this._config?.pageTitle == null) {
      return;
    }
    document.title = this._config?.pageTitle;
  }

  #updateFavicon() {
    if (this._config?.faviconSrc == null) {
      return;
    }
    const link = document.querySelector("link[rel=icon]");
    if (link) {
      link.href = this._config?.faviconSrc;
    }
  }
}

customElements.define("pb-host", PageBuilderHost);
