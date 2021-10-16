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

    WRAPOFFSET: 50,

    GRAVITY: 0.1,
    ROCK_VELOCITY_X_MIN: 1.5,
    ROCK_VELOCITY_X_MAX: 3,
};

options = {
    viewSize: { x: G.WIDTH, y: G.HEIGHT },
    theme: "dark",
    isReplayEnabled: true,
    // isPlayingBgm: true,
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
* @property { Vector } startVelocity
* @property { Number } size
* @property { Number } timer
* @property { Boolean } isGoingLeft
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
* @typedef { object } BackgroundObject
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Rock[] }
*/
let rockArray = [];

/**
* @type  { Dino[] }
*/
let dinoArray = [];

/**
* @type  { Friendly[] }
*/
let friendlyArray = [];

/**
* @type  { BackgroundObject[] }
*/
let starArray = [];

/**
* @type  { BackgroundObject[] }
*/
let windArray = [];

/**
* @type  { BackgroundObject[] }
*/
let grassArray = [];

let skyTopHeight = G.HEIGHT * 0.3
let groundHeight = G.HEIGHT * 0.7
let maxDinos = 12, maxFriends = 3;
let trueMaxFriends = 5

// Score Combo
let lastkill;
let killcombo;

const dinoSpeedIncrease = 0.2;
let currDifficulty = -1;
let difficultyInterval = 15;

function update() {

    if (!ticks) {
        Start();
    }
    if(player.health <= 0) {
        GameOver();
    }
    
    DifficultyScaling();

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
    ClearAll();
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        health: 100,
        maxHealth: 100,
        healthLoss: 10,
        size: 10,
        decel: 0.9,
        speed: 0.1,
        throwSpeed: 2,
        bounciness: 0.25,
        selected: null
    }

    SpawnStars();
    SpawnWind();
    SpawnGrass();
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

    RenderBackgroundObject(starArray, "box");
    RenderBackgroundObject(windArray, "box");
    RenderBackgroundObject(grassArray, "line");
}

function RenderBackgroundObject(array, type)
{
    array.forEach(item => {
        item.pos.add(item.velocity);
        item.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(item.color);
        if(type == "box")
        {
            box(item.pos.x, item.pos.y, item.size);
        }
        if(type == "line")
        {
            rect(item.pos.x, item.pos.y, item.size, 3);
        }
    });
}

function SpawnStars() {
    times(8, () => {
        starArray.push({
            color: "black",
            pos: vec(rnd(0, G.WIDTH),
                rnd(5, skyTopHeight - G.HEIGHT * 0.01)),
            velocity: vec(-0.25, 0),
            size: 1,
        });
    });
}

function SpawnWind() {
    times(12, () => {
        windArray.push({
            color: "cyan",
            pos: vec(rnd(0, G.WIDTH),
                rnd(skyTopHeight + 5, groundHeight - G.HEIGHT * 0.01)),
            velocity: vec(-0.5, 0),
            size: 2,
        });
    });
}

function SpawnGrass() {
    times(16, () => {
        grassArray.push({
            color: "green",
            pos: vec(rnd(0, G.WIDTH),
                rnd(groundHeight + 5, G.HEIGHT)),
            velocity: vec(-1, 0),
            size: 1,
        });
    });
}

