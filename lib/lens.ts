import { RowWithColumns } from "excel-row-stream";

type Row = Partial<RowWithColumns>;
type Diff = RowWithColumns["columns"];

export function createDiffLens(wantColumns?: string[]) {
  if (!wantColumns || wantColumns.length === 0) {
    return (row: Row) => row.columns;
  }

  return ({ columns }: Row) => {
    if (!columns) {
      return columns;
    }

    return wantColumns.reduce<Diff>((diff, column) => {
      diff[column] = columns[column];
      return diff;
    }, {});
  };
}
