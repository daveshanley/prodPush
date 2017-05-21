import Game = Phaser.Game;
import Sprite = Phaser.Sprite;

enum ProductType {
    Angular,
    API,
    Clarity,
    HTML5,
    Java,
    JS,
    Python,
    Sketch,
    UX,
    VSPHERE,
}

export enum ScoreType {
    Regular,
    Special,
    Ultimate
}
;

export const P2_SCORE = 15;
export const P1_SCORE = 2;
export const P0_SCORE = 5;

let spriteMap = [
    'angular.png',
    'api.png',
    'clarity.png',
    'html5.png',
    'java.png',
    'javascript.png',
    'python.png',
    'sketch.png',
    'ux.png',
    'vsphere.png'
];

export class Product {

    public type: ProductType;
    public sprite: Sprite;
    public killed: boolean = false;
    public popping = false;
    public popAnimationCount = 0;
    public popSwitch = false;
    public emitter: any;
    public particleCircle: any;
    public score: ScoreType;

    public static SpecialScoreEmitter = {
        lifespan: 1000,
        image: ['sphere1', 'sphere2', 'sphere3', 'sphere4', 'sphere5'],
        vx: {min: -0.5, max: 0.5},
        vy: {min: -1, max: -2},
        rotation: {delta: 2},
        blendMode: 'ADD',
        alpha: {initial: 0, value: 0.4, control: 'linear'},
        scale: {value: {min: 0.2, max: 0.8}, control: 'linear'}
    };

    public static UltimateScoreEmitter = {
        lifespan: 1000,
        image: ['pixel_red', 'pixel_green', 'pixel_blue', 'pixel_white', 'pixel_yellow'],
        vx: {min: -0.8, max: 0.8},
        vy: {min: -1, max: -2},
        rotation: {delta: 3},
        blendMode: 'ADD',
        alpha: {initial: 0, value: 0.8, control: 'linear'},
    };

    public static UltimateScoreEmitterPop = {
        image: 'colorsHD',
        frame: ['red', 'green', 'blue'],
        lifespan: 1000,
        vx: {min: -0.8, max: 0.8},
        vy: {min: -1, max: -2},
        rotation: {delta: 3},
        blendMode: 'ADD',
        scale: {value: {min: 0.2, max: 0.8}, control: 'linear'},
        alpha: {initial: 0, value: 0.6, control: 'linear'},
    };

    public static EmitterExplode = {
        lifespan: 3000
    };

    public static Create(game: Game, particleStreamManager?: any, randomLocation: boolean = false, staticLocation?: any): Product {

        let emitter;

        // create particle emitter.
        if (particleStreamManager) {
            emitter = particleStreamManager.createEmitter();
            emitter.force.y = 0.05;
            emitter.addToWorld();
        }

        // create product
        const product = new Product(game, randomLocation, staticLocation);

        if (particleStreamManager) {
            product.emitter = emitter;
            product.particleCircle = particleStreamManager.createCircleZone(45);
        }
        return product;
    }


    constructor(private game: Game, randomLocation: boolean = false, staticLocation?: any) {
        let index: number = Math.floor(Math.random() * 10) + 1;
        this.type = index;

        let specialOdds_a = Math.floor(Math.random() * 3) + 1;
        let ultimateOdds_a = Math.floor(Math.random() * 5) + 1;

        let specialOdds_b = Math.floor(Math.random() * 3) + 1;
        let ultimateOdds_b = Math.floor(Math.random() * 5) + 1;

        this.score = ScoreType.Regular;

        // 1 in 5 chances
        if (specialOdds_a == specialOdds_b) {
            this.score = ScoreType.Special;
        }
        // 1 in 10 chances
        if (ultimateOdds_a == ultimateOdds_b) {
            this.score = ScoreType.Ultimate;
        }


        let xPos = 0;
        let yPos = 100;
        if (randomLocation) {
            xPos = this.game.rnd.integerInRange(0, this.game.width);
            yPos = -100;
        }

        if (staticLocation) {
            xPos = staticLocation.x;
            yPos = staticLocation.y;
            this.score = staticLocation.scoreType;
        }

        this.sprite = game.add.sprite(xPos, yPos, 'products', spriteMap[this.type]);
        this.sprite.scale.setTo(0.7, 0.7);
        if (!staticLocation) {
            this.game.physics.box2d.enable(this.sprite);
        }

        if (!staticLocation) {
            if (xPos >= this.game.width / 2) {
                this.sprite.body.velocity.x = -250;
            } else {
                this.sprite.body.velocity.x = 250;
            }

            this.sprite.body.velocity.y = -200;
            this.sprite.body.angle = 40;
            this.sprite.body.collideWorldBounds = false;
            this.sprite.body.setCircle(32);

        }


    }

    calculateScore(level: number) {
        let score: number;
        switch (this.score) {
            case ScoreType.Regular:
                score = P2_SCORE * level;
                break;
            case ScoreType.Special:
                score = P1_SCORE * level;
                break;
            case ScoreType.Ultimate:
                score = P0_SCORE * level;
                break;
        }
        return score;
    }

    pop() {
        this.popping = true;
    }

}