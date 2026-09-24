// Bhagavad Gita verses (Krishna's counsel to Arjuna), paraphrased in
// plain English and paired with a one-line business framing, so the
// dashboard's daily line reads as guidance for the day's work rather
// than a generic quote. One is shown per day, rotating through the
// full Gita chapter by chapter.
export type Quote = { text: string; source: string; business: string };

export const QUOTES: Quote[] = [
  // Chapter 1 — Arjuna's hesitation before a hard decision
  { text: "Seeing the size of the task ahead, Arjuna's resolve wavered and his limbs grew weak.", source: "Bhagavad Gita 1.28-29", business: "It's normal to feel the weight of a big target before you start — the feeling passes once you move." },
  { text: "My mind is spinning and I cannot see where my duty lies.", source: "Bhagavad Gita 1.30", business: "Confusion before a hard call or a hard conversation is the starting point, not a stopping point." },
  { text: "Arjuna sat down in the chariot, overwhelmed by grief.", source: "Bhagavad Gita 1.47", business: "Even a strong performer has an off day — sit with it, then get back up." },
  { text: "How can I fight those I should be honouring?", source: "Bhagavad Gita 1.35 (paraphrase)", business: "Competing hard doesn't mean losing respect for the customer or the rival on the other side of the table." },
  { text: "Seeing kinsmen arrayed on both sides, Arjuna was filled with deep compassion.", source: "Bhagavad Gita 1.27-28 (paraphrase)", business: "Care about the people on the other side of every deal — it's not weakness, it's what makes the work worth doing." },
  { text: "Krishna saw Arjuna's despair and prepared to teach him.", source: "Bhagavad Gita 1.47 / 2.1", business: "A stuck moment is often just the point where real guidance is needed — ask for it." },

  // Chapter 2 — Duty, equanimity, the soul
  { text: "You have the right to perform your duty, but never to the fruits of your actions.", source: "Bhagavad Gita 2.47", business: "Focus on the visit, the call, the order in front of you — not just the target number." },
  { text: "Set thy heart upon thy work, but never on its reward.", source: "Bhagavad Gita 2.47", business: "Do the work well today; let the month's numbers follow from that." },
  { text: "Perform your duty equipoised, abandoning all attachment to success or failure.", source: "Bhagavad Gita 2.48", business: "A rejected pitch is data, not defeat — move to the next visit with the same energy." },
  { text: "One who is unaffected by good or evil, and offers all he does to the whole, is wise.", source: "Bhagavad Gita 2.50", business: "Handle a bad month and a great month the same way: review it, learn, move forward." },
  { text: "The soul is neither born, and nor does it die.", source: "Bhagavad Gita 2.20", business: "No single order defines the business — relationships built with care outlast any one deal." },
  { text: "As a man casts off worn-out garments and puts on new ones, so the soul casts off its worn-out body.", source: "Bhagavad Gita 2.22", business: "Old approaches wear out too — it's fine to retire a pitch or a route that no longer works." },
  { text: "That which pervades the universe, know that to be indestructible.", source: "Bhagavad Gita 2.17", business: "The trust you build with a customer outlasts any single transaction." },
  { text: "For one who is born, death is certain; for one who dies, birth is certain. Do not grieve over the unavoidable.", source: "Bhagavad Gita 2.27", business: "Some deals will fall through no matter what you do — don't let the unavoidable ones weigh down the avoidable ones." },
  { text: "A person is made by their faith. As they believe, so they are.", source: "Bhagavad Gita 17.3 (cross-ref)", business: "Walk into every customer meeting believing in what you're selling — it shows." },
  { text: "Established in yoga, perform action, abandoning attachment, remaining even-minded in success and failure.", source: "Bhagavad Gita 2.48", business: "Keep the same steady process whether the last order was your biggest or your smallest." },
  { text: "The intellect of the resolute is single-pointed; the thoughts of the irresolute are many-branched.", source: "Bhagavad Gita 2.41", business: "Chasing five strategies at once gets less done than committing fully to one plan for the week." },
  { text: "A person whose mind is untroubled by sorrows and unaffected by joys, free from attachment, fear and anger, is called stable-minded.", source: "Bhagavad Gita 2.56", business: "Neither a big win nor a sharp loss should change how you treat the next customer." },

  // Chapter 3 — Karma Yoga, work and duty
  { text: "Whatever action is performed by a great man, common men follow in his footsteps.", source: "Bhagavad Gita 3.21", business: "The team is watching how the top rep works, not just what they sell." },
  { text: "No one can remain without action even for a moment; everyone is compelled to act by their own nature.", source: "Bhagavad Gita 3.5", business: "There's no such thing as standing still in the field — you're either building the territory or losing ground to someone who is." },
  { text: "Better one's own duty, though imperfectly performed, than another's duty well performed.", source: "Bhagavad Gita 3.35", business: "Sell in your own honest style rather than copying a technique that doesn't fit you." },
  { text: "Do your allotted work, for action is better than inaction.", source: "Bhagavad Gita 3.8", business: "An imperfect visit today beats a perfect plan that never leaves the office." },
  { text: "The world is bound by action, except action performed for the sake of sacrifice — for that, work free from attachment.", source: "Bhagavad Gita 3.9", business: "Work that genuinely serves the customer doesn't feel like a burden the way work done only for the sale does." },
  { text: "Perform your duty, for action is superior to inaction; even the maintenance of your body would not be possible without action.", source: "Bhagavad Gita 3.8", business: "The business runs on the visits that actually happen, not the ones that were planned." },

  // Chapter 4 — Knowledge and right action
  { text: "There is nothing in this world so purifying as knowledge.", source: "Bhagavad Gita 4.38", business: "Know your products and your customer's real need — that's what actually closes deals." },
  { text: "Even the wise are confused about what is action and what is inaction.", source: "Bhagavad Gita 4.16", business: "Busy isn't the same as productive — check that the hours in the field are going toward the right customers." },
  { text: "One who sees inaction in action, and action in inaction, is wise among men.", source: "Bhagavad Gita 4.18", business: "A quiet relationship-building visit that closes nothing today can be the most productive hour of the week." },
  { text: "Whenever righteousness declines, I manifest myself.", source: "Bhagavad Gita 4.7", business: "When standards slip on the ground, that's exactly when leadership needs to step in and reset them." },
  { text: "Knowledge is the supreme purifier of all that is impure.", source: "Bhagavad Gita 4.38 (var.)", business: "A well-understood product line prevents more problems than any amount of persuasion after the fact." },
  { text: "The fire of knowledge burns all action to ashes.", source: "Bhagavad Gita 4.37", business: "Understanding why a customer really buys clears away a lot of wasted effort chasing the wrong pitch." },

  // Chapter 5 — Renunciation and steady action
  { text: "The wise see knowledge and action as one; they see truly.", source: "Bhagavad Gita 5.4", business: "Planning and doing aren't separate — a good route plan is only useful once you're out on it." },
  { text: "One who acts, offering all results to the divine, is untouched by sin, as a lotus leaf is untouched by water.", source: "Bhagavad Gita 5.10", business: "Do honest work and let outcomes be outcomes — don't let a bad quarter make you cut corners." },
  { text: "The self-controlled work with body, mind and intellect alone, giving up attachment, for self-purification.", source: "Bhagavad Gita 5.11", business: "Show up and do the work with full attention — that discipline is worth more than any single sale." },
  { text: "The wise, whose intellect is united with the self, work without attachment to results, and attain peace.", source: "Bhagavad Gita 5.12", business: "A rep who isn't rattled by every up and down of the pipeline tends to close more, not less." },
  { text: "The knower of truth abides at ease, having renounced all actions in the mind.", source: "Bhagavad Gita 5.13", business: "Confidence in your process lets you stay calm even during a slow week." },
  { text: "Peace is found by those whose sins are destroyed, whose doubts are dispelled, whose minds are disciplined, and who delight in the welfare of all.", source: "Bhagavad Gita 5.25", business: "A team that genuinely wants good outcomes for its customers tends to build the calmest, most durable business." },

  // Chapter 6 — Meditation, self-mastery
  { text: "The mind is restless, but it is subdued by practice and detachment.", source: "Bhagavad Gita 6.35", business: "A slow day or a lost order doesn't need to shake the whole week — steady practice wins territory." },
  { text: "Let a person lift themselves by their own self; let them not degrade themselves.", source: "Bhagavad Gita 6.5", business: "No one else is going to run tomorrow's route for you — that discipline starts with you." },
  { text: "For one who has conquered the mind, the mind is the best of friends; for one who has failed, the mind is the greatest enemy.", source: "Bhagavad Gita 6.6", business: "A calm, focused mind on a sales call closes far more than an anxious one, however good the product." },
  { text: "One who is moderate in eating and recreation, balanced in work, and regulated in sleep, can mitigate all suffering by practice of yoga.", source: "Bhagavad Gita 6.17", business: "Pace yourself across the day — a rep who burns out by noon covers less ground than one who paces steadily." },
  { text: "When the disciplined mind rests in the self alone, free from craving, that state is called steady wisdom.", source: "Bhagavad Gita 6.18-20 (paraphrase)", business: "The best decisions on the road come from a settled mind, not a rushed one chasing every distraction." },
  { text: "Even a small effort on this path protects one from great danger.", source: "Bhagavad Gita 2.40 (cross-ref, theme continued in Ch.6)", business: "One more honest visit, one more follow-up call — small consistent effort compounds more than it seems." },

  // Chapter 7 — Knowledge and realization
  { text: "Among thousands of people, scarcely one strives for perfection; among those who strive, scarcely one knows the goal truly.", source: "Bhagavad Gita 7.3", business: "Most competitors will stop at 'good enough' — genuinely understanding the customer is what sets a rep apart." },
  { text: "I am the taste in water, the light in the sun and moon.", source: "Bhagavad Gita 7.8", business: "The small, easy-to-miss details of service are often what a customer actually remembers." },
  { text: "Those deluded by the modes of nature become attached to those modes and their actions.", source: "Bhagavad Gita 7.13", business: "Don't let a run of quick wins make you sloppy, or a run of losses make you give up — see past the mood of the moment." },
  { text: "Four kinds of virtuous people worship me: the distressed, the seeker of knowledge, the seeker of wealth, and the wise.", source: "Bhagavad Gita 7.16", business: "Customers come to you for different reasons — need, curiosity, value, trust. Meet each one where they actually are." },
  { text: "Among the wise, the one who is ever united with the divine and single in devotion is the best.", source: "Bhagavad Gita 7.17", business: "The rep who stays consistently engaged with the work, not just when it's convenient, tends to go furthest." },
  { text: "As people approach me, so I reward them; everyone follows my path in every way.", source: "Bhagavad Gita 4.11 (theme, cross-ref)", business: "The effort you put toward a customer relationship tends to come back to you in kind." },

  // Chapter 8 — The imperishable
  { text: "Whoever, at the time of death, remembers me alone, attains my nature; there is no doubt of this.", source: "Bhagavad Gita 8.5 (theme)", business: "What you focus on in the final moments of a negotiation often decides how the whole deal is remembered." },
  { text: "Whatever state of being one dwells upon, they will attain that state.", source: "Bhagavad Gita 8.6", business: "Carry the mindset you want to show up as into every customer meeting — it tends to follow through." },
  { text: "Therefore, at all times remember me and fight — with mind and intellect fixed on me, you shall doubtless come to me.", source: "Bhagavad Gita 8.7", business: "Keep the bigger purpose in mind even while handling the day's small, repetitive tasks." },

  // Chapter 9 — Royal knowledge, generosity
  { text: "Whoever offers to me with devotion a leaf, a flower, a fruit, or water, I accept that offering.", source: "Bhagavad Gita 9.26", business: "A small, genuine gesture to a customer often matters more than a big, hollow one." },
  { text: "I am equal to all beings; none is hateful or dear to me. But those who worship me with devotion dwell in me, and I in them.", source: "Bhagavad Gita 9.29", business: "Treat every customer with the same fairness — the ones who feel it tend to become your most loyal." },
  { text: "Whatever you do, whatever you eat, whatever you offer, whatever you give, whatever austerity you practise, do it as an offering.", source: "Bhagavad Gita 9.27", business: "Bring the same full effort to a routine follow-up call as you would to closing the biggest order of the month." },
  { text: "Even a person of the worst conduct, if they turn to devotion with resolve, should be considered righteous, for they have rightly resolved.", source: "Bhagavad Gita 9.30", business: "A rep who's struggled but genuinely commits to doing better deserves the chance to prove it." },
  { text: "This knowledge is the king of sciences, the king of secrets, the purest, directly realizable, righteous, easy to practise, and everlasting.", source: "Bhagavad Gita 9.2", business: "The fundamentals — show up, listen, follow through — are simple to say and still worth repeating often." },
  { text: "Fill your mind with me, be devoted to me, worship me, and you shall come to me.", source: "Bhagavad Gita 9.34", business: "Stay genuinely invested in the work and the customer relationships — the results tend to follow." },

  // Chapter 10 — Divine glories, excellence
  { text: "Of purifiers, I am the wind; of warriors, I am Rama.", source: "Bhagavad Gita 10.31 (theme)", business: "Excellence shows up in the small specifics — be known for the one thing you do better than anyone." },
  { text: "I am the beginning, the middle, and the end of all beings.", source: "Bhagavad Gita 10.20 (paraphrase)", business: "Be present for the whole life of a customer relationship — the first visit, the tricky middle, and the years after." },
  { text: "Whatever is glorious, prosperous, or powerful, know that to spring from a fraction of my splendour.", source: "Bhagavad Gita 10.41", business: "Recognize good work wherever it shows up on the team, not only when it's convenient to notice." },

  // Chapter 11 — The universal form, perspective
  { text: "If the light of a thousand suns were to blaze out at once, that would resemble the splendour of that great being.", source: "Bhagavad Gita 11.12", business: "Some moments in the business are genuinely bigger than they first appear — recognize the scale when it matters." },
  { text: "Seeing your infinite form, O Lord, with its many mouths, eyes, and arms, I am filled with both wonder and fear.", source: "Bhagavad Gita 11.23 (paraphrase)", business: "A complex, high-stakes deal can feel overwhelming — that reaction is normal before it becomes manageable." },
  { text: "Be free from fear and confusion; see my gentle form again.", source: "Bhagavad Gita 11.49 (paraphrase)", business: "After a stressful negotiation, step back and see the relationship in its ordinary, human terms again." },

  // Chapter 12 — Devotion, the beloved qualities
  { text: "He who has no attachments can really love others, for his love is pure and divine.", source: "Bhagavad Gita 12.13-14", business: "Serve every customer the same way, whether the order is big or small today." },
  { text: "The devotee who is free from malice, friendly and compassionate to all beings, is dear to me.", source: "Bhagavad Gita 12.13", business: "A rep who's genuinely warm to every customer, not just the profitable ones, builds the deepest trust." },
  { text: "One who neither disturbs the world nor is disturbed by it, and is free from joy, envy, fear and anxiety, is dear to me.", source: "Bhagavad Gita 12.15", business: "Don't let a rival's success rattle you or your own success make you careless — steady is stronger." },
  { text: "Equal to friend and foe, and also in honour and dishonour, equal in cold and heat, in pleasure and pain, free from attachment.", source: "Bhagavad Gita 12.18", business: "Treat a difficult customer with the same patience as an easy one — it usually turns them around." },
  { text: "The same to friend and foe, and also in fame and shame, silent, content with anything, without a fixed abode, firm in mind, such a devotee is dear to me.", source: "Bhagavad Gita 12.19", business: "Adaptability — being fine wherever the route takes you — is worth more than clinging to a fixed comfort zone." },
  { text: "Those who follow this immortal wisdom, full of faith, regarding me as the supreme goal, are exceedingly dear to me.", source: "Bhagavad Gita 12.20", business: "Commitment to doing things the right way, consistently, is what earns lasting trust from a team or a customer." },

  // Chapter 13 — The field and its knower, virtues
  { text: "Humility, freedom from hypocrisy, non-violence, forgiveness, uprightness — these are declared to be knowledge.", source: "Bhagavad Gita 13.8", business: "Straightforward, honest dealing with a customer counts as real expertise, not just product knowledge." },
  { text: "Non-attachment, absence of clinging to son, wife, home; even-mindedness in desirable and undesirable events.", source: "Bhagavad Gita 13.9", business: "Don't let personal preference for one customer or product cloud a fair decision for the business." },
  { text: "Unwavering devotion, seeking solitude, distaste for the company of the worldly-minded.", source: "Bhagavad Gita 13.10-11 (paraphrase)", business: "Time spent quietly reviewing your own numbers is as valuable as time spent in the crowd of activity." },

  // Chapter 14 — The three modes of nature
  { text: "Goodness binds one to happiness, passion binds one to action, and ignorance binds one to negligence.", source: "Bhagavad Gita 14.9", business: "Notice which mode you're operating in — clear-headed, driven, or just going through the motions — and choose the first two." },
  { text: "When goodness predominates, the light of knowledge shines forth.", source: "Bhagavad Gita 14.11", business: "A clear-headed morning routine tends to produce a better sales day than a chaotic one." },
  { text: "One who is not disturbed by the rise of the modes, nor longs for them when they subside, but remains steady, transcends them.", source: "Bhagavad Gita 14.23", business: "Don't get swept up when things are going great, or shaken when they're not — steadiness is the actual edge." },
  { text: "Regarding pleasure and pain alike, self-abiding, viewing a clod, a stone, and gold as the same.", source: "Bhagavad Gita 14.24", business: "A big order and a small order both deserve the same care and follow-through." },
  { text: "The same to friend and foe, and also to honour and dishonour, one who has abandoned all undertakings is said to have transcended the modes.", source: "Bhagavad Gita 14.25", business: "Fair treatment of everyone in the territory — including competitors — is a strength, not a soft spot." },

  // Chapter 15 — The supreme person
  { text: "I am seated in the hearts of all; from me come memory, knowledge, and their absence.", source: "Bhagavad Gita 15.15", business: "Understanding what a customer actually remembers and forgets about your last conversation matters more than the pitch script." },
  { text: "The light of the sun, the moon, and fire — know that light to be mine.", source: "Bhagavad Gita 15.12", business: "Every bit of clarity a customer gets about the product ultimately reflects well on you." },
  { text: "Having entered the earth, I support all beings by my energy.", source: "Bhagavad Gita 15.13 (paraphrase)", business: "The quiet, ongoing support you give a customer after the sale is what actually sustains the relationship." },

  // Chapter 16 — Divine and demoniac qualities
  { text: "Fearlessness, purity of heart, steadfastness in knowledge, charity, self-control, sacrifice — these belong to one born for a divine destiny.", source: "Bhagavad Gita 16.1-3 (paraphrase)", business: "Honesty and steadiness with customers builds a reputation that outlasts any single quarter's numbers." },
  { text: "Excessive desire, anger, and greed are the three gates leading to the ruin of the soul.", source: "Bhagavad Gita 16.21", business: "Chasing a sale too hard, losing your temper with a difficult customer, or cutting corners for a quick win — all three cost more than they gain." },
  { text: "Those who abandon scriptural injunctions and act on desire alone do not attain perfection, happiness, or the highest goal.", source: "Bhagavad Gita 16.23", business: "Skipping the honest process for a shortcut rarely holds up over the long run." },

  // Chapter 17 — Threefold faith
  { text: "Charity given to a worthy person, at the right place and time, without expecting anything in return, is considered to be in goodness.", source: "Bhagavad Gita 17.20", business: "Help a customer or a struggling teammate because it's right, not because you're tracking what you'll get back." },
  { text: "Austerity of speech that causes no distress, is truthful, pleasant, and beneficial, is called austerity of speech.", source: "Bhagavad Gita 17.15", business: "Being direct with a customer or a rep doesn't require being harsh — clear and kind can be the same sentence." },
  { text: "Faith is threefold, born of a person's own nature — in goodness, passion, or ignorance.", source: "Bhagavad Gita 17.2", business: "Notice whether a decision is coming from clear judgment, urgency, or habit — and choose accordingly." },

  // Chapter 18 — Liberation, the final counsel
  { text: "Abandon all varieties of duty and surrender unto me alone; do not fear.", source: "Bhagavad Gita 18.66", business: "When a plan stops working, it's fine to let it go and try something new rather than force it out of fear." },
  { text: "Whatever you do, whatever you eat, whatever you offer in sacrifice, whatever you give, do it as an offering.", source: "Bhagavad Gita 9.27 (echoed 18.57)", business: "Do the ordinary parts of the job — the paperwork, the follow-up call — with the same care as the big pitch." },
  { text: "One who does their allotted duty, without seeking its fruit, that is renunciation.", source: "Bhagavad Gita 18.9 (paraphrase)", business: "Do the day's visits fully, and let the numbers be the numbers — chasing them directly rarely helps." },
  { text: "The peace that comes from performing one's duty without attachment cannot be found through inaction.", source: "Bhagavad Gita 18.11 (paraphrase)", business: "Staying busy with the wrong things isn't rest — real peace comes from doing the right work well." },
  { text: "Fix your mind on me, be devoted to me, and you shall certainly come to me, for you are dear to me.", source: "Bhagavad Gita 18.65", business: "Stay genuinely committed to the people you work with and for — the rest tends to follow." },
  { text: "Better indeed is knowledge than mechanical practice; better than knowledge is meditation; better than meditation is renunciation of the fruit of action, for peace immediately follows renunciation.", source: "Bhagavad Gita 12.12 (echoed 18.)", business: "Understanding why a technique works beats repeating it by rote — and letting go of the outcome brings the calmest results of all." },

  // A few more, drawn from across the text, to round out the year
  { text: "Let the reward of your actions not be your motive, nor let your attachment be to inaction.", source: "Bhagavad Gita 2.47 (var.)", business: "Don't chase the sale for its own sake, but don't sit out the visit either — show up and do the work." },
  { text: "There is no loss of effort here, nor is there any harm; even a little practice on this path protects one from great fear.", source: "Bhagavad Gita 2.40", business: "Every honest visit, even an unproductive one, still adds to the relationship — nothing genuine is wasted." },
  { text: "Yoga is skill in action.", source: "Bhagavad Gita 2.50 (paraphrase)", business: "Real skill isn't working harder, it's working with less waste and more attention." },
  { text: "One who sees me everywhere, and sees everything in me, I am never lost to them, nor are they ever lost to me.", source: "Bhagavad Gita 6.30", business: "Stay connected to the purpose behind the numbers, and the work stops feeling like it's just about the numbers." },
  { text: "By concentration the mind gradually attains peace; fixing it in the self, one should think of nothing else.", source: "Bhagavad Gita 6.25", business: "A short, focused review before the day starts settles the mind more than jumping straight into the noise." },
  { text: "The disciplined self advances gradually, by steady practice, and settles in the self, thinking of nothing else.", source: "Bhagavad Gita 6.25 (var.)", business: "A new territory or a new product line is built up step by step, not in one big push." },
  { text: "Of all yogis, the one who worships me with faith, their inner self absorbed in me, is considered by me to be the most united.", source: "Bhagavad Gita 6.47", business: "The rep who stays quietly consistent, day after day, usually outperforms the one who's only intense in bursts." },
  { text: "Fix your mind on me alone, rest your intellect in me; you shall dwell in me alone hereafter — of this there is no doubt.", source: "Bhagavad Gita 12.8", business: "Keep the customer's real interest at the center of every decision, and the rest of the plan tends to fall into place." },
  { text: "For those whose minds are attached to the unmanifest, the difficulty is greater, for the unmanifest goal is hard for the embodied to reach.", source: "Bhagavad Gita 12.5", business: "Vague goals are harder to hit than concrete ones — turn 'grow the territory' into this week's specific visits." },
  { text: "Those who worship me, renouncing all actions in me, regarding me as the supreme goal, meditating on me alone — for them I am swiftly the deliverer.", source: "Bhagavad Gita 12.6-7", business: "Consistent, genuine focus on serving the customer well tends to resolve problems faster than any clever workaround." },
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
