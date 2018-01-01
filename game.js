var Game = function () {
    //set the width and height of the scene
    this._width = 1280;
    this._height = 720;

    //setup background canvas
    this.bgRenderer = new PIXI.CanvasRenderer(this._width, this._height);
    document.body.appendChild(this.bgRenderer.view);

    //create the background stage
    this.bgStage = new PIXI.Stage();

    //setup the rendering surface
    this.renderer = new PIXI.CanvasRenderer(this._width, this._height, {
        transparent: true
    });
    document.body.appendChild(this.renderer.view);

    //create the main stage to draw on
    this.stage = new PIXI.Stage();

    //setup our physics world simulation
    this.world = new p2.World({
        garvity: [0, 0]
    })

    //speed parameters of the ship
    this.speed = 100;
    this.turnSpeed = 5;

    window.addEventListener('keydown', function (event) {
        this.handleKeys(event.keyCode, true)
    }.bind(this), false);

    window.addEventListener('keyup', function (event) {
        this.handleKeys(event.keyCode, false)
    }.bind(this), false);

    //enemy body array
    this.enemyBodies = [];
    this.enemyGraphics = [];

    this.removeObjs = [];

    //start running the game
    this.build()
};

Game.prototype = {
    /*
    Build the scene and begin animating 
     */

    build: function () {
        //draw the star field in the background
        this.drawStars();

        //setup the boundaries of the games arena
        this.setupBoundaries();

        //draw the ship to the scene
        this.createShip();

        //spawn random enemy ships
        this.createEnemies();

        //setup howler js audion
        //this.setupAudio();

        //begin the first frame
        requestAnimationFrame(this.tick.bind(this));
    },

    setupAudio: function () {
        this.sounds = new Howl({
            urls: [],
            sprite: {
                boom1: [start, length],
                boom2: [],
                boom3: []
            }
        });

        this.music = new Howl({
            urls: [],
            buffer: true,
            autoplay: true
        })
    },

    /*
    Draw trhe field of stars behind all the action 
     */

    drawStars: function () {
        //draw randomly positioned stars

        for (var i = 0; i < 1500; i++) {
            //generate random parameters for the stars
            var x = Math.round(Math.random() * this._width);
            var y = Math.round(Math.random() * this._height);
            var rad = Math.ceil(Math.random() * 2);
            var alpha = Math.min(Math.random() + 0.25, 1);

            //draw the star

            var star = new PIXI.Graphics();
            star.beginFill(0xFFFFFF, alpha);
            star.drawCircle(x, y, rad);
            star.endFill();

            //attach the star to the bgstage
            this.bgStage.addChild(star)
        }

        //Render the stars once
        this.bgRenderer.render(this.bgStage);
    },

    /* 
    Draw the boundaries of the space arena
    */
    setupBoundaries: function () {
        var walls = new PIXI.Graphics();
        walls.beginFill(0xFFFFFF, 0.5);
        walls.drawRect(0, 0, this._width, 10);
        walls.drawRect(this._width - 10, 0, 10, this._height - 20);
        walls.drawRect(0, this._height - 10, this._width, 10);
        walls.drawRect(0, 10, 10, this._height - 20);

        //attach the walls to the stage
        this.bgStage.addChild(walls);

        //render the boundaries once
        this.bgRenderer.render(this.bgStage)
    },

    createShip: function () {
        //create the ship object 

        this.ship = new p2.Body({
            mass: 1,
            angularVelocity: 0,
            damping: 0,
            angularDamping: 0,
            position: [Math.round(this._width / 2), Math.round(this._height / 2)]
        });
        this.shipShape = new p2.Box({
            width: 52,
            height: 69
        });
        this.ship.addShape(this.shipShape);
        this.world.addBody(this.ship);

        var shipGraphics = new PIXI.Graphics();

        //draw the ships body
        shipGraphics.beginFill(0x20d3fe);
        shipGraphics.moveTo(26, 0);
        shipGraphics.lineTo(0, 60);
        shipGraphics.lineTo(52, 60);
        shipGraphics.endFill();

        //add engine to the ship
        shipGraphics.beginFill(0x1495d1);
        shipGraphics.drawRect(7, 60, 38, 8);
        shipGraphics.endFill();

        //create the ship to only use one draw per call tick
        var shipCache = new PIXI.CanvasRenderer(52, 69, {
            transparent: true
        });
        var shipCacheStage = new PIXI.Stage();
        shipCacheStage.addChild(shipGraphics);
        shipCache.render(shipCacheStage);

        var shipTexture = PIXI.Texture.fromCanvas(shipCache.view);
        this.shipGraphics = new PIXI.Sprite(shipTexture);

        //attach the ship to the stage
        this.stage.addChild(this.shipGraphics);

        //setup our ships interaction for flight
        /*  Mousetrap.bind('w', function () {
             this.shipGraphics.rotation = 0;
             this.moveShip('n')
         }.bind(this));

         Mousetrap.bind('s', function () {
             this.shipGraphics.rotation = 180 * (Math.PI / 180);
             this.moveShip('s')
         }.bind(this));

         Mousetrap.bind('d', function () {
             this.shipGraphics.rotation = 90 * (Math.PI / 180);
             this.moveShip('e')
         }.bind(this));

         Mousetrap.bind('a', function () {
             this.shipGraphics.rotation = 270 * (Math.PI / 180);
             this.moveShip('w')
         }.bind(this)); */
    },

    /*     moveShip: function (dir) {
            var speed = 30;

            //increment x/y value of the ship in the direction
            //that it will be moving
            switch (dir) {
                case 'n':
                    this.shipGraphics.y -= speed;
                    break;
                case 's':
                    this.shipGraphics.y += speed;
                    break;
                case 'e':
                    this.shipGraphics.x += speed;
                    break;
                case 'w':
                    this.shipGraphics.x -= speed;
                    break;
                default:
                    break;
            }
        }, */

    createEnemies: function () {
        //create the graphics object
        var enemyGraphics = new PIXI.Graphics();
        enemyGraphics.beginFill(0x38d41a);
        enemyGraphics.drawCircle(20, 20, 20);
        enemyGraphics.endFill();

        enemyGraphics.beginFill(0x2aff00);
        enemyGraphics.lineStyle(1, 0x239d0b, 1);
        enemyGraphics.drawCircle(20, 20, 10);
        enemyGraphics.endFill();

        //create enemy cache
        var enemyCache = new PIXI.CanvasRenderer(40, 40, {
            transparent: true
        });
        var enemyCacheStage = new PIXI.Stage();
        enemyCacheStage.addChild(enemyGraphics);
        enemyCache.render(enemyCacheStage);

        var enemyTexture = PIXI.Texture.fromCanvas(enemyCache.view);

        //create random interval to generate enemies
        this.enemyTimer = setInterval(function () {
            //create enemy phiscs body
            var x = Math.round(Math.random() * this._width);
            var y = Math.round(Math.random() * this._height);
            var vx = (Math.random() - 0.5) * this.speed;
            var vy = (Math.random() - 0.5) * this.speed;
            var va = (Math.random() - 0.5) * this.speed;
            var enemy = new p2.Body({
                position: [x, y],
                mass: 1,
                damping: 0,
                angularDamping: 0,
                velocity: [vx, vy],
                angularVelocity: va
            });

            var enemyShape = new p2.Circle({
                radius: 20
            });
            enemyShape.sensor = true;
            enemy.addShape(enemyShape);
            this.world.addBody(enemy);

            var enemySprite = new PIXI.Sprite(enemyTexture);
            this.stage.addChild(enemySprite);

            //keep track of these enemies
            this.enemyBodies.push(enemy);
            this.enemyGraphics.push(enemySprite);
        }.bind(this), 1000);

        this.world.on('beginContact', function (event) {
            if (event.bodyB.id === this.ship.id) {
                this.removeObjs.push(event.bodyA);
            }
        }.bind(this))
    },

    /**
     * Handle ket presses and filter them
     * @param {Number} code key code pressed
     * @param {Boolean} state true/false
     */
    handleKeys: function (code, state) {
        switch (code) {
            case 37:
            case 65: //A
                this.keyLeft = state;
                break;
            case 39:
            case 68: //D
                this.keyRight = state;
                break;
            case 38:
            case 87: //W
                this.keyUp = state;
                break;
        }
    },

    updatePhysics: function () {
        //update the ships angular velocities for rotation
        if (this.keyLeft) {
            this.ship.angularVelocity = -1 * this.turnSpeed;
        } else if (this.keyRight) {
            this.ship.angularVelocity = this.turnSpeed;
        } else {
            this.ship.angularVelocity = 0;
        }

        //apply the force vctor to ship
        if (this.keyUp) {
            var angle = this.ship.angle + Math.PI / 2;
            this.ship.force[0] -= this.speed * Math.cos(angle);
            this.ship.force[1] -= this.speed * Math.sin(angle);
        }

        //update the position of the graphics based on the 
        //physics simulation position
        this.shipGraphics.x = this.ship.position[0];
        this.shipGraphics.y = this.ship.position[1];
        this.shipGraphics.rotation = this.ship.angle;

        //warp the ship to the otrher side of it is out of bounds
        if (this.ship.position[0] > this._width) {
            this.ship.position[0] = 0;
        } else if (this.ship.position[0] < 0) {
            this.ship.position[0] = this._width;
        }

        if (this.ship.position[1] > this._height) {
            this.ship.position[1] = 0;
        } else if (this.ship.position[1] < 0) {
            this.ship.position[1] = this._height;
        }

        //update enemy positions
        for (var i = 0; i < this.enemyBodies.length; i++) {
            this.enemyGraphics[i].x = this.enemyBodies[i].position[0];
            this.enemyGraphics[i].y = this.enemyBodies[i].position[1];
        }

        //step the physics simulation forward
        this.world.step(1 / 60);

        //remove enemy bodies
        for (var i = 0; i < this.removeObjs.length; i++) {
            this.world.removeBody(this.removeObjs[i]);

            var index = this.enemyBodies.indexOf(this.removeObjs[i]);
            if (index) {
                this.enemyBodies.splice(index, 1);
                this.stage.removeChild(this.enemyGraphics[index]);
                this.enemyGraphics.splice(index, 1);
            }

            //play random boom sounds
            //this.sounds.play('boom' + (Math.ceil(Math.random() * 3)));
        }

        this.removeObjs.length = 0;
    },

    /* 
    Fires at the ned of the gameloop to reset and redraw the canvas
    */
    tick: function () {
        this.updatePhysics();
        //render the stage for the current game
        this.renderer.render(this.stage);

        //begin the next frame
        requestAnimationFrame(this.tick.bind(this));
    }
}