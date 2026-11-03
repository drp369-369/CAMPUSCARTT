// public/js/main.js - CampusCart Core UI & Interaction Controller
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

document.addEventListener('DOMContentLoaded', () => {
  const config = window.CampusCartConfig;
  let activeCategory = 'all';
  let searchQuery = '';

  // Elements
  const categoriesContainer = document.getElementById('categories-container');
  const productsGrid = document.getElementById('products-grid');
  const filterTabsContainer = document.getElementById('filter-tabs');
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const headerSearchInput = document.getElementById('header-search-input');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const modalOverlay = document.getElementById('product-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBody = document.getElementById('modal-body-content');

  // Render Categories Explorer
  function renderCategories() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = config.categories.map(cat => `
      <div class="category-card" data-category="${cat.id}">
        <div class="category-icon-wrapper" style="background-color: ${cat.color}">
          <span>${cat.icon}</span>
        </div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.count} listings</div>
      </div>
    `).join('');

    // Attach click listeners to category cards
    categoriesContainer.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-category');
        setCategoryFilter(catId);
        scrollToSection('featured-listings');
      });
    });
  }

  // Render Category Filter Tabs
  function renderFilterTabs() {
    if (!filterTabsContainer) return;
    const tabs = [{ id: 'all', name: 'All Categories' }, ...config.categories];
    filterTabsContainer.innerHTML = tabs.map(tab => `
      <button class="filter-tab ${activeCategory === tab.id ? 'active' : ''}" data-cat="${tab.id}">
        ${tab.name}
      </button>
    `).join('');

    filterTabsContainer.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        setCategoryFilter(cat);
      });
    });
  }

  // Filter listings based on category & search text
  function getFilteredProducts() {
    return config.seedProducts.filter(item => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchQuery = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }

  // Render Product Cards
  function renderProducts() {
    if (!productsGrid) return;
    const items = getFilteredProducts();

    if (items.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #ffffff; border: 1px dashed var(--border); border-radius: var(--radius-xl);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No campus listings found</h3>
          <p style="margin-bottom: 1.5rem;">Try adjusting your search terms or view all categories.</p>
          <button class="btn btn-secondary" id="reset-filters-btn">Clear Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'all';
          searchQuery = '';
          if (heroSearchInput) heroSearchInput.value = '';
          if (headerSearchInput) headerSearchInput.value = '';
          renderFilterTabs();
          renderProducts();
        });
      }
      return;
    }

    productsGrid.innerHTML = items.map(product => {
      const discount = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0;

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="card-image-box">
            <span class="card-badge">${escapeHtml(product.location)}</span>
            <span class="card-condition-badge">${escapeHtml(product.condition)}</span>
            <img src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy">
          </div>
          <div class="card-content">
            <div class="card-category">${getCategoryName(product.category)}</div>
            <h3 class="card-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
            <div class="card-price-row">
              <span class="current-price">${config.currencySymbol}${product.price}</span>
              ${product.originalPrice ? `<span class="original-price">${config.currencySymbol}${product.originalPrice}</span>` : ''}
              ${discount > 0 ? `<span class="discount-tag">${discount}% OFF</span>` : ''}
            </div>
            <div class="card-footer">
              <div class="seller-info">
                <div class="seller-avatar">${product.seller.avatar}</div>
                <span>${escapeHtml(product.seller.name)}</span>
              </div>
              <span class="posted-time">${escapeHtml(product.postedAgo)}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card click handlers for details modal
    productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openProductModal(id);
      });
    });
  }

  function getCategoryName(id) {
    const found = config.categories.find(c => c.id === id);
    return found ? found.name : id;
  }

  function setCategoryFilter(catId) {
    activeCategory = catId;
    renderFilterTabs();
    renderProducts();
  }

  // Open Product Details Modal
  function openProductModal(productId) {
    const product = config.seedProducts.find(p => p.id === productId);
    if (!product || !modalBody || !modalOverlay) return;

    const discount = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 0;

    modalBody.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
        <div style="border-radius: var(--radius-lg); overflow: hidden; height: 260px; background: #e2e8f0; position: relative;">
          <img src="${product.image}" alt="${escapeHtml(product.title)}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; top: 1rem; left: 1rem; background: rgba(15, 23, 42, 0.85); color: #fff; padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 700;">
            ${escapeHtml(product.condition)} Condition
          </span>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 0.25rem;">
            ${getCategoryName(product.category)}
          </div>
          <h2 style="font-size: 1.4rem; color: var(--secondary); margin-bottom: 0.75rem;">
            ${escapeHtml(product.title)}
          </h2>
          <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.25rem;">
            <span style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-heading); color: var(--secondary);">
              ${config.currencySymbol}${product.price}
            </span>
            ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--text-light);">${config.currencySymbol}${product.originalPrice}</span>` : ''}
            ${discount > 0 ? `<span style="background: var(--accent-light); color: var(--accent); font-weight: 700; font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px;">Save ${discount}%</span>` : ''}
          </div>
          <div style="background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.9rem; margin-bottom: 0.35rem; color: var(--secondary);">Item Description</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${escapeHtml(product.description)}</p>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                ${product.seller.avatar}
              </div>
              <div>
                <div style="font-weight: 700; font-size: 0.95rem; color: var(--secondary);">${escapeHtml(product.seller.name)}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(product.seller.branch)} • <span style="color: var(--accent); font-weight: 600;">Verified Student</span></div>
              </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: right;">
              <div>📍 ${escapeHtml(product.location)}</div>
              <div>🕒 ${escapeHtml(product.postedAgo)}</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" style="flex: 1;" id="modal-contact-seller-btn">
              💬 Contact Seller
            </button>
            <button class="btn btn-secondary" style="flex: 1;" id="modal-meetup-btn">
              📍 Arrange Campus Meetup
            </button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');

    const contactBtn = document.getElementById('modal-contact-seller-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        alert(`Direct chat with ${product.seller.name} (${product.seller.branch}) will open in Phase 2.\n\nMeetup location proposed: ${product.location}.`);
      });
    }

    const meetupBtn = document.getElementById('modal-meetup-btn');
    if (meetupBtn) {
      meetupBtn.addEventListener('click', () => {
        alert(`Safety Tip: Always arrange meetups at public campus spots like Central Library or Campus Cafeteria during daylight hours.`);
      });
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Keyboard shortcut ESC to close modal, Ctrl+K to search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (headerSearchInput) {
        headerSearchInput.focus();
      } else if (heroSearchInput) {
        heroSearchInput.focus();
      }
    }
  });

  // Search event listeners
  function executeSearch(query) {
    searchQuery = query.trim();
    renderProducts();
    scrollToSection('featured-listings');
  }

  if (heroSearchBtn && heroSearchInput) {
    heroSearchBtn.addEventListener('click', () => {
      executeSearch(heroSearchInput.value);
    });
    heroSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeSearch(heroSearchInput.value);
    });
  }

  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer && closeDrawerBtn) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
    });
    closeDrawerBtn.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
    });

    // Close drawer when clicking any link inside the drawer
    mobileDrawer.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') && 
          !mobileDrawer.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
      }
    });
  }

  // Smooth scroll utility
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Action buttons
  const sellBtns = document.querySelectorAll('.action-sell-btn');
  sellBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Listing creation is scheduled for the next phase. You will be able to upload photos, set price and post directly with your student ID!');
    });
  });

  const loginBtns = document.querySelectorAll('.action-login-btn');
  loginBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Student Authentication & Registration will be connected in Phase 2.');
    });
  });

  // Helper function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // Initial Initialization
  renderCategories();
  renderFilterTabs();
  renderProducts();
});

