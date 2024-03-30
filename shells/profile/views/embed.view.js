export default class Embed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  #render() {
    this.shadowRoot.innerHTML = this.src
      ? /* html */ `
      <iframe width="100%" height="500px" frameborder="0" src="${this.src}"></iframe>
      <style>
        :host {
          display: block;
        }
      </style>
    `
      : "";
  }
}
