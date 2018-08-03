// manifest.json's `run_at` declaration acts as a DOM ready listener
//  when set to "document_end" so the whole script in run only then
const system = getSystem();
let context = getContext();
let CHAT_ONLY = context === 'chat';
let badges, chat, commands, emotes, points, users, features, newApiSocket, events;

system.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(sender.id === system.runtime.id) {
    switch(message.action) {
      case 'contextChange':
        console.log('change');
        context = message.context;
        CHAT_ONLY = context === 'chat';
        if(context){
          start();
        } else {
          stop();
        }
      break;
      default:
        if(typeof features.find(message.action) === 'function') {
          let f = features.find(message.action.split('.')[0]);
          features.find(message.action).bind(f)(message);
        }
    }
  }
});

function start() {
  if(!newApiSocket) newApiSocket = new NewApiSocket();
  if(!chat) chat = new Chat();
  if(!users) users = new Users();
  if(!emotes) emotes = new Emotes();
  if(!badges) badges = new Badges();
  if(!points) points = new Points(newApiSocket);
  if(!commands) commands = new Commands();
  if (!events) events = new Events(newApiSocket, points);
  features = {badges, chat, commands, emotes, points, users, newApiSocket, events};

  chat.observeChat();
  points.initialize().then(() => events.initialize(points));
  commands.initialize();
  emotes.initialize();
}

function stop() {
  //stop twich observation
  twitchObserver.disconnect();
  //stop chat observation
  chat.disconnect();
  //stop points fetching
  points.disconnect();
  //unregister commands
  commands.disconnect();
}

if(context) {
  start();
}
