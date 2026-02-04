// token2.cash - Gate Aggregator

(function() {
  'use strict';

  const GATES_URL = './gates.json';
  const gatesContainer = document.getElementById('gates-list');

  // Load and render gates
  async function loadGates() {
    showLoading();
    
    try {
      const response = await fetch(GATES_URL);
      if (!response.ok) throw new Error('Failed to load gates');
      
      const data = await response.json();
      renderGates(data.gates || []);
    } catch (error) {
      console.error('Error loading gates:', error);
      showError('Unable to load gates. Please try again later.');
    }
  }

  // Render gate cards
  function renderGates(gates) {
    if (!gates.length) {
      showEmpty();
      return;
    }

    gatesContainer.innerHTML = gates.map(gate => createGateCard(gate)).join('');
  }

  // Create gate card HTML
  function createGateCard(gate) {
    const modelsHtml = gate.models
      .map(model => `<span class="model-tag">${escapeHtml(model)}</span>`)
      .join('');

    const providersText = gate.providers
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(', ');

    return `
      <article class="gate-card">
        <div class="gate-header">
          <h3 class="gate-name">${escapeHtml(gate.name)}</h3>
          <span class="gate-markup">${escapeHtml(gate.markup)} markup</span>
        </div>
        
        <p class="gate-description">${escapeHtml(gate.description)}</p>
        
        <div class="gate-urls">
          <div class="gate-url">
            <span class="gate-url-label">Gate:</span>
            <a href="${escapeHtml(gate.url)}" target="_blank" rel="noopener">${escapeHtml(gate.url)}</a>
          </div>
          <div class="gate-url">
            <span class="gate-url-label">Mint:</span>
            <a href="${escapeHtml(gate.mint)}" target="_blank" rel="noopener">${escapeHtml(gate.mint)}</a>
          </div>
        </div>
        
        <div class="gate-providers">
          <div class="gate-providers-label">Via ${escapeHtml(providersText)}</div>
          <div class="gate-models">
            ${modelsHtml}
          </div>
        </div>
      </article>
    `;
  }

  // Loading state
  function showLoading() {
    gatesContainer.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading gates...</p>
      </div>
    `;
  }

  // Error state
  function showError(message) {
    gatesContainer.innerHTML = `
      <div class="error">
        <p>⚠️ ${escapeHtml(message)}</p>
      </div>
    `;
  }

  // Empty state
  function showEmpty() {
    gatesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No gates available yet. Be the first to list yours!</p>
      </div>
    `;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', loadGates);
})();
