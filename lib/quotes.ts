// A small rotating set of lines from Hindu scripture, shown on the
// dashboard as a quiet daily touch — not tied to any one person's
// data, just a subtle bit of texture for the app.
export type Quote = { text: string; source: string };

export const QUOTES: Quote[] = [
  { text: "You have the right to perform your duty, but never to the fruits of your actions.", source: "Bhagavad Gita 2.47" },
  { text: "The soul is neither born, and nor does it die.", source: "Bhagavad Gita 2.20" },
  { text: "A person is made by their faith. As they believe, so they are.", source: "Bhagavad Gita 17.3" },
  { text: "Set thy heart upon thy work, but never on its reward.", source: "Bhagavad Gita 2.47" },
  { text: "Lead me from the unreal to the real, from darkness to light, from death to immortality.", source: "Brihadaranyaka Upanishad 1.3.28" },
  { text: "That which pervades the universe, know that to be indestructible.", source: "Bhagavad Gita 2.17" },
  { text: "Truth is one; the wise call it by many names.", source: "Rig Veda 1.164.46" },
  { text: "As a man casts off worn-out garments and puts on new ones, so the soul casts off its worn-out body.", source: "Bhagavad Gita 2.22" },
  { text: "Let your object be the acquisition of true knowledge, and let all your actions be dedicated to that end.", source: "Isha Upanishad" },
  { text: "The mind is restless, but it is subdued by practice and detachment.", source: "Bhagavad Gita 6.35" },
  { text: "May all be happy, may all be free from illness. May all see what is auspicious, may no one suffer.", source: "Brihadaranyaka Upanishad" },
  { text: "He who sees all beings in his own self and his own self in all beings loses all fear.", source: "Isha Upanishad" },
  { text: "From joy springs all creation, by joy it is sustained, toward joy it proceeds.", source: "Taittiriya Upanishad" },
  { text: "There is neither this shore, nor that shore, nor any shore — there is only the ocean.", source: "Upanishads" },
  { text: "The wise see knowledge and action as one; they see truly.", source: "Bhagavad Gita 5.4" },
];

// Deterministic pick for a given date so it changes once a day and is
// the same for everyone looking at the app that day, without needing
// to store or randomize anything.
export function quoteOfDay(date = new Date()): Quote {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}
