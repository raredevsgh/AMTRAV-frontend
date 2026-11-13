import { localizedMetadata } from "@/lib/i18n/seo";
export const generateMetadata = localizedMetadata("/photo-credits", () => ({
  title: "Photo credits",
}));
const credits = [
  [
    "Joe Ambrogio",
    "Traveler at the airport window",
    "https://www.pexels.com/photo/a-woman-with-luggage-standing-on-the-glass-wall-looking-at-the-parked-airplane-on-the-tarmac-12742855/",
  ],
  [
    "Gustavo Fring",
    "Traveler at the airport drop-off",
    "https://www.pexels.com/photo/happy-female-traveler-walking-on-airport-street-with-luggage-3885537/",
  ],
  [
    "Mikhail Nilov",
    "Carry-on luggage",
    "https://www.pexels.com/photo/person-in-brown-coat-holding-a-luggage-7820633/",
  ],
  [
    "Brett Sayles",
    "Airliner climbing against a clear sky",
    "https://www.pexels.com/photo/white-airliner-1059608/",
  ],
  [
    "Oleksiy Yeshtokyn",
    "Blue suitcase at the gate",
    "https://www.pexels.com/photo/blue-suitcase-in-empty-airport-terminal-30782813/",
  ],
  [
    "Pexels photographer",
    "Travellers crossing the terminal at sunset",
    "https://www.pexels.com/photo/silhouette-of-person-in-airport-227690/",
  ],
];
export default function PhotoCredits() {
  return (
    <section className="panel">
      <span className="eyebrow">Behind the journey</span>
      <h1 className="text-4xl font-extrabold mt-4">Photo credits</h1>
      <div className="credits-list">
        {credits.map(([name, title, url]) => (
          <article key={url}>
            <h2 className="text-xl">{title}</h2>
            <p>
              Photo by <a href={url}>{name} on Pexels</a>.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
