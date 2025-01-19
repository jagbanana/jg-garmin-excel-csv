import { DatePicker } from './components/datePicker.js';
import { ProgressBar } from './components/progressBar.js';

class App {
  constructor() {
    this.initializeElements();
    this.initializeDatePickers();
    this.attachEventListeners();
    this.loadStoredCredentials();
  }

  initializeElements() {
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.syncButton = document.getElementById('syncButton');
    this.statusContainer = document.getElementById('status');
    this.progressBar = new ProgressBar(this.statusContainer);
    this.outputPathInput = document.getElementById('outputPath');
    this.browseButton = document.getElementById('browseButton');
    
    // Set default path
    this.outputPathInput.value = 'My Documents';
  }

  initializeDatePickers() {
    // Initialize with current date and 7 days ago
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.startDatePicker = new DatePicker(
      document.getElementById('startDatePicker'),
      weekAgo,
      'Start Date'
    );

    this.endDatePicker = new DatePicker(
      document.getElementById('endDatePicker'),
      today,
      'End Date'
    );
  }

  attachEventListeners() {
    this.syncButton.addEventListener('click', () => this.handleSync());
    this.browseButton.addEventListener('click', () => this.handleBrowse());
  }

  async loadStoredCredentials() {
    try {
      const credentials = await window.api.getStoredCredentials();
      if (credentials) {
        this.emailInput.value = credentials.email || '';
        this.passwordInput.value = credentials.password || '';
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }

  async handleBrowse() {
    try {
      const selectedPath = await window.api.selectDirectory();
      if (selectedPath) {
        this.outputPathInput.value = selectedPath;
      }
    } catch (error) {
      this.updateStatus('Error selecting directory', 'error');
    }
  }

  async handleSync() {
    if (!this.validateForm()) {
      return;
    }
  
    try {
      this.setLoading(true);
      this.updateStatus('Connecting to backend...', 'info');
      
      const data = {
        email: this.emailInput.value,
        password: this.passwordInput.value,
        startDate: this.startDatePicker.getDate().toISOString().split('T')[0],
        endDate: this.endDatePicker.getDate().toISOString().split('T')[0],
        outputDir: this.outputPathInput.value
      };
  
      console.log('Sending data:', data);
      const result = await window.api.syncData(data);
      this.updateStatus('Data downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Sync error:', error);
      this.updateStatus(`Error: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  validateForm() {
    if (!this.emailInput.value || !this.passwordInput.value) {
      this.updateStatus('Please enter email and password', 'error');
      return false;
    }

    const startDate = this.startDatePicker.getDate();
    const endDate = this.endDatePicker.getDate();
    
    if (startDate > endDate) {
      this.updateStatus('Start date must be before end date', 'error');
      return false;
    }

    if (!this.outputPathInput.value) {
      this.updateStatus('Please select an output directory', 'error');
      return false;
    }

    return true;
  }

  setLoading(isLoading) {
    this.syncButton.disabled = isLoading;
    this.syncButton.textContent = isLoading ? 'Downloading...' : 'Download Garmin Data';
    if (isLoading) {
      this.progressBar.show();
    } else {
      this.progressBar.hide();
    }
  }

  updateStatus(message, type = 'info') {
    this.statusContainer.innerHTML = `<div class="status-message ${type}">${message}</div>`;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});