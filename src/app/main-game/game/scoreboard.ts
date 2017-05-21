import Game = Phaser.Game;

import {Product, ScoreType} from './product';
import {Observable} from 'rxjs/Observable';
import {HighScore} from './highscore';
import {Http, Response} from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


export class ScoreBoard {

    static apiKey = 'IZ2L0EkTr-AYIMwfE2tRj6c1euIgjoJ1';
    static sortQuery = 's={\'score\': -1}';
    static apiParam = 'apiKey=';
    static dbURI = 'https://api.mlab.com/api/1/databases/prodpush/collections/scores';


    private currentScore: number;
    private currentLevel: number = 1;
    private currentLives: number = 1;

    private scores: Array<Array<string>>;
    private scoresLoaded = false;
    private highestScore;
    private cycling = true;



    constructor(private game: Game, private http: Http) {
        this.currentScore = 0;
        this.processScores();
        this.scores = [];
    }

    get cycleMode() {
        return this.cycling;
    }

    set cycleMode(mode: boolean) {
        this.cycling = mode;
    }

    saveScore(score: HighScore) {
        console.log('saving score');
        const save = this.http.post(
            ScoreBoard.dbURI
            + '?' + ScoreBoard.apiParam
            + ScoreBoard.apiKey,
            score
        );

        save.subscribe(
            (worked) => {
                console.log('worked?', worked);
            }
        );

    }

    processScores() {
        this.getHighScores().subscribe(
            (scores: Array<HighScore>) => {
                let count = 0;
                for (const score of scores) {
                    if (count < 15) {
                        this.scores.push(
                            [score.name, score.vmwid, String(score.score)]
                        );
                        count++;
                    }
                }
                this.scoresLoaded = true;
                this.highestScore = scores[0].score;
            }
        );

    }

    getHighScores(): Observable<HighScore[]> {
        return this.http.get(
            ScoreBoard.dbURI
            + '?' + ScoreBoard.sortQuery
            + '&' + ScoreBoard.apiParam
            + ScoreBoard.apiKey
        ).map(this.extractData);
    }

    å

    private extractData(res: Response) {
        const body = res.json();
        return body || {};
    }

    get topScore() {
        return this.highestScore;
    }

    get loadedScores() {
        return this.scores;
    }

    get score(): number {
        //return this.currentScore;
        return 20;
    }

    get lives(): number {
        return this.currentLives;
    }


    productPushed(product: Product) {
        if (product) {
            this.currentScore += product.calculateScore(this.currentLevel);
        }
        return this.currentScore;
    }

    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
        }
        return this.currentLives;
    }


}