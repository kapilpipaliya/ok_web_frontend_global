import {Component, createContext, JSX, useContext} from "solid-js";

import "./base.css";
import "./radio.css";

export const tableContext = createContext<[] | []>([]);

export type TableCellProps = JSX.HTMLAttributes<HTMLTableCellElement> & {
    disabled?: boolean;
  };

export const TableHeader: Component<TableCellProps> = (props) => {
  const [] = useContext(tableContext);
  
  return (
      <th {...props}/>
  );
};

export const TableRow: Component<TableCellProps> = (props) => {
    const [] = useContext(tableContext);

    return (
        <td {...props}/>
    );
};

export type TableProps = JSX.HTMLAttributes<HTMLTableElement> & {
};

export const TableGroup: Component<TableProps> = (props) => {
  return (
    <tableContext.Provider value={[]}>
      <table {...props}/>
    </tableContext.Provider>
  );
};
