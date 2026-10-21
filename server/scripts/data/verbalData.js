/**
 * 110+ 100% UNIQUE Verbal Ability Questions with in-depth grammatical explanations.
 * Covers Synonyms, Antonyms, Spotting Errors, Prepositions, Idioms, and Para-Jumbles.
 */

const SYNONYMS = [
  { word: 'CANDID', syn: 'Frank', opt: ['Deceptive', 'Ambiguous', 'Frank', 'Secretive'], correct: 'C', def: 'truthful, straightforward, and frank' },
  { word: 'BENEVOLENT', syn: 'Kind-hearted', opt: ['Kind-hearted', 'Malevolent', 'Selfish', 'Cruel'], correct: 'A', def: 'well-meaning and kindly' },
  { word: 'UBIQUITOUS', syn: 'Omnipresent', opt: ['Scarce', 'Omnipresent', 'Occasional', 'Localized'], correct: 'B', def: 'present, appearing, or found everywhere' },
  { word: 'PRAGMATIC', syn: 'Practical', opt: ['Idealistic', 'Impractical', 'Theoretical', 'Practical'], correct: 'D', def: 'dealing with things sensibly and realistically' },
  { word: 'TENACIOUS', syn: 'Persistent', opt: ['Yielding', 'Persistent', 'Fragile', 'Hesitant'], correct: 'B', def: 'tending to keep a firm hold; resolute' },
  { word: 'EPHEMERAL', syn: 'Transient', opt: ['Transient', 'Enduring', 'Eternal', 'Perpetual'], correct: 'A', def: 'lasting for a very short time' },
  { word: 'AMBIGUOUS', syn: 'Equivocal', opt: ['Precise', 'Lucid', 'Equivocal', 'Definite'], correct: 'C', def: 'open to more than one interpretation' },
  { word: 'LACONIC', syn: 'Concise', opt: ['Verbose', 'Loquacious', 'Prolix', 'Concise'], correct: 'D', def: 'using very few words' },
  { word: 'RESOLUTE', syn: 'Determined', opt: ['Determined', 'Wavering', 'Fickle', 'Timid'], correct: 'A', def: 'admirably purposeful and unwavering' },
  { word: 'ALACRITY', syn: 'Brisk eagerness', opt: ['Lethargy', 'Sloth', 'Brisk eagerness', 'Reluctance'], correct: 'C', def: 'brisk and cheerful readiness' },
  { word: 'COGENT', syn: 'Compelling', opt: ['Unconvincing', 'Compelling', 'Weak', 'Irrelevant'], correct: 'B', def: 'clear, logical, and convincing' },
  { word: 'DEBILITATE', syn: 'Enfeeble', opt: ['Strengthen', 'Enfeeble', 'Energize', 'Restore'], correct: 'B', def: 'make someone or something very weak' },
  { word: 'EGREGIOUS', syn: 'Flagrant', opt: ['Minor', 'Subtle', 'Flagrant', 'Inconsequential'], correct: 'C', def: 'outstandingly bad or shocking' },
  { word: 'FASTIDIOUS', syn: 'Meticulous', opt: ['Meticulous', 'Careless', 'Sloppy', 'Lenient'], correct: 'A', def: 'very attentive to and concerned about accuracy' },
  { word: 'GARRULOUS', syn: 'Talkative', opt: ['Taciturn', 'Quiet', 'Reticent', 'Talkative'], correct: 'D', def: 'excessively talkative, especially on trivial matters' },
  { word: 'HISTRIONIC', syn: 'Melodramatic', opt: ['Subdued', 'Melodramatic', 'Authentic', 'Reserved'], correct: 'B', def: 'overly theatrical or melodramatic in character' },
  { word: 'INEFFABLE', syn: 'Indescribable', opt: ['Indescribable', 'Expressible', 'Definable', 'Commonplace'], correct: 'A', def: 'too great or extreme to be expressed in words' },
  { word: 'JUXTAPOSE', syn: 'Collocate', opt: ['Separate', 'Isolate', 'Collocate', 'Distance'], correct: 'C', def: 'place or deal with close together for contrasting effect' },
  { word: 'MUNIFICENT', syn: 'Generous', opt: ['Generous', 'Miserly', 'Parsimonious', 'Stingy'], correct: 'A', def: 'more generous than is usual or necessary' },
  { word: 'NEFARIOUS', syn: 'Wicked', opt: ['Virtuous', 'Noble', 'Righteous', 'Wicked'], correct: 'D', def: 'wicked, villainous, or criminal' },
  { word: 'ONEROUS', syn: 'Burdensome', opt: ['Effortless', 'Burdensome', 'Facile', 'Light'], correct: 'B', def: 'involving an amount of effort that is oppressively burdensome' },
  { word: 'PERNICIOUS', syn: 'Harmful', opt: ['Harmless', 'Harmful', 'Beneficial', 'Innocuous'], correct: 'B', def: 'having a harmful effect, especially in a gradual way' },
  { word: 'QUERULOUS', syn: 'Petulant', opt: ['Compliant', 'Contented', 'Petulant', 'Affable'], correct: 'C', def: 'complaining in a petulant or whining manner' },
  { word: 'RANCOR', syn: 'Bitterness', opt: ['Bitterness', 'Goodwill', 'Affection', 'Amity'], correct: 'A', def: 'bitterness or resentfulness, especially when long-standing' },
  { word: 'SYCOPHANT', syn: 'Flatterer', opt: ['Leader', 'Flatterer', 'Critic', 'Rebel'], correct: 'B', def: 'a person who acts obsequiously toward someone important' },
  { word: 'TACITURN', syn: 'Reserved', opt: ['Loquacious', 'Voluble', 'Chatty', 'Reserved'], correct: 'D', def: 'reserved or uncommunicative in speech' },
  { word: 'VACILLATE', syn: 'Waver', opt: ['Waver', 'Decide', 'Commit', 'Persist'], correct: 'A', def: 'alternate or waver between different opinions or actions' },
  { word: 'WANTON', syn: 'Deliberate', opt: ['Restrained', 'Disciplined', 'Deliberate', 'Prudent'], correct: 'C', def: 'deliberate and unprovoked (of a cruel or violent action)' },
  { word: 'ZENITH', syn: 'Apex', opt: ['Nadir', 'Base', 'Apex', 'Bottom'], correct: 'C', def: 'the time at which something is most powerful or successful' },
  { word: 'CACOPHONY', syn: 'Dissonance', opt: ['Harmony', 'Melody', 'Symphony', 'Dissonance'], correct: 'D', def: 'a harsh, discordant mixture of sounds' }
];

