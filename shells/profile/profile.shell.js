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
  [part~="info"] {
    & > * {
      display: block;
      text-align: center;
    }
    & [part~="image"] {
      display: block;
      object-fit: contain;
      height: 150px;
      width: 150px;
      margin: auto;
    }
    & [part~="name"] {
      font-size: 3em;
      font-weight: bold;
      & [part~="title"] {
        display: block;
        font-style: italic;
        font-weight: normal;
      }
    }
    & [part~="slogan"] {
      font-size: 1.5em;
    }
  }
  [part~="sections"] {
    & h1 {
      font-size: 2em;
    }

    & [part~="section"] {  
      & [part~="view"] {
        margin: 10px 0;
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      }
    }
  }
`.styleSheet;

export default class PageBuilderHost extends LitElement {
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
    return html`
      <div part="main-container">
        ${this.#renderInfo()} ${this.#renderSections()}
      </div>
    `;
  }

  #renderSections() {
    return html`<div part="sections">
      ${map(
        this.shellProps?.sections,
        (section) =>
          html`
            <div part="section">
              <h1>${section?.title}</h1>
              ${map(section?.views, (view) => {
                const tagName = this.#getViewElementTagName(view?.viewSrc);
                return html`
                  <div part="view">
                    <h2>${view?.title}</h2>
                    ${when(
                      customElements.get(tagName),
                      () => staticHtml/* html */ `
                      <${unsafeStatic(tagName)} 
                        ${ref((el) => {
                          if (!el) {
                            return;
                          }
                          Object.assign(el, view?.viewProps);
                        })}
                      />
                 `
                    )}
                  </div>
                `;
              })}
            </div>
          `
      )}
    </div>`;
  }

  #getViewElementTagName(src) {
    let tagName;
    if (!(tagName = pluginMap.get(src))) {
      tagName = `pb-view-${pluginMap.size}`;
      pluginMap.set(src, tagName);
      try {
        import(src).then((module) => {
          customElements.define(tagName, module.default);
          customElements.whenDefined(tagName).then(() => {
            this.requestUpdate();
          });
        });
      } catch {}
    }
    return tagName;
  }

  #renderInfo() {
    return html`
      <div part="info">
        ${when(
          this.shellProps?.info?.imageSrc,
          () =>
            html`<img part="image" src=${this.shellProps?.info?.imageSrc} />`
        )}
        <div part="name">
          ${this.#renderNameInfo(this.shellProps?.info?.title, "title")}
          ${this.#renderNameInfo(
            this.shellProps?.info?.firstName,
            "first-name"
          )}
          ${this.#renderNameInfo(
            this.shellProps?.info?.middleName,
            "middle-name"
          )}
          ${this.#renderNameInfo(this.shellProps?.info?.lastName, "last-name")}
        </div>
        ${this.#renderNameInfo(this.shellProps?.info?.slogan, "slogan")}
        ${when(
          this.shellProps?.info?.tel,
          () =>
            html`<div>
              <span>📞</span
              ><a href="tel:${this.shellProps?.info?.tel}"
                >${this.shellProps?.info?.tel}</a
              >
            </div>`
        )}
        ${when(
          this.shellProps?.info?.email,
          () =>
            html`<div>
              <span>📧</span
              ><a href="mailto:${this.shellProps?.info?.email}"
                >${this.shellProps?.info?.email}</a
              >
            </div>`
        )}
      </div>
    `;
  }

  #renderNameInfo(content, part) {
    return when(content, () => html`<span part=${part}>${content}</span>`);
  }

  async #loadTheme() {
    try {
      const theme = await fetch(this.themeSrc).then((response) =>
        response.text()
      );
      this.#updateDynamicStyleSheets([unsafeCSS(theme).styleSheet]);
    } catch {}
  }

  #updateDynamicStyleSheets(styleSheets = []) {
    this.shadowRoot.adoptedStyleSheets = [baseStyleSheet, ...styleSheets];
  }
}
