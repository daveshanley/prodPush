import {Component, OnInit} from '@angular/core';
import Game = Phaser.Game;
import {MainScreen} from './game/main';
import {IntroScreen} from "./game/intro";


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
        let top = new MainScreen(this.game);
        let intro = new IntroScreen(this.game);
        this.setPhysics();

        this.game.state.add("MainScreen", top);
        this.game.state.add("IntroScreen", intro);
        this.game.state.start("IntroScreen");
        //this.game.state.start("MainScreen");




    }

}
