import Game = Phaser.Game;
import {Level} from './level';
import {Product} from './product';
import {ScoreBoard} from "./scoreboard";
import {Shaders} from "app/main-game/game/shaders";
export class IntroScreen extends Phaser.State {
    private bgFilter;
    private fireTimeout = 0;
    private products: Array<Product>;
    private titleTune: Phaser.Sound;
    private spaceKey;
    private scoreboard: ScoreBoard;

    constructor(game: Game, scoreboard: ScoreBoard) {
        super();
        this.game = game;
        this.products = [];
        this.scoreboard = scoreboard;
    }

    preload() {
        this.game.load.path = '';
        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');
        this.game.load.audio('title-music', 'assets/sound/title-screen.wav');

        this.game.load.physics('logo-physics', 'assets/game-logo.json');
        this.game.load.image('logo-image', 'assets/game-logo.png');

        // load physics and sprite mappings.
        this.game.load.physics('physics', 'assets/left-sprite.json');
        this.game.load.physics('kill', 'assets/left-sprite-kill.json');
        this.game.load.physics('production', 'assets/production-pipes.json');
        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');

        // load individual images.
        this.game.load.image('background', 'assets/game-background.png');
        this.game.load.image('heart', 'assets/heart.png');
        this.game.load.image('heart-small', 'assets/heart-small.png');
        this.game.load.image('platform', 'assets/pipe-bouncer.png');
        this.game.load.image('top-right-pipe', 'assets/top-right-pipe.png');
        this.game.load.image('right-gas-pipe', 'assets/right-gas-pipe.png');
        this.game.load.image('red-spin-wheel', 'assets/red-spin-wheel.png');
        this.game.load.image('production-pipes', 'assets/production-pipes.png');
        this.game.load.image('tranny', 'assets/particlestorm/particles/1x1.png');
        this.game.load.image('left-pipe', 'assets/left-pipe.png');
        this.game.load.spritesheet('production-sign', 'assets/production-sign.png', 152, 106);
        this.game.load.spritesheet('exploding-heart', 'assets/production-sign.png', 152, 106);

        // audio
        this.game.load.audio('theme1', 'assets/sound/theme1.wav');
        this.game.load.audio('theme2', 'assets/sound/theme2.wav');
        this.game.load.audio('theme3', 'assets/sound/theme3.wav');
        this.game.load.audio('fire-burn-explosion', 'assets/sound/sfx_deathscream_robot3.wav');
        this.game.load.audio('explosion1', 'assets/sound/sfx_exp_short_hard7.wav');
        this.game.load.audio('explosion2', 'assets/sound/sfx_exp_short_hard9.wav');
        this.game.load.audio('explosion3', 'assets/sound/sfx_exp_short_hard14.wav');
        this.game.load.audio('bounce1', 'assets/sound/sfx_movement_jump8.wav');
        this.game.load.audio('bounce2', 'assets/sound/sfx_movement_jump10.wav');
        this.game.load.audio('pushed1', 'assets/sound/sfx_sounds_fanfare2.wav');
        this.game.load.audio('pushed2', 'assets/sound/sfx_sounds_fanfare3.wav');


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

    create() {

        this.scoreboard.cycleMode = true;
        this.scoreboard.reset();



        Level.SetPhysics(this.game);

        this.bgFilter = new Phaser.Filter(this.game, null, Shaders.IntroScreen);
        this.bgFilter.setResolution(this.game.width, this.game.height);

        let sprite = this.game.add.sprite(0, 0);
        sprite.width = this.game.width;
        sprite.height = this.game.height;
        sprite.filters = [this.bgFilter];

        let logo = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'logo-image');
        this.game.physics.box2d.enable(logo);
        logo.body.restitution = 0;
        logo.anchor.set(0.5);
        logo.body.static = true;


        logo.body.clearFixtures();
        logo.body.loadPolygon('logo-physics', 'logo-image', logo);


        this.titleTune = this.game.add.audio('title-music');
        this.game.sound.setDecodedCallback([this.titleTune], this.startMusic, this);


        let text = this.game.add.text(this.game.world.centerX, this.game.height - 130, 'Press  Spacebar  To  Start', Level.StartStyle);
        this.game.add.tween(text).to({alpha: 0}, 800, Phaser.Easing.Linear.None, true, 0, -1, true);


        text.anchor.set(0.5);


        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.spaceKey.onDown.add(this.startGame, this);

        this.startNonPlayingCycle();




    }


    startNonPlayingCycle() {
        this.game.time.events.add(Phaser.Timer.SECOND * 20, () => {
            this.titleTune.stop();
            this.game.state.start('HighScoreEntryScreen');
        }, this);
    }



    startGame() {
        this.game.state.start('InstructionScreen');
        this.titleTune.stop();
        this.scoreboard.cycleMode = false;
    }

    startMusic() {
        if(Level.MUSIC_ON) {
            this.titleTune.loopFull(0.3);
        }
    }

    createProduct() {

        const product = Product.Create(this.game, null, true);
        product.sprite.angle = Math.random() * 360;
        this.products.push(product);

    }


    update() {
        this.bgFilter.update();

        if (this.game.time.now > this.fireTimeout) {
            this.createProduct();
            this.fireTimeout = this.game.time.now + 1000;
        }
        let tmp: Array<Product> = [];
        for(let p of this.products) {
            if(p.sprite.body.y > this.game.height) {
                p.sprite.destroy();
            } else {
                tmp.push(p)
                p.sprite.body.angle +=1;
            }
        }
        this.products = tmp;

    }


}