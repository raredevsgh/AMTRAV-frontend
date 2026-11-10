type Voice = { quote: string; name: string; role: string };

/**
 * What travellers have told us, in their own words. Add real quotes here as they come in:
 * one shows as a single large card, and two or more flow into two columns.
 */
const voices: Voice[] = [
  {
    quote:
      "I watched my bag go through the flap at check-in. Eleven hours later, in Lisbon, I still didn’t know if it was on my plane.",
    name: "B. Young",
    role: "An overwhelmed traveller",
  },
];

function initials(name: string) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Quote cards on a dotted canvas, with the section's heading beside them. */
export function Voices() {
  return (
    <section className="trace-panel trace-voices" aria-labelledby="voices-title">
      <div className="trace-voices-intro">
        <h2 id="voices-title">Why we’re obsessed with the problem.</h2>
      </div>
      <ul className="trace-voices-list">
        {voices.map((voice) => (
          <li key={voice.name}>
            <figure className="trace-voice">
              <blockquote>
                <p>“{voice.quote}”</p>
              </blockquote>
              <figcaption>
                <span className="trace-voice-avatar" aria-hidden>
                  {initials(voice.name)}
                </span>
                <span className="trace-voice-name">
                  <strong>{voice.name}</strong>
                  <small>{voice.role}</small>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
