export class DatePicker {
    constructor(container, initialDate, label) {
      this.container = container;
      this.date = initialDate || new Date();
      this.label = label;
      this.isVisible = false;
      
      this.render();
      this.attachEventListeners();
    }
  
    render() {
      console.log('DatePicker render called');  // Add this line
      this.container.innerHTML = `
          <div class="date-picker-container">
            <label class="date-label">${this.label}</label>
            <input 
              type="text" 
              class="input-field date-input" 
              readonly 
              value="${this.formatDate(this.date)}"
            >
            <div class="calendar-popup" style="display: none;">
              <div class="calendar-header">
                <button class="calendar-nav prev-month">&lt;</button>
                <span class="current-month"></span>
                <button class="calendar-nav next-month">&gt;</button>
              </div>
              <div class="calendar-grid">
                <div class="calendar-days">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>
                <div class="calendar-dates"></div>
              </div>
            </div>
          </div>
      `;
  
      this.input = this.container.querySelector('.date-input');
      this.popup = this.container.querySelector('.calendar-popup');
      this.monthDisplay = this.container.querySelector('.current-month');
      this.datesGrid = this.container.querySelector('.calendar-dates');
      
      this.updateCalendar();
    }
  
    attachEventListeners() {
      this.input.addEventListener('click', () => this.toggleCalendar());
      
      this.container.querySelector('.prev-month')
        .addEventListener('click', () => this.changeMonth(-1));
      
      this.container.querySelector('.next-month')
        .addEventListener('click', () => this.changeMonth(1));
  
      // Close calendar when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target) && this.isVisible) {
          this.hideCalendar();
        }
      });
    }
  
    updateCalendar() {
      const year = this.date.getFullYear();
      const month = this.date.getMonth();
      
      this.monthDisplay.textContent = `${this.getMonthName(month)} ${year}`;
      
      // Clear existing dates
      this.datesGrid.innerHTML = '';
      
      // Get first day of month and total days
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Add empty cells for days before first of month
      for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        this.datesGrid.appendChild(this.createDateCell(''));
      }
      
      // Add dates
      for (let i = 1; i <= daysInMonth; i++) {
        const cell = this.createDateCell(i);
        if (this.isCurrentDate(i)) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', () => this.selectDate(i));
        this.datesGrid.appendChild(cell);
      }
    }
  
    createDateCell(content) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-date');
      cell.textContent = content;
      
      // Add today class if this is today's date
      if (content && 
          this.date.getFullYear() === new Date().getFullYear() &&
          this.date.getMonth() === new Date().getMonth() &&
          content === new Date().getDate()) {
          cell.classList.add('today');
      }
      
      return cell;
    }
  
    selectDate(day) {
      this.date.setDate(day);
      this.input.value = this.formatDate(this.date);
      this.hideCalendar();
      this.updateCalendar();
      
      // Dispatch change event
      this.container.dispatchEvent(new CustomEvent('datechange', {
        detail: { date: new Date(this.date) }
      }));
    }
  
    changeMonth(delta) {
      this.date.setMonth(this.date.getMonth() + delta);
      this.updateCalendar();
    }
  
    toggleCalendar() {
      this.isVisible ? this.hideCalendar() : this.showCalendar();
    }
  
    showCalendar() {
      this.popup.style.display = 'block';
      this.isVisible = true;
    }
  
    hideCalendar() {
      this.popup.style.display = 'none';
      this.isVisible = false;
    }
  
    formatDate(date) {
      return date.toISOString().split('T')[0];
    }
  
    getMonthName(month) {
      return new Date(2000, month).toLocaleString('default', { month: 'long' });
    }
  
    isCurrentDate(day) {
      return day === this.date.getDate();
    }
  
    getDate() {
      return new Date(this.date);
    }
  }