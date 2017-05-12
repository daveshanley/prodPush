import Game = Phaser.Game;
import {Product, ScoreType} from "./product";
import {ScoreBoard} from "./scoreboard";

export class ProdPush {
    constructor(private game: Phaser.Game) {
    }

    preload() {
        console.log('preloading...');
        // this.game.state.add("PlayGame", ProdPush.Cup);
        // this.game.state.start("PlayGame");

    }

    create() {
        console.log('creating...');
    }

}

let WebFontConfig = {};


export class MainScreen {

    private topPlatformSprite;
    private bottomPlatformSprite;
    private topRightPipeSprite;
    private redSpinWheelSprite;
    private pipeKillLayer;

    private leftPipeSprite;
    private rightGasPipeSprite;
    private productionPipesSprite;
    private productionSignSprite;

    private fireTimeout = 0;
    private signFlashTimeout = 0;
    private products: Array<Product>;
    private manager: any;
    private firePipe;
    private scoreBoard: ScoreBoard;

    private scoreLabelText;
    private scoreValueText;



    private aKey;
    private sKey;

    private kKey;
    private lKey;

    constructor(private game: Phaser.Game) {
        this.products = [];
    }

    createText() {
        let style = {
            font: "48px Monospace",
            fill: "#00ff00",
            align: "center"
        }

        var text = this.game.add.text(this.game.width / 2, this.game.height / 2 - 100, "Crack Alien Code", style);

    }



    preload() {



        this.game.load.image('background', 'assets/game-background.png');
        this.game.load.image('platform', 'assets/pipe-bouncer.png');
        this.game.load.image('top-right-pipe', 'assets/top-right-pipe.png');
        this.game.load.image('right-gas-pipe', 'assets/right-gas-pipe.png');
        this.game.load.image('red-spin-wheel', 'assets/red-spin-wheel.png');
        this.game.load.image('production-pipes', 'assets/production-pipes.png');
        this.game.load.image('tranny', 'assets/particlestorm/particles/1x1.png');

        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');
        //this.game.load.atlasJSONHash('production-sign', 'assets/production-sign.png', 'assets/production-sign.json');

        this.game.load.image("left-pipe", "assets/left-pipe.png");
        this.game.load.physics("physics", "assets/left-sprite.json");

        this.game.load.physics("kill", "assets/left-sprite-kill.json");
        this.game.load.physics("production", "assets/production-pipes.json");


        this.game.load.spritesheet("production-sign", "assets/production-sign.png", 152, 106);


        this.game.load.path = 'assets/particlestorm/particles/';
        this.game.load.images(['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5', 'fire1', 'fire2', 'fire3', 'smoke-puff']);




    }

