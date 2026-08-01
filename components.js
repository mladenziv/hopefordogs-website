// ===== ANALYTICS (Umami, cookieless — no cookie banner needed) =====
// Loaded once here so it covers every public page that includes components.js.
// Not present on the beheer admin bundle, so staff visits don't pollute stats.
(function () {
  if (window.__h4dUmamiLoaded) return;
  window.__h4dUmamiLoaded = true;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', '641dd53e-e827-4797-85fb-4878a2640b56');
  (document.head || document.documentElement).appendChild(s);
})();

// h4dTrack(name[, data]) — fire a Umami custom event if the tracker is loaded.
// Safe no-op when analytics is blocked or still loading.
function h4dTrack(name, data) {
  try {
    if (window.umami && typeof window.umami.track === 'function') {
      data ? window.umami.track(name, data) : window.umami.track(name);
    }
  } catch (e) {}
}
window.h4dTrack = h4dTrack;

// ===== TRANSLATION SYSTEM =====
var H4D_I18N = {
  // --- Nav ---
  'nav.home':        { nl: 'Home',        de: 'Startseite',   en: 'Home' },
  'nav.honden':      { nl: 'Honden',      de: 'Hunde',        en: 'Dogs' },
  'nav.overons':     { nl: 'Over ons',    de: 'Über uns',     en: 'About us' },
  'nav.adoptie':     { nl: 'Adoptie',     de: 'Adoption',     en: 'Adoption' },
  'nav.ervaringen':  { nl: 'Ervaringen',  de: 'Erfahrungen',  en: 'Experiences' },
  'nav.nieuws':      { nl: 'Nieuws',      de: 'Neuigkeiten',  en: 'News' },
  'nav.contact':     { nl: 'Contact',     de: 'Kontakt',      en: 'Contact' },
  'contact.hero':          { nl: 'Neem contact op', de: 'Kontakt aufnehmen', en: 'Get in touch' },
  'contact.hero.sub':      { nl: 'Heb je een vraag over adoptie, ons werk of wil je helpen? Stuur ons een bericht — we reageren zo snel mogelijk.', de: 'Hast du eine Frage zur Adoption, zu unserer Arbeit oder möchtest du helfen? Schreib uns — wir antworten so schnell wie möglich.', en: 'Have a question about adoption, our work, or want to help? Send us a message — we’ll reply as soon as we can.' },
  'contact.form.title':    { nl: 'Stuur ons een bericht', de: 'Schreib uns eine Nachricht', en: 'Send us a message' },
  'contact.naam':          { nl: 'Naam', de: 'Name', en: 'Name' },
  'contact.email':         { nl: 'E-mailadres', de: 'E-Mail-Adresse', en: 'Email address' },
  'contact.telefoon':      { nl: 'Telefoonnummer (optioneel)', de: 'Telefonnummer (optional)', en: 'Phone number (optional)' },
  'contact.onderwerp':     { nl: 'Onderwerp', de: 'Betreff', en: 'Subject' },
  'contact.bericht':       { nl: 'Bericht', de: 'Nachricht', en: 'Message' },
  'contact.verstuur':      { nl: 'Verstuur bericht', de: 'Nachricht senden', en: 'Send message' },
  'contact.success.title': { nl: 'Bericht verstuurd!', de: 'Nachricht gesendet!', en: 'Message sent!' },
  'contact.success.msg':   { nl: 'Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.', de: 'Danke für deine Nachricht. Wir melden uns so schnell wie möglich.', en: 'Thanks for your message. We’ll get back to you as soon as possible.' },
  'contact.details.title': { nl: 'Vind ons hier', de: 'Finde uns hier', en: 'Find us here' },
  'contact.details.sub':   { nl: 'Liever mailen of via social media? Je vindt ons hier.', de: 'Lieber per E-Mail oder Social Media? Hier findest du uns.', en: 'Prefer email or social media? You’ll find us here.' },
  'contact.fb.msg':        { nl: 'Liever snel antwoord? Stuur ons een berichtje op Facebook — daar reageren we meestal sneller.', de: 'Lieber schnell eine Antwort? Schreib uns eine Nachricht auf Facebook — dort antworten wir meist schneller.', en: 'Want a faster reply? Send us a message on Facebook — we usually respond quicker there.' },
  'contact.fb.button':     { nl: 'Bericht ons op Facebook', de: 'Nachricht auf Facebook', en: 'Message us on Facebook' },
  'nav.doneer':      { nl: 'Doneer nu',   de: 'Jetzt spenden', en: 'Donate now' },
  'nav.doneer.short':{ nl: 'Doneer',     de: 'Spenden',      en: 'Donate' },
  'nav.beheer':      { nl: 'Beheer',      de: 'Verwaltung',   en: 'Admin' },

  // --- Footer ---
  'footer.tagline':     { nl: 'Wij zijn een non-profit organisatie die zich inzet voor een beter bestaan voor zwerfhonden in Bosni\u00EB en Servi\u00EB.', de: 'Wir sind eine gemeinn\u00FCtzige Organisation, die sich f\u00FCr ein besseres Leben f\u00FCr Stra\u00DFenhunde in Bosnien und Serbien einsetzt.', en: 'We are a non-profit organization dedicated to a better life for stray dogs in Bosnia and Serbia.' },
  'footer.paginas':     { nl: "Pagina\u2019s", de: 'Seiten',     en: 'Pages' },
  'footer.helpons':     { nl: 'Help ons',      de: 'Hilf uns',   en: 'Help us' },
  'footer.contact':     { nl: 'Contact',       de: 'Kontakt',    en: 'Contact' },
  'footer.doneer':      { nl: 'Doneer',        de: 'Spenden',    en: 'Donate' },
  'footer.privacy':     { nl: 'Privacybeleid', de: 'Datenschutz', en: 'Privacy Policy' },
  'footer.adopteer':    { nl: 'Adopteer',      de: 'Adoptieren', en: 'Adopt' },
  'footer.vrijwilliger':{ nl: 'Vrijwilliger worden', de: 'Freiwilliger werden', en: 'Become a volunteer' },
  'footer.copyright':   { nl: '\u00A9 ' + new Date().getFullYear() + ' Hope for Dogs. Alle rechten voorbehouden.', de: '\u00A9 ' + new Date().getFullYear() + ' Hope for Dogs. Alle Rechte vorbehalten.', en: '\u00A9 ' + new Date().getFullYear() + ' Hope for Dogs. All rights reserved.' },

  // --- Index: Hero ---
  'index.hero.badge':    { nl: 'non-profitorganisatie', de: 'Gemeinn\u00FCtzige Organisation', en: 'non-profit organization' },
  'index.hero.title':    { nl: 'Waar hoop een thuis vindt', de: 'Wo Hoffnung ein Zuhause findet', en: 'Where hope finds a home' },
  'index.hero.subtitle': { nl: 'Wij zijn een non-profitorganisatie, bestaande uit een handjevol vrijwilligers uit Nederland, Belgi\u00EB, Servi\u00EB en Bosni\u00EB. Samen bundelen we onze krachten om de talloze zwerfhonden een beter leven te geven.', de: 'Wir sind eine gemeinn\u00FCtzige Organisation aus einer Handvoll Freiwilliger aus den Niederlanden, Belgien, Serbien und Bosnien. Gemeinsam b\u00FCndeln wir unsere Kr\u00E4fte, um den zahllosen Stra\u00DFenhunden ein besseres Leben zu geben.', en: 'We are a non-profit organization made up of a handful of volunteers from the Netherlands, Belgium, Serbia and Bosnia. Together we join forces to give the countless stray dogs a better life.' },
  'index.hero.btn1':     { nl: 'Ontdek onze missie', de: 'Entdecke unsere Mission', en: 'Discover our mission' },
  'index.hero.btn2':     { nl: 'Onze honden',   de: 'Unsere Hunde',     en: 'Our dogs' },
  'index.hero.social.fb':      { nl: 'Facebook', de: 'Facebook', en: 'Facebook' },
  'index.hero.social.fb.desc': { nl: '6.600+ Volgers', de: '6.600+ Follower', en: '6,600+ Followers' },
  'index.hero.social.ig':      { nl: 'Instagram', de: 'Instagram', en: 'Instagram' },
  'index.hero.social.ig.desc': { nl: '1.750+ Followers', de: '1.750+ Follower', en: '1,750+ Followers' },
  'index.hero.social.tt':      { nl: 'TikTok', de: 'TikTok', en: 'TikTok' },
  'index.hero.social.tt.desc': { nl: '64+ Followers', de: '64+ Follower', en: '64+ Followers' },

  // --- Index: Impact stats ---
  'index.stat.rescued':    { nl: 'Honden gered',              de: 'Hunde gerettet',               en: 'Dogs rescued' },
  'index.stat.incare':     { nl: 'Honden in onze zorg',       de: 'Hunde in unserer Obhut',       en: 'Dogs in our care' },
  'index.stat.sterilized': { nl: 'Sterilisaties uitgevoerd',  de: 'Sterilisationen durchgef\u00FChrt', en: 'Sterilizations performed' },
  'index.stat.stray':      { nl: 'Zwerfhonden in de regio',   de: 'Stra\u00DFenhunde in der Region',  en: 'Stray dogs in the region' },
  'index.stat.subsidy':    { nl: 'Overheidssubsidie',         de: 'Staatliche Subvention',        en: 'Government subsidy' },

  // --- Index: Dogs section ---
  'index.dogs.title':    { nl: 'Op zoek naar een warm huis', de: 'Auf der Suche nach einem warmen Zuhause', en: 'Looking for a loving home' },
  'index.dogs.subtitle': { nl: 'Elk van deze honden is gered van de straat, medisch behandeld en klaar voor een nieuw begin.', de: 'Jeder dieser Hunde wurde von der Stra\u00DFe gerettet, medizinisch versorgt und ist bereit f\u00FCr einen Neuanfang.', en: 'Each of these dogs was rescued from the streets, medically treated, and ready for a fresh start.' },
  'index.dogs.btn':      { nl: 'Bekijk alle honden', de: 'Alle Hunde ansehen', en: 'View all dogs' },
  'index.dogs.btn2':     { nl: 'Meer over adopteren', de: 'Mehr \u00FCber Adoption', en: 'More about adoption' },

  // --- Index: Crisis section ---
  'index.crisis.title':    { nl: 'Een crisis die niemand ziet', de: 'Eine Krise, die niemand sieht', en: 'A crisis nobody sees' },
  'index.crisis.title.red':  { nl: 'EEN CRISIS', de: 'EINE KRISE', en: 'A CRISIS' },
  'index.crisis.title.muted': { nl: 'DIE NIEMAND ZIET', de: 'DIE NIEMAND SIEHT', en: 'NOBODY SEES' },
  'index.crisis.datalabel':   { nl: 'De data spreekt voor zich', de: 'Die Daten sprechen f\u00FCr sich', en: 'The data speaks for itself' },
  'index.crisis.subtitle': { nl: 'Wat voor velen onzichtbaar is, is voor hen dagelijkse overleving. Honger, verwondingen en eindeloze voortplanting houden de cyclus van lijden in stand.', de: 'Was f\u00FCr viele unsichtbar ist, ist f\u00FCr sie t\u00E4gliches \u00DCberleben. Hunger, Verletzungen und endlose Fortpflanzung halten den Kreislauf des Leidens aufrecht.', en: 'What is invisible to many is daily survival for them. Hunger, injuries, and endless breeding keep the cycle of suffering going.' },
  'index.crisis.stat1':    { nl: 'Zwerfhonden in de regio',        de: 'Stra\u00DFenhunde in der Region',    en: 'Stray dogs in the region' },
  'index.crisis.stat2':    { nl: 'Overlevingskans van pups',       de: '\u00DCberlebensrate von Welpen',      en: 'Puppy survival rate' },
  'index.crisis.stat3':    { nl: 'Levensverwachting',              de: 'Lebenserwartung',                     en: 'Life expectancy' },
  'index.crisis.stat4':    { nl: 'Sterft in het verkeer',          de: 'Stirbt im Stra\u00DFenverkehr',      en: 'Dies in traffic' },
  'index.crisis.stat5':    { nl: 'Overheidssubsidie',              de: 'Staatliche Subvention',               en: 'Government subsidy' },
  'index.crisis.reveal':   { nl: 'Onthul gevoelige beelden', de: 'Sensible Bilder enth\u00FCllen', en: 'Reveal sensitive images' },
  'index.crisis.hide':     { nl: 'Verberg gevoelige beelden', de: 'Sensible Bilder verbergen', en: 'Hide sensitive images' },

  // --- Index: Social section ---
  'index.social.title':    { nl: 'Een kijkje in ons leven', de: 'Ein Blick in unser Leben', en: 'A glimpse into our life' },
  'index.social.follow':   { nl: 'Volg ons', de: 'Folge uns', en: 'Follow us' },
  'index.social.subtitle': { nl: 'Blijf op de hoogte van onze reddingen en updates uit het asiel.', de: 'Bleiben Sie auf dem Laufenden \u00FCber unsere Rettungen und Updates aus dem Tierheim.', en: 'Stay up to date with our rescues and shelter updates.' },

  // --- Index: Pillars section ---
  'index.pillars.title':    { nl: 'Wat wij doen', de: 'Was wir tun', en: 'What we do' },
  'index.pillars.subtitle': { nl: 'Wij ontvangen geen cent van de overheid. Alles wat we doen wordt mogelijk gemaakt door donaties en ons eigen geld. Zo doorbreken we de cyclus \u2014 hond voor hond.', de: 'Wir erhalten keinen Cent vom Staat. Alles, was wir tun, wird durch Spenden und unser eigenes Geld erm\u00F6glicht. So durchbrechen wir den Kreislauf \u2014 Hund f\u00FCr Hund.', en: 'We receive no government funding. Everything we do is made possible by donations and our own money. This is how we break the cycle \u2014 dog by dog.' },
  'index.pillar.rescue':    { nl: 'Redden', de: 'Retten', en: 'Rescue' },
  'index.pillar.rescue.d':  { nl: 'We halen honden van de straat, uit gevaarlijke situaties en van plekken waar niemand naar ze omkijkt.', de: 'Wir holen Hunde von der Stra\u00DFe, aus gef\u00E4hrlichen Situationen und von Orten, wo sich niemand um sie k\u00FCmmert.', en: 'We rescue dogs from the streets, dangerous situations, and places where nobody cares for them.' },
  'index.pillar.medical':   { nl: 'Medische zorg', de: 'Medizinische Versorgung', en: 'Medical care' },
  'index.pillar.medical.d': { nl: 'Elke hond krijgt direct diergeneeskundige zorg, vaccinaties en behandeling voor ziektes of verwondingen.', de: 'Jeder Hund erh\u00E4lt sofortige tier\u00E4rztliche Versorgung, Impfungen und Behandlung von Krankheiten oder Verletzungen.', en: 'Every dog receives immediate veterinary care, vaccinations, and treatment for illness or injury.' },
  'index.pillar.sterilize':   { nl: 'Steriliseren', de: 'Sterilisieren', en: 'Sterilize' },
  'index.pillar.sterilize.d': { nl: 'We steriliseren en castreren zoveel mogelijk honden om de eindeloze cyclus van overbevolking te doorbreken.', de: 'Wir sterilisieren und kastrieren so viele Hunde wie m\u00F6glich, um den endlosen Kreislauf der \u00DCberpopulation zu durchbrechen.', en: 'We sterilize and neuter as many dogs as possible to break the endless cycle of overpopulation.' },
  'index.pillar.rehome':   { nl: 'Herplaatsen', de: 'Vermitteln', en: 'Rehome' },
  'index.pillar.rehome.d': { nl: 'We zoeken een warm, vast thuis \u2014 in Nederland of dichter bij huis. Elke adoptie maakt plek vrij voor de volgende.', de: 'Wir suchen ein warmes, festes Zuhause \u2014 in den Niederlanden oder n\u00E4her. Jede Adoption macht Platz f\u00FCr den n\u00E4chsten.', en: 'We find a warm, permanent home \u2014 in the Netherlands or closer by. Every adoption makes room for the next one.' },

  // --- Index: Team section ---
  'index.team.title':    { nl: 'Onze vrijwilligers', de: 'Unsere Freiwilligen', en: 'Our volunteers' },
  'index.team.subtitle': { nl: 'Ons team van vrijwilligers uit Nederland, Servi\u00EB en Bosni\u00EB zet zich dag en nacht in voor de zwerfhonden. Samen zijn we hun stem.', de: 'Unser Team von Freiwilligen aus den Niederlanden, Serbien und Bosnien setzt sich Tag und Nacht f\u00FCr die Stra\u00DFenhunde ein. Zusammen sind wir ihre Stimme.', en: 'Our team of volunteers from the Netherlands, Serbia, and Bosnia works day and night for the stray dogs. Together, we are their voice.' },

  // --- Index: CTA / Donation section ---
  'index.cta.title':    { nl: 'Jouw bijdrage maakt het verschil', de: 'Dein Beitrag macht den Unterschied', en: 'Your contribution makes the difference' },
  'index.cta.subtitle': { nl: 'Wij ontvangen geen overheidssteun. Elke euro die we besteden komt van donateurs en uit eigen zak.', de: 'Wir erhalten keine staatliche Unterst\u00FCtzung. Jeder Euro kommt von Spendern und aus eigener Tasche.', en: 'We receive no government support. Every euro we spend comes from donors and our own pockets.' },
  'index.cta.d10':  { nl: 'Voer voor een hond voor een week',          de: 'Futter f\u00FCr einen Hund f\u00FCr eine Woche',       en: 'Food for a dog for one week' },
  'index.cta.d25':  { nl: 'Een zak hondenvoer van 18kg',      de: 'Ein Sack Hundefutter von 18 kg',     en: 'An 18kg bag of dog food' },
  'index.cta.d50':  { nl: 'Sterilisatie van een zwerfhond',            de: 'Sterilisation eines Stra\u00DFenhundes',                en: 'Sterilization of a stray dog' },
  'index.cta.d100': { nl: 'Noodoperatie voor een gewonde hond',        de: 'Notoperation f\u00FCr einen verletzten Hund',           en: 'Emergency surgery for an injured dog' },
  'index.cta.d200': { nl: 'Volledige behandeling en opvang',           de: 'Vollst\u00E4ndige Behandlung und Unterbringung',        en: 'Complete treatment and shelter' },
  'cta.select':     { nl: 'Selecteer',    de: 'Ausw\u00E4hlen',  en: 'Select' },
  'cta.eigenbedrag': { nl: 'Kies je eigen bedrag', de: 'Eigenen Betrag w\u00E4hlen', en: 'Choose your own amount' },
  'cta.mollie':     { nl: 'Veilig betalen via Mollie', de: 'Sicher bezahlen \u00FCber Mollie', en: 'Secure payment via Mollie' },

  // --- Other page hero headings ---
  'honden.hero':     { nl: 'Lieverds op zoek naar een huisje', de: 'Lieblinge auf der Suche nach einem Zuhause', en: 'Sweethearts looking for a home' },
  'honden.dotd.title': { nl: 'Dog of the day', de: 'Dog of the day', en: 'Dog of the day' },
  'honden.dotd.sub': { nl: 'Elke dag staat een ander hondje in het zonnetje.', de: 'Jeden Tag steht ein anderer Hund im Rampenlicht.', en: 'Every day a different dog gets its moment in the sun.' },
  'honden.adopted':  { nl: 'Whoohoo, wij zijn geadopteerd!', de: 'Juhu, wir sind adoptiert!', en: 'Woohoo, we\u2019ve been adopted!' },
  'honden.filter.alle':      { nl: 'Alle honden',     de: 'Alle Hunde',       en: 'All dogs' },
  'honden.filter.alle.short':      { nl: 'Alle',            de: 'Alle',             en: 'All' },
  'honden.filter.onsasiel':  { nl: 'Ons asiel',       de: 'Unser Tierheim',   en: 'Our shelter' },
  'honden.filter.gemeente':  { nl: 'Gemeente asiel',  de: 'Gemeinde-Tierheim', en: 'Municipal shelter' },
  'honden.filter.gemeente.short':  { nl: 'Gemeente',        de: 'Gemeinde',         en: 'Municipal' },
  'honden.gender.reu':       { nl: 'Reu',   de: 'Rüde',    en: 'Male' },
  'honden.gender.teef':      { nl: 'Teef',  de: 'Hündin',  en: 'Female' },
  'honden.search.placeholder': { nl: 'Zoek op naam of ras…', de: 'Nach Name oder Rasse suchen…', en: 'Search by name or breed…' },
  'honden.filter.opvang':    { nl: 'In opvang',       de: 'In Pflege',        en: 'In foster care' },
  'honden.filter.opvang.short':    { nl: 'Opvang',          de: 'Pflege',           en: 'Foster' },
  'honden.meerinfo':         { nl: 'Meer info',       de: 'Mehr Infos',       en: 'More info' },
  'honden.cta.title':    { nl: 'Wil jij ook helpen?', de: 'M\u00F6chtest du auch helfen?', en: 'Want to help too?' },
  'honden.cta.doneer':   { nl: 'Doneer nu',       de: 'Jetzt spenden',      en: 'Donate now' },
  'honden.cta.contact':  { nl: 'Neem contact op',  de: 'Kontaktiere uns',   en: 'Get in touch' },

  'overons.hero':    { nl: 'Een klein team. Een grote missie.', de: 'Ein kleines Team. Eine große Mission.', en: 'A small team. A big mission.' },
  'adoptie.hero':    { nl: 'Adopteer een buitenlandse hond en geef hoop een thuis', de: 'Adoptiere einen Hund aus dem Ausland und schenke Hoffnung ein Zuhause', en: 'Adopt a dog from abroad and give hope a home' },
  'ervaringen.hero': { nl: 'Van straat naar warm nestje', de: 'Von der Stra\u00DFe ins warme Nest', en: 'From street to loving home' },
  'nieuws.hero':     { nl: 'Actueel', de: 'Aktuell', en: 'News' },
  'doneer.hero':     { nl: 'Help onze honden', de: 'Hilf unseren Hunden', en: 'Help our dogs' },

  // --- Index: Before & After ---
  'ba.label':  { nl: 'The before & after', de: 'Das Vorher & Nachher', en: 'The before & after' },
  'ba.next':   { nl: 'Volgende',    de: 'Weiter', en: 'Next' },
  'ba.playvideo': { nl: 'Video afspelen', de: 'Video abspielen', en: 'Play video' },
  'ba.playvideo.short': { nl: 'Video', de: 'Video', en: 'Video' },
  'ba.before': { nl: 'Before', de: 'Vorher', en: 'Before' },
  'ba.after':  { nl: 'After',  de: 'Nachher', en: 'After' },

  // --- Beheer page ---
  'beheer.hero':     { nl: 'Beheer', de: 'Verwaltung', en: 'Admin' },
  'beheer.hero.sub': { nl: 'Before & after verhalen beheren', de: 'Vorher & Nachher Geschichten verwalten', en: 'Manage before & after stories' },

  // --- Honden page ---
  'honden.hero.sub':    { nl: 'Al onze adoptiehonden zijn straathonden uit Bosni\u00EB en Servi\u00EB, medisch behandeld en klaar voor een nieuw thuis. Sommige verblijven nog in ons asiel, andere al in een opvanggezin in Nederland of Belgi\u00EB.', de: 'Alle unsere Adoptionshunde sind Stra\u00DFenhunde aus Bosnien und Serbien, medizinisch versorgt und bereit f\u00FCr ein neues Zuhause. Einige leben noch in unserem Tierheim, andere schon in einer Pflegefamilie in den Niederlanden oder Belgien.', en: 'All our adoptable dogs are street dogs from Bosnia and Serbia, medically treated and ready for a new home. Some are still in our shelter, others already with a foster family in the Netherlands or Belgium.' },
  'honden.gemeente.desc': { nl: 'Naast ons eigen asiel helpen wij ook de honden in het gemeente asiel. De omstandigheden daar zijn helaas erg slecht en de honden hebben dringend hulp nodig. Wij zetten ons in om ook deze honden een betere toekomst te geven.', de: 'Neben unserem eigenen Tierheim helfen wir auch den Hunden im st\u00E4dtischen Tierheim. Die Bedingungen dort sind leider sehr schlecht und die Hunde brauchen dringend Hilfe. Wir setzen uns daf\u00FCr ein, auch diesen Hunden eine bessere Zukunft zu geben.', en: 'Besides our own shelter, we also help the dogs in the municipal shelter. The conditions there are unfortunately very poor and the dogs urgently need help. We are committed to giving these dogs a better future too.' },
  'honden.adopted.sub': { nl: 'Deze honden hebben hun forever home gevonden. Wij zijn zo blij voor ze!', de: 'Diese Hunde haben ihr Zuhause f\u00FCr immer gefunden. Wir sind so gl\u00FCcklich f\u00FCr sie!', en: 'These dogs have found their forever home. We are so happy for them!' },
  'honden.cta.sub':     { nl: 'Elke donatie, hoe klein ook, maakt een groot verschil voor deze honden. Je kunt ook helpen door een hond te adopteren en hem of haar een liefdevolle thuis te geven.', de: 'Jede Spende, egal wie klein, macht einen gro\u00DFen Unterschied f\u00FCr diese Hunde. Sie k\u00F6nnen auch helfen, indem Sie einen Hund adoptieren und ihm ein liebevolles Zuhause geben.', en: 'Every donation, no matter how small, makes a big difference for these dogs. You can also help by adopting a dog and giving them a loving home.' },
  'honden.geadopteerd': { nl: 'Geadopteerd', de: 'Adoptiert', en: 'Adopted' },

  // --- Over ons page ---
  'overons.hero.sub':   { nl: 'We zetten ons in om straathonden een beter bestaan te geven', de: 'Wir setzen uns daf\u00FCr ein, Stra\u00DFenhunden ein besseres Leben zu geben', en: 'We work to give stray dogs a better life' },
  'overons.leefomstandigheden': { nl: 'Er is geen overheid die ingrijpt. Geen vangnetten. Geen financi\u00EBle steun. Alleen mensen zoals wij \u2014 en zoals jij.', de: 'Es gibt keine Regierung, die eingreift. Keine Sicherheitsnetze. Keine finanzielle Unterst\u00FCtzung. Nur Menschen wie wir \u2014 und wie Sie.', en: 'There is no government stepping in. No safety nets. No financial support. Just people like us \u2014 and like you.' },
  'overons.hart':       { nl: 'Ons hart, onze drijfveer', de: 'Unser Herz, unser Antrieb', en: 'Our heart, our drive' },
  'overons.hart.p1':    { nl: 'Hope for Dogs draait volledig op een klein team van vrijwilligers. We hebben geen grote organisatie achter ons en geen vaste subsidies die alles betalen. Alles wat we doen, doen we naast ons werk, gezin en andere verplichtingen. Omdat we vinden dat deze honden een kans verdienen.', de: 'Hope for Dogs l\u00E4uft vollst\u00E4ndig auf einem kleinen Team von Freiwilligen. Wir haben keine gro\u00DFe Organisation hinter uns und keine festen Subventionen, die alles bezahlen. Alles was wir tun, tun wir neben unserer Arbeit, Familie und anderen Verpflichtungen. Weil wir finden, dass diese Hunde eine Chance verdienen.', en: 'Hope for Dogs runs entirely on a small team of volunteers. We have no large organization behind us and no fixed subsidies that cover everything. Everything we do, we do alongside our work, family and other commitments. Because we believe these dogs deserve a chance.' },
  'overons.hart.p2':    { nl: 'We proberen het leven van straathonden in Bosni\u00EB stap voor stap beter te maken. Op welke manier dan ook, op micro en ook macro niveau. Misschien lijkt het een druppel op een gloeiende plaat, maar dankzij de steun van onze vrijwilligers, donateurs en volgers hebben we samen al ontzettend veel honden kunnen helpen. En daar zijn we nog lang niet klaar mee.', de: 'Wir versuchen, das Leben der Stra\u00DFenhunde in Bosnien Schritt f\u00FCr Schritt zu verbessern. Auf welche Weise auch immer, auf Mikro- und auch auf Makroebene. Vielleicht scheint es ein Tropfen auf den hei\u00DFen Stein, aber dank der Unterst\u00FCtzung unserer Freiwilligen, Spender und Follower konnten wir gemeinsam schon unglaublich vielen Hunden helfen. Und damit sind wir noch lange nicht fertig.', en: 'We try to make the lives of stray dogs in Bosnia better step by step. In any way we can, on a micro and also a macro level. It may seem like a drop in the ocean, but thanks to the support of our volunteers, donors and followers we have already been able to help an incredible number of dogs together. And we are far from done.' },
  'overons.hart.p3':    { nl: 'We proberen realistisch te blijven. We kunnen niet alle honden redden \u2014 hoe graag we dat ook zouden willen. Maar voor de honden die bij ons terechtkomen, doen we alles wat binnen onze mogelijkheden ligt.', de: 'Wir versuchen realistisch zu bleiben. Wir k\u00F6nnen nicht alle Hunde retten \u2014 so gerne wir das auch w\u00FCrden. Aber f\u00FCr die Hunde, die zu uns kommen, tun wir alles, was in unserer Macht steht.', en: 'We try to stay realistic. We can\u2019t save all dogs \u2014 as much as we\u2019d like to. But for the dogs that come to us, we do everything within our power.' },
  'overons.realiteit':  { nl: 'De realiteit in de regio', de: 'Die Realit\u00E4t in der Region', en: 'The reality in the region' },
  'overons.realiteit.p1': { nl: 'In Bosni\u00EB en Servi\u00EB leven naar schatting 100.000 tot 200.000 zwerfhonden. Ze worden geboren op stoepen, in verlaten gebouwen en langs snelwegen. Veel zijn ooit huisdier geweest \u2014 gedumpt toen ze niet meer gewenst waren.', de: 'In Bosnien und Serbien leben sch\u00E4tzungsweise 100.000 bis 200.000 Stra\u00DFenhunde. Sie werden auf Gehwegen, in verlassenen Geb\u00E4uden und entlang von Autobahnen geboren. Viele waren einst Haustiere \u2014 ausgesetzt, als sie nicht mehr erw\u00FCnscht waren.', en: 'An estimated 100,000 to 200,000 stray dogs live in Bosnia and Serbia. They are born on sidewalks, in abandoned buildings, and along highways. Many were once pets \u2014 dumped when they were no longer wanted.' },
  'overons.realiteit.p2': { nl: 'Zonder structurele sterilisatieprogramma\u2019s groeit het probleem exponentieel. Een ongecastreerde teef kan in haar leven tot 60 pups krijgen. Zonder ingrijpen is er geen einde aan het lijden.', de: 'Ohne strukturelle Sterilisationsprogramme w\u00E4chst das Problem exponentiell. Eine unkastrierte H\u00FCndin kann in ihrem Leben bis zu 60 Welpen bekommen. Ohne Eingreifen gibt es kein Ende des Leidens.', en: 'Without structural sterilization programs, the problem grows exponentially. An unspayed female can have up to 60 puppies in her lifetime. Without intervention, there is no end to the suffering.' },
  'overons.realiteit.p3': { nl: 'Er is geen overheid die ingrijpt. Geen vangnetten. Geen financi\u00EBle steun. Alleen mensen zoals wij \u2014 en zoals jij.', de: 'Es gibt keine Regierung, die eingreift. Keine Sicherheitsnetze. Keine finanzielle Unterst\u00FCtzung. Nur Menschen wie wir \u2014 und wie Sie.', en: 'There is no government stepping in. No safety nets. No financial support. Just people like us \u2014 and like you.' },
  'overons.stat1.label':  { nl: 'Zwerfhonden in Bosni\u00EB en Servi\u00EB', de: 'Stra\u00DFenhunde in Bosnien und Serbien', en: 'Stray dogs in Bosnia and Serbia' },
  'overons.stat2.label':  { nl: 'Pups per ongecastreerde teef in haar leven', de: 'Welpen pro unkastrierter H\u00FCndin in ihrem Leben', en: 'Puppies per unspayed female in her lifetime' },
  'overons.stat3.label':  { nl: 'Overheidssubsidie die wij ontvangen', de: 'Staatliche Subvention, die wir erhalten', en: 'Government subsidy we receive' },
  'overons.asiel':        { nl: 'Het asiel', de: 'Das Tierheim', en: 'The shelter' },
  'overons.asiel.p1':     { nl: 'Ons asiel is gelegen in de grensstreek van Bosni\u00EB en Servi\u00EB. In het asiel zetten we ons dagelijks in om de honden de aandacht te geven die ze nodig hebben. Ze zitten gelukkig niet alleen in kennels \u2014 we hebben een grote binnentuin waar ze vrij rond kunnen rennen en met elkaar kunnen spelen.', de: 'Unser Tierheim liegt in der Grenzregion von Bosnien und Serbien. Im Tierheim setzen wir uns t\u00E4glich daf\u00FCr ein, den Hunden die Aufmerksamkeit zu geben, die sie brauchen. Sie sitzen gl\u00FCcklicherweise nicht nur in Zwingern \u2014 wir haben einen gro\u00DFen Innenhof, in dem sie frei herumlaufen und miteinander spielen k\u00F6nnen.', en: 'Our shelter is located in the border region of Bosnia and Serbia. At the shelter, we work daily to give the dogs the attention they need. Fortunately, they don\u2019t just stay in kennels \u2014 we have a large courtyard where they can run freely and play with each other.' },
  'overons.asiel.honden':   { nl: 'Honden', de: 'Hunde', en: 'Dogs' },
  'overons.asiel.kennels':  { nl: 'Kennels', de: 'Zwinger', en: 'Kennels' },
  'overons.asiel.buiten':   { nl: 'Honden buiten de poort', de: 'Hunde au\u00DFerhalb des Tores', en: 'Dogs outside the gate' },
  'overons.asiel.p2':     { nl: 'Onze kennels zitten vaak overvol. De meeste honden bij ons zijn gevonden langs de weg, op de vuilnisbelt of bij bedrijfsterreinen. Het is als dweilen met de kraan open \u2014 maar we doen het met heel veel liefde. De transformatie van een ziek, zwak zwerfhondje naar een hond met een liefdevol thuis maakt alles de moeite waard.', de: 'Unsere Zwinger sind oft \u00FCberf\u00FCllt. Die meisten Hunde bei uns wurden entlang der Stra\u00DFe, auf der M\u00FClldeponie oder bei Industriegel\u00E4nden gefunden. Es ist wie Wasser sch\u00F6pfen mit einem Sieb \u2014 aber wir tun es mit sehr viel Liebe. Die Verwandlung von einem kranken, schwachen Stra\u00DFenhund zu einem Hund mit einem liebevollen Zuhause macht alles lohnenswert.', en: 'Our kennels are often overcrowded. Most dogs with us were found along roads, at dumpsites, or near industrial areas. It\u2019s like mopping with the tap running \u2014 but we do it with so much love. The transformation from a sick, weak stray to a dog with a loving home makes it all worthwhile.' },
  'overons.timeline':       { nl: 'Van toen tot nu', de: 'Von damals bis heute', en: 'From then to now' },
  'overons.timeline.sub':   { nl: 'Beetje bij beetje kunnen we het asiel verbeteren, we zijn er nog lang niet maar het is nu al een wereld van verschil.', de: 'St\u00FCck f\u00FCr St\u00FCck k\u00F6nnen wir das Tierheim verbessern. Wir sind noch lange nicht am Ziel, aber es ist jetzt schon ein himmelweiter Unterschied.', en: 'Little by little we can improve the shelter. We still have a long way to go, but it already makes a world of difference.' },
  'overons.timeline.toen':     { nl: 'Het begon in 2021', de: 'Es begann 2021', en: 'It started in 2021' },
  'overons.timeline.toen.p1':  { nl: 'Slavica begon als vrijwilliger op een klein stuk grond naast het gemeentelijke asiel. De gemeente stelde het ter beschikking aan een groep vrijwilligers, als eerste stap naar betere samenwerking. Het stelde weinig voor, maar het was een begin.', de: 'Slavica begann als Freiwillige auf einem kleinen St\u00FCck Land neben dem st\u00E4dtischen Tierheim. Die Gemeinde stellte es einer Gruppe Freiwilliger zur Verf\u00FCgung, als ersten Schritt zu einer besseren Zusammenarbeit. Es war nicht viel, aber es war ein Anfang.', en: 'Slavica started as a volunteer on a small piece of land next to the municipal shelter. The municipality made it available to a group of volunteers as a first step towards better cooperation. It wasn\u2019t much, but it was a start.' },
  'overons.timeline.toen.p2':  { nl: 'Er was geen elektriciteit en geen stromend water. \u2019s Avonds gebruikten we de koplampen van de auto. In de winter bevroor de waterpomp regelmatig. We sleepten emmers en flessen water aan, zwaar en ijskoud, omdat het moest.', de: 'Es gab keinen Strom und kein flie\u00DFendes Wasser. Abends benutzten wir die Autoscheinwerfer. Im Winter fror die Wasserpumpe regelm\u00E4\u00DFig ein. Wir schleppten Eimer und Flaschen Wasser herbei, schwer und eiskalt, weil es sein musste.', en: 'There was no electricity and no running water. In the evening we used the car headlights. In winter the water pump froze regularly. We hauled buckets and bottles of water, heavy and ice-cold, because it had to be done.' },
  'overons.timeline.nu':       { nl: 'En nu zijn we hier', de: 'Und jetzt sind wir hier', en: 'And now we are here' },
  'overons.timeline.nu.p1':    { nl: 'Vandaag is het asiel uitgegroeid tot een veilige, warme plek voor onze honden. Het terrein is groter, het oude gedeelte is opgeknapt en dankzij de hulp van velen hebben we kunnen uitbreiden.', de: 'Heute ist das Tierheim zu einem sicheren, warmen Ort f\u00FCr unsere Hunde herangewachsen. Das Gel\u00E4nde ist gr\u00F6\u00DFer, der alte Teil wurde renoviert und dank der Hilfe vieler konnten wir erweitern.', en: 'Today the shelter has grown into a safe, warm place for our dogs. The grounds are larger, the old section has been renovated, and thanks to the help of many we have been able to expand.' },
  'overons.timeline.nu.p2':    { nl: 'Er is nu een ruime speelweide waar honden vrij kunnen rennen. De nieuwe kennels zijn steviger, hygi\u00EBnischer en comfortabeler. We hebben stromend water, stroom en een infrastructuur die het dagelijkse werk draaglijker maakt.', de: 'Es gibt jetzt eine ger\u00E4umige Spielwiese, auf der die Hunde frei laufen k\u00F6nnen. Die neuen Zwinger sind stabiler, hygienischer und komfortabler. Wir haben flie\u00DFendes Wasser, Strom und eine Infrastruktur, die die t\u00E4gliche Arbeit ertr\u00E4glicher macht.', en: 'There is now a spacious play meadow where dogs can run freely. The new kennels are sturdier, more hygienic, and more comfortable. We have running water, electricity, and infrastructure that makes the daily work more manageable.' },
  'overons.werkwijze':    { nl: 'Hoe wij werken', de: 'Wie wir arbeiten', en: 'How we work' },
  'overons.werkwijze.sub':{ nl: 'Elke hond doorloopt een zorgvuldig traject. Van de straat tot een warm thuis \u2014 stap voor stap.', de: 'Jeder Hund durchl\u00E4uft einen sorgf\u00E4ltigen Prozess. Von der Stra\u00DFe bis zu einem warmen Zuhause \u2014 Schritt f\u00FCr Schritt.', en: 'Every dog goes through a careful process. From the street to a warm home \u2014 step by step.' },
  'overons.stap.redding':     { nl: 'Redding', de: 'Rettung', en: 'Rescue' },
  'overons.stap.redding.d':   { nl: 'We halen honden van de straat, van vuilnisbelten, langs wegen en uit gevaarlijke situaties. Vaak zijn ze ziek, ondervoed of gewond.', de: 'Wir holen Hunde von der Stra\u00DFe, von M\u00FClldeponien, entlang von Stra\u00DFen und aus gef\u00E4hrlichen Situationen. Oft sind sie krank, unterern\u00E4hrt oder verletzt.', en: 'We rescue dogs from the streets, dumps, roadsides, and dangerous situations. They are often sick, malnourished, or injured.' },
  'overons.stap.quarantaine':   { nl: 'Quarantaine', de: 'Quarant\u00E4ne', en: 'Quarantine' },
  'overons.stap.quarantaine.d': { nl: 'Elke nieuwe hond wordt eerst apart gehouden om te checken op besmettelijke ziektes en om rustig te wennen aan de veilige omgeving.', de: 'Jeder neue Hund wird zun\u00E4chst isoliert, um auf ansteckende Krankheiten zu pr\u00FCfen und sich ruhig an die sichere Umgebung zu gew\u00F6hnen.', en: 'Every new dog is first kept separate to check for contagious diseases and to calmly adjust to the safe environment.' },
  'overons.stap.medisch':   { nl: 'Medische zorg', de: 'Medizinische Versorgung', en: 'Medical care' },
  'overons.stap.medisch.d': { nl: 'Alle honden krijgen diergeneeskundige zorg: vaccinaties, ontworming, behandeling van ziektes en verwondingen. Wat ze ook nodig hebben.', de: 'Alle Hunde erhalten tier\u00E4rztliche Versorgung: Impfungen, Entwurmung, Behandlung von Krankheiten und Verletzungen. Was immer sie brauchen.', en: 'All dogs receive veterinary care: vaccinations, deworming, treatment of illnesses and injuries. Whatever they need.' },
  'overons.stap.sterilisatie':   { nl: 'Sterilisatie', de: 'Sterilisation', en: 'Sterilization' },
  'overons.stap.sterilisatie.d': { nl: 'We steriliseren en castreren elke hond. Dit is cruciaal om de cyclus van overbevolking te doorbreken en toekomstig lijden te voorkomen.', de: 'Wir sterilisieren und kastrieren jeden Hund. Dies ist entscheidend, um den Kreislauf der \u00DCberpopulation zu durchbrechen und zuk\u00FCnftiges Leiden zu verhindern.', en: 'We sterilize and neuter every dog. This is crucial to break the cycle of overpopulation and prevent future suffering.' },
  'overons.stap.socialisatie':   { nl: 'Socialisatie', de: 'Sozialisierung', en: 'Socialization' },
  'overons.stap.socialisatie.d': { nl: 'In onze binnentuin leren de honden weer vertrouwen in mensen. Ze spelen met elkaar, krijgen aandacht en worden klaargestoomd voor adoptie.', de: 'In unserem Innenhof lernen die Hunde wieder, Menschen zu vertrauen. Sie spielen miteinander, bekommen Aufmerksamkeit und werden auf die Adoption vorbereitet.', en: 'In our courtyard, the dogs learn to trust people again. They play together, receive attention, and are prepared for adoption.' },
  'overons.stap.adoptie':   { nl: 'Adoptie', de: 'Adoption', en: 'Adoption' },
  'overons.stap.adoptie.d': { nl: 'We zoeken een zorgvuldig gematcht, warm thuis \u2014 in Nederland of dichter bij huis. Elke adoptie maakt plek vrij voor de volgende hond in nood.', de: 'Wir suchen ein sorgf\u00E4ltig abgestimmtes, warmes Zuhause \u2014 in den Niederlanden oder n\u00E4her. Jede Adoption macht Platz f\u00FCr den n\u00E4chsten Hund in Not.', en: 'We find a carefully matched, warm home \u2014 in the Netherlands or closer by. Every adoption makes room for the next dog in need.' },
  'overons.transparantie':     { nl: 'Financi\u00EBle transparantie', de: 'Finanzielle Transparenz', en: 'Financial transparency' },
  'overons.transparantie.p1':  { nl: 'Wij ontvangen geen cent overheidssubsidie. Alles wat we doen wordt gefinancierd door donaties van particulieren en uit ons eigen geld.', de: 'Wir erhalten keinen Cent staatlicher Subvention. Alles, was wir tun, wird durch private Spenden und unser eigenes Geld finanziert.', en: 'We receive no government subsidy. Everything we do is funded by private donations and our own money.' },
  'overons.transparantie.p2':  { nl: 'De kosten voor dagelijks voer, medische zorg, vaccinaties en sterilisaties lopen snel op. We willen volledig transparant zijn over waar jouw geld naartoe gaat.', de: 'Die Kosten f\u00FCr t\u00E4gliches Futter, medizinische Versorgung, Impfungen und Sterilisationen steigen schnell. Wir m\u00F6chten v\u00F6llig transparent dar\u00FCber sein, wohin Ihr Geld flie\u00DFt.', en: 'The costs for daily food, medical care, vaccinations, and sterilizations add up quickly. We want to be completely transparent about where your money goes.' },
  'overons.transparantie.p3':  { nl: 'Het is enorm belangrijk dat mensen onze berichten blijven delen. Met meer bereik hebben meer hondjes kans op een warm, liefdevol huisje.', de: 'Es ist enorm wichtig, dass Menschen unsere Beitr\u00E4ge weiter teilen. Mit mehr Reichweite haben mehr Hunde eine Chance auf ein warmes, liebevolles Zuhause.', en: 'It is extremely important that people keep sharing our posts. With more reach, more dogs have a chance at a warm, loving home.' },
  'overons.kosten.voer':   { nl: 'Voer', de: 'Futter', en: 'Food' },
  'overons.kosten.voer.d': { nl: 'Dekt het voer van \u00E9\u00E9n hond voor een week', de: 'Deckt das Futter eines Hundes f\u00FCr eine Woche', en: 'Covers food for one dog for a week' },
  'overons.kosten.vaccin':   { nl: 'Vaccinatie', de: 'Impfung', en: 'Vaccination' },
  'overons.kosten.vaccin.d': { nl: '\u00C9\u00E9n volledige vaccinatie inclusief rabi\u00EBs', de: 'Eine vollst\u00E4ndige Impfung einschlie\u00DFlich Tollwut', en: 'One complete vaccination including rabies' },
  'overons.kosten.nood':   { nl: 'Noodoperatie', de: 'Notoperation', en: 'Emergency surgery' },
  'overons.kosten.nood.d': { nl: 'Bijdrage aan een spoed ingreep of operatie', de: 'Beitrag zu einem Noteingriff oder einer Operation', en: 'Contribution to an emergency procedure or surgery' },
  'overons.kosten.ster':   { nl: 'Sterilisatie', de: 'Sterilisation', en: 'Sterilization' },
  'overons.kosten.ster.d': { nl: '\u00C9\u00E9n volledige sterilisatie of castratie', de: 'Eine vollst\u00E4ndige Sterilisation oder Kastration', en: 'One complete sterilization or neutering' },
  'overons.team.title':    { nl: 'Onze vrijwilligers', de: 'Unsere Freiwilligen', en: 'Our volunteers' },
  'overons.faq':           { nl: 'Veelgestelde vragen', de: 'H\u00E4ufig gestellte Fragen', en: 'Frequently asked questions' },
  'overons.faq1.q': { nl: 'Hoe werkt het adoptieproces?', de: 'Wie funktioniert der Adoptionsprozess?', en: 'How does the adoption process work?' },
  'overons.faq1.a': { nl: 'Je kunt via onze website een hond uitkiezen en een aanvraagformulier invullen. Ons team neemt vervolgens contact op voor een kennismakingsgesprek. We willen er zeker van zijn dat de match goed is \u2014 voor jou \u00E9n voor de hond. Na goedkeuring regelen wij het transport naar Nederland.', de: 'Sie k\u00F6nnen \u00FCber unsere Website einen Hund ausw\u00E4hlen und ein Antragsformular ausf\u00FCllen. Unser Team nimmt dann Kontakt f\u00FCr ein Kennenlerngespr\u00E4ch auf. Wir m\u00F6chten sicherstellen, dass die \u00DCbereinstimmung passt \u2014 f\u00FCr Sie und f\u00FCr den Hund. Nach Genehmigung organisieren wir den Transport in die Niederlande.', en: 'You can choose a dog through our website and fill in an application form. Our team will then contact you for an introduction call. We want to make sure the match is right \u2014 for you and for the dog. After approval, we arrange transport to the Netherlands.' },
  'overons.faq2.q': { nl: 'Zijn de honden gevaccineerd en gechipt?', de: 'Sind die Hunde geimpft und gechipt?', en: 'Are the dogs vaccinated and microchipped?' },
  'overons.faq2.a': { nl: 'Ja, alle honden zijn volledig gevaccineerd (inclusief rabi\u00EBs), gesteriliseerd/gecastreerd, ontwormd en gechipt voordat ze naar hun nieuwe thuis gaan. Ze reizen met een eigen dierenpaspoort en alle benodigde reisdocumenten.', de: 'Ja, alle Hunde sind vollst\u00E4ndig geimpft (einschlie\u00DFlich Tollwut), sterilisiert/kastriert, entwurmt und gechipt, bevor sie in ihr neues Zuhause gehen. Sie reisen mit einem eigenen Tierpass und allen erforderlichen Reisedokumenten.', en: 'Yes, all dogs are fully vaccinated (including rabies), sterilized/neutered, dewormed, and microchipped before going to their new home. They travel with their own pet passport and all required travel documents.' },
  'overons.faq3.q': { nl: 'Waar gaat mijn donatie naartoe?', de: 'Wohin geht meine Spende?', en: 'Where does my donation go?' },
  'overons.faq3.a': { nl: 'Je donatie gaat direct naar de zorg van de honden: voer, vaccinaties, sterilisaties, noodoperaties en het onderhoud van het asiel. We ontvangen geen overheidssubsidie, dus elke euro telt. We streven naar volledige transparantie over onze kosten.', de: 'Ihre Spende flie\u00DFt direkt in die Versorgung der Hunde: Futter, Impfungen, Sterilisationen, Notoperationen und die Instandhaltung des Tierheims. Wir erhalten keine staatliche Subvention, also z\u00E4hlt jeder Euro. Wir streben nach vollst\u00E4ndiger Transparenz \u00FCber unsere Kosten.', en: 'Your donation goes directly to caring for the dogs: food, vaccinations, sterilizations, emergency surgeries, and shelter maintenance. We receive no government subsidy, so every euro counts. We strive for complete transparency about our costs.' },
  'overons.faq4.q': { nl: 'Is Hope for Dogs een offici\u00EBle stichting?', de: 'Ist Hope for Dogs eine offizielle Stiftung?', en: 'Is Hope for Dogs an official foundation?' },
  'overons.faq4.a': { nl: 'Ja, wij zijn een geregistreerde non-profit organisatie. We werken volledig transparant en leggen verantwoording af over onze inkomsten en uitgaven. Al onze vrijwilligers werken onbetaald.', de: 'Ja, wir sind eine eingetragene gemeinn\u00FCtzige Organisation. Wir arbeiten v\u00F6llig transparent und legen Rechenschaft \u00FCber unsere Einnahmen und Ausgaben ab. Alle unsere Freiwilligen arbeiten unbezahlt.', en: 'Yes, we are a registered non-profit organization. We work completely transparently and account for our income and expenditure. All our volunteers work unpaid.' },
  'overons.faq5.q': { nl: 'Kan ik ook op een andere manier helpen?', de: 'Kann ich auch auf andere Weise helfen?', en: 'Can I help in other ways?' },
  'overons.faq5.a': { nl: 'Absoluut! Naast doneren kun je ons helpen door onze berichten op social media te delen. Meer bereik betekent meer kans op adoptie. Je kunt ook materialen sturen naar het asiel (dekens, speelgoed, voer) of je aanmelden als vrijwilliger.', de: 'Absolut! Neben Spenden k\u00F6nnen Sie uns helfen, indem Sie unsere Beitr\u00E4ge in sozialen Medien teilen. Mehr Reichweite bedeutet mehr Chancen auf Adoption. Sie k\u00F6nnen auch Materialien an das Tierheim senden (Decken, Spielzeug, Futter) oder sich als Freiwilliger anmelden.', en: 'Absolutely! Besides donating, you can help by sharing our posts on social media. More reach means more chances of adoption. You can also send supplies to the shelter (blankets, toys, food) or sign up as a volunteer.' },
  'overons.cta':     { nl: 'Hart voor hond begint bij jou', de: 'Hope for Dogs beginnt bei dir', en: 'Hope for Dogs starts with you' },
  'overons.cta.sub': { nl: 'Doneer, adopteer of deel ons verhaal. Elke actie telt. Elke hond verdient een kans.', de: 'Spende, adoptiere oder teile unsere Geschichte. Jede Aktion z\u00E4hlt. Jeder Hund verdient eine Chance.', en: 'Donate, adopt, or share our story. Every action counts. Every dog deserves a chance.' },
  'overons.cta.btn2': { nl: 'Bekijk onze honden', de: 'Unsere Hunde ansehen', en: 'View our dogs' },

  // --- Adoptie page ---
  'adoptie.hero.sub':  { nl: 'Hun start was niet eerlijk, maar hun toekomst kan dat w\u00E9l zijn.', de: 'Ihr Anfang war nicht fair, aber ihre Zukunft kann es sein.', en: 'Their start wasn\u2019t fair, but their future can be.' },
  'adoptie.bekijk':    { nl: 'Onze honden', de: 'Unsere Hunde', en: 'Our dogs' },
  'adoptie.waarom':    { nl: 'Waarom adopteren via Hope for Dogs?', de: 'Warum \u00FCber Hope for Dogs adoptieren?', en: 'Why adopt through Hope for Dogs?' },
  'adoptie.waarom.sub':{ nl: 'Wij redden honden van de straat in Bosni\u00EB en Servi\u00EB, geven ze medische zorg en zoeken een warm thuis. Een adoptie via ons is geen impulsaankoop \u2014 het is een bewuste keuze die een leven redt en plek vrijmaakt voor de volgende hond in nood.', de: 'Wir retten Hunde von der Stra\u00DFe in Bosnien und Serbien, geben ihnen medizinische Versorgung und suchen ein warmes Zuhause. Eine Adoption \u00FCber uns ist kein Impulskauf \u2014 es ist eine bewusste Entscheidung, die ein Leben rettet und Platz f\u00FCr den n\u00E4chsten Hund in Not schafft.', en: 'We rescue dogs from the streets in Bosnia and Serbia, give them medical care, and find them a warm home. Adopting through us is not an impulse buy \u2014 it is a conscious choice that saves a life and makes room for the next dog in need.' },
  'adoptie.proces':     { nl: 'Hoe werkt het adoptieproces?', de: 'Wie funktioniert der Adoptionsprozess?', en: 'How does the adoption process work?' },
  'adoptie.proces.sub': { nl: 'Van kennismaking tot thuis \u2014 stap voor stap begeleiden we je door het hele proces.', de: 'Vom Kennenlernen bis nach Hause \u2014 Schritt f\u00FCr Schritt begleiten wir Sie durch den gesamten Prozess.', en: 'From introduction to home \u2014 we guide you through the entire process step by step.' },
  'adoptie.stap1':   { nl: 'Welke hond past bij jou?', de: 'Welcher Hund passt zu dir?', en: 'Which dog suits you?' },
  'adoptie.stap1.d': { nl: 'De eerste stap begint vaak gewoon met rondkijken. Op onze website vind je de honden die klaar zijn voor een nieuw hoofdstuk. Een foto vertelt nooit het hele verhaal, dus twijfel je welke hond past? Vraag ons gerust \u2014 we denken graag met je mee.', de: 'Der erste Schritt beginnt oft einfach mit Umschauen. Auf unserer Website findest du die Hunde, die bereit sind f\u00FCr ein neues Kapitel. Ein Foto erz\u00E4hlt nie die ganze Geschichte \u2013 unsicher, welcher Hund passt? Frag uns ruhig, wir denken gerne mit.', en: 'The first step often just starts with looking around. On our website you\u2019ll find the dogs that are ready for a new chapter. A photo never tells the whole story, so not sure which dog fits? Just ask us \u2014 we\u2019re happy to think along with you.' },
  'adoptie.stap2':   { nl: 'Stuur een bericht', de: 'Schick uns eine Nachricht', en: 'Send us a message' },
  'adoptie.stap2.d': { nl: 'Heb je een hond op het oog? Stuur ons een bericht via het contactformulier of gewoon een berichtje via Facebook \u2014 daar reageren we meestal het snelst. Vertel welke hond je aanspreekt en iets over jezelf, dan nemen we contact op.', de: 'Hast du einen Hund im Blick? Schick uns eine Nachricht \u00FCber das Kontaktformular oder einfach \u00FCber Facebook \u2013 dort antworten wir meistens am schnellsten. Sag uns, welcher Hund dich anspricht und etwas \u00FCber dich, dann melden wir uns.', en: 'Have a dog in mind? Send us a message via the contact form or simply on Facebook \u2014 that\u2019s usually where we reply fastest. Tell us which dog appeals to you and a bit about yourself, and we\u2019ll get in touch.' },
  'adoptie.stap3':   { nl: 'Kennismakingsgesprek', de: 'Kennenlerngespr\u00E4ch', en: 'Introduction call' },
  'adoptie.stap3.d': { nl: 'We sturen je een korte vragenlijst om je situatie beter te begrijpen, en plannen daarna een persoonlijk gesprek. Rustig kennismaken, je vragen beantwoorden en samen kijken of het klikt. We bespreken ook de adoptievergoeding en het transport.', de: 'Wir schicken dir einen kurzen Fragebogen, um deine Situation besser zu verstehen, und planen danach ein pers\u00F6nliches Gespr\u00E4ch. In Ruhe kennenlernen, deine Fragen beantworten und gemeinsam schauen, ob es passt. Wir besprechen auch die Adoptionsgeb\u00FChr und den Transport.', en: 'We\u2019ll send you a short questionnaire to understand your situation better, then plan a personal conversation. Getting to know each other calmly, answering your questions and seeing whether it clicks. We also discuss the adoption fee and transport.' },
  'adoptie.stap4':   { nl: 'Voorbereiding & wachten', de: 'Vorbereitung & Warten', en: 'Preparation & waiting' },
  'adoptie.stap4.d': { nl: 'Is er een match? Dan bereiden we je hond voor op de reis. Elk medisch traject is maatwerk. Tijdens het wachten krijg je foto\u2019s en video\u2019s, en leggen we alle afspraken vast in een reserverings- en adoptiecontract.', de: 'Passt es? Dann bereiten wir deinen Hund auf die Reise vor. Jeder medizinische Weg ist individuell. W\u00E4hrend der Wartezeit bekommst du Fotos und Videos, und wir halten alle Absprachen in einem Reservierungs- und Adoptionsvertrag fest.', en: 'Is it a match? Then we prepare your dog for the journey. Every medical path is tailored to the dog. While you wait you receive photos and videos, and we record all agreements in a reservation and adoption contract.' },
  'adoptie.stap5':   { nl: 'Transport & thuiskomst', de: 'Transport & Ankunft', en: 'Transport & arrival' },
  'adoptie.stap5.d': { nl: 'Je hond reist met een gereguleerd transport. In een groepsapp houden we contact en delen we updates, zodat je stap voor stap kunt meeleven tot de deur opengaat en je hond thuiskomt.', de: 'Dein Hund reist mit einem regulierten Transport. In einer Gruppen-App bleiben wir in Kontakt und teilen Updates, sodass du Schritt f\u00FCr Schritt mitfiebern kannst, bis die T\u00FCr aufgeht und dein Hund nach Hause kommt.', en: 'Your dog travels with a regulated transport. In a group chat we stay in touch and share updates, so you can follow along step by step until the door opens and your dog comes home.' },
  'adoptie.stap6':   { nl: 'Nazorg', de: 'Nachbetreuung', en: 'Aftercare' },
  'adoptie.stap6.d': { nl: 'Ook na de adoptie blijven we bereikbaar. Onze vrijwilligers hebben zelf ervaring met straathonden. Een vraag of een onzeker moment? Je mag altijd contact opnemen.', de: 'Auch nach der Adoption sind wir erreichbar. Unsere Freiwilligen haben selbst Erfahrung mit Stra\u00DFenhunden. Eine Frage oder ein unsicherer Moment? Du kannst dich jederzeit melden.', en: 'We stay reachable after the adoption too. Our volunteers have their own experience with street dogs. A question or an uncertain moment? You can always get in touch.' },
  'adoptie.aankomst':     { nl: 'Wat gebeurt er voor aankomst?', de: 'Was passiert vor der Ankunft?', en: 'What happens before arrival?' },
  'adoptie.aankomst.sub': { nl: 'Voordat een hond bij jou thuis komt, doorloopt elk dier een zorgvuldig traject in ons asiel.', de: 'Bevor ein Hund zu Ihnen nach Hause kommt, durchl\u00E4uft jedes Tier einen sorgf\u00E4ltigen Prozess in unserem Tierheim.', en: 'Before a dog comes to your home, every animal goes through a careful process at our shelter.' },
  'adoptie.eisen':     { nl: 'Waar letten we op?', de: 'Worauf achten wir?', en: 'What do we look for?' },
  'adoptie.eisen.sub': { nl: 'We willen dat elke adoptie slaagt. Daarom kijken we naar een aantal belangrijke punten voordat we een hond plaatsen.', de: 'Wir m\u00F6chten, dass jede Adoption gelingt. Deshalb achten wir auf einige wichtige Punkte, bevor wir einen Hund platzieren.', en: 'We want every adoption to succeed. That\u2019s why we look at several important points before placing a dog.' },
  'adoptie.kosten':     { nl: 'Adoptie vergoeding', de: 'Adoptionsgebühr', en: 'Adoption fee' },
  'adoptie.kosten.sub': { nl: 'De bijdrage gaat naar de verzorging en de veilige reis van jouw hond', de: 'Der Beitrag geht an die Pflege und die sichere Reise deines Hundes', en: 'The contribution goes towards the care and safe journey of your dog' },
  'adoptie.cta':     { nl: 'Klaar om een leven te veranderen?', de: 'Bereit, ein Leben zu ver\u00E4ndern?', en: 'Ready to change a life?' },
  'adoptie.cta.sub': { nl: 'Bekijk onze beschikbare honden en vind jouw nieuwe gezinslid. Of neem contact met ons op \u2014 we helpen je graag.', de: 'Sehen Sie sich unsere verf\u00FCgbaren Hunde an und finden Sie Ihr neues Familienmitglied. Oder kontaktieren Sie uns \u2014 wir helfen Ihnen gerne.', en: 'Browse our available dogs and find your new family member. Or contact us \u2014 we\u2019re happy to help.' },
  'adoptie.contact':  { nl: 'Lees de ervaringen', de: 'Erfahrungen lesen', en: 'Read experiences' },
  'adoptie.kosten.vergoeding':      { nl: 'Adoptie', de: 'Adoption', en: 'Adoption' },
  'adoptie.kosten.vergoeding.note': { nl: 'Inclusief medische behandeling en voorbereiding', de: 'Inklusive medizinischer Behandlung und Vorbereitung', en: 'Including medical treatment and preparation' },
  'adoptie.kosten.vac':     { nl: 'Vaccinatie', de: 'Impfung', en: 'Vaccination' },
  'adoptie.kosten.ont':     { nl: 'Ontworming', de: 'Entwurmung', en: 'Deworming' },
  'adoptie.kosten.vlooien': { nl: 'Ontvlooiing', de: 'Flohbehandlung', en: 'Flea treatment' },
  'adoptie.kosten.chip':    { nl: 'Chip & Paspoort', de: 'Chip & Reisepass', en: 'Chip & Passport' },
  'adoptie.kosten.vergoeding.note': { nl: 'Eenmalige bijdrage voor de medische verzorging van jouw hond in het asiel.', de: 'Einmaliger Beitrag f\u00FCr die medizinische Versorgung deines Hundes im Tierheim.', en: 'One-time contribution for the medical care of your dog at the shelter.' },
  'adoptie.kosten.transport':      { nl: 'Transport', de: 'Transport', en: 'Transport' },
  'adoptie.kosten.transport.note': { nl: 'De betaling voor het transport gaat rechtstreeks naar een gecertificeerde dierentransporteur. Dit is een externe partij die gespecialiseerd is in veilig en diervriendelijk vervoer vanuit het buitenland.', de: 'Die Zahlung f\u00FCr den Transport geht direkt an einen zertifizierten Tiertransporteur. Dies ist ein externer Dienstleister, der auf sicheren und tierfreundlichen Transport aus dem Ausland spezialisiert ist.', en: 'The transport payment goes directly to a certified animal transporter. This is an independent third party specialized in safe and animal-friendly transport from abroad.' },
  'adoptie.kosten.note.steri': { nl: 'Sterilisatie of castratie zit niet standaard bij de adoptiekosten. Veel honden zijn al geholpen; is dat nog niet zo, dan kan het via ons tegen een gereduceerd tarief van \u20AC60 \u2014 of later door jou.', de: 'Sterilisation oder Kastration ist nicht standardm\u00E4\u00DFig in den Adoptionskosten enthalten. Viele Hunde sind bereits versorgt; wenn nicht, ist das \u00FCber uns zu einem reduzierten Tarif von 60 \u20AC m\u00F6glich \u2013 oder sp\u00E4ter durch dich.', en: 'Sterilization or neutering is not included by default in the adoption costs. Many dogs are already done; if not, it can be arranged through us at a reduced rate of \u20AC60 \u2014 or later by you.' },
  'faq.title': { nl: 'Veelgestelde vragen', de: 'H\u00E4ufig gestellte Fragen', en: 'Frequently asked questions' },

  // --- Ervaringen page ---
  'ervaringen.hero.sub': { nl: 'Lees de ervaringen van onze adoptanten en ontdek waarom zoveel mensen blij zijn met hun viervoeter van Hope for Dogs.', de: 'Lesen Sie die Erfahrungen unserer Adoptanten und entdecken Sie, warum so viele Menschen gl\u00FCcklich mit ihrem Vierbeiner von Hope for Dogs sind.', en: 'Read the experiences of our adopters and discover why so many people are happy with their four-legged friend from Hope for Dogs.' },
  'ervaringen.samen':    { nl: 'Samen kunnen we een verschil maken', de: 'Gemeinsam k\u00F6nnen wir einen Unterschied machen', en: 'Together we can make a difference' },
  'ervaringen.samen.sub':{ nl: 'Elke hond verdient een liefdevolle thuis. Onze adoptanten bewijzen dat elke dag opnieuw.', de: 'Jeder Hund verdient ein liebevolles Zuhause. Unsere Adoptanten beweisen das jeden Tag aufs Neue.', en: 'Every dog deserves a loving home. Our adopters prove that every single day.' },
  'ervaringen.lijst':    { nl: 'Ervaringen van onze adoptanten', de: 'Erfahrungen unserer Adoptanten', en: 'Experiences from our adopters' },
  'ervaringen.lijst.sub':{ nl: 'Lees hoe onze honden hun nieuwe leven ervaren door de ogen van hun baasjes.', de: 'Lesen Sie, wie unsere Hunde ihr neues Leben durch die Augen ihrer Besitzer erleben.', en: 'Read how our dogs experience their new life through the eyes of their owners.' },
  'ervaringen.geadopteerd': { nl: 'Geadopteerd', de: 'Adoptiert', en: 'Adopted' },
  'ervaringen.cta':     { nl: 'Wil jij ook een verschil maken?', de: 'M\u00F6chtest du auch einen Unterschied machen?', en: 'Want to make a difference too?' },
  'ervaringen.cta.sub': { nl: 'Geef een zwerfhond een tweede kans en ervaar de onvoorwaardelijke liefde van een rescuehond. Adopteer of steun ons met een donatie.', de: 'Geben Sie einem Stra\u00DFenhund eine zweite Chance und erleben Sie die bedingungslose Liebe eines Rettungshundes. Adoptieren Sie oder unterst\u00FCtzen Sie uns mit einer Spende.', en: 'Give a stray dog a second chance and experience the unconditional love of a rescue dog. Adopt or support us with a donation.' },
  'ervaringen.cta.btn1': { nl: 'Bekijk onze honden', de: 'Unsere Hunde ansehen', en: 'View our dogs' },

  // --- Doneer page ---
  'doneer.hero.sub':    { nl: 'Onze vrijwilligers doen alles met veel liefde. Daarnaast betalen ze ook alles uit eigen zak; voer, onderhoud en de dierenarts kosten. Dit gaat allemaal door en loopt qua kosten behoorlijk op. We zijn dus volledig afhankelijk van de goedheid van andere mensen. Draagt u onze hondjes ook een warm hart toe?', de: 'Unsere Freiwilligen tun alles mit viel Liebe. Dar\u00FCber hinaus bezahlen sie auch alles aus eigener Tasche: Futter, Pflege und Tierarztkosten. Das geht immer weiter und summiert sich erheblich. Wir sind daher v\u00F6llig auf die G\u00FCte anderer Menschen angewiesen. Tragen auch Sie unsere Hunde im Herzen?', en: 'Our volunteers do everything with a lot of love. On top of that, they pay for everything out of their own pocket: food, care and vet bills. It never stops and the costs add up considerably. So we depend entirely on the kindness of others. Will you take our dogs into your heart too?' },
  'doneer.kies':        { nl: 'Kies een bedrag', de: 'W\u00E4hlen Sie einen Betrag', en: 'Choose an amount' },
  'doneer.anders':      { nl: 'Anders', de: 'Andere', en: 'Other' },
  'doneer.frequentie':  { nl: 'Frequentie', de: 'H\u00E4ufigkeit', en: 'Frequency' },
  'doneer.maandelijks': { nl: 'Maandelijks', de: 'Monatlich', en: 'Monthly' },
  'doneer.eenmalig':    { nl: 'Eenmalig', de: 'Einmalig', en: 'One-time' },
  'doneer.gegevens':    { nl: 'Jouw gegevens', de: 'Ihre Daten', en: 'Your details' },
  'doneer.optioneel':   { nl: 'Optioneel - vul in als je een bevestiging wilt ontvangen', de: 'Optional - ausf\u00FCllen, wenn Sie eine Best\u00E4tigung erhalten m\u00F6chten', en: 'Optional - fill in if you want to receive a confirmation' },
  'doneer.naam':        { nl: 'Naam', de: 'Name', en: 'Name' },
  'doneer.email':       { nl: 'E-mailadres', de: 'E-Mail-Adresse', en: 'Email address' },
  'doneer.btn':         { nl: 'Doneer nu', de: 'Jetzt spenden', en: 'Donate now' },
  'doneer.impact':      { nl: 'Jouw donatie maakt impact', de: 'Ihre Spende hat Wirkung', en: 'Your donation makes an impact' },
  'doneer.met10':       { nl: 'Met \u20AC10', de: 'Mit \u20AC10', en: 'With \u20AC10' },
  'doneer.met10.d':     { nl: 'Voorzie je een hond een week lang van voer. Zo hoeft geen enkel hondje met een lege maag te slapen.', de: 'Versorgen Sie einen Hund eine Woche lang mit Futter. So muss kein Hund mit leerem Magen schlafen.', en: 'You provide a dog with food for a week. No dog has to sleep on an empty stomach.' },
  'doneer.met25':       { nl: 'Met \u20AC25', de: 'Mit \u20AC25', en: 'With \u20AC25' },
  'doneer.met25.d':     { nl: 'Betaal je de vaccinaties voor een puppy. Een gezonde start is essentieel voor hun toekomst.', de: 'Bezahlen Sie die Impfungen f\u00FCr einen Welpen. Ein gesunder Start ist wichtig f\u00FCr ihre Zukunft.', en: 'You pay for a puppy\u2019s vaccinations. A healthy start is essential for their future.' },
  'doneer.met50':       { nl: 'Met \u20AC50', de: 'Mit \u20AC50', en: 'With \u20AC50' },
  'doneer.met50.d':     { nl: 'Financier je de sterilisatie van een zwerfhond. Dit helpt de eindeloze cyclus te doorbreken.', de: 'Finanzieren Sie die Sterilisation eines Stra\u00DFenhundes. Dies hilft, den endlosen Kreislauf zu durchbrechen.', en: 'You fund the sterilization of a stray dog. This helps break the endless cycle.' },
  'doneer.waargaat':    { nl: 'Waar gaat jouw geld naartoe?', de: 'Wohin flie\u00DFt Ihr Geld?', en: 'Where does your money go?' },
  'doneer.bank':        { nl: 'Liever via bankoverschrijving?', de: 'Lieber per Bank\u00FCberweisung?', en: 'Prefer bank transfer?' },
  'doneer.bank.sub':    { nl: 'Je kunt ook direct een donatie overmaken naar onze bankrekening. Elke bijdrage, groot of klein, wordt enorm gewaardeerd.', de: 'Sie k\u00F6nnen auch direkt eine Spende auf unser Bankkonto \u00FCberweisen. Jeder Beitrag, gro\u00DF oder klein, wird sehr gesch\u00E4tzt.', en: 'You can also transfer a donation directly to our bank account. Every contribution, big or small, is greatly appreciated.' },
  'doneer.omschrijving':    { nl: 'Omschrijving', de: 'Verwendungszweck', en: 'Description' },
  'doneer.donatie':         { nl: 'Donatie', de: 'Spende', en: 'Donation' },
  'doneer.vermeld':         { nl: "Vermeld 'Donatie' bij de omschrijving zodat wij jouw bijdrage correct kunnen verwerken.", de: "Geben Sie 'Spende' als Verwendungszweck an, damit wir Ihren Beitrag korrekt verarbeiten k\u00F6nnen.", en: "Enter 'Donation' as the description so we can process your contribution correctly." },

  // ===== Payment result pages (bedankt.html / betaling-mislukt.html) =====
  'bedankt.checking':   { nl: 'Even geduld, we bevestigen je betaling...', de: 'Einen Moment, wir best\u00E4tigen deine Zahlung...', en: 'One moment, we\u2019re confirming your payment...' },
  'bedankt.hero':       { nl: 'Wauw, heel erg bedankt!', de: 'Wow, ganz herzlichen Dank!', en: 'Wow, thank you so much!' },
  'bedankt.sub':        { nl: 'Je donatie is goed ontvangen. Hiermee help je ons om honden in nood te redden, de zorg te geven die ze verdienen en een nieuw thuis voor ze te vinden.', de: 'Deine Spende ist gut angekommen. Damit hilfst du uns, Hunde in Not zu retten, ihnen die Pflege zu geben, die sie verdienen, und ein neues Zuhause f\u00FCr sie zu finden.', en: 'Your donation has been received. With it you help us rescue dogs in need, give them the care they deserve and find them a new home.' },
  'bedankt.pending':    { nl: 'Je betaling wordt nog verwerkt. Je ontvangt een bevestiging zodra deze is voltooid.', de: 'Deine Zahlung wird noch verarbeitet. Du erh\u00E4ltst eine Best\u00E4tigung, sobald sie abgeschlossen ist.', en: 'Your payment is still being processed. You will receive a confirmation once it is complete.' },
  'bedankt.honden':     { nl: 'Bekijk onze honden', de: 'Unsere Hunde ansehen', en: 'See our dogs' },
  'bedankt.terug':      { nl: 'Terug naar home', de: 'Zur\u00FCck zur Startseite', en: 'Back to home' },
  'mislukt.hero':       { nl: 'Betaling niet gelukt', de: 'Zahlung fehlgeschlagen', en: 'Payment unsuccessful' },
  'mislukt.sub':        { nl: 'Er is iets misgegaan met uw betaling, of deze is geannuleerd. Er is geen bedrag afgeschreven.', de: 'Bei Ihrer Zahlung ist etwas schiefgelaufen oder sie wurde abgebrochen. Es wurde kein Betrag abgebucht.', en: 'Something went wrong with your payment, or it was cancelled. No amount has been charged.' },
  'mislukt.bank':       { nl: 'Liever via bankoverschrijving? Op de donatiepagina vindt u onze bankgegevens.', de: 'Lieber per Bank\u00FCberweisung? Auf der Spendenseite finden Sie unsere Bankdaten.', en: 'Prefer a bank transfer? You\u2019ll find our bank details on the donation page.' },
  'mislukt.opnieuw':    { nl: 'Probeer opnieuw', de: 'Erneut versuchen', en: 'Try again' },
  'mislukt.terug':      { nl: 'Terug naar home', de: 'Zur\u00FCck zur Startseite', en: 'Back to home' },
  // ---- Lottery (cross-page toast + entry modal) ----
  'lottery.enter':      { nl: 'Doe mee', de: 'Mitmachen', en: 'Enter' },
  'lottery.pickTitle':  { nl: 'Kies je nummer(s)', de: 'W\u00E4hle deine Nummer(n)', en: 'Pick your number(s)' },
  'lottery.pickSub':    { nl: 'Tik op de beschikbare nummers die je wilt kopen.', de: 'Tippe auf die verf\u00FCgbaren Nummern, die du kaufen m\u00F6chtest.', en: 'Tap the available numbers you want to buy.' },
  'lottery.name':       { nl: 'Naam', de: 'Name', en: 'Name' },
  'lottery.email':      { nl: 'E-mailadres', de: 'E-Mail-Adresse', en: 'Email address' },
  'lottery.continue':   { nl: 'Doorgaan naar betaling', de: 'Weiter zur Zahlung', en: 'Continue to payment' },
  'lottery.perNumber':  { nl: 'per nummer', de: 'pro Nummer', en: 'per number' },
  'lottery.selected':   { nl: 'Geselecteerd', de: 'Ausgew\u00E4hlt', en: 'Selected' },
  'lottery.none':       { nl: 'Nog geen nummer gekozen', de: 'Noch keine Nummer gew\u00E4hlt', en: 'No number selected yet' },
  'lottery.total':      { nl: 'Totaal', de: 'Gesamt', en: 'Total' },
  'lottery.loading':    { nl: 'Nummers laden\u2026', de: 'Nummern werden geladen\u2026', en: 'Loading numbers\u2026' },
  'lottery.err':        { nl: 'Er ging iets mis. Probeer het opnieuw.', de: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.', en: 'Something went wrong. Please try again.' },
  'lottery.conflict':   { nl: 'Sommige nummers zijn net vergeven. We hebben je selectie bijgewerkt.', de: 'Einige Nummern wurden gerade vergeben. Deine Auswahl wurde aktualisiert.', en: 'Some numbers were just taken \u2014 your selection was updated.' },
  'lottery.needSelect': { nl: 'Kies minstens \u00E9\u00E9n nummer.', de: 'W\u00E4hle mindestens eine Nummer.', en: 'Pick at least one number.' },
  'lottery.terms':      { nl: 'Voorwaarden', de: 'Bedingungen', en: 'Terms & rules' },
  'lottery.prizes':     { nl: 'Te winnen', de: 'Zu gewinnen', en: 'Prizes' },
  // Fundraiser (donation) variant of the toast/modal
  'lottery.donate':     { nl: 'Doneer', de: 'Spenden', en: 'Donate' },
  'lottery.donSub':     { nl: 'Kies een bedrag om deze actie te steunen.', de: 'Wähle einen Betrag, um diese Aktion zu unterstützen.', en: 'Choose an amount to support this campaign.' },
  'lottery.customAmount': { nl: 'Ander bedrag', de: 'Anderer Betrag', en: 'Other amount' },
  'lottery.anon':       { nl: 'Doneer anoniem', de: 'Anonym spenden', en: 'Donate anonymously' },
  'lottery.raised':     { nl: 'opgehaald', de: 'gesammelt', en: 'raised' },
  'lottery.of':         { nl: 'van', de: 'von', en: 'of' },
  'lottery.recentDon':  { nl: 'Recente donaties', de: 'Aktuelle Spenden', en: 'Recent donations' },
  'lottery.needAmount': { nl: 'Kies of vul een bedrag in.', de: 'Wähle oder gib einen Betrag ein.', en: 'Choose or enter an amount.' },
  'lottery.donateNow':  { nl: 'Doneer nu', de: 'Jetzt spenden', en: 'Donate now' },

  // --- Dog cards (tags / size / gallery controls) ---
  'dogcard.tag.puppy':      { nl: 'Puppy',      de: 'Welpe',       en: 'Puppy' },
  'dogcard.tag.senior':     { nl: 'Senior',     de: 'Senior',      en: 'Senior' },
  'dogcard.tag.langzitter': { nl: 'Langzitter', de: 'Langzeithund', en: 'Long-stay' },
  'dogcard.size.klein':     { nl: 'Klein',      de: 'Klein',       en: 'Small' },
  'dogcard.size.middel':    { nl: 'Middel',     de: 'Mittel',      en: 'Medium' },
  'dogcard.size.groot':     { nl: 'Groot',      de: 'Groß',        en: 'Large' },
  'dogcard.alt':            { nl: 'adoptiehond uit Bosnië & Servië', de: 'Adoptionshund aus Bosnien & Serbien', en: 'adoptable dog from Bosnia & Serbia' },
  'dogcard.aria.prev':      { nl: 'Vorige foto', de: 'Vorheriges Foto', en: 'Previous photo' },
  'dogcard.aria.next':      { nl: 'Volgende foto', de: 'Nächstes Foto', en: 'Next photo' },
  'dogcard.aria.playpause': { nl: 'Afspelen / pauzeren', de: 'Abspielen / Pausieren', en: 'Play / pause' },
  'dogcard.aria.mute':      { nl: 'Geluid aan / uit', de: 'Ton an / aus', en: 'Sound on / off' },

  // --- Dog listing states ---
  'dogs.loading':  { nl: 'Laden…', de: 'Wird geladen…', en: 'Loading…' },
  'dogs.empty':    { nl: 'Geen honden gevonden in deze categorie.', de: 'Keine Hunde in dieser Kategorie gefunden.', en: 'No dogs found in this category.' },
  'dogs.error':    { nl: 'Er is een fout opgetreden bij het laden van de honden.', de: 'Beim Laden der Hunde ist ein Fehler aufgetreten.', en: 'Something went wrong while loading the dogs.' },
  'dog.notfound':  { nl: 'Hond niet gevonden.', de: 'Hund nicht gefunden.', en: 'Dog not found.' },
  'dogs.none':     { nl: 'Nog geen honden beschikbaar.', de: 'Noch keine Hunde verfügbar.', en: 'No dogs available yet.' },

  // --- Blog / news ---
  'blog.readmore': { nl: 'Lees meer', de: 'Weiterlesen', en: 'Read more' },
  'blog.empty':    { nl: 'Er zijn nog geen nieuwsberichten geplaatst.', de: 'Es wurden noch keine Neuigkeiten veröffentlicht.', en: 'No news posts yet.' },
  'blog.error':    { nl: 'Er is een fout opgetreden bij het laden.', de: 'Beim Laden ist ein Fehler aufgetreten.', en: 'Something went wrong while loading.' },
  'blog.back':     { nl: 'Terug naar nieuws', de: 'Zurück zu den Neuigkeiten', en: 'Back to news' },
  'blog.related':  { nl: 'Lees ook', de: 'Auch interessant', en: 'Read next' },
  'blog.notfoundTitle': { nl: 'Bericht niet gevonden', de: 'Beitrag nicht gefunden', en: 'Post not found' },
  'blog.notfound': { nl: 'Dit nieuwsbericht bestaat niet of is verwijderd.', de: 'Dieser Beitrag existiert nicht oder wurde entfernt.', en: 'This post doesn’t exist or has been removed.' },

  // --- Experiences (stories) ---
  'exp.readmore':  { nl: 'Lees het verhaal', de: 'Geschichte lesen', en: 'Read the story' },
  'exp.empty':     { nl: 'Er zijn nog geen ervaringen gedeeld.', de: 'Es wurden noch keine Erfahrungen geteilt.', en: 'No experiences shared yet.' },
  'exp.error':     { nl: 'Er is een fout opgetreden bij het laden.', de: 'Beim Laden ist ein Fehler aufgetreten.', en: 'Something went wrong while loading.' },
  'exp.back':      { nl: 'Bekijk alle ervaringen', de: 'Alle Erfahrungen ansehen', en: 'View all experiences' },
  'exp.notfoundTitle': { nl: 'Verhaal niet gevonden', de: 'Geschichte nicht gefunden', en: 'Story not found' },
  'exp.notfound':  { nl: 'Dit verhaal bestaat niet of is verwijderd.', de: 'Diese Geschichte existiert nicht oder wurde entfernt.', en: 'This story doesn’t exist or has been removed.' },
  'exp.adoptedBy': { nl: 'Geadopteerd door', de: 'Adoptiert von', en: 'Adopted by' },

  // --- Dog detail meta labels (modal + hond.html) ---
  'dog.meta.geslacht':   { nl: 'Geslacht', de: 'Geschlecht', en: 'Sex' },
  'dog.meta.leeftijd':   { nl: 'Leeftijd', de: 'Alter', en: 'Age' },
  'dog.meta.ras':        { nl: 'Ras', de: 'Rasse', en: 'Breed' },
  'dog.meta.grootte':    { nl: 'Grootte', de: 'Größe', en: 'Size' },
  'dog.meta.gesteriliseerd': { nl: 'Gesteriliseerd', de: 'Kastriert', en: 'Neutered' },
  'dog.meta.ja':         { nl: 'Ja', de: 'Ja', en: 'Yes' },
  'dog.meta.nee':        { nl: 'Nee', de: 'Nein', en: 'No' },
  'dog.meta.man':        { nl: 'Reu', de: 'Rüde', en: 'Male' },
  'dog.meta.vrouw':      { nl: 'Teef', de: 'Hündin', en: 'Female' },
  'dog.meta.gewicht':    { nl: 'Gewicht', de: 'Gewicht', en: 'Weight' },
  'dog.stuurBericht':    { nl: 'Stuur een bericht', de: 'Nachricht senden', en: 'Send a message' },
  'dog.chatFacebook':    { nl: 'Chat op Facebook', de: 'Chatte auf Facebook', en: 'Chat on Facebook' },
  'dog.adoptieHint':     { nl: 'Benieuwd hoe het adoptieproces werkt? <a href="adoptie.html" style="color:var(--brand);font-weight:700;">Bekijk de stappen en kosten</a>', de: 'Neugierig, wie der Adoptionsprozess abläuft? <a href="adoptie.html" style="color:var(--brand);font-weight:700;">Sieh dir die Schritte und Kosten an</a>', en: 'Curious how the adoption process works? <a href="adoptie.html" style="color:var(--brand);font-weight:700;">See the steps and costs</a>' },
  // Dog status labels
  'dog.status.opzoek':      { nl: 'Opzoek', de: 'Sucht ein Zuhause', en: 'Looking for a home' },
  'dog.status.in_gesprek':  { nl: 'Gereserveerd', de: 'Reserviert', en: 'Reserved' },
  'dog.status.geadopteerd': { nl: 'Geadopteerd', de: 'Adoptiert', en: 'Adopted' },
  // Dog compatibility / test badges
  'dog.compat.kind.yes':   { nl: 'Kindvriendelijk', de: 'Kinderlieb', en: 'Good with children' },
  'dog.compat.kind.no':    { nl: 'Niet kindvriendelijk', de: 'Nicht kinderlieb', en: 'Not good with children' },
  'dog.compat.kat.yes':    { nl: 'Katvriendelijk', de: 'Katzenverträglich', en: 'Good with cats' },
  'dog.compat.kat.no':     { nl: 'Niet katvriendelijk', de: 'Nicht katzenverträglich', en: 'Not good with cats' },
  'dog.compat.hond.yes':   { nl: 'Hondvriendelijk', de: 'Hundeverträglich', en: 'Good with dogs' },
  'dog.compat.hond.no':    { nl: 'Niet hondvriendelijk', de: 'Nicht hundeverträglich', en: 'Not good with dogs' },
  'dog.compat.zindelijk':  { nl: 'Zindelijk', de: 'Stubenrein', en: 'House-trained' },
  'dog.compat.tuin':       { nl: 'Tuin nodig', de: 'Garten nötig', en: 'Needs a garden' },
  'dog.test.4d':           { nl: '4D Test', de: '4D-Test', en: '4D test' },
  'dog.test.giardia':      { nl: 'Giardia Test', de: 'Giardien-Test', en: 'Giardia test' },

  // --- Dog inquiry (contact) modal ---
  'dog.inquiry.titlePre':   { nl: 'Interesse in ', de: 'Interesse an ', en: 'Interested in ' },
  'dog.inquiry.titlePost':  { nl: '?', de: '?', en: '?' },
  'dog.inquiry.intro':      { nl: 'Vul het formulier in en wij nemen zo snel mogelijk contact met je op.', de: 'Fülle das Formular aus und wir melden uns so schnell wie möglich bei dir.', en: 'Fill in the form and we’ll get back to you as soon as possible.' },
  'dog.inquiry.naam':       { nl: 'Naam *', de: 'Name *', en: 'Name *' },
  'dog.inquiry.naam.ph':    { nl: 'Je volledige naam', de: 'Dein vollständiger Name', en: 'Your full name' },
  'dog.inquiry.email':      { nl: 'E-mail *', de: 'E-Mail *', en: 'Email *' },
  'dog.inquiry.email.ph':   { nl: 'je@email.nl', de: 'du@email.de', en: 'you@email.com' },
  'dog.inquiry.telefoon':   { nl: 'Telefoonnummer', de: 'Telefonnummer', en: 'Phone number' },
  'dog.inquiry.telefoon.ph':{ nl: '06-12345678', de: '0151 23456789', en: '06-12345678' },
  'dog.inquiry.bericht':    { nl: 'Bericht *', de: 'Nachricht *', en: 'Message *' },
  'dog.inquiry.bericht.ph': { nl: 'Vertel ons waarom je geïnteresseerd bent in deze hond...', de: 'Erzähl uns, warum du dich für diesen Hund interessierst...', en: 'Tell us why you’re interested in this dog...' },
  'dog.inquiry.verstuur':   { nl: 'Verstuur bericht', de: 'Nachricht senden', en: 'Send message' },
  'dog.inquiry.verzenden':  { nl: 'Verzenden…', de: 'Wird gesendet…', en: 'Sending…' },
  'dog.inquiry.succesTitle':{ nl: 'Bericht verstuurd!', de: 'Nachricht gesendet!', en: 'Message sent!' },
  'dog.inquiry.succesMsg':  { nl: 'Bedankt voor je interesse. We nemen zo snel mogelijk contact met je op.', de: 'Danke für dein Interesse. Wir melden uns so schnell wie möglich bei dir.', en: 'Thanks for your interest. We’ll get back to you as soon as possible.' },
  'dog.inquiry.error':      { nl: 'Er is iets misgegaan. Probeer het later opnieuw.', de: 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.', en: 'Something went wrong. Please try again later.' },
};

function h4dGetLanguage() {
  var m = location.pathname.match(/^\/(en|de)(\/|$)/);
  return m ? m[1] : 'nl';
}

// Translate a static UI key for JS-rendered strings. Falls back to Dutch, then the key itself.
function h4dT(key) {
  var lang = h4dGetLanguage();
  var e = H4D_I18N[key];
  if (!e) return key;
  return e[lang] || e.nl || key;
}

// Pick a Supabase row's field in the current language, falling back to the Dutch base field
// (e.g. h4dField(dog, 'beschrijving') → dog.beschrijving_en || dog.beschrijving). Never blank.
function h4dField(row, field) {
  if (!row) return '';
  var lang = h4dGetLanguage();
  if (lang === 'nl') return row[field];
  return row[field + '_' + lang] || row[field];
}

// Prefix a same-site page path for a specific language ('nl' = no prefix).
function h4dUrlFor(path, lang) {
  path = String(path).replace(/^\/+/, '');
  if (!path) path = 'index.html';
  return lang === 'nl' ? '/' + path : '/' + lang + '/' + path;
}

// Prefix a same-site page path (e.g. 'honden.html') for the CURRENT language.
// Used everywhere an internal link is built (nav, footer, cards, static links).
function h4dUrl(path) {
  return h4dUrlFor(path, h4dGetLanguage());
}

// Detail-page URL: prefer the slug (/hond/<slug>, /nieuws/<slug>), fall back to
// the legacy ?id= form when a row has no slug yet. base e.g. 'hond'/'nieuws';
// htmlFallback e.g. 'hond.html'/'post.html'.
function h4dDetailUrl(base, htmlFallback, row) {
  if (row && row.slug) return h4dUrlFor(base + '/' + row.slug, h4dGetLanguage());
  return h4dUrl(htmlFallback) + '?id=' + row.id;
}

// Strip a leading /en/ or /de/ segment from a pathname, returning the bare (Dutch) path.
function h4dStripLangPrefix(pathname) {
  return pathname.replace(/^\/(en|de)(\/|$)/, '/');
}

// Navigate to the sibling URL of the current page in another language, preserving
// query string (?id=...) and hash. Used by the language switcher.
function h4dNavigateToLanguage(lang) {
  var bare = h4dStripLangPrefix(location.pathname).replace(/^\//, '') || 'index.html';
  window.location.href = h4dUrlFor(bare, lang) + location.search + location.hash;
}

// Prefix same-site .html links written directly in page markup (breadcrumbs, CTAs,
// donation buttons) so they stay in the current language. Nav/footer and JS-built
// card links already carry the right prefix from h4dUrl() at build time, so this
// only needs to catch the raw <a href="..."> tags scattered across each page.
function h4dLocalizeStaticLinks() {
  var lang = h4dGetLanguage();
  if (lang === 'nl') return;
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || /^(https?:|mailto:|tel:|#|\/(en|de)\/)/i.test(href)) return;
    if (!/\.html(\?|#|$)/i.test(href)) return;
    var path = href.replace(/^\.?\/+/, '');
    a.setAttribute('href', '/' + lang + '/' + path);
  });
}

var H4D_SITE_ORIGIN = 'https://www.hopefordogseurope.com';

// Per-page title/description, one entry per indexable page. Detail pages (hond/post/
// ervaring) show this as a fallback until their own per-record script overrides it.
var H4D_PAGE_SEO = {
  'privacy': {
    title: { nl: 'Privacybeleid | Hope for Dogs', de: 'Datenschutz | Hope for Dogs', en: 'Privacy Policy | Hope for Dogs' },
    desc: { nl: 'Privacyverklaring van Stichting Hope for Dogs Europe: welke persoonsgegevens wij verwerken en welke rechten je hebt volgens de AVG.', de: 'Datenschutzerklärung der Stiftung Hope for Dogs Europe: welche personenbezogenen Daten wir verarbeiten und welche Rechte du gemäß DSGVO hast.', en: 'Privacy policy of Stichting Hope for Dogs Europe: which personal data we process and your rights under the GDPR.' }
  },
  'index': {
    title: { nl: 'Hope for Dogs — Adopteer een Straathond uit Bosnië en Servië', de: 'Hope for Dogs — Adoptiere einen Streunerhund aus Bosnien und Serbien', en: 'Hope for Dogs — Adopt a Stray Dog from Bosnia & Serbia' },
    desc: { nl: 'Hope for Dogs redt straathonden in Bosnië en Servië en vindt hen een liefdevol thuis in Nederland, België, Duitsland en Oostenrijk. Bekijk onze honden.', de: 'Hope for Dogs rettet Streunerhunde in Bosnien und Serbien und vermittelt sie in die Niederlande, Belgien, Deutschland und Österreich. Entdecke unsere Hunde.', en: 'Hope for Dogs rescues stray dogs in Bosnia and Serbia and finds them loving homes in the Netherlands, Belgium, Germany and Austria. Browse our dogs.' }
  },
  'honden': {
    title: { nl: 'Adoptiehonden — Beschikbare Honden | Hope for Dogs', de: 'Adoptionshunde — Verfügbare Hunde | Hope for Dogs', en: 'Adoptable Dogs — Available Dogs | Hope for Dogs' },
    desc: { nl: 'Bekijk alle beschikbare adoptiehonden van Hope for Dogs. Straathonden uit Bosnië en Servië, medisch behandeld en klaar voor een nieuw thuis.', de: 'Entdecke alle verfügbaren Adoptionshunde von Hope for Dogs. Streunerhunde aus Bosnien und Serbien, medizinisch behandelt und bereit für ein neues Zuhause.', en: 'Browse all adoptable dogs at Hope for Dogs. Stray dogs from Bosnia and Serbia, medically treated and ready for a new home.' }
  },
  'over-ons': {
    title: { nl: 'Over Ons — Ons Verhaal & Missie | Hope for Dogs', de: 'Über Uns — Unsere Geschichte & Mission | Hope for Dogs', en: 'About Us — Our Story & Mission | Hope for Dogs' },
    desc: { nl: 'Leer meer over Hope for Dogs, een non-profit die straathonden redt in Bosnië en Servië. Ons team van vrijwilligers zet zich dag en nacht in voor een beter leven.', de: 'Erfahre mehr über Hope for Dogs, eine gemeinnützige Organisation, die Streunerhunde in Bosnien und Serbien rettet. Unser Team aus Freiwilligen setzt sich Tag und Nacht für ein besseres Leben ein.', en: 'Learn more about Hope for Dogs, a non-profit rescuing stray dogs in Bosnia and Serbia. Our team of volunteers works day and night for a better life.' }
  },
  'adoptie': {
    title: { nl: 'Buitenlandse Hond Adopteren uit Bosnië & Servië | Hope for Dogs', de: 'Hund aus dem Ausland adoptieren — aus Bosnien & Serbien | Hope for Dogs', en: 'Adopt a Dog from Abroad — from Bosnia & Serbia | Hope for Dogs' },
    desc: { nl: 'Een buitenlandse straathond uit Bosnië of Servië adopteren? Ontdek het proces, de kosten (€230 + €200 transport) en hoe wij alles regelen. Bekijk onze honden.', de: 'Einen Straßenhund aus dem Ausland (Bosnien/Serbien) adoptieren? Ablauf, Kosten (230 € + 200 € Transport) und wie wir alles organisieren. Entdecke unsere Hunde.', en: 'Adopt a foreign street dog from Bosnia or Serbia? Discover the process, the costs (€230 + €200 transport) and how we arrange everything. Browse our dogs.' }
  },
  'ervaringen': {
    title: { nl: 'Adoptieverhalen — Ervaringen van Adoptanten | Hope for Dogs', de: 'Adoptionsgeschichten — Erfahrungen von Adoptanten | Hope for Dogs', en: 'Adoption Stories — Experiences from Adopters | Hope for Dogs' },
    desc: { nl: 'Lees de mooiste adoptieverhalen van Hope for Dogs. Onze honden vonden hun thuis in Nederland, België, Duitsland en Oostenrijk.', de: 'Lies die schönsten Adoptionsgeschichten von Hope for Dogs. Unsere Hunde fanden ihr Zuhause in den Niederlanden, Belgien, Deutschland und Österreich.', en: 'Read the most heartwarming adoption stories from Hope for Dogs. Our dogs found their homes in the Netherlands, Belgium, Germany and Austria.' }
  },
  'nieuws': {
    title: { nl: 'Nieuws — Updates uit het Asiel | Hope for Dogs', de: 'Neuigkeiten — Updates aus dem Tierheim | Hope for Dogs', en: 'News — Updates from the Shelter | Hope for Dogs' },
    desc: { nl: 'Blijf op de hoogte van het laatste nieuws van Hope for Dogs. Reddingsverhalen, updates uit het asiel en meer over onze straathonden.', de: 'Bleib auf dem Laufenden mit den neuesten Nachrichten von Hope for Dogs. Rettungsgeschichten, Updates aus dem Tierheim und mehr über unsere Streunerhunde.', en: 'Stay up to date with the latest news from Hope for Dogs. Rescue stories, updates from the shelter, and more about our stray dogs.' }
  },
  'contact': {
    title: { nl: 'Contact | Hope for Dogs', de: 'Kontakt | Hope for Dogs', en: 'Contact | Hope for Dogs' },
    desc: { nl: 'Neem contact op met Hope for Dogs. Vragen over adoptie, ons werk of hoe je kunt helpen? Stuur ons een bericht.', de: 'Kontaktiere Hope for Dogs. Fragen zur Adoption, unserer Arbeit oder wie du helfen kannst? Schick uns eine Nachricht.', en: 'Get in touch with Hope for Dogs. Questions about adoption, our work, or how you can help? Send us a message.' }
  },
  'doneer': {
    title: { nl: 'Doneer — Help Straathonden in Nood | Hope for Dogs', de: 'Spenden — Hilf Streunerhunden in Not | Hope for Dogs', en: 'Donate — Help Stray Dogs in Need | Hope for Dogs' },
    desc: { nl: 'Steun Hope for Dogs met een donatie. Elke bijdrage helpt bij voeding, medische zorg en opvang van straathonden in Bosnië en Servië.', de: 'Unterstütze Hope for Dogs mit einer Spende. Jeder Beitrag hilft bei Futter, medizinischer Versorgung und Unterbringung von Streunerhunden in Bosnien und Serbien.', en: 'Support Hope for Dogs with a donation. Every contribution helps with food, medical care, and shelter for stray dogs in Bosnia and Serbia.' }
  },
  'hond': {
    title: { nl: 'Hond | Hope for Dogs', de: 'Hund | Hope for Dogs', en: 'Dog | Hope for Dogs' },
    desc: { nl: 'Leer meer over deze adoptiehond van Hope for Dogs. Gered van de straat in Bosnië of Servië, medisch behandeld en klaar voor een thuis.', de: 'Erfahre mehr über diesen Adoptionshund von Hope for Dogs. Von der Straße in Bosnien oder Serbien gerettet, medizinisch behandelt und bereit für ein Zuhause.', en: 'Learn more about this adoptable dog from Hope for Dogs. Rescued from the streets of Bosnia or Serbia, medically treated and ready for a home.' }
  },
  'post': {
    title: { nl: 'Nieuws | Hope for Dogs', de: 'Neuigkeiten | Hope for Dogs', en: 'News | Hope for Dogs' },
    desc: { nl: 'Lees dit nieuwsbericht van Hope for Dogs over onze reddingsacties en het leven in het asiel.', de: 'Lies diesen Beitrag von Hope for Dogs über unsere Rettungsaktionen und das Leben im Tierheim.', en: 'Read this news article from Hope for Dogs about our rescue efforts and life at the shelter.' }
  },
  'ervaring': {
    title: { nl: 'Adoptieverhaal | Hope for Dogs', de: 'Adoptionsgeschichte | Hope for Dogs', en: 'Adoption Story | Hope for Dogs' },
    desc: { nl: 'Lees dit adoptieverhaal van Hope for Dogs. Ontdek hoe een straathond uit Bosnië of Servië een liefdevol thuis vond.', de: 'Lies diese Adoptionsgeschichte von Hope for Dogs. Erfahre, wie ein Streunerhund aus Bosnien oder Serbien ein liebevolles Zuhause gefunden hat.', en: 'Read this adoption story from Hope for Dogs. Discover how a stray dog from Bosnia or Serbia found a loving home.' }
  }
};

// The homepage's canonical form is the bare root ('/', '/en/', '/de/') — matches
// the site's pre-existing canonical tag, not '/index.html'.
function h4dCanonicalPath(barePath, lang) {
  if (barePath === 'index.html' || !barePath) {
    return lang === 'nl' ? '/' : '/' + lang + '/';
  }
  return h4dUrlFor(barePath, lang);
}

// Sets document.title/meta description/canonical/OG + injects the hreflang mesh (self +
// both siblings + x-default) for the current page and language. Runs on every page's
// DOMContentLoaded. Detail pages (hond/post/ervaring) override title/description again
// once their per-record fetch completes, but canonical/og:url/hreflang — query string
// included — are already correct here since location.search is available synchronously.
function h4dInitSEOTags() {
  var lang = h4dGetLanguage();
  var bare = h4dStripLangPrefix(location.pathname);
  var barePath = bare.replace(/^\//, '') || 'index.html';
  var pageKey = barePath.replace(/\.html$/, '');
  var seo = H4D_PAGE_SEO[pageKey];

  if (seo) {
    var title = seo.title[lang] || seo.title.nl;
    var desc = seo.desc[lang] || seo.desc.nl;
    document.title = title;
    var descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', desc);
    var ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', title);
    var ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', desc);
  }

  var canonicalEl = document.querySelector('link[rel="canonical"]');
  var selfUrl = H4D_SITE_ORIGIN + h4dCanonicalPath(barePath, lang) + location.search;
  if (canonicalEl) canonicalEl.setAttribute('href', selfUrl);
  var ogUrlEl = document.querySelector('meta[property="og:url"]');
  if (ogUrlEl) ogUrlEl.setAttribute('content', selfUrl);

  // hreflang mesh only makes sense on pages that already carry the standard SEO tags
  // (the 11 indexable templates) — skip noindex/utility pages like bedankt.html.
  if (!canonicalEl) return;
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function (el) { el.remove(); });
  ['nl', 'de', 'en'].forEach(function (l) {
    var link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = l;
    link.href = H4D_SITE_ORIGIN + h4dCanonicalPath(barePath, l) + location.search;
    document.head.appendChild(link);
  });
  var defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = H4D_SITE_ORIGIN + h4dCanonicalPath(barePath, 'nl') + location.search;
  document.head.appendChild(defaultLink);
}

// Rounded flag icons for the language selector (clipped to a circle via CSS)
var H4D_FLAGS = {
  nl: '<svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice"><rect width="3" height="2" fill="#fff"/><rect width="3" height=".6667" fill="#AE1C28"/><rect y="1.3333" width="3" height=".6667" fill="#21468B"/></svg>',
  de: '<svg viewBox="0 0 5 3" preserveAspectRatio="xMidYMid slice"><rect width="5" height="3" fill="#FFCE00"/><rect width="5" height="2" fill="#DD0000"/><rect width="5" height="1"/></svg>',
  en: '<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><rect width="60" height="30" fill="#012169"/><path d="M0 0 60 30 M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M0 0 60 30 M60 0 0 30" stroke="#C8102E" stroke-width="4"/><rect x="25" width="10" height="30" fill="#fff"/><rect y="10" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="30" fill="#C8102E"/><rect y="12" width="60" height="6" fill="#C8102E"/></svg>'
};

function h4dSetLanguage(lang) {
  // Update all elements with data-i18n (text content)
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (H4D_I18N[key] && H4D_I18N[key][lang]) {
      el.textContent = H4D_I18N[key][lang];
    }
  });
  // Update elements with data-i18n-html (innerHTML, for <br> etc.)
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-html');
    if (H4D_I18N[key] && H4D_I18N[key][lang]) {
      el.innerHTML = H4D_I18N[key][lang];
    }
  });
  // Update placeholders (inputs/textareas) via data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-ph');
    if (H4D_I18N[key] && H4D_I18N[key][lang]) {
      el.setAttribute('placeholder', H4D_I18N[key][lang]);
    }
  });
  // Update the nav lang button flag
  var langFlag = document.getElementById('navLangFlag');
  if (langFlag && H4D_FLAGS[lang]) {
    langFlag.innerHTML = H4D_FLAGS[lang];
  }
  // Update active state in dropdown
  document.querySelectorAll('.nav-lang-option').forEach(function (opt) {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });
  // Update html lang attribute
  document.documentElement.lang = lang;
  // Refresh BA section if it exists (index.html)
  if (typeof showBAStory === 'function' && typeof currentBA !== 'undefined') {
    showBAStory(currentBA);
  }
  // Refresh FAQs if loadFaqs exists (over-ons.html)
  if (typeof loadFaqs === 'function') loadFaqs();
  // Refresh dynamic dog cards if renderDogs exists (honden.html)
  if (typeof renderDogs === 'function') renderDogs();
  if (typeof renderAdopted === 'function') renderAdopted();
  // Generic per-page re-render hook (homepage carousel, news list, experiences, etc.)
  if (typeof window.h4dRerender === 'function') { try { window.h4dRerender(lang); } catch (e) {} }
  // Persist
  localStorage.setItem('h4d-lang', lang);
}


// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function () {

  // ===== NAV =====
  var navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    navPlaceholder.outerHTML = '<nav class="nav">' +
      '<div class="nav-inner">' +
        '<a href="' + h4dUrl('index.html') + '" class="nav-logo">' +
          '<img src="logo.png" alt="Hope for Dogs">' +
        '</a>' +
        '<div class="nav-links-wrap">' +
          '<div class="nav-links-icon"><img src="lolo.png" alt=""></div>' +
          '<div class="nav-links-center">' +
            '<a href="' + h4dUrl('index.html') + '" data-nav="index" data-i18n="nav.home">Home</a>' +
            '<a href="' + h4dUrl('honden.html') + '" data-nav="honden" data-i18n="nav.honden">Honden</a>' +
            '<a href="' + h4dUrl('over-ons.html') + '" data-nav="over-ons" data-i18n="nav.overons">Over ons</a>' +
            '<a href="' + h4dUrl('adoptie.html') + '" data-nav="adoptie" data-i18n="nav.adoptie">Adoptie</a>' +
            '<a href="' + h4dUrl('ervaringen.html') + '" data-nav="ervaringen" data-i18n="nav.ervaringen">Ervaringen</a>' +
            '<a href="' + h4dUrl('nieuws.html') + '" data-nav="nieuws" data-i18n="nav.nieuws">Nieuws</a>' +
            '<a href="' + h4dUrl('contact.html') + '" data-nav="contact" data-i18n="nav.contact">Contact</a>' +
          '</div>' +
        '</div>' +
        '<div class="nav-right">' +
          '<div class="nav-lang">' +
            '<button class="nav-lang-btn" id="navLangBtn" aria-label="Taal / Language">' +
              '<span class="nav-lang-flag" id="navLangFlag">' + H4D_FLAGS.nl + '</span>' +
              '<svg class="nav-lang-arrow" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
            '<div class="nav-lang-dropdown" id="navLangDropdown">' +
              '<a href="#" class="nav-lang-option active" data-lang="nl"><span class="nav-lang-flag">' + H4D_FLAGS.nl + '</span>Nederlands</a>' +
              '<a href="#" class="nav-lang-option" data-lang="de"><span class="nav-lang-flag">' + H4D_FLAGS.de + '</span>Deutsch</a>' +
              '<a href="#" class="nav-lang-option" data-lang="en"><span class="nav-lang-flag">' + H4D_FLAGS.en + '</span>English</a>' +
            '</div>' +
          '</div>' +
          '<a href="' + h4dUrl('doneer.html') + '" class="nav-btn nav-btn-desktop" data-nav="doneer" data-i18n="nav.doneer">Doneer nu</a>' +
          '<a href="' + h4dUrl('doneer.html') + '" class="nav-btn nav-btn-mobile" data-nav="doneer" data-i18n="nav.doneer.short">Doneer</a>' +
          '<button class="nav-hamburger" id="navHamburger" aria-label="Menu"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
    '</nav>' +
    '<div class="nav-overlay" id="navOverlay"></div>' +
    '<div class="nav-dropdown" id="navDropdown">' +
      '<div class="nav-dropdown-section-label" data-i18n="nav.taal">Taal</div>' +
      '<div class="nav-dropdown-lang">' +
        '<a href="#" class="nav-dropdown-lang-opt" data-lang="nl"><span class="nav-lang-flag">' + H4D_FLAGS.nl + '</span>Nederlands</a>' +
        '<a href="#" class="nav-dropdown-lang-opt" data-lang="de"><span class="nav-lang-flag">' + H4D_FLAGS.de + '</span>Deutsch</a>' +
        '<a href="#" class="nav-dropdown-lang-opt" data-lang="en"><span class="nav-lang-flag">' + H4D_FLAGS.en + '</span>English</a>' +
      '</div>' +
      '<div class="nav-dropdown-divider"></div>' +
      '<div class="nav-dropdown-socials">' +
        '<a href="https://www.facebook.com/hopefordogseurope" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
          ' Facebook' +
        '</a>' +
        '<a href="https://www.tiktok.com/@hope_for_dogs_europe" target="_blank" rel="noopener noreferrer">' +
          '<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.78a8.21 8.21 0 004.77 1.52V6.84a4.86 4.86 0 01-1-.15z"/></svg>' +
          ' TikTok' +
        '</a>' +
      '</div>' +
    '</div>';

    // Set active nav link
    var page = location.pathname.split('/').pop() || 'index.html';
    var activeNav = null;
    if (page === 'index.html' || page === '' || page === '/') activeNav = 'index';
    else if (page === 'honden.html' || page === 'hond.html') activeNav = 'honden';
    else if (page === 'over-ons.html') activeNav = 'over-ons';
    else if (page === 'nieuws.html') activeNav = 'nieuws';
    else if (page === 'ervaringen.html' || page === 'ervaring.html') activeNav = 'ervaringen';
    else if (page === 'adoptie.html') activeNav = 'adoptie';
    else if (page === 'doneer.html') activeNav = 'doneer';
    else if (location.pathname.indexOf('/beheer') !== -1) activeNav = 'beheer';

    if (activeNav) {
      document.querySelectorAll('.nav-links-center a[data-nav="' + activeNav + '"]').forEach(function (l) {
        l.classList.add('active');
      });
    }

    // Language dropdown toggle (desktop)
    var langBtn = document.getElementById('navLangBtn');
    var langDropdown = document.getElementById('navLangDropdown');
    if (langBtn && langDropdown) {
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
        langBtn.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        langDropdown.classList.remove('open');
        langBtn.classList.remove('open');
      });
      langDropdown.addEventListener('click', function (e) {
        if (e.target.classList.contains('nav-lang-option')) {
          e.preventDefault();
          e.stopPropagation();
          var lang = e.target.getAttribute('data-lang');
          langDropdown.classList.remove('open');
          langBtn.classList.remove('open');
          h4dNavigateToLanguage(lang);
        }
      });
    }

    // Hamburger → dropdown menu
    var hamburger = document.getElementById('navHamburger');
    var dropdown = document.getElementById('navDropdown');
    var overlay = document.getElementById('navOverlay');

    function closeDropdown() {
      if (!hamburger) return;
      hamburger.classList.remove('open');
      if (dropdown) dropdown.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      var navEl = document.querySelector('.nav');
      if (navEl) navEl.classList.remove('nav-menu-open');
    }

    if (hamburger && dropdown && overlay) {
      // Set active language in dropdown
      var currentLang = h4dGetLanguage();
      var activeLangEl = dropdown.querySelector('.nav-dropdown-lang-opt[data-lang="' + currentLang + '"]');
      if (activeLangEl) activeLangEl.classList.add('active');

      hamburger.addEventListener('click', function () {
        var isOpen = dropdown.classList.contains('open');
        if (isOpen) {
          closeDropdown();
        } else {
          hamburger.classList.add('open');
          dropdown.classList.add('open');
          overlay.classList.add('open');
          var navEl = document.querySelector('.nav');
          if (navEl) navEl.classList.add('nav-menu-open');
        }
      });

      // Close on overlay tap
      overlay.addEventListener('click', closeDropdown);

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDropdown();
      });

      // Language options in dropdown
      dropdown.querySelectorAll('.nav-dropdown-lang-opt').forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.preventDefault();
          var lang = opt.getAttribute('data-lang');
          closeDropdown();
          h4dNavigateToLanguage(lang);
        });
      });
    }

    // Dog icon tap → scroll to top
    var linksIcon = document.querySelector('.nav-links-icon');
    if (linksIcon) {
      linksIcon.style.cursor = 'pointer';
      linksIcon.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ===== iOS: FIX NAV TAPS IN SCROLLABLE BAR =====
    // On iOS, overflow-x:auto containers inside position:fixed elements
    // aggressively capture touch events for scroll detection, which
    // prevents link taps from firing. Detect short stationary touches
    // and explicitly trigger navigation.
    document.querySelectorAll('.nav-links-center a[href]').forEach(function(link) {
      var tapX, tapY, tapT;
      link.addEventListener('touchstart', function(e) {
        tapX = e.touches[0].clientX;
        tapY = e.touches[0].clientY;
        tapT = Date.now();
      }, { passive: true });
      link.addEventListener('touchend', function(e) {
        if (!tapT) return;
        var dx = e.changedTouches[0].clientX - tapX;
        var dy = e.changedTouches[0].clientY - tapY;
        var dt = Date.now() - tapT;
        tapT = 0;
        if (dt < 400 && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
          e.preventDefault();
          window.location.href = link.getAttribute('href');
        }
      });
    });

    // ===== NAV SCROLL BEHAVIOR =====
    // At SM/XS: hide logo row on scroll, show dog icon in links bar
    var nav = document.querySelector('.nav');
    if (nav) {
      var navScrolled = false;
      var lastNavY = window.scrollY;
      function updateNavScroll() {
        // Don't update nav scroll state while a Vaul sheet is open —
        // the wrapper becomes position:fixed which drops scrollY to 0
        if (document.body.classList.contains('vaul-sheet-open')) return;
        var y = window.scrollY;
        var delta = y - lastNavY;
        // Collapse when scrolling down; expand again when scrolling up (or near
        // the top) — so you don't have to reach the very top to get the nav back.
        var collapse;
        if (y <= 10) collapse = false;
        else if (delta < -6) collapse = false;  // scrolled up → expand
        else if (delta > 6) collapse = true;     // scrolled down → collapse
        else collapse = navScrolled;             // tiny move → keep current state
        if (collapse !== navScrolled) {
          navScrolled = collapse;
          if (collapse) { nav.classList.add('nav-scrolled'); closeDropdown(); }
          else { nav.classList.remove('nav-scrolled'); }
        }
        lastNavY = y;
      }
      window.addEventListener('scroll', updateNavScroll, { passive: true });
      // Check initial scroll position (e.g. page reload while scrolled)
      updateNavScroll();
    }
  }

  // ===== FOOTER =====
  var footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.outerHTML = '<footer class="footer">' +
      '<div class="footer-inner">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<div class="footer-logo">' +
              '<img src="logo.png" alt="Hope for Dogs">' +
            '</div>' +
            '<p class="footer-tagline" data-i18n="footer.tagline">Wij zijn een non-profit organisatie die zich inzet voor een beter bestaan voor zwerfhonden in Bosni\u00EB en Servi\u00EB.</p>' +
            '<p class="footer-legal">Stichting Hope for Dogs Europe \u00B7 KvK 91166500</p>' +
          '</div>' +
          '<div class="footer-cols">' +
            '<div class="footer-col">' +
              '<h4 data-i18n="footer.paginas">Pagina\u2019s</h4>' +
              '<ul>' +
                '<li><a href="' + h4dUrl('index.html') + '" data-i18n="nav.home">Home</a></li>' +
                '<li><a href="' + h4dUrl('honden.html') + '" data-i18n="nav.honden">Honden</a></li>' +
                '<li><a href="' + h4dUrl('over-ons.html') + '" data-i18n="nav.overons">Over ons</a></li>' +
                '<li><a href="' + h4dUrl('nieuws.html') + '" data-i18n="nav.nieuws">Nieuws</a></li>' +
                '<li><a href="' + h4dUrl('ervaringen.html') + '" data-i18n="nav.ervaringen">Ervaringen</a></li>' +
                '<li><a href="' + h4dUrl('adoptie.html') + '" data-i18n="nav.adoptie">Adoptie</a></li>' +
                '<li><a href="' + h4dUrl('doneer.html') + '" data-i18n="footer.doneer">Doneer</a></li>' +
              '</ul>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h4 data-i18n="footer.contact">Contact</h4>' +
              '<ul>' +
                '<li><a href="mailto:info@hopefordogseurope.com">info@hopefordogseurope.com</a></li>' +
                '<li><a href="https://www.facebook.com/hopefordogseurope" target="_blank" rel="noopener">Facebook</a></li>' +
                '<li><a href="https://www.tiktok.com/@hope_for_dogs_europe" target="_blank" rel="noopener">TikTok</a></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
            '<a href="' + h4dUrl('privacy.html') + '" data-i18n="footer.privacy" style="color:#000;text-decoration:underline;">Privacybeleid</a>' +
            '<span class="footer-copy" data-i18n="footer.copyright">\u00A9 ' + new Date().getFullYear() + ' Hope for Dogs. Alle rechten voorbehouden.</span>' +
          '</div>' +
          '<div class="footer-socials">' +
            '<a href="https://www.facebook.com/hopefordogseurope" target="_blank" rel="noopener noreferrer">' +
              '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '</a>' +
            '<a href="https://www.tiktok.com/@hope_for_dogs_europe" target="_blank" rel="noopener noreferrer">' +
              '<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.78a8.21 8.21 0 004.77 1.52V6.84a4.86 4.86 0 01-1-.15z"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
  }

  // ===== TEAM SECTION =====
  var teamPlaceholder = document.getElementById('team-placeholder');
  if (teamPlaceholder) {
    var clockSvg = '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
    var teamMembers = [
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/2a449ff9-1f76-4ff6-89c7-c7f29051ca88/6e83e274-fe27-44f8-beae-24932940c108.JPG', name: 'Slavica', role: 'Oprichtster &amp; asiel', years: '10+ jaar' },
      { img: 'images/about/team/jennifer.webp', name: 'Jennifer', role: 'Co\u00F6rdinator NL', years: '5 jaar' },
      { img: 'images/about/team/merel.webp', name: 'Merel', role: 'Vrijwilliger', years: '1 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/ebb7b2e5-6a34-4acb-a01d-467f31a10266/1000608236.jpg', name: 'Mira', role: 'Vrijwilliger', years: '3 jaar' },
      { img: 'images/about/mira2.webp', name: 'Mira', role: 'Vrijwilliger', years: '1 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/208b8755-bb96-4fe5-b237-10bab1fb0eb7/lindsay.jpg', name: 'Lindsay', role: 'Vrijwilliger', years: '2 jaar' },
      { img: 'images/about/team/aleksandra.webp', name: 'Aleksandra', role: 'Vrijwilliger', years: '3 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/aa04d042-485e-4fa2-b768-ea4e50906ab5/10152aeb-3d7f-420f-9d22-e3472537d4e2+%281%29.jpg', name: 'Ivana', role: 'Vrijwilliger', years: '8 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/ffbbbe65-db73-474a-b484-4c4f1acaf25b/348892586_1445678299527776_3873644328475865037_n.jpeg', name: 'Mladen', role: 'Vrijwilliger', years: '8 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/078ee273-80ad-416e-99ae-b15172473079/noella.jpg', name: 'No\u00EBlla', role: 'Vrijwilliger', years: '2 jaar' },
      { img: 'https://images.squarespace-cdn.com/content/v1/638d22162df7e0764a499e1a/413db489-786e-4436-8eb7-d2d3bbe645ce/IMG-20260125-WA0077.jpg', name: 'Eva', role: 'Vrijwilliger', years: '1 jaar' }
    ];

    var cardsHtml = teamMembers.map(function(m) {
      return '<div class="team-card">' +
        '<img src="' + m.img + '" alt="' + m.name + '" loading="lazy">' +
        '<div class="team-card-overlay">' +
          '<div class="team-name">' + m.name + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    teamPlaceholder.outerHTML = '<section class="team">' +
      '<div class="team-inner">' +
        '<div class="team-header">' +
          '<h2 data-i18n="index.team.title">Onze vrijwilligers</h2>' +
          '<p data-i18n="index.team.subtitle">Ons team van vrijwilligers uit Nederland, Servi\u00EB en Bosni\u00EB zet zich dag en nacht in voor de zwerfhonden. Samen zijn we hun stem.</p>' +
        '</div>' +
        '<div class="team-carousel-wrap">' +
          '<button class="team-arrow prev hidden" id="teamPrev" onclick="scrollTeam(-1)">' +
            '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>' +
          '</button>' +
          '<div class="team-grid" id="teamGrid">' +
            cardsHtml +
          '</div>' +
          '<button class="team-arrow next" id="teamNext" onclick="scrollTeam(1)">' +
            '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</section>';

    // Team carousel JS
    window.scrollTeam = function(dir) {
      var g = document.getElementById('teamGrid');
      if (!g) return;
      var card = g.querySelector('.team-card');
      if (!card) return;
      var gap = parseFloat(getComputedStyle(g).gap) || 0;
      var scrollAmount = card.offsetWidth + gap;
      g.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    };

    function updateTeamArrows() {
      var g = document.getElementById('teamGrid');
      var prev = document.getElementById('teamPrev');
      var next = document.getElementById('teamNext');
      if (!g || !prev || !next) return;
      prev.classList.toggle('hidden', g.scrollLeft <= 10);
      next.classList.toggle('hidden', g.scrollLeft + g.clientWidth >= g.scrollWidth - 10);
    }

    var teamGrid = document.getElementById('teamGrid');
    if (teamGrid) {
      teamGrid.addEventListener('scroll', updateTeamArrows);
      setTimeout(updateTeamArrows, 100);
    }
  }

  // ===== FAQ SECTION =====
  var faqPlaceholder = document.getElementById('faq-placeholder');
  if (faqPlaceholder) {
    faqPlaceholder.outerHTML =
      '<section class="faq">' +
        '<div class="faq-inner">' +
          '<h2 class="faq-title" data-i18n="faq.title">Veelgestelde vragen</h2>' +
          '<div class="faq-cols" id="faqList"></div>' +
        '</div>' +
        '<div class="faq-divider"></div>' +
      '</section>';

    // Load FAQs from Supabase
    function h4dLoadFaqs() {
      if (typeof supabaseGet !== 'function') {
        setTimeout(h4dLoadFaqs, 100);
        return;
      }
      var lang = typeof h4dGetLanguage === 'function' ? h4dGetLanguage() : 'nl';
      supabaseGet('faqs', 'select=*&order=sort_order.asc,created_at.asc').then(function(faqs) {
        var container = document.getElementById('faqList');
        var section = document.querySelector('.faq');
        if (!container || !section) return;

        if (faqs.length === 0) {
          section.style.display = 'none';
          return;
        }

        section.style.display = '';
        var half = Math.ceil(faqs.length / 2);
        var col1 = faqs.slice(0, half);
        var col2 = faqs.slice(half);

        function faqEscape(str) {
          var d = document.createElement('div');
          d.textContent = str || '';
          return d.innerHTML;
        }

        // Escape first (XSS-safe), then allow a tiny bit of formatting the admin
        // can type: **bold** and line breaks (Enter in the answer field).
        function faqFormat(str) {
          var s = faqEscape(str);
          s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
          s = s.replace(/\r\n|\r|\n/g, '<br>');
          return s;
        }

        function renderFaqCol(items) {
          return '<div class="faq-col">' + items.map(function(f) {
            var q = f['question_' + lang] || f.question_nl;
            var a = f['answer_' + lang] || f.answer_nl;
            return '<div class="faq-item">' +
              '<button class="faq-question">' +
                '<span>' + faqEscape(q) + '</span>' +
                '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>' +
              '</button>' +
              '<div class="faq-answer">' +
                '<div class="faq-answer-inner">' + faqFormat(a) + '</div>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>';
        }

        container.innerHTML = renderFaqCol(col1) + renderFaqCol(col2);

        // Init accordion
        document.querySelectorAll('.faq-question').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var item = btn.closest('.faq-item');
            var answer = item.querySelector('.faq-answer');
            var isOpen = item.classList.contains('open');

            document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
              openItem.classList.remove('open');
              openItem.querySelector('.faq-answer').style.maxHeight = '0';
            });

            if (!isOpen) {
              item.classList.add('open');
              answer.style.maxHeight = answer.scrollHeight + 'px';
            }
          });
        });
        // ===== JSON-LD: FAQ SCHEMA =====
        var faqSchemaItems = faqs.map(function(f) {
          var q = f['question_' + lang] || f.question_nl;
          var a = f['answer_' + lang] || f.answer_nl;
          return {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": a
            }
          };
        });
        // Skip if a server prerender already injected the FAQPage schema (over-ons.php)
        // — one FAQPage per page.
        if (faqSchemaItems.length > 0 && !document.getElementById('ssr-ld-faq')) {
          var faqSchema = document.createElement('script');
          faqSchema.type = 'application/ld+json';
          faqSchema.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqSchemaItems
          });
          document.head.appendChild(faqSchema);
        }

      }).catch(function(err) {
        console.error('Error loading FAQs:', err);
      });
    }

    // Wait for supabase-config.js to load
    if (typeof supabaseGet === 'function') {
      h4dLoadFaqs();
    } else {
      window.addEventListener('load', h4dLoadFaqs);
    }
  }

  // ===== APPLY SAVED LANGUAGE =====
  var savedLang = h4dGetLanguage();
  if (savedLang && savedLang !== 'nl') {
    h4dSetLanguage(savedLang);
  }
  h4dLocalizeStaticLinks();
  h4dInitSEOTags();

  // ===== JSON-LD: ORGANIZATION SCHEMA =====
  var orgSchema = document.createElement('script');
  orgSchema.type = 'application/ld+json';
  orgSchema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    "name": "Hope for Dogs",
    "alternateName": "Hope for Dogs Europe",
    "url": "https://www.hopefordogseurope.com",
    "logo": "https://www.hopefordogseurope.com/logo.png",
    "description": "Non-profit organisatie die straathonden redt in Bosnië en Servië en hen een liefdevol thuis vindt in Nederland, België, Duitsland en Oostenrijk.",
    "email": "info@hopefordogseurope.com",
    "sameAs": [
      "https://www.facebook.com/hopefordogseurope",
      "https://www.instagram.com/hopefordogseurope",
      "https://www.tiktok.com/@hope_for_dogs_europe"
    ],
    "areaServed": [
      {"@type": "Country", "name": "Netherlands"},
      {"@type": "Country", "name": "Belgium"},
      {"@type": "Country", "name": "Germany"},
      {"@type": "Country", "name": "Austria"}
    ],
    "knowsAbout": ["dog adoption", "animal rescue", "stray dogs", "Bosnia and Herzegovina", "Serbia"]
  });
  document.head.appendChild(orgSchema);
});

