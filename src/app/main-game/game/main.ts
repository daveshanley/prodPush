import Game = Phaser.Game;
import {Product, ScoreType} from './product';
import {ScoreBoard} from './scoreboard';
import {Level} from './level';

const MAX_FIRE_DELAY = 5000;
const MIN_FIRE_DELAY = 500;
const FIRE_DELTA = 50;


export class MainScreen extends Phaser.State {
    private gameActive = true;
    private topPlatformSprite;
    private bottomPlatformSprite;
    private topRightBarrierSprite;
    private redSpinWheelSprite;
    private leftPipeSprite;
    private rightBarrierSprite;
    private productionPipesSprite;
    private productionSignSprite;
    private backgroundSprite;

    private pipeKillLayer;
    private fireTimeout = 0;
    private particleStreamManager: any;
    private firePipe;
    private scoreBoard: ScoreBoard;

    private lifeHearts = [];
    private lifeHeartExplosionEmitter;
    private heartImage;

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
    private explosion1: Phaser.Sound;
    private explosion2: Phaser.Sound;
    private explosion3: Phaser.Sound;
    private bounce1: Phaser.Sound;
    private bounce2: Phaser.Sound;
    private pushed1: Phaser.Sound;
    private pushed2: Phaser.Sound;

    private theme1Playing;
    private theme2Playing;
    private theme3Playing;


    constructor(game: Phaser.Game, scoreboard: ScoreBoard) {
        super();
        this.game = game;
        this.products = [];
        this.levelMusic = [];
        this.scoreBoard = scoreboard;


    }

    preload() {


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
        this.productionPipesSprite.body.loadPolygon('production', 'production-pipes', this.productionPipesSprite)

        // animated production sign
        this.productionSignSprite = this.game.add.sprite(40, 650, 'production-sign');
        this.productionSignSprite.animations.add('flash-production-sign');
        this.productionSignSprite.animations.play('flash-production-sign', 1, true);


        // left pipe structure
        this.leftPipeSprite = this.game.add.sprite(220, 310, 'left-pipe');
        this.game.physics.box2d.enable(this.leftPipeSprite);
        this.leftPipeSprite.body.static = 1;
        this.leftPipeSprite.body.clearFixtures();
        this.leftPipeSprite.body.loadPolygon('physics', 'left-pipe', this.leftPipeSprite);

        // red spinning wheel
        this.redSpinWheelSprite = this.game.add.sprite(152, 360, 'red-spin-wheel');
        this.game.physics.box2d.enable(this.redSpinWheelSprite);
        this.redSpinWheelSprite.body.static = true;

        // hot pipe kill sprite
        this.pipeKillLayer = this.game.add.sprite(-12, 152, 'tranny');
        this.game.physics.box2d.enable(this.pipeKillLayer);
        this.pipeKillLayer.body.static = 1;
        this.pipeKillLayer.body.clearFixtures();
        this.pipeKillLayer.body.loadPolygon('kill', 'left-pipe', this.pipeKillLayer);

        // fire & smoke particles
        this.firePipe = this.particleStreamManager.createEmitter();
        this.firePipe.addToWorld();
    }

