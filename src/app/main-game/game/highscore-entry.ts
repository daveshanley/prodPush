import Game = Phaser.Game;
import {Level} from './level';


import {HighScore} from "./highscore";
import {ScoreBoard} from "./scoreboard";
import {Shaders} from "./shaders";
export class HighScoreEntryScreen extends Phaser.State {
    private bgFilter;
    private inputText: string;
    private vmwareId: string;
    private del;
    private ret;
    private tab;

    private nameText;
    private vmwareIDText;
    private blinkingCursor;
    private newHighscoreTitle;
    private newHighscoreValue;
    private newHighscoreInput;
    private nameEntered;
    private idEntered;


    private scoreName: string;
    private scoreId: string;

    private scoreText;
    private scoreHeaderText;
    private scoreHandled = false;

    private highScoreTheme: Phaser.Sound;

    constructor(game: Game, private scoreboard: ScoreBoard) {
        super();
        this.game = game;

    }


    preload() {
        this.highScoreTheme = this.game.add.audio('high-score');
    }

    create() {

        this.nameEntered = false;
        this.idEntered = false;
        this.inputText = '';
        this.vmwareId = '';

        Level.SetPhysics(this.game);

        this.bgFilter = new Phaser.Filter(this.game, null, Shaders.ScoreboardScreen);
        this.bgFilter.setResolution(this.game.width, this.game.height);

        const sprite: any = this.game.add.sprite(0, 0);
        sprite.width = this.game.width;
        sprite.height = this.game.height;
        sprite.filters = [this.bgFilter];

        const headings = ['Name', 'VMware ID', 'Score'];

        this.scoreHeaderText = this.game.add.text(250, 100, '', (Level.HighScoreListHeaders as any));
        this.scoreHeaderText.parseList(headings);

        if (this.scoreboard.score > this.scoreboard.topScore) {

            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPressed);
            this.del = this.game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
            this.ret = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            this.tab = this.game.input.keyboard.addKey(Phaser.Keyboard.TAB);
            this.del.onDown.add(this.backspace, this);
            this.ret.onDown.add(this.enter, this);
            this.tab.onDown.add(this.enter, this);
        }
        this.scoreText = this.game.add.text(250, 150, '', (Level.HighScoreListEntries as any));

        this.updateScores();



    }

    backspace() {
        this.inputText = this.inputText.substring(0, this.inputText.length - 1);
        this.updateText();
        this.blinkingCursor.x -= 14.5;
    }

    keyPressed(char) {
        if (this.inputText.length <= 25) {
            this.inputText += char;
            this.updateText();
        }
        this.blinkingCursor.x += 14.5;
    }

    enter() {
        if (!this.nameEntered) {
            this.nameEntered = true;
            this.scoreName = this.inputText;
            this.inputText = '';
            this.blinkingCursor.x = 700;
            return;
        }
        if (this.nameEntered && !this.idEntered) {
            this.scoreId = this.inputText;
            this.idEntered = true;
            this.blinkingCursor.destroy();
            this.newHighscoreTitle.text = 'Score Saved!';
            this.newHighscoreValue.destroy();
            this.returnToStartScreen(5);

            const newScore = new HighScore(this.scoreName, this.scoreId, this.scoreboard.score);

            // persist score to DB.
            this.scoreboard.saveScore(newScore);

            return;
        }
    }

    returnToStartScreen(seconds: number) {
        this.game.time.events.add(Phaser.Timer.SECOND * seconds, () => {
            this.scoreboard.cycleMode = true;
            this.scoreboard.processScores();
            location.reload();
        }, this);
    }

    updateText() {
        if (this.nameText && !this.nameEntered && !this.idEntered) {
            this.nameText.text = this.inputText;
        }
        if (this.vmwareIDText && this.nameEntered && !this.idEntered) {
            this.vmwareIDText.text = this.inputText;
        }

    }

    updateScores() {

        this.scoreText.parseList(this.scoreboard.loadedScores);
        this.scoreHandled = true;

        // new highscore? hell yeah!
        if (this.scoreboard.score > this.scoreboard.topScore) {
            this.highScoreTheme.play();

            this.scoreText.y += 38;

            this.newHighscoreTitle = this.game.add.text(250, 10, 'new  highscore', Level.NewHighScoreBannerStyle);
            this.newHighscoreValue = this.game.add.text(890, 10, String(this.scoreboard.score), Level.NewHighScoreValueStyle);
            this.game.add.tween(this.newHighscoreTitle).to({alpha: 0}, 800, Phaser.Easing.Linear.None, true, 0, -1, true);

            this.nameText = this.game.add.text(250, 150, '', (Level.NewHighScoreInputStyle as any));
            this.vmwareIDText = this.game.add.text(700, 150, '', (Level.NewHighScoreInputStyle as any));
            this.newHighscoreInput = this.game.add.text(950, 150, String(this.scoreboard.score), Level.NewHighScoreInputStyle);

            this.blinkingCursor = this.game.add.text(250, this.scoreText.y - 38, '_', Level.HighScoreCursor);
            this.game.add.tween(this.blinkingCursor).to({alpha: 0}, 200, Phaser.Easing.Linear.None, true, 0, -1, true);


        } else {

            // failed to beat high score.. try again man.
            if (!this.scoreboard.cycleMode) {

                this.newHighscoreTitle = this.game.add.text(250, 10, 'Score', Level.NewHighScoreBannerStyle);
                this.newHighscoreValue = this.game.add.text(this.game.width / 2 - 120, 10, String(this.scoreboard.score), Level.NewHighScoreValueStyle);
                this.returnToStartScreen(10);
            } else {
                const text = this.game.add.text(this.game.world.centerX, this.game.height - 60, 'Press  Spacebar  To  Start', Level.StartStyle);
                text.anchor.set(0.5);
                this.game.add.tween(text).to({alpha: 0}, 800, Phaser.Easing.Linear.None, true, 0, -1, true);
                const space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
                space.onDown.add(() => {
                    this.scoreboard.cycleMode = false;
                    this.game.state.start('InstructionScreen');
                }, this);

                this.returnToStartScreen(20);
            }

        }


    }

    update() {
        this.bgFilter.update();
    }


}