// ===== CAROUSEL: PHYSICS-BASED DRAG WITH MOMENTUM =====
function h4dCarousel(el) {
  if (!el) return;

  var isDragging = false;
  var wasDragging = false;
  var startX = 0;
  var startY = 0;
  var scrollStart = 0;
  var dirLocked = false;   // true once direction decided
  var isHorizontal = false; // true = horizontal drag locked
  var animId = 0;
  var samples = [];        // {x, t} velocity samples
  var DRAG_THRESHOLD = 4;
  var LOCK_THRESHOLD = 8;
  var FRICTION = 0.95;
  var MIN_VELOCITY = 0.5;  // px/frame

  el.style.cursor = 'grab';

  // --- Click guard: suppress clicks after drag ---
  el.addEventListener('click', function(e) {
    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
      wasDragging = false;
    }
  }, true); // capture phase

  function cancelMomentum() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = 0;
    }
  }

  function disableSnap() {
    el.style.scrollSnapType = 'none';
  }

  function enableSnap() {
    el.style.scrollSnapType = '';
  }

  function addSample(x) {
    var now = performance.now();
    samples.push({ x: x, t: now });
    // keep last 5
    if (samples.length > 5) samples.shift();
  }

  function getVelocity() {
    var now = performance.now();
    // find oldest sample within 100ms window
    var oldest = null;
    for (var i = 0; i < samples.length; i++) {
      if (now - samples[i].t <= 100) {
        oldest = samples[i];
        break;
      }
    }
    if (!oldest || oldest === samples[samples.length - 1]) return 0;
    var latest = samples[samples.length - 1];
    var dt = latest.t - oldest.t;
    if (dt === 0) return 0;
    // px/ms → px/frame (16.67ms)
    return ((latest.x - oldest.x) / dt) * 16.67;
  }

  function startMomentum(velocity) {
    if (Math.abs(velocity) < MIN_VELOCITY) {
      enableSnap();
      return;
    }
    function frame() {
      velocity *= FRICTION;
      if (Math.abs(velocity) < MIN_VELOCITY) {
        animId = 0;
        enableSnap();
        return;
      }
      el.scrollLeft += velocity;
      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }

  // --- Drag start (shared) ---
  function onDragStart(x, y) {
    cancelMomentum();
    enableSnap(); // reset snap before drag starts
    isDragging = false;
    wasDragging = false;
    dirLocked = false;
    isHorizontal = false;
    startX = x;
    startY = y;
    scrollStart = el.scrollLeft;
    samples = [];
    addSample(x);
  }

  // --- Drag move (shared) ---
  // Returns true if this is a horizontal drag move, false if should be ignored
  function onDragMove(x, y, preventFn) {
    var dx = x - startX;
    var dy = y - startY;

    if (!dirLocked) {
      if (Math.abs(dx) < LOCK_THRESHOLD && Math.abs(dy) < LOCK_THRESHOLD) return false;
      dirLocked = true;
      isHorizontal = Math.abs(dx) >= Math.abs(dy);
      if (!isHorizontal) return false; // vertical — abort
      disableSnap();
    }

    if (!isHorizontal) return false;

    if (Math.abs(dx) >= DRAG_THRESHOLD) {
      isDragging = true;
    }

    if (preventFn) preventFn();

    el.scrollLeft = scrollStart - dx;
    addSample(x);

    // cursor feedback (mouse only, touch doesn't need it)
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';

    return true;
  }

  // --- Drag end (shared) ---
  function onDragEnd() {
    if (!isDragging && !dirLocked) {
      // no meaningful drag happened
      el.style.cursor = 'grab';
      return;
    }

    if (isDragging) wasDragging = true;

    el.style.cursor = 'grab';
    el.style.userSelect = '';
    el.style.webkitUserSelect = '';

    if (isHorizontal) {
      var velocity = getVelocity();
      startMomentum(velocity);
    } else {
      enableSnap();
    }

    isDragging = false;
    dirLocked = false;
    isHorizontal = false;
  }

  // --- Mouse events ---
  el.addEventListener('mousedown', function(e) {
    // Only left button
    if (e.button !== 0) return;
    onDragStart(e.pageX, e.pageY);

    function onMouseMove(e) {
      onDragMove(e.pageX, e.pageY, function() { e.preventDefault(); });
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      onDragEnd();
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // --- Touch events ---
  el.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    onDragStart(t.pageX, t.pageY);
  }, { passive: true });

  el.addEventListener('touchmove', function(e) {
    var t = e.touches[0];
    onDragMove(t.pageX, t.pageY, function() { e.preventDefault(); });
  }, { passive: false });

  el.addEventListener('touchend', function() {
    onDragEnd();
  }, { passive: true });
}

// ===== VAUL DRAWER — exact port of https://github.com/emilkowalski/vaul =====
// Constants from vaul/src/constants.ts
var VAUL = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
  CLOSE_THRESHOLD: 0.25,
  VELOCITY_THRESHOLD: 0.4,
  BORDER_RADIUS: 8,
  WINDOW_TOP_OFFSET: 26,
  SCROLL_LOCK_TIMEOUT: 100,
  OVERLAY_ALPHA: 0.4,
  getScale: function() { return (window.innerWidth - VAUL.WINDOW_TOP_OFFSET) / window.innerWidth; },
  spring: function() { return 'cubic-bezier(' + VAUL.EASE.join(',') + ')'; },
  dur: function() { return VAUL.DURATION + 's'; }
};

