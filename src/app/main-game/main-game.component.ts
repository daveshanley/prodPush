import {Component, OnInit} from '@angular/core';
import Game = Phaser.Game;
import {ProdPush, MainScreen} from './game/main';


interface MyGame {
    StateA: any;
    StateB: any;
}


@Component({
    selector: 'app-main-game',
    templateUrl: './main-game.component.html',
    styleUrls: ['./main-game.component.css']
})
export class MainGameComponent implements OnInit {

    private parent: MainGameComponent;

    constructor() {
        this.parent = this;
    }

    ngOnInit() {
        let game = new Phaser.Game(1254, 783);
         let top = new MainScreen(game);

        game.state.add("MainScreen", top);
        game.state.start("MainScreen");




    }

}
