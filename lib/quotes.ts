// Bhagavad Gita verses (Krishna's counsel to Arjuna), each paired with
// a one-line business framing so they read as guidance for the day's
// work rather than a generic quote. Shown on the dashboard.
export type Quote = { text: string; source: string; business: string };

export const QUOTES: Quote[] = [
  {
    text: "You have the right to perform your duty, but never to the fruits of your actions.",
    source: "Bhagavad Gita 2.47",
    business: "Focus on the visit, the call, the order in front of you — not just the target number.",
  },
  {
    text: "Set thy heart upon thy work, but never on its reward.",
    source: "Bhagavad Gita 2.47",
    business: "Do the work well today; let the month's numbers follow from that.",
  },
  {
    text: "The mind is restless, but it is subdued by practice and detachment.",
    source: "Bhagavad Gita 6.35",
    business: "A slow day or a lost order doesn't need to shake the whole week — steady practice wins territory.",
  },
  {
    text: "A person is made by their faith. As they believe, so they are.",
    source: "Bhagavad Gita 17.3",
    business: "Walk into every customer meeting believing in what you're selling — it shows.",
  },
  {
    text: "Let right deeds be thy motive, not the fruit which comes from them.",
    source: "Bhagavad Gita 2.47",
    business: "Serve the customer honestly first — the repeat order is a byproduct, not the goal.",
  },
  {
    text: "There is nothing in this world so purifying as knowledge.",
    source: "Bhagavad Gita 4.38",
    business: "Know your products and your customer's real need — that's what actually closes deals.",
  },
  {
    text: "The wise see knowledge and action as one; they see truly.",
    source: "Bhagavad Gita 5.4",
    business: "Planning and doing aren't separate — a good route plan is only useful once you're out on it.",
  },
  {
    text: "He who has no attachments can really love others, for his love is pure and divine.",
    source: "Bhagavad Gita 12.13-14",
    business: "Serve every customer the same way, whether the order is big or small today.",
  },
  {
    text: "Perform your duty equipoised, abandoning all attachment to success or failure.",
    source: "Bhagavad Gita 2.48",
    business: "A rejected pitch is data, not defeat — move to the next visit with the same energy.",
  },
  {
    text: "One who is unaffected by good or evil, and offers all he does to the whole, is wise.",
    source: "Bhagavad Gita 2.50",
    business: "Handle a bad month and a great month the same way: review it, learn, move forward.",
  },
  {
    text: "Whatever action is performed by a great man, common men follow in his footsteps.",
    source: "Bhagavad Gita 3.21",
    business: "The team is watching how the top rep works, not just what they sell.",
  },
  {
    text: "The soul is neither born, and nor does it die.",
    source: "Bhagavad Gita 2.20",
    business: "No single order defines the business — relationships built with care outlast any one deal.",
  },
];

// Deterministic pick for a given date so the quote changes once a day
// and is the same for everyone looking at the app that day, without
// needing to store or randomize anything.
export function quoteOfDay(date = new Date()): Quote {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}