function SpawnRocks() {
    if (ticks % (60) == 0) { //TODO: add?: || rockArray.length < 1
        rockArray.push({
            color: "light_black",
            hotColor: "red",
            particleColor1: "red",
            particleColor2: "yellow",
            pos: vec(-20,
                rnd(G.HEIGHT * 0.1, skyTopHeight - G.HEIGHT * 0.1)),
            velocity: vec(rnd(0.5, 1), 0),
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
    if (ticks % (30) == 0 && dinoArray.length < maxDinos) {
        let thisSpeedIncrease = currDifficulty * dinoSpeedIncrease;
        let thisXSpeed = rnd(0.3 + thisSpeedIncrease, 0.6 + thisSpeedIncrease);
        dinoArray.push({
            color: "black",
            pos: vec(-20, rnd(groundHeight + 10, G.HEIGHT - 10)),
            velocity: vec(thisXSpeed, 0),
            startVelocity: vec(thisXSpeed, 0),
            size: 4,
            timer: 0,
            isGoingLeft: true,
            turnInterval: rndi(5, 10),
            flip: 1,
        });
    }
}

function SpawnFriendly() {
    if (ticks % (60 * 3) == 0 && friendlyArray.length < maxFriends) { //TODO: add?: || rockArray.length < 1
        friendlyArray.push({
            color: "black",
            pos: vec(-20, rnd(skyTopHeight + 10, groundHeight - 30)),
            velocity: vec(rnd(0.6, 1), 0),
            size: 2,
        });
    }
}

function RenderFriendly()
{
    remove(friendlyArray, friend => {

        let isCollideWithRock;
        friend.pos.add(friend.velocity);
        friend.pos.wrap(-G.WRAPOFFSET, G.WIDTH + G.WRAPOFFSET, 0, G.HEIGHT);
        color(friend.color);

        isCollideWithRock = char(addWithCharCode("b", floor(ticks / 15) % 2), friend.pos.x , friend.pos.y, 
            {scale: {x: friend.size, y: friend.size}}).isColliding.char.a;
            if(isCollideWithRock) { //the asteriod has hit the friendly!
                let minus = -5;
                addScore(minus, friend.pos);
                player.health -= player.healthLoss;
                play("select");

                color("purple");
                particle(friend.pos.x, friend.pos.y,
                    30, 3, 0, 2*PI);
            }
        return isCollideWithRock;
    });
}

function RenderRocks()
{
    remove(rockArray, rock => {
        rock.pos.add(rock.velocity);
        color(rock.color);
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

    let offsetDist1 = 1;
    let radius1 = rock.size * 3;
    let angle1 = PI * 0.75;
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
        dino.pos.wrap(-G.WRAPOFFSET, G.WIDTH + G.WRAPOFFSET, 0, G.HEIGHT);
        color(dino.color);
        //we can change velocity to change it's direction based on the timer variable
        //don't forget, dino.velocity/dino.timer refers to that specific dinos var
        if (ticks % (60) == 0){ //need something like this so that they don't move in unison (can't just use dino.timer += ticks)
            dino.timer++;
        }
        if(dino.timer%dino.turnInterval == 0){
            dino.timer++;

            if(dino.isGoingLeft)
            {
                dino.timer += Math.round(dino.turnInterval / 4);
                dino.isGoingLeft = false;
            }
            else
            {
                
                dino.isGoingLeft = true;
            }
        }
        
        if(dino.isGoingLeft == false){
            if(dino.velocity.x > -dino.startVelocity.x){
                dino.velocity.x -=.005;
            }
            if(dino.velocity.x <= 0){
                dino.flip = -1;
            }
            
        }
        else if(dino.isGoingLeft){
            if(dino.velocity.x < dino.startVelocity.x){
                dino.velocity.x += .005;
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

            AddHealth(5 + Math.floor(points/4));

            play("explosion");
            play("coin");

            color("red");
            particle(dino.pos.x, dino.pos.y,
                10, 4, -PI/2, PI/3);
            color("yellow");
            particle(dino.pos.x, dino.pos.y,
                20, 2, 0, 2*PI);
        }
        return isCollideWithRock;
    });
}

function ThrowInput() {
    if (player.selected != null) {
        player.selected.throwCooldownCount = player.selected.throwCooldown;
        play("hit");

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

    RenderHitEffect(rock);

    let bounceVel = vec(bounceDirection.x * previousMagnitude,
        bounceDirection.y * previousMagnitude).mul(player.bounciness)

    rock.velocity = vec(player.velocity.x * player.throwSpeed + bounceVel.x,
        player.velocity.y * player.throwSpeed + bounceVel.y);
}

function RenderHitEffect(rock)
{
    let hitAngle = atan2(rock.pos.y - player.pos.y,
        rock.pos.x - player.pos.x);
    
    color("light_yellow");
    particle(player.pos.x, player.pos.y,
        10, 2, hitAngle, PI/4);
    
    let offsetDist1 = 1;
    let radius1 = player.size * 2;
    let angle1 = PI * .2;
    let size1 = 6;

    color("light_purple");
    arc(player.pos.x + player.velocity.x * offsetDist1, player.pos.y + player.velocity.y * offsetDist1,
        radius1, size1, hitAngle - angle1/2, hitAngle + angle1/2);
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

function DifficultyScaling()
{
    if(ticks % (60 * difficultyInterval) == 0)
    {
        if(maxFriends < trueMaxFriends)
        {
            maxFriends += 1
        }
        currDifficulty++;
    }
}

function GameOver() {
    play("lucky");

    end();
}

function ClearAll()
{
    currDifficulty = -1;
    remove(dinoArray, () =>{
        return true;
    });

    remove(friendlyArray, () =>{
        return true;
    });
}