const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
let percentWindow;

function reportWindowSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    percentWindow = 40/100 * canvas.height;
}

window.onresize = reportWindowSize;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/bg_fight_1024.png'
})

const enemy = new Fighter({
    position: {
        x: 800,
        y: 350,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: 215,
        y: 144,
    },
    imageSrc: './img/phantom/Idle.png',
    framesMax: 8,
    scale: 2,
    sprites: {
        idle: {
            imageSrc: './img/phantom/Idle.png',
            framesMax: 8,
        },
        run: {
            imageSrc: './img/phantom/Run.png',
            framesMax: 8,
            image: new Image()
        },
        jump: {
            imageSrc: './img/phantom/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/phantom/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/phantom/Attack.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './img/phantom/Take_hit.png',
            framesMax: 4,
        },
        death: {
            imageSrc: './img/phantom/Death.png',
            framesMax: 6,
        },
    },
    attackBox: {
       offset: {
           x: -100,
           y: -50,
       },
       width: 160,
       height: 50
    }
})

const player = new Fighter({
    position: {
        x: 50,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: 215,
        y: 158,
    },
    color: 'blue',
    imageSrc: './img/Fernandes/Idle.png',
    framesMax: 4,
    scale: 2,
    sprites: {
        idle: {
            imageSrc: './img/Fernandes/Idle.png',
            framesMax: 4,
        },
        run: {
            imageSrc: './img/Fernandes/Run.png',
            framesMax: 8,
        },
        jump: {
            imageSrc: './img/Fernandes/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/Fernandes/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/Fernandes/Attack.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './img/Fernandes/Take_hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/Fernandes/Death.png',
            framesMax: 7,
        }
    },
    attackBox: {
        offset: {
            x: 50,
            y: -50,
        },
        width: 170,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },

}

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    player.update();
    enemy.update();
    enemy.botLogick(player);

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // player move
    if (keys.a.pressed && player.lastKey === 'a') {
        if (player.position.x !== 50){
            player.velocity.x = -5;
        }
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        if (player.position.x <= canvas.width - 50) {
            player.velocity.x = 5;
        }
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }

    //jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    // enemy move
    if (!enemy.runTime) {
        enemy.switchSprite('idle');
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    // detect for collision
    if ( rectangularCollision({
        rectangle1: player,
        rectangle2: enemy
    }) && player.isAttacking) {
        enemy.takeHit();
        player.isAttacking = false; gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })

    }

    // if player missing
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }

    // detect for collision
    if ( rectangularCollision({
        rectangle1: enemy,
        rectangle2: player
    }) && enemy.isAttacking && enemy.framesCurrent === 2) {
        if (!enemy.isHitting) {
            player.takeHitBot(enemy)
            gsap.to('#playerHealth', {
                width: player.health + '%'
            })
        }
    }

    // end game
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy});
    }
}

function startGame(){
    document.getElementById('infoGame').classList.add('hide');
    animate();
    decreaseTimer();
}

function left() {
    if (!player.dead) {
        keys.d.pressed = true;
        player.lastKey = 'a';
    }
}

function right() {
    if (!player.dead) {
        keys.a.pressed = true;
        player.lastKey = 'd';
    }
}

function space() {
    if (!player.dead) {
        if (!player.isJumping) {
            player.velocity.y = -15;
        }
    }
}

function attack() {
    if (!player.dead) {
        player.attack();
    }
}

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.code) {
            case 'KeyD':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'KeyA':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'KeyW':
                if (!player.isJumping) {
                    player.velocity.y = -15;
                }
                break;
            case 'Space':
                player.attack();
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.code) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'KeyW':
                if (!player.dead ){
                    if (!enemy.isJumping) {
                        enemy.velocity.y = -15;
                    }
                }
                break;
            case 'ArrowDown':
                enemy.attack();
                break;
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyD':
            keys.d.pressed = false;
            break;
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;

    }
})

const btn_left = document.getElementById('btn-left');
const btn_right = document.getElementById('btn-right');
const btn_fight = document.getElementById('btn-fight');
const btn_jump = document.getElementById('btn-jump');
let isDrawing = false;

btn_left.addEventListener("mousedown", (event) => {
    if (!player.dead) {
        keys.a.pressed = true;
        player.lastKey = 'a';
    }
}, false);

btn_right.addEventListener("mousedown", (event) => {
    if (!player.dead) {
        keys.d.pressed = true;
        player.lastKey = 'd';
    }
}, false);

btn_fight.addEventListener("mousedown", (event) => {
    if (!player.dead) {
        player.attack();
    }
}, false);

btn_jump.addEventListener("mousedown", (event) => {
    if (!player.isJumping && !player.dead) {
        player.velocity.y = -15;
    }
}, false);

btn_left.addEventListener("touchstart", (event) => {
    if (!player.dead) {
        keys.a.pressed = true;
        player.lastKey = 'a';
    }
}, false);
btn_right.addEventListener("touchstart", (event) => {
    if (!player.dead) {
        keys.d.pressed = true;
        player.lastKey = 'd';
    }
}, false);

window.addEventListener("mouseup", (event) => {
    keys.d.pressed = false;
    keys.a.pressed = false;
}, false);

window.addEventListener("touchend", (event) => {
    keys.d.pressed = false;
    keys.a.pressed = false;
}, false);

window.addEventListener("touchstart", tapHandler);

var tapedTwice = false;

function tapHandler(event) {
    if(!tapedTwice) {
        tapedTwice = true;
        setTimeout( function() { tapedTwice = false; }, 300 );
        return false;
    }
}