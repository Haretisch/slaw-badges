const system = getSystem();

let enableBackground = document.getElementById('enableCoatOfArms');
let enableNewTabs = document.getElementById('enableNewTabs');

system.storage.sync.get('slaw_enableCoatOfArms', data => {
  enableBackground.checked = ('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true;
});
system.storage.sync.get('slaw_enableNewTabs', data => {
  enableNewTabs.checked = ('slaw_enableNewTabs' in data) ? data.slaw_enableNewTabs : true;
});

enableBackground.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableCoatOfArms: checked}, () => {
    system.tabs.query({active: true, currentWindow: true}, tabs => {
      system.tabs.sendMessage(tabs[0].id, {action: "toggleCoatOfArms", display: checked});
    })
  })
}
enableNewTabs.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableNewTabs: checked});
}
