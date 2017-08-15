import Game = Phaser.Game;

import {ScoreBoard} from "./scoreboard";
import {Shaders} from "app/main-game/game/shaders";
import {Level} from "./level";
import {P0_SCORE, P1_SCORE, P2_SCORE, Product, ScoreType} from "./product";
export class InstructionScreen extends Phaser.State {
    private bgFilter;
    private scoreboard: ScoreBoard;
    private p2Product: Product;
    private p1Product: Product;
    private p0Product: Product


    constructor(game: Game, scoreboard: ScoreBoard) {
        super();
        this.game = game;
        this.scoreboard = scoreboard;
    }


    create() {
        this.createText();
    }

    createText() {

        const headerText = this.game.add.bitmapText(this.game.width / 2, 115, 'Arcade Classic', 'You  Are  The   Pipeline!', 74);
        headerText.anchor.set(0.5);

        const introBlurb = this.game.add.text(this.game.width / 2, 195, 'Push as much as you can to production\nDrop a product and you lose a life.', Level.InstructionTextStyle);
        introBlurb.anchor.set(0.5);

        const manager: any = this.game.plugins.add((Phaser as any).ParticleStorm);
        manager.addData('p1', Product.SpecialScoreEmitter);
        manager.addData('p0', Product.UltimateScoreEmitter);
        manager.addData('p0-pop', Product.UltimateScoreEmitterPop);


        this.p2Product = Product.Create(this.game, manager, false, {x: 100, y: 300, scoreType: ScoreType.Regular});
        this.p1Product = Product.Create(this.game, manager, false, {x: 100, y: 450, scoreType: ScoreType.Special});
        this.p0Product = Product.Create(this.game, manager, false, {x: 100, y: 600, scoreType: ScoreType.Ultimate});


        const p2 = this.game.add.text(185, 315, 'P2 Product = ' + P2_SCORE + ' points', Level.InstructionTextStyle);
        const p1 = this.game.add.text(185, 465, 'P1 Product = ' + P1_SCORE + ' points', Level.InstructionTextStyle);
        const p0 = this.game.add.text(185, 615, 'P0 Product = ' + P0_SCORE + ' points', Level.InstructionTextStyle);

        const topPipe = this.game.add.text(700, 315, 'A/S = Move Top Pipe', Level.InstructionControlStyle);
        const bottomPipe = this.game.add.text(700, 380, 'K/L = Move Bottom Pipe', Level.InstructionControlStyle);


        this.game.time.events.add(Phaser.Timer.SECOND * 3, () => {
            this.startCountDown();
        }, this);





    }

    startCountDown() {

        const three = this.game.add.bitmapText(870, 560, 'Arcade Classic', '3', 250);
        this.game.add.tween(three).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
        this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.loadTwo();
        }, this);

    }

    loadTwo() {

        const two = this.game.add.bitmapText(870, 560, 'Arcade Classic', '2', 250);
        this.game.add.tween(two).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
        this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.loadOne();
        }, this);
    }

    loadOne() {
        const one = this.game.add.bitmapText(870, 560, 'Arcade Classic', '1', 250);
        this.game.add.tween(one).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
        this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.game.state.start('MainScreen');
        }, this);
    }


    update() {
        //this.bgFilter.update();
        this.p1Product.emitter.emit('p1', this.p1Product.sprite.x, this.p1Product.sprite.y, {
            zone: this.p1Product.particleCircle,
            total: 2
        });
        this.p0Product.emitter.emit('p0', this.p0Product.sprite.x, this.p0Product.sprite.y, {
            zone: this.p0Product.particleCircle,
            total: 2
        });
        this.p0Product.emitter.emit('p0-pop', this.p0Product.sprite.x, this.p0Product.sprite.y, {
            zone: this.p0Product.particleCircle,
            total: 2
        });
    }


}