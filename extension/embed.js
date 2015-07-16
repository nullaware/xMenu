//Handle window messages as client API calls - pass straight through to background.js
window.addEventListener("message", function(event) {
    if (event.data && event.data.xm_method) {
        chrome.runtime.sendMessage(event.data, function(response) {
            window.postMessage(response, "*");
        });
    }
},  false);

//Add click handler for xMenu launch links
window.addEventListener("load", function() {
    document.body.addEventListener("click", function(event) {
        if (event.srcElement.classList.contains('xmenu-launch')) {
            event.preventDefault();
            event.srcElement.dataset.xm_method = "launch";
            chrome.runtime.sendMessage(event.srcElement.dataset);
        }
    });
});
