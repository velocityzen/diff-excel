import { Option } from "commander";

export function getCLIOptions() {
  const left = new Option(
    "-l, --left <string>",
    "left excel file"
  ).makeOptionMandatory();

  const right = new Option(
    "-r, --right <string>",
    "right excel file"
  ).makeOptionMandatory();

  const sheet = new Option(
    "-s, --sheet <string>",
    "sheet name to compare data from"
  ).makeOptionMandatory();

  const columns = new Option(
    "-c, --columns <columns...>",
    "columns to compare rows by"
  );

  return { left, right, sheet, columns };
}
