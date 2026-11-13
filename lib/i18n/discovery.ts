import type { Locale } from "./config";

type DiscoveryCopy = {
  eyebrow: string;
  title: string;
  titleEnd: string;
  note: string;
  shortcuts: string;
  choose: string;
  chooseBody: string;
  understand: string;
  understandBody: string;
  experience: string;
  experienceBody: string;
  rangeTitle: string;
  rangeBody: string;
  select: string;
  carry: string;
  checked: string;
  dimensions: string;
  included: string;
  coreBody: string;
  airlineNote: string;
  finish: string;
  finishes: Record<"essential" | "flagship" | "pro" | "executive", string>;
  stories: Record<"essential" | "flagship" | "pro" | "executive", string>;
};

/** Copy for the landing page's product discovery experience, in every site language. */
export const discovery: Record<Locale, DiscoveryCopy> = {
  en: {
    eyebrow: "Smart luggage. A little more peace of mind.",
    title: "Your next journey.",
    titleEnd: "A little smarter.",
    note: "One bag. One Smart Core. Everything in your app.",
    shortcuts: "Discover Amortrav",
    choose: "Find your travel companion",
    chooseBody: "Four finishes. The same intelligence inside.",
    understand: "Get to know your bag",
    understandBody: "Location, weight and handling. In one view.",
    experience: "Follow a journey",
    experienceBody: "See how it all comes together, door to carousel.",
    rangeTitle: "Your kind of travel. Your kind of bag.",
    rangeBody:
      "A quick escape or a longer stay. Choose your shell; the Smart Core comes with every one.",
    select: "Choose a bag",
    carry: "Carry-on",
    checked: "Check-in",
    dimensions: "Dimensions",
    included: "In every bag",
    coreBody:
      "Location history, impact detection and built-in weighing, together in the Amortrav app.",
    airlineNote:
      "Cabin size and smart-luggage rules vary by airline. Check before you fly.",
    finish: "Finish",
    finishes: {
      essential: "Graphite",
      flagship: "Navy",
      pro: "Brushed silver",
      executive: "Gloss black",
    },
    stories: {
      essential:
        "Pack light. Go further. A graphite carry-on for the trips you can’t wait to take.",
      flagship:
        "Room for the longer route. A navy check-in that keeps you connected after you hand it over.",
      pro: "For the way you move. A brushed-silver carry-on for life between departures.",
      executive:
        "An understated arrival. A gloss-black check-in with space for a longer stay.",
    },
  },
  fr: {
    eyebrow: "Un bagage connecté. L’esprit plus léger.",
    title: "Votre prochain voyage.",
    titleEnd: "Un peu plus malin.",
    note: "Un bagage. Un Smart Core. Tout dans votre application.",
    shortcuts: "Découvrir Amortrav",
    choose: "Votre compagnon de voyage",
    chooseBody: "Quatre finitions. La même intelligence intégrée.",
    understand: "Découvrez votre bagage",
    understandBody: "Position, poids et chocs. En un seul regard.",
    experience: "Suivez un voyage",
    experienceBody: "De votre porte au tapis à bagages.",
    rangeTitle: "Votre façon de voyager. Votre bagage.",
    rangeBody:
      "Une escapade ou un long séjour. Choisissez votre coque ; chaque bagage intègre le Smart Core.",
    select: "Choisir un bagage",
    carry: "Cabine",
    checked: "Soute",
    dimensions: "Dimensions",
    included: "Dans chaque bagage",
    coreBody:
      "Historique des positions, détection des chocs et pesée intégrée, dans l’application Amortrav.",
    airlineNote:
      "Les dimensions cabine et les règles des bagages connectés varient selon la compagnie. Vérifiez avant le départ.",
    finish: "Finition",
    finishes: {
      essential: "Graphite",
      flagship: "Bleu marine",
      pro: "Argent brossé",
      executive: "Noir brillant",
    },
    stories: {
      essential:
        "Voyagez léger. Allez plus loin. Un bagage cabine graphite pour vos prochaines escapades.",
      flagship:
        "De la place pour les longs voyages. Un bagage soute bleu marine qui reste connecté après l’enregistrement.",
      pro: "Au rythme de vos départs. Un bagage cabine argent brossé pour les voyageurs réguliers.",
      executive:
        "Une arrivée tout en discrétion. Un bagage soute noir brillant pour les longs séjours.",
    },
  },
  es: {
    eyebrow: "Equipaje inteligente. Un poco más de tranquilidad.",
    title: "Tu próximo viaje.",
    titleEnd: "Un poco más inteligente.",
    note: "Una maleta. Un Smart Core. Todo en tu app.",
    shortcuts: "Descubre Amortrav",
    choose: "Tu compañero de viaje",
    chooseBody: "Cuatro acabados. La misma inteligencia dentro.",
    understand: "Conoce tu maleta",
    understandBody: "Ubicación, peso y golpes. En una sola vista.",
    experience: "Sigue un viaje",
    experienceBody: "De tu puerta a la cinta de equipaje.",
    rangeTitle: "Tu forma de viajar. Tu maleta.",
    rangeBody:
      "Una escapada o una estancia larga. Elige tu carcasa; todas incluyen el Smart Core.",
    select: "Elige una maleta",
    carry: "Cabina",
    checked: "Facturación",
    dimensions: "Dimensiones",
    included: "En cada maleta",
    coreBody:
      "Historial de ubicaciones, detección de impactos y pesaje integrado en la app Amortrav.",
    airlineNote:
      "El tamaño de cabina y las normas de equipaje inteligente varían según la aerolínea. Consulta antes de volar.",
    finish: "Acabado",
    finishes: {
      essential: "Grafito",
      flagship: "Azul marino",
      pro: "Plata cepillada",
      executive: "Negro brillante",
    },
    stories: {
      essential:
        "Viaja ligero. Llega más lejos. Una maleta de cabina en grafito para tus próximas escapadas.",
      flagship:
        "Espacio para el camino largo. Una maleta azul marino que sigue conectada después de facturar.",
      pro: "A tu ritmo. Una maleta de cabina en plata cepillada para quienes viven entre vuelos.",
      executive:
        "Una llegada discreta. Una maleta negra brillante con espacio para estancias largas.",
    },
  },
  de: {
    eyebrow: "Smartes Gepäck. Etwas entspannter reisen.",
    title: "Deine nächste Reise.",
    titleEnd: "Ein bisschen smarter.",
    note: "Ein Koffer. Ein Smart Core. Alles in deiner App.",
    shortcuts: "Amortrav entdecken",
    choose: "Dein Reisebegleiter",
    chooseBody: "Vier Ausführungen. Dieselbe Technik im Inneren.",
    understand: "Lerne deinen Koffer kennen",
    understandBody: "Standort, Gewicht und Stöße. Auf einen Blick.",
    experience: "Verfolge eine Reise",
    experienceBody: "Von deiner Haustür bis zum Gepäckband.",
    rangeTitle: "Deine Art zu reisen. Dein Koffer.",
    rangeBody:
      "Kurztrip oder langer Aufenthalt. Wähle deine Schale; der Smart Core ist immer dabei.",
    select: "Koffer auswählen",
    carry: "Handgepäck",
    checked: "Aufgabegepäck",
    dimensions: "Abmessungen",
    included: "In jedem Koffer",
    coreBody: "Standortverlauf, Stoßerkennung und integrierte Waage in der Amortrav-App.",
    airlineNote:
      "Handgepäckmaße und Regeln für smartes Gepäck unterscheiden sich je nach Fluggesellschaft. Bitte vor dem Flug prüfen.",
    finish: "Oberfläche",
    finishes: {
      essential: "Graphit",
      flagship: "Marineblau",
      pro: "Gebürstetes Silber",
      executive: "Glanzschwarz",
    },
    stories: {
      essential:
        "Leicht packen. Weiter reisen. Ein graphitfarbener Handgepäckkoffer für deinen nächsten Kurztrip.",
      flagship:
        "Platz für längere Reisen. Ein marineblauer Koffer, der auch nach der Gepäckaufgabe verbunden bleibt.",
      pro: "Für deinen Reiserhythmus. Ein silberner Handgepäckkoffer für das Leben zwischen Abflügen.",
      executive:
        "Dezent ankommen. Ein glanzschwarzer Koffer mit Platz für einen längeren Aufenthalt.",
    },
  },
  "zh-hans": {
    eyebrow: "智能行李，让旅途更安心。",
    title: "下一段旅程。",
    titleEnd: "多一份智慧。",
    note: "一个行李箱，一个 Smart Core，尽在你的应用中。",
    shortcuts: "探索 Amortrav",
    choose: "寻找你的旅行伙伴",
    chooseBody: "四种外观，同样的智慧内核。",
    understand: "了解你的行李箱",
    understandBody: "位置、重量与碰撞，一目了然。",
    experience: "跟随一段旅程",
    experienceBody: "从家门到行李转盘，了解它如何工作。",
    rangeTitle: "你的旅行方式，你的行李箱。",
    rangeBody: "短途出行或长住远方，选择喜欢的外壳，每款均配备 Smart Core。",
    select: "选择行李箱",
    carry: "登机箱",
    checked: "托运箱",
    dimensions: "尺寸",
    included: "每款均配备",
    coreBody: "位置记录、碰撞检测与内置称重，尽在 Amortrav 应用中。",
    airlineNote: "各航空公司的登机尺寸及智能行李规定不同，请在出发前确认。",
    finish: "外观",
    finishes: {
      essential: "石墨灰",
      flagship: "海军蓝",
      pro: "拉丝银",
      executive: "亮黑色",
    },
    stories: {
      essential: "轻装上阵，走得更远。石墨灰登机箱，陪你奔赴下一段旅程。",
      flagship: "为长途旅行留足空间。海军蓝托运箱，在托运后依然保持连接。",
      pro: "跟上你的步伐。拉丝银登机箱，适合经常飞行的你。",
      executive: "低调抵达。亮黑色托运箱，为长住旅程提供充足空间。",
    },
  },
  "zh-hant": {
    eyebrow: "智慧行李，讓旅途更安心。",
    title: "下一段旅程。",
    titleEnd: "多一份智慧。",
    note: "一個行李箱，一個 Smart Core，盡在你的應用程式中。",
    shortcuts: "探索 Amortrav",
    choose: "尋找你的旅行夥伴",
    chooseBody: "四種外觀，同樣的智慧內核。",
    understand: "認識你的行李箱",
    understandBody: "位置、重量與碰撞，一目瞭然。",
    experience: "跟隨一段旅程",
    experienceBody: "從家門到行李轉盤，了解它如何運作。",
    rangeTitle: "你的旅行方式，你的行李箱。",
    rangeBody: "短途出遊或長住遠方，選擇喜歡的外殼，每款均配備 Smart Core。",
    select: "選擇行李箱",
    carry: "登機箱",
    checked: "託運箱",
    dimensions: "尺寸",
    included: "每款均配備",
    coreBody: "位置紀錄、碰撞偵測與內建秤重，盡在 Amortrav 應用程式中。",
    airlineNote: "各航空公司的登機尺寸及智慧行李規定不同，請在出發前確認。",
    finish: "外觀",
    finishes: {
      essential: "石墨灰",
      flagship: "海軍藍",
      pro: "髮絲銀",
      executive: "亮黑色",
    },
    stories: {
      essential: "輕裝上陣，走得更遠。石墨灰登機箱，陪你奔赴下一段旅程。",
      flagship: "為長途旅行留足空間。海軍藍託運箱，在託運後依然保持連線。",
      pro: "跟上你的步伐。髮絲銀登機箱，適合經常飛行的你。",
      executive: "低調抵達。亮黑色託運箱，為長住旅程提供充足空間。",
    },
  },
};