    createPlatformSprites() {

        // top platform
        this.topPlatformSprite = this.game.add.sprite(Level.TOP_BOUNCER_XPOS, Level.TOP_BOUNCER_YPOS, 'platform');
        this.topPlatformSprite.anchor.set(0);
        this.game.physics.box2d.enable(this.topPlatformSprite);
        this.topPlatformSprite.body.restitution = 0.9;
        this.topPlatformSprite.body.gravity = 0;
        this.topPlatformSprite.body.static = true;


        // bottom platform
        this.bottomPlatformSprite =
            this.game.add.sprite(Level.BOTTOM_BOUNCER_XPOS, Level.BOTTOM_BOUNCER_YPOS, 'platform');
        this.bottomPlatformSprite.anchor.set(0);
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
        this.scoreLabelText = this.game.add.text(this.game.width / 2 - 80, 35, 'Score', Level.ScoreLabelStyle);
        this.scoreLabelText.anchor.set(0.5);

        // score value
        this.scoreValueText = this.game.add.text(0, 0, '0', Level.ScoreValueStyle);
        this.scoreValueText.anchor.set(0);
        this.scoreValueText.setTextBounds(this.game.width / 2, -20, 250, 100);
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
        for (let x = 0; x < this.scoreBoard.lives; x++) {
            const xPos = 30 + (60 * x);
            const heart = this.game.add.sprite(xPos, -50, 'heart');
            heart.anchor.set(0.5);
            heart.scale.set(0.2);

            this.game.add.tween(heart).to({y: 30}, 1000, Phaser.Easing.Bounce.Out, true, x * 50);
            this.game.add.tween(heart.scale).to({
                x: 0.22,
                y: 0.22
            }, 1000, Phaser.Easing.Elastic.In, true, x * 500, -1, true);

            let rotateRight = () => {
            };
            let rotateLeft = () => {
            };

            rotateLeft = () => {
                const heartTween = this.game.add.tween(heart);
                heartTween.to({angle: -15}, 1500, Phaser.Easing.Elastic.In, true, x * 500, 0, true);
                heartTween.onComplete.add(rotateRight, this);
                heartTween.start();
            }

            rotateRight = () => {
                const heartTween = this.game.add.tween(heart);
                heartTween.to({angle: 15}, 1500, Phaser.Easing.Elastic.In, true, x * 500, 0, true);
                heartTween.onComplete.add(rotateLeft, this);
                heartTween.start();
            }

            rotateRight();
            this.lifeHearts.push(heart);
        }
    }

    create() {

        this.theme1Playing = false;
        this.theme2Playing = false;
        this.theme3Playing = false;

        this.gameActive = true;

        // set physics
        Level.SetPhysics(this.game);

        // background
        this.backgroundSprite = this.game.add.sprite(0, 0, 'background');

        // do the init thing.
        this.setupParticleStreamManager();
        this.createPlatformSprites();
        this.createEnvironmentSprites();
        this.setControls();
        this.setScoringComponents();
        this.buildLifeHearts();
        this.configureLifeHeartExplode();
        this.configureSound();


    }

    configureSound() {
        this.theme1 = this.game.add.audio('theme1');
        this.theme2 = this.game.add.audio('theme2');
        this.theme3 = this.game.add.audio('theme3');
        this.fireBurnExplosion = this.game.add.audio('fire-burn-explosion');
        this.explosion1 = this.game.add.audio('explosion1');
        this.explosion2 = this.game.add.audio('explosion2');
        this.explosion3 = this.game.add.audio('explosion3');
        this.bounce1 = this.game.add.audio('bounce1');
        this.bounce2 = this.game.add.audio('bounce2');
        this.pushed1 = this.game.add.audio('pushed1');
        this.pushed2 = this.game.add.audio('pushed2');

        this.levelMusic = [this.theme1, this.theme2, this.theme3];

        if (Level.MUSIC_ON) {
            this.game.sound.setDecodedCallback(this.levelMusic, this.startMusic, this);
        }
    }

    configureLifeHeartExplode() {

        const lifeSpan = {
            lifespan: 500
        };

        this.particleStreamManager.addData('heart-pop-props', lifeSpan);
        this.lifeHeartExplosionEmitter = this.particleStreamManager.createEmitter((Phaser as any).ParticleStorm.PIXEL);
        this.lifeHeartExplosionEmitter.renderer.pixelSize = 8;
        this.lifeHeartExplosionEmitter.addToWorld();
        this.heartImage = this.particleStreamManager.createImageZone('heart-small');
    }

    startMusic() {


        this.levelMusic.shift();

        this.theme1.loopFull(0.6);
        this.theme1Playing = true;
        this.theme1.onLoop.add(this.theme1Looped, this);


    }

    theme1Looped() {
        this.levelMusic.shift();
        this.theme1Playing = false;
        this.theme1.stop();

        this.theme2Playing = true;
        this.theme2.loopFull(0.6);
        this.theme2.onLoop.add(this.theme2Looped, this);
    }

