const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações Globais
ctx.imageSmoothingEnabled = false;

// --- CARREGAMENTO DE ASSETS ---
const spriteSheet = new Image();
spriteSheet.src = 'sprites.png';

const backgroundImage = new Image();
backgroundImage.src = 'fundo.png';

const pipeSprite = new Image();
pipeSprite.src = 'cano.png';

// Configurações do Pato (Sprite de 6 frames)
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;
const NUM_FRAMES = 6;
let animationFrame = 0;
let animationCounter = 0;
let animationSpeed = 6; 

// Física e Variáveis de Jogo
let birdY = 150;
let birdX = 50;
let velocity = 0;
let gravity = 0.5;      
let jumpForce = -8;     
let score = 0;
let gameRunning = true;

// Configuração dos Canos
let pipes = [];
let pipeGap = 160;      
let pipeWidth = 60;     
let pipeSpeed = 4.5;    
let pipeDistance = 280; 

function spawnPipe() {
    let safeRange = canvas.height - pipeGap - 120;
    let randomHeight = Math.floor(Math.random() * safeRange) + 60;
    pipes.push({
        x: canvas.width,
        y: 0,
        height: randomHeight,
        passed: false
    });
}

function resetGame() {
    birdY = 150;
    velocity = 0;
    pipes = [];
    spawnPipe();
    score = 0;
    gameRunning = true;
    loop();
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (gameRunning) {
            velocity = jumpForce;
            animationFrame = 0; 
        } else {
            resetGame();
        }
    }
});

function loop() {
    if (!gameRunning) return;

    // --- 1. DESENHAR FUNDO ---
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, 640, 480, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // --- 2. FÍSICA E ANIMAÇÃO DO PATO ---
    velocity += gravity;
    birdY += velocity;

    animationCounter++;
    if (animationCounter % animationSpeed === 0) {
        animationFrame = (animationFrame + 1) % NUM_FRAMES;
    }

    // --- 3. LÓGICA E DESENHO DOS CANOS ---
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeDistance) {
        spawnPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        if (pipeSprite.complete) {
            ctx.save();
            ctx.translate(pipes[i].x, pipes[i].height);
            ctx.scale(1, -1);
            ctx.drawImage(pipeSprite, 0, 0, pipeWidth, pipes[i].height);
            ctx.restore();

            ctx.drawImage(
                pipeSprite, 
                pipes[i].x, 
                pipes[i].height + pipeGap, 
                pipeWidth, 
                canvas.height - (pipes[i].height + pipeGap)
            );
        } else {
            ctx.fillStyle = "#2e7d32";
            ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].height);
            ctx.fillRect(pipes[i].x, pipes[i].height + pipeGap, pipeWidth, canvas.height);
        }

        let hb = 18; 
        if (birdX + hb > pipes[i].x && birdX - hb < pipes[i].x + pipeWidth) {
            if (birdY - hb < pipes[i].height || birdY + hb > pipes[i].height + pipeGap) {
                gameRunning = false;
            }
        }

        if (!pipes[i].passed && pipes[i].x < birdX) {
            score++;
            pipes[i].passed = true;
        }

        if (pipes[i].x < -pipeWidth) pipes.splice(i, 1);
    }

    // --- 4. DESENHAR O PATO ---
    if (spriteSheet.complete) {
        let frameCol = animationFrame % 2;
        let frameRow = Math.floor(animationFrame / 2);
        ctx.drawImage(
            spriteSheet,
            frameCol * SPRITE_WIDTH, frameRow * SPRITE_HEIGHT,
            SPRITE_WIDTH, SPRITE_HEIGHT,
            birdX - 30, birdY - 30, 60, 60
        );
    }

    // --- 5. LIMITES DA TELA ---
    if (birdY + 25 > canvas.height || birdY - 25 < 0) {
        gameRunning = false;
    }

    // --- 6. PLACAR DURANTE O JOGO ---
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(score, canvas.width / 2, 70);
    ctx.fillText(score, canvas.width / 2, 70);

    requestAnimationFrame(loop);

    if (!gameRunning) showGameOver();
}

function showGameOver() {
    // Fundo escurecido
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // Texto de Game Over
    ctx.font = "bold 30px Arial";
    ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

    // Pontuação Final em destaque
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#FFD700"; // Cor Dourada para o Score
    ctx.strokeText(score, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(score, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("PONTOS", canvas.width / 2, canvas.height / 2 + 40);

    // Instrução para reiniciar
    ctx.font = "16px Arial";
    ctx.fillText("Aperte ESPAÇO para reiniciar", canvas.width / 2, canvas.height / 2 + 100);
}

resetGame();