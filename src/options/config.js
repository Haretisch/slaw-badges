const system = getSystem();

let enableBackground = document.getElementById('enableCoatOfArms');
let enableNewTabs = document.getElementById('enableNewTabs');
let enableChubTracker = document.getElementById('enableChubTracker');

system.storage.sync.get('slaw_enableCoatOfArms', data => {
  enableBackground.checked = ('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true;
});
system.storage.sync.get('slaw_enableNewTabs', data => {
  enableNewTabs.checked = ('slaw_enableNewTabs' in data) ? data.slaw_enableNewTabs : true;
});
system.storage.sync.get('slaw_enableChubTracker', data => {
  enableChubTracker.checked = ('slaw_enableChubTracker' in data) ? data.slaw_enableChubTracker : true;
});

enableBackground.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableCoatOfArms: checked}, () => {
    system.tabs.query({active: true, currentWindow: true}, tabs => {
      system.tabs.sendMessage(tabs[0].id, {action: "points.toggleCoatOfArms", display: checked});
    })
  })
}
enableNewTabs.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableNewTabs: checked});
}
enableChubTracker.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableChubTracker: checked});
}