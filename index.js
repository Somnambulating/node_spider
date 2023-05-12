import { url } from 'inspector';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import http from 'http';
import https from 'https';

const image_dir = './image/';

function create_image_dir() {
    if (!fs.existsSync(image_dir)) {
        fs.mkdirSync(image_dir);
    }
}

function download_image(url, dest) {
    // 创建HTTP请求
    https.get(url, (res) => {
        // 创建写入流
        const fileStream = fs.createWriteStream(dest);
        // 将响应管道连接到写入流
        res.pipe(fileStream);
        // 当写入流完成时，关闭响应
        fileStream.on('finish', () => {
            res.destroy();
        });
    }).on('error', (err) => {
        console.error(err);
    });
}

(async () => {
    create_image_dir();

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'headless': false });
    const page = await browser.newPage();

    await page.goto('https://www.pexels.com/search/website/');

    const document_size = await page.evaluate(() => {
        const height = window.outerHeight;
        const width = window.outerWidth;

        return { height, width };
    });

    console.log(document_size);

    // Set screen size
    await page.setViewport({ width: document_size.width, height: document_size.height });

    const res = await page.evaluate(() => {
        var urls = []

        const base_div_doms = document.getElementsByClassName("BreakpointGrid_column__CTepl");
        for (let i = 0; i < base_div_doms.length; i++) {
            const img_doms = base_div_doms[i].getElementsByTagName("img");
            for (let y = 0; y < img_doms.length; y++) {
                const img_url = img_doms[y].src;
                urls.push(img_url);
            }
        }

        console.log("End");
        return urls;
    });

    var img_num = 1;
    res.forEach(element => {
        console.log(element);
        const path = image_dir + img_num.toString() + ".jpg";
        
        download_image(element, path);
        img_num += 1;
    });

    await browser.close();
})();