export class ProgressBar {
    constructor(container) {
      this.container = container;
      this.render();
    }
  
    render() {
      this.element = document.createElement('div');
      this.element.classList.add('progress-bar');
      this.element.style.display = 'none';
      
      this.fill = document.createElement('div');
      this.fill.classList.add('progress-bar-fill');
      this.fill.style.width = '0%';
      
      this.element.appendChild(this.fill);
      this.container.appendChild(this.element);
    }
  
    show() {
      this.element.style.display = 'block';
      this.startIndeterminate();
    }
  
    hide() {
      this.element.style.display = 'none';
      this.stopIndeterminate();
    }
  
    startIndeterminate() {
      let progress = 0;
      const increment = 2;
      const maxWidth = 90; // Max width percentage for indeterminate state
  
      this.animationInterval = setInterval(() => {
        progress += increment;
        if (progress >= maxWidth) {
          progress = 0;
        }
        this.fill.style.width = `${progress}%`;
      }, 100);
    }
  
    stopIndeterminate() {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
      this.fill.style.width = '0%';
    }
  
    setProgress(percent) {
      this.stopIndeterminate();
      this.fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }