import "https://esm.run/@hey-web-components/monaco-editor";

export default class Code extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  async #render() {
    const value =
      this.value ?? (await fetch(this.src).then((response) => response.text()));
    this.shadowRoot.innerHTML = /* html */ `<hey-monaco-editor value="${this.#encodeHTML(
      value
    )}" language="${this.#encodeHTML(this.language)}"></hey-monaco-editor>
    <style>
      :host {
        display: block;
      }
      hey-monaco-editor {  
        height: 300px;
      }
    </style>`;
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
