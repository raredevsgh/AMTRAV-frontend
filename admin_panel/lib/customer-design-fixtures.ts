/** Fictional account and pairing values from the current Customer Detail Figma PNGs. */
export type PairingRecord={serial:string;event:"Paired"|"Removed"|"Transferred in"|"Revoked";date:string;phone:string;result:string;pairedAt?:string;serverReceived?:string;appVersion?:string;connection?:string};
export type CustomerPresentation={phone:string;country:string;language:string;pairings:PairingRecord[]};
const paired=(serial:string,date:string,phone:string):PairingRecord => ({serial,event:"Paired",date,phone,result:"Success"});
export const customerPresentation:Record<string,CustomerPresentation>={
  "AMT-EX76-1A77C2":{phone:"+233 •• ••• 3310",country:"Ghana",language:"English",pairings:[paired("AMT-EX76-1A77C2","2026-04-08","iPhone 15")]},
  "AMT-FL68-0C19D4":{phone:"+34 ••• ••• 218",country:"Spain",language:"Spanish",pairings:[paired("AMT-FL68-0C19D4","2026-05-20","iPhone 14")]},
  "AMT-ES55-5A06B3":{phone:"+233 •• ••• 4172",country:"Ghana",language:"English",pairings:[{...paired("AMT-ES55-5A06B3","2026-10-12","iPhone 15"),pairedAt:"2026-10-12T14:06:00Z",serverReceived:"14:06:22",appVersion:"2.1.0, iOS",connection:"Bluetooth"},{serial:"AMT-ES55-2C71D8",event:"Removed",date:"2026-10-09",phone:"iPhone 15",result:"By customer"},paired("AMT-ES55-2C71D8","2026-03-18","iPhone 13")]},
  "AMT-PR76-2B40E1":{phone:"+234 ••• ••• 7741",country:"Nigeria",language:"English",pairings:[paired("AMT-PR76-2B40E1","2026-06-29","Pixel 8")]},
  "AMT-FL68-3D82A6":{phone:"+20 ••• ••• 1902",country:"Egypt",language:"Arabic",pairings:[paired("AMT-FL68-3D82A6","2026-08-02","iPhone 14")]},
  "AMT-ES55-00F3B4":{phone:"+233 ••• ••• 5408",country:"Ghana",language:"English",pairings:[paired("AMT-ES55-00F3B4","2026-08-20","iPhone 13")]},
  "AMT-PR68-4E11F9":{phone:"+33 •• •• 46 09",country:"France",language:"French",pairings:[paired("AMT-PR68-4E11F9","2026-06-09","Pixel 8")]},
  "AMT-FL76-7F28C5":{phone:"+351 ••• ••• 224",country:"Portugal",language:"Portuguese",pairings:[paired("AMT-FL76-7F28C5","2026-09-10","iPhone 15")]},
  "AMT-PR55-8B74E2":{phone:"+233 ••• ••• 9176",country:"Ghana",language:"English",pairings:[paired("AMT-PR55-8B74E2","2026-08-25","Pixel 7")]},
  "AMT-ES68-9D15A7":{phone:"+49 ••• ••• 5531",country:"Germany",language:"German",pairings:[{serial:"AMT-ES68-9D15A7",event:"Transferred in",date:"2026-09-20",phone:"Pixel 8",result:"Owner hidden"},paired("AMT-ES68-9D15A7","2026-09-20","Pixel 8")]},
  "AMT-EX55-A042F8":{phone:"+221 ••• ••• 6035",country:"Senegal",language:"French",pairings:[paired("AMT-EX55-A042F8","2026-07-14","iPhone 14")]},
  "AMT-EX68-6C93D0":{phone:"+84 •• ••• 6620",country:"Vietnam",language:"English",pairings:[{serial:"AMT-EX68-6C93D0",event:"Revoked",date:"2026-10-24",phone:"Not recorded",result:"Ama Mensah"},paired("AMT-EX68-6C93D0","2026-02-20","iPhone 12")]},
};