const ANTONYMS = [
  { word: 'METICULOUS', ant: 'Careless', opt: ['Thorough', 'Precise', 'Scrupulous', 'Careless'], correct: 'D', def: 'very careful and precise' },
  { word: 'ACRIMONIOUS', ant: 'Harmonious', opt: ['Harmonious', 'Bitter', 'Caustic', 'Rancorous'], correct: 'A', def: 'angry and bitter' },
  { word: 'CAPRICIOUS', ant: 'Steadfast', opt: ['Fickle', 'Erratic', 'Steadfast', 'Whimsical'], correct: 'C', def: 'given to sudden and unaccountable changes of mood' },
  { word: 'DAUNTLESS', ant: 'Timid', opt: ['Brave', 'Valiant', 'Heroic', 'Timid'], correct: 'D', def: 'showing fearlessness and determination' },
  { word: 'FURTIVE', ant: 'Overt', opt: ['Overt', 'Secretive', 'Surreptitious', 'Stealthy'], correct: 'A', def: 'attempting to avoid notice or attention; secretive' },
  { word: 'GULLIBLE', ant: 'Astute', opt: ['Naive', 'Astute', 'Credulous', 'Trusting'], correct: 'B', def: 'easily persuaded to believe something' },
  { word: 'HAPHAZARD', ant: 'Methodical', opt: ['Random', 'Disorganized', 'Methodical', 'Aimless'], correct: 'C', def: 'lacking any obvious principle of organization' },
  { word: 'IMPETUOUS', ant: 'Cautious', opt: ['Rash', 'Hasty', 'Impulsive', 'Cautious'], correct: 'D', def: 'acting or done quickly and without thought or care' },
  { word: 'JUDICIOUS', ant: 'Foolish', opt: ['Foolish', 'Sensible', 'Prudent', 'Wise'], correct: 'A', def: 'having, showing, or done with good judgment or sense' },
  { word: 'LETHARGIC', ant: 'Energetic', opt: ['Sluggish', 'Energetic', 'Apathetic', 'Torpid'], correct: 'B', def: 'affected by lethargy; sluggish and apathetic' },
  { word: 'MALICIOUS', ant: 'Benevolent', opt: ['Malevolent', 'Spiteful', 'Vindictive', 'Benevolent'], correct: 'D', def: 'characterized by malice; intending to do harm' },
  { word: 'NONCHALANT', ant: 'Anxious', opt: ['Anxious', 'Calm', 'Casual', 'Unconcerned'], correct: 'A', def: 'feeling or appearing casually calm and relaxed' },
  { word: 'OBSTINATE', ant: 'Compliant', opt: ['Stubborn', 'Inflexible', 'Compliant', 'Headstrong'], correct: 'C', def: 'stubbornly refusing to change one\'s opinion or chosen course' },
  { word: 'PRODIGAL', ant: 'Frugal', opt: ['Frugal', 'Wasteful', 'Extravagant', 'Profligate'], correct: 'A', def: 'spending money or resources freely and recklessly' },
  { word: 'QUIXOTIC', ant: 'Pragmatic', opt: ['Idealistic', 'Unrealistic', 'Romantic', 'Pragmatic'], correct: 'D', def: 'exceedingly idealistic; unrealistic and impractical' },
  { word: 'RETICENT', ant: 'Loquacious', opt: ['Reserved', 'Silent', 'Loquacious', 'Withdrawn'], correct: 'C', def: 'not revealing one\'s thoughts or feelings readily' },
  { word: 'SOPORIFIC', ant: 'Stimulating', opt: ['Hypnotic', 'Stimulating', 'Sedative', 'Sleep-inducing'], correct: 'B', def: 'tending to induce drowsiness or sleep' },
  { word: 'TRANSIENT', ant: 'Permanent', opt: ['Permanent', 'Fleeting', 'Brief', 'Temporary'], correct: 'A', def: 'lasting only for a short time; impermanent' },
  { word: 'UNEQUIVOCAL', ant: 'Ambiguous', opt: ['Clear', 'Definite', 'Unmistakable', 'Ambiguous'], correct: 'D', def: 'leaving no doubt; unambiguous' },
  { word: 'VENERABLE', ant: 'Disreputable', opt: ['Respected', 'Revered', 'Disreputable', 'Honorable'], correct: 'C', def: 'accorded a great deal of respect, especially because of age or wisdom' },
  { word: 'WARY', ant: 'Reckless', opt: ['Cautious', 'Circumspect', 'Vigilant', 'Reckless'], correct: 'D', def: 'feeling or showing caution about possible dangers or problems' },
  { word: 'ZEALOUS', ant: 'Apathetic', opt: ['Apathetic', 'Fervent', 'Ardent', 'Passionate'], correct: 'A', def: 'having or showing great enthusiasm or passion' },
  { word: 'ABSTAIN', ant: 'Indulge', opt: ['Refrain', 'Forbear', 'Indulge', 'Withhold'], correct: 'C', def: 'restrain oneself from doing or enjoying something' },
  { word: 'BELLIGERENT', ant: 'Peaceable', opt: ['Hostile', 'Aggressive', 'Combative', 'Peaceable'], correct: 'D', def: 'hostile and aggressive' },
  { word: 'COMPLACENT', ant: 'Concerned', opt: ['Concerned', 'Self-satisfied', 'Smug', 'Unworried'], correct: 'A', def: 'showing smug or uncritical satisfaction with oneself' },
  { word: 'DISPARAGE', ant: 'Laud', opt: ['Belittle', 'Denigrate', 'Laud', 'Deprecate'], correct: 'C', def: 'regard or represent as being of little worth' },
  { word: 'ENERVATE', ant: 'Invigorate', opt: ['Weaken', 'Invigorate', 'Exhaust', 'Drain'], correct: 'B', def: 'cause someone to feel drained of energy or vitality' },
  { word: 'FACETIOUS', ant: 'Earnest', opt: ['Flippant', 'Jocular', 'Earnest', 'Playful'], correct: 'C', def: 'treating serious issues with deliberately inappropriate humor' },
  { word: 'GREGARIOUS', ant: 'Solitary', opt: ['Sociable', 'Companionable', 'Outgoing', 'Solitary'], correct: 'D', def: 'fond of company; sociable' },
  { word: 'HAUGHTY', ant: 'Humble', opt: ['Humble', 'Arrogant', 'Proud', 'Conceited'], correct: 'A', def: 'arrogantly superior and disdainful' }
];

