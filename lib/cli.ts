import { program } from "commander";
import { name, version } from "../package.json";

import { getCLIOptions } from "./options";
import { compareExcelSheets } from "./compare";

import { Options } from "./types";

export async function runCli() {
  const { left, right, sheet, columns } = getCLIOptions();

  const options = program
    .name(name)
    .version(version)
    .addOption(left)
    .addOption(right)
    .addOption(sheet)
    .addOption(columns)
    .parse()
    .opts<Options>();

  try {
    console.info(
      `Comparing sheet excel files:\n${options.left}\n${options.right}\n`
    );

    let diffRows = 0;
    await compareExcelSheets(options, (index, diff) => {
      diffRows++;
      console.info(`Row: ${index}\n${diff}\n`);
    });

    if (diffRows > 0) {
      console.info(`Found difference in ${diffRows} rows`);
    } else {
      console.info(`Found no difference`);
    }
  } catch (error) {
    console.info("Failed:", error);
    process.exit(1);
  }
}
