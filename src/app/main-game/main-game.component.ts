import {Component, OnInit} from '@angular/core';
import Game = Phaser.Game;
import {MainScreen} from './game/main';
import {IntroScreen} from "./game/intro";
import {HighScoreEntryScreen} from "./game/highscore-entry";
import {main} from "@angular/compiler-cli/src/main";


@Component({
    selector: 'app-main-game',
    templateUrl: './main-game.component.html',
    styleUrls: ['./main-game.component.css']
})
export class MainGameComponent implements OnInit {

    private parent: MainGameComponent;
    private game: Game;

    constructor() {
        this.parent = this;
    }

    setPhysics() {

    }

    ngOnInit() {
        this.game = new Phaser.Game(1254, 783);
        const mainGame = new MainScreen(this.game);
        const introScreen = new IntroScreen(this.game);
        const highScoreEntryScreen = new HighScoreEntryScreen(this.game);


        this.setPhysics();

        this.game.state.add("MainScreen", mainGame);
        this.game.state.add("IntroScreen", introScreen);
        this.game.state.add("HighScoreEntryScreen", highScoreEntryScreen);
        this.game.state.start("IntroScreen");

    }

}
