import {Component, OnInit} from '@angular/core';
import {Game} from 'phaser-ce';
import {MainScreen} from './game/main';
import {IntroScreen} from './game/intro';
import {HighScoreEntryScreen} from './game/highscore-entry';
import {Http} from '@angular/http';
import {ScoreBoard} from './game/scoreboard';
import {InstructionScreen} from './game/instructions';


@Component({
    selector: 'app-main-game',
    templateUrl: './main-game.component.html',
    styleUrls: ['./main-game.component.css']
})
export class MainGameComponent implements OnInit {

    private parent: MainGameComponent;
    private game: Game;
    private scoreboard: ScoreBoard;

    constructor(private http: Http) {
        this.parent = this;

    }

    ngOnInit() {
        this.game = new Phaser.Game(1254, 783);

        // set up scoreboard
        this.scoreboard = new ScoreBoard(this.game, this.http);

        // create game states
        const mainGame = new MainScreen(this.game, this.scoreboard);
        const introScreen = new IntroScreen(this.game, this.scoreboard);
        const highScoreEntryScreen = new HighScoreEntryScreen(this.game, this.scoreboard);
        const instructionScreen = new InstructionScreen(this.game, this.scoreboard);

        this.game.state.add('MainScreen', mainGame);
        this.game.state.add('IntroScreen', introScreen);
        this.game.state.add('HighScoreEntryScreen', highScoreEntryScreen);
        this.game.state.add('InstructionScreen', instructionScreen);
        this.game.state.start('IntroScreen');
        // this.game.state.start('InstructionScreen');

    }

}
