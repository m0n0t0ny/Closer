import db from "./db.js";

class LinkGame {
  constructor() {
    this.fullDeck = [];
    this.currentDeck = [];
    this.isFlipped = false;
    this.currentCard = null;
    this.players = null;
    this.currentPlayerIndex = 0;
    this.intimateMode = false;
    this.initializeSounds();
    this.initializeElements();
    this.addIntimateToggle();
    this.initializeFullDeck();
    this.getPlayerNames();
  }

  initializeElements() {
    document.querySelector(".subtitle").textContent = db.subtitle;

    this.cardElement = document.querySelector(".card");
    this.categoryElement = document.querySelector(".category");
    this.questionElement = document.querySelector(".question");
    this.cardFrontElement = document.querySelector(".card-front");
    this.cardBackElement = document.querySelector(".card-back");
  }

  addIntimateToggle() {
    // Creiamo il container per il toggle
    const toggleContainer = document.createElement("div");
    toggleContainer.classList.add("intimate-mode-toggle");
    toggleContainer.innerHTML = `
      <div class="toggle-wrapper">
        <label class="toggle">
          <input type="checkbox" id="intimateToggle">
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">Modalità Intima</span>
      </div>
    `;

    // Aggiungiamo gli stili
    const style = document.createElement("style");
    style.textContent = `
      .intimate-mode-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: white;
        padding: 10px 15px;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .toggle {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      .toggle input:checked + .toggle-slider {
        background-color: #FF69B4;
      }

      .toggle input:checked + .toggle-slider:before {
        transform: translateX(26px);
      }

      .toggle-label {
        font-size: 0.9rem;
        color: #666;
        user-select: none;
      }
    `;

    // Aggiungiamo gli stili al documento
    document.head.appendChild(style);

    // Aggiungiamo il container al body
    document.body.appendChild(toggleContainer);

    // Aggiungiamo l'event listener
    const toggleCheckbox = document.getElementById("intimateToggle");
    if (toggleCheckbox) {
      toggleCheckbox.addEventListener("change", (e) => {
        this.intimateMode = e.target.checked;
        console.log("Modalità intima cambiata:", this.intimateMode);

        // Ricrea il mazzo con le nuove impostazioni
        this.initializeFullDeck();
        this.shuffleDeck();

        // Feedback visivo
        const message = this.intimateMode
          ? "Modalità intima attivata 💝"
          : "Modalità intima disattivata";

        this.showNotification(message);
      });
    }
  }

