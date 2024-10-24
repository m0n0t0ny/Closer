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
    this.feedbackCardCounter = 0;
    this.initializeSounds();
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

    document.head.appendChild(style);
    document.body.appendChild(toggleContainer);

    const toggleCheckbox = document.getElementById("intimateToggle");
    if (toggleCheckbox) {
      toggleCheckbox.addEventListener("change", (e) => {
        this.intimateMode = e.target.checked;
        this.initializeFullDeck();
        this.shuffleDeck();

        const message = this.intimateMode
          ? "Modalità intima attivata 💝"
          : "Modalità intima disattivata";

        this.showNotification(message);
      });
    }
  }

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

    const style = document.createElement("style");
    style.textContent = `
      .game-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(108, 92, 231, 1);
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
  }

  showFeedbackInstructions() {
    this.feedbackCardCounter++;

    // Mostra le istruzioni solo ogni 5 carte
    if (this.feedbackCardCounter % 5 !== 1) return;

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
      width: min(400px, 90vw);
      box-shadow: 0 4px 15px rgba(255, 71, 87, 0.2);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
      white-space: pre-line;
      padding-right: 40px; /* Spazio per il pulsante di chiusura */
    `;

    // Aggiunta del pulsante di chiusura
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "✕";
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 5px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.3s ease;
    `;

    // Effetto hover per il pulsante
    closeButton.addEventListener("mouseover", () => {
      closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    });

    closeButton.addEventListener("mouseout", () => {
      closeButton.style.backgroundColor = "transparent";
    });

    // Event listener per la chiusura
    closeButton.addEventListener("click", () => {
      this.hideFeedbackInstructions();
    });

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }

      @media (max-width: 480px) {
        #feedback-instructions {
          font-size: 0.85rem;
          padding: 12px 35px 12px 15px;
          bottom: 10px;
        }
      }
    `;

    document.head.appendChild(style);

    instructionsElement.textContent = instructions;
    instructionsElement.appendChild(closeButton);
    document.body.appendChild(instructionsElement);

    // Chiusura automatica dopo 10 secondi
    setTimeout(() => {
      const element = document.getElementById("feedback-instructions");
      if (element) {
        element.style.opacity = "0";
        element.style.transform = "translate(-50%, 20px)";
        setTimeout(() => this.hideFeedbackInstructions(), 300);
      }
    }, 10000);
  }

  hideFeedbackInstructions() {
    const instructionsElement = document.getElementById(
      "feedback-instructions"
    );
    if (instructionsElement) {
      instructionsElement.style.opacity = "0";
      instructionsElement.style.transform = "translate(-50%, 20px)";
      setTimeout(() => instructionsElement.remove(), 300);
    }
  }

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

  getPlayerNames() {
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
          <h2 style="margin-bottom: 1.5rem; color: #1a1c1e;">Nomi Giocatori</h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input 
              type="text" 
              id="player1" 
              placeholder="Giocatore 1" 
              maxlength="20"
              style="
                padding: 0.5rem;
                border: 2px solid #6c5ce7;
                border-radius: 0.5rem;
                font-size: 1rem;
                text-align: center;
              ">
            <input 
              type="text" 
              id="player2" 
              placeholder="Giocatore 2" 
              maxlength="20"
              style="
                padding: 0.5rem;
                border: 2px solid #6c5ce7;
                border-radius: 0.5rem;
                font-size: 1rem;
                text-align: center;
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
            ">Inizia</button>
          </div>
        </div>
      </div>
    `;

    // Aggiungiamo gli stili per il placeholder
    const style = document.createElement("style");
    style.textContent = `
      .players-form input::placeholder {
        color: #666;
        font-size: 1rem;
      }
      
      .players-form input {
        text-align: center;
        font-size: 1rem;
      }
      
      .players-form input:focus {
        outline: none;
        border-color: #6c5ce7;
        box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
      }
    `;
    document.head.appendChild(style);

    const formContainer = document.createElement("div");
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);

    document.getElementById("startGame").addEventListener("click", () => {
      const player1Name =
        document.getElementById("player1").value.trim() || "Giocatore 1";
      const player2Name =
        document.getElementById("player2").value.trim() || "Giocatore 2";

      this.players = [{ name: player1Name }, { name: player2Name }];
      formContainer.remove();
      this.shuffleDeck();
      this.addEventListeners();
      this.updateCardDisplay();
    });
  }

  updateCardDisplay() {
    if (this.currentCard) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      this.cardFrontElement.innerHTML = `
        <div class="card-icon">${this.currentCard.icon}</div>
        <div class="player-turn">${currentPlayer.name}</div>
      `;

      const gradient = `linear-gradient(45deg, ${
        this.currentCard.color
      }, ${this.lightenColor(this.currentCard.color, 20)})`;
      this.cardFrontElement.style.background = gradient;
    } else {
      const currentPlayer = this.players[this.currentPlayerIndex];
      this.cardFrontElement.innerHTML = `
        <div class="card-icon">🔗</div>
        <div class="player-turn">${currentPlayer.name}</div>
      `;
      this.cardFrontElement.style.background =
        "linear-gradient(45deg, #6c5ce7, #a388ee)";
    }
  }

  switchPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    this.updateCardDisplay();
  }

  drawCard() {
    if (this.currentDeck.length === 0) {
      this.currentDeck = [...this.fullDeck];
      this.shuffleDeck(false);
      this.showNotification("Nuovo mazzo creato! 🎴");
      return;
    }

    if (!this.isFlipped) {
      this.playSound("flip");

      // Rimuoviamo la carta dal mazzo quando viene scoperta
      this.currentDeck.pop();
      this.updateCardsRemaining();

      // Prepariamo la prossima carta
      const nextCard = this.currentDeck[this.currentDeck.length - 1];

      this.categoryElement.textContent = this.currentCard.category;
      this.categoryElement.style.color = this.currentCard.color;
      this.questionElement.textContent = this.currentCard.question;

      if (this.currentCard.category === "Verità Scomode") {
        this.showFeedbackInstructions();
      }

      this.cardElement.classList.add("flipped");
      this.isFlipped = true;
    } else {
      this.playSound("flip");

      this.currentCard = this.currentDeck[this.currentDeck.length - 1];
      this.updateCardDisplay();
      this.cardElement.classList.remove("flipped");
      this.isFlipped = false;

      this.hideFeedbackInstructions();
      this.switchPlayer();
    }
  }

  shuffleDeck(playSound = true) {
    this.currentDeck = [...this.fullDeck];

    if (playSound) {
      this.playSound("click");
    }

    for (let i = this.currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDeck[i], this.currentDeck[j]] = [
        this.currentDeck[j],
        this.currentDeck[i],
      ];
    }

    this.cardElement.classList.remove("flipped");
    this.isFlipped = false;
    this.currentCard = this.currentDeck[this.currentDeck.length - 1];
    this.updateCardDisplay();
    this.updateCardsRemaining();

    this.categoryElement.style.transition = "none";
    this.categoryElement.style.color = "";
    this.categoryElement.textContent = "";
    this.questionElement.textContent = "";

    void this.categoryElement.offsetWidth;
  }

  shuffleDeck(playSound = true) {
    this.currentDeck = [...this.fullDeck];

    if (playSound) {
      this.playSound("click");
    }

    for (let i = this.currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDeck[i], this.currentDeck[j]] = [
        this.currentDeck[j],
        this.currentDeck[i],
      ];
    }

    this.cardElement.classList.remove("flipped");
    this.isFlipped = false;
    this.currentCard = this.currentDeck[this.currentDeck.length - 1];
    this.updateCardDisplay();
    this.updateCardsRemaining();
    this.categoryElement.textContent = "";
    this.questionElement.textContent = "";
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
    this.cardElement.addEventListener("click", () => {
      this.drawCard();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new LinkGame();

  setTimeout(() => {
    game.debugDeck();
  }, 1000);
});

export default LinkGame;
