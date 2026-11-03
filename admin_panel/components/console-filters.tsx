"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {FigmaIcon} from "./figma-icon";

export function FilterMenu({ label, active = false, className = "", children }: {
  label: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) {
        ref.current.open = false;
      }
    };
    // Safari does not focus every control on pointer activation, so Escape can
    // target the document even while the menu is visibly open.
    const escape = (event:KeyboardEvent) => {
      if(event.key !== "Escape" || !ref.current?.open || document.querySelector("dialog:modal"))return;
      event.preventDefault();ref.current.open=false;
      ref.current.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {document.removeEventListener("pointerdown", dismiss);document.removeEventListener("keydown", escape);};
  }, []);
  return (
    <details ref={ref} className={`console-filter ${active ? "is-active" : ""} ${className}`}>
      <summary>{label}<FigmaIcon name="chevronDown" /></summary>
      <div className="console-filter-panel">{children}</div>
    </details>
  );
}

export function FilterOptions({ label, name, value, options, onChange }: {
  label: string;
  name: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend>{label}</legend>
      {options.map(([option, text]) => (
        <label key={option}>
          <input type="radio" name={name} value={option} checked={value === option}
            onChange={(event) => {
              onChange(option);
              const menu = event.currentTarget.closest("details");
              if (menu) {
                menu.open = false;
                menu.querySelector("summary")?.focus();
              }
            }} />
          {text}
        </label>
      ))}
    </fieldset>
  );
}

export function FilterChecks({ label, values, options, onChange, showLegend=false }: {
  label: string;
  values: readonly string[];
  options: readonly (readonly [string, string])[];
  onChange: (values: string[]) => void;
  showLegend?:boolean;
}) {
  return <fieldset><legend className={showLegend ? undefined : "sr-only"}>{label}</legend>{options.map(([value, text]) => (
    <label key={value}><input type="checkbox" checked={values.includes(value)}
      onChange={(event) => onChange(event.target.checked ? [...values, value] : values.filter((item) => item !== value))} />{text}</label>
  ))}</fieldset>;
}

export function ConsoleSearch({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) {
  return <label className="registry-search"><span className="sr-only">{label}</span><input aria-label={label} placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} />{value && <button className="registry-search-clear" type="button" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange("")}><FigmaIcon name="close" /></button>}</label>;
}
