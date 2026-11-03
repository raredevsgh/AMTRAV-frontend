"use client";
export function ConsoleTabs<T extends string>({label,idPrefix,items,value,onChange,separateLast=false}:{label:string;idPrefix:string;items:readonly {id:T;label:string}[];value:T;onChange:(value:T)=>void;separateLast?:boolean}) {
  const button=(item:{id:T;label:string}) => <button key={item.id} type="button" role="tab" id={`${idPrefix}-tab-${item.id}`} aria-controls={`${idPrefix}-${item.id}`} aria-selected={item.id===value} tabIndex={item.id===value ? 0 : -1} onClick={() => onChange(item.id)}>{item.label}</button>;
  return <div className="console-tabs" role="tablist" aria-label={label} onKeyDown={(event) => {
    const direction=event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const index=event.key === "Home" ? 0 : event.key === "End" ? items.length-1 : (items.findIndex((item) => item.id === value)+direction+items.length)%items.length;
    onChange(items[index].id);event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  }}><div className="console-tab-group">{(separateLast ? items.slice(0,-1) : items).map(button)}</div>{separateLast && <div className="console-tab-group">{button(items[items.length-1])}</div>}</div>;
}
