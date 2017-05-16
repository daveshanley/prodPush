import Game = Phaser.Game;
import {Product, ScoreType} from "./product";
import {ScoreBoard} from "./scoreboard";
import {Level} from "./level";

export class MainScreen extends Phaser.State {

    private topPlatformSprite;
    private bottomPlatformSprite;
    private topRightBarrierSprite;
    private redSpinWheelSprite;
    private leftPipeSprite;
    private rightBarrierSprite;
    private productionPipesSprite;
    private productionSignSprite;

    private pipeKillLayer;
    private fireTimeout = 0;
    private particleStreamManager: any;
    private firePipe;
    private scoreBoard: ScoreBoard;

    private lifeHearts = [];

    private scoreLabelText;
    private scoreValueText;

    private wheelForward: boolean = true;
    private wheelRotation = 0;

    private aKey;
    private sKey;

    private kKey;
    private lKey;

    private products: Array<Product>;

    // sounds
    private levelMusic: Array<Phaser.Sound>;
    private theme1;
    private theme2;
    private theme3;
    private fireBurnExplosion: Phaser.Sound;



    constructor(game: Phaser.Game) {
        super();
        this.game = game;
        this.products = [];
        this.levelMusic = [];
    }

    preload() {

        // load physics and sprite mappings.
        this.game.load.physics("physics", "assets/left-sprite.json");
        this.game.load.physics("kill", "assets/left-sprite-kill.json");
        this.game.load.physics("production", "assets/production-pipes.json");
        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');

        // load individual images.
        this.game.load.image('background', 'assets/game-background.png');
        this.game.load.image('heart', 'assets/heart.png');
        this.game.load.image('platform', 'assets/pipe-bouncer.png');
        this.game.load.image('top-right-pipe', 'assets/top-right-pipe.png');
        this.game.load.image('right-gas-pipe', 'assets/right-gas-pipe.png');
        this.game.load.image('red-spin-wheel', 'assets/red-spin-wheel.png');
        this.game.load.image('production-pipes', 'assets/production-pipes.png');
        this.game.load.image('tranny', 'assets/particlestorm/particles/1x1.png');
        this.game.load.image("left-pipe", "assets/left-pipe.png");
        this.game.load.spritesheet("production-sign", "assets/production-sign.png", 152, 106);

        // audio
        this.game.load.audio('theme1', 'assets/sound/level1.wav');
        this.game.load.audio('theme2', 'assets/sound/level2.wav');
        this.game.load.audio('theme3', 'assets/sound/level3.wav');

        this.game.load.audio('fire-burn-explosion', 'assets/sound/sfx_deathscream_robot3.wav');


        // load particles.
        this.game.load.path = 'assets/particlestorm/particles/';
        this.game.load.images(
            [
                'sphere1',
                'sphere2',
                'sphere3',
                'sphere4',
                'sphere5',
                'fire1',
                'fire2',
                'fire3',
                'smoke-puff',
                'pixel_blue',
                'pixel_green',
                'pixel_red',
                'pixel_white',
                'pixel_yellow'
            ]
        );

        this.game.load.atlas('colorsHD');


    }