// Vaul dampen function (helpers.ts) — rubber-band resistance for over-drag
function vaulDampen(v) {
  return 8 * (Math.log(v + 1) - 2);
}

function h4dSheetDrag(modal, overlay, closeFn) {
  if (!modal || !overlay) return;
  var mq = window.matchMedia('(max-width: 767px)');
  var startY = 0, startX = 0, currentY = 0;
  var dragging = false, decided = false;
  var lastY = 0, lastTime = 0, velocityY = 0;
  var openTime = 0;
  var lastScrollTime = 0;

  function drawerH() {
    return modal.offsetHeight || window.innerHeight * 0.92;
  }

  function getWrapper() {
    return document.querySelector('.vaul-wrapper');
  }

  // Vaul's scale/border-radius/translate formulas (use-scale-background.ts)
  function setBg(pct) {
    // Don't touch wrapper if another sheet is open underneath (stacked sheets).
    var others = document.querySelectorAll(
      '.dog-modal-overlay.open, .contact-overlay.open, .modal-overlay.open, .ba-modal-overlay.active'
    );
    var hasOther = false;
    others.forEach(function(el) { if (el !== overlay) hasOther = true; });
    if (hasOther) return;

    var w = getWrapper();
    if (!w) return;
    var s = Math.min(VAUL.getScale() + pct * (1 - VAUL.getScale()), 1);
    var r = VAUL.BORDER_RADIUS - pct * VAUL.BORDER_RADIUS;
    var y = Math.max(0, 14 - pct * 14);
    w.style.transform = 'scale(' + s + ') translate3d(0, ' + y + 'px, 0)';
    w.style.borderRadius = r + 'px';
  }

  function cleanupWrapper() {
    // Don't clean up if another sheet is still open
    if (document.querySelector('.dog-modal-overlay.open, .contact-overlay.open, .modal-overlay.open, .ba-modal-overlay.active')) return;
    var w = getWrapper();
    if (!w) return;
    // Guard against double execution — wrapper already cleaned up
    if (w.style.position !== 'fixed') return;
    var scrollPos = w._savedScroll || 0;

    // Restore nav from absolute back to its default CSS (position:fixed)
    var nav = w.querySelector('.nav');
    if (nav) {
      nav.style.position = '';
      nav.style.top = '';
    }

    // Temporarily override CSS scroll-behavior:smooth to ensure instant scroll.
    // Safari may not fully respect { behavior: 'instant' } in scrollTo options.
    var htmlEl = document.documentElement;
    var prevScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = 'auto';

    // Remove all wrapper/body styles in one synchronous block.
    // The browser won't paint until JS yields, so user never sees scroll=0.
    document.body.classList.remove('vaul-sheet-open');
    document.body.style.overflow = '';
    w.style.position = '';
    w.style.inset = '';
    w.style.overflow = '';
    w.style.transformOrigin = '';
    w.style.transitionProperty = '';
    w.style.transitionDuration = '';
    w.style.transitionTimingFunction = '';
    w.style.transform = '';
    w.style.borderRadius = '';
    delete w._savedScroll;

    // Scroll must happen after position:fixed is removed (body needs scroll height).
    window.scrollTo(0, scrollPos);

    // Restore scroll-behavior on next frame (after scroll has taken effect)
    requestAnimationFrame(function() {
      htmlEl.style.scrollBehavior = prevScrollBehavior;
    });
  }

  function onOpen() {
    // Always start a freshly opened sheet at the top — the element is reused
    // between opens, so a previous scroll position would otherwise carry over.
    modal.scrollTop = 0;
    if (!mq.matches) return;
    var w = getWrapper();
    if (!w) return;
    var dur = VAUL.dur();
    var spring = VAUL.spring();

    // If wrapper is already in sheet mode (switching sheets), just animate this modal
    var alreadyOpen = w.style.position === 'fixed';

    if (!alreadyOpen) {
      // Freeze nav scroll state BEFORE position:fixed collapses body scroll.
      // position:fixed drops scrollY to 0 → scroll listener would remove nav-scrolled.
      document.body.classList.add('vaul-sheet-open');

      // Make wrapper viewport-sized (like Vaul's h-[100dvh] wrapper)
      w._savedScroll = window.scrollY;
      w.style.position = 'fixed';
      w.style.inset = '0';
      w.style.overflow = 'hidden';
      w.scrollTop = w._savedScroll;

      // Nav is position:fixed inside wrapper. When wrapper gets transform,
      // CSS spec makes fixed descendants relative to the transformed ancestor.
      // Reposition nav as absolute at the scroll offset so it stays visible.
      var nav = w.querySelector('.nav');
      if (nav) {
        nav.style.position = 'absolute';
        nav.style.top = w._savedScroll + 'px';
      }

      // Set initial wrapper state (no transform yet)
      w.style.transformOrigin = 'top center';
      w.style.transform = 'scale(1) translate3d(0, 0, 0)';
      w.style.borderRadius = '0px';
    }

    // Let CSS calc(100dvh - 26px) handle the height — dvh dynamically adjusts
    // as Safari's URL bar expands/contracts. JS innerHeight is stale when the
    // URL bar is mid-transition (first open: user scrolled → URL bar hidden →
    // innerHeight is large → sheet overflows when URL bar reappears).
    // Clear any leftover JS height from a previous cycle.
    modal.style.height = '';
    modal.style.maxHeight = '';

    // Clear stale inline styles from previous cycles (prevent unintended animation)
    modal.style.transition = 'none';
    overlay.style.transition = 'none';
    // Push modal off-screen. Use innerHeight as a pixel value (only needs to
    // be "enough" to be off-screen — doesn't need to match the sheet height).
    modal.style.transform = 'translate3d(0, ' + window.innerHeight + 'px, 0)';
    overlay.style.backgroundColor = 'transparent';

    // Force reflow to commit the "no transition + off-screen" state.
    void modal.offsetHeight;

    // Next animation frame: enable transitions, then set the target states.
    // The forced reflow alone is occasionally coalesced by Safari (the sheet
    // snaps to its end position with no animation); the extra rAF guarantees the
    // browser has painted the off-screen start state before we set the target,
    // so every open animates consistently.
    requestAnimationFrame(function() {
      w.style.transitionProperty = 'transform, border-radius';
      w.style.transitionDuration = dur;
      w.style.transitionTimingFunction = spring;
      modal.style.transition = 'transform ' + dur + ' ' + spring;
      overlay.style.transition = 'background-color ' + dur + ' ' + spring;

      // Set target states — synchronized animation for wrapper + modal + overlay
      w.style.transform = 'scale(' + VAUL.getScale() + ') translate3d(0, 14px, 0)';
      w.style.borderRadius = VAUL.BORDER_RADIUS + 'px';
      modal.style.transform = 'translate3d(0, 0, 0)';
      overlay.style.backgroundColor = 'rgba(0,0,0,' + VAUL.OVERLAY_ALPHA + ')';
    });

    document.body.style.overflow = 'hidden';
    openTime = Date.now();
  }

  // Overlay bg-color helper
  function setOverlayBg(alpha) {
    overlay.style.backgroundColor = 'rgba(0,0,0,' + Math.max(0, Math.min(1, alpha)).toFixed(4) + ')';
  }

  // Watch overlay class to detect open/close
  new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.attributeName !== 'class') return;
      var open = overlay.classList.contains('open') || overlay.classList.contains('active');
      if (open) onOpen(); else cleanupWrapper();
    });
  }).observe(overlay, { attributes: true, attributeFilter: ['class'] });

  // Vaul's shouldDrag: walk ancestors checking scroll state
  function canDrag(el) {
    var cur = el;
    while (cur && cur !== modal) {
      if (cur.scrollHeight > cur.clientHeight && cur.scrollTop > 0) return false;
      cur = cur.parentElement;
    }
    return modal.scrollTop <= 0;
  }

  // Track scroll time on all scrollable children (SCROLL_LOCK_TIMEOUT)
  modal.addEventListener('scroll', function() {
    lastScrollTime = Date.now();
  }, { capture: true, passive: true });

  modal.addEventListener('touchstart', function(e) {
    if (!mq.matches) return;
    if (Date.now() - openTime < 500) return;
    if (!canDrag(e.target)) return;
    var t = e.touches[0];
    startY = t.clientY;
    startX = t.clientX;
    currentY = 0;
    dragging = false;
    decided = false;
    lastY = startY;
    lastTime = Date.now();
    velocityY = 0;
  }, { passive: true });

  modal.addEventListener('touchmove', function(e) {
    if (!mq.matches || startY === 0) return;
    if (decided && !dragging) return;
    var t = e.touches[0];
    var dy = t.clientY - startY;
    var dx = t.clientX - startX;

    // Prevent browser scroll early when dragging down from top of content.
    // Must happen before the 10px threshold so the browser doesn't claim the gesture.
    if (!decided && dy > 0 && modal.scrollTop <= 0) {
      e.preventDefault();
    }

    if (!decided) {
      if (Math.abs(dy) < 10 && Math.abs(dx) < 10) return;
      decided = true;
      if (Math.abs(dx) > Math.abs(dy)) return;
      if (Date.now() - lastScrollTime < VAUL.SCROLL_LOCK_TIMEOUT) return;
      if (dy <= 0) { dragging = false; return; }
      dragging = true;
      // Only touch wrapper transition if no other sheet is open (stacked sheets)
      var others = document.querySelectorAll(
        '.dog-modal-overlay.open, .contact-overlay.open, .modal-overlay.open, .ba-modal-overlay.active'
      );
      var hasOther = false;
      others.forEach(function(el) { if (el !== overlay) hasOther = true; });
      if (!hasOther) {
        var w = getWrapper();
        if (w) w.style.transitionDuration = '0s';
      }
    }
    if (!dragging) return;

    var now = Date.now();
    var dt = now - lastTime;
    if (dt > 0) {
      velocityY = Math.abs(t.clientY - lastY) / dt;
      lastY = t.clientY;
      lastTime = now;
    }

    currentY = Math.max(0, dy);
    e.preventDefault();

    modal.style.transition = 'none';
    modal.style.transform = 'translate3d(0,' + currentY + 'px,0)';

    var pct = currentY / drawerH();
    overlay.style.transition = 'none';
    setOverlayBg(VAUL.OVERLAY_ALPHA * (1 - pct));

    setBg(pct);
  }, { passive: false });

  modal.addEventListener('touchend', function() {
    if (!mq.matches || !dragging) { startY = 0; return; }
    dragging = false;
    decided = false;
    startY = 0;

    var h = drawerH();
    var dismiss = currentY >= h * VAUL.CLOSE_THRESHOLD || velocityY > VAUL.VELOCITY_THRESHOLD;
    var spring = VAUL.spring();
    var dur = VAUL.dur();
    var w = getWrapper();

    if (dismiss) {
      modal.style.transition = 'transform ' + dur + ' ' + spring;
      modal.style.transform = 'translate3d(0,100%,0)';
      overlay.style.transition = 'background-color ' + dur + ' ' + spring;
      setOverlayBg(0);
      if (w) w.style.transitionDuration = dur;
      setBg(1);
      setTimeout(function() {
        modal.style.transition = '';
        modal.style.transform = '';
        modal.style.height = '';
        modal.style.maxHeight = '';
        overlay.style.transition = '';
        overlay.style.backgroundColor = '';
        document.body.style.overflow = '';
        overlay.classList.remove('open');
        overlay.classList.remove('active');
        closeFn();
      }, VAUL.DURATION * 1000 + 50);
    } else {
      if (w) w.style.transitionDuration = dur;
      modal.style.transition = 'transform ' + dur + ' ' + spring;
      modal.style.transform = 'translate3d(0, 0, 0)';
      overlay.style.transition = 'background-color ' + dur + ' ' + spring;
      setOverlayBg(VAUL.OVERLAY_ALPHA);
      setBg(0);
      setTimeout(function() {
        modal.style.transition = '';
        overlay.style.transition = '';
      }, VAUL.DURATION * 1000);
    }
    currentY = 0;
  }, { passive: true });
}