const GRAMMAR_QUESTIONS = [
  {
    q: 'Identify the sentence with correct subject-verb agreement:',
    opts: [
      'The CEO as well as the board members are arriving at noon.',
      'The CEO as well as the board members is arriving at noon.',
      'The CEO as well as the board members were arriving at noon.',
      'The CEO as well as the board members have arrived at noon.'
    ],
    ans: 'B',
    exp: 'Parenthetical phrases introduced by "as well as", "along with", or "in addition to" do not compound the subject. "The CEO" is singular, so the singular verb "is" is mandatory.'
  },
  {
    q: 'Identify the grammatically correct sentence using subjunctive mood:',
    opts: [
      'If I was the engineering director, I would migrate to microservices.',
      'If I were the engineering director, I would migrate to microservices.',
      'If I am the engineering director, I would migrate to microservices.',
      'If I will be the engineering director, I would migrate to microservices.'
    ],
    ans: 'B',
    exp: 'The subjunctive mood is used to express counterfactual or hypothetical statements. The past subjunctive of "to be" is "were" for all subjects ("If I were...", "If she were...").'
  },
  {
    q: 'Choose the sentence with correct pronoun case:',
    opts: [
      'The CTO distributed the assignment between him and I.',
      'The CTO distributed the assignment between he and me.',
      'The CTO distributed the assignment between him and me.',
      'The CTO distributed the assignment between he and I.'
    ],
    ans: 'C',
    exp: 'Prepositions like "between" take the objective case of pronouns: "between him and me" (not "I").'
  },
  {
    q: 'Identify the sentence that correctly uses "neither...nor":',
    opts: [
      'Neither the project manager nor the developers was available for the standup.',
      'Neither the project manager nor the developers were available for the standup.',
      'Neither the project manager nor the developers is available for the standup.',
      'Neither the project manager nor the developers has been available for the standup.'
    ],
    ans: 'B',
    exp: 'When subject terms are joined by "neither...nor", the verb agrees with the closer subject. Here, "the developers" (plural) is closer to the verb, so "were" is correct.'
  },
  {
    q: 'Identify the sentence that correctly handles "One of the... who":',
    opts: [
      'He is one of the software engineers who has delivered his module on time.',
      'He is one of the software engineers who have delivered their modules on time.',
      'He is one of the software engineer who have delivered their modules on time.',
      'He is one of the software engineers who is delivering his module on time.'
    ],
    ans: 'B',
    exp: 'In the construction "one of the [plural noun] who [verb]", the relative pronoun "who" refers back to the plural noun ("software engineers"), requiring the plural verb "have delivered".'
  },
  {
    q: 'Select the sentence with proper use of "no sooner... than":',
    opts: [
      'No sooner had the database restarted when user traffic spiked.',
      'No sooner had the database restarted then user traffic spiked.',
      'No sooner had the database restarted than user traffic spiked.',
      'No sooner the database had restarted than user traffic spiked.'
    ],
    ans: 'C',
    exp: '"No sooner" requires the correlative conjunction "than" (never "when" or "then") and takes inverted auxiliary word order ("had the database restarted").'
  },
  {
    q: 'Select the sentence with proper use of "hardly... when":',
    opts: [
      'Hardly had the deployment pipeline triggered than the test suite failed.',
      'Hardly had the deployment pipeline triggered when the test suite failed.',
      'Hardly had the deployment pipeline triggered then the test suite failed.',
      'Hardly the deployment pipeline had triggered when the test suite failed.'
    ],
    ans: 'B',
    exp: '"Hardly" and "Scarcely" pair strictly with "when", followed by negative inversion ("had the deployment pipeline triggered").'
  },
  {
    q: 'Choose the sentence with correct adjective comparative rule:',
    opts: [
      'Senior dev Alex is senior than Jordan in enterprise experience.',
      'Senior dev Alex is more senior than Jordan in enterprise experience.',
      'Senior dev Alex is senior to Jordan in enterprise experience.',
      'Senior dev Alex is most senior to Jordan in enterprise experience.'
    ],
    ans: 'C',
    exp: 'Adjectives of Latin origin ending in "-ior" (senior, junior, prior, superior, inferior) are followed by "to", never "than".'
  },
  {
    q: 'Identify the sentence with correct modifier placement (avoiding dangling modifier):',
    opts: [
      'Walking into the data center, a server rack was heard beeping loudly.',
      'Walking into the data center, the technician heard a server rack beeping loudly.',
      'Walking into the data center, loud beeping was emitted from a server rack.',
      'Walking into the data center, the alarm sounded to the technician.'
    ],
    ans: 'B',
    exp: 'A participial phrase ("Walking into the data center") must modify the grammatical subject that performs the action ("the technician", not "a server rack").'
  },
  {
    q: 'Select the sentence with proper parallelism:',
    opts: [
      'The intern excels at coding algorithms, debugging bottlenecks, and to test APIs.',
      'The intern excels at coding algorithms, debugging bottlenecks, and testing APIs.',
      'The intern excels to code algorithms, debugging bottlenecks, and testing APIs.',
      'The intern excels at coding algorithms, to debug bottlenecks, and testing APIs.'
    ],
    ans: 'B',
    exp: 'Parallel elements in a series must share the exact same grammatical form: "coding..., debugging..., and testing...".'
  },
  {
    q: 'Choose the sentence that correctly distinguishes "fewer" from "less":',
    opts: [
      'The optimized query consumed fewer memory than the legacy procedure.',
      'The optimized query produced less syntax warnings than the legacy procedure.',
      'The optimized query produced fewer syntax warnings and consumed less memory.',
      'The optimized query produced less syntax warnings and consumed fewer memory.'
    ],
    ans: 'C',
    exp: '"Fewer" is used with countable nouns ("syntax warnings"), while "less" is used with uncountable quantities ("memory").'
  },
  {
    q: 'Identify the sentence with correct prepositional idiom for "prefer":',
    opts: [
      'I prefer writing automated integration tests than manual testing.',
      'I prefer writing automated integration tests rather than manual testing.',
      'I prefer writing automated integration tests to manual testing.',
      'I prefer writing automated integration tests over manual testing.'
    ],
    ans: 'C',
    exp: 'The verb "prefer" traditionally takes the preposition "to" when comparing two gerunds or nouns ("prefer X to Y").'
  },
  {
    q: 'Choose the sentence with correct verb agreement for "Each":',
    opts: [
      'Each of the cloud microservices have an independent database instance.',
      'Each of the cloud microservices has an independent database instance.',
      'Each of the cloud microservices are having an independent database instance.',
      'Each of the cloud microservices were having an independent database instance.'
    ],
    ans: 'B',
    exp: '"Each" is an indefinite singular pronoun and governs the singular verb "has", regardless of the intervening plural prepositional phrase ("of the cloud microservices").'
  },
  {
    q: 'Identify the sentence that uses "despite" correctly:',
    opts: [
      'Despite of multiple network spikes, the caching cluster maintained low latency.',
      'Despite the network spikes, the caching cluster maintained low latency.',
      'In despite of network spikes, the caching cluster maintained low latency.',
      'Despite that network spikes, the caching cluster maintained low latency.'
    ],
    ans: 'B',
    exp: '"Despite" is a preposition that never takes "of" ("Despite the spikes"). "In spite of" is the variant that includes "of".'
  },
  {
    q: 'Choose the sentence with correct use of "lest":',
    opts: [
      'Backup the master database regularly lest you will lose critical customer data.',
      'Backup the master database regularly lest you should lose critical customer data.',
      'Backup the master database regularly lest you do not lose critical customer data.',
      'Backup the master database regularly lest you might not lose critical customer data.'
    ],
    ans: 'B',
    exp: '"Lest" means "for fear that" and is inherently negative; it is paired with the modal auxiliary "should" and never takes a negative particle ("not").'
  },
  {
    q: 'Choose the correct preposition: "The candidate was declared eligible _____ the campus placement interview."',
    opts: ['for', 'to', 'with', 'about'],
    ans: 'A',
    exp: '"Eligible for" is the fixed English prepositional collocation.'
  },
  {
    q: 'Choose the correct preposition: "All engineers must adhere _____ the secure coding guidelines."',
    opts: ['with', 'to', 'in', 'upon'],
    ans: 'B',
    exp: '"Adhere to" is the correct standard collocation meaning to follow closely.'
  },
  {
    q: 'Choose the correct preposition: "The team was asked to abstain _____ making direct database modifications in production."',
    opts: ['to', 'from', 'with', 'by'],
    ans: 'B',
    exp: '"Abstain from" is the appropriate idiom meaning to refrain voluntarily.'
  },
  {
    q: 'Choose the correct preposition: "The QA team is adept _____ identifying race conditions in multi-threaded code."',
    opts: ['at', 'in', 'with', 'on'],
    ans: 'A',
    exp: '"Adept at" is the idiomatic standard for skill in an activity (though "adept in" is sometimes seen, "adept at" is preferred on placement tests).'
  },
  {
    q: 'Choose the correct preposition: "The backend framework is compatible _____ distributed tracing systems."',
    opts: ['to', 'for', 'with', 'from'],
    ans: 'C',
    exp: '"Compatible with" is the standard grammatical pairing.'
  },
  {
    q: 'Choose the correct preposition: "The client was deprived _____ administrative privileges due to repeated authentication failures."',
    opts: ['of', 'from', 'with', 'by'],
    ans: 'A',
    exp: '"Deprived of" is the standard construction meaning to have something taken away.'
  },
  {
    q: 'Choose the correct preposition: "She is confident _____ clearing the Tier-1 tech assessment."',
    opts: ['of', 'to', 'with', 'for'],
    ans: 'A',
    exp: '"Confident of" takes a gerund ("clearing") to express certainty regarding an outcome.'
  },
  {
    q: 'Choose the correct preposition: "The system administrator is accountable _____ the CTO for platform uptime."',
    opts: ['with', 'to', 'for', 'about'],
    ans: 'B',
    exp: 'One is "accountable to [a person]" for [a deliverable].'
  },
  {
    q: 'Choose the correct preposition: "The team complied _____ all corporate cybersecurity regulations."',
    opts: ['to', 'with', 'for', 'by'],
    ans: 'B',
    exp: '"Comply with" is the required standard idiom.'
  },
  {
    q: 'Choose the correct preposition: "The algorithm is superior _____ earlier heuristics in time complexity."',
    opts: ['than', 'to', 'over', 'from'],
    ans: 'B',
    exp: 'Latin comparative adjectives like "superior" take "to", never "than".'
  }
];

