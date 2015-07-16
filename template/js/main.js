var app = angular.module('xMenu', [])
    
    .controller('xController', ['$scope', '$sce', function($scope, $sce) {
        /* Scope Variables */
        $scope.inGame = false;
        $scope.playingIntro = true;
        $scope.games = [{id: 0, description: 'Empty Menu...', snap: 'img/no-snap.png', video: 'no-video.mp4'}];
        $scope.initialised = false;
        $scope.menus = [{name: 'no-header'}];
        $scope.menuIndex = 0;
        $scope.gameListLength = 20; //Initial default value for game list array size - adjusted in resize event
        $scope.listIndex = 0;
        $scope.game = {};
        $scope.itemList = 'filteredItems';

        /* Audio Initialisation */
        var fadeDelay = 2500,
            shuffle = function(array) {
                var currentIndex = array.length,
                    temporaryValue,
                    randomIndex;
                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            };
        
        /* Initialise menu sounds */
        $scope.media = {
            gameSelect: new Howl({urls: [xFe.settings.media.gameSelect], volume: xFe.settings.media.soundsVolume, buffer: true}),
            gameStart: new Howl({urls: [xFe.settings.media.gameStart], volume: xFe.settings.media.soundsVolume, buffer: true}),
            menuSelect: new Howl({urls: [xFe.settings.media.menuSelect], volume: xFe.settings.media.soundsVolume, buffer: true}),
        };

        /* Initialise Background Music & its helper functions */
        if (xFe.settings.media.bgMusic && xFe.settings.media.bgMusic.length) {
            if (xFe.settings.media.bgMusicShuffle) {
                shuffle(xFe.settings.media.bgMusic);
            }
            $scope.media.musicTrack = 0;
            $scope.media.music = new Audio(xFe.settings.media.bgMusic[0]);
            $scope.media.music.addEventListener('ended', function() {
                if (++$scope.media.musicTrack == xFe.settings.media.bgMusic.length) {
                    $scope.media.musicTrack = 0;
                }
                $scope.media.music.src = xFe.settings.media.bgMusic[$scope.media.musicTrack];
                $scope.media.music.play();
            });
            $scope.media.music.fade = function(from, to, len, callback) {
                var self = $scope.media.music,
                    diff = Math.abs(from - to),
                    dir = from > to ? 'down' : 'up',
                    steps = diff / 0.01,
                    stepTime = len / steps;
                self.volume = from;
                for (var i=1; i<=steps; i++) {
                    (function() {
                        var change = self.volume + (dir === 'up' ? 0.01 : -0.01) * i,
                            vol = Math.round(1000 * change) / 1000,
                            toVol = to;
                        setTimeout(function() {
                            self.volume = vol;

                            if (vol === toVol) {
                                if (callback) callback();
                            }
                        }, stepTime * i);
                    })();
                }
            }
            $scope.media.music.fading = false;
            $scope.media.music.isPaused = false;
            $scope.media.music.fadeIn = function() {
                if (!$scope.media.musicMuted) {
                    $scope.media.music.fading = true;
                    $scope.media.music.fade(0, xFe.settings.media.bgMusicVolume, fadeDelay, function() {
                        $scope.media.music.fading = false;
                        $scope.media.music.isPaused = false;
                    });
                }
            }
            $scope.media.music.fadeOut = function(callback) {
                if (!$scope.media.musicMuted) {
                    $scope.media.music.fading = true;
                    $scope.media.music.fade(xFe.settings.media.bgMusicVolume, 0, fadeDelay, function() {
                        $scope.media.music.pause();
                        $scope.media.music.isPaused = true;
                        $scope.media.music.fading = false;
                        if (callback) callback();
                    });
                }
            }
            $scope.media.musicMuted = false;
        }

        /* Initialise Startup video */
        if (xFe.settings.media.introVideo && xFe.settings.media.introVideo.length) {
            xFe.settings.media.introVideoInitialised = true;
            shuffle(xFe.settings.media.introVideo);
            $scope.$on('startIntro', function() {
                $('#video-intro').on('error ended', function() {
                    $scope.$broadcast('introExit');
                });
                $('#video-intro')[0].src = xFe.settings.media.introVideo[0];
                $('#video-intro')[0].play();
                if ($scope.initialised) {
                    $('#loader').fadeOut();
                }
            });
        }
        
        /* Intro Exit Event */
        $scope.$on('introExit', function(event, game) {
            if ($scope.media.startUp) {
                $scope.media.startUp.pause();
            }
            
            $('#video-intro').fadeOut(400, function() {
                $('#video-intro')[0].pause();
                $('#video-intro').remove();
            });

            if ($scope.initialised && $('#loader').is(':visible')) {
                console.log('fade');
                $('#loader').fadeOut();
            }
            $('#game-video').attr('autoplay', 'autoplay');
            $scope.playingIntro = false;
            if ($scope.media.music) {
                $scope.media.music.isPaused = true;
            }
                    console.log('x');
                    console.log($('#loader').is(':visible'));
        });

        /* Initialise startup sound & video */
        if (xFe.settings.media.startUp) {
            $scope.media.startUp = new Audio(xFe.settings.media.startUp);
            $scope.media.startUp.addEventListener('ended', function() {
                if ($scope.playingIntro && xFe.settings.media.introVideoInitialised) {
                    $scope.$broadcast('startIntro');
                } else {
                    $scope.$broadcast('introExit');
                }
            });
            $scope.media.startUp.play();
        } else if (xFe.settings.media.introVideoInitialised)  {
            $scope.$broadcast('startIntro');
        } else {
            $scope.$broadcast('introExit');
        }

        /* App Focus Handler & Random game changer */ 
        $scope.$on('appFocus', function(event, hasFocus) {
            if (hasFocus) {
                document.getElementById('game-video').play();
                if ($scope.media.music) {
                    $scope.media.music.play();
                    $scope.media.music.fadeIn();
                }
                $scope.inGame = false;
            } else {
                if ($scope.playingIntro) {
                    $scope.$broadcast('introExit');
                }
                if ($scope.media.music) {
                    $scope.media.music.fadeOut();
                }
                document.getElementById('game-video').pause();
            }
        });
        $scope.timeout = 0;
        setInterval(function() {
            if (!$scope.playingIntro) {
                $scope.timeout++;
            }
            if ($scope.timeout > (xFe.settings.option.autoListChangeDelay * 2)) {
                //select random game
                if ($scope.itemList != 'items' && $scope.menus[$scope.menuIndex][$scope.itemList].length > 1) {
                    var g = $scope.listIndex
                        dir = 'up',
                        diff = 0;
                    while (g == $scope.listIndex) {
                        g = parseInt(Math.random() * $scope.menus[$scope.menuIndex][$scope.itemList].length);
                    }
                    if (g < $scope.listIndex) {
                        dir = 'down';
                        diff = $scope.listIndex - g;
                    } else {
                        diff = g - $scope.listIndex;
                    }
                    $scope.$broadcast('listChange', dir, diff, false);
                }
                $scope.timeout = 0;
            }
            if (!document.hasFocus()) {
                $scope.timeout = 0;
            }
            if ($scope.media.music) {
                if (!$scope.media.music.fading && !$scope.media.music.isPaused && !document.hasFocus()) {
                    $scope.$broadcast('appFocus', false);
                }
                if (!$scope.media.music.fading && $scope.media.music.isPaused && document.hasFocus()) {
                    $scope.$broadcast('appFocus', true);
                }
            } else {
                $scope.$broadcast('appFocus', document.hasFocus());
            }
        }, 500);
        
        /* Icon click handlers */
        $scope.iconClick = function(opt) {
            switch(opt) {
                case "mute":
                    if ($scope.media.music) {
                        if ($scope.media.musicMuted) {
                            $scope.media.musicMuted = false;
                            $scope.media.music.play();
                        } else {
                            $scope.media.musicMuted = true;
                            $scope.media.music.pause();
                        }
                    }
                    break;
            }
        }

        /* Start Game Handlers */
        $scope.startGame = function(obj) {
            //Only launch if clicked element is highlighted
            if (obj.target.dataset.index == $scope.game.index) {
                $scope.$broadcast('startGame', $scope.game);
            }
        };

        $scope.$on('startGame', function(event, game) {
            if ($scope.inGame) {
                return;
            }
            $scope.$broadcast('appFocus', false);
            $scope.media.gameStart.play();
            $scope.inGame = true;
            window.postMessage(angular.extend(game, {xm_method: 'launch'}), "*");
        });

        /* Required for cross origin request for video files */
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        /* xMenu Initialisation */
        window.postMessage({xm_method: "init", listSort: xFe.settings.option.sortGameList}, "*");
        window.addEventListener("message", function(event) {
            if (event.source != window) return;
            if (event.data && event.data.type) {
                switch (event.data.type) {
                    case "xm_ready":
                        if (event.data.success) {
                            if (event.data.warnings.length) {
                                console.warn(event.data.warnings);
                            }
                            $scope.menus = event.data.menus;
                            $scope.initialised = true;
                            $scope.$broadcast('listReset');
                            console.log(event.data);
                        } else {
                            console.error(event.data);
                            alert(event.data.msg);
                        }
                        
                        // Hide menu list if only 1 menu
                        if ($scope.menus.length === 1) {
                            $('#menus-list').hide();
                        }
                        if (!$scope.playingIntro) {
                            $('#loader').fadeOut();
                        }

                        break;
                    case "xm_launch":
                        if (!event.data.success) {
                            console.error(event.data);
                        } else {
                            console.log(event.data);
                        }
                        break;
                }
            }
        });

    }])
    
    /* Handler for window resize and also initialises the view as the watcher function is called to initialize the watcher */
    .directive('resize', function ($window) {
        return function ($scope, element) {

            var w = angular.element($window);
            
            $scope.$on('listReset', function(event, inScopeUpdate) {

                /* Reset the timeout counter, listIndex & view */
                $scope.timeout = 0;
                $scope.listIndex = $scope.menus[$scope.menuIndex].listIndex;
                console.log($scope.listIndex);
                /* get as close as possible to selected item in filtered list */
                for (var i=0; i < $scope.menus[$scope.menuIndex].filteredItems.length; i++) {
                    if ($scope.menus[$scope.menuIndex].filteredItems[i].originalIndex >= $scope.listIndex) {
                        $scope.listIndex = $scope.menus[$scope.menuIndex].filteredItems[i].index;
                        break;
                    }
                }
                if (i == $scope.menus[$scope.menuIndex].filteredItems.length) {
                    $scope.listIndex = $scope.menus[$scope.menuIndex].filteredItems[$scope.menus[$scope.menuIndex].filteredItems.length - 1].index;
                }
                console.log($scope.listIndex);
                $scope.itemList = 'filteredItems';

                /* Calculate offset of top of list for displaying the start of the list */
                $scope.$broadcast('updateGameList');
                if(!inScopeUpdate) {
                    $scope.$apply();
                }
                    
                //Hide image element - will be displayed if video does not exist
                $('#game-detail img').hide();
                if (!$scope.playingIntro) {
                    document.getElementById('game-video').play();
                }
            });

            $scope.$on('updateGameList', function() {
                var offset = 0,
                    listStart = $scope.listIndex - Math.floor($scope.gameListLength / 2);

                // Exit if menus have not been loaded
                if (!$scope.initialised) {
                    return;
                }

                // Set current game list & game
                if (listStart < 0) {
                    listStart = 0;
                }
                $scope.games = $scope.menus[$scope.menuIndex][$scope.itemList].slice(listStart, listStart + $scope.gameListLength);
                $scope.game = $scope.menus[$scope.menuIndex][$scope.itemList][$scope.listIndex];
                
                // Update the top margin of the games list
                if ($scope.listIndex < Math.floor($scope.gameListLength / 2)) {
                    offset = (Math.floor($scope.gameListLength / 2) - $scope.listIndex) * $scope.menuHeight;
                }
                $('#games-list ul').css('margin-top', $scope.listMargin - (Math.floor($scope.gameListLength / 2) * $scope.menuHeight) + offset);
            });

            $scope.$on('listChange', function(event, direction, step, userInitiated) {
                var previous = $scope.listIndex,
                    offset = 0,
                    listStart;
                
                userInitiated = typeof userInitiated !== 'undefined' ? userInitiated : true;
                $scope.timeout = 0;
                switch(direction) {
                    case 'up':
                        if ($scope.listIndex == $scope.menus[$scope.menuIndex][$scope.itemList].length - 1) break;
                        $scope.listIndex += step;
                        if ($scope.listIndex > ($scope.menus[$scope.menuIndex][$scope.itemList].length - 1)) {
                            $scope.listIndex = $scope.menus[$scope.menuIndex][$scope.itemList].length - 1;
                        }
                        break;
                    case 'down':
                        if ($scope.listIndex == 0) break;
                        $scope.listIndex -= step;
                        if ($scope.listIndex < 0) {
                            $scope.listIndex = 0;
                        }
                        break;
                }

                // Only update display if the selection has changed
                if (previous != $scope.listIndex) {
                    $('#game-detail img').hide();
                    if (userInitiated) {
                        $scope.media.gameSelect.play();
                    }
                    $scope.$broadcast('updateGameList');
                }
                $scope.$apply();
                document.getElementById('game-video').play();
            });

            $scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };

            $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                var headerHeight = $('#header').height(window.innerHeight/4).outerHeight(true),
                    footerHeight = $('#footer').outerHeight(true),
                    bodyPadding = parseInt($('body').css('padding-top')) + parseInt($('body').css('padding-bottom')),
                    bodyHeight = window.innerHeight - (headerHeight + footerHeight + bodyPadding),
                    colWidth = $('#games-list').innerWidth();

                $scope.menuHeight = $('#games-list ul li').outerHeight(true);
                $('#games-list, #game-detail').height(bodyHeight - 20);
                
                $scope.listMargin = (($('#games-list').innerHeight()/2) - ($scope.menuHeight/2));

                $('#games-list ul').css('margin-top', $scope.listMargin - ($scope.listIndex * $scope.menuHeight));
                $('#game-detail img.snap, #game-detail video')
                    .width(colWidth)
                    .height($('#games-list').innerHeight());

                //Get size of list
                $scope.gameListLength = Math.ceil($('#games-list').innerHeight() / $scope.menuHeight);

                //Ensure game list length is an odd number to correctly centre list
                $scope.gameListLength = ($scope.gameListLength % 2) == 0 ? ++$scope.gameListLength : $scope.gameListLength;
                
                $scope.$broadcast('updateGameList');

                //Video volume initialisation
                $('#game-video')[0].volume = xFe.settings.media.videoVolume;

            }, true);

            w.bind('resize', function () {
                $scope.$apply();
            });
            
            var mouseTimeout,
                mouseHidden = false;

            document.addEventListener("mousemove", magicMouse);

            function magicMouse() {
                $scope.timeout = 0;
                if (mouseTimeout) {
                    clearTimeout(mouseTimeout);
                }
                mouseTimeout = setTimeout(function() {
                    if (!mouseHidden) {
                        document.querySelector("body").style.cursor = "none";
                        mouseHidden = true;
                    }
                }, 3000);
                if (mouseHidden) {
                    document.querySelector("body").style.cursor = "auto";
                    mouseHidden = false;
                }
            };
        }
    })

    /* Keyboard handlers */
    .directive('ngNavigate', function () {

        return function ($scope, element, attrs) {
            
            element.bind("keydown keypress", function (event) {
                var previous = $scope.listIndex,
                    step = 1;

                /* Exit intro on any key press */
                if ($scope.playingIntro) {
                    $scope.$broadcast('introExit');
                    event.preventDefault();
                    return;
                }

                switch (event.which) {
                    case xFe.settings.navigation.listPageUp:
                        step = $scope.gameListLength;
                    case xFe.settings.navigation.listUp:
                        $scope.$broadcast('listChange', 'up', step);
                        event.preventDefault();
                        break;

                    case xFe.settings.navigation.listPageDown:
                        step = $scope.gameListLength;
                    case xFe.settings.navigation.listDown:
                        $scope.$broadcast('listChange', 'down', step);
                        event.preventDefault();
                        break;
                        
                    case xFe.settings.navigation.menuNext:
                        if ($scope.menuIndex !== $scope.menus.length - 1) {
                            $scope.menus[$scope.menuIndex++].listIndex = $scope.listIndex;
                            $scope.$broadcast('listReset');
                            $scope.media.menuSelect.play();
                        }
                        event.preventDefault();
                        break;
                    case xFe.settings.navigation.menuPrev:
                        if ($scope.menuIndex !== 0) {
                            $scope.menus[$scope.menuIndex--].listIndex = $scope.listIndex;
                            $scope.$broadcast('listReset');
                            $scope.media.menuSelect.play();
                        }
                        event.preventDefault();
                        break;
                    case xFe.settings.navigation.startGame:
                        $scope.$broadcast('startGame', $scope.game);
                        event.preventDefault();
                        break;
                    case xFe.settings.navigation.listEditToggle:
                        if ($scope.itemList == 'items') {
                            $scope.itemList = 'filteredItems';
                            /* get as close as possible to selected item in filtered list */
                            for (var i=0; i < $scope.menus[$scope.menuIndex].filteredItems.length; i++) {
                                if ($scope.menus[$scope.menuIndex].filteredItems[i].originalIndex >= $scope.listIndex) {
                                    $scope.listIndex = $scope.menus[$scope.menuIndex].filteredItems[i].index;
                                    break;
                                }
                            }
                            if (i == $scope.menus[$scope.menuIndex].filteredItems.length) {
                                $scope.listIndex = $scope.menus[$scope.menuIndex].filteredItems[$scope.menus[$scope.menuIndex].filteredItems.length - 1].index;
                            }
                        } else {
                            if ($scope.game) {
                                $scope.listIndex = $scope.game.originalIndex;                            
                            }
                            $scope.itemList = 'items';
                        }
                        $scope.$broadcast('updateGameList');
                        $scope.$apply();
                        event.preventDefault();
                        break;
                    case xFe.settings.navigation.listFilterToggle:
                        if ($scope.itemList == 'items') {
                            if ($scope.game.filtered) {
                                var i = $scope.menus[$scope.menuIndex].filters.indexOf($scope.game.name);
                                $scope.menus[$scope.menuIndex].filters.splice(i, 1);
                            } else {
                                $scope.menus[$scope.menuIndex].filters.push($scope.game.name);
                            }
                            $scope.game.filtered = !$scope.game.filtered;
                            // Save Filters
                            var menuFilters = {};
                            angular.forEach($scope.menus, function(menu, index) {
                                menuFilters[menu.name] = menu.filters;
                            });
                            window.postMessage(angular.extend({filters: menuFilters}, {xm_method: 'save'}), "*");
                            // Update filtered item list
                            $scope.menus[$scope.menuIndex].filteredItems = [];
                            var filterIndex = 0;
                            angular.forEach($scope.menus[$scope.menuIndex].items, function(game, listIndex){
                                game.filtered = true;
                                if ($scope.menus[$scope.menuIndex].filters.indexOf(game.name) == -1) {
                                    game.filtered = false;
                                    $scope.menus[$scope.menuIndex].filteredItems.push(angular.extend({}, game, {index: filterIndex++, originalIndex: game.index}));
                                }
                            });
                        }
                        $scope.$apply();
                        event.preventDefault();
                        break;
                    case xFe.settings.navigation.listEditName:
                        if ($scope.itemList == 'items') {
                            var updatedName = window.prompt('Update the displayed name', $scope.game.displayName);
                            if (updatedName != null) {
                                var displayNames = {},
                                    obj = {displayName: updatedName};
                                $scope.menus[$scope.menuIndex].items[$scope.game.index].displayName = updatedName;
                                $scope.menus[$scope.menuIndex].displayNames[$scope.game.name] = obj;
                                $scope.$apply();
                                angular.forEach($scope.menus, function(menu, index) {
                                    displayNames[menu.name] = menu.displayNames;
                                });
                                window.postMessage(angular.extend({displayNames: displayNames}, {xm_method: 'save'}), "*");
                            }
                        }
                        break;
                }
            });
        };
    })
    
    /* Handlers for displaying either video or img snaps based on error events */
    .directive('errImg', function() {
          return {
            link: function($scope, element, attrs) {
              element.bind('error', function() {
                element.attr('src', attrs.errImg);
              });
            }
          }
    })
    .directive('errVid', function() {
          return {
            link: function($scope, element, attrs) {
              element.bind('error', function() {
                document.querySelectorAll('#game-detail img')[0].style.display = 'block';
              });
            }
          }
    });