    theme2Looped() {
        this.levelMusic.shift();
        this.theme2Playing = false;
        this.theme2.stop();

        this.theme3Playing = true;
        this.theme3.loopFull(0.6);
        this.theme3.onLoop.add(this.theme3Looped, this);
    }

    theme3Looped() {
        this.levelMusic.shift();
        this.theme3Playing = false;
        this.theme3.stop();

        this.startMusic();
    }

    moveTopRight() {
        if (this.gameActive && this.topPlatformSprite.body.x <= this.game.width - 400) {
            this.topPlatformSprite.body.x += this.topPlatformSprite.width;
        }
    }

    moveTopLeft() {
        if (this.gameActive && this.topPlatformSprite.body.x > Level.TOP_BOUNCER_XPOS) {
            this.topPlatformSprite.body.x -= this.topPlatformSprite.width;
        }
    }

    moveBottomRight() {
        if (this.gameActive && this.bottomPlatformSprite.body.x + this.bottomPlatformSprite.width <= this.game.width) {
            this.bottomPlatformSprite.body.x += this.bottomPlatformSprite.width;
        }
    }

    moveBottomLeft() {
        if (this.gameActive && this.bottomPlatformSprite.body.x > Level.BOTTOM_BOUNCER_XPOS + 1) {
            this.bottomPlatformSprite.body.x -= this.bottomPlatformSprite.width;
        }
    }

    createProduct() {
        if (this.gameActive) {
            const product = Product.Create(this.game, this.particleStreamManager);

            // set contact handlers
            product.sprite.body.setBodyContactCallback(this.topPlatformSprite, this.topPlatformHit, this);
            product.sprite.body.setBodyContactCallback(this.bottomPlatformSprite, this.bottomPlatformHit, this);
            product.sprite.body.setBodyContactCallback(this.firePipe, this.popProduct, product);
            product.sprite.body.setBodyContactCallback(this.pipeKillLayer, this.popProduct, product);

            // add to local collection.
            this.products.push(product);
        }

    }

    popProduct() {
        const product: any = this;
        product.popping = true;
    }

    topPlatformHit(body1, body2, fixture1, fixture2, begin, contact) {
        contact.SetTangentSpeed(-10);
        this.bounce1.play();
    }

    bottomPlatformHit(body1, body2, fixture1, fixture2, begin, contact) {
        contact.SetTangentSpeed(10);
        body1.velocity.x = -270;
        this.bounce2.play();
    }

    render() {
        //this.game.debug.box2dWorld();
    }

