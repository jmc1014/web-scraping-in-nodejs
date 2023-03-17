const puppeteer = require("puppeteer");
const fs = require("fs");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require("./model/Listing");

async function connectToMongoDB() {
  const pass = "0Sd7lprSHWLMlBZC"; // retrive it in mongoDB. https://cloud.mongodb.com/v2/6413ddc3e031d16134a4dccc#/security/database/users
  await mongoose.connect(
    `mongodb+srv://craiglistUser:${pass}@craiglisting.7ohpcmd.mongodb.net/?retryWrites=true&w=majority`
  );
  console.log("connected to mongoDB");
}

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
      const neighborhood =
        hoodElement.length > 2
          ? hoodElement[2] != "-"
            ? hoodElement[2]
            : ""
          : "";
      const title = $(titleElement).text();
      const url = $(titleElement).attr("href");
      const datePosted = new Date($(timeElement).attr("title"));
      return { title, url, datePosted, neighborhood };
    })
    .get();
  return listings;
}

async function scrapeJobDescriptions(listings, page) {
  let content = [];
  for (let i = 0; i < 6; i++) {
    //listings.length
    await page.goto(listings[i].url, { waitUntil: "networkidle0" });
    const html = await page.content();
    const $ = cheerio.load(html);

    const userbody = $(".userbody")
      .map(async (index, element) => {
        const descrpitionElement = $(element).find("#postingbody");
        const compensationElement = $(element).find(
          "p.attrgroup > span:nth-child(1) > b"
        );
        // console.log("description", element, descrpitionElement);
        const jobDescription = $(descrpitionElement).text();
        const compensation = $(compensationElement).text();
        const listingData = { ...listings[i], jobDescription, compensation };
        const listingModel = new Listing(listingData);
        await listingModel.save();
        return listingData;
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
  connectToMongoDB();
  console.log("Start");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescirptions = await scrapeJobDescriptions(
    listings,
    page
  );
  console.log("Listings", listings);
  // console.log("listingsWithJobDescirptions", listingsWithJobDescirptions);
  console.log("End");
}

main();

// https://sfbay.craigslist.org