    create() {

        this.scoreBoard = new ScoreBoard(this.game);


        this.manager = this.game.plugins.add((Phaser as any).ParticleStorm);


        //background
        this.game.add.sprite(0, 0, 'background');


        var data = {
            lifespan: 1000,
            image: ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5'],
            vx: {min: -0.5, max: 0.5},
            vy: {min: -1, max: -2},
            rotation: {delta: 2},
            blendMode: 'ADD',
            alpha: {initial: 0, value: 0.4, control: 'linear'}
        };


        var explode = {
            lifespan: 3000
        };


        this.manager.addData('basic', data);
        this.manager.addData('explode', data);


        this.game.physics.startSystem(Phaser.Physics.BOX2D);
        this.game.physics.box2d.gravity.y = 550;
        this.game.physics.box2d.setBoundsToWorld();


        this.game.physics.box2d.restitution = 0.4;
        this.game.physics.box2d.debugDraw.shapes = true;

        this.topPlatformSprite = this.game.add.sprite(385, 300, 'platform');
        this.game.physics.box2d.enable(this.topPlatformSprite);

        this.bottomPlatformSprite = this.game.add.sprite(1100, 700, 'platform');
        this.game.physics.box2d.enable(this.bottomPlatformSprite);



        this.topRightPipeSprite = this.game.add.sprite(this.game.width - 130, 125, 'top-right-pipe');
        this.game.physics.box2d.enable(this.topRightPipeSprite);



        this.rightGasPipeSprite = this.game.add.sprite(this.game.width-10, 500, 'right-gas-pipe');
        this.game.physics.box2d.enable(this.rightGasPipeSprite);
        this.rightGasPipeSprite.body.static = 1;


        this.productionPipesSprite = this.game.add.sprite(175, 694, 'production-pipes');

        this.game.physics.box2d.enable(this.productionPipesSprite);
        this.productionPipesSprite.body.static = 1;
        this.productionPipesSprite.body.clearFixtures();
        this.productionPipesSprite.body.loadPolygon("production", "production-pipes", this.productionPipesSprite);


       this.productionSignSprite = this.game.add.sprite(40, 650, "production-sign");

        var walk = this.productionSignSprite.animations.add('flash');
        this.productionSignSprite.animations.play('flash', 1, true);




        this.leftPipeSprite = this.game.add.sprite(220, 310, 'left-pipe');
        this.game.physics.box2d.enable(this.leftPipeSprite);
        this.leftPipeSprite.body.static = 1;

        this.leftPipeSprite.body.clearFixtures();

        this.leftPipeSprite.body.loadPolygon("physics", "left-pipe", this.leftPipeSprite);


        this.redSpinWheelSprite = this.game.add.sprite(152, 360, 'red-spin-wheel');
        this.game.physics.box2d.enable(this.redSpinWheelSprite);
        this.redSpinWheelSprite.body.static = true;


        this.topRightPipeSprite.body.static = true;
        //this.topRightPipeSprite.anchor.x = 1
        this.topRightPipeSprite.body.setRectangle(30, 450, 0, 18, -0.8);


        //this.topRightPipeSprite.body.setBodyContactCallback(platformSprite1, contactCallback1, this);


        this.topRightPipeSprite.body.restitution = 0;

        this.topPlatformSprite.body.restitution = 0.9;
        this.topPlatformSprite.body.gravity = 0;
        this.topPlatformSprite.body.static = true;


        this.bottomPlatformSprite.body.restitution = 0.7;
        this.bottomPlatformSprite.body.gravity = 0;
        this.bottomPlatformSprite.body.static = true;


        this.topPlatformSprite.fixedRotation = true;


        this.pipeKillLayer = this.game.add.sprite(-12, 152, 'tranny');
        this.game.physics.box2d.enable(this.pipeKillLayer);
        this.pipeKillLayer.body.static = 1;
        this.pipeKillLayer.body.clearFixtures();
        this.pipeKillLayer.body.loadPolygon("kill", "left-pipe", this.pipeKillLayer);


        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);

        this.kKey = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
        this.lKey = this.game.input.keyboard.addKey(Phaser.Keyboard.L);

        this.sKey.onDown.add(this.moveTopRight, this);
        this.aKey.onDown.add(this.moveTopLeft, this);

        this.kKey.onDown.add(this.moveBottomLeft, this);
        this.lKey.onDown.add(this.moveBottomRight, this);


        var fire = {
            image: ['fire1', 'fire2', 'fire3'],
            blendMode: 'HARD_LIGHT',
            lifespan: {min: 500, max: 800},
            vx: {min: -1, max: 1},
            vy: {value: -1, delta: -0.1},
            scale: {value: 0.4, control: [{x: 0, y: 1}, {x: 1, y: 0.5}]},
            alpha: {value: 1, control: [{x: 0, y: 0}, {x: 0.5, y: 1}, {x: 0.6, y: 1}, {x: 1, y: 0}]},
            bringToFront: true,
            emit: {
                name: 'smoke',
                value: 1,
                control: [{x: 0, y: 0}, {x: 0.2, y: 0}, {x: 0.5, y: 0.5}]
            }
        };

        var smoke = {
            image: 'smoke-puff',
            lifespan: {min: 700, max: 1000},
            vx: 0,
            vy: {value: {min: -2, max: -1}, delta: -0.05, control: [{x: 0, y: 1}, {x: 1, y: 0.5}]},
            scale: {
                value: {min: 0.1, max: 0.3},
                delta: 0.005,
                control: [{x: 0, y: 1}, {x: 0.6, y: 1}, {x: 1, y: 0.25}]
            },
            alpha: {value: 0.3, control: [{x: 0, y: 0}, {x: 0.3, y: 1}, {x: 1, y: 0}]},
            rotation: {value: 0, delta: {min: -2, max: 2}},
            sendToBack: true
        };

