/** Historical, fictional device snapshots from the actual current Device Detail PNGs.
 * Locations describe the exported last report, not a live position. */
export type DeviceSnapshot = {location:string|null;weightKg:number|null;connection:"Cellular"|null;lock:"Locked"|"Unlocked"|null;manufacturerLabel?:string};
export const deviceSnapshots:Record<string,DeviceSnapshot>={
  "AMT-EX76-1A77C2":{location:"Accra",weightKg:22,connection:"Cellular",lock:"Locked"},
  "AMT-FL68-0C19D4":{location:"Madrid T4",weightKg:22.4,connection:"Cellular",lock:"Unlocked"},
  "AMT-ES55-5A06B3":{location:"Heathrow T5",weightKg:21.6,connection:"Cellular",lock:"Unlocked",manufacturerLabel:"Northline Luggage"},
  "AMT-PR76-2B40E1":{location:"Lagos",weightKg:18.9,connection:"Cellular",lock:"Locked"},
  "AMT-FL68-3D82A6":{location:"Rome",weightKg:20.4,connection:"Cellular",lock:"Locked"},
  "AMT-ES55-00F3B4":{location:null,weightKg:null,connection:"Cellular",lock:"Locked"},
  "AMT-PR68-4E11F9":{location:"Nairobi",weightKg:20.1,connection:"Cellular",lock:"Locked"},
  "AMT-FL76-7F28C5":{location:"Lisbon",weightKg:21.2,connection:"Cellular",lock:"Locked"},
  "AMT-PR55-8B74E2":{location:"Accra",weightKg:null,connection:"Cellular",lock:"Locked"},
  "AMT-ES68-9D15A7":{location:"Rome",weightKg:18.7,connection:"Cellular",lock:"Locked"},
  "AMT-EX55-A042F8":{location:"Doha",weightKg:9.8,connection:"Cellular",lock:"Locked"},
  "AMT-EX68-6C93D0":{location:null,weightKg:null,connection:"Cellular",lock:"Locked"},
  "AMT-FL55-B3E6C1":{location:null,weightKg:null,connection:null,lock:null},
};
export type DeviceLocationRecord={id:string;timestamp:string;place:string;source:string;accuracy:number|null;event:string};
export const referenceLocationHistory:DeviceLocationRecord[]=[
  {id:"last-contact",timestamp:"2026-10-29T11:18:00Z",place:"Heathrow T5",source:"Cellular",accuracy:150,event:"Last contact"},
  {id:"tamper",timestamp:"2026-10-29T11:02:00Z",place:"Heathrow T5",source:"GNSS",accuracy:25,event:"Tamper event"},
  {id:"impact",timestamp:"2026-10-29T10:26:00Z",place:"Baggage hall, Heathrow T5",source:"Cellular",accuracy:150,event:"Severe impact"},
  {id:"separated",timestamp:"2026-10-29T09:47:00Z",place:"Heathrow T5",source:"GNSS",accuracy:25,event:"Separated from owner"},
  {id:"started",timestamp:"2026-10-29T06:40:00Z",place:"Reading",source:"GNSS",accuracy:10,event:"Journey started"},
];
// The reference lists this historical ID but exports no route/timeline for it.
export const historicalJourneyReference={id:"JRN-2177",date:"2026-10-12",note:"No route or timeline was supplied in the current design exports."};