// ===== DONATE SECTION: frequency toggle -> carries amount + freq to donate page =====
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.cta-freq').forEach(function (freq) {
    var root = freq.closest('.cta-final-inner') || freq.parentElement;
    function apply(f) {
      freq.querySelectorAll('.cta-freq-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-freq') === f);
      });
      root.querySelectorAll('.cta-cost-item').forEach(function (a) {
        var m = (a.getAttribute('href') || '').match(/bedrag=([^&]+)/);
        var bed = m ? m[1] : '';
        a.setAttribute('href', h4dUrl('doneer.html') + '?bedrag=' + bed + '&freq=' + f);
      });
      var cust = root.querySelector('.cta-cost-custom');
      if (cust) cust.setAttribute('href', h4dUrl('doneer.html') + '?bedrag=eigen&freq=' + f);
    }
    freq.querySelectorAll('.cta-freq-btn').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-freq')); });
    });
    apply('maandelijks');
  });
});


// ===== LOTTERY: cross-page announcement toast + entry modal =====
// Renders a bottom toast on every public page when a lottery is `live`, and a
// number-picker modal that reserves the chosen number(s) and hands off to Mollie.
// Availability + reservation happen server-side (/api/lottery/*) so buyer PII in
// lottery_tickets never reaches the browser. Inert if no live lottery exists.
(function () {
  var EXCLUDE = ['bedankt.html', 'betaling-mislukt.html'];
  function excluded() {
    return EXCLUDE.indexOf((location.pathname.split('/').pop() || '')) !== -1;
  }
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function t(key) {
    var lang = h4dGetLanguage();
    return (H4D_I18N[key] && (H4D_I18N[key][lang] || H4D_I18N[key].nl)) || '';
  }
  function loc(row, field) {
    var lang = h4dGetLanguage();
    return (row && (row[field + '_' + lang] || row[field + '_nl'])) || '';
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function money(cents) { return '€' + (Number(cents || 0) / 100).toFixed(2).replace('.', ','); }
  function translateIn(root) {
    var lang = h4dGetLanguage();
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (H4D_I18N[k] && H4D_I18N[k][lang]) el.textContent = H4D_I18N[k][lang];
    });
  }

  var DEFAULT_IMG = 'lolo.png'; // shown when a lottery has no image of its own
  var current = null;   // active lottery object
  var selected = [];    // chosen numbers (raffle)
  var taken = {};       // number -> true (raffle)
  var mode = 'raffle';  // 'raffle' | 'fundraiser'
  var donAmount = 0;    // chosen donation amount in euros (fundraiser)

  function injectCSS() {
    if (document.getElementById('h4d-lottery-css')) return;
    var css = `
.h4d-lottery-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%) translateY(180%);z-index:1200;width:min(604px,calc(100vw - 24px));background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:20px;box-shadow:0 12px 44px rgba(0,0,0,.18);padding:14px 14px 14px 14px;display:flex;gap:14px;align-items:center;opacity:0;transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .3s;font-family:'Manrope',sans-serif;}
.h4d-lottery-toast.show{transform:translateX(-50%) translateY(0);opacity:1;}
.h4d-lt-media{flex:0 0 auto;width:64px;height:64px;border-radius:14px;overflow:hidden;}
.h4d-lt-media img{width:100%;height:100%;object-fit:cover;display:block;}
.h4d-lt-media.is-default img{object-fit:contain;padding:9px;}
.h4d-lt-body{flex:1 1 auto;min-width:0;}
.h4d-lt-heading{font-family:'Nunito',sans-serif;font-weight:800;font-size:16px;color:var(--dark-1,#1a1a1a);line-height:1.25;margin-bottom:2px;}
.h4d-lt-text{font-size:13.5px;color:var(--dark-2,#555);line-height:1.4;margin-bottom:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.h4d-lt-btn{flex:0 0 auto;align-self:center;white-space:nowrap;background:var(--brand,#ff5314);color:#fff;border:none;border-radius:999px;font-weight:700;font-size:13px;padding:8px 15px;cursor:pointer;font-family:inherit;}
.h4d-lt-btn:hover{filter:brightness(.95);}
.h4d-lt-dismiss{flex:0 0 auto;align-self:center;width:38px;height:38px;border-radius:999px;background:#fff;border:1.5px solid rgba(0,0,0,.18);color:#777;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;font-family:inherit;}
.h4d-lt-dismiss:hover{border-color:rgba(0,0,0,.34);color:#444;}
@media (max-width:520px){.h4d-lottery-toast{left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateY(220%);width:auto;padding:12px;gap:9px;}.h4d-lottery-toast.show{transform:translateY(0);}.h4d-lt-btn{padding:9px 13px;font-size:12.5px;}.h4d-lt-dismiss{width:40px;height:40px;font-size:14px;-webkit-tap-highlight-color:rgba(0,0,0,.1);}}
.h4d-lottery-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1300;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity .25s;font-family:'Manrope',sans-serif;}
.h4d-lottery-overlay.open{opacity:1;pointer-events:auto;}
.h4d-lottery-modal{background:#fff;border-radius:24px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;padding:28px;position:relative;transform:translateY(16px);transition:transform .25s;}
.h4d-lottery-overlay.open .h4d-lottery-modal{transform:none;}
.h4d-lm-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.06);border:none;cursor:pointer;font-size:15px;color:#333;z-index:2;}
.h4d-lm-head{display:flex;flex-direction:column;gap:12px;align-items:flex-start;text-align:left;margin-bottom:18px;}
.h4d-lm-prize{width:76px;height:76px;border-radius:14px;object-fit:cover;flex:0 0 auto;}
.h4d-lm-prize.is-default{object-fit:contain;padding:10px;}
.h4d-lm-prizes{margin:2px 0 0;font-size:13.5px;color:var(--dark-2,#555);line-height:1.5;}
.h4d-lm-prizes b{color:var(--ink,#1a1a1a);}
.h4d-lm-prizes .win{color:var(--brand,#ff5314);font-weight:700;}
.h4d-lm-title{font-family:'Nunito',sans-serif;font-weight:800;font-size:20px;color:var(--dark-1,#1a1a1a);margin:0 0 4px;}
.h4d-lm-desc{font-size:16px;color:var(--dark-2,#555);line-height:1.5;margin:0 0 6px;}
.h4d-lm-price{font-size:13px;color:var(--brand,#ff5314);font-weight:700;margin:0;}
.h4d-lm-sub{font-size:13.5px;color:var(--dark-2,#555);margin:0 0 10px;}
.h4d-lm-grid-wrap{background:var(--beige,#faf8f4);border-radius:16px;padding:14px;margin-bottom:14px;}
.h4d-lm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(35px,1fr));gap:6px;}
.h4d-lm-num{aspect-ratio:1;border:1.25px solid rgba(0,0,0,.12);background:#fff;border-radius:8px;font-weight:700;font-size:11px;color:var(--dark-1,#1a1a1a);cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:transform .1s,background .12s,border-color .12s,color .12s;}
.h4d-lm-num:hover:not(.taken):not(.selected){border-color:var(--brand,#ff5314);}
.h4d-lm-num.selected{background:var(--brand,#ff5314);border-color:var(--brand,#ff5314);color:#fff;transform:scale(1.04);}
.h4d-lm-num.taken{background:rgba(0,0,0,.05);color:#bbb;cursor:not-allowed;text-decoration:line-through;border-color:transparent;}
.h4d-lm-msg{padding:26px;text-align:center;color:var(--dark-2,#555);font-size:14px;}
.h4d-lm-selected{font-size:13.5px;color:var(--dark-2,#555);margin-bottom:14px;min-height:20px;}
.h4d-lm-selected b{color:var(--dark-1,#1a1a1a);}
.h4d-lm-fields{display:flex;gap:12px;margin-bottom:14px;}
.h4d-lm-fields label{flex:1;display:flex;flex-direction:column;gap:5px;font-size:13px;font-weight:600;color:var(--dark-2,#555);}
.h4d-lm-fields input{padding:11px 14px;border:1.5px solid rgba(0,0,0,.1);border-radius:12px;font-size:15px;font-family:inherit;outline:none;}
.h4d-lm-fields input:focus{border-color:var(--brand,#ff5314);}
.h4d-lm-total{font-family:'Nunito',sans-serif;font-weight:800;font-size:18px;color:var(--dark-1,#1a1a1a);margin-bottom:12px;}
.h4d-lm-submit{width:100%;background:var(--brand,#ff5314);color:#fff;border:none;border-radius:999px;font-weight:700;font-size:16px;padding:14px;cursor:pointer;font-family:inherit;}
.h4d-lm-submit:disabled{opacity:.5;cursor:not-allowed;}
.h4d-lm-error{color:#c0392b;font-size:13.5px;margin:10px 0 0;text-align:center;min-height:18px;}
.h4d-lm-terms{margin-top:14px;text-align:center;}
.h4d-lm-terms a{color:var(--dark-2,#555);font-size:12.5px;text-decoration:underline;}
.h4d-lm-terms.empty{display:none;}
.h4d-lm-progress{margin:0 0 16px;}
.h4d-lm-progress .bar{height:12px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden;margin-bottom:8px;}
.h4d-lm-progress .fill{height:100%;background:var(--brand,#ff5314);border-radius:999px;transition:width .4s;}
.h4d-lm-progress .lbl{font-size:14px;color:var(--dark-2,#555);}
.h4d-lm-progress .lbl b{font-family:'Nunito',sans-serif;font-weight:800;color:var(--dark-1,#1a1a1a);}
.h4d-lm-amounts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
.h4d-lm-amt{padding:11px 18px;border:2px solid rgba(0,0,0,.1);background:#fff;border-radius:999px;font-weight:700;font-size:15px;color:var(--dark-1,#1a1a1a);cursor:pointer;font-family:inherit;}
.h4d-lm-amt:hover{border-color:var(--brand,#ff5314);}
.h4d-lm-amt.selected{background:var(--brand,#ff5314);border-color:var(--brand,#ff5314);color:#fff;}
.h4d-lm-amt-custom{position:relative;display:inline-flex;align-items:center;}
.h4d-lm-amt-custom span{position:absolute;left:16px;font-weight:700;color:var(--dark-2,#555);pointer-events:none;}
.h4d-lm-amt-custom input{width:130px;padding:11px 16px 11px 30px;border:2px solid rgba(0,0,0,.1);border-radius:999px;font-weight:700;font-size:15px;font-family:inherit;outline:none;}
.h4d-lm-amt-custom input:focus{border-color:var(--brand,#ff5314);}
.h4d-lm-anon{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--dark-2,#555);margin-bottom:14px;cursor:pointer;}
.h4d-lm-anon input{width:17px;height:17px;accent-color:var(--brand,#ff5314);}
.h4d-lm-donors{margin-top:16px;}
.h4d-lm-donors h4{font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#999;margin:0 0 8px;}
.h4d-lm-donors .row{display:flex;justify-content:space-between;gap:12px;font-size:14px;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06);}
.h4d-lm-donors .row .amt{font-weight:700;color:var(--brand,#ff5314);}
@media (max-width:520px){.h4d-lottery-overlay{align-items:flex-end;padding:0;}.h4d-lottery-modal{max-width:none;border-radius:24px 24px 0 0;max-height:88vh;max-height:88dvh;padding-bottom:calc(28px + env(safe-area-inset-bottom,0px));transform:translateY(100%);}.h4d-lm-fields{flex-direction:column;}.h4d-lm-close{width:40px;height:40px;-webkit-tap-highlight-color:rgba(0,0,0,.1);}}
`;
    var style = document.createElement('style');
    style.id = 'h4d-lottery-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function injectDOM() {
    if (document.getElementById('h4dLotteryToast')) return;

    var toast = document.createElement('div');
    toast.className = 'h4d-lottery-toast';
    toast.id = 'h4dLotteryToast';
    toast.setAttribute('role', 'dialog');
    toast.innerHTML =
      '<div class="h4d-lt-media" id="h4dLtMedia"><img id="h4dLtImg" alt=""></div>' +
      '<div class="h4d-lt-body">' +
        '<div class="h4d-lt-heading" id="h4dLtHeading"></div>' +
        '<div class="h4d-lt-text" id="h4dLtText"></div>' +
      '</div>' +
      '<button class="h4d-lt-btn" id="h4dLtBtn" data-i18n="lottery.enter">Doe mee</button>' +
      '<button class="h4d-lt-dismiss" id="h4dLtDismiss" aria-label="Sluiten">✕</button>';
    document.body.appendChild(toast);

    var overlay = document.createElement('div');
    overlay.className = 'h4d-lottery-overlay';
    overlay.id = 'h4dLotteryOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="h4d-lottery-modal" id="h4dLotteryModal">' +
        '<button class="h4d-lm-close" id="h4dLmClose" aria-label="Sluiten">✕</button>' +
        '<div class="h4d-lm-head">' +
          '<img class="h4d-lm-prize empty" id="h4dLmPrize" alt="">' +
          '<div>' +
            '<h2 class="h4d-lm-title" id="h4dLmTitle"></h2>' +
            '<p class="h4d-lm-desc" id="h4dLmDesc"></p>' +
            '<p class="h4d-lm-price" id="h4dLmPrice"></p>' +
            '<div class="h4d-lm-prizes" id="h4dLmPrizes"></div>' +
          '</div>' +
        '</div>' +
        '<div id="h4dLmRaffle">' +
          '<p class="h4d-lm-sub" data-i18n="lottery.pickSub">Tik op de beschikbare nummers die je wilt kopen.</p>' +
          '<div class="h4d-lm-grid-wrap"><div class="h4d-lm-grid" id="h4dLmGrid"></div></div>' +
          '<div class="h4d-lm-selected" id="h4dLmSelected"></div>' +
        '</div>' +
        '<div id="h4dLmFund" style="display:none">' +
          '<div class="h4d-lm-progress" id="h4dLmProgress"></div>' +
          '<p class="h4d-lm-sub" data-i18n="lottery.donSub">Kies een bedrag om deze actie te steunen.</p>' +
          '<div class="h4d-lm-amounts" id="h4dLmAmounts"></div>' +
        '</div>' +
        '<form class="h4d-lm-form" id="h4dLmForm">' +
          '<div class="h4d-lm-fields">' +
            '<label data-i18n="lottery.name">Naam<input type="text" id="h4dLmName"></label>' +
            '<label data-i18n="lottery.email">E-mailadres<input type="email" id="h4dLmEmail"></label>' +
          '</div>' +
          '<label class="h4d-lm-anon" id="h4dLmAnonWrap" style="display:none"><input type="checkbox" id="h4dLmAnon"><span data-i18n="lottery.anon">Doneer anoniem</span></label>' +
          '<div class="h4d-lm-total" id="h4dLmTotal"></div>' +
          '<button type="submit" class="h4d-lm-submit" id="h4dLmSubmit" data-i18n="lottery.continue">Doorgaan naar betaling</button>' +
          '<p class="h4d-lm-error" id="h4dLmError"></p>' +
        '</form>' +
        '<div class="h4d-lm-donors" id="h4dLmDonors"></div>' +
        '<div class="h4d-lm-terms empty" id="h4dLmTerms"><a id="h4dLmTermsLink" target="_blank" rel="noopener" data-i18n="lottery.terms">Voorwaarden</a></div>' +
      '</div>';
    document.body.appendChild(overlay);

    // The <label> wraps its input, so setting textContent via data-i18n would
    // wipe the input. Move the label text into leading text nodes instead.
    fixFieldLabels();
    translateIn(toast);
    translateIn(overlay);

    document.getElementById('h4dLtDismiss').addEventListener('click', function () { hideToast(true); });
    document.getElementById('h4dLtBtn').addEventListener('click', function () { if (current) window.openLotteryModal(current); });
    document.getElementById('h4dLmClose').addEventListener('click', window.closeLotteryModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) window.closeLotteryModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) window.closeLotteryModal(); });
    document.getElementById('h4dLmForm').addEventListener('submit', submitOrder);
  }

  // Field labels wrap their input; keep the label text as a leading node so
  // data-i18n (which we don't put on them) doesn't clobber the input.
  function fixFieldLabels() {
    var nameLabel = document.querySelector('#h4dLmForm label[data-i18n="lottery.name"]');
    var mailLabel = document.querySelector('#h4dLmForm label[data-i18n="lottery.email"]');
    [ [nameLabel, 'lottery.name'], [mailLabel, 'lottery.email'] ].forEach(function (pair) {
      var lab = pair[0]; if (!lab) return;
      lab.removeAttribute('data-i18n');
      var span = document.createElement('span');
      span.setAttribute('data-i18n', pair[1]);
      span.textContent = t(pair[1]);
      lab.insertBefore(span, lab.firstChild);
      // strip the original leading text node ("Naam"/"E-mailadres")
      var input = lab.querySelector('input');
      lab.childNodes.forEach(function (n) { if (n.nodeType === 3) lab.removeChild(n); });
      lab.appendChild(input);
    });
  }

  function showToast(lottery) {
    var media = document.getElementById('h4dLtMedia');
    var img = document.getElementById('h4dLtImg');
    if (lottery.image_url) { img.src = lottery.image_url; media.classList.remove('is-default'); }
    else { img.src = DEFAULT_IMG; media.classList.add('is-default'); }
    var isFund = lottery.type === 'fundraiser';
    var btn = document.getElementById('h4dLtBtn');
    btn.setAttribute('data-i18n', isFund ? 'lottery.donate' : 'lottery.enter');
    btn.textContent = t(isFund ? 'lottery.donate' : 'lottery.enter');
    document.getElementById('h4dLtHeading').textContent = loc(lottery, 'title') || 'Loterij';
    document.getElementById('h4dLtText').textContent = loc(lottery, 'description') || loc(lottery, 'prize') || '';
    requestAnimationFrame(function () {
      document.getElementById('h4dLotteryToast').classList.add('show');
    });
  }

  function hideToast(persist) {
    var toast = document.getElementById('h4dLotteryToast');
    if (toast) toast.classList.remove('show');
    if (persist && current) {
      try { sessionStorage.setItem('h4d_lottery_dismissed_' + current.id, '1'); } catch (e) {}
    }
  }

  window.openLotteryModal = function (idOrLottery) {
    injectCSS(); injectDOM();
    var id = typeof idOrLottery === 'string' ? idOrLottery : (idOrLottery && idOrLottery.id);
    if (!id) return;
    var overlay = document.getElementById('h4dLotteryOverlay');
    var grid = document.getElementById('h4dLmGrid');
    selected = []; taken = {}; donAmount = 0;
    grid.innerHTML = '<div class="h4d-lm-msg" data-i18n="lottery.loading">' + esc(t('lottery.loading')) + '</div>';
    document.getElementById('h4dLmError').textContent = '';
    document.getElementById('h4dLmSelected').innerHTML = '';
    document.getElementById('h4dLmTotal').textContent = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    fetch('/api/lottery/status.php?id=' + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.lottery) throw new Error('no lottery');
        current = data.lottery;
        mode = current.type === 'fundraiser' ? 'fundraiser' : 'raffle';
        applyMode();
        fillHead(current);
        if (mode === 'fundraiser') {
          renderProgress(data);
          renderAmounts();
          renderDonors(data.donors || []);
          updateDonateTotals();
        } else {
          (data.taken || []).forEach(function (n) { taken[n] = true; });
          renderGrid();
          updateTotals();
        }
      })
      .catch(function () {
        grid.innerHTML = '<div class="h4d-lm-msg">' + esc(t('lottery.err')) + '</div>';
      });
  };

  // Toggle raffle vs fundraiser sections + submit label + required fields.
  function applyMode() {
    var isFund = mode === 'fundraiser';
    document.getElementById('h4dLmRaffle').style.display = isFund ? 'none' : '';
    document.getElementById('h4dLmFund').style.display = isFund ? '' : 'none';
    document.getElementById('h4dLmAnonWrap').style.display = isFund ? 'flex' : 'none';
    document.getElementById('h4dLmDonors').style.display = isFund ? '' : 'none';
    var name = document.getElementById('h4dLmName');
    var email = document.getElementById('h4dLmEmail');
    // Raffle needs name + email; a fundraiser donation can be anonymous.
    if (isFund) { name.removeAttribute('required'); email.removeAttribute('required'); }
    else { name.setAttribute('required', 'required'); email.setAttribute('required', 'required'); }
    var submit = document.getElementById('h4dLmSubmit');
    submit.setAttribute('data-i18n', isFund ? 'lottery.donateNow' : 'lottery.continue');
    submit.textContent = t(isFund ? 'lottery.donateNow' : 'lottery.continue');
  }

  function renderProgress(data) {
    var el = document.getElementById('h4dLmProgress');
    var goal = data.goal_cents ? parseInt(data.goal_cents, 10) : (current.goal_cents ? parseInt(current.goal_cents, 10) : 0);
    var raised = data.raised_cents ? parseInt(data.raised_cents, 10) : 0;
    if (!goal) {
      el.innerHTML = '<div class="lbl"><b>' + money(raised) + '</b> ' + esc(t('lottery.raised')) + '</div>';
      return;
    }
    var pct = Math.max(0, Math.min(100, Math.round(raised / goal * 100)));
    el.innerHTML = '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
      '<div class="lbl"><b>' + money(raised) + '</b> ' + esc(t('lottery.of')) + ' ' + money(goal) + ' ' + esc(t('lottery.raised')) + '</div>';
  }

  function renderAmounts() {
    var el = document.getElementById('h4dLmAmounts');
    var presets = [10, 25, 50, 100, 200];
    el.innerHTML = presets.map(function (a) {
      return '<button type="button" class="h4d-lm-amt" data-amt="' + a + '">€' + a + '</button>';
    }).join('') +
      '<span class="h4d-lm-amt-custom"><span>€</span><input type="number" id="h4dLmCustom" min="1" step="1" placeholder="' + esc(t('lottery.customAmount')) + '"></span>';
    el.querySelectorAll('.h4d-lm-amt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        el.querySelectorAll('.h4d-lm-amt').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        var cust = document.getElementById('h4dLmCustom'); if (cust) cust.value = '';
        donAmount = parseFloat(btn.getAttribute('data-amt')) || 0;
        updateDonateTotals();
      });
    });
    var cust = document.getElementById('h4dLmCustom');
    cust.addEventListener('input', function () {
      el.querySelectorAll('.h4d-lm-amt').forEach(function (b) { b.classList.remove('selected'); });
      donAmount = parseFloat(cust.value) || 0;
      updateDonateTotals();
    });
  }

  function updateDonateTotals() {
    var tot = document.getElementById('h4dLmTotal');
    var submit = document.getElementById('h4dLmSubmit');
    if (donAmount >= 1) {
      tot.textContent = t('lottery.total') + ': ' + money(Math.round(donAmount * 100));
      submit.disabled = false;
    } else {
      tot.textContent = '';
      submit.disabled = true;
    }
  }

  function renderDonors(donors) {
    var el = document.getElementById('h4dLmDonors');
    if (!donors || !donors.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = '<h4>' + esc(t('lottery.recentDon')) + '</h4>' +
      donors.slice(0, 8).map(function (d) {
        return '<div class="row"><span>' + esc(d.name || 'Donateur') + '</span><span class="amt">' + money(d.amount_cents) + '</span></div>';
      }).join('');
  }

  window.closeLotteryModal = function () {
    var overlay = document.getElementById('h4dLotteryOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  function fillHead(lottery) {
    var prize = document.getElementById('h4dLmPrize');
    var psrc = lottery.prize_image_url || lottery.image_url;
    if (psrc) { prize.src = psrc; prize.classList.remove('is-default'); }
    else { prize.src = DEFAULT_IMG; prize.classList.add('is-default'); }
    prize.classList.remove('empty');
    document.getElementById('h4dLmTitle').textContent = loc(lottery, 'title') || 'Loterij';
    document.getElementById('h4dLmDesc').textContent = loc(lottery, 'description') || '';
    var priceEl = document.getElementById('h4dLmPrice');
    if (mode === 'fundraiser') {
      priceEl.style.display = 'none';
    } else {
      priceEl.style.display = '';
      priceEl.textContent = money(lottery.price_cents) + ' ' + t('lottery.perNumber');
    }
    renderPrizes(lottery);
    var terms = document.getElementById('h4dLmTerms');
    var link = document.getElementById('h4dLmTermsLink');
    if (lottery.terms_url) { link.href = lottery.terms_url; terms.classList.remove('empty'); }
    else { terms.classList.add('empty'); }
  }

  function renderPrizes(lottery) {
    var el = document.getElementById('h4dLmPrizes');
    var prizes = lottery.prizes;
    if (!prizes || !prizes.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
    el.style.display = '';
    var drawn = lottery.status === 'drawn';
    var rows = prizes.map(function (p) {
      var label = esc(p.label || '');
      if (drawn && p.number != null && p.number !== '')
        return '<div>🏆 <b>' + label + '</b> — <span class="win">nr. ' + esc(p.number) + '</span></div>';
      return '<div>🏆 ' + label + '</div>';
    }).join('');
    el.innerHTML = '<div style="margin-bottom:4px"><b>' + esc(t('lottery.prizes')) + ':</b></div>' + rows;
  }

  function renderGrid() {
    var grid = document.getElementById('h4dLmGrid');
    var max = Math.max(0, parseInt(current.max_numbers, 10) || 0);
    var html = '';
    for (var n = 1; n <= max; n++) {
      var cls = 'h4d-lm-num';
      if (taken[n]) cls += ' taken';
      else if (selected.indexOf(n) !== -1) cls += ' selected';
      html += '<button type="button" class="' + cls + '"' + (taken[n] ? ' disabled' : '') + ' data-n="' + n + '">' + n + '</button>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.h4d-lm-num:not(.taken)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = parseInt(btn.getAttribute('data-n'), 10);
        var i = selected.indexOf(n);
        if (i === -1) { selected.push(n); btn.classList.add('selected'); }
        else { selected.splice(i, 1); btn.classList.remove('selected'); }
        updateTotals();
      });
    });
  }

  function updateTotals() {
    selected.sort(function (a, b) { return a - b; });
    var sel = document.getElementById('h4dLmSelected');
    var tot = document.getElementById('h4dLmTotal');
    var submit = document.getElementById('h4dLmSubmit');
    if (selected.length === 0) {
      sel.innerHTML = '';
      tot.textContent = '';
      submit.disabled = true;
    } else {
      sel.innerHTML = '<b>' + selected.join(', ') + '</b>';
      tot.textContent = t('lottery.total') + ': ' + money(selected.length * (current.price_cents || 0)) +
        ' (' + selected.length + ' × ' + money(current.price_cents) + ')';
      submit.disabled = false;
    }
  }

  function submitOrder(e) {
    e.preventDefault();
    var name = document.getElementById('h4dLmName').value.trim();
    var email = document.getElementById('h4dLmEmail').value.trim();
    var err = document.getElementById('h4dLmError');
    var submit = document.getElementById('h4dLmSubmit');
    err.textContent = '';

    // Fundraiser: donate an amount (no numbers; name/email optional, anon allowed).
    if (mode === 'fundraiser') {
      if (!(donAmount >= 1)) { err.textContent = t('lottery.needAmount'); return; }
      var anonymous = document.getElementById('h4dLmAnon').checked;
      submit.disabled = true;
      var origF = submit.textContent;
      submit.textContent = '…';
      fetch('/api/lottery/donate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lottery_id: current.id, amount: donAmount, name: name, email: email, anonymous: anonymous })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok && res.d.checkoutUrl) {
            try { localStorage.setItem('h4d_payment_id', res.d.paymentId); } catch (e2) {}
            window.location.href = res.d.checkoutUrl;
            return;
          }
          submit.disabled = false; submit.textContent = origF;
          err.textContent = res.d.error || t('lottery.err');
        })
        .catch(function () { submit.disabled = false; submit.textContent = origF; err.textContent = t('lottery.err'); });
      return;
    }

    if (selected.length === 0) { err.textContent = t('lottery.needSelect'); return; }
    submit.disabled = true;
    var orig = submit.textContent;
    submit.textContent = '…';
    fetch('/api/lottery/create-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lottery_id: current.id, numbers: selected, name: name, email: email })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d.checkoutUrl) {
          try { localStorage.setItem('h4d_payment_id', res.d.paymentId); } catch (e2) {}
          window.location.href = res.d.checkoutUrl;
          return;
        }
        submit.disabled = false; submit.textContent = orig;
        if (res.status === 409 && res.d.taken) {
          taken = {}; res.d.taken.forEach(function (n) { taken[n] = true; });
          selected = selected.filter(function (n) { return !taken[n]; });
          renderGrid(); updateTotals();
          err.textContent = t('lottery.conflict');
        } else {
          err.textContent = res.d.error || t('lottery.err');
        }
      })
      .catch(function () {
        submit.disabled = false; submit.textContent = orig;
        err.textContent = t('lottery.err');
      });
  }

  function init() {
    if (excluded()) return;
    injectCSS();
    injectDOM();

    var params = new URLSearchParams(location.search);
    var qid = params.get('lottery');

    if (typeof supabaseGet === 'function') {
      supabaseGet('lotteries', 'select=*&status=eq.live&order=start_at.desc.nullslast,created_at.desc&limit=1')
        .then(function (rows) {
          var lot = rows && rows[0];
          if (lot) {
            current = lot;
            var dismissed = false;
            try { dismissed = sessionStorage.getItem('h4d_lottery_dismissed_' + lot.id) === '1'; } catch (e) {}
            if (!dismissed && !qid) showToast(lot);
          }
          if (qid) window.openLotteryModal(qid);
        })
        .catch(function () { if (qid) window.openLotteryModal(qid); });
    } else if (qid) {
      window.openLotteryModal(qid);
    }
  }

  ready(init);
})();
