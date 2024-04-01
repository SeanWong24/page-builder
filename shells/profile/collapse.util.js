import {
  css,
  html,
  LitElement,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

export default class Collapse extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      border-radius: 10px;
      box-shadow: 1px 1px 2px 0 hsl(0, 0%, 0%, 0.5);
      overflow: hidden;
    }

    #main-container {
      display: grid;
      position: relative;
      height: 100%;
      width: 100%;
      grid-template-rows: auto 0fr;
      transition: grid-template-rows 0.3s;

      :host([expanded]) & {
        grid-template-rows: auto 1fr;
      }
    }

    slot {
      display: block;
      position: relative;
      padding: 10px;
    }

    [part~="header"] {
      cursor: pointer;
      height: fit-content;

      &:hover {
        filter: brightness(0.9);
      }

      &:active {
        filter: brightness(0.8);
      }
    }

    #header-wrapper {
      display: grid;
      grid-template-columns: auto 1fr;
      height: fit-content;

      & .triangle {
        margin: auto;
        height: 1rem;
        width: 1rem;
        transform: rotate(90deg);
        transition: transform 0.3s;

        :host([expanded]) & {
          transform: rotate(180deg);
        }
      }
    }

    #content-wrapper {
      min-height: 0;
      overflow: hidden;
    }
  `;

  static properties = {
    expanded: { type: Boolean, reflect: true },
  };

  render() {
    return html`
      <div id="main-container">
        <div id="header-wrapper">
          ${this.#renderTriangle()}
          <slot
            name="header"
            part="header"
            @click=${() => (this.expanded = !this.expanded)}
          ></slot>
        </div>
        <div id="content-wrapper">
          <slot part="content"></slot>
        </div>
      </div>
    `;
  }

  #renderTriangle() {
    return html`<svg
      class="triangle"
      fill="#000000"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier"><path d="M21,21H3L12,3Z"></path></g>
    </svg>`;
  }
}