    createEnvironmentSprites() {

        // top right barrier pipe
        this.topRightBarrierSprite = this.game.add.sprite(this.game.width - 130, 125, 'top-right-pipe');
        this.game.physics.box2d.enable(this.topRightBarrierSprite);
        this.topRightBarrierSprite.body.restitution = 0;
        this.topRightBarrierSprite.body.static = true;
        this.topRightBarrierSprite.body.setRectangle(30, 450, 0, 18, -0.8);

        // right barrier pipe
        this.rightBarrierSprite = this.game.add.sprite(this.game.width - 10, 500, 'right-gas-pipe');
        this.game.physics.box2d.enable(this.rightBarrierSprite);
        this.rightBarrierSprite.body.static = 1;

        // production pipes,
        this.productionPipesSprite = this.game.add.sprite(175, 694, 'production-pipes');
        this.game.physics.box2d.enable(this.productionPipesSprite);
        this.productionPipesSprite.body.static = 1;
        this.productionPipesSprite.body.clearFixtures();
        this.productionPipesSprite.body.loadPolygon("production", "production-pipes", this.productionPipesSprite)

        // animated production sign
        this.productionSignSprite = this.game.add.sprite(40, 650, "production-sign");
        this.productionSignSprite.animations.add('flash-production-sign');
        this.productionSignSprite.animations.play('flash-production-sign', 1, true);


        // left pipe structure
        this.leftPipeSprite = this.game.add.sprite(220, 310, 'left-pipe');
        this.game.physics.box2d.enable(this.leftPipeSprite);
        this.leftPipeSprite.body.static = 1;
        this.leftPipeSprite.body.clearFixtures();
        this.leftPipeSprite.body.loadPolygon("physics", "left-pipe", this.leftPipeSprite);

        // red spinning wheel
        this.redSpinWheelSprite = this.game.add.sprite(152, 360, 'red-spin-wheel');
        this.game.physics.box2d.enable(this.redSpinWheelSprite);
        this.redSpinWheelSprite.body.static = true;

        // hot pipe kill sprite
        this.pipeKillLayer = this.game.add.sprite(-12, 152, 'tranny');
        this.game.physics.box2d.enable(this.pipeKillLayer);
        this.pipeKillLayer.body.static = 1;
        this.pipeKillLayer.body.clearFixtures();
        this.pipeKillLayer.body.loadPolygon("kill", "left-pipe", this.pipeKillLayer);

        // fire & smoke particles
        this.firePipe = this.particleStreamManager.createEmitter();
        this.firePipe.addToWorld();
    }

    createPlatformSprites() {

        // top platform
        this.topPlatformSprite = this.game.add.sprite(258, 283, 'platform');
        this.game.physics.box2d.enable(this.topPlatformSprite);
        this.topPlatformSprite.body.restitution = 0.9;
        this.topPlatformSprite.body.gravity = 0;
        this.topPlatformSprite.body.static = true;
        this.topPlatformSprite.fixedRotation = true;
        this.topPlatformSprite.anchor.set(0);


        // bottom platform
        this.bottomPlatformSprite = this.game.add.sprite(1100, 700, 'platform');
        this.game.physics.box2d.enable(this.bottomPlatformSprite);
        this.bottomPlatformSprite.body.restitution = 0.66;
        this.bottomPlatformSprite.body.gravity = 0;
        this.bottomPlatformSprite.body.static = true;
    }

    setControls() {

        // top platform
        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.sKey.onDown.add(this.moveTopRight, this);
        this.aKey.onDown.add(this.moveTopLeft, this);

        // bottom platform
        this.kKey = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
        this.lKey = this.game.input.keyboard.addKey(Phaser.Keyboard.L);
        this.kKey.onDown.add(this.moveBottomLeft, this);
        this.lKey.onDown.add(this.moveBottomRight, this);
    }

    setScoringComponents() {

        // score label
        this.scoreLabelText = this.game.add.text(this.game.width / 2 - 60, 35, "Score", Level.ScoreLabelStyle);
        this.scoreLabelText.anchor.set(0.5);

        // score value
        this.scoreValueText = this.game.add.text(0, 0, "0", Level.ScoreValueStyle);
        this.scoreValueText.anchor.set(0);
        this.scoreValueText.setTextBounds(this.game.width / 2, -10, 250, 100);
    }



    setupParticleStreamManager() {
        // particle stream manager & data
        this.particleStreamManager = this.game.plugins.add((Phaser as any).ParticleStorm);
        this.particleStreamManager.addData('special-score-emitter', Product.SpecialScoreEmitter);
        this.particleStreamManager.addData('ultimate-score-emitter', Product.UltimateScoreEmitter);
        this.particleStreamManager.addData('ultimate-score-pop', Product.UltimateScoreEmitterPop);
        this.particleStreamManager.addData('explode', Product.EmitterExplode);
        this.particleStreamManager.addData('fire', Level.FireEmitter);
        this.particleStreamManager.addData('smoke', Level.SmokeEmitter);
    }

