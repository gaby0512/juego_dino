const dino = document.getElementById('dino');
const cactus1 = document.getElementById('cactus1');
const cactus2 = document.getElementById('cactus2');
const cactus3 = document.getElementById('cactus3');
const pajaro = document.getElementById('pajaro');
const scoreDisplay = document.getElementById('score');
const nightMode = document.createElement('div');
nightMode.id = 'nightMode';
document.body.appendChild(nightMode);

let score = 0;
let isJumping = false; //indica si el dinosaurio está en el aire saltando. Se inicializa como false porque al comenzar el juego, el dinosaurio no está saltando.
let isDucking = false;
let isGameOver = false;
let gameSpeed = 3.0; // velocidad inicial de los obstáculos 
const speedIncrement = 0.1; // Incremento de velocidad más grande
const cactusWidth = 20; // Ancho del cactus
const cloudWidth = 60; // Ancho del pájaro
const screenWidth = window.innerWidth; // Ancho de la pantalla

// Espacio entre cactus y pájaro
const spaceBetweenObstacles = 300; // Distancia deseada entre los cactus y el pájaro

// Maneja el salto y el agachamiento
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isJumping && !isDucking) {
        jump();
    } else if (e.code === 'ArrowDown' && !isJumping) {
        duck();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        standUp();
    }
});

function jump() {
    if (isJumping) return;
    isJumping = true;

    // Ajusta la altura y la duración del salto
    dino.style.transition = 'bottom 0.6s ease'; // Duración del salto 
    dino.style.bottom = '130px'; // Ajusta la altura del salto

    // SetTimeout para regresar el dinosaurio a la posición original
    setTimeout(() => {
        dino.style.bottom = '20px'; // Regresa a la posición original

        // Finaliza el salto
        setTimeout(() => {
            isJumping = false;
        }, 50);
    }, 600); // Ajusta el tiempo de espera para coincidir con la duración de la transición
}

function duck() {
    if (isDucking) return;
    isDucking = true;
    dino.style.height = '30px'; // Ajusta la altura al agacharse
    dino.style.bottom = '20px'; // Ajusta la posición al agacharse
}

function standUp() {
    if (!isDucking) return;
    isDucking = false;
    dino.style.height = '50px'; // Altura normal del dinosaurio
    dino.style.bottom = '20px'; // Posición normal
}

// Actualiza el puntaje
function updateScore() {
    score++;
    scoreDisplay.textContent = score;
}

// Mueve los obstáculos
function moveObstacle(obstacle) {
    if (isGameOver) return;

    let obstacleRight = parseFloat(getComputedStyle(obstacle).getPropertyValue('right'));
    obstacleRight += gameSpeed;
    obstacle.style.right = `${obstacleRight}px`;

    // Verifica si el dinosaurio ha pasado el cactus
    const obstacleRect = obstacle.getBoundingClientRect();
    const dinoRect = dino.getBoundingClientRect();

    if (
        dinoRect.right > obstacleRect.left &&
        dinoRect.left < obstacleRect.right &&
        dinoRect.bottom <= obstacleRect.top
    ) {
        if (!obstacle.hasAttribute('scored')) {
            updateScore();
            obstacle.setAttribute('scored', 'true');
        }
    }

    // Reposiciona el cactus al salir de la pantalla
    if (obstacleRight > screenWidth) {
        obstacle.style.right = `-${cactusWidth}px`; // Reposiciona el cactus fuera de la pantalla a la izquierda
        obstacle.removeAttribute('scored'); // Resetea el atributo para la próxima vez que el dinosaurio pase
    }

    detectCollision();
    requestAnimationFrame(() => moveObstacle(obstacle));
}

// Mueve el pájaro
function movePajaro() {
    if (isGameOver) return;

    let pajaroRight = parseFloat(getComputedStyle(pajaro).getPropertyValue('right'));
    pajaroRight += gameSpeed; // El pájaro se mueve a la misma velocidad que los cactus

    pajaro.style.right = `${pajaroRight}px`;

    // Reposiciona el pájaro al salir de la pantalla
    if (pajaroRight > screenWidth) {
        // Hacer que el pájaro aparezca en el comienzo de la pantalla
        pajaro.style.right = `-${cloudWidth}px`; 
    }

    checkPajaroAvoidance(); // Verifica si el dinosaurio esquivó el pájaro
    requestAnimationFrame(movePajaro);
}