  // Aggiunta di un metodo per verificare il contenuto del mazzo
  debugDeck() {
    console.log("--- Stato attuale del mazzo ---");
    console.log("Modalità intima:", this.intimateMode);
    console.log("Numero totale carte:", this.currentDeck.length);
    const categories = new Set(this.currentDeck.map((card) => card.category));
    console.log("Categorie presenti:", Array.from(categories));
    console.log("-------------------------");
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add("game-notification");
    notification.textContent = message;

    // Stili per la notifica
    const style = document.createElement("style");
    style.textContent = `
      .game-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 1000;
        animation: fadeInOut 2s forwards;
      }

      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        85% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Rimuoviamo la notifica dopo l'animazione
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  showFeedbackInstructions() {
    const instructions = db.categories.find(
      (c) => c.id === "feedback"
    ).instructions;

    const instructionsElement = document.createElement("div");
    instructionsElement.id = "feedback-instructions";
    instructionsElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 71, 87, 0.95);
      color: white;
      padding: 15px 25px;
      border-radius: 15px;
      font-size: 0.9rem;
      max-width: 90%;
      width: 400px;
      box-shadow: 0 4px 15px rgba(255, 71, 87, 0.2);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
      white-space: pre-line;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    instructionsElement.textContent = instructions;
    document.body.appendChild(instructionsElement);
  }

  hideFeedbackInstructions() {
    const instructionsElement = document.getElementById(
      "feedback-instructions"
    );
    if (instructionsElement) {
      instructionsElement.remove();
    }
  }

  // Aggiorna initializeFullDeck per includere le istruzioni nelle carte
  initializeFullDeck() {
    this.fullDeck = db.categories
      .filter((category) => !category.isIntimate || this.intimateMode)
      .flatMap((category) =>
        category.questions.map((question) => ({
          category: category.category,
          question: question,
          icon: category.icon,
          color: category.color,
          instructions: category.instructions,
        }))
      );
  }

  initializeSounds() {
    this.sounds = {
      flip: new Audio("./sounds/flip.mp3"),
      shuffle: new Audio("./sounds/shuffle.mp3"),
      click: new Audio("./sounds/click.mp3"),
    };

    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.5;
    });
  }

  playSound(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  initializeElements() {
    document.querySelector(".subtitle").textContent = db.subtitle;

    this.cardElement = document.querySelector(".card");
    this.categoryElement = document.querySelector(".category");
    this.questionElement = document.querySelector(".question");
    this.cardFrontElement = document.querySelector(".card-front");
    this.cardBackElement = document.querySelector(".card-back");
  }

  initializeFullDeck() {
    console.log("Stato modalità intima:", this.intimateMode);
    console.log(
      "Categorie prima del filtro:",
      db.categories.map((c) => c.category)
    );

    // Filtra le categorie prima di creare il mazzo
    const filteredCategories = db.categories.filter((category) => {
      // Una categoria viene inclusa se:
      // - Non è intima (isIntimate non è presente o è false)
      // - È intima ma la modalità intima è attiva
      const shouldInclude =
        !category.isIntimate || (category.isIntimate && this.intimateMode);
      console.log(
        `Categoria ${category.category}: isIntimate=${category.isIntimate}, inclusa=${shouldInclude}`
      );
      return shouldInclude;
    });

    // Creiamo il mazzo dalle categorie filtrate
    this.fullDeck = filteredCategories.flatMap((category) =>
      category.questions.map((question) => ({
        category: category.category,
        question: question,
        icon: category.icon,
        color: category.color,
        instructions: category.instructions,
      }))
    );

    console.log("Numero di carte nel mazzo:", this.fullDeck.length);
  }

  getPlayerNames() {
    // Crea il form per i nomi dei giocatori
    const formHTML = `
      <div class="players-form" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        ">
          <h2 style="margin-bottom: 1.5rem; color: #1a1c1e;">Inserisci i nomi dei giocatori</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="player1" placeholder="Nome Giocatore 1" style="
              padding: 0.5rem;
              border: 2px solid #6c5ce7;
              border-radius: 0.5rem;
              font-size: 1rem;
            ">
            <input type="text" id="player2" placeholder="Nome Giocatore 2" style="
              padding: 0.5rem;
              border: 2px solid #6c5ce7;
              border-radius: 0.5rem;
              font-size: 1rem;
            ">
            <button id="startGame" style="
              padding: 0.5rem 1rem;
              background: #6c5ce7;
              color: white;
              border: none;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
            ">Inizia il Gioco</button>
          </div>
        </div>
      </div>
    `;

    const formContainer = document.createElement("div");
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);

    document.getElementById("startGame").addEventListener("click", () => {
      const player1Name =
        document.getElementById("player1").value.trim() || "Giocatore 1";
      const player2Name =
        document.getElementById("player2").value.trim() || "Giocatore 2";

      this.players = [{ name: player1Name }, { name: player2Name }];

      // Rimuovi il form
      formContainer.remove();

      // Inizializza il gioco
      this.initializePlayersUI();
      this.shuffleDeck();
      this.addEventListeners();
      this.updatePlayerTurn();
    });
  }

  initializePlayersUI() {
    // Crea e inserisci l'UI dei giocatori
    const playersUI = document.createElement("div");
    playersUI.classList.add("players-container");
    playersUI.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      font-size: 1.2rem;
    `;

    playersUI.innerHTML = `
      <div id="player1-container" class="player-info" style="
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: background 0.3s;
      ">
        <span class="player-name">${this.players[0].name}</span>
      </div>
      <div id="player2-container" class="player-info" style="
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        transition: background 0.3s;
      ">
        <span class="player-name">${this.players[1].name}</span>
      </div>
    `;

    // Inserisci l'UI dei giocatori prima del deck
    const deck = document.querySelector(".deck");
    deck.parentNode.insertBefore(playersUI, deck);
  }