    buildLifeHearts() {
        this.lifeHearts = [];
        for(let x = 0; x < this.scoreBoard.lives; x++) {
            let xPos = 30 + (60 * x);

            let heart = this.game.add.sprite(xPos, -50, 'heart');
            heart.anchor.set(0.5);
            heart.scale.set(0.2);

            this.game.add.tween(heart).to({ y: 30 }, 1000, Phaser.Easing.Bounce.Out, true, x * 50);
            this.game.add.tween(heart.scale).to({ x: 0.22, y: 0.22}, 1000, Phaser.Easing.Elastic.In, true, x * 500, -1, true);

            let rotateRight = () => {};
            let rotateLeft = () => {};

            rotateLeft = () => {
                let heartTween = this.game.add.tween(heart);
                heartTween.to({ angle: -15}, 1500, Phaser.Easing.Elastic.In, true, x * 500, 0, true);
                heartTween.onComplete.add(rotateRight, this);
                heartTween.start();
            }

            rotateRight = () => {
                let heartTween = this.game.add.tween(heart);
                heartTween.to({ angle: 15}, 1500, Phaser.Easing.Elastic.In, true, x * 500, 0, true);
                heartTween.onComplete.add(rotateLeft, this);
                heartTween.start();
            }

            rotateRight();
            this.lifeHearts.push(heart);
        }
    }

    create() {

        // set physics
        Level.SetPhysics(this.game);

        // set up scoreboard
        this.scoreBoard = new ScoreBoard(this.game);

        //background
        this.game.add.sprite(0, 0, 'background');

        // do the init thing.
        this.setupParticleStreamManager();
        this.createPlatformSprites();
        this.createEnvironmentSprites();
        this.setControls();
        this.setScoringComponents();
        this.buildLifeHearts();
        this.configureSound();
    }

    configureSound() {
        this.theme1 = this.game.add.audio('theme1');
        this.theme2 = this.game.add.audio('theme2');
        this.theme3 = this.game.add.audio('theme3');
        this.fireBurnExplosion = this.game.add.audio('fire-burn-explosion');

        this.levelMusic = [this.theme1, this.theme2, this.theme3];
        this.game.sound.setDecodedCallback(this.levelMusic, this.startMusic, this);
    }

    startMusic() {


        this.levelMusic.shift();

        this.theme1.loopFull(0.6);
        this.theme1.onLoop.add(this.hasLooped, this);



    }

    hasLooped() {
        this.levelMusic.shift();

        this.theme1.stop();

        this.theme2.loopFull(0.6);
    }

    moveTopRight() {
        if (this.topPlatformSprite.body.x <= this.game.width - 400) {
            this.topPlatformSprite.body.x += 250;
        }
    }kkk

    moveTopLeft() {
        if (this.topPlatformSprite.body.x >= (250 + 250)) {
            this.topPlatformSprite.body.x -= 250;
        }
    }

    moveBottomRight() {
        if (this.bottomPlatformSprite.body.x <= this.game.width - 250) {

            if(this.bottomPlatformSprite.body.x <= 600) {
                this.bottomPlatformSprite.body.x += 130;
            } else {
                this.bottomPlatformSprite.body.x += 250;
            }

        }
    }

    moveBottomLeft() {
        if (this.bottomPlatformSprite.body.x >= 550) {
            console.log(this.bottomPlatformSprite.body.x)

            if(this.bottomPlatformSprite.body.x <= 600) {
                this.bottomPlatformSprite.body.x -= 130;
            } else {
                this.bottomPlatformSprite.body.x -= 250;
            }

        }
    }

    createProduct() {

        let product = Product.Create(this.game, this.particleStreamManager);

        // set contact handlers
        product.sprite.body.setBodyContactCallback(this.topPlatformSprite, this.topSpriteHit, this);
        product.sprite.body.setBodyContactCallback(this.bottomPlatformSprite, this.bottomSpriteHit, this);
        product.sprite.body.setBodyContactCallback(this.firePipe, this.popProduct, product);
        product.sprite.body.setBodyContactCallback(this.pipeKillLayer, this.popProduct, product);

        // add to local collection.
        this.products.push(product);

    }

