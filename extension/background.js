var xLaunch,
    xFile,
    xMenuConfigDefault = {
        "apps": {
            "mame": {
                "bin": "c:/mame/mame64.exe",
                "options": "{name} -rompath c:/mame/roms -skip_gameinfo",
                "props": {
                    "snap": "c:/mame/snaps/{name}.png",
                    "video": "c:/mame/videos/{name}.mp4"
                }
            },
        },
        "menus": [
            {
                "name": "mame",
                "app": "mame",
                "items": "c:/xmenu/games.xml",
                "color": "#3885b3"
            },
        ]
    },
    xMenuDataDefault = {
        "filters": {},   //stores names of games removed from lists
        "displayNames": {}     //stores updated names of games
    };
    
// Append plugins to background page
window.addEventListener("load", function() {
    xLaunch = document.createElement('embed');
    xLaunch.type = 'application/x-simplegetplugin';
    document.body.appendChild(xLaunch);

    xFile = document.createElement("embed");
    xFile.setAttribute("type", "application/x-npapi-file-io");
    document.body.appendChild(xFile);
});

// Listen for API calls from client
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
        sendResponse(xMenuAPI[request.xm_method](request, sender));
    }
);

// Set default configuration and data on first run
if (typeof localStorage['xmenu-config'] == 'undefined') {
    localStorage['xmenu-config'] = JSON.stringify(xMenuConfigDefault, null, "  ");
}
if (typeof localStorage['xmenu-data'] == 'undefined') {
    localStorage['xmenu-data'] = JSON.stringify(xMenuDataDefault, null, "  ");
}

/* XML helper functions */
var XML = {
    "parse": function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    },
    "toJson": function(node) {
        if (!node) return null;
        var txt = '', obj = null, att = null,
            nt = node.nodeType, nn = node.nodeName,
            nv = node.nodeValue || ''; 
        if (node.hasChildNodes) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var cn = node.childNodes[i],
                    cnv = node.childNodes[i].nodeValue || '';

                if (cn.nodeType == 8) {
                    continue;
                } else if (cn.nodeType == 3 || cn.nodeType == 4 || !cn.nodeName) {
                    if (cnv.match(/^\s+/, ''))  continue;
                    txt += cnv.replace(/^\s+/, '').replace(/\s+$/, '');
                } else {
                    obj = obj || {};
                    if (obj[cn.nodeName]) {
                        if (typeof (obj[cn.nodeName].push) == "undefined") {
                            var old = obj[cn.nodeName];
                            obj[cn.nodeName] = [];
                            obj[cn.nodeName].push(old);
                        }
                        obj[cn.nodeName].push(XML.toJson(node.childNodes[i]));
                    } else {
                        obj[cn.nodeName] = XML.toJson(node.childNodes[i]);
                    }
                }
            }
        }
        if (node.attributes && node.attributes.length > 0) {
            att = {}; obj = obj || {};
            for (var j = 0; j < node.attributes.length; j++) {        
                obj[node.attributes[j].name] = node.attributes[j].value;
            }
        }
        return obj || txt;
    }
};