    updateProducts() {
        for (const product of this.products) {

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
                    this.fireBurnExplosion.play();
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
                    const rand = Math.floor(Math.random() * 3) + 1;
                    switch (rand) {
                        case 1:
                            this.explosion1.play();
                            break;
                        case 2:
                            this.explosion2.play();
                            break;
                        case 3:
                            this.explosion3.play();
                            break;
                    }

                }
            }
        }

        // rebuild products.
        const products = this.products;
        this.products = [];
        for (const product of products) {
            if (!product.killed) {
                this.products.push(product);
            }
        }
    }

    renderLives() {

    }

    gameOver() {
        this.gameActive = false;

        const gameOver = 'You  broke  the  pipeline';
        const go = this.game.add.text(this.game.world.centerX, this.game.world.centerY, gameOver, Level.GameOverStyle);
        go.anchor.set(0.5);
        this.game.add.tween(go).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 5000);


        this.topPlatformSprite.body.static = false;
        this.topPlatformSprite.body.velocity.x = this.game.rnd.integerInRange(5, 200);
        this.topPlatformSprite.body.velocity.y = this.game.rnd.integerInRange(5, 200);

        this.bottomPlatformSprite.body.static = false;
        this.bottomPlatformSprite.body.velocity.x = this.game.rnd.integerInRange(-200, -5);
        this.bottomPlatformSprite.body.velocity.y = this.game.rnd.integerInRange(-200, -5);

        this.topRightBarrierSprite.body.static = false;
        this.topRightBarrierSprite.body.velocity.x = this.game.rnd.integerInRange(-200, -5);
        this.topRightBarrierSprite.body.velocity.y = this.game.rnd.integerInRange(-200, -5);

        this.redSpinWheelSprite.body.static = false;
        this.redSpinWheelSprite.body.velocity.x = this.game.rnd.integerInRange(5, 200);
        this.redSpinWheelSprite.body.velocity.y = this.game.rnd.integerInRange(5, 200);

        this.leftPipeSprite.body.static = false;
        this.leftPipeSprite.body.velocity.x = this.game.rnd.integerInRange(5, 200);
        this.leftPipeSprite.body.velocity.y = this.game.rnd.integerInRange(5, 200);

        this.rightBarrierSprite.body.static = false;
        this.rightBarrierSprite.body.velocity.x = this.game.rnd.integerInRange(-200, -5);
        this.rightBarrierSprite.body.velocity.y = this.game.rnd.integerInRange(-200, -5);

        this.productionPipesSprite.body.static = false;
        this.productionPipesSprite.body.velocity.x = this.game.rnd.integerInRange(50, 200);
        this.productionPipesSprite.body.velocity.y = this.game.rnd.integerInRange(50, 200);


        this.pipeKillLayer.body.static = false;
        this.productionSignSprite.destroy();

        if (this.theme1Playing) {
            this.theme1.stop();
        }
        if (this.theme2Playing) {
            this.theme2.stop();
        }
        if (this.theme3Playing) {
            this.theme3.stop();
        }

        this.game.add.tween(this.backgroundSprite).to({alpha: 0}, 3000, Phaser.Easing.Linear.None, true, 500);

        this.game.time.events.add(Phaser.Timer.SECOND * 5,
            () => {
                this.game.state.start('HighScoreEntryScreen');
            }, this);

        this.game.input.keyboard.removeKey(Phaser.Keyboard.A);
        this.game.input.keyboard.removeKey(Phaser.Keyboard.S);
        this.game.input.keyboard.removeKey(Phaser.Keyboard.K);
        this.game.input.keyboard.removeKey(Phaser.Keyboard.L);
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    }

    removeLife() {
        this.scoreBoard.loseLife();
        const heart = this.lifeHearts.pop();
        if (heart) {

            // create heart pop explosion.
            this.lifeHeartExplosionEmitter.emit(
                'heart-pop-props',
                heart.x - 50,
                heart.y - 50,
                {
                    zone: this.heartImage,
                    full: true,
                    spacing: 8,
                    setColor: true,
                    radiateFrom: {
                        x: heart.x,
                        y: heart.y,
                        velocity: 3
                    }
                }
            );
            heart.destroy();
        }
    }


    pushedProduct(product: Product) {

        switch (product.score) {
            case ScoreType.Regular:
                this.pushed1.play();
                break;
            case ScoreType.Special:
                this.pushed2.play();
                break;
            case ScoreType.Ultimate:
                this.pushed2.play();
                break;
        }
        this.scoreValueText.text = this.scoreBoard.productPushed(product);
        product.killed = true;
        product.sprite.destroy();
    }

    lostProduct(product: Product) {

        this.removeLife();
        product.killed = true;
        product.sprite.destroy();
        if (this.scoreBoard.lives <= 0) {
            this.gameOver();
        }
    }

    spinWheelAndFirePipe() {
        if (this.gameActive) {
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
    }


    fireTimer() {
        let delay = MAX_FIRE_DELAY;
        const score = this.scoreBoard.score;
        if (score > 10) {
            const min = (score * FIRE_DELTA);
            const max = (MAX_FIRE_DELAY - (score * FIRE_DELTA));
            const delayVal =  this.game.rnd.integerInRange(min, max);
            if(delayVal <= 0 ) {
                delay = MIN_FIRE_DELAY; // don't drop below this, otherwise the game will be insane.
            } else {
                delay = delayVal;
            }
        }
        return delay;
    }

    update() {

        this.spinWheelAndFirePipe();

        if (this.game.time.now > this.fireTimeout) {
            this.createProduct();
            const delay = this.fireTimer();
            this.fireTimeout = this.game.time.now + delay;
        }

        this.updateProducts();

    }
}