#!/usr/bin/env node

import { Command } from "commander";
import { SingleBar, Presets } from "cli-progress";
import { Database } from "./database";
import { Screenshot } from "./screenshot";

// const url = "http://localhost:5000/page/";

const cli = new Command();
cli
  .option("--target, [target]", "Save as file | database")
  // .option("--url, [url]", "The url")
  //.option('--emulate, [emulate]', 'emulate device')
  .option("--fullpage, [fullpage]", "Full Page")
  .option("--pdf, [pdf]", "Generate PDF")
  .option("--w, [w]", "width")
  .option("--h, [h]", "height")
  .option("--waitfor, [waitfor]", "Wait time in milliseconds")
  .option(
    "--waitforselector, [waitforselector]",
    "Wait for the selector to appear in page"
  )
  .option("--el, [el]", "element css selector")
  .option("--auth, [auth]", "Basic HTTP authentication")
  .option("--no, [no]", "Exclude")
  .option("--click, [click]", "Click")
  .option("--file, [file]", "Output file")
  .option("--theme, [theme]", "Color Theme light or dark")
  .option("--vd, [vd]", "Emulate vision deficiency")
  .parse(process.argv);

let args = cli.opts();

// if (!args.url) {
//   console.log(
//     "Please add --url parameter.\n" +
//       "Something like this: $ screenshoteer --url http://www.example.com"
//   );
//   process.exit();
// }

!args.fullpage
  ? (args.fullPage = true)
  : (args.fullPage = JSON.parse(args.fullpage));

console.log(args.url);
console.log(args.fullPage);

(async () => {
  let b1 = new SingleBar({}, Presets.shades_classic);

  let database = new Database();
  let screenshot = new Screenshot();

  let ids: string[] = await database.getAllPages();
  // create a new progress bar instance and use shades_classic theme
  b1.start(ids.length, 0, { speed: "N/A" });

  for (let d of ids) {
    args.url = `${url}${d}`;
    let buffer = await screenshot.takeScreenshot(args);

    if (args.target === "database") {
      await database.updateScreenshot(d, buffer);
    }

    b1.increment();
  }

  screenshot.stop();
  database.close();
  b1.stop();
})();
