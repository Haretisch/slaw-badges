class SlawAPI{
  static config() {
    return {
      auth: '',
      address: 'https://mighty-citadel-48930.herokuapp.com/api/grizzly',
      version: 'v1',
    };
  }

  static fetch(req) {
    return fetch(req).then(res => {
      const contentType = res.headers.get('content-type');
      if(res.ok && contentType && contentType.includes('application/json')){
        return res.json();
      }
    });
  }

  static get(endpoint, data) {
    return SlawAPI.fetch(
      new Request(
        SlawAPI.config().address + endpoint + data.toQueryString(),
        {method: 'GET', mode: 'cors'}
      )
    );
  }

  static post(enpoint, body) {
    return SlawAPI.fetch(
      new Request(
        SlawAPI.config().address + endpoint,
        {method: 'POST', mode: 'cors', body}
      )
    );
  }

  static getCultist(username) {
    return SlawAPI.get('/followed', {name: username.toLowerCase()});
  }

  static getLeaderboard() {
    return SlawAPI.get('/housestats', {name: 'undefined'});
  }

  static getPoints(username) {
    //Waiting for points endpoint
    return SlawAPI.getCultist(username);
  }

  static getGambleSetting(username) {
    return SlawAPI.get('/gamble', {name: username.toLowerCase()});
  }

  static setGambleSetting(username, setting) {
    return SlawAPI.post('/gamble', {user: username.toLowerCase(), gamble: setting});
  }
}
