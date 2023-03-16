const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const domain7plus = "https://7plus.com.au";
const url7plus =
  "https://component.swm.digital/component/sunrise?component-id=104662-SUNR23&platform-id=Web&market-id=4&platform-version=1.0.80512&api-version=4.7.0.0&signedUp=True";

async function main() {
  // axios_main();
  puppeter_main();
}

async function axios_main() {
  try {
    html = await axios.get(url7plus);
    console.log("html.data", html.data);
    fs.writeFileSync("./response_axios.json", JSON.stringify(html.data));
    // $ = await cheerio.load(html.data);
    // $("h2").each((index, element) => {
    //   console.log($(element).text());
    // });
  } catch (error) {
    console.log(error);
  }
}

async function puppeter_main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url7plus);

  jsonData = await page.evaluate(() => {
    return JSON.parse(document.querySelector("body").innerText);
  });

  let items = [];
  for (let i = 0; i < jsonData.items.length; i++) {
    const element = jsonData.items[i];
    let streamData = await getStreamData(
      element["playerData"]["episodePlayerId"]
    );

    let headline = element["cardData"]["title"];
    let episode_url = domain7plus + element["cardData"]["contentLink"]["url"];
    let reference_id_src = element["playerData"]["episodePlayerId"];
    let duration_str = element["cardData"]["duration"];

    let item = {
      ...streamData,
      reference_id_src,
      duration_str, // For Cross Referece only of Duration
      headline,
      episode_url,
    };
    items.push(item);
  }
  console.log("items", items);
  fs.writeFileSync("./results.json", JSON.stringify(items));
}

async function getStreamData(refId) {
  vidObjectParams = {
    appId: "7plus",
    deviceType: "web",
    platformType: "web",
    accountId: 5303576322001,
    referenceId: "ref:" + refId,
    deliveryId: "csai",
  };
  let vidParams = Object.keys(vidObjectParams)
    .map(
      (key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(vidObjectParams[key])
    )
    .join("&");
  let vidUrl = "https://videoservice.swm.digital/playback?" + vidParams;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(vidUrl);
  jsonStData = await page.evaluate(() => {
    return JSON.parse(document.querySelector("body").innerText);
  });

  let stream_url = jsonStData.media.sources[0].src;
  let stream_sources = jsonStData.media.sources;
  let publish_date = jsonStData.media.published_at;
  let reference_id = jsonStData.media.reference_id;
  let duration = new Date(jsonStData.media.duration)
    .toUTCString()
    .match(/(\d\d:\d\d:\d\d)/)[0];
  let time_start = "time_start"; // No Available data for time start
  let time_end = "time_end"; // No Available data for time start

  return {
    stream_url,
    stream_sources, // Added other Sources
    publish_date,
    duration,
    time_start,
    time_end,
    reference_id,
  };
}

main();
