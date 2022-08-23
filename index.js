"use strict";

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

class Cocktail {
  constructor(name, image, url, ingredients, instructions) {
    this.name = name;
    this.image = image;
    this.url = url;
    this.ingredients = ingredients;
    this.instructions = instructions;
  }
}
let browser, html, $;

(async () => {
  browser = await puppeteer.launch({
    dumpio: false
  });
  const [page] = await browser.pages();
  const baseURL = "https://www.saq.com/en/cocktails?p=$&product_list_limit=96";

  const images = [],
    names = [],
    links = [];

  for (let i = 9; i <= 10; i++) {
    await page.goto(baseURL.replace('$', i), {
      waitUntil: "domcontentloaded"
    });
    html = await page.content();
    $ = cheerio.load(html);


    $('img.product-image-photo').each(function () {
      images.push($(this).attr('src').split('?')[0]);
    });
    $('a.product-item-link').each(function () {
      names.push($(this).text().trim());
      links.push($(this).attr('href'));
    });
  }

  for (let i = 0; i < links.length; i++) {
    console.log('#' + i + ': ' + names[i]);
    await page.goto(links[i], {
      waitUntil: "domcontentloaded"
    });
    html = await page.content();
    $ = cheerio.load(html);

    const ingredients = [];
    const instructions = [];
    $('div.cocktail.ingredients-text > div.value > ul > li').each(function () {
      ingredients.push($(this).text().trim());
    });
    $('div.cocktail.preparation-text > div.value  > p').each(function () {
      instructions.push($(this).text().trim());
    });

    const cocktail = new Cocktail(names[i], images[i], links[i], ingredients, instructions);
    fs.appendFileSync('cocktails.txt', JSON.stringify(cocktail));
  }

  return;
})()
.catch(err => console.error(err))
  .finally(() => browser.close());