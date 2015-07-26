define([
    'phaser'
], function (Phaser) { 
    'use strict';

    //From http://www.gamedevacademy.org/html5-phaser-tutorial-top-down-games-with-tiled/
    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    function findObjectsByType (type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust the y position
                //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                //so they might not be placed in the exact pixel position as in Tiled
                console.log("Found " + element.name);
                // element.y -= element.height;
                result.push(element);
            }
        });
        return result;
    }

    //create a sprite from an object
    function createFromTiledObject (game, element) {
        var sprite = new Phaser.Sprite(game, element.x, element.y, element.properties.key || null);
        //copy all properties to the sprite
        Object.keys(element).forEach(function(key) {
            sprite[key] = element[key];
        });
        return sprite;
    }

    function createObjectsByType(game, type, map, layer) {
        var results = findObjectsByType(type, map, layer);
        var group = game.add.group();
        results.forEach(function (element) {
            group.add(createFromTiledObject(game, element));
        });
        return group;
    }

    function createObjectByName(game, name, map, layer) {
        var obj;
        map.objects[layer].forEach(function(element) {
            if (element.name === name) {
                //Phaser uses top left, Tiled bottom left so we have to adjust the y position
                //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                //so they might not be placed in the exact pixel position as in Tiled
                console.log("Found " + element.name);
                // element.y -= element.height;
                obj = createFromTiledObject(game, element);
                return false;
            }
        });
        return obj;
    }

    return {
        createObjectByName: createObjectByName,
        createObjectsByType: createObjectsByType
    };

});