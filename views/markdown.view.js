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
      <iframe width="100%" height="100%" frameborder="0" srcdoc="${this.#encodeHTML(
        marked(content)
      )}"></iframe>
      <style>
        :host {
          display: block;
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
