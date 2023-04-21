import { diff } from "jest-diff";
import { RowWithColumns } from "excel-row-stream";
import { Options, Side, DiffHanlder } from "./types";
import { createDiffLens } from "./lens";

const NO_DIFF = "\x1B[2mCompared values have no visual difference.\x1B[22m";

export function createComparator({ columns }: Options, onDiff: DiffHanlder) {
  const diffLens = createDiffLens(columns);

  let state: Record<
    Side,
    | undefined
    | {
        row: RowWithColumns;
        callback: () => void;
      }
  > = { left: undefined, right: undefined };

  function compare(side: Side, row: RowWithColumns, callback: () => void) {
    const currentSide = state[side];
    // one of the sides is longer than other
    if (currentSide) {
      if (side === Side.Left) {
        diffReport(currentSide.row, {} as RowWithColumns, diffLens, onDiff);
      } else {
        diffReport({} as RowWithColumns, currentSide.row, diffLens, onDiff);
      }

      state = { left: undefined, right: undefined };
      currentSide.callback();
    }

    state[side] = { row, callback };

    const left = state[Side.Left];
    const right = state[Side.Right];

    if (!left || !right) {
      return;
    }

    diffReport(left.row, right.row, diffLens, onDiff);

    state = { left: undefined, right: undefined };
    left.callback();
    right.callback();
  }

  function done(finishedSide: Side) {
    const activeSide =
      state[finishedSide === Side.Left ? Side.Right : Side.Left];

    activeSide?.callback();
  }

  return { compare, done };
}

function diffReport(
  left: RowWithColumns,
  right: RowWithColumns,
  lens: (row: Partial<RowWithColumns>) => Record<string, unknown> | undefined,
  onDiff: DiffHanlder
) {
  const diffReport = diff(lens(left), lens(right));

  if (diffReport === null || diffReport === NO_DIFF) {
    return;
  }

  const index = left.index ?? right.index;

  onDiff(index, diffReport);
}
