const puppeteer = require("puppeteer");

async function main() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://accounts.craigslist.org/login");
    await page.type("input#inputEmailHandle", "jmc.0411.dev@gmail.com");
    await page.type("input#inputPassword", "");
    await page.click("button#login");
    await page.waitForNavigation();
    await page.goto(
      "https://accounts.craigslist.org/login/home?show_tab=settings"
    );
  } catch (error) {
    console.log(error);
  }
}

main();
