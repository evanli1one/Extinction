title = "Extinction";

description = `
hit asteroids into dinos
avoid friendlies`;

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
 ppp
ppppp
l l l
ppppp
 ppp
`,    //c: UFO (AKA player)
`
 ppp
ppppp
 l l
ppppp
 ppp
`, //d: dino (frame 1 of 2)
    `
gggg
gRgg
gggg
 ggggg
 gggg
 g  g
`, //e: dino (frame 1 of 2)
    `
gggg
gRgg
gggggg
 gggg
 g  g
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
    isPlayingBgm: true,
    seed: 4,
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
* @property { Number } rotation
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
* @property { number } flip
*/

/**
* @typedef { object } Friendly
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
*/

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } health
* @property { Number } maxHealth
* @property { Number } healthLoss
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

/**
* @type  { Friendly[] }
*/
let friendlyArray;

let skyTopHeight = G.HEIGHT * 0.3
let groundHeight = G.HEIGHT * 0.7
let maxDinos = 10, maxFriends = 3;

// Score Combo
let lastkill;
let killcombo;

function update() {

    if (!ticks) {
        Start();
    }
    if(player.health <= 0) {
        GameOver();
    }

    //star system (create a render function to render the stars and have each star move across the screen and wrap around)
    RenderBackground();

    RenderPlayer();

    SpawnRocks();
    RenderRocks();

    SpawnDinos();
    RenderDinos();

    //spawn friendlies
    SpawnFriendly();
    //render friendlies
    RenderFriendly();

    ThrowInput();
}

function Start() {
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        health: 100,
        maxHealth: 100,
        healthLoss: 5,
        size: 10,
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 2,
        bounciness: 0.25,
        selected: null
    }
    //star system (spawn a number of stars within the top rectangle of the game field)
        //top rectangle is between X: 0 to G.WIDTH, Y: 0 to skyTopHeight
    rockArray = [];
    dinoArray = [];
    friendlyArray = [];
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
        player.size/2, skyTopHeight - player.size/2);

    color("black");
    text(player.health + "/" + player.maxHealth + " HP", G.WIDTH / 2.4, 3);
    color("black");
    char(addWithCharCode("b", floor(ticks / 15) % 2), player.pos.x, player.pos.y, {scale: {x: 3, y: 3}});
}

function RenderBackground()
{
    color("white");
    rect(0, 0, G.WIDTH, skyTopHeight);
    color("light_cyan");
    rect(0, skyTopHeight, G.WIDTH, G.HEIGHT);

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
                rnd(G.HEIGHT * 0.1, skyTopHeight - G.HEIGHT * 0.1)),
            velocity: vec(rnd(0.5,2), 0),
            decel: 0.95,
            enableGravity: false,
            size: 2,
            rotation: (rndi(0,2) == 1) ? 0 : 45,
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
    if (ticks % (60) == 0 && dinoArray.length < maxDinos) { //TODO: add?: || rockArray.length < 1
        dinoArray.push({
            color: "black",
            pos: vec(0, rnd(groundHeight + 10, G.HEIGHT - 3)),
            velocity: vec(rnd(0.1, 1), 0),
            size: 3,
            timer: 0,
            direction: true,
            turnInterval: rndi(5, 8),
            flip: 1,
        });
    }
}

function SpawnFriendly() {
    //spawns a dino
    //
    if (ticks % (60) == 0 && friendlyArray.length < maxFriends) { //TODO: add?: || rockArray.length < 1
        friendlyArray.push({
            color: "black",
            pos: vec(0, rnd(skyTopHeight + 10, groundHeight - 3)),
            velocity: vec(rnd(0.25, 1), 0),
            size: 3,
        });
    }
}