    popProduct() {
        let product: any = this;
        product.popping = true;
       console.log(this.fireBurnExplosion);
    }

    topSpriteHit(body1, body2, fixture1, fixture2, begin, contact) {
        contact.SetTangentSpeed(-10);
    }

    bottomSpriteHit(body1, body2, fixture1, fixture2, begin, contact) {
        contact.SetTangentSpeed(10);
        body1.velocity.x = -270;
    }

    render() {
        //this.game.debug.box2dWorld();
    }

    updateProducts() {
        for (let product of this.products) {

            if (product.popping) {

                if (product.popAnimationCount >= 0 && product.popAnimationCount < 50) {
                    if (Level.isEven(product.popAnimationCount)) {
                        product.sprite.body.x += 8;
                        product.sprite.body.y += 5;

                    } else {
                        product.sprite.body.x -= 8.2;
                        product.sprite.body.y -= 5.5;
                    }
                    product.popAnimationCount++;
                    product.sprite.body.static = true;

                }
                if (product.popAnimationCount >= 50) {
                    product.popping = false;
                    this.lostProduct(product);
                }
            }

            // decide to spit out particles if the product is a P1 or P0;
            if (product.score == ScoreType.Special) {
                product.emitter.emit('special-score-emitter', product.sprite.body.x, product.sprite.body.y, {
                    zone: product.particleCircle,
                    total: 2
                });
            }

            if (product.score == ScoreType.Ultimate) {
                product.emitter.emit('ultimate-score-emitter', product.sprite.body.x, product.sprite.body.y, {
                    zone: product.particleCircle,
                    total: 2
                });
                product.emitter.emit('ultimate-score-pop', product.sprite.body.x, product.sprite.body.y, {
                    zone: product.particleCircle,
                    total: 2
                });
            }

            // check if product has popped off boundary
            if (product.sprite.body.y > this.game.world.height) {
                if (product.sprite.body.x >= 30 && product.sprite.body.x <= 170) {
                    this.pushedProduct(product);
                } else {
                    this.lostProduct(product);
                }
            }
        }

        // rebuild products.
        let products = this.products;
        this.products = [];
        for (let product of products) {
            if (!product.killed) {
                this.products.push(product);
            }
        }
    }

    renderLives() {

    }

    gameOver() {
        var text = "GAME OVER";
        var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

        var t = this.game.add.text(this.game.world.centerX, 0, text, style);
    }

    removeLife() {
        this.scoreBoard.loseLife();
        let heart = this.lifeHearts.pop();
        if(heart) {
            heart.destroy();
        }
    }


    pushedProduct(product: Product) {
        this.scoreValueText.text = this.scoreBoard.productPushed(product);
        product.killed = true;
        product.sprite.destroy();
    }

    lostProduct(product: Product) {

        this.removeLife();

        product.killed = true;
        product.sprite.destroy();

        console.log(this.scoreBoard.lives);
        if(this.scoreBoard.lives <= 0) {
            this.gameOver();
        }
    }

    spinWheelAndFirePipe() {

        // spring wheel forward for a bit and spit fire, then do the reverse.
        if (this.wheelForward == true && this.wheelRotation >= 0) {
            this.redSpinWheelSprite.body.rotation += 0.05;

            if (this.redSpinWheelSprite.body.rotation >= (6.28319 * 2)) {
                this.wheelForward = false;
                this.firePipe.emit('fire', [440, 420], 400, {repeat: 50, total: 2, frequency: 30});

            }
        }
        if (this.wheelForward != true && this.wheelRotation >= 0) {
            this.redSpinWheelSprite.body.rotation -= 0.05;
            if (this.redSpinWheelSprite.body.rotation <= 0) {
                this.wheelForward = true;
                this.firePipe.emit('fire', [440, 420], 400, {repeat: 50, total: 2, frequency: 30});
            }
        }
    }

    update() {

        this.spinWheelAndFirePipe();

        if (this.game.time.now > this.fireTimeout) {
            this.createProduct();
            this.fireTimeout = this.game.time.now + 5000;
        }

        this.updateProducts();

    }
}