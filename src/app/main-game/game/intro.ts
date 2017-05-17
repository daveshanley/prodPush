import Game = Phaser.Game;
import {Level} from "./level";
import {Product} from "./product";
export class IntroScreen extends Phaser.State {
    private bgFilter;
    private fireTimeout = 0;
    private products: Array<Product>;
    private titleTune: Phaser.Sound;

    constructor(game: Game) {
        super();
        this.game = game;
        this.products = [];
    }

    preload() {

        this.game.load.atlasJSONHash('products', 'assets/products.png', 'assets/products.json');
        this.game.load.audio('title-music', 'assets/sound/title-screen.wav');

        this.game.load.physics('logo-physics', 'assets/game-logo.json');
        this.game.load.image('logo-image', 'assets/game-logo.png');
    }

    create() {

        // from http://glslsandbox.com/e#39291.1

        let shaderFragments = [
            "#ifdef GL_ES",
            "precision mediump float;",
            "#endif",
            "",
            "uniform float time;",
            "uniform vec2 mouse;",
            "uniform vec2 resolution;",
            "",
            "",
            "// rotate position around axis",
            "vec2 rotate(vec2 p, float a)",
            "{",
            "	return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));",
            "}",
            "",
            "// 1D random numbers",
            "float rand(float n)",
            "{",
            "    return fract(sin(n) * 43758.5453123);",
            "}",
            "",
            "// 2D random numbers",
            "vec2 rand2(in vec2 p)",
            "{",
            "	return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));",
            "}",
            "",
            "// 1D noise",
            "float noise1(float p)",
            "{",
            "	float fl = floor(p);",
            "	float fc = fract(p);",
            "	return mix(rand(fl), rand(fl + 1.000004), fc);",
            "}",
            "",
            "// voronoi distance noise, based on iq's articles",
            "float voronoi(in vec2 x)",
            "{",
            "	vec2 p = floor(x);",
            "	vec2 f = fract(x);",
            "	",
            "	vec2 res = vec2(8.0);",
            "	for(int j = -1; j <= 1; j ++)",
            "	{",
            "		for(int i = -1; i <= 1; i ++)",
            "		{",
            "			vec2 b = vec2(i, j);",
            "			vec2 r = vec2(b) - f + rand2(p + b);",
            "			",
            "			// chebyshev distance, one of many ways to do this",
            "			float d = max(abs(r.x), abs(r.y));",
            "			",
            "			if(d < res.x)",
            "			{",
            "				res.y = res.x;",
            "				res.x = d;",
            "			}",
            "			else if(d < res.y)",
            "			{",
            "				res.y = d;",
            "			}",
            "		}",
            "	}",
            "	return res.y - res.x;",
            "}",
            "",
            "",
            "//float flicker = noise1(time * 2.0) * 0.8 + 0.4;",
            "",
            "void main(void)",
            "{",
            "	vec2 uv = gl_FragCoord.xy / resolution.xy;",
            "	uv = (uv - 0.5) * 2.0;",
            "	vec2 suv = uv;",
            "	uv.x *= resolution.x / resolution.y;",
            "	",
            "	",
            "	float v = 0.0;",
            "	",
            "	// that looks highly interesting:",
            "	v = 0.3 - length(uv) * 0.3;",
            "	",
            "	",
            "	// a bit of camera movement",
            "	uv *= 0.6 + sin(time * 0.03) * 0.4;",
            "	uv = rotate(uv, sin(time * 0.1) * 1.0);",
            "	uv += time * 0.03;",
            "	",
            "	",
            "	// add some noise octaves",
            "	float a = 0.6, f = 1.0;",
            "	",
            "	for(int i = 0; i < 3; i ++) // 4 octaves also look nice, its getting a bit slow though",
            "	{	",
            "		float v1 = voronoi(uv * f + 5.0);",
            "		float v2 = 0.0;",
            "		",
            "		// make the moving electrons-effect for higher octaves",
            "		if(i > 0)",
            "		{",
            "			// of course everything based on voronoi",
            "			v2 = voronoi(uv * f * 0.5 + 50.0 + time);",
            "			",
            "			float va = 0.0, vb = 0.0;",
            "			va = 1.0 - smoothstep(0.0, 0.1, v1);",
            "			vb = 1.0 - smoothstep(0.0, 0.08, v2);",
            "			v += a * pow(va * (0.5 + vb), 2.0);",
            "		}",
            "		",
            "		// make sharp edges",
            "		v1 = 1.0 - smoothstep(0.0, 0.3, v1);",
            "		",
            "		// noise is used as intensity map",
            "		v2 = a * (noise1(v1 * 5.5 + 0.1));",
            "		",
            "		// octave 0's intensity changes a bit",
            "		if(i == 0)",
            "			//v += v2 * flicker;",
            "		//else",
            "			v += v2;",
            "		",
            "		f *= 3.0;",
            "		a *= 0.7;",
            "	}",
            "",
            "	// slight vignetting",
            "	v *= exp(-0.6 * length(suv)) * 1.2;",
            "	",
            "	// use texture channel0 for color? why not.",
            "	//vec3 cexp = texture2D(iChannel0, uv * 0.001).xyz * 3.0 + texture2D(iChannel0, uv * 0.01).xyz;//vec3(1.0, 2.0, 4.0);",
            "	",
            "	// old blueish color st",
            "	vec3 cexp = vec3(3.0, 1.2, 1.0);",
            "		cexp *= 1.3;",
            "",
            "	vec3 col = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) * 2.0;",
            "	",
            "	gl_FragColor = vec4(col, 1.0);",
            "}"
        ];

        Level.SetPhysics(this.game);

        this.bgFilter = new Phaser.Filter(this.game, null, shaderFragments);
        this.bgFilter.setResolution(this.game.width, this.game.height);

        let sprite = this.game.add.sprite(0, 0);
        sprite.width = this.game.width;
        sprite.height = this.game.height;
        sprite.filters = [this.bgFilter];

        let logo = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'logo-image');
        this.game.physics.box2d.enable(logo);
        logo.body.restitution = 0;
        logo.anchor.set(0.5);
        logo.body.static = true;


        logo.body.clearFixtures();
        logo.body.loadPolygon('logo-physics', 'logo-image', logo);


        this.titleTune = this.game.add.audio('title-music');
        this.game.sound.setDecodedCallback([this.titleTune], this.startMusic, this);


        let text = this.game.add.text(this.game.world.centerX, this.game.height - 70, "Press Space To Start", Level.StartStyle);
        text.anchor.set(0.5);

    }

    startMusic() {
        this.titleTune.loopFull(0.3);
    }

    createProduct() {

        const product = Product.Create(this.game, null, true);
        product.sprite.angle = Math.random() * 360;
        this.products.push(product);

    }


    update() {
        this.bgFilter.update();

        if (this.game.time.now > this.fireTimeout) {
            this.createProduct();
            this.fireTimeout = this.game.time.now + 1000;
        }
        let tmp: Array<Product> = [];
        for(let p of this.products) {
            if(p.sprite.body.y > this.game.height) {
                p.sprite.destroy();
            } else {
                tmp.push(p)
                p.sprite.body.angle +=1;
            }
        }
        this.products = tmp;

    }


}