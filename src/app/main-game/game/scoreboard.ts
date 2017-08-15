import Game = Phaser.Game;

import {Product, ScoreType} from './product';
import {Observable} from 'rxjs/Observable';
import {HighScore} from './highscore';
import {Http, Response} from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';


const maxLives = 1;

export class ScoreBoard {

    static apiKey = 'IZ2L0EkTr-AYIMwfE2tRj6c1euIgjoJ1';
    static sortQuery = 's={\'score\': -1}';
    static apiParam = 'apiKey=';
    static dbURI = 'https://api.mlab.com/api/1/databases/prodpush/collections/scores';


    private currentScore: number;
    private currentLevel: number = 1;
    private currentLives: number = maxLives;

    private parsedScores: Array<Array<string>>;
    private scoresLoaded = false;
    private highestScore;
    private cycling = true;

    private rawScores: Array<HighScore> = [];

    constructor(private game: Game, private http: Http) {
        this.currentScore = 0;
        this.processScores();
    }

    reset() {
        this.currentLives = maxLives;
        this.currentScore = 0;
    }


    get cycleMode() {
        return this.cycling;
    }

    set cycleMode(mode: boolean) {
        this.cycling = mode;
    }

    saveScore(score: HighScore) {
        // const save = this.http.post(
        //     ScoreBoard.dbURI
        //     + '?' + ScoreBoard.apiParam
        //     + ScoreBoard.apiKey,
        //     score
        // );
        //
        // save.subscribe(
        //     (worked) => {
        //        // do something with this later.
        //     }
        // );

        this.rawScores.push(score);
        localStorage.setItem('scores', JSON.stringify(this.rawScores));
    }

    processScores() {
        this.parsedScores = [];
        this.getHighScores().subscribe(
            (scores: Array<HighScore>) => {
                this.rawScores = scores;
                let count = 0;
                for (const score of scores) {
                    if (count < 15) {
                        this.parsedScores.push(
                            [score.name, score.vmwid, String(score.score)]
                        );
                        count++;
                    }
                }
                this.scoresLoaded = true;
                if(scores.length >=1) {
                    this.highestScore = scores[0].score;
                } else {
                    this.highestScore = 0;
                }
            }
        );

    }

    getHighScores(): Observable<HighScore[]> {
        // return this.http.get(
        //     ScoreBoard.dbURI
        //     + '?' + ScoreBoard.sortQuery
        //     + '&' + ScoreBoard.apiParam
        //     + ScoreBoard.apiKey
        // ).map(this.extractData);
        const storage = localStorage.getItem('scores');
        let parsed = JSON.parse(storage);
        if(!parsed) {
            parsed = [new HighScore('Dave Shanley', 'dshanley', 1)];
        }
        return Observable.of(parsed);

     }


    private extractData(res: Response) {
        const body = res.json();
        return body || {};
    }

    get topScore() {
        return this.highestScore;
    }

    get loadedScores() {
        return this.parsedScores;
    }

    get score(): number {
        return this.currentScore;
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