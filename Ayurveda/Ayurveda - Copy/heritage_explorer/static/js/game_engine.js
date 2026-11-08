// static/js/game_engine.js

document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("puzzle-board");
    if (!board) return;

    const levelId = board.dataset.level;
    fetch(`/api/site/${levelId}`)
        .then(res => res.json())
        .then(data => initGameMode(data))
        .catch(err => console.error("Error loading level configuration:", err));
});

function initGameMode(siteData) {
    const board = document.getElementById("puzzle-board");
    board.innerHTML = "";
    
    const type = (siteData.puzzle_type || "jigsaw").toLowerCase();

    if (type === "matching") {
        setupMatchingGame(board, siteData);
    } else if (type === "wildcard") {
        setupWildcardGame(board, siteData);
    } else {
        setupJigsawGame(board, siteData);
    }
}

/* --- 1. JIGSAW MODE: 4x4 Tile Swap --- */
function setupJigsawGame(container, siteData) {
    container.className = "w-full aspect-square grid grid-cols-4 gap-1 bg-surface-container rounded-2xl p-2 shadow-inner border border-outline-variant/40";
    
    let tiles = Array.from({ length: 16 }, (_, i) => i);
    let shuffled = [...tiles].sort(() => Math.random() - 0.5);
    let selectedIndex = null;

    shuffled.forEach((tileIdx, currentPos) => {
        const tile = document.createElement("div");
        tile.className = "relative cursor-pointer overflow-hidden rounded-lg transition-all border border-outline-variant/30 hover:opacity-90 active:scale-95";
        
        const row = Math.floor(tileIdx / 4);
        const col = tileIdx % 4;
        
        tile.style.backgroundImage = `url('${siteData.image_url}')`;
        tile.style.backgroundSize = "400% 400%";
        tile.style.backgroundPosition = `${col * 33.333}% ${row * 33.333}%`;

        tile.addEventListener("click", () => {
            if (selectedIndex === null) {
                selectedIndex = currentPos;
                tile.classList.add("ring-2", "ring-primary", "scale-95");
            } else {
                [shuffled[selectedIndex], shuffled[currentPos]] = [shuffled[currentPos], shuffled[selectedIndex]];
                setupJigsawGame(container, siteData); // Redraw
                checkJigsawWin(shuffled);
            }
        });

        container.appendChild(tile);
    });
}

function checkJigsawWin(currentArr) {
    const isSolved = currentArr.every((val, i) => val === i);
    if (isSolved && typeof window.onPuzzleSolved === "function") {
        window.onPuzzleSolved();
    }
}

/* --- 2. MATCHING MODE: Memory Card Flip --- */
function setupMatchingGame(container, siteData) {
    container.className = "w-full aspect-square grid grid-cols-4 gap-2 bg-surface-container rounded-2xl p-3 shadow-inner border border-outline-variant/40";
    
    const symbols = ["🏛️", "🔱", "🛕", "🪷", "☀️", "🐘", "🔔", "📜"];
    let deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flipped = [];
    let matchedCount = 0;

    deck.forEach((symbol) => {
        const card = document.createElement("div");
        card.className = "flex items-center justify-center bg-surface-container-lowest text-2xl rounded-xl border border-outline-variant/40 cursor-pointer transition-all duration-300 font-bold select-none shadow-xs";
        card.dataset.symbol = symbol;
        card.innerText = "❓";

        card.addEventListener("click", () => {
            if (card.innerText !== "❓" || flipped.length === 2) return;

            card.innerText = symbol;
            card.classList.add("bg-secondary-container", "text-primary");
            flipped.push(card);

            if (flipped.length === 2) {
                if (flipped[0].dataset.symbol === flipped[1].dataset.symbol) {
                    matchedCount += 2;
                    flipped = [];
                    if (matchedCount === deck.length && typeof window.onPuzzleSolved === "function") {
                        window.onPuzzleSolved();
                    }
                } else {
                    setTimeout(() => {
                        flipped.forEach(c => {
                            c.innerText = "❓";
                            c.classList.remove("bg-secondary-container", "text-primary");
                        });
                        flipped = [];
                    }, 800);
                }
            }
        });

        container.appendChild(card);
    });
}

/* --- 3. WILDCARD MODE: Rapid Rune Sequence --- */
function setupWildcardGame(container, siteData) {
    container.className = "w-full aspect-square flex flex-col items-center justify-center gap-4 bg-surface-container rounded-2xl p-4 text-center border border-outline-variant/40";
    
    container.innerHTML = `
        <div class="space-y-2">
            <span class="material-symbols-outlined text-[36px] text-primary animate-spin">cyclone</span>
            <h4 class="font-headline-lg text-lg text-on-surface">Vedic Resonance Tap</h4>
            <p class="font-body-sm text-xs text-secondary">Tap 5 glowing runes in exact sequence to align the ancient energy field.</p>
        </div>
        <div id="rune-grid" class="grid grid-cols-3 gap-3 w-full max-w-[240px]"></div>
    `;

    const grid = container.querySelector("#rune-grid");
    let sequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9));
    let userStep = 0;

    for (let i = 0; i < 9; i++) {
        const rune = document.createElement("button");
        rune.className = "h-14 bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-bold text-primary hover:bg-secondary-container transition-all active:scale-90 text-sm shadow-xs";
        rune.innerText = `ᚠ${i+1}`;

        rune.addEventListener("click", () => {
            if (i === sequence[userStep]) {
                userStep++;
                rune.classList.add("bg-primary", "text-on-primary");
                if (userStep === sequence.length && typeof window.onPuzzleSolved === "function") {
                    window.onPuzzleSolved();
                }
            } else {
                userStep = 0;
                grid.querySelectorAll("button").forEach(b => b.classList.remove("bg-primary", "text-on-primary"));
                rune.classList.add("shake-locked");
                setTimeout(() => rune.classList.remove("shake-locked"), 400);
            }
        });

        grid.appendChild(rune);
    }
}