        this.manager.addData('fire', fire);
        this.manager.addData('smoke', smoke);

        this.firePipe = this.manager.createEmitter();


        this.game.physics.box2d.enable(this.firePipe);

        this.firePipe.addToWorld();


        let scoreLabelStyle = {
            font: "48px Atlantic Cruise",
            fill: "#fff",
            align: "center"
        };

        let scoreValueStyle = {
            font: "54px Futura",
            fill: "#F8E81C",
            align: "left",
            boundsAlignH: "left",
            boundsAlignV: "middle"
        };

        this.scoreLabelText = this.game.add.text(this.game.width / 2 - 60, 35, "Score", scoreLabelStyle);
        this.scoreLabelText.anchor.set(0.5);




        this.scoreValueText = this.game.add.text(0, 0, "87234987", scoreValueStyle);
        this.scoreValueText.anchor.set(0);
        this.scoreValueText.setTextBounds(this.game.width/2, -10, 250, 100);





    }

    moveTopRight() {
        if (this.topPlatformSprite.body.x <= this.game.width - 500) {
            this.topPlatformSprite.body.x += 250;

        }
    }

    moveTopLeft() {
        if (this.topPlatformSprite.body.x >= (250 + 250)) {
            this.topPlatformSprite.body.x -= 250;
        }

    }

    moveBottomRight() {
        if (this.bottomPlatformSprite.body.x <= this.game.width - 250) {
            this.bottomPlatformSprite.body.x += 250;

        }
    }

    moveBottomLeft() {
        if (this.bottomPlatformSprite.body.x >= 650) {
            this.bottomPlatformSprite.body.x -= 250;
        }

    }


    createBlock() {

        let product = new Product(this.game);
        this.products.push(product);

        product.sprite.body.setBodyContactCallback(this.topPlatformSprite, this.topSpriteHit, this);
        product.sprite.body.setBodyContactCallback(this.bottomPlatformSprite, this.bottomSpriteHit, this);
        let circle = this.manager.createCircleZone(25);

        let emitter = this.manager.createEmitter();
        emitter.force.y = 0.05;
        emitter.addToWorld();

        product.emitter = emitter;
        product.particleCircle = circle;


        product.sprite.body.setBodyContactCallback(this.firePipe, this.popProduct, product);


        // product.sprite.body.setBodyContactCallback(this.leftPipeSprite, this.bpip, this);


        // let explode = this.manager.createEmitter((Phaser as any).ParticleStorm.PIXEL);
        //
        // explode.renderer.pixelSize = 8;
        //
        // explode.addToWorld();
        //
        // //  12 x 10 = 96 x 80 px
        // image = this.manager.createImageZone('heart');


       product.sprite.body.setBodyContactCallback(this.pipeKillLayer, this.popProduct, product);

    }

    popProduct() {

        let product: any = this;
        product.popping = true;

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

    lostProduct(product: Product) {
        console.log('lost product', product);
        product.killed = true;
        product.sprite.destroy();
    }

    private wheelForward: boolean = true;
    private wheelRotation = 0;

    isEven(n) {
        return n % 2 == 0;
    }

    isOdd(n) {
        return Math.abs(n % 2) == 1;
    }


    update() {


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

        if (this.game.time.now > this.fireTimeout) {
            this.createBlock();


            this.fireTimeout = this.game.time.now + 5000;
        }



        for (let product of this.products) {

            if (product.popping) {

                if (product.popAnimationCount >= 0 && product.popAnimationCount < 50) {
                    if(this.isEven(product.popAnimationCount)) {
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
                    product.sprite.destroy();
                    product.killed = true;
                }
            }


             if(product.score == ScoreType.Special) {
                 product.emitter.emit('basic', product.sprite.body.x, product.sprite.body.y, {
                     zone: product.particleCircle,
                     total: 2
                 });
             }


            if (product.sprite.body.y > this.game.world.height) {
                this.lostProduct(product);
            }
        }
        let products = this.products;
        this.products = [];
        for (let product of products) {
            if (!product.killed) {
                this.products.push(product);
            }
        }


    }

}