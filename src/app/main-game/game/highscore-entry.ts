import Game = Phaser.Game;
import {Level} from './level';
import {Product} from './product';
export class HighScoreEntryScreen extends Phaser.State {
    private bgFilter;
    private fireTimeout = 0;
    private products: Array<Product>;
    private titleTune: Phaser.Sound;
    private spaceKey;

    constructor(game: Game) {
        super();
        this.game = game;
        this.products = [];
    }

    preload() {

    }

    create() {

        // modified from http://glslsandbox.com/e#39896.0

        let shaderFragments = [
            '#ifdef GL_ES',
            'precision mediump float;',
            '#endif',
            'uniform float time;',
            'uniform vec2 mouse;',
            'uniform vec2 resolution;',
            'const float Tau = 6.2832;',
            'const float speed = .02;',
            'const float density = .04;',
            'const float shape = .06;',
            'float random( vec2 seed ) {',
            '    return fract(sin(seed.x+seed.y*1e3)*1e5);',
            '}',
            'float Cell(vec2 coord) {',
            '    vec2 cell = fract(coord) * vec2(.5,2.) - vec2(.0,.5);',
            '    return (1.-length(cell*2.-1.))*step(random(floor(coord)),density)*2.;',
            '}',
            'void main( void ) {',
            '    vec2 p = gl_FragCoord.xy / resolution - vec2(0.5,0.5);',
            '    float a = fract(atan(p.x, p.y) / Tau);',
            '    float d = length(p);',
            '    vec2 coord = vec2(pow(d, shape), a)*256.;',
            '    vec2 delta = vec2(-time*speed*100., .5);',
            '    float c = 0.;',
            '    for(int i=0; i<3; i++) {',
            '        coord += delta;',
            '        c = max(c, Cell(coord));',
            '    }',
            '    gl_FragColor = vec4(c*d);',
            '}'
        ];

        Level.SetPhysics(this.game);

        this.bgFilter = new Phaser.Filter(this.game, null, shaderFragments);
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


        let text = this.game.add.text(this.game.world.centerX, this.game.height - 70, 'Press Space To Start', Level.StartStyle);
        text.anchor.set(0.5);


        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.spaceKey.onDown.add(this.startGame, this);


    }

    startGame() {
        this.game.state.start('MainScreen');
        this.titleTune.stop();
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