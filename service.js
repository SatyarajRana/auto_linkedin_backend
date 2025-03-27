// Helper function to split and clean the raw post string
function cleanAndSplit(rawPost) {
  // Split by newline, trim each line, and filter out empty lines
  return rawPost
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

// Main parsing function
function parsePost(lines) {
  //   const lines = cleanAndSplit(rawPost);
  let post = {};
  let currentIndex = 0;

  // 1. Extract post ID from the first line (e.g., "Feed post number 4")
  const postIdMatch = lines[currentIndex].match(/\d+/);
  if (postIdMatch) {
    post.postId = parseInt(postIdMatch[0], 10);
  }
  currentIndex++;

  // 2. Extract author name (assuming it's on the next line)
  //   post.author = {};
  post.author = lines[currentIndex];
  //remove first character

  currentIndex++;

  // 3. Skip duplicate author name if it appears immediately again
  if (lines[currentIndex] === post.author.name) {
    currentIndex++;
  }

  // 4. Skip lines containing follower/following info (e.g., lines with "Following")
  while (
    currentIndex < lines.length &&
    lines[currentIndex].includes("Following")
  ) {
    currentIndex++;
  }
  //   console.log("Current index is: ", currentIndex);

  // 5. Extract profile headline (assuming it appears next)
  //   post.author.headline = lines[currentIndex];
  //   currentIndex++;

  // 6. Skip duplicate headline if present
  //   if (lines[currentIndex] === post.author.headline) {
  //     currentIndex++;
  //   }

  // 7. Extract website information if available
  //   if (
  //     lines[currentIndex] &&
  //     lines[currentIndex].toLowerCase().includes("visit my website")
  //   ) {
  //     post.author.website = lines[currentIndex];
  //     currentIndex++;
  //   }

  // 8. Extract timestamp by searching for a line that contains "ago"
  while (currentIndex < lines.length && !lines[currentIndex].includes("ago")) {
    currentIndex++;
  }
  if (currentIndex < lines.length) {
    post.timestamp = lines[currentIndex];
    currentIndex++;
  }

  // 9. Extract the main post content until reaching markers like "hashtag" or engagement info
  let contentLines = [];
  while (
    currentIndex < lines.length &&
    !(
      lines[currentIndex].toLowerCase().includes("…more") ||
      lines[currentIndex].includes("Starting a New Position")
    )
  ) {
    contentLines.push(lines[currentIndex]);
    currentIndex++;
  }
  post.content = contentLines.join("\n");

  // 10. Extract engagement metrics (likes, comments, reposts) from the remaining lines

  //   while (
  //     currentIndex < lines.length &&
  //     !lines[currentIndex].includes(
  //       "view larger image" || "Your document is loading"
  //     )
  //   ) {
  //     currentIndex++;
  //   }
  //   console.log("line is: ", lines[currentIndex]);

  //   console.log("current index is: ", currentIndex);

  while (
    currentIndex < lines.length &&
    !(
      lines[currentIndex].includes("Activate") ||
      lines[currentIndex].includes("Your document is loading") ||
      lines[currentIndex].includes("Starting a New Position") ||
      lines[currentIndex].includes("Play")
    )
  ) {
    // console.log("line is: ", lines[currentIndex]);

    currentIndex++;
  }
  //   console.log("current index is: ", currentIndex);

  //   console.log("line is: ", lines[currentIndex]);

  while (
    (currentIndex < lines.length && lines[currentIndex].includes("Activate")) ||
    lines[currentIndex].includes("Your document is loading") ||
    lines[currentIndex].includes("Starting a New Position") ||
    lines[currentIndex].includes("Play")
  ) {
    currentIndex++;
  }

  post.engagement = {};
  post.engagement.likes = parseInt(lines[currentIndex].replace(/,/g, ""), 10);

  currentIndex++;

  if (
    lines[currentIndex].includes("comments") ||
    lines[currentIndex].includes("comment")
  ) {
    post.engagement.comments = parseInt(
      lines[currentIndex].replace(/,/g, ""),
      10
    );
  }
  currentIndex++;
  if (
    lines[currentIndex].includes("comments") ||
    lines[currentIndex].includes("comment")
  ) {
    post.engagement.comments = parseInt(
      lines[currentIndex].replace(/,/g, ""),
      10
    );
  }

  if (
    lines[currentIndex].includes("reposts") ||
    lines[currentIndex].includes("repost")
  ) {
    post.engagement.reposts = parseInt(
      lines[currentIndex].replace(/,/g, ""),
      10
    );
  }

  return post;
}

// --- Test the parsing function with sample raw post data ---
// const rawPost = `'Feed post number 13\n' +
//     'Raj Vikramaditya\n' +
//     'Raj Vikramaditya\n' +
//     ' \n' +
//     ' • Following\n' +
//     ' • Following\n' +
//     'SWE-III @ Google | Building takeUforward | YouTuber(600K+) | Ex-Media.net, Amazon | JGEC\n' +
//     'SWE-III @ Google | Building takeUforward | YouTuber(600K+) | Ex-Media.net, Amazon | JGEC\n' +
//     'Visit my website\n' +
//     '1mo • \n' +
//     ' \n' +
//     '1 month ago\n' +
//     'Quick commerce has transformed the way we shop. \n' +
//     '\n' +
//     'It has over 25 million active users who rely on it for essentials as it delivers super quickly. \n' +
//     '\n' +
//     'This was all made possible by modern technology, particularly AI-powered algorithms, advanced data management, and streamlined customer support systems.\n' +
//     '\n' +
//     'For someone like me, living alone, access to medications and healthcare essentials is a top priority. Apollo 24|7 has addressed this need by bringing multiple healthcare services together on one platform. \n' +
//     '\n' +
//     'It delivers medicines within 19-29 minutes in 6+ cities and also offers online doctor consultations with other medical services. Also, their Circle Membership adds a lot of value with its benefits.\n' +
//     '\n' +
//     'It’s great to see them make such meaningful contributions to society while achieving excellent growth under innovative leadership.\n' +
//     '\n' +
//     '\n' +
//     'hashtag\n' +
//     '#healthcare \n' +
//     'hashtag\n' +
//     '#technology \n' +
//     'hashtag\n' +
//     '#19minutes \n' +
//     'hashtag\n' +
//     '#Partnership\n' +
//     '…more\n' +
//     'Activate to view larger image,\n' +
//     'Activate to view larger image,\n' +
//     '3,466\n' +
//     'SAHIL KAMBLE and 3,465 others\n' +
//     '28 comments\n' +
//     '1 repost\n' +
//     'Like\n' +
//     'Comment\n' +
//     'Repost\n' +
//     'Send'`;

const testLines = [
  "Feed post number 2",
  "Raj Vikramaditya",
  "Raj Vikramaditya",
  "• Following",
  "• Following",
  "SWE-III @ Google | Building takeUforward | YouTuber(600K+) | Ex-Media.net, Amazon | JGEC",
  "SWE-III @ Google | Building takeUforward | YouTuber(600K+) | Ex-Media.net, Amazon | JGEC",
  "Visit my website",
  "1d •",
  "1 day ago",
  "I was recently invited by EPAM Systems to visit their office in Bangalore, and seeing how much they are investing in AI truly excites me about the future.",
  "Everyone wants to be part of a workplace that encourages continuous upskilling and learning, and during my visit, I got to see how their EPAM AI Ambassador Program is structured to align employees with this growing trend.",
  "The program is structured to:",
  "- Educate employees at various levels on AI fundamentals and advanced concepts.",
  "- Encourage hands-on application through bootcamps and real-world AI use cases.",
  "- Build a community of AI champions who drive innovation within EPAM.",
  "- Develop role-specific AI skills in areas like AI-Assisted Engineering, Quality Assurance, and Business Analysis.",
  'By enabling employees to practically apply AI, EPAM is not only driving business objectives but also creating the "right teams" to solve complex client challenges with cutting-edge AI solutions.',
  "Additionally, I saw firsthand how EPAM has shifted significantly towards AI agents, resulting in increased velocity in the delivery of features.",
  "EliteA – A powerful platform that simplifies Large Language Model (LLM) management, development, and collaboration, helping organizations seamlessly integrate AI into their workflows.",
  "EPAM DIAL – A platform that allows users to securely leverage a mix of public and proprietary LLMs, Add-ons, and APIs, boosting productivity while ensuring data security.",
  "Overall, the vibe, the flexibility of working from different places, and the massive emphasis on learning with every initiative was inspiring.",
  "EPAM has a lot of exciting openings on their careers portal.",
  "You can check them out here: https://lnkd.in/d8SQTEri",
  "…more",
  "Activate to view larger image,",
  "7,035",
  "SAHIL KAMBLE and 7,034 others",
  "34 comments",
  "17 reposts",
  "Like",
  "Comment",
  "Repost",
  "Send",
];

// console.log(parsePost(testLines));

function cleanPost(rawPost) {
  const lines = cleanAndSplit(rawPost);
  console.log("Lines are: ", lines);

  return parsePost(lines);
}

module.exports = { cleanPost };