// Reposiciona el pájaro para mantener la distancia con los cactus
function repositionPajaro() {
    // Obteniene posición más a la derecha de todos los cactus
    const cactusRects = [cactus1, cactus2, cactus3].map(cactus => cactus.getBoundingClientRect());
    const farthestCactusRight = Math.max(...cactusRects.map(rect => rect.right));
    
    // Colocar el pájaro a la derecha del cactus más alejado más la distancia deseada
    pajaro.style.right = `${farthestCactusRight + spaceBetweenObstacles}px`;
    
    // Asegura que el pájaro esté completamente fuera de la pantalla a la derecha
    setTimeout(() => {
        pajaro.style.right = `${farthestCactusRight + spaceBetweenObstacles + cloudWidth}px`;
    }, 10);
}

// Mueve el dinosaurio
function moveDino() {
    if (isGameOver) return;

    let dinoLeft = parseFloat(getComputedStyle(dino).getPropertyValue('left'));
    dinoLeft += 1; // Velocidad del dinosaurio (más lenta)
    if (dinoLeft > screenWidth / 2) {
        dinoLeft = screenWidth / 2; // Limita la posición del dinosaurio
    }
    dino.style.left = `${dinoLeft}px`;

    requestAnimationFrame(moveDino);
}

// Ajusta la velocidad de los obstáculos con el tiempo
function increaseSpeed() {
    if (isGameOver) return;
    gameSpeed += speedIncrement; // Aumenta la velocidad gradualmente
    setTimeout(increaseSpeed, 1000); // Aumenta la velocidad cada segundo
}

// Controla la aparición del pájaro y el cambio a modo noche
function controlPajaroAppearance() {
    if (isGameOver) return;

    setTimeout(() => {
        nightMode.style.display = 'block'; // Muestra el fondo oscuro
        setTimeout(() => {
            nightMode.style.display = 'none'; // Oculta el fondo oscuro después de 20 segundos
        }, 20000);
    }, 40000); // Cambia a modo noche después de 40 segundos
}

// Controla el movimiento del dinosaurio
function controlDinoMovement() {
    if (isGameOver) return;

    // Detiene el dinosaurio cuando llega a la mitad de la pantalla
    if (parseFloat(getComputedStyle(dino).getPropertyValue('left')) >= screenWidth / 2) {
        dino.style.left = `${screenWidth / 2}px`; // Ajusta la posición del dinosaurio para que no pase de la mitad
    }
}

// Detecta colisiones
function detectCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const obstacles = [cactus1, cactus2, cactus3];

    // Verifica colisiones con los cactus
    for (let obstacle of obstacles) {
        const obstacleRect = obstacle.getBoundingClientRect();
        if (
            dinoRect.left < obstacleRect.right &&
            dinoRect.right > obstacleRect.left &&
            dinoRect.bottom > obstacleRect.top
        ) {
            endGame();
        }
    }

    // Verifica colisión con el pájaro solo si el dinosaurio no está agachado
    if (!isDucking) {
        const pajaroRect = pajaro.getBoundingClientRect();
        if (
            dinoRect.left < pajaroRect.right &&
            dinoRect.right > pajaroRect.left &&
            dinoRect.bottom > pajaroRect.top &&
            dinoRect.top < pajaroRect.bottom
        ) {
            endGame();
        }
    }
}

// Verifica si el dinosaurio esquivó el pájaro
function checkPajaroAvoidance() {
    const dinoRect = dino.getBoundingClientRect();
    const pajaroRect = pajaro.getBoundingClientRect();

    // Verifica si el dinosaurio ha pasado el pájaro sin colisionar
    if (dinoRect.right < pajaroRect.left && pajaroRect.right < screenWidth && !pajaro.hasAttribute('scored')) {
        updateScore();
        pajaro.setAttribute('scored', 'true');
        // Asegúrate de que el dinosaurio esté en su altura normal después de esquivar el pájaro
        if (isDucking) {
            standUp(); // Levanta al dinosaurio si estaba agachado
        }
    }
}

// Termina el juego
function endGame() {
    isGameOver = true;
    alert(`Perdiste! Tu puntaje es: ${score}`);
    document.location.reload();
}

// Inicializa el juego
function initGame() {
    // Inicializa el puntaje en 0
    score = 0;
    scoreDisplay.textContent = score;

    moveObstacle(cactus1); // Mueve el primer cactus
    moveObstacle(cactus2); // Mueve el segundo cactus
    moveObstacle(cactus3); // Mueve el tercer cactus
    movePajaro(); // Mueve el pájaro
    moveDino();
    increaseSpeed(); // Empieza a aumentar la velocidad con el tiempo
    controlPajaroAppearance(); // Controla la aparición del pájaro y el cambio a modo noche
    setInterval(controlDinoMovement, 100); // Revisa el movimiento del dinosaurio periódicamente
}

initGame();
