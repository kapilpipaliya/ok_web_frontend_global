import { Component, createContext, type JSX, useContext } from "solid-js";

import "../base.css";
import "../radio/radio.css";

export const tableContext = createContext<[] | []>([]);

export type TableCellProps = JSX.HTMLAttributes<HTMLTableCellElement> & {
  disabled?: boolean;
};

export function TableHeader(props: TableCellProps) {
  const [] = useContext(tableContext);

  return <th {...props} />;
}

export function TableRow(props: TableCellProps) {
  const [] = useContext(tableContext);

  return <td {...props} />;
}

export type TableProps = JSX.HTMLAttributes<HTMLTableElement> & {};

export function TableGroup(props: TableProps) {
  return (
    <tableContext.Provider value={[]}>
      <table {...props} />
    </tableContext.Provider>
  );
}
