define([
    'phaser'
], function (Phaser) { 
    'use strict';

    return {
        // Intro
        init: function () {},
        preload: function () {},
        loadUpdate: function () {},
        loadRender: function () {},
        
        // Main
        create: function () {},
        update: function () {},
        preRender: function () {},
        render: function () {},
        resize: function () {},

        // Pause
        paused: function () {},
        pauseUpdate: function () {},
        resumed: function () {},
        
        // Outro
        shutdown: function () {}
    };
});