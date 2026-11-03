// Original 1x PNG strip exported manually from Figma node 2488:134.
// Each 16px icon has a 24px gap; CSS masks preserve its exact source shape.
const positions={search:0,chevronDown:1,chevronUp:2,chevronRight:3,chevronLeft:4,close:5,check:6,minus:7,plus:8,sort:9,arrowUp:10,upload:10,arrowDown:11,download:11,lock:12,info:13,refresh:14,loading:15,signOut:16,warning:17,offline:18,signal:19,battery:20,location:21,weight:22,impact:23,firmware:24,sensors:25,flag:26,link:27,unlock:28,clock:29,customer:30,settings:31} as const;
export type FigmaIconName=keyof typeof positions;
export function FigmaIcon({name,className=""}:{name:FigmaIconName;className?:string}) {
  const position=`${-positions[name]*40}px 0`;
  return <span aria-hidden="true" className={`figma-glyph ${className}`} style={{maskPosition:position,WebkitMaskPosition:position}} />;
}
