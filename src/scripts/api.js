class SlawAPI{
  static config() {
    return {
      auth: '',
      endpoint: 'https://mighty-citadel-48930.herokuapp.com/api/grizzly',
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

  static getCultist(username) {
    const endpoint = SlawAPI.config().endpoint;
    const req =  new Request(
      endpoint + '/followed?name=' + username.toLowerCase(),
      {method: 'GET', mode: 'cors'}
    );

    return SlawAPI.fetch(req);
  }

  static getLeaderboard() {
    const endpoint = SlawAPI.config().endpoint;
    const req = new Request(
      endpoint + '/housestats?name=undefined',
      {method: 'GET', mode: 'cors'}
    );

    return SlawAPI.fetch(req);
  }

  //Return points ??and title??
  static getPoints(username) {
    return this.getCultist(username);
  }
}
