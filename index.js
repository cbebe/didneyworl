// @ts-check
const puppeteer = require("puppeteer");
require("dotenv").config();

const { EMAIL, PASSWORD } = process.env;

/**
 * Delay by a set amount of time
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {puppeteer.Page} page
 * @param {string} selector
 */
function checkDisabled(page, selector) {
  return page.$eval(selector, (button) => !!button.className.match("disabled"));
}

async function main() {
  if (EMAIL === undefined || PASSWORD === undefined) {
    console.log("EMAIL or PASSWORD undefined");
    return;
  }
  const browser = await puppeteer.launch({ headless: false, slowMo: 8 });
  const page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0",
  );

  // signin
  const signIn = "https://reserve.tokyodisneyresort.jp/fli/signin/";
  await page.goto(signIn, { waitUntil: "domcontentloaded", timeout: 0 });
  await page.focus("#_userId");
  await page.keyboard.type(EMAIL);
  await page.focus("#_password");
  await page.keyboard.type(PASSWORD);
  await page.$eval(".next", (button) => {
    button.click();
  });
  await page.waitForNavigation({ timeout: 0 });

  // list orders
  const orderList = "https://reserve.tokyodisneyresort.jp/order/list/";
  await page.goto(orderList, { waitUntil: "domcontentloaded", timeout: 0 });
  await page.evaluate(() => {
    // @ts-expect-error this function exists in the browser
    listToDetail("828633214");
  });
  await page.waitForNetworkIdle({ timeout: 0 });
  await page.click("#changeTicketSelectBtn");
  await page.waitForNavigation({ timeout: 0 });
  await page.click("#checkboxAll");
  await page.click("#fahToChangeBtn");
  await page.waitForNavigation({ timeout: 0 });
  await page.click("#selectTicketGroupCd");
  await page.click("#selectTicketGroupCd > option:nth-child(2)");
  await page.click(
    "#updateCalendar > div > div > ul > button.slick-next.slick-arrow",
  );
  while (true) {
    for (let i = 1; i <= 4; i++) {
      await page.click(`a[data-day='${i}']:not(.past)`);

      await delay(1000 * 5);

      const disneyLand = !(await checkDisabled(page, ".update-1day-01"));
      const disneySea = !(await checkDisabled(page, ".update-1day-02"));

      if (disneyLand) {
        console.log("DisneyLand is available, do what you want to do here");
      }
      if (disneySea) {
        console.log("DisneySea is available, do what you want to do here");
      }
    }
    // wait 5 minutes
    await delay(1000 * 60 * 5);
  }
}

main();
