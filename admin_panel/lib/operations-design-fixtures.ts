/** Fictional service observations transcribed from current Figma Operations frames. */
export type ServiceProfile={reading:"Stable"|"Unstable"|"No reading";calibrated:string|null;zeroOffset:number|null;sensors:string;historyCount:number;weightKg:number|null;spread:string|null;calibrations:{date:string;offset:number}[];condition:string;selfTest:string|null;nextStep:string;temperature:number|null;rssi:number|null};
const seeds:readonly (readonly [string,ServiceProfile["reading"],string|null,number|null,string,number,string,string|null,string,number|null,number|null])[]=[
  ["AMT-EX76-1A77C2","Stable","2026-10-20",0.01,"All OK",3,"OK","2026-11-01","Nothing due",22,-81],
  ["AMT-FL68-0C19D4","Stable","2026-10-14",0.02,"Tamper switch triggered",2,"OK","2026-11-01","Nothing due",23,-79],
  ["AMT-ES55-5A06B3","Stable","2026-10-12",0.02,"Tamper switch triggered",2,"No recent data","2026-10-29","Update firmware to 1.4.2",24,-97],
  ["AMT-PR76-2B40E1","Stable","2026-10-09",0.01,"All OK",2,"OK","2026-11-01","Nothing due",26,-84],
  ["AMT-FL68-3D82A6","Stable","2026-10-03",0.03,"All OK",1,"No recent data","2026-11-01","Nothing due",21,-102],
  ["AMT-ES55-00F3B4","Stable","2026-09-21",0.02,"All OK",2,"Check","2026-11-01","Charge battery",25,-83],
  ["AMT-PR68-4E11F9","Unstable","2026-04-02",0.11,"Load cell drift",4,"Check","2026-10-31","Recalibrate weight",22,-95],
  ["AMT-FL76-7F28C5","Stable","2026-10-18",0.01,"All OK",1,"OK","2026-11-01","Nothing due",20,-76],
  ["AMT-PR55-8B74E2","Stable","2026-10-02",0.02,"All OK",1,"OK","2026-11-01","Nothing due",23,-80],
  ["AMT-ES68-9D15A7","Stable","2026-10-15",0.04,"All OK",2,"Check","2026-11-01","Retry firmware update",22,-82],
  ["AMT-EX55-A042F8","Unstable","2026-09-27",0.05,"All OK",3,"No recent data","2026-10-31","Repeat weight check",24,-99],
  ["AMT-EX68-6C93D0","No reading","2026-08-08",null,"Not tested since revoked",2,"Revoked","2026-10-23","None",null,null],
  ["AMT-FL55-B3E6C1","No reading",null,null,"Not tested",0,"Not claimed",null,"None",null,null],
];
export const serviceProfiles:Record<string,ServiceProfile>=Object.fromEntries(seeds.map(([serial,reading,calibrated,zeroOffset,sensors,historyCount,condition,selfTest,nextStep,temperature,rssi]) => [serial,{reading,calibrated,zeroOffset,sensors,historyCount,weightKg:null,spread:null,calibrations:calibrated && zeroOffset !== null ? [{date:calibrated,offset:zeroOffset}] : [],condition,selfTest,nextStep,temperature,rssi}]));
Object.assign(serviceProfiles["AMT-ES55-5A06B3"],{weightKg:21.6,spread:"0.02 kg over 3 s",calibrations:[{date:"2026-10-12",offset:0.02},{date:"2026-10-10",offset:0.03}]});
Object.assign(serviceProfiles["AMT-PR68-4E11F9"],{spread:"1.3 kg over 3 s",calibrations:[{date:"2026-04-02",offset:0.11},{date:"2026-01-12",offset:0.06}]});
export const impactClassifications=[
  {id:"light",name:"Light",force:"Below 8 g",sensor:"Light",priority:"No alert",note:"Logged"},
  {id:"moderate",name:"Moderate",force:"From 8 g",sensor:"Moderate",priority:"No alert",note:"Logged"},
  {id:"severe",name:"Severe",force:"From 15 g",sensor:"Severe",priority:"Warning",note:"Can escalate"},
];
export const recentImpacts=[
  {id:"severe-1",serial:"AMT-ES55-5A06B3",force:18.4,name:"Severe",priority:"Critical",alertId:"ALT-5097"},
  {id:"severe-2",serial:"AMT-PR76-2B40E1",force:16.2,name:"Severe",priority:"Warning",alertId:"ALT-5124"},
  {id:"moderate-1",serial:"AMT-ES55-5A06B3",force:9.1,name:"Moderate",priority:"No alert",alertId:null},
  {id:"light-1",serial:"AMT-ES55-5A06B3",force:5.2,name:"Light",priority:"No alert",alertId:null},
];
export const firmwareVersions=[{id:"1.4.2",released:"2026-10-06",state:"Latest"},{id:"1.4.1",released:"2026-09-02",state:"Supported"},{id:"1.3.9",released:"2026-06-11",state:"Update due"}];
export const firmwareHistory=[
  {id:"fw-1",serial:"AMT-ES55-5A06B3",change:"1.3.9 to 1.4.2",date:null,connection:"—",result:"Not started"},
  {id:"fw-2",serial:"AMT-ES68-9D15A7",change:"1.4.1 to 1.4.2",date:"2026-10-28",connection:"Cellular",result:"Failed: signal lost"},
  {id:"fw-3",serial:"AMT-PR76-2B40E1",change:"1.4.1 to 1.4.2",date:"2026-10-20",connection:"Cellular",result:"Success"},
  {id:"fw-4",serial:"AMT-EX55-A042F8",change:"1.4.1 to 1.4.2",date:"2026-10-18",connection:"Bluetooth",result:"Success"},
  {id:"fw-5",serial:"AMT-ES55-00F3B4",change:"1.4.0 to 1.4.1",date:"2026-09-05",connection:"Bluetooth",result:"Success"},
];
export const demoReplacementSerial="AMT-ES55-7D20C4";
export type DemoAdminAudit={id:string;action:string;who:string;timestamp:string;detail:string};
export type DemoDeviceAdminState={suspended:boolean;replacementSerial?:string;audit:DemoAdminAudit[]};
export const referenceAdminAudit:DemoAdminAudit[]=[
  {id:"claimed",action:"device.claimed",who:"c.mensah@example.com",timestamp:"2026-10-12T16:21:00Z",detail:"In the app"},
  {id:"issued",action:"claim_code.issued",who:"ama.mensah@amortrav.example",timestamp:"2026-10-10T09:40:00Z",detail:"—"},
  {id:"registered",action:"device.registered",who:"ama.mensah@amortrav.example",timestamp:"2026-10-10T09:40:00Z",detail:"Northline Luggage"},
];
