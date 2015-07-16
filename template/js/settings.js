var xFe = {
    settings: {

        /* Audio Settings */
        media: {
            /* One or more mp3 files used as background music. Check out http://arcade.hofle.com/ */
            bgMusic: [
                'audio/arcade83sample.mp3',
            ],
            bgMusicShuffle: true,   // randomize the playing order
            bgMusicVolume: 0.2,     // volume of bgMusic 0 = off, 1 = 100%
            bgMusicPlaying: false,

            /* Audio file played when the page first loads */
            startUp: 'audio/startup.mp3',
            startUpVolume: 1,

            /* Sound played when changing selected game */
            gameSelect: 'audio/game.mp3', // list navigation
            gameStart: 'audio/coin.mp3',  // game launch
            menuSelect: 'audio/menu.mp3', // menu switch
            soundsVolume: 1,

            /* game video volume */
            videoVolume: 0.8,
            
            /* One or more intro videos. Randomly selected on load */
            introVideo: [
                'video/xMenu.mp4',
            ]
        },


        /* Navigation Settings - ASCII codes for keys http://www.asciitable.com/ */
        navigation: {
            listUp:       40,       // down
            listPageUp:   39,       // right
            listDown:     38,       // up
            listPageDown: 37,       // left
            menuNext:    103,       // g
            menuPrev:    114,       // r
            startGame:    49,       // 1
            listEditToggle:   101,  // e 
            listFilterToggle: 102,   // f
            listEditName: 104   // h
        },

        
        /* Miscellaneous Options */
        option: {
            
            /* Alphabetically sort game list */
            sortGameList: true,
            
            /* Random game selection delay in seconds */
            autoListChangeDelay: 60

        }
    }
};
