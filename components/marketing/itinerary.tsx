// Steps as an itinerary rather than a row of cards: stops along one line, each with where it
// happens, then what you do. By default the four stops of travelling with TRACE, from your door
// to the carousel (home page, How it works); For brands passes its own. Styles in
// app/itinerary.css.
import { brand } from "@/lib/brand";
import { Stagger } from "./motion";
import "@/app/itinerary.css";

export interface Stop {
  where: string;
  title: string;
  body: string;
}

const travel: Stop[] = [
  {
    where: "At home, once",
    title: "Pair it",
    body: `Scan the QR code on the ${brand.core} in ${brand.app}. It’s yours in seconds.`,
  },
  {
    where: "At the door",
    title: "Start a journey",
    body: "Name the trip, set your airline’s limit, and lift the bag once to weigh it.",
  },
  {
    where: "In transit",
    title: "Travel",
    body: "It reports as it goes, goes quiet in the air, and catches up after landing. Alerts reach you wherever you are.",
  },
  {
    where: "At the carousel",
    title: "Arrive",
    body: "End the journey for a summary: distance, impacts, weight and battery, in the app and by email.",
  },
];

export function Itinerary({ stops = travel }: { stops?: Stop[] }) {
  return (
    <Stagger as="ol" className="itinerary">
      {stops.map((stop, index) => (
        <li key={stop.title}>
          <small>{stop.where}</small>
          <span className="itinerary-stop" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{stop.title}</h3>
          <p>{stop.body}</p>
        </li>
      ))}
    </Stagger>
  );
}