  updatePlayerTurn() {
    // Rimuovi l'evidenziazione da entrambi i giocatori
    document.querySelectorAll(".player-info").forEach((container) => {
      container.style.background = "transparent";
      container.style.color = "#1a1c1e";
    });

    // Evidenzia il giocatore corrente
    const currentPlayerContainer = document.getElementById(
      `player${this.currentPlayerIndex + 1}-container`
    );
    currentPlayerContainer.style.background =
      this.players[this.currentPlayerIndex].color || "#6c5ce7";
    currentPlayerContainer.style.color = "white";
  }

  switchPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    this.updatePlayerTurn();
  }

  drawCard() {
    if (this.currentDeck.length === 0) {
      alert('Il mazzo è vuoto! Clicca "Mischia il mazzo" per ricominciare.');
      return;
    }

    if (!this.isFlipped) {
      this.playSound("flip");
      this.categoryElement.textContent = this.currentCard.category;
      this.questionElement.textContent = this.currentCard.question;

      // Mostra i suggerimenti se è una carta della categoria feedback
      if (this.currentCard.category === "Verità Scomode") {
        this.showFeedbackInstructions();
      }

      this.cardElement.classList.add("flipped");
      this.isFlipped = true;
    } else {
      this.playSound("flip");
      this.currentDeck.pop();
      this.currentCard = this.currentDeck[this.currentDeck.length - 1];
      this.updateCardDisplay();
      this.cardElement.classList.remove("flipped");
      this.isFlipped = false;

      // Rimuovi i suggerimenti quando la carta viene rigirata
      this.hideFeedbackInstructions();

      this.switchPlayer();
    }

    this.updateCardsRemaining();
  }

  shuffleDeck() {
    // Reset del mazzo
    this.currentDeck = [...this.fullDeck];

    console.log("Mescolando il mazzo. Numero carte:", this.currentDeck.length);
    console.log(
      "Categorie presenti:",
      new Set(this.currentDeck.map((card) => card.category))
    );

    // Fisher-Yates shuffle
    for (let i = this.currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDeck[i], this.currentDeck[j]] = [
        this.currentDeck[j],
        this.currentDeck[i],
      ];
    }

    // Reset dello stato della carta
    this.cardElement.classList.remove("flipped");
    this.isFlipped = false;

    // Imposta la prima carta
    this.currentCard = this.currentDeck[this.currentDeck.length - 1];
    this.updateCardDisplay();
    this.updateCardsRemaining();

    // Reset del testo
    this.categoryElement.textContent = "";
    this.questionElement.textContent = "";
  }

  updateCardDisplay() {
    if (this.currentCard) {
      this.cardFrontElement.innerHTML = `
        <div class="card-icon">${this.currentCard.icon}</div>
      `;

      const gradient = `linear-gradient(45deg, ${
        this.currentCard.color
      }, ${this.lightenColor(this.currentCard.color, 20)})`;
      this.cardFrontElement.style.background = gradient;
    } else {
      this.cardFrontElement.innerHTML = `
        <div class="card-icon">🔗</div>
      `;
      this.cardFrontElement.style.background =
        "linear-gradient(45deg, #6c5ce7, #a388ee)";
    }
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }

  updateCardsRemaining() {
    const remainingText =
      this.currentDeck.length === 0
        ? "Nessuna carta rimasta"
        : `Carte rimanenti: ${this.currentDeck.length}`;
    document.querySelector(".cards-remaining").textContent = remainingText;
  }

  addEventListeners() {
    // Click sulla carta
    this.cardElement.addEventListener("click", () => {
      this.drawCard();
    });

    // Pulsante mischia
    document.querySelector(".shuffle-button").addEventListener("click", () => {
      this.playSound("click");
      this.shuffleDeck();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new LinkGame();

  // Debug iniziale
  setTimeout(() => {
    game.debugDeck();
  }, 1000);
});

export default LinkGame;
