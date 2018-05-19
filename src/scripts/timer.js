class Timer {
  constructor (duration, granularity) {
    this.duration = duration;
    this.granularity = granularity || 1000;
    this.tickFunctions = [];
    this.endFunctions = [];
    this.running = false;
    this.startTime;
  }

  start() {
    if(this.running) return;

    this.running = true;
    this.startTime = Date.now();
    let that = this, diff, obj;

    (function timer(){
      diff = that.duration - (((Date.now() - that.startTime) / 1000) | 0);

      if (diff > 0) {
        that.timeout = setTimeout(timer, that.granularity);
      } else {
        diff = 0;
        that.stop();
      }

      obj = that.parse(diff);
      that.tickFunctions.forEach(func => {
        func.call(this, obj.minutes, obj.seconds);
      }, that);
    }());
  }

  stop() {
    if(this.running){
      this.running = false;
      this.duration = 0;
      this.endFunctions.forEach(func => {
        func.call(this);
      }, this);
    }
  }

  onTick(func) {
    if(typeof func === 'function') {
      this.tickFunctions.push(func);
    }

    return this;
  }

  onEnd(func) {
    if(typeof func === 'function') {
      this.endFunctions.push(func);
    }

    return this;
  }

  updateDuration(newDuration) {
    if(this.running) this.startTime = Date.now();
    this.duration = newDuration;

    return this;
  }

  parse(seconds) {
    return {
      minutes: (seconds / 60) | 0,
      seconds: (seconds % 60) | 0,
    }
  }
}
