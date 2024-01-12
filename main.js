let scene, camera, renderer;
let board = [];
let currentPlayer = 1;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let isMouseDragging = false;

function init() {
  // Inicializa a cena, câmera e renderer
  setupScene();

  // Cria o tabuleiro
  createBoard();

  // Adiciona os controles do mouse
  setupMouseControls();

  // Inicia a animação
  animate();
}

function setupScene() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;


  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xFFFF00);

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Adicione o canvas ao seu container
  const gameContainer = document.getElementById('game-container');
  gameContainer.appendChild(renderer.domElement);

  // Carregue a textura para o plano
  texture = new THREE.TextureLoader().load('fundo.jpg');

  // Crie o plano com a nova textura
  const planeGeometry = new THREE.PlaneGeometry(4, 4);
  const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);
}

function createBoard() {

  const boardSize = { rows: 6, cols: 7 };
  const cellSize = 1;

  for (let row = 0; row < boardSize.rows; row++) {
    board.push([]);
    for (let col = 0; col < boardSize.cols; col++) {
      const geometry = new THREE.SphereGeometry(cellSize / 2.1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cell = new THREE.Mesh(geometry, material);

      positionCell(cell, row, col, cellSize, boardSize);

      scene.add(cell);
      board[row].push({ mesh: cell, player: 0 });

      const backgroundGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
      const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
      const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

      positionCell(background, row, col, cellSize, boardSize);
      scene.add(background);
      background.position.z = -0.5; // Posiciona o plano ligeiramente atrás das bolinhas
    }
  }

  const planeGeometry = new THREE.PlaneGeometry(4, 4);
  const texture = new THREE.TextureLoader().load('fundo.jpg');
  const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);
}

function positionCell(cell, row, col, cellSize, boardSize) {

  const separation = 0.1; // Ajusta o valor para controlar o espaçamento entre as esferas
  cell.position.x = col * (cellSize + separation) - (boardSize.cols * (cellSize + separation)) / 2 + cellSize / 2;
  cell.position.y = (boardSize.rows - row - 1) * (cellSize + separation) - (boardSize.rows * (cellSize + separation)) / 2 + cellSize / 2;

  const separation2 = 0;
  const offsetX = col * (cellSize + separation2) - (boardSize.cols * (cellSize + separation2)) / 2;
  const offsetY = (boardSize.rows - row - 1) * (cellSize + separation2) - (boardSize.rows * (cellSize + separation2)) / 2;

  // Posiciona o plano no centro da célula
  cell.position.x = offsetX + cellSize / 2;
  cell.position.y = offsetY + cellSize / 2;
}

function setupMouseControls() {
  document.addEventListener('mousedown', () => {
    isMouseDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
  });

  document.addEventListener('mouseup', () => {
    isMouseDragging = false;
  });

  document.addEventListener('mousemove', (event) => {
    if (isMouseDragging) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      rotateScene(deltaMove);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function rotateScene(deltaMove) {

    const deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        0,  // Rotação em torno do eixo x
        (deltaMove.x * 1) * Math.PI / 180,  // Rotação em torno do eixo y
        0,
        'XYZ'
      ));
  
    scene.quaternion.multiplyQuaternions(deltaRotationQuaternion, scene.quaternion);
}
 
function dropPiece(col) {

  // Percorre de cima para baixo na coluna
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col].player === 0) {
      board[row][col].player = currentPlayer;
      board[row][col].mesh.material.color.set(currentPlayer === 1 ? 0xff0000 : 0x00ff00);

      if (checkWin(row, col)) {
        pauseMusic();
        if (currentPlayer === 1) {
          setTimeout(function () {
            alert(`Jogador Vermelho Venceu a partida!`);
            resetGame();
            playMusic();
          }, 1); // Atraso de 1 ms
        } else {
          setTimeout(function () {
            alert(`Jogador Verde Venceu a partida!`);
            resetGame();
            playMusic();
          }, 1);
        }
      } else {
        currentPlayer *= -1;
      }
      break; // Para de percorrer a coluna após colocar a peça
    } else if (row === 0) {
      // Se chegou à primeira linha e não conseguiu colocar a peça, a coluna está cheia
      alert('A coluna está cheia. Escolha outra coluna.');
      return;
    } else if (areAllColumnsFull()) {
      setTimeout(function () {
        alert('Todas as colunas estão cheias. O jogo empatou.');
        resetGame();
      }, 1);
      return;
    }
  }
}

function checkWin(row, col) {
  
  const player = board[row][col].player;

  // Verificação na horizontal
  for (let i = 0; i <= board[row].length - 4; i++) {
    if (
      board[row][i].player === player &&
      board[row][i + 1].player === player &&
      board[row][i + 2].player === player &&
      board[row][i + 3].player === player
    ) {
      board[row][i].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[row][i + 1].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[row][i + 2].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[row][i + 3].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);

      return true;
    }
  }

  // Verificação na vertical
  for (let i = 0; i <= board.length - 4; i++) {
    if (
      board[i][col].player === player &&
      board[i + 1][col].player === player &&
      board[i + 2][col].player === player &&
      board[i + 3][col].player === player
    ) {
      board[i][col].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[i+1][col].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[i+2][col].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
      board[i+3][col].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);

      return true;
    }
  }

  // Verificação na diagonal (para cima)
  for (let i = 0; i <= board.length - 4; i++) {
    for (let j = 0; j <= board[row].length - 4; j++) {
      if (
        board[i][j].player === player &&
        board[i + 1][j + 1].player === player &&
        board[i + 2][j + 2].player === player &&
        board[i + 3][j + 3].player === player
      ) {
        board[i][j].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+1][j + 1].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+2][j + 2].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+3][j + 3].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);

        return true;
      }
    }
  }

  // Verificação na diagonal (para baixo)
  for (let i = 0; i <= board.length - 4; i++) {
    for (let j = 3; j < board[row].length; j++) {
      if (
        board[i][j].player === player &&
        board[i + 1][j - 1].player === player &&
        board[i + 2][j - 2].player === player &&
        board[i + 3][j - 3].player === player
      ) {
        board[i][j].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+1][j - 1].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+2][j - 2].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);
        board[i+3][j - 3].mesh.material.color.set(currentPlayer === 1 ? 0x820000 : 0x005300);

        return true;
      }
    }
  }

  return false;
}

function areAllColumnsFull() {
  for (let col = 0; col < board[0].length; col++) {
    if (board[0][col].player === 0) {
      return false;
    }
  }
  return true;
}
  
function resetGame() {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      board[row][col].player = 0;
      board[row][col].mesh.material.color.set(0xffffff);
    }
  }
  currentPlayer = 1;
} 

function resetButtonClicked() {

  const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);
  
  const gameMessage = document.getElementById('game-message');
  gameMessage.textContent = "O jogo foi reiniciado.";
  gameMessage.style.display = 'block';

  pauseMusic();
  resetGame();
  playMusic();

  setTimeout(() => {
    gameMessage.style.display = 'none';
    gameMessage.textContent = ''; 
  }, 4000); //(4 segundos)
}

function pauseMusic() {
  const audio = document.getElementById("music");
  audio.pause();
}

function playMusic() {
  const audio = document.getElementById("music");
  audio.play();
}

init();