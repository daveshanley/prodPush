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
    public emitter: any;
    public particleCircle: any;

    constructor(private game: Game) {
        let index: number = Math.floor(Math.random() * 10) + 1;
        this.type = index;

        this.sprite = game.add.sprite(0, 100, 'products', spriteMap[this.type]);
        this.sprite.scale.setTo(0.5, 0.5);
        this.game.physics.box2d.enable(this.sprite);
        this.sprite.body.velocity.x = 250;
        this.sprite.body.velocity.y = -200;
        this.sprite.body.angle = 40;
        this.sprite.body.setCircle(25);

        this.sprite.body.collideWorldBounds = false;




    }
}