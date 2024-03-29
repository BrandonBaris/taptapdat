var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('background', './assets/world_bg.png');
    game.load.image('ground', './assets/platform.png');
    game.load.image('star', './assets/star.png');
    game.load.image('space', './assets/space.jpg');
    game.load.spritesheet('dude', './assets/bowser.png', 70, 110);
    game.load.image('death', './assets/ROFLMAO.gif');
    // http://www.spriters-resource.com/snes/smarioworld/sheet/52778/
}

var already_pressed = false;
_power = -215; // amount of upward velocity gain for each correct key
var grav_strength = 900 + time_coefficient; // value of downward pull
var dude_weight = 150 ; // value of mass the dude has that affects his velocity
var boost_power = -195; // amount of upward velocity gain for each correct key
var boost_penalty = 300; // amount of downward velocity penalized a bad key
var player;
var death_zone;
var cursors;
var stars;
var score = 0; // the timer variable which is basically the score
var scoreText;
var charArray;
var labelValue;
/* the main string that hold all the playable keys */
var main_string = 'abcdefghijklmnopqrstuvwxyz[];./1234567890-={}:"<>?!@#$%^&*()_+';

var the_correct_key;
var startGameText;
var something3;
var current_key;
var the_end = false;
var scoreStyle = { font: '36px Bangers, Arial, sans-serif', fill: '#284f72' };
var scoreStyleA = { font: '36px Bangers, Arial, sans-serif', fill: '#339933' };
var letterStyle = { font: '96px Impact, sans-serif', fill: '#000' };
var startGameTextStyle = { fontSize: '36px', fill: '#284f72', align: 'center' };
var goodBadText;
var time_coefficient;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'background');

    //  The death_zone
    death_zone = game.add.group();
    death_zone.enableBody = true;

    // Here we create the ground.
    var ground = death_zone.create(0, game.world.height-7, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(5, 100);
    ground.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(game.world.width/2-35, game.world.height - 630, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the  guy a slight bounce.

    player.body.bounce.x = 1;

    //player shouldnt bounce on floor, removes ceiling so player doesnt penalize for going too high
    //player.body.bounce.y = 0.2;
    player.body.gravity.y = dude_weight;
    player.body.velocity.x = 0;
    player.body.collideWorldBounds = true;
    
    //  Our two animations

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [4, 5, 6, 7], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for the stars
    stars.enableBody = true;

      for (var i = 0; i < 20; i++)
    {
        //  Create a star inside of the 'stars' group

        var star = stars.create(i * 40, game.world.height-40, 'star');

        //  Let gravity pull them down to place
        star.body.gravity.y = grav_strength;

    }

    //  The time score
    scoreText = game.add.text(20, 20,'', scoreStyle);
    startGameText = game.add.text(game.world.centerX-200, game.world.centerY-200, 'Press the correct key to survive!', startGameTextStyle);
    
    goodBadText = game.add.text(game.world.centerX-38, game.world.centerY-250,'', scoreStyleA);

    the_correct_key = game.add.text(game.world.centerX-200, game.world.centerY-100, '');

    //  creating the controls and the cheat controls
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addCallbacks(this, null, null, keyPress);

    actualGameTimer= game.time.events.add(Phaser.Timer.SECOND * 1, keygenEngine, this);

}

function keygenEngine(){
    startGameText.text = '';
    game.time.events.loop(Phaser.Timer.SECOND*3, keygen, this);

}

function keygen(){
    removeText();
    if ( the_end === false ){
    already_pressed = false;    
    charArray = main_string.split('');
    labelValue = charArray[Math.floor(Math.random() * (charArray.length ))];
    if (labelValue.match(/[a-z]/i)){
        labelValue.toUpperCase();
    }

    the_correct_key = game.add.text(game.world.centerX-30, game.world.centerY-100, labelValue, letterStyle);
    } else {
        removeText();
    }
}

function update() {
    scoreText.text = "TIME: "+ Math.floor(this.game.time.totalElapsedSeconds()) + "  ";

    //  Collide the player and the stars with the death_zone
    //game.physics.arcade.collide(player, death_zone);
    game.physics.arcade.collide(stars, death_zone);

    //  Checks to see if the player overlaps 
    game.physics.arcade.overlap(player, stars, lucky_guy, null, this);
    game.physics.arcade.overlap(player, death_zone, game_over, null, this);

    if (player.body.velocity.x >0){
        player.animations.play('right');
    } else {
        player.animations.play('left');
    }
    
    //  CHEAT MODE -- USED FOR TESTING
    /*   
    if (cursors.up.isDown){
        player.body.velocity.y = boost_power;
    }
    */
    time_coex_generate();   

}

function removeText() {

    the_correct_key.destroy();
    startGameText.text = "";

}

function lucky_guy(player, star){
    star.kill();
    player.body.velocity.y = boost_power;
}


function game_over () {

    game.add.sprite(0, 0, 'space');
    game.add.text(game.world.centerX-200, game.world.centerY-100, 'GAME OVER', { fontSize: '44px', fill: '#FFF' });
    the_end = true;
}

function time_coex_generate() {
    if ( (this.game.time.totalElapsedSeconds()) % 10 === 0 && player.body.gravity.y < 1000){
        time_coefficient += 30;
        player.body.gravity.y = time_coefficient;
    }
}

function keyPress(char){
    if ( the_end === false) {

        if (labelValue === char && already_pressed === false) {
            removeText();
            goodBadText.text = "GOOD! ";
            already_pressed = true;
            //game.add.tween(player).to({x:game.world.randomX}, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);  
            player.body.velocity.y = boost_power;

            var speedCheck = Math.floor(Math.random() * (4 - 0));

            if(speedCheck == 1) { player.body.velocity.x += -100; } 
            if(speedCheck == 2) { player.body.velocity.x = 150; } 
            if(speedCheck == 3) { player.body.velocity.x += -100; } 
            if(speedCheck == 4) { player.body.velocity.x = 150; } 

        } else {
            goodBadText.text = "";
            player.body.velocity.y += boost_penalty;
        }
    } else {
        game.add.text(game.world.centerX-100, game.world.centerY-200, 'F5 TO REFRESH', letterStyle);

    }
}