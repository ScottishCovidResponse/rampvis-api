#!/usr/bin/env node

import { Command } from 'commander';
import { SingleBar, Presets } from 'cli-progress';
import { Database } from './database';
import { Screenshot } from './screenshot';

const cli = new Command();
cli.option('--target, [target]', 'Save as file | database')
    .option('--url, [url]', 'The url')
    .option('--fullpage, [fullpage]', 'Full Page')
    .option('--pdf, [pdf]', 'Generate PDF')
    .option('--w, [w]', 'width')
    .option('--h, [h]', 'height')
    .option('--waitfor, [waitfor]', 'Wait time in milliseconds')
    .option('--waitforselector, [waitforselector]', 'Wait for the selector to appear in page')
    .option('--el, [el]', 'element css selector')
    .option('--auth, [auth]', 'Basic HTTP authentication')
    .option('--no, [no]', 'Exclude')
    .option('--click, [click]', 'Click')
    .option('--file, [file]', 'Output file')
    .option('--theme, [theme]', 'Color Theme light or dark')
    .option('--vd, [vd]', 'Emulate vision deficiency')
    .parse(process.argv);

let args = cli.opts();

(async () => {
    if (!args.url || !args.el) {
        console.log(
            'Please add --url, --el parameters.\n' +
                'Something like this: $ screenshoteer --url "http://localhost:3000" --el "#charts"'
        );
        process.exit();
    }

    !args.fullpage ? (args.fullPage = true) : (args.fullPage = JSON.parse(args.fullpage));

    console.log('main: url = ', args.url, ', target = ', args.target);

    let b1 = new SingleBar({}, Presets.shades_classic);

    let database = new Database();
    let screenshot = new Screenshot();

    let pageIds: string[] = await database.getAllPages();
    // create a new progress bar instance and use shades_classic theme
    b1.start(pageIds.length, 0, { speed: 'N/A' });

    console.log(pageIds);

    for (let pageId of pageIds) {
        let url = `${args.url}${pageId}`;

        if (args.target === 'file') {
            await screenshot.takeScreenshot({ url, el: args.el, target: args.target });
        }
        if (args.target === 'database') {
            let buffer = await screenshot.takeScreenshot({ url, el: args.el, target: args.target });
            await database.updateScreenshot(pageId, buffer);
        }

        b1.increment();
    }

    screenshot.stop();
    database.close();
    b1.stop();
})();
