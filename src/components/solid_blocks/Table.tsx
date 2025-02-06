import { createContext, type JSX, useContext } from "solid-js";

import "./radio/radio.css";

export const tableContext = createContext<[] | []>([]);

export type TableCellProps = JSX.HTMLAttributes<HTMLTableCellElement> & {
  disabled?: boolean;
};

export type TableProps = JSX.HTMLAttributes<HTMLTableElement> & {};

export function TableGroup(props: Readonly<TableProps>) {
  return (
    <tableContext.Provider value={[]}>
      <table {...props} />
    </tableContext.Provider>
  );
}

export function TableHeader(props: Readonly<TableCellProps>) {
  const [] = useContext(tableContext);

  return <th {...props} />;
}

export function TableRow(props: Readonly<TableCellProps>) {
  const [] = useContext(tableContext);

  return <td {...props} />;
}
