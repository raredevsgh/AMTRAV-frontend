import Link from "next/link";
import type {ReactNode} from "react";
import {FigmaIcon} from "./figma-icon";

export function RecordHeader({back,backLabel,title,status,meta,actions}:{back:string;backLabel:string;title:string;status:ReactNode;meta:ReactNode;actions?:ReactNode}) {
  return <header className="record-header"><Link className="record-back" href={back}><FigmaIcon name="chevronLeft" />{backLabel}</Link>
    <div className="record-heading"><h1 tabIndex={-1}>{title}</h1>{actions}</div>
    <div className="record-status">{status}</div><div className="record-meta">{meta}</div>
  </header>;
}
export function DetailRows({title,rows}:{title:string;rows:readonly {label:string;value:ReactNode;icon?:ReactNode}[]}) {
  return <section className="detail-card">{title && <h2>{title}</h2>}<dl>{rows.map((row) => <div key={row.label}><dt>{row.icon && <span aria-hidden="true">{row.icon}</span>}{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>;
}

export function RecordToast({message}:{message:string}) {
  return message ? <div className="record-toast" role="status"><span aria-hidden="true"><FigmaIcon name="check" /></span>{message}</div> : null;
}
