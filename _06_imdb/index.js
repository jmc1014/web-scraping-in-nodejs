const puppeteer = require("puppeteer");
const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const imdbUrl = "https://www.imdb.com";

const sampleResult = {
  title: "Scream VI",
  rank: 1,
  imdbRating: 7.3,
  descriptionUrl:
    "https://www.imdb.com/title/tt17663992/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=e9101d6a-9cbe-4310-a9f9-38e3776597d5&pf_rd_r=46PBA33G4BXP963NSGPM&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=moviemeter&ref_=chtmvm_tt_1",
  posterUrl:
    "https://www.imdb.com/title/tt17663992/mediaviewer/rm91108353/?ref_=tt_ov_i",
};

async function scrapeTitlesRanksAndRatins() {
  const result = await request.get("https://www.imdb.com/chart/moviemeter/");
  const $ = await cheerio.load(result);

  const movies = $(".lister-list tr")
    .map((i, element) => {
      if (i > 2) {
        return;
      }
      const title = $(element).find("td.titleColumn > a").text();
      const descriptionUrl =
        imdbUrl + $(element).find("td.titleColumn > a").attr("href");
      const imdbRating = $(element)
        .find("td.ratingColumn.imdbRating")
        .text()
        .trim();
      return { title, imdbRating, rank: i + 1, descriptionUrl };
    })
    .get();
  return movies;
}

async function scrapePosterUrl(movies) {
  const moviesWithPosterUrls = await Promise.all(
    movies.map(async (movie) => {
      try {
        const html = await request.get(movie.descriptionUrl);
        const $ = await cheerio.load(html);
        movie.posterUrl = imdbUrl + $(".ipc-poster > a").attr("href");
        return movie;
      } catch (error) {
        // console.error(error);
      }
    })
  );
  return moviesWithPosterUrls;
}

async function scapePosterImageUrl(movies) {
  for (let i = 0; i < movies.length; i++) {
    try {
      const pageHeader = {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36",
        "upgrade-insecure-requests": "1",
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br",
      };
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders(pageHeader);
      await page.goto(movies[i].posterUrl);
      const html = await page.content();
      const $ = cheerio.load(html);
      pagePosterUrl = $(".media-viewer img.peek").attr("src");
      await browser.close();

      const browserPoster = await puppeteer.launch();
      const pagePoster = await browserPoster.newPage();
      pagePoster.on("response", async (response) => {
        const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
        const url = response.url();

        if (matches && matches.length === 2) {
          const fileName = url.split("/").pop();
          const buffer = await response.buffer();
          fs.writeFileSync(
            `./images/${movies[i].rank}_${fileName}`,
            buffer,
            "base64"
          );
        }
        await browserPoster.close();
      });
      await pagePoster.goto(pagePosterUrl);
      movies[i].posterImageUrl = pagePosterUrl;
    } catch (error) {
      console.error(error);
    }
  }
  return movies;
}

async function main() {
  let movies = await scrapeTitlesRanksAndRatins();
  movies = await scrapePosterUrl(movies);
  movies = await scapePosterImageUrl(movies);

  console.log(movies);
}

main();
