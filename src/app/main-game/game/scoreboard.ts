import Game = Phaser.Game;
import {Player} from "./player";
import {Product} from "./product";

const STORAGE_KEY = 'radio-prodpush-game';

export class ScoreBoard {

    private currentScore: number;
    private loadedScores: Array<Player>;

    constructor(private game: Game) {
        this.loadedScores = [];
        let storedValues: Array<Player> = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (storedValues) {
            this.loadedScores = storedValues;
        }
    }

    persistNewScore(name: string, score: number) {
        let player = new Player(name, score);
        this.loadedScores.push(player);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.loadedScores));
    }

    productPushed(product: Product) {

    }

}