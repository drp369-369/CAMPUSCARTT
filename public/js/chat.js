// public/js/chat.js - In-App Student Chat & Safe Hand-off Coordinator
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

window.CampusCartChat = {
  activeProduct: null,
  drawerEl: null,

  init() {
    if (document.getElementById('campus-chat-drawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'campus-chat-drawer';
    drawer.className = 'chat-drawer';
    drawer.innerHTML = `
      <div class="chat-drawer-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="chat-avatar" id="chat-seller-avatar">AS</div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--secondary);" id="chat-seller-name">Seller Name</div>
            <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600;">● Online &bull; Verified Student</div>
          </div>
        </div>
        <button class="chat-close-btn" id="close-chat-btn" aria-label="Close Chat">&times;</button>
      </div>

      <!-- Item Context Strip -->
      <div class="chat-item-strip" id="chat-item-strip">
        <img id="chat-item-img" src="" alt="Item">
        <div style="flex: 1; min-width: 0;">
          <div id="chat-item-title" style="font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--secondary);">Item Title</div>
          <div id="chat-item-price" style="font-size: 0.9rem; font-weight: 800; color: var(--primary);">₹0</div>
        </div>
        <button class="btn btn-secondary btn-sm" id="chat-make-offer-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Make Offer</button>
      </div>

      <!-- Messages Thread -->
      <div class="chat-messages-container" id="chat-messages-list"></div>

      <!-- Quick Message Chips -->
      <div class="chat-quick-chips" id="chat-quick-chips">
        <button class="quick-chip" data-msg="Hi! Is this item still available?">👋 Still available?</button>
        <button class="quick-chip" data-msg="Can we meet at the Central Library today?">🏛️ Meet at Library?</button>
        <button class="quick-chip" data-msg="What is the final best price for this?">💰 Best price?</button>
        <button class="quick-chip" data-msg="Can I inspect the item before finalizing?">🔍 Inspect first?</button>
      </div>

      <!-- Message Input Bar -->
      <form class="chat-input-bar" id="chat-input-form">
        <input type="text" id="chat-text-input" placeholder="Type a message or campus question..." autocomplete="off">
        <button type="submit" class="chat-send-btn" aria-label="Send Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;

    // Attach event listeners
    document.getElementById('close-chat-btn').onclick = () => this.close();
    document.getElementById('chat-input-form').onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-text-input');
      const text = input.value.trim();
      if (text) {
        this.sendMessage(text, 'buyer');
        input.value = '';
      }
    };

    drawer.querySelectorAll('.quick-chip').forEach(btn => {
      btn.onclick = () => {
        const msg = btn.getAttribute('data-msg');
        this.sendMessage(msg, 'buyer');
      };
    });

    document.getElementById('chat-make-offer-btn').onclick = () => {
      this.promptOffer();
    };
  },

  open(product) {
    if (!window.CampusCartAuth || !window.CampusCartAuth.isAuthenticated()) {
      if (window.CampusCartToast) {
        window.CampusCartToast.warning('Sign In Required', 'Please sign in with your student account to contact sellers.');
      }
      setTimeout(() => {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }, 1000);
      return;
    }

    this.init();
    this.activeProduct = product;

    const sellerName = (product.seller && product.seller.name) ? product.seller.name : 'Campus Seller';
    const initials = sellerName.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('chat-seller-avatar').textContent = initials;
    document.getElementById('chat-seller-name').textContent = sellerName;
    document.getElementById('chat-item-title').textContent = product.title;
    document.getElementById('chat-item-price').textContent = `₹${product.price}`;
    document.getElementById('chat-item-img').src = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c';

    this.loadThread();
    this.drawerEl.classList.add('open');
  },

  close() {
    if (this.drawerEl) {
      this.drawerEl.classList.remove('open');
    }
  },

  getThreadStorageKey() {
    const user = window.CampusCartAuth.getUser();
    const prodId = this.activeProduct ? (this.activeProduct.id || this.activeProduct._id) : 'generic';
    const userId = user ? (user.id || user.userId || 'guest') : 'guest';
    return `campuscart_chat_${userId}_${prodId}`;
  },

  loadThread() {
    const list = document.getElementById('chat-messages-list');
    list.innerHTML = '';

    const key = this.getThreadStorageKey();
    let thread = [];
    try {
      thread = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      thread = [];
    }

    // Default intro message from seller if empty
    if (thread.length === 0) {
      const sellerName = (this.activeProduct.seller && this.activeProduct.seller.name) ? this.activeProduct.seller.name : 'Seller';
      thread.push({
        sender: 'seller',
        text: `Hey! Thanks for your interest in "${this.activeProduct.title}". I'm on campus today—feel free to message me to meet at ${this.activeProduct.location || 'the Library'}!`,
        time: 'Just now'
      });
      localStorage.setItem(key, JSON.stringify(thread));
    }

    thread.forEach(msg => {
      this.appendMessageEl(msg.text, msg.sender, msg.time);
    });

    list.scrollTop = list.scrollHeight;
  },

  appendMessageEl(text, sender, time = 'Just now') {
    const list = document.getElementById('chat-messages-list');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'buyer' ? 'bubble-outgoing' : 'bubble-incoming'}`;
    bubble.innerHTML = `
      <div class="bubble-text">${escapeHtml(text)}</div>
      <div class="bubble-meta">
        <span>${escapeHtml(time)}</span>
        ${sender === 'buyer' ? '<span style="color:#60a5fa; margin-left:4px;">✓✓</span>' : ''}
      </div>
    `;
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  },

  sendMessage(text, sender = 'buyer') {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.appendMessageEl(text, sender, time);

    const key = this.getThreadStorageKey();
    let thread = [];
    try {
      thread = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      thread = [];
    }
    thread.push({ text, sender, time });
    localStorage.setItem(key, JSON.stringify(thread));

    // Automated realistic seller reply simulation if buyer sent a message
    if (sender === 'buyer') {
      setTimeout(() => {
        let reply = "Sounds good! I'll be near the Central Library foyer after 3:30 PM. See you there!";
        if (text.includes('available')) {
          reply = "Yes, still available! In great condition as described.";
        } else if (text.includes('price') || text.includes('₹') || text.includes('offer')) {
          reply = "The price is already discounted, but I can do a small ₹50 student discount if you pick it up today!";
        }
        this.appendMessageEl(reply, 'seller', 'Just now');
        thread.push({ text: reply, sender: 'seller', time: 'Just now' });
        localStorage.setItem(key, JSON.stringify(thread));
      }, 1200);
    }
  },

  promptOffer() {
    const currentPrice = this.activeProduct ? this.activeProduct.price : 500;
    const proposed = prompt(`Make an offer for "${this.activeProduct.title}"\nCurrent listed price: ₹${currentPrice}\nEnter your proposed offer in ₹:`, Math.round(currentPrice * 0.9));
    if (proposed && !isNaN(proposed) && Number(proposed) > 0) {
      const offerMsg = `🤝 Offer: Would you take ₹${Number(proposed)} for this? I can pick it up on campus today.`;
      this.sendMessage(offerMsg, 'buyer');
      if (window.CampusCartToast) {
        window.CampusCartToast.success('Offer Sent to Seller!', `Proposed ₹${Number(proposed)} for ${this.activeProduct.title}`);
      }
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

