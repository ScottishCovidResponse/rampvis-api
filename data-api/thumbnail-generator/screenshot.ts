#!/usr/bin/env node

import * as puppeteer from 'puppeteer';

export class Screenshot {
    browser = null;
    page = null;

    async takeScreenshot(args: { url: string; el: string; target: string }) {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
            await this.page.setDefaultNavigationTimeout(0);
        }

        await this.page.goto(args.url, {
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0,
        });

        await this.page.waitForResponse((response) => response.status() === 200);
        await this.delay(3000); // Added a fixed amount of delay, need to wait until drawing completes only
        await this.page.waitForSelector(args.el); // wait for the selector to load
        let chart = await this.page.$(args.el); // declare a variable with an ElementHandle
        const box = await chart.boundingBox(); // this method returns an array of geometric parameters of the element in pixels.
        const x = box['x']; // coordinate x
        const y = box['y']; // coordinate y
        const w = box['width'] || 1; // area width
        const h = box['height'] || 1; // area height

        if (args.target === 'file') {
            let splitUrl = args.url.split('=');
            let file = splitUrl[splitUrl.length - 1] + '.jpeg';
            // console.log(' file:', file, w, h);

            await this.page.screenshot({
                type: 'jpeg',
                path: file,
                clip: { x: x, y: y, width: w, height: h },
            });
        }

        let buffer;
        if (args.target === 'database') {
            // image buffer returned from screenshot
            buffer = await this.page.screenshot({
                type: 'jpeg',
                quality: 100,
                clip: { x: x, y: y, width: w, height: h },
            });
        }

        return buffer;
    }

    async stop() {
        await this.browser.close();
        this.browser = null;
        this.page = null;
    }

    delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }
}
