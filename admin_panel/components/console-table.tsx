import {FigmaIcon} from "./figma-icon";
import type { ReactNode } from "react";

export type ConsoleColumn<T> = {
  key: string;
  label: string;
  width: number;
  render: (row: T) => ReactNode;
  className?: string;
  sort?: "ascending" | "descending" | "none";
  onSort?: () => void;
};

export function SortIndicator({direction}:{direction:"ascending"|"descending"|"none"}) {
  return <FigmaIcon name={direction === "ascending" ? "arrowUp" : direction === "descending" ? "arrowDown" : "sort"} className={`table-sort-icon${direction === "none" ? " is-unsorted" : ""}`} />;
}

export function ConsoleTable<T>({ label, columns, rows, rowKey }: {
  label: string;
  columns: readonly ConsoleColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="table-scroll registry-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className="registry-table">
        <colgroup>{columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}</colgroup>
        <thead><tr>{columns.map((column) => (
          <th key={column.key} scope="col" aria-sort={column.sort}>
            {column.onSort ? <button type="button" onClick={column.onSort}>{column.label}
              <SortIndicator direction={column.sort ?? "none"} />
            </button> : <>{column.label}{column.sort && column.sort !== "none" && <SortIndicator direction={column.sort} />}</>}
          </th>
        ))}</tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key} className={column.className}>{column.render(row)}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function ConsolePagination({ page, limit, total, onPage }: {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const count = Math.min(limit, Math.max(0, total - page * limit));
  return (
    <div className="console-pagination">
      <p>{count} on this page</p>
      <div>
        <button aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)}><FigmaIcon name="chevronLeft" /></button>
        <button aria-label="Next page" disabled={(page + 1) * limit >= total} onClick={() => onPage(page + 1)}><FigmaIcon name="chevronRight" /></button>
      </div>
    </div>
  );
}

export function RegistryEmptyState({title,onClear}:{title:string;onClear?:()=>void}) {
  return <div className="registry-empty empty-state"><h2>{title}</h2>{onClear && <button className="btn btn-secondary" onClick={onClear}>Clear filters</button>}</div>;
}
