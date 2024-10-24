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
        margin-top: 1rem;
        display: flex;
        justify-content: center;
      }

      .toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

      [data-theme="dark"] .toggle-wrapper {
        background: #2d3436;
      }

      [data-theme="dark"] .toggle-label {
        color: #fff;
      }
    `;

    document.head.appendChild(style);

    const cardsRemainingElement = document.querySelector(".cards-remaining");
    if (cardsRemainingElement) {
      cardsRemainingElement.parentNode.insertBefore(
        toggleContainer,
        cardsRemainingElement.nextSibling
      );
    }

    const toggleCheckbox = document.getElementById("intimateToggle");
    if (toggleCheckbox) {
      toggleCheckbox.addEventListener("change", (e) => {
        this.intimateMode = e.target.checked;
        this.initializeFullDeck();
        this.shuffleDeck();
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

  showFeedbackInstructions() {
    const instructions = db.categories.find(
      (c) => c.id === "feedback"
    ).instructions;

    this.hideFeedbackInstructions();

    const instructionsElement = document.createElement("div");
    instructionsElement.id = "feedback-instructions";

    instructionsElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: rgba(255, 71, 87, 0.95);
      color: white;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateY(calc(100% - 45px));
      transition: transform 0.3s ease-out;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      min-height: 45px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 71, 87, 1);
      flex-wrap: wrap;
      gap: 4px;
    `;

    const arrow = document.createElement("div");
    arrow.innerHTML = "↕";
    arrow.style.cssText = `
      font-size: 1.2rem;
      transform: rotate(180deg);
      transition: transform 0.5s ease;
      line-height: 1;
    `;

    const title = document.createElement("span");
    title.textContent = "Suggerimenti per Verità Scomode";
    title.style.cssText = `
      margin-left: 8px;
      font-weight: 600;
      line-height: 1.2;
    `;

    // Contenitore esterno per il contenuto
    const contentWrapper = document.createElement("div");
    contentWrapper.style.cssText = `
      display: flex;
      justify-content: center;
      width: 100%;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.5s ease-out;
      white-space: pre-line;
    `;

    // Contenitore interno per limitare la larghezza del testo
    const contentInner = document.createElement("div");
    contentInner.style.cssText = `
      max-width: 420px;
      width: 100%;
      padding: 0px 20px 20px 20px;
      font-size: 12px;
      line-height: 1.5;
    `;
    contentInner.textContent = instructions;

    let isExpanded = false;
    const toggleExpansion = () => {
      isExpanded = !isExpanded;
      if (isExpanded) {
        // Calcoliamo l'altezza necessaria per il contenuto
        contentWrapper.style.maxHeight = "none";
        contentWrapper.style.opacity = "1";
        const headerHeight = header.offsetHeight;
        const contentHeight = contentInner.offsetHeight + 40; // 40px per il padding
        const maxAvailableHeight = window.innerHeight * 0.7; // 70% dell'altezza della viewport
        const finalHeight = Math.min(contentHeight, maxAvailableHeight);

        contentWrapper.style.maxHeight = `${finalHeight}px`;
        contentWrapper.style.overflow =
          contentHeight > maxAvailableHeight ? "auto" : "hidden";

        instructionsElement.style.transform = "translateY(0)";
        arrow.style.transform = "rotate(0deg)";
        closeButton.style.opacity = "1";
      } else {
        instructionsElement.style.transform = "translateY(calc(100% - 45px))";
        arrow.style.transform = "rotate(180deg)";
        contentWrapper.style.opacity = "0";
        contentWrapper.style.maxHeight = "0";
        closeButton.style.opacity = "0";
      }
    };

    header.addEventListener("click", toggleExpansion);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "✕";
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
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
      opacity: 0;
      transition: opacity 0.3s ease, background-color 0.3s ease;
    `;

    closeButton.addEventListener("mouseover", () => {
      closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    });

    closeButton.addEventListener("mouseout", () => {
      closeButton.style.backgroundColor = "transparent";
    });

    closeButton.addEventListener("click", () => {
      this.hideFeedbackInstructions();
    });

    // Stili per il mobile
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 480px) {
        #feedback-instructions {
          font-size: 0.9rem;
        }
        
        #feedback-instructions .content-inner {
          padding: 15px;
        }
      }
    `;
    document.head.appendChild(style);

    header.appendChild(arrow);
    header.appendChild(title);
    contentWrapper.appendChild(contentInner);
    instructionsElement.appendChild(header);
    instructionsElement.appendChild(contentWrapper);
    instructionsElement.appendChild(closeButton);
    document.body.appendChild(instructionsElement);
  }

  hideFeedbackInstructions() {
    const instructionsElement = document.getElementById(
      "feedback-instructions"
    );
    if (instructionsElement) {
      instructionsElement.style.transform = "translateY(100%)";
      setTimeout(() => instructionsElement.remove(), 300);
    }
  }

  hideFeedbackInstructions() {
    const instructionsElement = document.getElementById(
      "feedback-instructions"
    );
    if (instructionsElement) {
      instructionsElement.style.transform = "translateY(100%)";
      setTimeout(() => instructionsElement.remove(), 300);
    }
  }

  hideFeedbackInstructions() {
    const instructionsElement = document.getElementById(
      "feedback-instructions"
    );
    if (instructionsElement) {
      instructionsElement.style.transform = "translateX(-50%) translateY(100%)";
      setTimeout(() => instructionsElement.remove(), 300);
    }
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