/* API client functions */
var xMenuAPI = {

    /* Load the config file and menu lists */
    "init": function(options) {
        var config = JSON.parse(localStorage['xmenu-config']),
            data = JSON.parse(localStorage['xmenu-data']),
            menus = [], menu, items, app, prop, games, i, j, warnings = [],
            xmlhttp, result, obj,
            filteredItems, filterIndex,
            response = {
                type: 'xm_ready',
                success: false,
                msg: ''
            },
            clone = function (obj) {
                if(obj == null || typeof(obj) != 'object')
                    return obj;
                var temp = obj.constructor();
                for(var key in obj)
                    temp[key] = clone(obj[key]);
                return temp;
            };

        if (!config.hasOwnProperty('apps')) {
            response.msg = 'Invalid xmenu configuration - missing apps';
            return response;
        }
        
        if (!config.hasOwnProperty('menus')) {
            response.msg = 'Invalid xMenu configuration - missing menus';
            return response;
        }
        
        /* Check apps are valid */
        for (i in config.apps) {
            app = config.apps[i];
            if (!app.hasOwnProperty('bin')) {
                warnings.push({msg: "App has no property 'bin'", app: app});
                continue;
            } else if (!xFile.fileExists(app.bin)) {
                warnings.push({msg: "App executable does not exist - " + app.bin, app: app});
                continue;
            }
        }

        for (i in config.menus) {
            menu = config.menus[i];
            if (!menu.hasOwnProperty('items')) {
                warnings.push({msg: "Menu has no items property", menu: menu});
                continue;
            }

            if (!xFile.fileExists(menu.items)) {
                //Try as URL
                try {
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", menu.items, false);
                    xmlhttp.send(null);
                    if (xmlhttp.status == 200) {
                        result = xmlhttp.responseXML;
                        games = XML.toJson(result).menu.game;
                    } else {
                        warnings.push({msg: "Invalid menu items setting - " + menu.items, menu: menu});
                        continue;
                    }
                } catch (err) {
                    warnings.push({msg: "Invalid menu items setting (file does not exist or possibly CORS related) - " + menu.items, menu: menu});
                    continue;
                }
            } else {
                games = XML.toJson(XML.parse(xFile.getTextFile(menu.items))).menu.game;
            }
            
            if (!(games instanceof Array)) {
                games = [games];
            }
            
            menu.index = i;
            menu.filters = menu.name in data.filters ? data.filters[menu.name] : [];
            menu.displayNames = menu.name in data.displayNames ? data.displayNames[menu.name] : {};
            menu.listIndex = 0;

            items = [];
            for (j = 0; j < games.length; j++) {
                app = games[j].app || menu.app;
                if (!config.apps.hasOwnProperty(app)) continue;
                if (config.apps[app].props) {
                    for (prop in config.apps[app].props) {
                        games[j][prop] = config.apps[app].props[prop].replace(/\{(\w+)\}/g, function(a, b) {
                            return games[j][b] ? games[j][b]: '';
                        });
                    }
                }
                games[j].app = app;
                games[j].menuIndex = i;

                /* Update displayNames with stored data */
                games[j].displayName = games[j].description;
                if (menu.displayNames.hasOwnProperty(games[j].name)) {
                    games[j].displayName = menu.displayNames[games[j].name].displayName;
                }

                items.push(games[j]);
            }
            
            /* Sort lists if requested */
            if (options.listSort) {
                items.sort(function(a, b) {
                    if(a.displayName < b.displayName) return -1;
                    if(a.displayName > b.displayName) return 1;
                    return 0;
                });
            }
            
            /* Generate filtered list */
            filteredItems = [];
            filterIndex = 0;
            for (j = 0; j < items.length; j++) {
                items[j].index = j;
                items[j].filtered = true;
                if (menu.filters.indexOf(items[j].name) == -1) {
                    items[j].filtered = false;
                    obj = clone(items[j]);
                    obj.index = filterIndex++;
                    obj.originalIndex = j;
                    filteredItems.push(obj);
                }
            }
            
            menu.items = items;
            menu.filteredItems = filteredItems;
            menus.push(menu);
        };
        response.success = true;
        response.warnings = warnings;
        response.menus = menus;
        response.data = JSON.parse(localStorage['xmenu-data']);
        return response;
    },

    /* Launch the passed app */
    "launch": function(req) {
        var config = JSON.parse(localStorage['xmenu-config']),
            app, opt = '',
            response = {
                type: 'xm_launch',
                success: false,
                msg: ''
            };
        
        if (!config.apps.hasOwnProperty(req.app)) {
            response.msg = 'App does not exist:' + req.app;
            return response;
        }
        app = config.apps[req.app];
        if (app.options) {
            opt = app.options.replace(/\{(\w+)\}/g, function(a, b) {
                //TODO security check req[b]
                return req[b] ? req[b]: '';
            });
        }
        if (xFile.fileExists(app.bin)) {
            xLaunch.SimpleGetPlugin().callApplication(app.bin, opt);
            response.success = true;
            response.msg = 'App launched: ' + app.bin + ' ' + opt;
            return response;
        } else {
            response.msg = 'App executable does not exist: ' + app.bin;
            return response;
        }

    },
    
    /* Save passed data object */
    "save": function(data) {
        var extend = function (a, b) {
            for(var key in b)
                if(b.hasOwnProperty(key))
                    a[key] = b[key];
            return a;
        },
        current = JSON.parse(localStorage['xmenu-data']);
        delete data.xm_method;
        data = extend(current, data);
        localStorage["xmenu-data"] = JSON.stringify(data, null, "  ");
    }
};
