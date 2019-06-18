const path = require("path");
const fs = require("fs-extra");
const prompts = require("prompts");
const klaw = require("klaw");
const chalk = require("chalk");
const R = require("ramda");
const config = require("./config.json");

const ROOT_CONTENT_DIR = path.resolve(config["curriculum-repo"]);
const CLASS_CONTENT_DIR = path.resolve(ROOT_CONTENT_DIR, "01-Class-Content");
const TARGET_DIR = path.resolve(config["class-repo"]);

const BANNED_MATCHERS = [/(gradingRubrics)/, /(Solved)/, /(Solutions)/];

async function main() {
  let walker = klaw(TARGET_DIR);

  let items = [];

  walker.on("data", item => {
    const rel = path.relative(TARGET_DIR, item.path);

    let matches = BANNED_MATCHERS.map(regex => rel.match(regex));

    if (matches.some(match => !!match)) {
      for (const match of matches.filter(match => !!match)) {
        items.push({ rel: rel, abs: item.path, match, stats: item.stats });
      }
    }
  });

  await new Promise((resolve, reject) => {
    walker.on("end", resolve);
    walker.on("error", reject);
  });

  if (!items.length) {
    console.log(chalk.green("Nothing to scrub"));
    return;
  }

  const { itemsToDelete } = await prompts({
    type: "multiselect",
    name: "itemsToDelete",
    message: "Select files to purge",
    choices: R.sortBy(R.prop("abs"))(items).map(item => ({
      value: item,
      title:
        "/" +
        highlight(item.rel, item.match.index, item.match[0].length, chalk.red),
      selected: false
    }))
  });

  const { confirmed } = await prompts({
    type: "confirm",
    name: "confirmed",
    message: `Delete ${itemsToDelete.length} files?`
  });

  if (confirmed) {
    let results = await Promise.all(
      itemsToDelete.map(item =>
        fs.remove(item.abs).then(
          () => ({
            success: true,
            item
          }),
          err => ({
            success: false,
            error: err,
            item
          })
        )
      )
    );

    for (const result of results) {
      if (result.success) {
        console.log(chalk.blue("DELETED ") + result.item.rel);
      } else {
        console.log(chalk.red("ERROR ") + result.item.rel);
        console.error(result.error);
      }
    }

    console.log(chalk.blue("All done."));
  } else {
    console.log("Cancelled.");
  }
}

function highlight(str, index, length, fn) {
  return (
    str.substring(0, index) +
    fn(str.substring(index, index + length)) +
    str.substring(index + length)
  );
}

main();
