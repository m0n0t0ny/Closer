import db from "./db.js";

class Closer {
  constructor() {
    this.fullDeck = [];
    this.currentDeck = [];
    this.isFlipped = false;
    this.currentCard = null;
    this.players = null;
    this.currentPlayerIndex = 0;
    this.intimacyMode = false;
    this.tabuMode = false;
    this.obligationsMode = false;
    this.initializeSounds();
    this.initializeElements();
    this.addIntimacyToggle();
    this.initializeFullDeck();
    this.addInstructions();
    this.getPlayerNames();
    this.addGameGuide();
    this.addShareButton();
  }

  addShareButton() {
    const shareButton = document.createElement("button");
    shareButton.innerHTML = "📤 Condividi";
    shareButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #6c5ae4;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: none;
      z-index: 1000;
    `;
    document.body.appendChild(shareButton);
    this.shareButton = shareButton;

    shareButton.addEventListener("click", () => this.showSharePopup());
  }

  async uploadToImgBB(base64Image) {
    const API_KEY = "04133f29f9238bcd445d2be9a8192692";
    const API_URL = "https://api.imgbb.com/1/upload";

    try {
      // Show loading notification
      this.showNotification("Caricamento immagine in corso... ⏳");

      // Remove the data:image/png;base64, prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

      // Prepare form data
      const formData = new FormData();
      formData.append("key", API_KEY);
      formData.append("image", base64Data);

      // Add expiration - delete after 1 day to avoid accumulating images
      formData.append("expiration", 86400);

      // Upload image
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Log della risposta per debug
        console.log("ImgBB response:", data.data);

        // Estraiamo l'ID direttamente dall'URL
        const imageId = data.data.id;

        this.showNotification("Immagine caricata con successo! 🎉");
        return {
          url: data.data.url,
          id: imageId,
          delete_url: data.data.delete_url,
        };
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Errore durante il caricamento:", error);
      this.showNotification("Errore durante il caricamento dell'immagine 😕");
      return null;
    }
  }

  async shareOnWhatsApp(text) {
    try {
      // Create canvas and get image data
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = 340 * pixelRatio;
      canvas.height = 440 * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to image
      const svgString = this.generateSVG(text);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        img.src = URL.createObjectURL(blob);
      });

      ctx.drawImage(img, 0, 0, 340, 440);

      // Get base64 image data
      const base64Image = canvas.toDataURL("image/png");

      // Upload to ImgBB
      const uploadResult = await this.uploadToImgBB(base64Image);

      if (uploadResult?.id) {
        // Store delete URL for later cleanup if needed
        this.lastUploadedImageDelete = uploadResult.delete_url;

        // Create WhatsApp message with short URL using the direct ID
        const whatsappText = `📍 Nuovo obbligo su Closer!\n\n${text}\n\nhttps://ibb.co/${uploadResult.id}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Errore durante la condivisione:", error);
      this.showNotification("Errore durante la condivisione 😕");
    }
  }

  showSharePopup() {
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1001;
      transition: background-color 0.3s ease;
    `;

    const content = document.createElement("div");
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 20px;
      width: 90%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    const title = document.createElement("h3");
    title.textContent = "Condividi Obbligo";
    title.style.cssText = `
      color: #1a1c1e;
      font-size: 1.5rem;
      margin: 0;
    `;

    const previewContainer = document.createElement("div");
    previewContainer.style.cssText = `
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      margin: 0;
    `;

    const previewTitle = document.createElement("div");
    previewTitle.textContent = "Anteprima";
    previewTitle.style.cssText = `
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
      font-weight: 500;
    `;

    const imagePreview = document.createElement("div");
    imagePreview.style.cssText = `
      width: 340px;
      margin: 0 auto;
      transform: scale(0.9);
      transform-origin: center center;
      transition: transform 0.3s ease;
    `;

    const datePicker = document.createElement("input");
    datePicker.type = "date";
    datePicker.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 2px solid #6c5ae4;
      border-radius: 12px;
      font-size: 1rem;
      color: #1a1c1e;
      margin: 0.5rem 0;
    `;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    datePicker.value = tomorrow.toISOString().split("T")[0];

    const shareOptions = document.createElement("div");
    shareOptions.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    `;

    const buttonStyle = `
      background: #6c5ae4;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 15px;
      font-size: 0.9rem;
      cursor: pointer;
      flex: 1;
      max-width: 100px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    `;

    // Funzione per aggiornare la preview
    const updatePreview = () => {
      const text = getFormattedText();
      const svgString = this.generateSVG(text);
      imagePreview.innerHTML = svgString;
    };

    // Aggiorna la preview quando cambia la data
    datePicker.addEventListener("change", updatePreview);

    // Funzione per animare la chiusura
    const animateClose = (callback) => {
      content.style.opacity = "0";
      content.style.transform = "translateY(20px)";
      popup.style.backgroundColor = "rgba(0,0,0,0)";

      setTimeout(() => {
        popup.remove();
        if (callback) callback();
      }, 300);
    };

    // WhatsApp Button
    const whatsappBtn = document.createElement("button");
    whatsappBtn.innerHTML = `💬<br>WhatsApp`;
    whatsappBtn.style.cssText = buttonStyle;
    whatsappBtn.addEventListener("click", async () => {
      const text = getFormattedText();
      animateClose(async () => await this.shareOnWhatsApp(text));
    });

    // PNG Button
    const pngBtn = document.createElement("button");
    pngBtn.innerHTML = `💾<br>Immagine`;
    pngBtn.style.cssText = buttonStyle;
    pngBtn.addEventListener("click", () => {
      const text = getFormattedText();
      animateClose(() => this.downloadCardAsPNG(text));
    });

    // Funzione per ottenere il testo formattato
    const getFormattedText = () => {
      const selectedDate = new Date(datePicker.value);
      const formattedDate = selectedDate.toLocaleDateString("it-IT");
      const otherPlayer = this.players[(this.currentPlayerIndex + 1) % 2];
      return `${otherPlayer.name} ${this.currentCard.question} Entro il: ${formattedDate}`;
    };

    // Aggiungi elementi al DOM
    previewContainer.appendChild(previewTitle);
    previewContainer.appendChild(imagePreview);

    shareOptions.appendChild(whatsappBtn);
    shareOptions.appendChild(pngBtn);

    content.appendChild(title);
    content.appendChild(previewContainer);
    content.appendChild(datePicker);
    content.appendChild(shareOptions);

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Inizializza la preview
    updatePreview();

    // Anima l'apertura
    requestAnimationFrame(() => {
      popup.style.backgroundColor = "rgba(0,0,0,0.8)";
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
    });

    // Chiudi il popup cliccando fuori
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        animateClose();
      }
    });
  }

  async downloadCardAsPNG(text) {
    try {
      const svgString = this.generateSVG(text);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = 340 * pixelRatio;
      canvas.height = 440 * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 340, 440);

          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "obbligo.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showNotification("Immagine scaricata! 🖼️");
            resolve();
          }, "image/png");
        };

        img.onerror = reject;
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error("Errore durante la conversione:", error);
      this.showNotification("Errore durante il download 😕");
    }
  }

  // Modifica anche il createShareButton per WhatsApp
  createShareButton(text, icon, action) {
    const button = document.createElement("button");
    button.innerHTML = `${icon}<br>${text}`;
    button.style.cssText = `
      background: #6c5ae4;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 15px;
      font-size: 0.9rem;
      cursor: pointer;
      flex: 1;
      max-width: 100px;
      transition: all 0.3s ease;
    `;

    button.addEventListener("click", async () => {
      const selectedDate = new Date(datePicker.value);
      const formattedDate = selectedDate.toLocaleDateString("it-IT");
      const currentPlayer = this.players[this.currentPlayerIndex];
      const otherPlayer = this.players[(this.currentPlayerIndex + 1) % 2];
      const text = `${otherPlayer.name} ${this.currentCard.question} Entro il: ${formattedDate}`;

      switch (action) {
        case "whatsapp":
          const instructions = document.createElement("div");
          instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            z-index: 1002;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            max-width: 90%;
            width: 400px;
          `;
          instructions.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #1a1c1e;">Condivisione su WhatsApp</h3>
            <p style="margin-bottom: 15px; color: #4a4a4a;">
              1. Attendi il download dell'immagine PNG<br>
              2. Si aprirà WhatsApp Web con il testo<br>
              3. Potrai allegare l'immagine appena scaricata
            </p>
            <button id="continue" style="
              background: #6c5ae4;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 10px 20px;
              cursor: pointer;
            ">Ho capito</button>
          `;

          document.body.appendChild(instructions);

          document
            .getElementById("continue")
            .addEventListener("click", async () => {
              instructions.remove();
              await this.downloadCardAsPNG(text);
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
            });
          break;
        case "email":
          this.downloadCardAsPNG(text);
          window.open(
            `mailto:?subject=Closer%20-%20Nuovo%20Obbligo&body=${encodeURIComponent(
              text
            )}`
          );
          break;
        case "pdf":
          this.downloadCardAsPNG(text);
          break;
      }
      popup.remove();
    });
    return button;
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #6c5ae4;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 1000;
      animation: fadeInOut 2s forwards;
    `;
    notification.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  generateSVG(text) {
    const regex = /^(.*?) (.*?) Entro il: (.*)$/;
    const matches = text.match(regex);

    if (!matches) {
      console.error("Formato testo non valido");
      return "";
    }

    const [_, playerText, task, dateText] = matches;
    const combinedText = `${playerText} ${task}`;

    const titleSize = 16;
    const mainTextSize = 24;

    const emojiDataUrl = this.getEmojiDataUrl("🔗", {
      font: "38px Arial",
      color: "#6c5ae4",
      size: 76,
    });

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="340" height="440" viewBox="0 0 340 440">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
          <feOffset dx="0" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Card Background and Border -->
      <rect width="340" height="440" rx="28" ry="28" 
        fill="white" 
        stroke="#6c5ae4" 
        stroke-width="1"
      />

      <!-- Group for content -->
      <g>
        <!-- Title -->
        <text x="170" y="60" text-anchor="middle" 
          font-family="Inter, sans-serif" font-size="${titleSize}px" font-weight="700" fill="#6c5ae4" 
          letter-spacing="0.12em" text-transform="uppercase">
          OBBLIGHI
        </text>

        <!-- Emoji -->
        <image x="132" y="90" width="76" height="76" href="${emojiDataUrl}"/>

        <!-- Combined Text (wrapped) -->
        ${this.wrapText(combinedText, 280, 220, mainTextSize)}

        <!-- Date -->
        <text x="170" y="380" text-anchor="middle" 
          font-family="Inter, sans-serif" font-size="18" font-weight="500" fill="#6c5ae4">
          Entro il: ${dateText}
        </text>

        <!-- Website -->
        <text x="170" y="410" text-anchor="middle" 
          font-family="Inter, sans-serif" font-size="14" fill="#636e72">
          closergame.net
        </text>
      </g>
    </svg>`;
  }

  async downloadCardAsPNG(text) {
    try {
      const svgString = this.generateSVG(text);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = 340 * pixelRatio;
      canvas.height = 440 * pixelRatio;

      // Assicuriamoci che il canvas sia trasparente
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.scale(pixelRatio, pixelRatio);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 340, 440);

          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "obbligo.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showNotification("Immagine scaricata! 🖼️");
            resolve();
          }, "image/png"); // Specifichiamo esplicitamente il formato PNG
        };

        img.onerror = reject;

        // Convertiamo l'SVG in una URL data con la codifica corretta
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        img.src = svgUrl;
      });
    } catch (error) {
      console.error("Errore durante la conversione:", error);
      this.showNotification("Errore durante il download 😕");
    }
  }

  getEmojiDataUrl(emoji, options = {}) {
    const { font = "60px Arial", color = "#6c5ae4", size = 60 } = options;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(emoji, size / 2, size / 2);

    return canvas.toDataURL("image/png");
  }

  wrapText(text, width, startY, fontSize) {
    const words = text.split(" ");
    const lineHeight = fontSize * 1.2;
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = currentLine.length * (fontSize * 0.6); // Approssimazione della larghezza

      if (width < 260) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    return lines
      .map(
        (line, i) => `
        <text x="170" y="${startY + i * lineHeight}" text-anchor="middle" 
            font-family="Inter, sans-serif" font-size="${fontSize}" fill="#1a1c1e">
            ${line}
        </text>
    `
      )
      .join("");
  }

  generatePDF(text) {
    const svg = this.generateSVG(text);

    // Crea il Blob e il link per il download
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "obbligo.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  initializeElements() {
    this.cardElement = document.querySelector(".card");
    this.categoryElement = document.querySelector(".category");
    this.questionElement = document.querySelector(".question");
    this.cardFrontElement = document.querySelector(".card-front");
    this.cardBackElement = document.querySelector(".card-back");
  }

  addGameGuide() {
    const helpButton = document.createElement("button");
    helpButton.innerHTML = "❔";
    helpButton.style.cssText = `
    width: 40px;
    height: 40px;
    scale: 1/1;
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px;
    background: #6c5ce7;
    color: white;
    border: none;
    border-radius: 9999px;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    z-index: 1000;
  `;

    // Crea il pannello delle istruzioni
    const guidePanel = document.createElement("div");
    guidePanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    width: 90%;
    max-width: 500px;
    background: white;
    border-radius: 20px;
    font-size: 12px;
    padding: 30px 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1001;
  `;

    // Crea l'overlay scuro
    const overlay = document.createElement("div");
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
  `;

    // Contenuto della guida
    guidePanel.innerHTML = `
    <div style="position: relative;">
      <h2 style="
        color: #6c5ce7;
        font-size: 1.5rem;
        margin-bottom: 30px;
        text-align: center;
      ">Come si gioca</h2>
      
      <button id="closeGuide" style="
        position: absolute;
        scale: 1/1;
        top: -30px;
        right: -20px;
        border: none;
        background: #ffffff00;
        color: #ea5957;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      ">×</button>

      <div style="margin-bottom: 25px;">
        <h3 style="
          color: #1a1c1e;
          font-size: 1.1rem;
          margin-bottom: 10px;
        ">📌 Scopo del Gioco</h3>
        <p style="
          color: #4a4a4a;
          line-height: 1.5;
          margin-bottom: 15px;
        ">Closer è un gioco di carte progettato per approfondire e rafforzare le relazioni di coppia attraverso domande significative e momenti di condivisione autentica.</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="
          color: #1a1c1e;
          font-size: 1.1rem;
          margin-bottom: 10px;
        ">🎮 Come Giocare</h3>
        <ul style="
          color: #4a4a4a;
          line-height: 1.5;
          padding-left: 20px;
          margin-bottom: 15px;
        ">
          <li>Il gioco si svolge a turno tra due giocatori</li>
          <li>Cliccate sulla carta per girarla e rivelare una domanda</li>
          <li>Leggete la domanda ad alta voce e rispondete con sincerità</li>
          <li>Prendetevi il tempo necessario per rispondere e discutere</li>
          <li>Cliccate nuovamente sulla carta per passare al turno successivo</li>
        </ul>
      </div>

      <div>
        <h3 style="
          color: #1a1c1e;
          font-size: 1.1rem;
          margin-bottom: 10px;
        ">💡 Consigli</h3>
        <ul style="
          color: #4a4a4a;
          line-height: 1.5;
          padding-left: 20px;
        ">
          <li>Scegliete un momento tranquillo senza distrazioni</li>
          <li>Ascoltate con attenzione e senza giudicare</li>
          <li>Siate onesti nelle vostre risposte</li>
          <li>La modalità Tabù può essere attivata quando vi sentite pronti</li>
          <li>Attiva la modalità intima per domande sull'intimità sessuale</li>
        </ul>
      </div>
    </div>
  `;

    // Funzioni per mostrare/nascondere la guida
    const showGuide = () => {
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
      guidePanel.style.opacity = "1";
      guidePanel.style.visibility = "visible";
      guidePanel.style.transform = "translate(-50%, -50%) scale(1)";
    };

    const hideGuide = () => {
      overlay.style.opacity = "0";
      overlay.style.visibility = "hidden";
      guidePanel.style.opacity = "0";
      guidePanel.style.visibility = "hidden";
      guidePanel.style.transform = "translate(-50%, -50%) scale(0.9)";
    };

    // Eventi
    helpButton.addEventListener("click", showGuide);
    overlay.addEventListener("click", hideGuide);
    guidePanel
      .querySelector("#closeGuide")
      .addEventListener("click", hideGuide);

    // Previeni la chiusura quando si clicca sul pannello
    guidePanel.addEventListener("click", (e) => e.stopPropagation());

    // Aggiungi gli elementi al DOM
    document.body.appendChild(helpButton);
    document.body.appendChild(overlay);
    document.body.appendChild(guidePanel);
  }

  addIntimacyToggle() {
    const toggleContainer = document.createElement("div");
    toggleContainer.classList.add("toggles-container");
    toggleContainer.innerHTML = `
      <div class="toggles-wrapper">
        <div class="toggle-wrapper">
          <label class="toggle">
            <input type="checkbox" id="intimacyToggle">
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Intimità</span>
        </div>
        <div class="toggle-wrapper">
          <label class="toggle">
            <input type="checkbox" id="tabuToggle">
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Tabù</span>
        </div>
        <div class="toggle-wrapper">
          <label class="toggle">
            <input type="checkbox" id="obligationsToggle">
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Obblighi</span>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .toggles-container {
        margin-top: 1rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
  
      .toggles-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
  
      .toggle-wrapper {
        width:100%;
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
  
      #intimacyToggle:checked + .toggle-slider {
        background-color: #e89a41;
      }
  
      #tabuToggle:checked + .toggle-slider {
        background-color: #383838;
      }

      #obligationsToggle:checked + .toggle-slider {
        background-color: #6c5ae4;
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

    // Aggiungi la proprietà tabuMode alla classe
    this.tabuMode = false;

    const intimacyToggle = document.getElementById("intimacyToggle");
    const tabuToggle = document.getElementById("tabuToggle");
    const obligationsToggle = document.getElementById("obligationsToggle");

    if (intimacyToggle) {
      intimacyToggle.addEventListener("change", (e) => {
        this.intimacyMode = e.target.checked;
        this.initializeFullDeck();
        this.shuffleDeck();
      });
    }

    if (tabuToggle) {
      tabuToggle.addEventListener("change", (e) => {
        this.tabuMode = e.target.checked;
        this.initializeFullDeck();
        this.shuffleDeck();
      });
    }

    if (obligationsToggle) {
      obligationsToggle.addEventListener("change", (e) => {
        this.obligationsMode = e.target.checked;
        this.initializeFullDeck();
        this.shuffleDeck();
      });
    }
  }

  addInstructions() {
    const instructionsElement = document.createElement("div");
    instructionsElement.id = "tabu-instructions";
    instructionsElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: rgba(255, 71, 87, 1);
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
    title.textContent = "Suggerimenti per Tabù";
    title.style.cssText = `
      margin-left: 8px;
      font-weight: 600;
      line-height: 1.2;
    `;

    const contentWrapper = document.createElement("div");
    contentWrapper.style.cssText = `
      display: flex;
      justify-content: center;
      width: 100%;
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.5s ease-out;
    `;

    const contentInner = document.createElement("div");
    contentInner.style.cssText = `
      max-width: 420px;
      width: 100%;
      padding: 20px;
    `;

    contentInner.innerHTML = `
      <div class="instructions-content">
        <div class="instructions-header">
          <span class="instructions-icon">💡</span>
          Prima di rispondere ricorda:
        </div>
        <ul class="instructions-list">
          <li>Queste domande sono pensate per essere scomode</li>
          <li>L'obiettivo è crescere insieme, non ferirsi</li>
          <li>Se una domanda è troppo difficile, potete saltarla</li>
          <li>Cercate di mantenere un dialogo costruttivo</li>
          <li>È ok prendersi una pausa se le emozioni sono troppo intense</li>
          <li>Concludete sempre con qualcosa che amate dell'altro</li>
        </ul>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .instructions-content {
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .instructions-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
      }

      .instructions-icon {
        font-size: 1.2rem;
      }

      .instructions-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .instructions-list li {
        font-size: 12px;
        padding-left: 16px;
        position: relative;
        margin-bottom: 8px;
        line-height: 12px !important;
      }

      .instructions-list li:before {
        content: "•";
        position: absolute;
        left: 0;
        color: rgba(255, 255, 255, 0.8);
      }

      .instructions-list li:last-child {
        margin-bottom: 0;
      }

      @media (max-width: 480px) {
        .instructions-content {
          font-size: 0.9rem;
        }
        
        .instructions-list li {
          margin-bottom: 6px;
        }
      }
    `;
    document.head.appendChild(style);

    let isExpanded = false;

    const openInstructions = () => {
      isExpanded = true;
      contentWrapper.style.maxHeight = "none";
      contentWrapper.style.opacity = "1";
      const contentHeight = contentInner.offsetHeight + 40;
      const maxAvailableHeight = window.innerHeight * 0.7;
      const finalHeight = Math.min(contentHeight, maxAvailableHeight);

      contentWrapper.style.maxHeight = `${finalHeight}px`;
      contentWrapper.style.overflow =
        contentHeight > maxAvailableHeight ? "auto" : "hidden";

      instructionsElement.style.transform = "translateY(0)";
      arrow.style.transform = "rotate(0deg)";
    };

    const closeInstructions = () => {
      isExpanded = false;
      instructionsElement.style.transform = "translateY(calc(100% - 45px))";
      arrow.style.transform = "rotate(180deg)";
      contentWrapper.style.opacity = "0";
      contentWrapper.style.maxHeight = "0";
    };

    instructionsElement.addEventListener("click", (event) => {
      if (event.target === instructionsElement && isExpanded) {
        closeInstructions();
      }
    });

    header.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isExpanded) {
        closeInstructions();
      } else {
        openInstructions();
      }
    });

    contentWrapper.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    header.appendChild(arrow);
    header.appendChild(title);
    contentWrapper.appendChild(contentInner);
    instructionsElement.appendChild(header);
    instructionsElement.appendChild(contentWrapper);

    document.body.appendChild(instructionsElement);
  }

  hideTabuInstructions() {
    const instructionsElement = document.getElementById("tabu-instructions");
    if (instructionsElement) {
      instructionsElement.style.transform = "translateY(calc(100% - 45px))";
      const arrow = instructionsElement.querySelector(
        "div:first-child > div:first-child"
      );
      if (arrow) {
        arrow.style.transform = "rotate(180deg)";
      }
    }
  }

  initializeFullDeck() {
    this.fullDeck = db.categories
      .filter((category) => {
        if (!this.intimacyMode && category.isIntimacy) return false;
        if (!this.tabuMode && category.isTabu) return false;
        if (!this.obligationsMode && category.isObligation) return false;
        return true;
      })
      .flatMap((category) =>
        category.questions.map((question) => ({
          category: category.category,
          question: question,
          icon: category.icon,
          color: category.color,
          instructions: category.instructions,
          isTabu: category.isTabu,
          isIntimacy: category.isIntimacy,
          isObligation: category.isObligation,
        }))
      );
  }

  initializeSounds() {
    this.sounds = {
      flip: new Audio("./sounds/flip.mp3"),
      click: new Audio("./sounds/click.mp3"),
    };
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

      // Otteniamo la carta corrente prima di rimuoverla
      this.currentCard = this.currentDeck[this.currentDeck.length - 1];

      // Ora possiamo usare this.currentCard in sicurezza
      this.categoryElement.textContent = this.currentCard.category;
      this.categoryElement.style.color = this.currentCard.color;

      if (this.currentCard.isObligation) {
        // Ottieni il giocatore che deve eseguire l'obbligo
        const otherPlayer = this.players[(this.currentPlayerIndex + 1) % 2];

        // Modifica il testo della domanda per includere il nome del giocatore
        this.questionElement.textContent = `${otherPlayer.name} ${this.currentCard.question}`;

        // Mostra il pulsante di condivisione
        this.shareButton.style.display = "block";
      } else {
        this.questionElement.textContent = this.currentCard.question;
        this.shareButton.style.display = "none";
      }

      if (this.currentCard.isTabu) {
        this.showTabuInstructions();
      }

      // Rimuoviamo la carta dal mazzo dopo averla usata
      this.currentDeck.pop();
      this.updateCardsRemaining();

      this.cardElement.classList.add("flipped");
      this.isFlipped = true;
    } else {
      this.playSound("flip");

      // Nascondi sempre il pulsante di condivisione quando la carta viene rigirata
      this.shareButton.style.display = "none";

      // Prendiamo la prossima carta che sarà mostrata quando si rigira
      this.currentCard = this.currentDeck[this.currentDeck.length - 1];
      this.updateCardDisplay();
      this.cardElement.classList.remove("flipped");
      this.isFlipped = false;

      this.hideTabuInstructions();
      this.switchPlayer();
    }
  }

  showTabuInstructions() {
    const instructionsElement = document.getElementById("tabu-instructions");
    if (instructionsElement) {
      instructionsElement.style.transform = "translateY(0)";
      const arrow = instructionsElement.querySelector(
        "div:first-child > div:first-child"
      );
      if (arrow) {
        arrow.style.transform = "rotate(0deg)";
      }
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

    if (this.shareButton) {
      this.shareButton.style.display = "none";
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
    this.cardElement.addEventListener("click", () => this.drawCard());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Closer();
});

export default Closer;
