let platforms;
let player;
let cursor;
let pointers;
let starrs;
let score = 0;
let scoreText;
let bombs;
let joyStick;
let cursorKeys;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    pointers = this.input.activePointer;

    this.add.image(400, 300, 'sky');

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.4);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    createStars();

    bombs = this.physics.add.group();

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(player, bombs, hitBomb, null, this);

    joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: 350,
        y: 680,
        radius: 50,
        base: this.add.circle(0, 0, 50, 0x888888),
        thumb: this.add.circle(0, 0, 25, 0xcccccc),
        // dir: 'up&down',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
    }).on('update', dumpJoyStickState, this);
    cursorKeys = joyStick.createCursorKeys();
}

function update() {
    if (cursors.left.isDown) {
        moveLeft();
    } else if (cursors.right.isDown) {
        moveRight();
    } else {
        stay();
    }

    if (cursors.space.isDown) {
        jump();
    }
}

function moveLeft() {
    player.setVelocityX(-160);
    player.anims.play('left', true);
}

function moveRight() {
    player.setVelocityX(160);
    player.anims.play('right', true);
}

function stay() {
    for (let name in cursorKeys) {
        if (cursorKeys[name].isDown) {
            return;
        }
    }
    player.setVelocityX(0);
    player.anims.play('turn');
}

function jump() {
    if(player.body.touching.down) {
        player.setVelocityY(-330);
    }
}


function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        createStars();

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function createStars() {
    stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
    });
}

function dumpJoyStickState() {
    for (let name in cursorKeys) {
        if (cursorKeys[name].isDown) {
            console.log(name)
            switch(name) {
                case 'left':
                    moveLeft();
                    break;
                case 'right':
                    moveRight();
                    break;
                case 'up': 
                    jump();
                    break;
            }
        }
    }
}

