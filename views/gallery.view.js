export default class Gallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
  }

  #render() {
    this.shadowRoot.innerHTML = /* html */ `
        <div id="container">
          ${this.items
            ?.map(
              ({ title, imageSrc, href }) => /* html */ `
            <a href="${href}" target="_blank">
              <img src="${imageSrc}" alt="${title}" />
            </a>
          `
            )
            .join("")}
        </div>
        <style>
          :host {
            display: block;
          }
  
          #container {
            width: 100%;
            display: flex;
            padding: 10px;
            gap: 10px;
            overflow-x: auto;
            overflow-y: hidden;
            box-sizing: border-box;
  
            & a {
              display: block;
              text-decoration: none;
              flex: 0;
              aspect-ratio: 1 / 1;
              width: 150px;
              height: 150px;
              border-radius: 10px;
              box-sizing: border-box;
              background: white;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  
              &:hover {
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
              }
  
              & img {
                object-fit: contain;
                height: 100%;
                width: 100%;
              }
              
              & div {
                display: block;
              }
            }
          }
        </style>
      `;
  }

  #parseItems(itemsString) {
    const items = itemsString?.split(";").map((item) => {
      const [header, imageSrc, href] = item.split(",");
      return { header, imageSrc, href };
    });
    return items ?? [];
  }
}
