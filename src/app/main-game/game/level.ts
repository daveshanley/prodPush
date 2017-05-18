import Game = Phaser.Game;
export class Level {
    static TOP_BOUNCER_XPOS = 258 + 127;
    static TOP_BOUNCER_YPOS = 283 + 16;
    static BOTTOM_BOUNCER_XPOS = 346 + 127;
    static BOTTOM_BOUNCER_YPOS = 682 + 16;
    static FireEmitter = {
        image: ['fire1', 'fire2', 'fire3'],
        blendMode: 'HARD_LIGHT',
        lifespan: {min: 500, max: 800},
        vx: {min: -1, max: 1},
        vy: {value: -1, delta: -0.1},
        scale: {value: 0.4, control: [{x: 0, y: 1}, {x: 1, y: 0.5}]},
        alpha: {value: 1, control: [{x: 0, y: 0}, {x: 0.5, y: 1}, {x: 0.6, y: 1}, {x: 1, y: 0}]},
        bringToFront: true,
        emit: {
            name: 'smoke',
            value: 1,
            control: [{x: 0, y: 0}, {x: 0.2, y: 0}, {x: 0.5, y: 0.5}]
        }
    };

    static SmokeEmitter = {
        image: 'smoke-puff',
        lifespan: {min: 700, max: 1000},
        vx: 0,
        vy: {value: {min: -2, max: -1}, delta: -0.05, control: [{x: 0, y: 1}, {x: 1, y: 0.5}]},
        scale: {
            value: {min: 0.1, max: 0.3},
            delta: 0.005,
            control: [{x: 0, y: 1}, {x: 0.6, y: 1}, {x: 1, y: 0.25}]
        },
        alpha: {value: 0.3, control: [{x: 0, y: 0}, {x: 0.3, y: 1}, {x: 1, y: 0}]},
        rotation: {value: 0, delta: {min: -2, max: 2}},
        sendToBack: true
    };

    static ScoreLabelStyle = {
        font: '48px Atlantic Cruise',
        fill: '#fff',
        align: 'center'
    };

    static ScoreValueStyle = {
        font: '54px Futura',
        fill: '#F8E81C',
        align: 'left',
        boundsAlignH: 'left',
        boundsAlignV: 'middle'
    };

    static StartStyle = {
        font: '54px Futura',
        fill: '#F8E81C',
        align: 'center',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
    };

    static SetPhysics(game: Game) {
        game.physics.startSystem(Phaser.Physics.BOX2D);
        game.physics.box2d.gravity.y = 550;
        //game.physics.box2d.setBoundsToWorld();
        game.physics.box2d.restitution = 0.4;
        game.physics.box2d.debugDraw.shapes = true;
    }
    public static isEven(n) {
        return n % 2 === 0;
    }
}
