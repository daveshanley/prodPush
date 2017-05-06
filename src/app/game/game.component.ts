import {Component, OnInit} from '@angular/core';
import * as Phaser from 'phaser-ce';
import Game = Phaser.Game;

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

    private numRows: number = 4;
    private numCols: number = 5;
    private tileSpacing: number = 10;
    private tileSize: number = 80;
    private tilesArray = [];
    private selectedArray;
    private game: Game;
    private playSound = true;
    private score;
    private scoreText;
    private timeText;
    private soundArray = [];
    private timeLeft;

    constructor() {
        this.selectedArray = [];
    }

    ngOnInit() {
        this.score = 0;
        this.timeLeft = 5;
        this.game = new Phaser.Game(500, 500);
        let playGame = () => {
        };

        playGame.prototype = {
            preload: () => {
                this.game.load.spritesheet("tiles", "assets/tiles.png", this.tileSize, this.tileSize);
                this.game.load.spritesheet("soundicons", "assets/soundicons.png", 80, 80);
                this.game.load.audio("select", ["assets/select.mp3", "assets/select.ogg"]);
                this.game.load.audio("right", ["assets/right.mp3", "assets/right.ogg"]);
                this.game.load.audio("wrong", ["assets/wrong.mp3", "assets/wrong.ogg"]);

            },
            create: () => {
                console.log('game created');
                this.score = 0;
                this.placeTiles();
                if (this.playSound) {
                    this.soundArray.push(this.game.add.audio("select", 1));
                    this.soundArray.push(this.game.add.audio("right", 1));
                    this.soundArray.push(this.game.add.audio("wrong", 1));
                }
                let style = {
                    font: "32px Menlo",
                    fill: "#00ff00",
                    align: "center"
                };
                this.scoreText = this.game.add.text(5, 5, "Score: " + this.score, style);
                this.timeText = this.game.add.text(5, this.game.height - 5, "Time Left: " + this.timeLeft, style);
                this.timeText.anchor.set(0, 1);
                this.game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
            },

        };

        this.game.state.add("PlayGame", playGame);
        this.game.state.add("TitleScreen", this.generateTitleScreen());
        this.game.state.add("GameOver", this.generateGameOverScreen());
        this.game.state.start("TitleScreen");
    }

    decreaseTime() {
        this.timeLeft--;
        this.timeText.text = "Time Left: " + this.timeLeft;
        if(this.timeLeft == 0){
            this.game.state.start("GameOver");

        }
    }

    startGame(target) {
        console.log("starting game", target.frame);
        this.game.state.start("PlayGame");

    }

    generateTitleScreen() {
        return new TitleScreen(this.game, this.startGame);
    }

    generateGameOverScreen() {
        return new GameOver(this.game, this.score, this);
    }

    showTile(target) {
        if (this.selectedArray.length < 2 && this.selectedArray.indexOf(target) == -1) {

            if (this.playSound) {
                this.soundArray[0].play();
            }

            target.frame = target.data;
            this.selectedArray.push(target);
        }
        if (this.selectedArray.length == 2) {
            this.game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
        }
    }

    checkTiles() {
        if (this.selectedArray[0].data == this.selectedArray[1].data) {
            this.selectedArray[0].destroy();
            this.selectedArray[1].destroy();
            if (this.playSound) {
                this.soundArray[1].play();
            }
            this.score++;
            this.scoreText.text = "Score: " + this.score;
        } else {
            this.selectedArray[0].frame = 10;
            this.selectedArray[1].frame = 10;
            if (this.playSound) {
                this.soundArray[2].play();
            }
        }
        this.selectedArray.length = 0;
    }

    restartGame() {
        this.tilesArray.length = 0;
        this.selectedArray.length = 0;
        this.game.state.start("TitleScreen");
        this.timeLeft = 5;
    }

    placeTiles() {

        let leftSpace = (this.game.width - (this.numCols * this.tileSize) -
            ((this.numCols - 1) * this.tileSpacing)) / 2;

        let topSpace = (this.game.height - (this.numRows * this.tileSize) -
            ((this.numRows - 1) * this.tileSpacing)) / 2;


        for (let x = 0; x < this.numRows * this.numCols; x++) {
            this.tilesArray.push(Math.floor(x / 2));
        }

        for (let x = 0; x < this.numRows * this.numCols; x++) {
            let from = this.game.rnd.between(0, this.tilesArray.length - 1);
            let to = this.game.rnd.between(0, this.tilesArray.length - 1);
            let temp = this.tilesArray[from];
            this.tilesArray[from] = this.tilesArray[to];
            this.tilesArray[to] = temp;
        }

        for (let a: number = 0; a < this.numCols; a++) {
            for (let b: number = 0; b < this.numRows; b++) {
                let tile = this.game.add.button(leftSpace + a * (this.tileSize + this.tileSpacing),
                    topSpace + b * (this.tileSize + this.tileSpacing), "tiles", this.showTile, this);

                tile.frame = 10;
                tile.data = this.tilesArray[b * this.numCols + a];
            }
        }

    }
}

export class TitleScreen {
    constructor(private game: Game, private callback) {

    }

    preload() {
        this.game.load.spritesheet("soundicons", "assets/soundicons.png", 80, 80);
    }

    create() {
        this.game.stage.disableVisibilityChange = true;
        let style = {
            font: "48px Menlo",
            fill: "#00ff00",
            align: "center"
        };
        let text = this.game.add.text(this.game.width / 2, this.game.height / 2 - 100,
            "Smack My Donkey", style);
        text.anchor.set(0.5);

        let soundbutton = this.game.add.button(this.game.width / 2 - 100, this.game.height / 2 + 100,
            "soundicons", this.callback, this);
        soundbutton.anchor.set(0.5);
        soundbutton = this.game.add.button(this.game.width / 2 + 100, this.game.height / 2 + 100,
            "soundicons", this.callback, this);
        soundbutton.frame = 1;
        soundbutton.anchor.set(0.5);
    }
}

export class GameOver {
    constructor(private game: Game, private score, private parentObj) {
    }

    create() {
        let style = {
            font: "32px Menlo",
            fill: "#00ff00",
            align: "center"
        };
        let text = this.game.add.text(this.game.width / 2, this.game.height / 2,
            "Game Over\n\nYour Score: " + this.score + "\n\nTap to restart", style);
        text.anchor.set(0.5);

        this.game.input.onDown.add(this.parentObj.restartGame, this.parentObj);
    }
}