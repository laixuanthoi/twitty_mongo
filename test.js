import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: false,
  args: [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-first-run",
    "--no-sandbox",
    "--no-zygote",
    "--single-process",
  ],
});
const pages = await browser.pages(); //loopup and no closing page
pages[1] = await browser.newPage();
pages[2] = await browser.newPage();
pages[3] = await browser.newPage();
await pages[1].goto("https://google.com");
await pages[2].goto("https://google.com");
await pages[3].goto("https://google.com");

const loopPage = (page) => {
  const inv = setInterval(async () => {
    await page.goto("https://google.com");
    await page.goto("https://youtube.com");
  }, 1000);
};
(async () => {
  loopPage(pages[0]);
  loopPage(pages[1]);
  //   loopPage(pages[3]);
})();