const IDIOM_QUESTIONS = [
  {
    q: 'What is the exact meaning of the idiom: "To burn the midnight oil"?',
    opts: ['To waste precious natural resources', 'To work or study late into the night', 'To cause accidental damage through carelessness', 'To run computations at peak processor clock speed'],
    ans: 'B',
    exp: '"To burn the midnight oil" originates from working by lamplight late into the night.'
  },
  {
    q: 'What is the meaning of the idiom: "To bite the bullet"?',
    opts: ['To accept an inevitable unpleasant situation with courage', 'To act impulsively in a critical moment', 'To avoid responsibility during a deployment failure', 'To aggressively challenge a competitor in the market'],
    ans: 'A',
    exp: '"Bite the bullet" means to face a grim or difficult situation with fortitude.'
  },
  {
    q: 'What is the meaning of the idiom: "Break the ice"?',
    opts: ['To repair a broken codebase', 'To initiate conversation in an awkward or formal social setting', 'To destroy a delicate agreement', 'To lower operating temperature in a server room'],
    ans: 'B',
    exp: '"Break the ice" means to ease tension and stimulate conversation when strangers meet.'
  },
  {
    q: 'What is the meaning of the idiom: "Hit the nail on the head"?',
    opts: ['To physically construct something sturdy', 'To make an unintended typographical error', 'To state or describe a situation with exact precision', 'To react harshly to constructive criticism'],
    ans: 'C',
    exp: '"Hit the nail on the head" means to say something that is completely accurate or identify the exact heart of a problem.'
  },
  {
    q: 'What is the meaning of the idiom: "Once in a blue moon"?',
    opts: ['Occurring on a predictable monthly schedule', 'Happening very rarely or almost never', 'Occurring strictly during night shifts', 'A temporary system configuration'],
    ans: 'B',
    exp: 'A "blue moon" is an infrequent astronomical phenomenon, symbolizing very rare events.'
  },
  {
    q: 'What is the meaning of the idiom: "Spill the beans"?',
    opts: ['To cook a communal meal for teammates', 'To unintentionally reveal a secret or confidential information', 'To ruin an automated software build', 'To spend operational funds carelessly'],
    ans: 'B',
    exp: '"Spill the beans" means to disclose confidential facts prematurely or inadvertently.'
  },
  {
    q: 'What is the meaning of the idiom: "A blessing in disguise"?',
    opts: ['A fraudulent security certificate', 'An apparent misfortune that eventually yields positive consequences', 'A project requirement that remains unstated', 'A hidden vulnerability in an application'],
    ans: 'B',
    exp: 'It describes an event that seems unfavorable initially, but proves beneficial in the long term.'
  },
  {
    q: 'What is the meaning of the idiom: "Through thick and thin"?',
    opts: ['Only when the market is profitable', 'Under all circumstances, enduring both hardships and prosperous times', 'Reviewing code with both high and low detail', 'Compressing both large and small binary payloads'],
    ans: 'B',
    exp: '"Through thick and thin" means remaining loyal and dedicated through all challenges.'
  },
  {
    q: 'What is the meaning of the idiom: "The ball is in your court"?',
    opts: ['You have won the competitive placement round', 'It is now your decision or responsibility to take the next step', 'You must hand over the credentials to a supervisor', 'The system is waiting for an external callback'],
    ans: 'B',
    exp: 'Originating from tennis, it signifies that the initiative now rests with the specified party.'
  },
  {
    q: 'What is the meaning of the idiom: "Under the weather"?',
    opts: ['Exposed to severe atmospheric conditions', 'Feeling slightly indisposed or unwell', 'Operating under tight budgetary constraints', 'Working in a distributed offshore environment'],
    ans: 'B',
    exp: '"Under the weather" is an idiom describing a state of mild illness or fatigue.'
  },
  {
    q: 'What is the meaning of the idiom: "Best of both worlds"?',
    opts: ['A dual-boot operating system configuration', 'Enjoying the simultaneous advantages of two contrasting options', 'Splitting work across two unrelated repositories', 'A hybrid cloud deployment without internet access'],
    ans: 'B',
    exp: 'It refers to a situation where one can relish the benefits of two distinct opportunities at once.'
  },
  {
    q: 'What is the meaning of the idiom: "Take with a grain of salt"?',
    opts: ['To season a meal before eating', 'To view a claim with skepticism and reserve judgment', 'To accept corporate feedback without questioning', 'To implement a data validation rule strictly'],
    ans: 'B',
    exp: 'It advises not to accept a statement as completely true without independent verification.'
  },
  {
    q: 'What is the meaning of the idiom: "Cry over spilt milk"?',
    opts: ['To complain about minor financial losses', 'To express useless regret over a past mistake that cannot be undone', 'To report a minor error to management', 'To discard depreciated hardware prematurely'],
    ans: 'B',
    exp: 'It means worrying or lamenting about past occurrences that cannot be altered.'
  },
  {
    q: 'What is the meaning of the idiom: "Let the cat out of the bag"?',
    opts: ['To release an internal package to open-source', 'To disclose a secret carelessly or by mistake', 'To terminate an underperforming employee', 'To launch an experimental feature flag in production'],
    ans: 'B',
    exp: 'It means divulging a secret, typically through carelessness.'
  },
  {
    q: 'What is the meaning of the idiom: "Piece of cake"?',
    opts: ['A reward given for winning a hackathon', 'A task or challenge that is exceptionally easy to accomplish', 'A fraction of a corporate budget allocated to training', 'An incomplete pull request'],
    ans: 'B',
    exp: 'It denotes a job, exam, or duty that requires minimal effort to complete.'
  }
];

