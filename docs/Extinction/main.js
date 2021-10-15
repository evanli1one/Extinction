title = "Extinction";

description = `
thing`;

characters = [
    //a: asteroids (AKA rockArray)
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
`, //c: dinoArray!
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

    GRAVITY: 0.1,
    ROCK_VELOCITY_X_MIN: 1.5,
    ROCK_VELOCITY_X_MAX: 3,
};

options = {
    viewSize: { x: G.WIDTH, y: G.HEIGHT },
    theme: "dark",
    isReplayEnabled: true,
    // isPlayingBgm: true,
    seed: 3,
    isDrawingScoreFront: true,
    isDrawingParticleFront: true,
};

/**
* @typedef { object } Rock
* @property { Color } color
* @property { Color } hotColor
* @property { Color } particleColor1
* @property { Color } particleColor2
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
* @typedef { object } Dino
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
* @property { Number } timer
* @property { Boolean } direction
* @property { number } turnInterval
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
* @property { Number } bounciness
* @property { Rock } selected
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Rock[] }
*/
let rockArray;

/**
* @type  { Dino[] }
*/
let dinoArray;


let gravityEnableHeight = G.HEIGHT * 0.3
let groundHeight = G.HEIGHT * 0.7

function update() {

    if (!ticks) {
        Start();
    }

    RenderBackground();

    RenderPlayer();

    SpawnRocks();
    RenderRocks();

    SpawnDinos();
    RenderDinos();

    ThrowInput();
}

function Start() {
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        size: 10,
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 2,
        bounciness: 0.25,
        selected: null
    }

    rockArray = [];
    dinoArray = [];
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
    player.velocity.mul(player.decel);

    player.pos.clamp(player.size/2, G.WIDTH - player.size/2,
        player.size/2, gravityEnableHeight - player.size/2);

    // color(player.color);
    // box(player.pos.x, player.pos.y, player.size);
    color("black");
    char("b", player.pos.x, player.pos.y, {scale: {x: 3, y: 3}});
}

function RenderBackground()
{
    color("white");
    rect(0, 0, G.WIDTH, gravityEnableHeight);
    color("light_cyan");
    rect(0, gravityEnableHeight, G.WIDTH, G.HEIGHT);

    color("light_green");
    rect(0, groundHeight, G.WIDTH, G.HEIGHT);
}

function SpawnRocks() {
    if (ticks % (60) == 0) { //TODO: add?: || rockArray.length < 1
        rockArray.push({
            color: "light_black",
            hotColor: "red",
            particleColor1: "red",
            particleColor2: "yellow",
            pos: vec(0,
                rnd(G.HEIGHT * 0.1, gravityEnableHeight - G.HEIGHT * 0.1)),
            velocity: vec(rnd(0.5,2), 0),
            decel: 0.95,
            enableGravity: false,
            size: 10,
            offScreenDist: 20,
            stopSpeed: 1,
            throwCooldown: 60,
            throwCooldownCount: 0,
        });
    }
}
function SpawnDinos() {
    //spawns a dino
    //
    if (ticks % (60) == 0) { //TODO: add?: || rockArray.length < 1
        dinoArray.push({
            color: "green",
            pos: vec(0, rnd(groundHeight + 10, G.HEIGHT - 3)),
            velocity: vec(rnd(1, 3), 0),
            size: 3,
            timer: 0,
            direction: true,
            turnInterval: rndi(2,4),
        });
    }
}

function RenderRocks()
{
    remove(rockArray, rock => {
        rock.pos.add(rock.velocity);

        color(rock.color);
        let isOnPlayer = box(rock.pos.x, rock.pos.y, rock.size)
            .isColliding.char.b;
        
        if(rock.enableGravity && rock.pos.y > gravityEnableHeight)
        {
            // Decelerate rock
            // rock.velocity.mul(rock.decel);
            
            rock.velocity.add(vec(0, G.GRAVITY));

            RenderHeatEffects(rock);
        }

        if (isOnPlayer && rock.throwCooldownCount == 0) {
            player.selected = rock;
        }

        if (rock.throwCooldownCount != 0) {
            rock.throwCooldownCount--;
        }
        return (!rock.pos.isInRect(-rock.offScreenDist, -rock.offScreenDist,
            2*rock.offScreenDist + G.WIDTH, 2*rock.offScreenDist + G.HEIGHT));
    });
    remove(rockArray, (rock) => {
        //rock.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        if (rock.pos.x > G.WIDTH || rock.pos.y > G.HEIGHT) //TODO: G.WIDTH + rock.width, G.HEIGHT + rock.height
            return true;
        return false;
    });
}

function RenderHeatEffects(rock)
{
    color(rock.particleColor1);
    let forwardAngle = atan2(rock.velocity.y, rock.velocity.x);
    let backAngle = forwardAngle + PI;
    let offRockDist = rock.size / 4;
    let randOffsetX = rndi(-offRockDist - rock.size / 2, offRockDist + rock.size / 2);
    let randOffsetY = rndi(-offRockDist - rock.size / 2, offRockDist + rock.size / 2);
    particle(rock.pos.x + randOffsetX, rock.pos.y + randOffsetY,
        1, 2, backAngle, PI/4);
    color(rock.particleColor2);
    particle(rock.pos.x + randOffsetX, rock.pos.y + randOffsetY,
        1, 2, backAngle, PI/4);

    let offsetDist1 = -0.1;
    let radius1 = rock.size * 0.7;
    let angle1 = PI * 0.5;
    let size1 = 3;

    color(rock.particleColor1);
    arc(rock.pos.x + rock.velocity.x * offsetDist1, rock.pos.y + rock.velocity.y * offsetDist1,
        radius1, size1, forwardAngle - angle1/2, forwardAngle + angle1/2);
}

function RenderDinos()
{
    //used to render in the dinoArray
    dinoArray.forEach(dino => {
        // let slowDownVector = rock.velocity.mult() rock.decel);
        // rock.velocity = slowDownVector;

        //we can change velocity to change it's direction based on the timer variable
        //don't forget, dino.velocity/dino.timer refers to that specific dinos var
        if (ticks % (60) == 0){ //need something like this so that they don't move in unison (can't just use dino.timer += ticks)
            dino.timer++;
        }
        if(dino.timer%dino.turnInterval == 0 && dino.direction){
            dino.velocity.x *= -1;
            dino.direction = false;
        }
        else if(dino.timer%dino.turnInterval != 0 && dino.direction == false){
            dino.velocity.x *= -1;
            dino.direction = true;
        }
        dino.pos.add(dino.velocity);
        dino.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(dino.color);
        let isCollideWithRock = char("c", dino.pos.x, dino.pos.y, 
        {scale: {x: dino.size, y: dino.size}}).isColliding.char.black; //where we wanna swap out a sprite
        //console.log(isCollideWithRock);
    });
}

function ThrowInput() {
    if (input.isPressed && player.selected != null) {
        player.selected.throwCooldownCount = player.selected.throwCooldown;

        SetHitVelocity(player.selected);

        player.selected.enableGravity = true;

        player.selected = null;
    }
}

function SetHitVelocity(rock)
{
    let bounceDirection = vec(rock.pos.x - player.pos.x,
        rock.pos.y - player.pos.y).normalize();
    
    let previousMagnitude = rock.velocity.length;

    let bounceVel = vec(bounceDirection.x * previousMagnitude,
        bounceDirection.y * previousMagnitude).mul(player.bounciness)

    rock.velocity = vec(player.velocity.x * player.throwSpeed + bounceVel.x,
        player.velocity.y * player.throwSpeed + bounceVel.y);
}

function GameOver() {
    play("lucky");

    end();
}