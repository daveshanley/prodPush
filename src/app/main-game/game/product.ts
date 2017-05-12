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
};

const REGULAR_SCORE = 1;
const SPECIAL_SCORE = 2;
const ULTIMATE_SCORE = 5;

let spriteMap = [
    "angular.png",
    "api.png",
    "clarity.png",
    "html5.png",
    "java.png",
    "javascript.png",
    "python.png",
    "sketch.png",
    "ux.png",
    "vsphere.png"
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


    constructor(private game: Game) {
        let index: number = Math.floor(Math.random() * 10) + 1;
        this.type = index;

        let specialOdds_a = Math.floor(Math.random() * 5) + 1;
        let ultimateOdds_a= Math.floor(Math.random() * 7) + 1;

        let specialOdds_b = Math.floor(Math.random() * 5) + 1;
        let ultimateOdds_b = Math.floor(Math.random() * 7) + 1;

        this.score = ScoreType.Regular;

        // 1 in 5 chances
        if(specialOdds_a == specialOdds_b) {
            this.score = ScoreType.Special;
        }
        // 1 in 10 chances
        if(ultimateOdds_a == ultimateOdds_b) {
            this.score = ScoreType.Ultimate;
        }

        this.sprite = game.add.sprite(0, 100, 'products', spriteMap[this.type]);
        this.sprite.scale.setTo(0.5, 0.5);
        this.game.physics.box2d.enable(this.sprite);
        this.sprite.body.velocity.x = 250;
        this.sprite.body.velocity.y = -200;
        this.sprite.body.angle = 40;
        this.sprite.body.setCircle(25);

        this.sprite.body.collideWorldBounds = false;

        //this.sprite.body.gravityScale = 1.2
    }



    pop() {
        this.popping = true;

    }
}