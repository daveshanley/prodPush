import Game = Phaser.Game;
import {Player} from "./player";
import {Product, ScoreType} from "./product";

const STORAGE_KEY = 'radio-prodpush-game';

export class ScoreBoard {

    private currentScore: number;
    private currentLevel: number = 1;
    private currentLives: number = 5;
    private loadedScores: Array<Player>;

    constructor(private game: Game) {
        this.loadedScores = [];
        let storedValues: Array<Player> = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (storedValues) {
            this.loadedScores = storedValues;
        }
        this.currentScore = 0;
    }

    persistNewScore(name: string, score: number) {
        let player = new Player(name, score);
        this.loadedScores.push(player);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.loadedScores));
    }

    productPushed(product: Product) {
        if(product) {
            this.currentScore += product.calculateScore(this.currentLevel);
        }
        return this.currentScore;
    }

    loseLife() {
        if(this.currentLives > 0) {
            this.currentLives--;
        }
        return this.currentLives;
    }


}