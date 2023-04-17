// THIS WILL NOT WORK ANYMORE
// CRAIGLIST IS SPA ALREADY
// https://andrejsabrickis.medium.com/scrapping-the-content-of-single-page-application-spa-with-headless-chrome-and-puppeteer-d040025f752b
// USE PUPPETER FOR THIS

const request = require("request-promise");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const url = "https://sfbay.craigslist.org/search/sof#search=1~thumb~0~0";
// "https://sfbay.craigslist.org/search/sof#search=1~thumb~0~0";
// "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof";

const scapeResult = {
  title: "",
  description: "",
  datePosted: new Date("2023-10-14"),
  url: "",
  hood: "",
  address: "",
  compensation: "",
};

async function scrapeCraiglist() {
  try {
    // const htmlResult = await request.get(url);
    const htmlResult = await axios.get(url);
    const $ = await cheerio.load(htmlResult.data);
    fs.writeFileSync("./test.html", htmlResult.data);
    $(".result-info").each((index, element) => {
      console.log($(element).find(".titlestring").text());
    });
    console.log(htmlResult);
  } catch (err) {
    console.error(err);
  }
}

scrapeCraiglist();
