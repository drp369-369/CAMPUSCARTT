// public/js/wishlist.js - Student Wishlist & Saved Items Manager
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

window.CampusCartWishlist = {
  STORAGE_KEY: 'campuscart_wishlist',

  getItems() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isSaved(productId) {
    if (!productId) return false;
    const items = this.getItems();
    return items.some(item => (item.id || item._id) === productId);
  },

  toggle(product) {
    if (!product) return false;
    const id = product.id || product._id;
    let items = this.getItems();
    const existingIndex = items.findIndex(item => (item.id || item._id) === id);

    let saved = false;
    if (existingIndex !== -1) {
      items.splice(existingIndex, 1);
      saved = false;
      if (window.CampusCartToast) {
        window.CampusCartToast.info('Removed from Saved Items', `"${product.title}" has been removed.`);
      }
    } else {
      items.push({
        id: product.id || product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || null,
        category: product.category,
        condition: product.condition || 'Good',
        imageUrl: product.imageUrl || product.image,
        location: product.location || 'Campus',
        seller: product.seller || null,
        savedAt: new Date().toISOString()
      });
      saved = true;
      if (window.CampusCartToast) {
        window.CampusCartToast.success('Saved to Wishlist!', `"${product.title}" saved. View in Dashboard.`);
      }
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateBadges();
    return saved;
  },

  updateBadges() {
    const count = this.getItems().length;
    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.CampusCartWishlist.updateBadges();
});
