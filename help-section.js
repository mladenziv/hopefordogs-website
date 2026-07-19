// "Hoe kunt u helpen?" — self-contained, translatable accordion.
// Renders into #help-placeholder, reuses the FAQ accordion styling, and
// re-renders when the language changes (observes <html lang>).
(function () {
  var HELP = {
    nl: {
      title: 'Hoe kunt u helpen?',
      intro: 'Wij en de honden zijn enorm dankbaar voor elke bijdrage — hoe groot of klein ook. Elke gift voelt als een lichtpuntje. Hieronder lees je hoe je ons nog meer kunt helpen.',
      items: [
        { t: 'Voer', b:
          '<p>Dankzij jullie donaties konden we al regelmatig voer inslaan — daar zijn we ontzettend dankbaar voor! Maar de honden hebben elke dag voer nodig, dus elke bijdrage is welkom.</p>' +
          '<p><strong>Wat kost één zak voer?</strong></p>' +
          '<ul><li>Puppybrokken: &euro;30 voor 10&nbsp;kg</li><li>Basisbrokken voor volwassen honden: &euro;15 voor 10&nbsp;kg</li><li>Beter voer: &euro;40 voor 15&nbsp;kg</li><li>Blikvoer: &euro;2,50 voor 1&nbsp;kg</li></ul>' +
          '<p>Geef jij onze honden ook een warm hart en een volle buik?</p>' },
        { t: 'Dierenartskosten', b:
          '<p>We reizen bijna dagelijks naar de dierenarts: vaccinaties, huidproblemen door de kou en het vocht in het asiel, kennelhoest, controles, castraties en sterilisaties — en alles wat er verder nodig is.</p>' +
          '<p>Helaas vinden we te vaak gedumpte, zwakke of zieke pups die intensieve zorg nodig hebben, bijvoorbeeld bij de gevreesde Parvo. Een zieke pup heeft dan dagelijks een infuus nodig. Vaak verzorgen we meer pups dan er op de website staan; we wachten met plaatsen tot ze sterk genoeg zijn en hun vaccinaties hebben gehad.</p>' +
          '<p>Honden kunnen zelf niet om hulp vragen — daarom moeten wij hun stem zijn. Op onze website en Facebook (Hope for Dogs Europe) laten we zien welke honden op dit moment medische hulp nodig hebben, met updates over hun herstel. Ook laten we zoveel mogelijk zwerfhonden castreren of steriliseren, om de vicieuze cirkel te doorbreken. Samen maken we het verschil!</p>' },
        { t: 'Ons netwerk vergroten', b:
          '<p>Delen, delen, delen — misschien wel het allerbelangrijkste voor de honden. Blijf onze berichten alsjeblieft delen via je eigen kanalen. Hoe meer bereik, hoe groter de kans dat een hondje zijn gouden mandje vindt — via jou!</p>' +
          '<p>Nu we meer volgers krijgen, merken we dat er meer ge&iuml;nteresseerden reageren en de honden dus meer kans op een thuis hebben. Komt er plek vrij, dan kunnen we soms een hond overnemen uit het gemeenteasiel — voor die hond letterlijk het verschil tussen leven en dood (zoals bij Una).</p>' +
          '<p>Word lid van onze Facebookgroep Hope for Dogs, waar we bijna dagelijks oproepen, updates en filmpjes plaatsen, en bekijk onze voor-en-na-verhalen op Instagram. Soms hebben we ook leuke acties, zoals de verkoop van hondenkoekjes of een loterij — de opbrengst gaat volledig naar de honden.</p>' },
        { t: 'Tijdelijke opvang of sponsoring', b:
          '<p>Kun en wil je tijdelijk een hondje opvangen tot het zijn forever home vindt? Dan help je ons enorm: er komt een plek vrij in het asiel (die we hopelijk kunnen geven aan een hond uit het gemeenteasiel), en het hondje hoeft de koude wintermaanden niet in het asiel door te brengen. Ondertussen leert het alvast wonen in een huis.</p>' +
          '<p><strong>Let op:</strong> hier zijn transportkosten aan verbonden. Als kleine organisatie kunnen we die helaas niet zelf betalen. Wordt het hondje geadopteerd, dan kun je ervoor kiezen dit bedrag terug te krijgen van de adoptant. Twijfel je over de kosten maar wil je w&eacute;l opvangadres zijn? Stuur ons een berichtje — misschien vinden we samen een oplossing.</p>' +
          '<p><strong>Sponsor een tijdelijke (nood)opvang:</strong> bij een overvol asiel zijn er soms tijdelijke opvangplekken van &euro;15 per dag of &euro;40 per maand. Dit is duur, dus we doen het liever niet te snel — maar soms is het onze enige oplossing voor erg zieke pups of zwerfhonden die we niet aan hun lot willen overlaten. Bij zo&rsquo;n noodgeval doen we altijd een oproep op Facebook of de website en zijn we volledig transparant over de kosten.</p>' },
        { t: 'Spullen mee teruggeven', b:
          '<p>Bij elk transport is er ruimte om spullen mee te geven voor de achterblijvers in het asiel. Alles is welkom! Denk aan:</p>' +
          '<ul><li>Kauwbotjes of Dentasticks</li><li>Puppybrokken (het voer is daar twee keer zo duur geworden)</li><li>Tuigjes of riemen die je overhebt (elke maat welkom)</li><li>Jasjes voor de koude wintermaanden (elke maat welkom)</li><li>Speeltjes</li></ul>' +
          '<p>We zijn ontzettend blij met elke gift — het is zo fijn om de honden een extraatje te geven, ze verdienen het zo! Wil je iets meesturen? Stuur ons een berichtje voor het eerstvolgende transport en het actuele verzameladres.</p>' },
        { t: 'Verbetering van ons asiel', b:
          '<p>We hebben van ons asiel al een veel fijnere plek gemaakt dan het was, maar er is altijd ruimte voor verbetering:</p>' +
          '<ul><li><strong>Stro:</strong> heerlijk warm om in te liggen, maar moet vaak vervangen worden — vooral de transportkosten lopen op.</li>' +
          '<li><strong>Schoonmaakspullen:</strong> onmisbaar om de hokken schoon en hygi&euml;nisch te houden.</li>' +
          '<li><strong>Paneelhuisjes:</strong> goed ge&iuml;soleerd, warm en makkelijk schoon te houden. We kunnen ze laten maken voor &euro;128 per stuk. In elke kennel staat er nu &eacute;&eacute;n, maar de 5 tot 7 honden die rondom het asiel wonen kunnen er ook goed gebruiken.</li>' +
          '<li><strong>Hekken:</strong> veel zijn roestig en aan vervanging toe.</li>' +
          '<li><strong>Een dak:</strong> het tussenstuk tussen de kennels is niet overdekt. Nu behelpen we ons met een vrachtwagenzeil; een stevig dak zou de honden veel beter beschermen tegen kou, regen en wind.</li>' +
          '<li><strong>Een overkapping:</strong> het is inmiddels -5&nbsp;&deg;C en de honden buiten de poort liggen in de kou en de nattigheid. Een overkapping met veel stro zou hen beschutting geven.</li>' +
          '<li><strong>Schuifdeuren:</strong> om de gang af te sluiten tegen wind en kou in de wintermaanden.</li></ul>' +
          '<p>Elke gift voor onze honden raakt ons hart en voelt als steun.</p>' }
      ],
      cta: 'Doneer nu'
    },
    en: {
      title: 'How can you help?',
      intro: 'We and the dogs are hugely grateful for every contribution — big or small. Every gift feels like a ray of light. Below you can read how you can help us even more.',
      items: [
        { t: 'Food', b:
          '<p>Thanks to your donations we have been able to buy food regularly — we are incredibly grateful for that! But the dogs need food every single day, so every contribution helps.</p>' +
          '<p><strong>What does one bag of food cost?</strong></p>' +
          '<ul><li>Puppy kibble: &euro;30 for 10&nbsp;kg</li><li>Basic adult kibble: &euro;15 for 10&nbsp;kg</li><li>Better-quality food: &euro;40 for 15&nbsp;kg</li><li>Canned food: &euro;2.50 for 1&nbsp;kg</li></ul>' +
          '<p>Will you give our dogs a warm heart and a full belly too?</p>' },
        { t: 'Vet costs', b:
          '<p>We travel to the vet almost every day: vaccinations, skin problems caused by the cold and damp in the shelter, kennel cough, check-ups, neutering and spaying — and whatever else is needed.</p>' +
          '<p>Sadly we too often find dumped, weak or sick puppies that need intensive care, for example with the dreaded Parvo. A sick puppy then needs a daily IV drip. We often care for more puppies than are shown on the website; we wait to list them until they are strong enough and have had their vaccinations.</p>' +
          '<p>Dogs cannot ask for help themselves — so we have to be their voice. On our website and Facebook (Hope for Dogs Europe) we show which dogs currently need medical help, with updates on their recovery. We also spay or neuter as many street dogs as we can, to help break the endless cycle. Together we make the difference!</p>' },
        { t: 'Growing our network', b:
          '<p>Share, share, share — perhaps the most important thing of all for the dogs. Please keep sharing our posts through your own channels. The more reach, the greater the chance a dog finds its forever home — through you!</p>' +
          '<p>Now that we are gaining more followers, we notice more interested people responding, giving the dogs a better chance at a home. When a spot frees up, we can sometimes take a dog from the municipal shelter — for that dog, literally the difference between life and death (as with Una).</p>' +
          '<p>Join our Facebook group Hope for Dogs, where we post appeals, updates and videos almost daily, and see our before-and-after stories on Instagram. We sometimes run fun campaigns too, such as selling dog biscuits or a raffle — all proceeds go to the dogs.</p>' },
        { t: 'Fostering or sponsoring', b:
          '<p>Can and would you like to foster a dog until it finds its forever home? Then you help us enormously: a spot frees up in the shelter (which we can hopefully give to a dog from the municipal shelter), and the dog does not have to spend the cold winter months in the shelter. In the meantime it already learns what living in a home is like.</p>' +
          '<p><strong>Please note:</strong> transport costs apply. As a small organisation we sadly cannot cover these ourselves. If the dog is adopted, you can choose to be reimbursed by the adopter. Unsure about the costs but still keen to foster? Send us a message — perhaps we can find a solution together.</p>' +
          '<p><strong>Sponsor a temporary (emergency) place:</strong> when the shelter is full, there are sometimes temporary places at &euro;15 per day or &euro;40 per month. This is expensive, so we prefer not to use it too quickly — but sometimes it is our only option for very sick puppies or street dogs we cannot leave behind. In such an emergency we always post an appeal on Facebook or the website and are fully transparent about the costs.</p>' },
        { t: 'Sending items back', b:
          '<p>On every transport there is room to send items back for the dogs still in the shelter. Everything is welcome! Think of:</p>' +
          '<ul><li>Chews or Dentastix</li><li>Puppy kibble (food has become twice as expensive there)</li><li>Harnesses or leashes you no longer use (any size welcome)</li><li>Coats for the cold winter months (any size welcome)</li><li>Toys</li></ul>' +
          '<p>We are so happy with every gift — it is wonderful to give the dogs a little extra, they deserve it so much! Would you like to send something along? Message us for the next transport date and the current collection address.</p>' },
        { t: 'Improving our shelter', b:
          '<p>We have already made our shelter a much nicer place than it was, but there is always room for improvement:</p>' +
          '<ul><li><strong>Straw:</strong> lovely and warm to lie in, but needs replacing often — the transport costs in particular add up.</li>' +
          '<li><strong>Cleaning supplies:</strong> essential to keep the kennels clean and hygienic.</li>' +
          '<li><strong>Panel houses:</strong> well insulated, warm and easy to keep clean. We can have them made for &euro;128 each. There is now one in every kennel, but the 5 to 7 dogs living around the shelter could really use them too.</li>' +
          '<li><strong>Fences:</strong> many are rusty and due for replacement.</li>' +
          '<li><strong>A roof:</strong> the section between the kennels is not covered. For now we make do with a truck tarpaulin; a sturdy roof would protect the dogs far better against cold, rain and wind.</li>' +
          '<li><strong>A canopy:</strong> it is now -5&nbsp;&deg;C and the dogs outside the gate lie in the cold and wet. A canopy with plenty of straw would give them shelter.</li>' +
          '<li><strong>Sliding doors:</strong> to close off the corridor against wind and cold in the winter months.</li></ul>' +
          '<p>Every gift for our dogs touches our hearts and feels like real support.</p>' }
      ],
      cta: 'Donate now'
    },
    de: {
      title: 'Wie k&ouml;nnen Sie helfen?',
      intro: 'Wir und die Hunde sind f&uuml;r jeden Beitrag unglaublich dankbar — ob gro&szlig; oder klein. Jede Gabe f&uuml;hlt sich an wie ein Lichtblick. Nachfolgend lesen Sie, wie Sie uns noch mehr helfen k&ouml;nnen.',
      items: [
        { t: 'Futter', b:
          '<p>Dank Ihrer Spenden konnten wir bereits regelm&auml;&szlig;ig Futter kaufen — daf&uuml;r sind wir unglaublich dankbar! Aber die Hunde brauchen jeden Tag Futter, deshalb ist jeder Beitrag willkommen.</p>' +
          '<p><strong>Was kostet ein Sack Futter?</strong></p>' +
          '<ul><li>Welpenfutter: &euro;30 f&uuml;r 10&nbsp;kg</li><li>Basisfutter f&uuml;r erwachsene Hunde: &euro;15 f&uuml;r 10&nbsp;kg</li><li>Besseres Futter: &euro;40 f&uuml;r 15&nbsp;kg</li><li>Nassfutter: &euro;2,50 f&uuml;r 1&nbsp;kg</li></ul>' +
          '<p>Schenken auch Sie unseren Hunden ein warmes Herz und einen vollen Bauch?</p>' },
        { t: 'Tierarztkosten', b:
          '<p>Wir fahren fast t&auml;glich zum Tierarzt: Impfungen, Hautprobleme durch K&auml;lte und Feuchtigkeit im Tierheim, Zwingerhusten, Kontrollen, Kastrationen und Sterilisationen — und alles Weitere, was gerade n&ouml;tig ist.</p>' +
          '<p>Leider finden wir zu oft ausgesetzte, schwache oder kranke Welpen, die intensive Pflege brauchen, etwa bei der gef&uuml;rchteten Parvo. Ein kranker Welpe braucht dann t&auml;glich eine Infusion. Oft versorgen wir mehr Welpen, als auf der Website stehen; wir warten mit der Vermittlung, bis sie stark genug sind und ihre Impfungen haben.</p>' +
          '<p>Hunde k&ouml;nnen nicht selbst um Hilfe bitten — deshalb m&uuml;ssen wir ihre Stimme sein. Auf unserer Website und bei Facebook (Hope for Dogs Europe) zeigen wir, welche Hunde gerade medizinische Hilfe brauchen, mit Updates zu ihrer Genesung. Au&szlig;erdem lassen wir so viele Stra&szlig;enhunde wie m&ouml;glich kastrieren oder sterilisieren, um den ewigen Kreislauf zu durchbrechen. Gemeinsam machen wir den Unterschied!</p>' },
        { t: 'Unser Netzwerk vergr&ouml;&szlig;ern', b:
          '<p>Teilen, teilen, teilen — vielleicht das Allerwichtigste f&uuml;r die Hunde. Bitte teilen Sie unsere Beitr&auml;ge weiterhin &uuml;ber Ihre eigenen Kan&auml;le. Je mehr Reichweite, desto gr&ouml;&szlig;er die Chance, dass ein Hund sein Zuhause findet — durch Sie!</p>' +
          '<p>Da wir mehr Follower gewinnen, melden sich mehr Interessenten, und die Hunde haben so bessere Chancen auf ein Zuhause. Wird ein Platz frei, k&ouml;nnen wir manchmal einen Hund aus dem st&auml;dtischen Tierheim &uuml;bernehmen — f&uuml;r diesen Hund buchst&auml;blich der Unterschied zwischen Leben und Tod (wie bei Una).</p>' +
          '<p>Werden Sie Mitglied unserer Facebook-Gruppe Hope for Dogs, wo wir fast t&auml;glich Aufrufe, Updates und Videos posten, und sehen Sie unsere Vorher-Nachher-Geschichten auf Instagram. Manchmal haben wir auch sch&ouml;ne Aktionen, etwa den Verkauf von Hundekeksen oder eine Verlosung — der Erl&ouml;s geht vollst&auml;ndig an die Hunde.</p>' },
        { t: 'Pflegestelle oder Patenschaft', b:
          '<p>K&ouml;nnen und m&ouml;chten Sie einen Hund vor&uuml;bergehend aufnehmen, bis er sein Zuhause findet? Dann helfen Sie uns enorm: Im Tierheim wird ein Platz frei (den wir hoffentlich einem Hund aus dem st&auml;dtischen Tierheim geben k&ouml;nnen), und der Hund muss die kalten Wintermonate nicht im Tierheim verbringen. Nebenbei lernt er schon das Leben in einem Zuhause kennen.</p>' +
          '<p><strong>Hinweis:</strong> Hierf&uuml;r fallen Transportkosten an. Als kleine Organisation k&ouml;nnen wir diese leider nicht selbst tragen. Wird der Hund adoptiert, k&ouml;nnen Sie sich den Betrag vom Adoptanten erstatten lassen. Unsicher wegen der Kosten, m&ouml;chten aber gern Pflegestelle sein? Schreiben Sie uns — vielleicht finden wir gemeinsam eine L&ouml;sung.</p>' +
          '<p><strong>&Uuml;bernehmen Sie eine Patenschaft f&uuml;r einen (Not-)Platz:</strong> Bei einem &uuml;berf&uuml;llten Tierheim gibt es manchmal vor&uuml;bergehende Pl&auml;tze f&uuml;r &euro;15 pro Tag oder &euro;40 pro Monat. Das ist teuer, deshalb tun wir es nicht zu schnell — aber manchmal ist es unsere einzige L&ouml;sung f&uuml;r sehr kranke Welpen oder Stra&szlig;enhunde, die wir nicht zur&uuml;cklassen wollen. In einem solchen Notfall rufen wir immer auf Facebook oder der Website auf und sind v&ouml;llig transparent bei den Kosten.</p>' },
        { t: 'Dinge zur&uuml;ckgeben', b:
          '<p>Bei jedem Transport ist Platz, um Dinge f&uuml;r die im Tierheim verbliebenen Hunde mitzugeben. Alles ist willkommen! Zum Beispiel:</p>' +
          '<ul><li>Kauknochen oder Dentastix</li><li>Welpenfutter (das Futter ist dort doppelt so teuer geworden)</li><li>Geschirre oder Leinen, die Sie &uuml;brig haben (jede Gr&ouml;&szlig;e willkommen)</li><li>M&auml;ntelchen f&uuml;r die kalten Wintermonate (jede Gr&ouml;&szlig;e willkommen)</li><li>Spielzeug</li></ul>' +
          '<p>Wir freuen uns riesig &uuml;ber jede Gabe — es ist so sch&ouml;n, den Hunden etwas Extra zu geben, sie haben es so verdient! M&ouml;chten Sie etwas mitschicken? Schreiben Sie uns f&uuml;r den n&auml;chsten Transporttermin und die aktuelle Sammeladresse.</p>' },
        { t: 'Verbesserung unseres Tierheims', b:
          '<p>Wir haben unser Tierheim bereits zu einem viel sch&ouml;neren Ort gemacht, als es war, aber es gibt immer Raum f&uuml;r Verbesserungen:</p>' +
          '<ul><li><strong>Stroh:</strong> herrlich warm zum Liegen, muss aber oft ersetzt werden — vor allem die Transportkosten summieren sich.</li>' +
          '<li><strong>Reinigungsmittel:</strong> unverzichtbar, um die Zwinger sauber und hygienisch zu halten.</li>' +
          '<li><strong>Panelh&auml;uschen:</strong> gut isoliert, warm und leicht zu reinigen. Wir k&ouml;nnen sie f&uuml;r &euro;128 pro St&uuml;ck anfertigen lassen. In jedem Zwinger steht nun eines, aber die 5 bis 7 Hunde, die rund um das Tierheim leben, k&ouml;nnten sie ebenfalls gut gebrauchen.</li>' +
          '<li><strong>Z&auml;une:</strong> viele sind rostig und m&uuml;ssen ersetzt werden.</li>' +
          '<li><strong>Ein Dach:</strong> der Bereich zwischen den Zwingern ist nicht &uuml;berdacht. Derzeit behelfen wir uns mit einer Lkw-Plane; ein stabiles Dach w&uuml;rde die Hunde viel besser vor K&auml;lte, Regen und Wind sch&uuml;tzen.</li>' +
          '<li><strong>Ein Unterstand:</strong> es sind inzwischen -5&nbsp;&deg;C, und die Hunde vor dem Tor liegen in K&auml;lte und N&auml;sse. Ein Unterstand mit viel Stroh w&uuml;rde ihnen Schutz bieten.</li>' +
          '<li><strong>Schiebet&uuml;ren:</strong> um den Gang in den Wintermonaten gegen Wind und K&auml;lte abzuschlie&szlig;en.</li></ul>' +
          '<p>Jede Gabe f&uuml;r unsere Hunde ber&uuml;hrt unser Herz und f&uuml;hlt sich wie echte Unterst&uuml;tzung an.</p>' }
      ],
      cta: 'Jetzt spenden'
    }
  };

  var placeholder = document.getElementById('help-placeholder');
  if (!placeholder) return;

  function lang() {
    var l = (typeof h4dGetLanguage === 'function') ? h4dGetLanguage() : (document.documentElement.lang || 'nl');
    return HELP[l] ? l : 'nl';
  }

  function render() {
    var c = HELP[lang()];
    var half = Math.ceil(c.items.length / 2);
    function col(items) {
      return '<div class="faq-col">' + items.map(function (it) {
        return '<div class="faq-item help-item">' +
          '<button class="faq-question" type="button"><span>' + it.t + '</span>' +
          '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg></button>' +
          '<div class="faq-answer"><div class="faq-answer-inner help-answer-inner">' + it.b + '</div></div>' +
          '</div>';
      }).join('') + '</div>';
    }
    placeholder.innerHTML =
      '<div class="faq-inner">' +
        '<h2 class="faq-title">' + c.title + '</h2>' +
        '<p class="help-intro">' + c.intro + '</p>' +
        '<div class="faq-cols">' + col(c.items.slice(0, half)) + col(c.items.slice(half)) + '</div>' +
        '<div class="help-cta"><a href="#doneer-top" class="btn-primary">' + c.cta + '</a></div>' +
      '</div>';

    // Accordion behaviour (independent of the shared FAQ script)
    placeholder.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var answer = item.querySelector('.faq-answer');
        var isOpen = item.classList.contains('open');
        placeholder.querySelectorAll('.faq-item.open').forEach(function (o) {
          o.classList.remove('open');
          o.querySelector('.faq-answer').style.maxHeight = '0';
        });
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    // "Donate now" scrolls back up to the amount picker
    var cta = placeholder.querySelector('.help-cta a');
    if (cta) cta.addEventListener('click', function (e) {
      e.preventDefault();
      var form = document.querySelector('.donate-form-section') || document.body;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  render();

  // Re-render when the language changes (applyLanguage sets <html lang>)
  var lastLang = document.documentElement.lang;
  new MutationObserver(function () {
    if (document.documentElement.lang !== lastLang) {
      lastLang = document.documentElement.lang;
      render();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
