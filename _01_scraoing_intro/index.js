const request = require("request-promise");
const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const rtUrl = "https://reactnativetutorial.net/";
const tblUrl = "https://www.codingwithstefan.com/table-example/";
async function main() {
  let ls = 4;
  if (!true) {
    // Using REQUEST
    rp(ls);
  } else {
    // Using Axios
    ax(ls);
  }
}

async function rp(ls = 1) {
  // Using REQUEST
  let html;
  let $;
  let scrapeRows = [];
  switch (ls) {
    case 4:
      html = await request.get(tblUrl);
      css = await request.get(tblUrl + "style.css");
      $ = await cheerio.load(html);
      const tableHeaders = [];
      $("body > table > tbody > tr").each((index, element) => {
        if (index === 0) {
          const ths = $(element).find("th");
          ths.each((index, element) => {
            tableHeaders.push($(element).text().toLowerCase());
          });
          return true;
        }
        const tds = $(element).find("td");
        const tableRow = {};
        tds.each((index, element) => {
          tableRow[tableHeaders[index]] = $(element).text();
        });
        scrapeRows.push(tableRow);
      });
      console.log("request", scrapeRows);
      break;
    case 3:
      html = await request.get(tblUrl);
      css = await request.get(tblUrl + "style.css");
      $ = await cheerio.load(html);

      $("body > table > tbody > tr").each((index, element) => {
        if (index === 0) return true;
        const tds = $(element).find("td");
        const company = $(tds[0]).text();
        const contact = $(tds[1]).text();
        const country = $(tds[2]).text();
        const scrapeRow = { company, contact, country };
        scrapeRows.push(scrapeRow);
      });
      console.log("request", scrapeRows);
      dir = "./table";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dir + "/test_tabel.html", html);
      fs.writeFileSync(dir + "/style.css", css);
      break;
    case 2:
      html = await request.get(rtUrl + "css-selectors/lesson2.html");
      fs.writeFileSync("./test_2.html", html);
      $ = await cheerio.load(html);
      $("h2").each((index, element) => {
        console.log($(element).text());
      });
      break;

    default:
      html = await request.get(rtUrl + "css-selectors/");
      fs.writeFileSync("./test.html", html);
      $ = await cheerio.load(html);
      const theText = $("h1").text();
      console.log(theText);
      break;
  }
}

async function ax(ls = 1) {
  // Using Axios
  // https://www.npmjs.com/package/axios
  try {
    let html;
    let $;
    let scrapeRows = [];
    switch (ls) {
      case 4:
        html = await axios.get(tblUrl);
        css = await axios.get(tblUrl + "style.css");
        $ = await cheerio.load(html.data);
        const tableHeaders = [];
        scrapeRows = [];
        $("body > table > tbody > tr").each((index, element) => {
          if (index === 0) {
            const ths = $(element).find("th");
            ths.each((index, element) => {
              tableHeaders.push($(element).text().toLowerCase());
            });
            return true;
          }
          const tds = $(element).find("td");
          const tableRow = {};
          tds.each((index, element) => {
            tableRow[tableHeaders[index]] = $(element).text();
          });
          scrapeRows.push(tableRow);
        });
        console.log("axios", scrapeRows);
        break;
      case 3:
        html = await axios.get(tblUrl);
        css = await axios.get(tblUrl + "style.css");
        $ = await cheerio.load(html.data);
        scrapeRows = [];
        $("body > table > tbody > tr").each((index, element) => {
          if (index === 0) return true;
          const tds = $(element).find("td");
          const company = $(tds[0]).text();
          const contact = $(tds[1]).text();
          const country = $(tds[2]).text();
          const scrapeRow = { company, contact, country };
          scrapeRows.push(scrapeRow);
        });
        console.log("axios", scrapeRows);

        // dir = "./table_axios";
        // if (!fs.existsSync(dir)) {
        //   fs.mkdirSync(dir, { recursive: true });
        // }
        // fs.writeFileSync(dir + "/test_tabel_axios.html", html.data);
        // fs.writeFileSync(dir + "/style.css", css.data);
        break;
      case 2:
        html = await axios.get(rtUrl + "css-selectors/lesson2.html");
        fs.writeFileSync("./test_axios_2.html", html.data);
        $ = await cheerio.load(html.data);
        $("h2").each((index, element) => {
          console.log($(element).text());
        });
        break;
      default:
        html = await axios.get(rtUrl + "css-selectors/");
        fs.writeFileSync("./test_axios.html", html.data);
        $ = await cheerio.load(html.data);
        const theText = $("h1").text();
        console.log(theText);
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

main();
