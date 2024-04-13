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

export default class Carousel extends LitElement {
  static styles = css`
    :host {
      box-sizing: border-box;
      display: block;
      position: relative;
      height: 500px;
      width: auto;
      overflow: hidden;
      border-radius: 10px;
    }

    #slider {
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      max-height: 100%;
      transition: transform 0.5s ease;

      & > * {
        flex: 1;
        min-width: 0;
      }
    }

    #button-container {
      & > button {
        display: flex;
        position: absolute;
        padding: 0.5em;
        top: 50%;
        transform: translateY(-50%);
        background: hsl(0, 0%, 100%, 0.5);
        border: none;
        border-radius: 10px;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        &:hover {
          filter: contrast(0.7);
        }

        &:active {
          filter: contrast(0.5);
        }

        &.left {
          left: 10px;
        }

        &.right {
          right: 10px;
        }
      }
    }

    #indicator-container {
      display: flex;
      position: absolute;
      padding: 2px;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: fit-content;
      background: hsl(0, 0%, 50%, 0.5);
      border-radius: 10px;

      & > .indicator {
        --size: 10px;

        flex: 1;
        height: var(--size);
        width: var(--size);
        margin: 3px;
        background: hsl(0, 0%, 100%);
        border-radius: 100%;
        cursor: pointer;
      }
    }
  `;

  static properties = {
    currentIndex: { type: Number },
    timeout: { type: Number },
    imageSrcs: { type: Array },
  };

  #refreshTimeoutId;

  firstUpdated() {
    this.currentIndex = 0;
    this.timeout = 5;
    this.imageSrcs = this.imageSrcs ?? [];
  }

  updated(changedProperties) {
    if (changedProperties.has("currentIndex")) {
      this.#resetRefreshTimeout();
      this.#updateSlider();
    } else if (changedProperties.has("timeout")) {
      this.#resetRefreshTimeout();
    }
  }

  render() {
    return html`
      <div id="slider" style="width: ${(this.imageSrcs.length ?? 1) * 100}%;">
        ${this.imageSrcs?.map(
          (src) => html`<img part="slide" src=${src} style="object-fit: contain;" />`
        )}
      </div>
      <div id="button-container">
        <button class="left" @click="${this.#goToPrevious}">
          ${this.#renderSVGArrow({ direction: "left" })}
        </button>
        <button class="right" @click="${this.#goToNext}">
          ${this.#renderSVGArrow({ direction: "right" })}
        </button>
      </div>
      <div id="indicator-container">
        ${new Array(this.imageSrcs.length ?? 0)
          ?.fill(0)
          ?.map(
            (_, i) =>
              html`<div
                class="indicator"
                style=${i === this.currentIndex ? "opacity: 1" : "opacity: 0.5"}
                @click=${() => (this.currentIndex = i)}
              ></div>`
          )}
      </div>
    `;
  }

  #renderSVGArrow(options) {
    return html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g
        transform-origin="center"
        transform=${options?.direction === "right" ? "rotate(180)" : ""}
      >
        <path
          d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"
          fill=${options?.fill ?? "hsl(0, 0%, 0%)"}
        />
      </g>
    </svg>`;
  }

  #goToPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.imageSrcs.length - 1;
    }
  }

  #goToNext() {
    if (this.currentIndex < this.imageSrcs.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  #updateSlider() {
    const slider = this.shadowRoot?.querySelector("#slider");
    slider.style.transform = `translateX(-${
      this.currentIndex * (100 / this.imageSrcs.length ?? 1)
    }%)`;
  }

  #resetRefreshTimeout() {
    clearTimeout(this.#refreshTimeoutId);
    if (this.timeout > 0) {
      this.#refreshTimeoutId = setTimeout(
        () => this.#goToNext(),
        this.timeout * 1000
      );
    }
  }
}
