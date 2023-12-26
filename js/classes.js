class Sprite {
    constructor({
        position,
        imageSrc,
        scale = 1,
        framesMax = 1,
        framesCurrent = 0,
        framesElapsed = 0,
        framesHold = 20,
        offset = {x:0, y:0},
    }) {
        this.position = position;
        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = framesCurrent;
        this.framesElapsed = framesElapsed;
        this.framesHold = framesHold;
        this.offset = offset;
    }

    draw() {
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale,
        );

    }

    animateFrame() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1){
                this.framesCurrent++
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw();
        this.animateFrame();
    }
}

class Fighter extends Sprite{
    constructor({
        position,
        velocity,
        color = 'red',
        offset,
        imageSrc,
        scale = 1,
        framesMax = 1,
        framesCurrent = 0,
        framesElapsed = 0,
        framesHold = 10,
        sprites,
        attackBox = { offset: {}, width: undefined, height: undefined}
    }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            framesCurrent,
            framesElapsed,
            framesHold,
            offset
        });
        this.position = position;
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height,
        }
        this.color = color;
        this.isAttacking;
        this.isJumping = false;
        this.isHitting = false;
        this.health = 100;
        this.sprites = sprites;
        this.runTime = true;
        this.dead = false;
        this.botTimer;

        for (const sprite in sprites) {
            sprites[sprite].image = new Image();
            sprites[sprite].image.src = sprites[sprite].imageSrc;
        }
    }

    update() {
        this.draw();
        if (!this.dead)
        this.animateFrame();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
        // c.fillStyle = 'red';
        // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // c.fillStyle = 'blue';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        // gravity
        if (this.velocity.y === 0) {
            this.velocity.y = 0;
            this.position.y = 200;
        } else {
            this.velocity.y += gravity;
            setTimeout(() => {
                this.velocity.y = 0;
            }, 400)
        };

    }

    random(min,max){
        return Math.round(Math.random() * (max-min) + min);
    }

    attack() {
        this.switchSprite('attack1');
        this.isAttacking = true;

        // setTimeout(() => {
        //     this.isAttacking = false;
        // }, 1000)
    }

    attackBot() {
        this.switchSprite('attack1');
        this.isAttacking = true;
        this.botTimer = this.random(500, 2000);
        setTimeout(() => {
            this.isAttacking = false;
        }, this.botTimer) // 500 2000
    }

    takeHit() {
        this.health -= 5;

        if (this.health <= 0) {
            this.switchSprite('death');
        } else {
             this.switchSprite('takeHit');
        }
    }

    takeHitBot(enemy) {
        this.health -= 10;
        if (this.health <= 0) {
            this.switchSprite('death');
        } else {
            this.switchSprite('takeHit');
        }

        enemy.isHitting = true;

        setTimeout(() => {
            enemy.isHitting = false;
        }, enemy.botTimer)
    }

    botLogick(player) {
        this.velocity.x = 0 ;
        if (!this.dead && !player.dead) {
            if (this.position.y === 200) {
                if (this.position.x > player.position.x + 150){
                    if ( this.position.x > player.position.x) {
                        this.runTime = true;
                        this.switchSprite('run');
                        this.position.x -= 5;
                        this.velocity.x = 5;
                    }
                } else if (this.position.x < player.position.x + 150) {
                    this.runTime = true;
                    this.switchSprite('run');
                    this.position.x += 5;
                    this.velocity.x = 5;
                } else if (this.position.x === player.position.x + 150) {
                    this.runTime = false;
                    if(!this.isAttacking) {
                        this.attackBot();
                    }
                }
            }
        }
    }

    switchSprite(sprite) {
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1)
                this.dead = true;
            return
        };

        if (this.image === this.sprites.attack1.image &&
            this.framesCurrent < this.sprites.attack1.framesMax - 1) return;

        if (this.image === this.sprites.takeHit.image &&
            this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;

        switch (sprite) {
            case 'idle':
                if (this.image !== this.sprites.idle.image){
                    this.image = this.sprites.idle.image;
                    this.framesMax = this.sprites.idle.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'run':
                if (this.image !== this.sprites.run.image){
                    this.image = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'jump':
                if (this.image !== this.sprites.jump.image){
                    this.image = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.framesCurrent = 0;
                    this.isJumping = true;

                    setTimeout(() => this.isJumping = false, 500)
                }
                break;
            case 'fall':
                if (this.image !== this.sprites.fall.image){
                    this.image = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'attack1':
                if (this.image !== this.sprites.attack1.image){
                    this.image = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'takeHit':
                if (this.image !== this.sprites.takeHit.image){
                    this.image = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.framesCurrent = 0;
                }
                break;
            case 'death':
                if (this.image !== this.sprites.death.image){
                    this.image = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.framesCurrent = 0;
                }
                break;
        }
    }
}