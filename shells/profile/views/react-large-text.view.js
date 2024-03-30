import { html } from "https://esm.run/htm/react";
import r2wc from "https://esm.run/@r2wc/react-to-web-component";

const LargeText = (props) =>
  html`
    <!-- @ts-ignore -->
    <div style=${{ fontSize: "10em" }}>${props?.content ?? ""}</div>
  `;

export default r2wc(LargeText, {
  shadow: "open",
  props: {
    content: "string",
  },
});
