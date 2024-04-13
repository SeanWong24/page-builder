import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export default class Markdown extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  async #render() {
    const content =
      this.content ??
      (this.src && (await fetch(this.src).then((response) => response.text())));
    this.shadowRoot.innerHTML = content
      ? /* html */ `
      ${marked(content)}
      <style>
        :host {
          display: block;
          padding: 0.5em;
        }
      </style>
    `
      : "";
  }

  #encodeHTML(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