function RenderFriendly()
{
    remove(friendlyArray, friend => {

        let isCollideWithRock;
        friend.pos.add(friend.velocity);
        friend.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(friend.color);

        isCollideWithRock = char(addWithCharCode("b", floor(ticks / 15) % 2), friend.pos.x , friend.pos.y, 
            {scale: {x: friend.size, y: friend.size}}).isColliding.char.a;
            if(isCollideWithRock) { //the asteriod has hit the friendly!
                let minus = -5;
                addScore(minus,friend.pos);
                player.health -= player.healthLoss;
                play("select");
                //particle (make a red splat or explosion or equivalent)
            }
        return isCollideWithRock;
    });
}

function RenderRocks()
{
    remove(rockArray, rock => {
        rock.pos.add(rock.velocity);
        color(rock.color);
        //let isOnPlayer = box(rock.pos.x, rock.pos.y, rock.size)
            //.isColliding.char.b;
        let isOnPlayer = char("a", rock.pos.x, rock.pos.y, 
            {scale: {x: rock.size, y: rock.size}, rotation: rock.rotation}).isColliding.char.b;
        if(!isOnPlayer) {
            isOnPlayer = char("a", rock.pos.x, rock.pos.y, 
                {scale: {x: rock.size, y: rock.size}, rotation: rock.rotation}).isColliding.char.c;
        }
        if(rock.enableGravity && rock.pos.y > skyTopHeight)
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
    remove(dinoArray, dino => {
        // let slowDownVector = rock.velocity.mult() rock.decel);
        // rock.velocity = slowDownVector;
        let isCollideWithRock;
        dino.pos.add(dino.velocity);
        dino.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(dino.color);
        //we can change velocity to change it's direction based on the timer variable
        //don't forget, dino.velocity/dino.timer refers to that specific dinos var
        if (ticks % (60) == 0){ //need something like this so that they don't move in unison (can't just use dino.timer += ticks)
            dino.timer++;
        }
        if(dino.timer%dino.turnInterval == 0 && dino.direction){
            dino.direction = false;
        }
        else if(dino.timer%dino.turnInterval != 0 && dino.direction == false){
            dino.direction = true;
        }
        if(dino.direction == false){
            if(dino.velocity.x>=-1){
                dino.velocity.x-=.01;
            }
            if(dino.velocity.x <= 0){
                dino.flip = -1;
            }
            
        }
        else if(dino.direction){
            if(dino.velocity.x<=1){
                dino.velocity.x += .01;
            }
            if(dino.velocity.x >= 0){
                dino.flip = 1;
            }
                       
        }
        if(dino.flip == 1){
            isCollideWithRock = char(addWithCharCode("d", floor((ticks + (dino.timer)) / 30) % 2), dino.pos.x , dino.pos.y, 
            {mirror:{x: -1, y: 1}, scale: {x: dino.size, y: dino.size}}).isColliding.char.a;
        }
        else if (dino.flip == -1){
            isCollideWithRock = char(addWithCharCode("d", floor((ticks + (dino.timer)) / 30) % 2), dino.pos.x , dino.pos.y, 
            {mirror:{x: 1, y: 1}, scale: {x: dino.size, y: dino.size}}).isColliding.char.a;
        }

        if(isCollideWithRock) { //the asteriod has hit the dino!
            //score
            let points;
            if(lastkill + 20 >= ticks){
                points=Math.pow(2,(killcombo+1));
                killcombo++;
            } else {
                points=1;
                killcombo = 0;
            }
            addScore(points, dino.pos);
            lastkill = ticks;

            AddHealth(points * 5);

            play("explosion");
            play("coin");
            //particle (make a red splat or explosion or equivalent)
        }
        return isCollideWithRock;
    });
}

function ThrowInput() {
    if (input.isPressed && player.selected != null) {
        player.selected.throwCooldownCount = player.selected.throwCooldown;
        play("hit");
        //particles (make some small spark/collision type particle for hitting the asteriod with the UFO)
        SetHitVelocity(player.selected);
        
        //player loses HP
        player.health -= player.healthLoss;

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

function AddHealth(toAdd)
{
    if(toAdd + player.health > player.maxHealth)
    {
        player.health = player.maxHealth;
    }
    else
    {
        player.health += toAdd;
    }
}

function GameOver() {
    play("lucky");

    end();
}