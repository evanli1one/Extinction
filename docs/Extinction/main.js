title = "Extinction";

description = `
thing`;

characters = [
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
    WIDTH: 600,
    HEIGHT: 600,

    GRAVITY: 0.2,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
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
* @property { Boolean } enableGravity
* @property { Number } size
* @property { Number } decel
* @property { Number } offScreenDist
* @property { Number } stopSpeed
* @property { Number } throwCooldown
* @property { Number } throwCooldownCount
*/

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
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
let rocks, dinos;

let gravityEnableHeight = G.HEIGHT * 0.3
let groundHeight = G.HEIGHT * 0.7

function update() {

    if (!ticks) {
        Start();
    }

    RenderBackground();

    RenderPlayer();

    RenderRocks();

    RenderDinos();

    ThrowInput();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        size: 20,
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 3,
        selected: null
    }

    rocks = [];
    times(3, () => {SpawnRock()});
    dinos = [];
    times(10, () => {SpawnDino()});
}

function RenderPlayer()
{
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

    player.pos.clamp(player.size/2, G.WIDTH - player.size/2,
        player.size/2, gravityEnableHeight - player.size/2);

    color(player.color);
    box(player.pos.x, player.pos.y, player.size);
}

function RenderBackground()
{
    color("black");
    rect(0, 0, G.WIDTH, gravityEnableHeight);
    color("light_cyan");
    rect(0, gravityEnableHeight, G.WIDTH, G.HEIGHT);

    color("light_green");
    rect(0, groundHeight, G.WIDTH, G.HEIGHT);
}

function SpawnRock() {
    rocks.push({
        color: "light_black",
        pos: vec(rndi(-10, 10),
            rnd(G.HEIGHT * 0.1,gravityEnableHeight - G.HEIGHT * 0.1)),
        velocity: vec(rnd(0.5,2), 0),
        decel: 0.95,
        enableGravity: false,
        size: 10,
        offScreenDist: 20,
        stopSpeed: 1,
        throwCooldown: 60,
        throwCooldownCount: 0,
    })
}

function SpawnDino(){
    //spawns a dino
    dinos.push({
        color: "green",
        pos: vec(0, rnd((G.HEIGHT * 0.15), (G.HEIGHT * .5))),
        velocity: vec(rnd(3,6), 0),
        decel: 0.95,
        enableGravity: false,
        stopSpeed: 1,
        throwCooldown: 60,
        throwCooldownCount: 0,
    })
}

function RenderRocks()
{
    rocks.forEach(rock => {
        // let slowDownVector = DecelVector(rock.velocity, rock.decel);
        // rock.velocity = slowDownVector;

        if(rock.enableGravity && rock.pos.y > gravityEnableHeight)
        {
            rock.velocity.add(vec(0, G.GRAVITY));
        }

        rock.pos.add(rock.velocity);

        rock.pos.wrap(-rock.offScreenDist, rock.offScreenDist + G.WIDTH,
            -rock.offScreenDist, rock.offScreenDist + G.HEIGHT);

        color(rock.color);
        let isOnPlayer = box(rock.pos.x, rock.pos.y, rock.size)
            .isColliding.rect.cyan;

        if(isOnPlayer && rock.throwCooldownCount == 0)
        {
            player.selected = rock;
        }

        if(rock.throwCooldownCount != 0)
        {
            rock.throwCooldownCount--;
        }
    });
}

function RenderDinos()
{
    //used to render in the dinos
    dinos.forEach(dino => {
        // let slowDownVector = DecelVector(rock.velocity, rock.decel);
        // rock.velocity = slowDownVector;

        if(dino.velocity.length <= dino.stopSpeed)
        {
            dino.velocity = vec(0, 0);
        }
        else
        {
            dino.pos.add(dino.velocity);
        }

        dino.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

        color(dino.color);
        let isOnPlayer = char("a", 50, 50).isColliding.char.cyan; //where we wanna swap out a sprite

        if(isOnPlayer && dino.throwCooldownCount == 0)
        {
            player.selected = dino;
        }

        if(dino.throwCooldownCount != 0)
        {
            dino.throwCooldownCount--;
        }
    });
}

function ThrowInput()
{
    if(input.isPressed && player.selected != null)
    {
        player.selected.throwCooldownCount = player.selected.throwCooldown;

        player.selected.velocity = vec(player.velocity.x * player.throwSpeed,
            player.velocity.y * player.throwSpeed);

        player.selected.enableGravity = true;

        player.selected = null;
    }
}

function GameOver() {
    play("lucky");

    end();
}

function DecelVector(toDecel, decel)
{
    return vec(toDecel.x * decel,
        toDecel.y * decel)
}