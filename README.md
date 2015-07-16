# xMenu
MAME Frontend via chrome extension

**Note**: This plugin uses NPAPI which will not be supported in Chrome after version 45. Could be rewritten to use the new Messaging API but I have no need for it.

I created this back in 2013 as a proof of concept and to learn some Angular.js. Since then I built a cabinet and use this as the frontend. It runs on Linux Mint with Chrome starting on boot in Kiosk Mode. Althought NPAPI is being removed from Chrome it's a non-issue for me as I am not planning on updating the software in my cabinet. I believe it could be rewritten but perhaps that can be a project for someone else. Firefox would also be a viable option as it is propbably going to keep NPAPI for some time.

The supplied template is very basic and is intended to show the basics of what is possible.

###Basic Usage Instructions (assuming you have MAME setup)

1. Download this repository and save to an appropriate location.
2. If using Chrome later than version 42 you need to enable NPAPI. See https://support.google.com/chrome/answer/6213033?hl=en
3. Open chrome://extensions/ and make sure "Developer Mode" is ticked.
4. Click "Load unpacked extension..." and navigate to the extension folder in this repository.
5. If you have the correct folder you will be prompted to add the xMenu plugin.
6. Once added click the "Options" link for the plugin and alter the configuration to your system.
7. Setup your XML game list (hyperspin supported format). Plenty of tools out there to generate a list based on your ROM set or use your existing hyperspin xml files. I used https://www.waste.org/~winkles/ROMLister/
8. Open the template/index.html and you should be able to play your MAME roms direct from Chrome.

I just quickly followed these steps to install on Windows 7 and everything worked fine. There is an annoying pop-up that appears every time Chrome is started mentioning that "Developer Mode" is enabled but I don't think that can be avoided. I also notice in Windows that when a game is launched there is a boxed window that appears briefly. Not sure what that is about but I dont see that on Linux.

Additional Info:
* Various template settings can be modified in templates/js/settings.js
* Any executable can be launched. It just needs to be setup as an "app" in the xMenu configuration. For instance, in my cabinet I have a shutdown script set up as an additional app and it can be called directly from the frontend.
* Supports multiple menus which can be used for different categories/emulators.
* You can add additional properties to the games in the xml file(s) to override the configuration settings.
* The supplied template has capabilities to edit the displayed game names.
* It's possible this could be setup so resources (snaps/videos) are retrieved from a web server.

This plugin uses components from Simple-get chrome extension - http://code.google.com/p/simple-get/

 


 
