import { createReadStream } from "fs";
import { Writable } from "stream";
import { pipeline } from "stream/promises";

import createExcelParserStream, {
  createRowToRowWithColumnsStream,
  RowWithColumns,
} from "excel-row-stream";

import {parse as createCSVParseStream} from 'fast-csv'

import { Options, Side, DiffHanlder } from "./types";
import { createComparator } from "./comparator";

export async function compareExcelSheets(
  options: Options,
  onDiff: DiffHanlder
): Promise<void> {
  const { compare, done } = createComparator(options, onDiff);

  const matchSheet = new RegExp(options.sheet, "i");

  const leftStream = createReadStream(options.left);
  const leftWithColumnsStream = createRowToRowWithColumnsStream();
  // const leftExcelParserStream = createExcelParserStream({
  //   matchSheet,
  // });
  const leftExcelParserStream = createCSVParseStream();

  const rightStream = createReadStream(options.right);
  const rightWithColumnsStream = createRowToRowWithColumnsStream();
  // const rightExcelParserStream = createExcelParserStream({
  //   matchSheet,
  // });
  const rightExcelParserStream = createCSVParseStream();

  const leftRowsStream = new Writable({
    objectMode: true,
    write(row: RowWithColumns, _encoding, callback) {
      compare(Side.Left, row, callback);
    },
  });

  const rightRowsStream = new Writable({
    objectMode: true,
    write(row: RowWithColumns, _encoding, callback) {
      compare(Side.Right, row, callback);
    },
  });

  await Promise.all([
    pipeline(
      leftStream,
      leftExcelParserStream,
      // leftWithColumnsStream,
      leftRowsStream
    ).then(() => done(Side.Left)),
    pipeline(
      rightStream,
      rightExcelParserStream,
      // rightWithColumnsStream,
      rightRowsStream
    ).then(() => done(Side.Right)),
  ]);
}
