import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, readdirSync } from "fs";
const dir = "/home/user/constella/scenes";
const font = "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf";
for (const f of readdirSync(dir).filter(x => x.endsWith(".svg"))) {
  const r = new Resvg(readFileSync(`${dir}/${f}`), {
    fitTo: { mode: "width", value: 1280 },
    background: "#07080f",
    font: { fontFiles: [font], loadSystemFonts: true, defaultFontFamily: "IPAGothic" },
  });
  writeFileSync(`${dir}/${f.replace(".svg", ".png")}`, r.render().asPng());
  console.log("rendered", f.replace(".svg", ".png"));
}
