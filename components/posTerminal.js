const fmt = (val) => Number(val || 0).toLocaleString('en-IN');

export function renderPosTerminal(storeData) {
  const { products = [], posCart = [] } = storeData;

  const cartTotal = posCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartTax = cartTotal * 0.18; // 18% GST estimate
  const grandTotal = cartTotal + cartTax;

  return `
    <div class="pos-container">
      <!-- Left: Item Catalog & Search -->
      <div class="pos-catalog">
        <div class="pos-search-bar" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <input 
            type="text" 
            class="form-input" 
            placeholder="🔍 Search items by name, SKU, or HSN..." 
            id="pos-search" 
            oninput="window.filterPosItems(this.value)"
          />
          <button class="btn btn-outline" onclick="window.filterPosItems('')">Clear</button>
        </div>

        <div class="pos-items-grid" id="pos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
          ${products.map(p => `
            <div class="pos-item-card" onclick="window.addToPosCart('${p.id}')" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; cursor: pointer; transition: transform 0.15s ease;">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.2rem;">${p.name}</div>
              <div style="font-size: 1rem; font-weight: 800; color: var(--primary);">₹${fmt(p.price)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.2rem;">Stock: <strong>${p.stock} ${p.unit}</strong> | HSN: ${p.hsn}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right: Live Express Cart & Checkout -->
      <div class="pos-cart-panel" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="cart-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem;">
            <span style="font-weight: 700; font-family: var(--font-main); font-size: 0.9rem;">Express POS Cart (${posCart.length})</span>
            <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.65rem; color: var(--rose); border-color: var(--rose);" onclick="window.clearPosCart()">Clear Cart</button>
          </div>

          <div class="cart-items-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
            ${posCart.length ? posCart.map(item => `
              <div class="cart-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px dashed var(--border-color);">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem;">${item.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">₹${fmt(item.price)} x ${item.qty}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-weight: 700;">₹${fmt(item.price * item.qty)}</span>
                  <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="window.updatePosQty('${item.id}', ${item.qty - 1})">-</button>
                  <span style="font-size: 0.8rem; font-weight: 700;">${item.qty}</span>
                  <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="window.updatePosQty('${item.id}', ${item.qty + 1})">+</button>
                  <button class="btn btn-icon" style="width: 24px; height: 24px; font-size: 0.75rem; color: var(--rose);" onclick="window.removePosCartItem('${item.id}')">✕</button>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                🛒 Cart is empty.<br/><span style="font-size: 0.8rem;">Tap any item card on the left to add.</span>
              </div>
            `}
          </div>
        </div>

        <div class="cart-totals">
          <div class="cart-total-row" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); padding: 0.2rem 0;">
            <span>Subtotal</span>
            <span>₹${fmt(cartTotal)}</span>
          </div>
          <div class="cart-total-row" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); padding: 0.2rem 0;">
            <span>Estimated GST (18%)</span>
            <span>₹${fmt(cartTax)}</span>
          </div>
          <div class="cart-total-row grand" style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; border-top: 2px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem; color: var(--primary);">
            <span>Total Payable</span>
            <span>₹${fmt(grandTotal)}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.75rem;">
            <button class="btn btn-outline" style="padding: 0.5rem; font-size: 0.8rem;" onclick="window.checkoutPos('Cash')">💵 Cash</button>
            <button class="btn btn-outline" style="padding: 0.5rem; font-size: 0.8rem;" onclick="window.checkoutPos('UPI')">📱 UPI / QR</button>
            <button class="btn btn-outline" style="padding: 0.5rem; font-size: 0.8rem;" onclick="window.checkoutPos('Card')">💳 Card</button>
          </div>

          <button class="btn btn-emerald" style="width: 100%; margin-top: 0.75rem; padding: 0.75rem; font-weight: 700;" onclick="window.checkoutPos('Quick Payment')">
            ⚡ Complete Checkout & Print Receipt
          </button>
        </div>
      </div>
    </div>
  `;
}
