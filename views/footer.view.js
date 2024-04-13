export default class Footer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  async #render() {
    this.shadowRoot.innerHTML = /* html */ `
      <footer part="footer">${this.content}</footer>
      <style>
        :host {
          display: block;
        }
        [part~="footer"] {
          text-align: center;
          padding: 0.5em;
        }
      </style>
  `;
  }

  #renderLinks() {
    return (
      this.links
        ?.map((link) => {
          return /* html */ `<a part="link" href="${link.href}">${link.content}</a>`;
        })
        .join("") ?? ""
    );
  }
}
