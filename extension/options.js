// Saves config to localStorage.
function save_config() {
  var config = document.getElementById('xmenu-config').value,
      status = document.getElementById("status"),
      msg;
  
  try {
    JSON.parse(config);
    localStorage["xmenu-config"] = config;
    msg = 'Config Saved.';
  } catch (e) {
    msg = 'Save Failed. Invalid JSON.';
  }
  status.innerHTML = msg;
  setTimeout(function() {
    status.innerHTML = "";
  }, 1500);
}

// Restores select box state to saved value from localStorage.
function restore_config() {
  var config = localStorage["xmenu-config"];
  if (!config) {
    return;
  }
  document.getElementById('xmenu-config').value = config;
  document.getElementById('xmenu-data').value = localStorage["xmenu-data"];
}

document.addEventListener('DOMContentLoaded', restore_config);
document.querySelector('#save').addEventListener('click', save_config);
