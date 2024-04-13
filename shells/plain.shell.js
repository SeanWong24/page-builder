import {
  css,
  unsafeCSS,
  html,
  staticHtml,
  LitElement,
  ref,
  when,
  map,
  unsafeStatic,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

const pluginMap = new Map();

const baseStyleSheet = css`
  :host {
    display: block;
    font-family: arial;
  }
  :not(:defined) {
    display: none;
  }
  [part~="views"] {
    margin: auto;
  }
  [part~="footer"] {
    text-align: center;
    padding: 10px;
  }
`.styleSheet;

export default class StackShell extends LitElement {
  static properties = {
    shellProps: { type: Object },
    themeSrc: { type: String, attribute: "theme-src" },
  };

  willUpdate(changedProperties) {
    if (changedProperties.has("themeSrc") && this.themeSrc) {
      this.#loadTheme();
    }
  }

  firstUpdated() {
    this.#updateDynamicStyleSheets([]);
  }

  render() {
    return html` ${this.#renderViews()}
    ${this.#renderFooter()}`;
  }

  #renderFooter() {
    return html`
      <footer part="footer">${this.shellProps?.footerText}</footer>
    `;
  }

  #renderViews() {
    return html`
      <div part="views">
        ${map(this.shellProps?.views, (view) => {
          const tagName = this.#getViewElementTagName(view?.viewSrc);
          return this.#renderView(view, tagName);
        })}
      </div>
    `;
  }

  #renderView(view, tagName) {
    return when(
      customElements.get(tagName),
      () => staticHtml/* html */ `
          <${unsafeStatic(tagName)} 
            part="view"
            ${ref((el) => {
              if (!el) {
                return;
              }
              Object.assign(el, view?.viewProps);
            })}
          />
      `
    );
  }

  #getViewElementTagName(src) {
    let tagName;
    if (!(tagName = pluginMap.get(src))) {
      tagName = `pb-view-${pluginMap.size}`;
      pluginMap.set(src, tagName);
      try {
        import(new URL(src, document.baseURI)).then((module) => {
          customElements.define(tagName, module.default);
          customElements.whenDefined(tagName).then(() => {
            this.requestUpdate();
          });
        });
      } catch {}
    }
    return tagName;
  }

  async #loadTheme() {
    try {
      const theme = await fetch(new URL(this.themeSrc, document.baseURI)).then(
        (response) => response.text()
      );
      this.#updateDynamicStyleSheets([unsafeCSS(theme).styleSheet]);
    } catch {}
  }

  #updateDynamicStyleSheets(styleSheets = []) {
    this.shadowRoot.adoptedStyleSheets = [baseStyleSheet, ...styleSheets];
  }
}
