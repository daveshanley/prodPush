
import Game = Phaser.Game;
import {Product} from "./product";

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


export class MainScreen {

    private topPlatformSprite;
    private bottomPlatformSprite;
    private topRightPipeSprite;

    private fireTimeout = 0;
    private products: Array<Product>;
    private manager: any;



    private aKey;
    private sKey;

    private kKey;
    private lKey;

    constructor(private game: Phaser.Game) {
       this.products = [];
    }

    preload() {

        this.game.load.image('background', 'assets/game-background.png');
        this.game.load.image('platform', 'assets/pipe-bouncer.png');
        this.game.load.image('top-right-pipe','assets/top-right-pipe.png');
        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');
        this.game.load.path = 'assets/particlestorm/particles/';
        this.game.load.images(['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5']);


    }

    create() {
        this.manager = this.game.plugins.add((Phaser as any).ParticleStorm);


        //background
        this.game.add.sprite(0, 0, 'background');



        var data = {
            lifespan: 1000,
            image: ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5'],
            vx: { min: -0.5, max: 0.5 },
            vy: { min: -1, max: -2 },
            rotation: { delta: 2 },
            blendMode: 'ADD',
            alpha: { initial: 0, value: 0.4, control: 'linear' }
        };

        this.manager.addData('basic', data);



        this.game.physics.startSystem(Phaser.Physics.BOX2D);
        this.game.physics.box2d.gravity.y = 500;
        this.game.physics.box2d.setBoundsToWorld();



        this.game.physics.box2d.restitution = 0.4;
        this.game.physics.box2d.debugDraw.shapes = true;

        this.topPlatformSprite = this.game.add.sprite(350, 300, 'platform');
        this.game.physics.box2d.enable(this.topPlatformSprite);

        this.bottomPlatformSprite = this.game.add.sprite(1100, 700, 'platform');
        this.game.physics.box2d.enable(this.bottomPlatformSprite);


        this.topRightPipeSprite = this.game.add.sprite(this.game.width-145, 140, 'top-right-pipe');
        this.game.physics.box2d.enable(this.topRightPipeSprite);
        this.topRightPipeSprite.body.static = true;
        //this.topRightPipeSprite.anchor.x = 1
        this.topRightPipeSprite.body.setRectangle(30,450, 0, 18, -0.8);


        //this.topRightPipeSprite.body.setBodyContactCallback(platformSprite1, contactCallback1, this);



        this.topRightPipeSprite.body.restitution = 0;

        this.topPlatformSprite.body.restitution = 0.9;
        this.topPlatformSprite.body.gravity = 0;
        this.topPlatformSprite.body.static = true;


        this.bottomPlatformSprite.body.restitution = 0.7;
        this.bottomPlatformSprite.body.gravity = 0;
        this.bottomPlatformSprite.body.static = true;






        this.topPlatformSprite.fixedRotation = true;



        //var ground = new (Phaser as any).Physics.Box2D.Body(this.game, null, this.game.world.centerX, 575, 0);
       // ground.setRectangle(750, 50, 0, 0, 0);

        //this.game.physics.box2d.prismaticJoint(ground, this.platformSprite, 0, -1, -200, 50, 0, 0, 1800, 500, true, 0, 150, true);



        // this.blockSprite = this.game.add.sprite(400, 200, 'block');
        // this.game.physics.box2d.enable(this.blockSprite);
        // this.blockSprite.body.angle = 30;




        //this.blockSprite.body.setBodyContactCallback(this.platformSprite, this.doThing, this);
            //

        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);

        this.kKey = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
        this.lKey = this.game.input.keyboard.addKey(Phaser.Keyboard.L);

        this.sKey.onDown.add(this.moveTopRight, this);
        this.aKey.onDown.add(this.moveTopLeft, this);

        this.kKey.onDown.add(this.moveBottomLeft, this);
        this.lKey.onDown.add(this.moveBottomRight, this);



        //
        // this.emitter = this.game.add.emitter(this.game.world.centerX, 200);
        //
        // this.emitter.makeParticles('bubble');
        //
        // this.emitter.setXSpeed(-200, 200);
        // this.emitter.setYSpeed(-150, -250);
        // this.emitter.gravity = 300;
        //
        // this.emitter.flow(5000, 100, 1, -1);


    }

    moveTopRight() {
        if(this.topPlatformSprite.body.x <= 350 + (250)) {
            this.topPlatformSprite.body.x += 250;

        }
    }

    moveTopLeft() {
        if(this.topPlatformSprite.body.x >= (250 + 250)) {
            this.topPlatformSprite.body.x -= 250;
        }

    }

    moveBottomRight() {
        if(this.bottomPlatformSprite.body.x <= this.game.width - 250) {
            this.bottomPlatformSprite.body.x += 250;

        }
    }

    moveBottomLeft() {
        console.log(this.game.width, this.bottomPlatformSprite.body.x)
        if(this.bottomPlatformSprite.body.x >= 250) {
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


    }

    topSpriteHit(body1, body2, fixture1, fixture2, begin, contact) {

        contact.SetTangentSpeed(-10);

    }

    bottomSpriteHit(body1, body2, fixture1, fixture2, begin, contact) {
        contact.SetTangentSpeed(10);
        body1.velocity.x = -200;
    }

    render() {

       // this.game.debug.box2dWorld();

    }

    lostProduct(product: Product) {
        console.log('lost product', product);
        product.killed = true;
        product.sprite.destroy();
    }


    update() {





        if(this.sKey.isDown) {

        }

        if (this.game.time.now > this.fireTimeout)
        {
            this.createBlock();
            this.fireTimeout = this.game.time.now + 5000;
        }

        for(let product of this.products) {

            // trigger particles.
            product.emitter.emit('basic', product.sprite.body.x ,product.sprite.body.y, { zone: product.particleCircle, total: 2 });

            if(product.sprite.body.y > this.game.world.height) {
                this.lostProduct(product);
            }
        }
        let products = this.products;
        this.products = [];
        for(let product of products) {
            if(!product.killed) {
                this.products.push(product);
            }
        }


    }

}