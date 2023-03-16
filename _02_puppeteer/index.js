const puppeteer = require("puppeteer");
const fs = require("fs");
const cheerio = require("cheerio");
const { resolve } = require("path");

async function scrapeListings(page) {
  // await page.goto(
  //   "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof#search=1~thumb~0~0"
  // );
  await page.goto(
    "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof",
    { waitUntil: "networkidle0" }
  );
  const html = await page.content();
  // fs.writeFileSync("./test.html", html);
  const $ = cheerio.load(html);
  const listings = $(".result-info")
    .map((index, element) => {
      const titleElement = $(element).find(".titlestring");
      const timeElement = $(element).find(".meta > span:nth-child(1)");
      const metaText = $(element).find(".meta").text();
      const hoodElement = metaText.substring(0, metaText.length - 4).split("·");
      const hood =
        hoodElement.length > 2
          ? hoodElement[2] != "-"
            ? hoodElement[2]
            : ""
          : "";
      const title = $(titleElement).text();
      const url = $(titleElement).attr("href");
      const datePosted = new Date($(timeElement).attr("title"));
      return { title, url, datePosted, hood };
    })
    .get();
  return listings;
}

async function scrapeJobDescriptions(listings, page) {
  let content = [];
  for (let i = 0; i < 2; i++) {
    //listings.length
    await page.goto(listings[i].url, { waitUntil: "networkidle0" });
    const html = await page.content();
    const $ = cheerio.load(html);

    const userbody = $(".userbody")
      .map((index, element) => {
        const descrpitionElement = $(element).find("#postingbody");
        const compensationElement = $(element).find(
          "p.attrgroup > span:nth-child(1) > b"
        );
        // console.log("description", element, descrpitionElement);
        const description = $(descrpitionElement).text();
        const compensation = $(compensationElement).text();
        return { ...listings[i], description, compensation };
      })
      .get();

    // console.log("userbody", userbody);
    content.push(userbody);
    await sleep(1000);
  }
  return content;
}

async function sleep(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

async function main() {
  console.log("Start");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescirptions = await scrapeJobDescriptions(
    listings,
    page
  );
  console.log("Listings", listings);
  console.log("listingsWithJobDescirptions", listingsWithJobDescirptions);
  console.log("End");
}

main();

// https://sfbay.craigslist.org
