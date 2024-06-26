//board
let board;
let boardWidth = 360;
let boardHeight = window.innerHeight - 20;
let context;

//doodler
let rangerWidth = 35;
let rangerHeight = 70;
let rangerX = boardWidth / 2 - rangerWidth / 2;
let rangerY = (boardHeight * 7) / 8 - rangerHeight;
let rangerRightImg;
let rangerLeftImg;

let ranger = {
  img: null,
  x: rangerX,
  y: rangerY,
  width: rangerWidth,
  height: rangerHeight,
};

//physics
let velocityX = 0;
let velocityY = 0; //ranger jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4; // slows down velocity

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

//score
let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function () {
  board = document.getElementById('board');
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext('2d');

  //load images
  rangerRightImg = new Image();
  rangerRightImg.src = './rangerRight.png';
  ranger.img = rangerRightImg;
  rangerRightImg.onload = function () {
    context.drawImage(
      ranger.img,
      ranger.x,
      ranger.y,
      ranger.width,
      ranger.height
    );
  };

  rangerLeftImg = new Image();
  rangerLeftImg.src = './rangerLeft.png';

  platformImg = new Image();
  platformImg.src = './rainbow_platform.png';

  velocityY = initialVelocityY;
  placePlatforms();
  requestAnimationFrame(update);
  document.addEventListener('keydown', moveranger);
};
const update = () => {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  if (score === 1000) {
    console.log('Next Level');
    context.fillText('Next Level', boardWidth / 3, (boardHeight * 7) / 8);
    velocityY = -10;
    // get board id and change background imageOrientation:
    board = document.getElementById('board');
    board.style.backgroundImage = "'./pink_background.gif'";
  }
  context.clearRect(0, 0, board.width, board.height);

  //doodler
  ranger.x += velocityX;
  if (ranger.x > boardWidth) {
    ranger.x = 0;
  } else if (ranger.x + ranger.width < 0) {
    ranger.x = boardWidth;
  }

  velocityY += gravity; // slows ranger down
  ranger.y += velocityY; // move ranger up
  if (ranger.y > board.height) {
    gameOver = true;
  }
  context.drawImage(
    ranger.img,
    ranger.x,
    ranger.y,
    ranger.width,
    ranger.height
  );

  //platforms
  platformArray.map((platform, i) => {
    if (velocityY < 0 && ranger.y < (boardHeight * 3) / 4) {
      platform.y -= initialVelocityY; //slide platform down
    }
    if (detectCollision(ranger, platform) && velocityY >= 0) {
      velocityY = initialVelocityY; //jump
    }
    context.drawImage(
      platform.img,
      platform.x,
      platform.y,
      platform.width,
      platform.height
    );
  });

  // clear platforms and add new platform
  while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
    platformArray.shift(); //removes first element from the array
    newPlatform(); //replace with new platform on top
  }

  //score
  updateScore();
  context.fillStyle = 'white';
  context.font = '16px sans-serif';
  context.fillText(score, 5, 20);

  if (gameOver) {
    context.fillText(
      "Game Over: Press 'Space' to Restart",
      boardWidth / 7,
      (boardHeight * 7) / 8
    );
  }
};

function moveranger(e) {
  if (e.code == 'ArrowRight' || e.code == 'KeyD') {
    //move right
    velocityX = 4;
    ranger.img = rangerRightImg;
  } else if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
    //move left
    velocityX = -4;
    ranger.img = rangerLeftImg;
  } else if (e.code == 'Space' && gameOver) {
    //reset
    ranger = {
      img: rangerRightImg,
      x: rangerX,
      y: rangerY,
      width: rangerWidth,
      height: rangerHeight,
    };

    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    placePlatforms();
  }
}

function placePlatforms() {
  platformArray = []; // start over

  //starting platforms
  let platform = {
    img: platformImg,
    x: boardWidth,
    y: boardHeight * 2,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);

  platformArray = platformArray.concat(
    Array.from(
      {
        length: Math.floor(
          Math.random() * (boardHeight / 75) + (Math.random() * (14 - 4) + 4)
        ),
      },
      (_, i) => {
        let randomX = Math.floor((Math.random() * boardWidth * 3) / 4); //(0-1) * boardWidth*3/4
        return {
          img: platformImg,
          x: randomX,
          y: boardHeight - 75 * i - 150,
          width: platformWidth,
          height: platformHeight,
        };
      }
    )
  );
}
console.log('platform', platformArray.length);
function newPlatform() {
  let randomX = Math.floor((Math.random() * boardWidth * 3) / 4); //(0-1) * boardWidth*3/4
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); //a's bottom left corner passes b's top left corner
}

function updateScore() {
  let points = Math.floor(50 * Math.random()); //(0-1) *50 --> (0-50)
  if (velocityY < 0) {
    //negative going up
    maxScore += points;
    if (score < maxScore) {
      score = maxScore;
    }
  } else if (velocityY >= 0) {
    maxScore -= points;
  }
}
