title = "Extinction";

description = `
Click, drag, and release to toss
`;

characters = [
];

const G = {
    WIDTH: 600,
    HEIGHT: 600,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "shapeDark",
    isReplayEnabled: true,
    // isPlayingBgm: true,
    seed: 3,
    isDrawingScoreFront: true,
};

/**
* @typedef { object } Draggable
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } decel
* @property { Number } stopSpeed
* @property { Number } throwCooldown
* @property { Number } throwCooldownCount
*/

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } decel
* @property { Number } speed
* @property { Number } throwSpeed
* @property { Draggable } selected
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Draggable[] }
*/
let draggables;

function update() {

    if (!ticks) {
        Start();
    }

    RenderPlayer();

    RenderDraggables();

    ThrowInput();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 3,
        selected: null
    }

    draggables = [];

    draggables.push({
        color: "green",
        pos: vec(rnd(0, G.WIDTH), rnd(0, G.HEIGHT)),
        velocity: vec(0, 0),
        decel: 0.95,
        stopSpeed: 1,
        throwCooldown: 60,
        throwCooldownCount: 0,
    })
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

    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

    color(player.color);
    box(player.pos.x, player.pos.y, 20);
}

function RenderDraggables()
{
    draggables.forEach(draggable => {
        let slowDownVector = DecelVector(draggable.velocity, draggable.decel);
        draggable.velocity = slowDownVector;

        if(draggable.velocity.length <= draggable.stopSpeed)
        {
            draggable.velocity = vec(0, 0);
        }
        else
        {
            draggable.pos.add(draggable.velocity);
        }

        draggable.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

        color(draggable.color);
        let isOnPlayer = box(draggable.pos.x, draggable.pos.y, 10)
            .isColliding.rect.cyan;

        if(isOnPlayer && draggable.throwCooldownCount == 0)
        {
            player.selected = draggable;
        }

        if(draggable.throwCooldownCount != 0)
        {
            draggable.throwCooldownCount--;
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