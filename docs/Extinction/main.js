title = "Extinction";

description = `
thing`;

characters = [
    //a: asteroids (AKA rocks)
    `
 llll
ll lll 
l ll l
lll ll
 llll
`,
    //b: UFO (AKA player)
    `
 bbb
l l l
bbbbb
l l l
 bbb
`, //c: dinos!
    `
ggggg
gg
gg  g
gggggg
ggggg
gg  gg
`
];

const G = {
    WIDTH: 300,
    HEIGHT: 300,

    GRAVITY: 2,
    ROCK_VELOCITY_X_MIN: 1.5,
    ROCK_VELOCITY_X_MAX: 3,
};

options = {
    viewSize: { x: G.WIDTH, y: G.HEIGHT },
    //theme: "shapeDark",
    isReplayEnabled: true,
    // isPlayingBgm: true,
    seed: 3,
    isDrawingScoreFront: true,
};

/**
* @typedef { object } Rock
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { boolean } Enablegravity
* @property { Number } decel
* @property { Number } stopSpeed
* @property { Number } throwCooldown
* @property { Number } throwCooldownCount
*/

/**
* @typedef { object } Dino
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
*/

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } decel
* @property { Number } speed
* @property { Number } throwSpeed
* @property { Rock } selected
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Rock[] }
*/
let rocks;

/**
* @type  { Dino[] }
*/
let dinos;


function update() {

    if (!ticks) {
        Start();
    }

    RenderPlayer();

    SpawnRocks();
    RenderRocks();
    SpawnDino();
    RenderDinos();

    ThrowInput();
}

function Start() {
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 3,
        selected: null
    }

    rocks = [];
    dinos = [];
}

function RenderPlayer() {
    let currInput = vec(input.pos.x, input.pos.y);
    let inputVector = vec(currInput.x - player.pos.x,
        currInput.y - player.pos.y);
    let inputLength = inputVector.length;
    let inputDirection = inputVector.normalize();

    let newVelocity = vec(inputDirection.x * inputLength * player.speed,
        inputDirection.y * inputLength * player.speed);

    player.pos.add(player.velocity.add(newVelocity));

    player.velocity = newVelocity;
    player.velocity = DecelVector(player.velocity, player.decel);

    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

    color(player.color);
    box(player.pos.x, player.pos.y, 20);
}

function SpawnRocks() {
    if (ticks % (60) == 0) { //TODO: add?: || rocks.length < 1
        rocks.push({
            color: "black",
            pos: vec(0, rnd((G.HEIGHT * 0.15), (G.HEIGHT * .5))),
            velocity: vec(rnd(G.ROCK_VELOCITY_X_MIN, G.ROCK_VELOCITY_X_MAX), 0),
            decel: 0.95,
            Enablegravity: false,
            stopSpeed: 1,
            throwCooldown: 60,
            throwCooldownCount: 0,
        })
    }
}

function RenderRocks() {
    rocks.forEach(rock => {
        // let slowDownVector = DecelVector(rock.velocity, rock.decel);
        // rock.velocity = slowDownVector;

        if (rock.velocity.length <= rock.stopSpeed) {
            rock.velocity = vec(0, 0);
        }
        else {
            rock.pos.add(rock.velocity);
        }

        color(rock.color);
        // let isOnPlayer = box(rock.pos.x, rock.pos.y, 10)
        //     .isColliding.rect.cyan;
        let isOnPlayer = char("a", rock.pos.x, rock.pos.y, {})
            .isColliding.rect.cyan;

        if (isOnPlayer && rock.throwCooldownCount == 0) {
            player.selected = rock;
        }

        if (rock.throwCooldownCount != 0) {
            rock.throwCooldownCount--;
        }
    });
    remove(rocks, (rock) => {
        //rock.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        if (rock.pos.x > G.WIDTH || rock.pos.y > G.HEIGHT) //TODO: G.WIDTH + rock.width, G.HEIGHT + rock.height
            return true;
        return false;
    });
}

function SpawnDino() {
    //spawns a dino
    if (ticks % (60) == 0) { //TODO: add?: || rocks.length < 1
        dinos.push({
            color: "green",
            pos: vec(rnd(0,G.WIDTH), G.HEIGHT - 3),
            velocity: vec(rnd(3, 4), 0),
        });
    }
}

function RenderDinos() {
    //used to render in the dinos
    dinos.forEach(dino => {
        // let slowDownVector = DecelVector(rock.velocity, rock.decel);
        // rock.velocity = slowDownVector;
        dino.pos.add(dino.velocity);
        dino.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(dino.color);
        let isCollideWithRock = char("c", dino.pos.x, dino.pos.y).isColliding.char.black; //where we wanna swap out a sprite
        //console.log(isCollideWithRock);
    });
}

function ThrowInput() {
    if (input.isPressed && player.selected != null) {
        player.selected.throwCooldownCount = player.selected.throwCooldown;

        player.selected.velocity = vec(player.velocity.x * player.throwSpeed,
            player.velocity.y * player.throwSpeed);
        player.selected.Enablegravity = true;
        player.selected = null;
    }
}

function GameOver() {
    play("lucky");

    end();
}

function DecelVector(toDecel, decel) {
    return vec(toDecel.x * decel,
        toDecel.y * decel)
}