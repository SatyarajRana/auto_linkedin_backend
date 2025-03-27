const puppeteer = require("puppeteer");
const { cleanPost } = require("./service");

const URL =
  "https://www.linkedin.com/in/shivansh-sinha-945907223/recent-activity/all/"; // Change to target user
//   "https://www.youtube.com";
const COOKIES = [
  {
    name: "li_at",
    value:
      "AQEDATm7se0A6n4XAAABlbPMgJ0AAAGV19kEnU0AL-RJnZVL84_yNhbFpnHZgfND6ZOTU-bzEYLUDa-72l6UwPTAe74ZVk04uBU0WEJFZmYwbGU2HbBUHAvtWqIbjCq58xo28WcUT5-ktnZmhb0ahomW", // Paste the li_at value here
    domain: ".linkedin.com",
  },
];

async function scrapeLinkedInPosts(URL, count) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Set cookies for authentication
  await page.setCookie(...COOKIES);
  //wait for 5 seconds

  // Navigate to LinkedIn profile
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const temp_element = await page.waitForSelector(
    "div > .feed-shared-update-v2"
  );
  let posts = new Set(); // Use a Set to store unique posts
  let previousHeight = 0;

  for (let i = 0; i < count / 4; i++) {
    // Scroll multiple times to load more posts
    console.log(`Scrolling... (${i + 1})`);

    // Scroll to the bottom
    await page.evaluate(() => {
      window.scrollBy(0, 1600);
      console.log("document scroll height is: ", document.body.scrollHeight);
    });

    // await page.waitForTimeout(3000);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Extract posts
    let elements = await page.$$("div.feed-shared-update-v2");

    for (const element of elements) {
      const textContent = await page.evaluate((el) => el.innerText, element);
      posts.add(textContent.trim());
    }
  }

  //   console.log(`Total posts collected: ${posts.size}`);
  //   console.log([...posts]);
  // number of posts should be equal to count
  posts = [...posts].slice(0, count);
  console.log(posts);

  const cleanedPosts = posts.map((post) => cleanPost(post));
  //   console.log("cleaned posts are: ", cleanedPosts);

  await browser.close();
  return cleanedPosts;
}

// scrapeLinkedInPosts(URL, 10).then((posts) => {
//   console.log(posts);
// });

module.exports = { scrapeLinkedInPosts };
