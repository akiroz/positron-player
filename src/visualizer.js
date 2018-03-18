
class Visualizer {
  constructor({ audioCtx, canvas }) {
    this.visualizer = document.querySelector(canvas);
    this.visualizer.width = 1000;
    this.visualizer.height = 50;
    this.ctx = this.visualizer.getContext('2d');
    this.ctx.strokeStyle = "#87CEEB";
    this.ctx.lineWidth = "2";
    this.analyzer = audioCtx.createAnalyser();
    this.analyzer.fftSize = 1024;
    this.fft = new Float32Array(this.analyzer.frequencyBinCount);
    this.render();
  }
  render() {
    this.analyzer.getFloatFrequencyData(this.fft);
    this.ctx.clearRect(0,0,1000,50);
    this.ctx.beginPath();
    for(var i = 0; i < this.fft.length; i++) {
      var x = Math.log(i+1)*165;
      var y = -this.fft[i]*0.5-10;
      if(i === 0) this.ctx.moveTo(x,y);
      else this.ctx.lineTo(x,y);
    }
    this.ctx.stroke();
    window.requestAnimationFrame(this.render.bind(this));
  }
}

module.exports = Visualizer;
