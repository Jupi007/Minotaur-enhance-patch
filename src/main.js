import { App } from "./app";
import style from "./style.css?raw";
import { addCustomStyles } from "./utils";

document.addEventListener('DOMContentLoaded', () => {
  addCustomStyles(style);
  new App;
});
