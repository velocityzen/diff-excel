export interface Options {
  left: string;
  right: string;
  sheet: string;
  columns?: string[];
}

export type DiffHanlder = (index: number, diff: string) => void;

export enum Side {
  Left = "left",
  Right = "right",
}
