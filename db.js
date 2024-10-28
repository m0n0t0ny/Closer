const db = {
  title: "Closər",
  subtitle: "Ad ogni carta più vicini",
  categories: [
    {
      id: "emotions",
      category: "Emozioni e Bisogni",
      icon: "💕",
      color: "#d7868a",
      questions: [
        "Che cosa vorresti sentirti dire più spesso?",
        "Qual è il gesto d'affetto che ti fa sentire più amatə?",
        "Quando ti senti più solə nella nostra relazione?",
        "In quale momento ti sei sentitə più compresə da me?",
        "Cosa ti fa sentire più vulnerabile con me?",
        "Come posso farti sentire più sicurə quando sei in difficoltà?",
        "Quale emozione ti è più difficile esprimere con me?",
        "In quali momenti senti più forte il bisogno del mio supporto?",
        "Quale tua insicurezza vorresti condividere con me?",
        "Come reagisci interiormente quando mi vedi triste?",
        "Quale aspetto della nostra intimità emotiva vorresti approfondire?",
        "Quando ti senti più liberə di essere te stessə con me?",
        "Quale paura non hai mai avuto il coraggio di confidarmi?",
        "Come vorresti essere consolatə nei momenti di sconforto?",
        "Quale emozione provi più spesso quando pensi a noi?",
        "In quali situazioni ti senti emotivamente disconnessə da me?",
        "Quale aspetto del mio modo di amarti ti fa sentire più speciale?",
        "Come posso aiutarti a sentirti più accettatə?",
        "Quale emozione vorresti imparare a gestire meglio insieme?",
        "In quali momenti senti più forte il bisogno di una mia carezza?",
      ],
    },
    {
      id: "moments",
      category: "Momenti Condivisi",
      icon: "✨",
      color: "#6ccef6",
      questions: [
        "Qual è il ricordo più bello che hai di noi due?",
        "Quale momento della nostra storia vorresti rivivere?",
        "Quando ti sei resə conto di esserti innamoratə?",
        "Qual è stata la sorpresa più bella che ti ho fatto?",
        "In quale momento ti sei sentitə più orgogliosə di noi come coppia?",
        "Qual è stata la sfida più grande che abbiamo superato insieme?",
        "Quale piccolo gesto quotidiano ti fa più piacere condividere con me?",
        "Qual è stato il momento più divertente della nostra relazione?",
        "Quale viaggio insieme ti ha lasciato i ricordi più belli?",
        "Quale momento difficile ci ha resi più forti come coppia?",
        "Quale nostra tradizione ti sta più a cuore?",
        "Quale coincidenza ci ha fatto incontrare o avvicinare?",
        "Quale momento ti ha fatto capire che potevi fidarti di me?",
        "Quale nostro inside joke ti fa sempre sorridere?",
        "Quale momento di crescita abbiamo vissuto insieme?",
        "Quale esperienza condivisa ci ha unito di più?",
        "Quale fotografia insieme ami di più e perché?",
        "Quale momento di complicità ricordi con più affetto?",
        "Quale ostacolo superato insieme ti rende più orgogliosə?",
        "Quale piccola vittoria abbiamo festeggiato insieme?",
      ],
    },
    {
      id: "growth",
      category: "Crescita e Comprensione",
      icon: "🌱",
      color: "#bfd82d",
      questions: [
        "Cosa hai imparato su te stessə grazie alla nostra relazione?",
        "In che modo ti senti cambiatə da quando stiamo insieme?",
        "Quale aspetto del mio carattere ti ha aiutato a crescere?",
        "Cosa vorresti che io capisse meglio di te?",
        "Quale paura vorresti superare insieme a me?",
        "Come possiamo crescere insieme come coppia?",
        "Quale aspetto del tuo carattere vorresti migliorare per noi?",
        "Come la nostra relazione ti ha aiutato a maturare?",
        "Quale lezione di vita abbiamo imparato insieme?",
        "In che modo mi hai aiutato a diventare una persona migliore?",
        "Quale compromesso ti ha insegnato qualcosa di importante?",
        "Come possiamo aiutarci a vicenda a realizzare i nostri obiettivi?",
        "Quale scoperta su di te ti ha sorpreso durante la nostra relazione?",
        "Come possiamo sostenerci meglio nei momenti di cambiamento?",
        "Quale aspetto della tua personalità è sbocciato grazie a noi?",
        "Quale difficoltà personale hai superato con il mio supporto?",
        "Come possiamo evolverci insieme mantenendo la nostra individualità?",
        "Quale nuovo interesse hai sviluppato grazie alla nostra relazione?",
        "Come possiamo aiutarci a superare le nostre insicurezze?",
        "Quale aspetto del nostro rapporto vorresti far crescere di più?",
      ],
    },
    {
      id: "dreams",
      category: "Desideri e Sogni",
      icon: "🌠",
      color: "#3974d5",
      questions: [
        "Qual è un sogno che vorresti realizzare insieme?",
        "Come immagini la nostra relazione tra 5 anni?",
        "Quale avventura vorresti vivere con me?",
        "Cosa ti piacerebbe scoprire di nuovo in me?",
        "Quale aspetto della nostra intimità vorresti esplorare di più?",
        "Che tipo di ricordi vorresti creare insieme?",
        "Quale progetto di vita vorresti costruire con me?",
        "Quale luogo speciale vorresti visitare insieme?",
        "Quale tradizione vorresti iniziare come coppia?",
        "Come vorresti che festeggiassimo i nostri traguardi?",
        "Quale skill o hobby vorresti imparare insieme?",
        "Quale aspetto della vita domestica vorresti costruire insieme?",
        "Quale sfida vorresti affrontare al mio fianco?",
        "Quale momento magico vorresti vivere con me?",
        "Quale piccolo sogno quotidiano vorresti realizzare insieme?",
        "Quale esperienza di crescita vorresti condividere?",
        "Come vorresti che ci supportassimo nei nostri sogni individuali?",
        "Quale nuovo capitolo vorresti iniziare insieme?",
        "Quale aspetto della nostra relazione vorresti esplorare di più?",
        "Quale sogno nel cassetto vorresti condividere con me?",
      ],
    },
    {
      id: "communication",
      category: "Comunicazione e Comprensione",
      icon: "🤝",
      color: "#f5cb48",
      questions: [
        "Come posso sostenerti meglio nei momenti difficili?",
        "Qual è il modo migliore per comunicare con te quando sei arrabbiatə?",
        "Cosa ti fa sentire davvero ascoltatə?",
        "Quale incomprensione ricorrente vorresti risolvere?",
        "Come posso mostrarti meglio il mio amore?",
        "Cosa ti aiuta a sentirti più conressə con me?",
        "Quale argomento ti è difficile affrontare con me?",
        "Come preferisci ricevere le critiche costruttive?",
        "Quale tipo di comunicazione ti fa sentire più vicinə a me?",
        "Come posso capire meglio i tuoi silenzi?",
        "Quale modo di esprimere affetto apprezzi di più?",
        "Come posso farti sentire più ascoltatə nelle discussioni?",
        "Quale aspetto della nostra comunicazione vorresti migliorare?",
        "Come posso sostenerti meglio quando sei stressatə?",
        "Quale tipo di linguaggio d'amore preferisci ricevere?",
        "Come possiamo gestire meglio i conflitti?",
        "Quale argomento vorresti discutere più apertamente?",
        "Come posso dimostrarti meglio la mia comprensione?",
        "Quale modalità di dialogo ti fa sentire più sicurə?",
        "Come possiamo comunicare meglio i nostri bisogni?",
      ],
    },
    {
      id: "intimacy",
      category: "Intimità",
      icon: "🔥",
      color: "#e46f16",
      isIntimacy: true,
      questions: [
        "Qual è la tua più grande fantasia che non hai mai condiviso con me?",
        "Quale parte del mio corpo ti attrae di più e perché?",
        "C'è qualcosa che vorresti esplorare insieme intimamente?",
        "Qual è stato il momento più passionale che abbiamo vissuto?",
        "Cosa ti fa sentire più desideratə?",
        "Come posso farti sentire più a tuo agio nell'intimità?",
        "Quale tipo di preliminari preferisci?",
        "C'è qualcosa che vorresti provare ma non hai mai osato chiedere?",
        "Qual è il tuo modo preferito di essere sedottə?",
        "Come posso farti sentire più sicurə durante i momenti intimi?",
        "Quale atmosfera ti fa sentire più in vena?",
        "C'è un posto dove vorresti fare l'amore che non abbiamo mai provato?",
        "Qual è la cosa più eccitante che potrei sussurrarti?",
        "Come preferisci essere toccatə?",
        "Quale fantasia vorresti realizzare insieme?",
        "Cosa ti fa sentire più connessə con me durante l'intimità?",
        "Quale momento intimo ti ha fatto sentire più amatə?",
        "C'è qualcosa che vorresti cambiare nella nostra vita intima?",
        "Quale è il tuo mood perfetto per una serata romantica?",
        "Come possiamo rendere i nostri momenti intimi ancora più speciali?",
      ],
    },
    {
      id: "tabu",
      category: "Tabù",
      icon: "💣",
      color: "#383838",
      isTabu: true,
      questions: [
        "Quale parte del mio aspetto fisico cambieresti se potessi?",
        "Quale mia abitudine ti fa venire voglia di urlarmi contro?",
        "Quale mia insicurezza trovi davvero insopportabile?",
        "In quali momenti ti vergogni di me?",
        "Quale mio comportamento ti fa pensare 'ma che ho fatto a mettermi con tə'?",
        "Quale mio difetto fisico noti sempre ma non mi hai mai detto?",
        "Quale parte del mio carattere speri proprio che nostrə figlə non erediti?",
        "In quali situazioni sociali vorresti che io fossi diversə?",
        "Quale mio atteggiamento ti fa pensare che io sia infantile?",
        "Quale mia caratteristica ti fa dubitare del nostro futuro insieme?",
        "Qual è la cosa più imbarazzante che faccio in pubblico?",
        "Quale mio comportamento ti fa sentire superiore a me?",
        "In quali situazioni pensi che io sia incompetente?",
        "Quale mio difetto caratteriale ti spaventa per il nostro futuro?",
        "Quale mia abitudine ti fa pensare che io sia trasandatə?",
        "In quali momenti ti senti intellettualmente superiore a me?",
        "Quale aspetto del mio modo di essere ti fa pensare 'può fare di meglio'?",
        "Quale mia caratteristica ti fa pensare che io sia immaturə?",
        "In quali momenti ti faccio perdere la pazienza più velocemente?",
        "Quale aspetto del mio carattere ti fa pensare che dovrei andare in terapia?",
        "Quale verità mi hai sempre nascosto per paura di ferirmi?",
        "In quale momento ti ho delusə profondamente ma non me l'hai mai detto?",
        "Quale parte di te senti di non poter mai mostrare quando sei con me?",
        "Quale mio comportamento ti ha fatto sentire traditə o abbandonatə?",
        "Quale aspetto del mio modo di amare trovi deludente?",
      ],
      instructions: `
        💡 Prima di rispondere ricorda:
        - Queste domande sono pensate per essere scomode
        - L'obiettivo è crescere insieme, non ferirsi
        - Se una domanda è troppo difficile, potete saltarla
        - Cercate di mantenere un dialogo costruttivo
        - È ok prendersi una pausa se le emozioni sono troppo intense
        - Concludete sempre con qualcosa che amate dell'altrə
      `,
    },
    {
      id: "obligations",
      category: "Obblighi",
      icon: "🔗",
      color: "#6c5ae4",
      isObligation: true,
      questions: [
        "mi farà un massaggio rilassante di almeno 15 minuti",
        "mi preparerà la mia cena preferita questa settimana",
        "farà con me quell'attività che si è sempre rifiutatə di provare",
        "mi regalerà un momento di coccole senza telefono per almeno 30 minuti",
        "organizzerà per me una serata romantica a sorpresa",
        "mi preparerà un bagno caldo con candele e massaggio",
        "sarà lə miə schiavə personale per un'ora",
        "ballerà per me la sua canzone più sexy",
        "mi porterà a cena nel mio ristorante preferito",
        "mi farà da camerierə personale per una serata intera",
        "realizzerà una mia fantasia erotica",
        "mi farà un servizio fotografico sexy solo per me",
        "si lascerà bendare e mi farà fare quello che voglio per 10 minuti",
        "mi darà il controllo completo su di sé per 20 minuti",
        "mi farà uno strip-tease con la canzone che scelgo",
        "mi farà un massaggio erotico con oli essenziali",
        "sarà il mio cuscino umano per un intero film",
        "mi porterà la colazione a letto nel weekend",
        "mi farà 3 complimenti sinceri ogni giorno per una settimana",
        "comprerà e indosserà un indumento a mia scelta",
      ],
      instructions: `
        💡 Ricorda che gli obblighi sono un'opportunità, non un vincolo:

        • Il consenso è sempre la priorità
        - Nessun obbligo deve mai farti sentire a disagio o in pericolo
        - Se qualcosa ti mette ansia, parlane apertamente col partner
        - È perfettamente ok dire "non me la sento" o "non ora"
        - Non usare mai gli obblighi per forzare limiti inappropriati

        • Focus sulla connessione
        - Gli obblighi sono un modo per esplorare nuove dimensioni insieme
        - L'obiettivo è rafforzare l'intimità e la fiducia reciproca
        - Non è una competizione o un modo per "vincere" sull'altrə
        - Cerca di vedere ogni obbligo come un'opportunità di crescita

        • Comunicazione aperta
        - Discutete apertamente di eventuali modifiche agli obblighi
        - Stabilite insieme limiti e confini chiari
        - Siate onesti riguardo le vostre sensazioni
        - Create un ambiente sicuro per esprimere dubbi o preoccupazioni

        • Divertimento e leggerezza
        - Mantieni un approccio giocoso e leggero
        - Non prenderti troppo sul serio
        - Goditi il processo di scoperta reciproca
        - Celebra i momenti di connessione che si creano

        💡 Ricorda: Lo scopo è avvicinarvi e connettervi maggiormente, non allontanarvi o creare tensioni. Sii apertə a nuove esperienze ma sempre nel rispetto dei tuoi limiti e di quelli del partner.
      `,
      isIntimate: true,
    },
  ],
};

export default db;