const PARA_JUMBLES = [
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Consequently, database query latency dropped by 65% across regional clusters.
(2) High lock contention had been severely degrading checkout response times during peak hours.
(3) The backend infrastructure team implemented Redis-based distributed caching.
(4) This architectural change allowed the ecommerce platform to handle Black Friday traffic seamlessly.`,
    opts: ['2 - 3 - 1 - 4', '3 - 2 - 4 - 1', '2 - 1 - 3 - 4', '1 - 2 - 3 - 4'],
    ans: 'A',
    exp: 'Statement (2) introduces the operational bottleneck. Statement (3) details the technical intervention. Statement (1) provides the immediate empirical result ("Consequently..."). Statement (4) summarizes the overall business outcome.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Modern compilers translate high-level source code into intermediate representations.
(2) Finally, the machine code is executed directly on the host hardware processor.
(3) This intermediate code undergoes extensive control-flow and register-allocation optimizations.
(4) Afterwards, the optimized code is converted into target-specific assembly instructions.`,
    opts: ['1 - 3 - 4 - 2', '1 - 4 - 3 - 2', '3 - 1 - 4 - 2', '4 - 1 - 3 - 2'],
    ans: 'A',
    exp: 'Statement (1) begins the compilation pipeline. Statement (3) refers back to "This intermediate code". Statement (4) continues with "Afterwards... target assembly". Statement (2) concludes with "Finally, machine code execution".'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Without automated unit tests, regressions go unnoticed until production outages occur.
(2) Continuous Integration (CI) enforces automated testing on every pull request.
(3) As a result, software reliability improves significantly while cycle time decreases.
(4) It thereby catches syntax and functional bugs before code merges into the mainline branch.`,
    opts: ['1 - 2 - 4 - 3', '2 - 1 - 4 - 3', '2 - 4 - 1 - 3', '4 - 2 - 1 - 3'],
    ans: 'A',
    exp: 'Statement (1) highlights the core dilemma. Statement (2) introduces CI as the solution. Statement (4) clarifies how "It thereby catches bugs...". Statement (3) delivers the final positive result ("As a result...").'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) This cryptographic digest is signed using the sender's private key.
(2) Digital signatures ensure both data integrity and sender non-repudiation in network protocols.
(3) The recipient then decrypts the signature using the sender's public key to verify authenticity.
(4) The signing process begins by generating a fixed-length cryptographic hash of the message payload.`,
    opts: ['2 - 4 - 1 - 3', '4 - 1 - 3 - 2', '2 - 1 - 4 - 3', '4 - 2 - 1 - 3'],
    ans: 'A',
    exp: 'Statement (2) introduces the broad security concept. Statement (4) describes step 1 of signing. Statement (1) refers to "This cryptographic digest". Statement (3) describes the verification step by the recipient.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) However, monolithic applications often become unmaintainable as engineering organizations scale.
(2) Microservice architectures decompose these large monoliths into autonomous, domain-driven services.
(3) Traditionally, software startups build monolithic codebases to accelerate initial time to market.
(4) Each service can then be deployed, scaled, and maintained independently by dedicated feature teams.`,
    opts: ['3 - 1 - 2 - 4', '1 - 3 - 2 - 4', '3 - 2 - 1 - 4', '2 - 4 - 3 - 1'],
    ans: 'A',
    exp: 'Statement (3) establishes the historical starting point ("Traditionally, startups build monoliths..."). Statement (1) introduces the conflict ("However, monoliths become unmaintainable..."). Statement (2) presents microservices as the remedy. Statement (4) highlights the resulting autonomy.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Overfitting occurs when a machine learning model memorizes training noise instead of general patterns.
(2) As a consequence, the model exhibits stellar training accuracy but fails miserably on test data.
(3) Techniques like dropout, L2 weight regularization, and data augmentation are applied to counteract it.
(4) These regularization strategies constrain model complexity, promoting robust generalization.`,
    opts: ['1 - 2 - 3 - 4', '1 - 3 - 2 - 4', '3 - 4 - 1 - 2', '2 - 1 - 3 - 4'],
    ans: 'A',
    exp: 'Statement (1) defines the problem (overfitting). Statement (2) describes its diagnostic symptom ("As a consequence..."). Statement (3) introduces remedies (dropout, L2). Statement (4) explains how "These regularization strategies" work.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Deadlocks occur in concurrent operating systems when two or more processes become mutually blocked.
(2) Modern kernels implement lock-ordering protocols and deadlock detection algorithms to prevent this.
(3) This condition arises because each process holds a resource that the other requires to proceed.
(4) Once detected, the operating system can terminate one process or preempt resources to restore forward progress.`,
    opts: ['1 - 3 - 2 - 4', '1 - 2 - 3 - 4', '3 - 1 - 2 - 4', '2 - 1 - 3 - 4'],
    ans: 'A',
    exp: 'Statement (1) introduces deadlocks. Statement (3) explains the causality ("This condition arises because..."). Statement (2) outlines kernel countermeasures. Statement (4) completes the mitigation ("Once detected, the OS can terminate...").'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) In b-tree indexing, nodes maintain ordered keys and child pointers to minimize disk I/O operations.
(2) Relational database management systems rely on indexing structures to achieve sub-millisecond lookups.
(3) This logarithmic search time ensures queries scale gracefully as tables grow to billions of rows.
(4) Searches traverse from root to leaf node in O(log N) time complexity.`,
    opts: ['2 - 1 - 4 - 3', '1 - 2 - 4 - 3', '2 - 4 - 1 - 3', '4 - 1 - 2 - 3'],
    ans: 'A',
    exp: 'Statement (2) provides the general context (RDBMS indexing). Statement (1) zooms into B-trees specifically. Statement (4) details the search traversal. Statement (3) links "This logarithmic search time" to scalability.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) Garbage collection automates heap memory reclamation in managed runtime environments.
(2) Unreferenced objects are identified by tracing object reachability from established root pointers.
(3) Developers in languages like Java and Go are thus relieved of manual memory deallocation burdens.
(4) The memory occupied by unreachable objects is then freed and consolidated for future allocations.`,
    opts: ['1 - 3 - 2 - 4', '1 - 2 - 4 - 3', '3 - 1 - 2 - 4', '2 - 4 - 1 - 3'],
    ans: 'B',
    exp: 'Statement (1) introduces GC. Statement (2) details the tracing mechanism. Statement (4) explains the immediate physical result (freeing memory). Statement (3) concludes with the developer ergonomics benefit.'
  },
  {
    q: `Arrange the following sentences in a coherent logical sequence:
(1) DNS resolvers translate human-readable domain names into numerical IP addresses.
(2) The browser sends an HTTP request to that IP address to fetch the initial HTML payload.
(3) When a user enters a URL into their browser address bar, a series of network exchanges begins.
(4) Once the IP address is resolved and returned to the browser, a TCP handshake is initiated.`,
    opts: ['3 - 1 - 4 - 2', '1 - 3 - 4 - 2', '3 - 4 - 1 - 2', '1 - 4 - 2 - 3'],
    ans: 'A',
    exp: 'Statement (3) sets up the scenario (user enters URL). Statement (1) is the first action (DNS resolution). Statement (4) follows with "Once the IP address is resolved...". Statement (2) concludes with the browser sending HTTP request.'
  }
];

export function generateFullVerbalBank() {
  const bank = [];
  const companies = ['comp-tcs', 'comp-infosys', 'comp-accenture', 'comp-wipro', 'comp-cognizant'];
  let seq = 1;

  // 1. Synonyms (30 questions)
  for (const s of SYNONYMS) {
    const qId = `q-verbal-${String(seq).padStart(3, '0')}`;
    const diff = seq % 3 === 0 ? 'Hard' : (seq % 2 === 0 ? 'Medium' : 'Easy');
    bank.push({
      id: qId,
      sequence: seq,
      question: `Select the word most nearly SIMILAR in meaning to: "${s.word}"`,
      subtopic: 'Vocabulary: Synonyms & Antonyms',
      difficulty: diff,
      company_id: companies[seq % companies.length],
      correct_answer: s.correct,
      explanation: `"${s.word}" means ${s.def}. Its direct synonym is "${s.syn}".`,
      options: [
        { option_key: 'A', option_text: s.opt[0], is_correct: s.correct === 'A' },
        { option_key: 'B', option_text: s.opt[1], is_correct: s.correct === 'B' },
        { option_key: 'C', option_text: s.opt[2], is_correct: s.correct === 'C' },
        { option_key: 'D', option_text: s.opt[3], is_correct: s.correct === 'D' }
      ]
    });
    seq++;
  }

  // 2. Antonyms (30 questions)
  for (const a of ANTONYMS) {
    const qId = `q-verbal-${String(seq).padStart(3, '0')}`;
    const diff = seq % 3 === 0 ? 'Hard' : (seq % 2 === 0 ? 'Medium' : 'Easy');
    bank.push({
      id: qId,
      sequence: seq,
      question: `Select the word most nearly OPPOSITE in meaning to: "${a.word}"`,
      subtopic: 'Vocabulary: Synonyms & Antonyms',
      difficulty: diff,
      company_id: companies[seq % companies.length],
      correct_answer: a.correct,
      explanation: `"${a.word}" means ${a.def}. Its exact antonym is "${a.ant}".`,
      options: [
        { option_key: 'A', option_text: a.opt[0], is_correct: a.correct === 'A' },
        { option_key: 'B', option_text: a.opt[1], is_correct: a.correct === 'B' },
        { option_key: 'C', option_text: a.opt[2], is_correct: a.correct === 'C' },
        { option_key: 'D', option_text: a.opt[3], is_correct: a.correct === 'D' }
      ]
    });
    seq++;
  }

  // 3. Grammar & Spotting Errors (25 questions)
  for (const g of GRAMMAR_QUESTIONS) {
    const qId = `q-verbal-${String(seq).padStart(3, '0')}`;
    const diff = seq % 3 === 0 ? 'Hard' : (seq % 2 === 0 ? 'Medium' : 'Easy');
    bank.push({
      id: qId,
      sequence: seq,
      question: g.q,
      subtopic: 'Sentence Correction & Grammar',
      difficulty: diff,
      company_id: companies[seq % companies.length],
      correct_answer: g.ans,
      explanation: g.exp,
      options: [
        { option_key: 'A', option_text: g.opts[0], is_correct: g.ans === 'A' },
        { option_key: 'B', option_text: g.opts[1], is_correct: g.ans === 'B' },
        { option_key: 'C', option_text: g.opts[2], is_correct: g.ans === 'C' },
        { option_key: 'D', option_text: g.opts[3], is_correct: g.ans === 'D' }
      ]
    });
    seq++;
  }

  // 4. Idioms & Phrases (15 questions)
  for (const idm of IDIOM_QUESTIONS) {
    const qId = `q-verbal-${String(seq).padStart(3, '0')}`;
    const diff = seq % 3 === 0 ? 'Hard' : (seq % 2 === 0 ? 'Medium' : 'Easy');
    bank.push({
      id: qId,
      sequence: seq,
      question: idm.q,
      subtopic: 'Idioms & Prepositional Collocations',
      difficulty: diff,
      company_id: companies[seq % companies.length],
      correct_answer: idm.ans,
      explanation: idm.exp,
      options: [
        { option_key: 'A', option_text: idm.opts[0], is_correct: idm.ans === 'A' },
        { option_key: 'B', option_text: idm.opts[1], is_correct: idm.ans === 'B' },
        { option_key: 'C', option_text: idm.opts[2], is_correct: idm.ans === 'C' },
        { option_key: 'D', option_text: idm.opts[3], is_correct: idm.ans === 'D' }
      ]
    });
    seq++;
  }

  // 5. Para-Jumbles (10 questions)
  for (const pj of PARA_JUMBLES) {
    const qId = `q-verbal-${String(seq).padStart(3, '0')}`;
    const diff = 'Hard';
    bank.push({
      id: qId,
      sequence: seq,
      question: pj.q,
      subtopic: 'Para Jumbles & Coherence',
      difficulty: diff,
      company_id: companies[seq % companies.length],
      correct_answer: pj.ans,
      explanation: pj.exp,
      options: [
        { option_key: 'A', option_text: pj.opts[0], is_correct: pj.ans === 'A' },
        { option_key: 'B', option_text: pj.opts[1], is_correct: pj.ans === 'B' },
        { option_key: 'C', option_text: pj.opts[2], is_correct: pj.ans === 'C' },
        { option_key: 'D', option_text: pj.opts[3], is_correct: pj.ans === 'D' }
      ]
    });
    seq++;
  }

  return bank;
}
