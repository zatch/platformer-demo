define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function TestMap1 (_game) {
        game = _game;

        Phaser.Sprite.call(this, game);
        
        this.triggersFired = {}; // Hash of all triggers that have been fired
        this.lastTriggerByTarget = {}; // Hash of most recent trigger fired for each target. (key=target, val=trigger key)
        this.lastTriggerFired = ""; // Most recent trigger fired
    }

    TestMap1.prototype = Object.create(Phaser.Sprite.prototype);
    TestMap1.prototype.constructor = TestMap1;
    
    TestMap1.prototype.handleTrigger = function (target, key, properties) {
        switch (key) {
            case "hide":
                target.kill();
                break;
            case "warn about jumping monsters":
            case "complain about old men":
                target.revive();
                if (key !== this.lastTriggerByTarget[target]) {
                    target.x = Number(properties["x"]);
                    target.y = Number(properties["y"]);
                    target.currentPhrase = properties.currentPhrase;
                }
                break;
            default:
                break;
        }
        this.lastTriggerFired = this.lastTriggerByTarget[target] = this.triggersFired[key] = key;
    };

    return TestMap1;
});