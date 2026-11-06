export type QuoteKind = 'philosophy' | 'poem' | 'play';

export type Quote = {
  id: string;
  kind: QuoteKind;
  /** The words themselves. Poems and plays keep their line breaks as "\n". */
  text: string;
  author: string;
  /** Where it comes from. */
  work: string;
  year: string;
  /** One line about the author. */
  about: string;
  /** The school or movement, for the running head. */
  tag: string;
  /** What it means, in plain words. */
  gloss: string;
  /** A question to think about. */
  ask: string;
};

export const KIND_LABEL: Record<QuoteKind, string> = {
  philosophy: 'PHILOSOPHY',
  poem: 'POEM',
  play: 'PLAY',
};

/** All public-domain texts. Glosses and questions are our own words. */
export const QUOTES: Quote[] = [
  {
    id: 'blake-fly',
    kind: 'poem',
    text: "Little Fly,\nThy summer's play\nMy thoughtless hand\nHas brush'd away.",
    author: 'William Blake',
    work: 'The Fly, Songs of Experience',
    year: '1794',
    about: 'English poet and painter, 1757–1827',
    tag: 'Romantic poetry',
    gloss:
      'Blake sees a fly as a small life much like his own, and asks whether we are any less fragile or accidental. Fitting for a swatter.',
    ask: 'Is a fly’s life worth less than yours? Why?',
  },
  {
    id: 'shakespeare-lear',
    kind: 'play',
    text: 'As flies to wanton boys are we to the gods;\nThey kill us for their sport.',
    author: 'William Shakespeare',
    work: 'King Lear, Act 4',
    year: 'c. 1606',
    about: 'English playwright, 1564–1616',
    tag: 'Tragedy',
    gloss:
      'Gloucester, blinded and betrayed, says the gods treat people the way careless boys treat flies. It is one of the bleakest images in English.',
    ask: 'Do you think life is fair, or only seems fair when things go well?',
  },
  {
    id: 'socrates-examined',
    kind: 'philosophy',
    text: 'The unexamined life is not worth living.',
    author: 'Socrates',
    work: 'Plato, Apology',
    year: 'c. 399 BC',
    about: 'Greek philosopher, c. 470–399 BC',
    tag: 'Classical Greece',
    gloss:
      'Said at his trial, when he could have bought his freedom by giving up his questions. For Socrates, asking why we believe what we believe is what makes a life our own.',
    ask: 'What is one belief of yours that you have never really questioned?',
  },
  {
    id: 'descartes-cogito',
    kind: 'philosophy',
    text: 'I think, therefore I am.',
    author: 'René Descartes',
    work: 'Principles of Philosophy',
    year: '1644',
    about: 'French philosopher and mathematician, 1596–1650',
    tag: 'Rationalism',
    gloss:
      'Descartes doubted everything he could. The one thing he could not doubt was that he was doubting, so someone had to be doing it. A fixed point to build knowledge on.',
    ask: 'If you doubted everything, what would you still be sure of?',
  },
  {
    id: 'kant-dare',
    kind: 'philosophy',
    text: 'Dare to know! Have the courage to use your own understanding.',
    author: 'Immanuel Kant',
    work: 'What Is Enlightenment?',
    year: '1784',
    about: 'German philosopher, 1724–1804',
    tag: 'Enlightenment',
    gloss:
      'Kant’s motto for the Enlightenment: stop letting others think for you. Growing up means doing your own thinking, even when following is easier.',
    ask: 'When did you last change your mind because of a good argument?',
  },
  {
    id: 'seneca-imagination',
    kind: 'philosophy',
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    work: 'Letters to Lucilius, 13',
    year: 'c. 65 AD',
    about: 'Roman Stoic philosopher, c. 4 BC–65 AD',
    tag: 'Stoicism',
    gloss:
      'Worry runs ahead of events. The Stoics practised noticing which of their fears were about things that might happen, not things that are happening.',
    ask: 'What are you dreading that has not happened yet?',
  },
  {
    id: 'epictetus-views',
    kind: 'philosophy',
    text: 'Men are disturbed not by things, but by the views which they take of them.',
    author: 'Epictetus',
    work: 'Enchiridion, 5',
    year: 'c. 125 AD',
    about: 'Stoic philosopher, c. 50–135 AD, born a slave',
    tag: 'Stoicism',
    gloss:
      'It is not the event but how we judge it that upsets us. Change the judgment and the feeling often changes with it.',
    ask: 'Think of something that annoyed you today. What story did you tell about it?',
  },
  {
    id: 'laozi-step',
    kind: 'philosophy',
    text: 'A journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
    work: 'Tao Te Ching, 64',
    year: 'c. 400 BC',
    about: 'Chinese sage, traditionally of the 6th century BC',
    tag: 'Taoism',
    gloss:
      'Big things get done in small steps. Start with the part that is right in front of you, and the rest becomes reachable.',
    ask: 'What is the first small step of something you keep putting off?',
  },
  {
    id: 'confucius-thought',
    kind: 'philosophy',
    text: 'Learning without thought is labour lost; thought without learning is perilous.',
    author: 'Confucius',
    work: 'Analects, 2.15',
    year: 'c. 500 BC',
    about: 'Chinese philosopher, 551–479 BC',
    tag: 'Confucianism',
    gloss:
      'Collecting facts is not enough, and neither is thinking alone. You need both: learn something, reflect on it, then check it against what you learned.',
    ask: 'Do you tend to read first and think later, or think first and read later?',
  },
  {
    id: 'pascal-heart',
    kind: 'philosophy',
    text: 'The heart has its reasons, which reason knows nothing of.',
    author: 'Blaise Pascal',
    work: 'Pensées',
    year: '1670',
    about: 'French mathematician and philosopher, 1623–1662',
    tag: 'Reason & heart',
    gloss:
      'Pascal was a scientist who still thought logic is not the whole story. Some things, like love or trust, we know without being able to prove them.',
    ask: 'What do you believe that you could never prove?',
  },
  {
    id: 'mill-socrates',
    kind: 'philosophy',
    text: 'It is better to be a human being dissatisfied than a pig satisfied; better to be Socrates dissatisfied than a fool satisfied.',
    author: 'John Stuart Mill',
    work: 'Utilitarianism',
    year: '1863',
    about: 'English philosopher, 1806–1873',
    tag: 'Utilitarianism',
    gloss:
      'Mill argued that pleasures differ in quality, not just amount. Using your mind is a higher pleasure, even when it is harder than being comfortable.',
    ask: 'Is a hard, interesting hour better than an easy, empty one?',
  },
  {
    id: 'nietzsche-why',
    kind: 'philosophy',
    text: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
    work: 'Twilight of the Idols',
    year: '1889',
    about: 'German philosopher, 1844–1900',
    tag: 'Existentialism',
    gloss:
      'A sense of purpose makes hardship bearable. People can endure a great deal when they know what it is for.',
    ask: 'What is your “why” right now?',
  },
  {
    id: 'hume-reason',
    kind: 'philosophy',
    text: 'Reason is, and ought only to be the slave of the passions.',
    author: 'David Hume',
    work: 'A Treatise of Human Nature',
    year: '1739',
    about: 'Scottish philosopher, 1711–1776',
    tag: 'Empiricism',
    gloss:
      'Hume’s provocative claim: reasoning tells us how to get what we want, but the wanting comes first, from feeling. Reason is a tool, not the boss.',
    ask: 'Think of a choice you justified with logic after you had already decided.',
  },
  {
    id: 'aristotle-political',
    kind: 'philosophy',
    text: 'Man is by nature a political animal.',
    author: 'Aristotle',
    work: 'Politics',
    year: 'c. 350 BC',
    about: 'Greek philosopher, 384–322 BC',
    tag: 'Classical Greece',
    gloss:
      'By “political” he meant made for living together in communities. People become fully human by sharing a life with others, not alone.',
    ask: 'What can you only do, or only be, with other people?',
  },
  {
    id: 'bacon-power',
    kind: 'philosophy',
    text: 'Knowledge itself is power.',
    author: 'Francis Bacon',
    work: 'Meditationes Sacrae',
    year: '1597',
    about: 'English philosopher and statesman, 1561–1626',
    tag: 'Empiricism',
    gloss:
      'Bacon wanted people to learn from experiments, not just old authorities. Knowing how nature works lets us do things we could not do before.',
    ask: 'What is something you can do now only because you learned how?',
  },
  {
    id: 'thoreau-desperation',
    kind: 'philosophy',
    text: 'The mass of men lead lives of quiet desperation.',
    author: 'Henry David Thoreau',
    work: 'Walden',
    year: '1854',
    about: 'American writer and philosopher, 1817–1862',
    tag: 'Transcendental',
    gloss:
      'Thoreau left town to live simply by a pond and see what mattered. He worried that people stay busy and unhappy without ever asking why.',
    ask: 'What would you stop doing if you stopped to ask why?',
  },
  {
    id: 'donne-island',
    kind: 'philosophy',
    text: 'No man is an island, entire of itself; every man is a piece of the continent, a part of the main.',
    author: 'John Donne',
    work: 'Devotions upon Emergent Occasions, XVII',
    year: '1624',
    about: 'English poet and preacher, 1572–1631',
    tag: 'Metaphysical',
    gloss:
      'Written while Donne was ill, hearing a funeral bell. No one is fully separate: what happens to any person touches the rest of us.',
    ask: 'Who would notice if you were gone for a week?',
  },
  {
    id: 'hamlet-thinking',
    kind: 'play',
    text: 'There is nothing either good or bad,\nbut thinking makes it so.',
    author: 'William Shakespeare',
    work: 'Hamlet, Act 2',
    year: 'c. 1600',
    about: 'English playwright, 1564–1616',
    tag: 'Tragedy',
    gloss:
      'Hamlet says a place is a prison only if you think of it as one. Our judgments colour what we see, an idea the Stoics would have liked.',
    ask: 'Has something you feared turned out fine once you saw it differently?',
  },
  {
    id: 'keats-urn',
    kind: 'poem',
    text: 'Beauty is truth, truth beauty,—\nthat is all\nYe know on earth, and all ye need to know.',
    author: 'John Keats',
    work: 'Ode on a Grecian Urn',
    year: '1819',
    about: 'English poet, 1795–1821',
    tag: 'Romantic poetry',
    gloss:
      'The urn is a silent, ancient object, and it “speaks” only these words. Critics still argue about what it means, which may be the point.',
    ask: 'Can something be true without being beautiful?',
  },
  {
    id: 'tennyson-ulysses',
    kind: 'poem',
    text: 'To strive, to seek, to find,\nand not to yield.',
    author: 'Alfred, Lord Tennyson',
    work: 'Ulysses',
    year: '1842',
    about: 'English poet, 1809–1892',
    tag: 'Victorian poetry',
    gloss:
      'An old, restless Ulysses refuses to retire from adventure. The line is a motto for never settling, even when you are no longer young.',
    ask: 'What are you still seeking?',
  },
  {
    id: 'dickinson-hope',
    kind: 'poem',
    text: 'Hope is the thing with feathers\nThat perches in the soul,',
    author: 'Emily Dickinson',
    work: 'Hope is the thing with feathers',
    year: '1891',
    about: 'American poet, 1830–1886',
    tag: 'American poetry',
    gloss:
      'Dickinson compares hope to a small bird that keeps singing in any weather and never asks for anything. The metaphor does the explaining.',
    ask: 'What does your hope look like if it were an animal?',
  },
  {
    id: 'blake-grain',
    kind: 'poem',
    text: 'To see a World in a Grain of Sand\nAnd a Heaven in a Wild Flower,\nHold Infinity in the palm of your hand\nAnd Eternity in an hour.',
    author: 'William Blake',
    work: 'Auguries of Innocence',
    year: 'c. 1803',
    about: 'English poet and painter, 1757–1827',
    tag: 'Romantic poetry',
    gloss:
      'Blake asks us to look so closely at something small that it opens onto something huge. Attention can turn the ordinary into wonder.',
    ask: 'What small thing have you really looked at today?',
  },
  {
    id: 'frost-road',
    kind: 'poem',
    text: 'Two roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.',
    author: 'Robert Frost',
    work: 'The Road Not Taken',
    year: '1916',
    about: 'American poet, 1874–1963',
    tag: 'American poetry',
    gloss:
      'Often read as a cheer for individuality, but earlier in the poem Frost says the two roads were worn “really about the same”. We tell stories about our choices afterwards.',
    ask: 'Which choice do you tell yourself a story about?',
  },
  {
    id: 'wordsworth-world',
    kind: 'poem',
    text: 'The world is too much with us; late and soon,\nGetting and spending, we lay waste our powers;',
    author: 'William Wordsworth',
    work: 'The World Is Too Much with Us',
    year: '1807',
    about: 'English poet, 1770–1850',
    tag: 'Romantic poetry',
    gloss:
      'Long before smartphones, Wordsworth worried that busyness and shopping cut us off from nature and from ourselves.',
    ask: 'When did you last spend an hour with nothing to get or spend?',
  },
  {
    id: 'whitman-multitudes',
    kind: 'poem',
    text: 'Do I contradict myself?\nVery well then I contradict myself,\n(I am large, I contain multitudes.)',
    author: 'Walt Whitman',
    work: 'Song of Myself',
    year: '1855',
    about: 'American poet, 1819–1892',
    tag: 'American poetry',
    gloss:
      'Whitman says a person does not have to be consistent. Holding conflicting feelings and ideas is part of being a whole, large self.',
    ask: 'What two things do you believe that seem to disagree?',
  },
  {
    id: 'shelley-ozymandias',
    kind: 'poem',
    text: 'My name is Ozymandias, King of Kings;\nLook on my Works, ye Mighty, and despair!',
    author: 'Percy Bysshe Shelley',
    work: 'Ozymandias',
    year: '1818',
    about: 'English poet, 1792–1822',
    tag: 'Romantic poetry',
    gloss:
      'A traveller finds a shattered statue in the desert with that boast carved on it, and nothing else remains. Power and fame fade; time wins.',
    ask: 'What do you want to leave behind that will not crumble?',
  },
  {
    id: 'kipling-if',
    kind: 'poem',
    text: 'If you can keep your head when all about you\nAre losing theirs and blaming it on you,',
    author: 'Rudyard Kipling',
    work: 'If—',
    year: '1910',
    about: 'British writer, 1865–1936',
    tag: 'Edwardian poetry',
    gloss:
      'A father’s list of what it takes to be steady: calm under pressure, honest when blamed, humble in success. It reads like advice to a patient swatter.',
    ask: 'When did you last keep calm while others did not?',
  },
];
