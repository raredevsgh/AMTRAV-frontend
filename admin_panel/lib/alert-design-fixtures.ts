/** Local fictional evidence transcribed from actual current Alert Detail Figma frames. */
import type {AlertNote,AlertOutcome} from "./api/types";
import {journeyPresentation,type JourneyEvent} from "./journey-design-fixtures";
export const alertOutcomeLabels:Record<AlertOutcome,string>={no_tampering_found:"No tampering found",charged:"Charged",recalibrated:"Recalibrated",owner_reunited:"Owner reunited",reviewed:"Reviewed"};
type AlertPresentation={location?:string;assignedTo?:string;outcome?:AlertOutcome;notes?:AlertNote[];evidence:JourneyEvent[]};
const events=(id:string,indices:number[]) => indices.map((index) => journeyPresentation[id].events[index]);
const note=(author:string,timestamp:string,text:string):AlertNote => ({id:`${author}-${timestamp}`,author,timestamp,text});
export const alertPresentation:Record<string,AlertPresentation>={
  "ALT-5098":{location:"Heathrow T5",assignedTo:"Ama Mensah",evidence:events("JRN-2291",[3,4,5,6]),notes:[note("Lena Park","2026-10-30T09:05:00Z","Customer says they did not open the bag."),note("Ama Mensah","2026-10-29T12:20:00Z","Asked the airline to check the bag.")]},
  "ALT-5097":{location:"Baggage hall",assignedTo:"Ama Mensah",evidence:events("JRN-2291",[2,4,5]),notes:[note("Ama Mensah","2026-10-29T12:22:00Z","Linked to the tamper event. No damage report.")]},
  "ALT-5096":{location:"Heathrow T5",assignedTo:"Ama Mensah",evidence:events("JRN-2291",[3])},
  "ALT-5127":{location:"Accra",evidence:events("JRN-2318",[0,2,3])},
  "ALT-5126":{location:"Madrid T4",assignedTo:"Kofi Asante",evidence:events("JRN-2315",[2,3]),notes:[note("Kofi Asante","2026-11-01T11:45:00Z","Waiting for the customer to reply.")]},
  "ALT-5124":{location:"Lagos",evidence:events("JRN-2312",[0,2])},
  "ALT-5122":{location:"Rome",evidence:events("JRN-2309",[0,2])},
  "ALT-5119":{evidence:[{time:"07:50",title:"Battery 20%",detail:"",kind:"battery"},{time:"10:05",title:"Battery 14%",detail:"",kind:"battery",priority:"Attention"}]},
  "ALT-5106":{evidence:[{time:"18:00",title:"Calibration due",detail:"",kind:"weight",priority:"Attention"}]},
  "ALT-4902":{assignedTo:"Lena Park",outcome:"charged",evidence:[{time:"18:30",title:"Battery 14%",detail:"",kind:"battery",priority:"Attention"},{time:"20:05",title:"Charging",detail:"",kind:"battery"}],notes:[note("Lena Park","2026-10-22T08:10:00Z","Battery back above the alert level.")]},
  "ALT-4871":{assignedTo:"Lena Park",outcome:"recalibrated",evidence:[{time:"09:00",title:"Calibration due",detail:"",kind:"weight",priority:"Attention"},{time:"16:20",title:"Recalibrated",detail:"",kind:"weight"}],notes:[note("Lena Park","2026-10-14T16:30:00Z","Customer recalibrated in the app. Reading stable.")]},
};
