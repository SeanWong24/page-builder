export default class Header extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  async #render() {
    this.shadowRoot.innerHTML = /* html */ `
      <header part="header">
        ${
          this.logoSrc
            ? /* html */ `
              <img
                part="logo"
                src="${this.logoSrc}"
                style="height: 50px; width: 50px; display: block; margin: auto;"
              />
            `
            : ""
        }
        ${this.title ? /* html */ `<h1>${this.title}</h1>` : ""}
        ${
          this.links
            ? /* html */ `<div part="links">${this.#renderLinks()}</div>`
            : ""
        }
      </header>
      <style>
        :host {
          display: block;
        }
        [part~="header"] {
          display: grid;
          grid-template-columns: auto auto 1fr;
          padding: 0.5em;
          gap: 0.5em;
        }
        [part~="logo"] {
          object-fit: contain;
        }
        [part~="links"] {
          height: fit-content;
          margin: auto;
        }
        [part~="link"] {
          margin: 0 5px;
        }
      </style>
  `;
  }

  #renderLinks() {
    return (
      this.links?.map((link) => {
        return /* html */ `<a part="link" href="${link.href}">${link.content}</a>`;
      }).join("") ?? ""
    );
  }
}
