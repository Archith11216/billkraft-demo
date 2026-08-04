/* ==========================================================================
   BILLKRAFT 2.0 - MAIN APPLICATION LOGIC & CONTROLLER
   Features: Invoices, POS, Inventory, Parties, Inline GST Studio,
   Delete Record Handlers, Modal Forms, and LocalStorage Persistence.
   ========================================================================== */

import { renderGstStudio } from './components/gstStudio.js';
import { renderPosTerminal } from './components/posTerminal.js';

// Null-safe Currency & Number Formatter
const fmt = (val) => Number(val || 0).toLocaleString('en-IN');

// Default Seed Data for immediate rich interactive demo
const defaultState = {
  activeView: 'dashboard',
  activeGstTab: 'gstr1',
  activeSalesTab: 'invoices',
  activePurchasesTab: 'bills',
  salesPeriodFilter: 'all',
  theme: 'light',
  businessInfo: {
    name: 'BillKraft India Enterprises',
    gstin: '27AAACB1234C1Z5',
    address: 'Suite 402, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
    stateCode: '27'
  },
  products: [
    { id: 'p1', name: 'Dell UltraSharp Monitor 27"', sku: 'MON-27', hsn: '8471', price: 28500, stock: 14, unit: 'PCS' },
    { id: 'p2', name: 'Logitech MX Master 3S Mouse', sku: 'MS-3S', hsn: '8471', price: 7990, stock: 28, unit: 'PCS' },
    { id: 'p3', name: 'Ergonomic Desk Chair Pro', sku: 'CH-PRO', hsn: '9403', price: 14990, stock: 6, unit: 'NOS' },
    { id: 'p4', name: 'Type-C Thunderbolt Dock 11-in-1', sku: 'DK-11', hsn: '8517', price: 12400, stock: 8, unit: 'PCS' }
  ],
  parties: [
    { id: 'c1', name: 'Apex Tech Solutions Pvt Ltd', gstin: '27AAACA9988B1Z1', phone: '+91 98201 12345', state: '27-Maharashtra', type: 'Customer', balance: 45000 },
    { id: 'c2', name: 'Global Logistics & Freight', gstin: '29BBBGL7766K1Z4', phone: '+91 98450 67890', state: '29-Karnataka', type: 'Customer', balance: 0 },
    { id: 'v1', name: 'TechMart India Wholesalers', gstin: '27AAACT1234F1Z9', phone: '+91 98111 22334', state: '27-Maharashtra', type: 'Vendor', balance: -12500 }
  ],
  invoices: [
    {
      id: 'inv-101',
      invoiceNumber: 'INV-2026-001',
      date: new Date().toISOString().split('T')[0],
      partyName: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAACA9988B1Z1',
      placeOfSupply: '27-Maharashtra',
      items: [
        { name: 'Dell UltraSharp Monitor 27"', qty: 2, price: 28500, hsn: '8471', amount: 57000 }
      ],
      taxableAmount: 57000,
      cgst: 5130,
      sgst: 5130,
      igst: 0,
      grandTotal: 67260,
      status: 'Paid'
    },
    {
      id: 'inv-102',
      invoiceNumber: 'INV-2026-002',
      date: new Date().toISOString().split('T')[0],
      partyName: 'Global Logistics & Freight',
      gstin: '29BBBGL7766K1Z4',
      placeOfSupply: '29-Karnataka',
      items: [
        { name: 'Type-C Thunderbolt Dock 11-in-1', qty: 2, price: 12400, hsn: '8517', amount: 24800 }
      ],
      taxableAmount: 24800,
      cgst: 0,
      sgst: 0,
      igst: 4464,
      grandTotal: 29264,
      status: 'Pending'
    },
    {
      id: 'inv-103',
      invoiceNumber: 'INV-2026-003',
      date: new Date().toISOString().split('T')[0],
      partyName: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAACA9988B1Z1',
      placeOfSupply: '27-Maharashtra',
      items: [
        { name: 'Ergonomic Desk Chair Pro', qty: 6, price: 14416.66, hsn: '9403', amount: 86500 }
      ],
      taxableAmount: 86500,
      cgst: 7785,
      sgst: 7785,
      igst: 0,
      grandTotal: 102070,
      status: 'Paid'
    }
  ],
  ewayBills: [
    {
      id: 'ewb-1',
      ewbNo: '1810-9923-4451',
      invoiceNumber: 'INV-2026-001',
      invoiceId: 'inv-101',
      consignee: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAACA9988B1Z1',
      fromState: '27-Maharashtra',
      toState: '27-Maharashtra',
      vehicleNo: 'MH-04-JK-9920',
      transporter: 'VRL Logistics Ltd',
      transporterGstin: '27AAATV1234F1Z3',
      mode: 'Road',
      distance: 240,
      validUntil: '2026-07-31 23:59:59',
      status: 'Valid (In Transit)',
      grandTotal: 67260
    },
    {
      id: 'ewb-2',
      ewbNo: '2910-8834-1120',
      invoiceNumber: 'INV-2026-002',
      invoiceId: 'inv-102',
      consignee: 'Global Logistics & Freight',
      gstin: '29BBBGL7766K1Z4',
      fromState: '27-Maharashtra',
      toState: '29-Karnataka',
      vehicleNo: 'KA-01-AB-1234',
      transporter: 'GATI KWE Express',
      transporterGstin: '29AAACG8899K1Z5',
      mode: 'Road',
      distance: 980,
      validUntil: '2026-08-04 23:59:59',
      status: 'Valid (In Transit)',
      grandTotal: 29264
    }
  ],
  purchases: [
    {
      id: 'pur-101',
      billNumber: 'PUR-2026-881',
      vendorName: 'TechMart India Wholesalers',
      gstin: '27AAACT1234F1Z9',
      date: new Date().toISOString().split('T')[0],
      placeOfSupply: '27-Maharashtra',
      items: [{ name: 'Dell UltraSharp Monitor 27"', qty: 10, price: 22000, hsn: '8471', amount: 220000 }],
      taxableAmount: 220000,
      cgst: 19800,
      sgst: 19800,
      igst: 0,
      grandTotal: 259600,
      status: 'Paid'
    },
    {
      id: 'pur-102',
      billNumber: 'PUR-2026-882',
      vendorName: 'TechMart India Wholesalers',
      gstin: '27AAACT1234F1Z9',
      date: new Date().toISOString().split('T')[0],
      placeOfSupply: '27-Maharashtra',
      items: [{ name: 'Ergonomic Desk Chair Pro', qty: 4, price: 11000, hsn: '9403', amount: 44000 }],
      taxableAmount: 44000,
      cgst: 3960,
      sgst: 3960,
      igst: 0,
      grandTotal: 51920,
      status: 'Pending'
    }
  ],
  estimates: [
    {
      id: 'est-101',
      estimateNumber: 'EST-2026-001',
      date: new Date().toISOString().split('T')[0],
      validUntil: '2026-08-30',
      partyName: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAACA9988B1Z1',
      placeOfSupply: '27-Maharashtra',
      items: [
        { name: 'Dell UltraSharp Monitor 27"', qty: 3, price: 28500, hsn: '8471', amount: 85500 }
      ],
      taxableAmount: 85500,
      cgst: 7695,
      sgst: 7695,
      igst: 0,
      grandTotal: 100890,
      status: 'Sent'
    },
    {
      id: 'est-102',
      estimateNumber: 'EST-2026-002',
      date: new Date().toISOString().split('T')[0],
      validUntil: '2026-08-25',
      partyName: 'Global Logistics & Freight',
      gstin: '29BBBGL7766K1Z4',
      placeOfSupply: '29-Karnataka',
      items: [
        { name: 'Logitech MX Master 3S Mouse', qty: 10, price: 7990, hsn: '8471', amount: 79900 }
      ],
      taxableAmount: 79900,
      cgst: 0,
      sgst: 0,
      igst: 14382,
      grandTotal: 94282,
      status: 'Approved'
    }
  ],
  orders: [
    {
      id: 'ord-101',
      orderNumber: 'SO-2026-401',
      type: 'Sales Order',
      partyName: 'Apex Tech Solutions Pvt Ltd',
      gstin: '27AAACA9988B1Z1',
      date: '2026-07-30',
      expectedDate: '2026-08-05',
      items: [{ name: 'Logitech MX Master 3S Mouse', qty: 5, price: 7990, amount: 39950 }],
      grandTotal: 47141,
      status: 'In Progress'
    },
    {
      id: 'ord-102',
      orderNumber: 'PO-2026-108',
      type: 'Purchase Order',
      partyName: 'TechMart India Wholesalers',
      gstin: '27AAACT1234F1Z9',
      date: '2026-07-29',
      expectedDate: '2026-08-02',
      items: [{ name: 'Type-C Thunderbolt Dock 11-in-1', qty: 10, price: 9500, amount: 95000 }],
      grandTotal: 112100,
      status: 'Pending'
    }
  ],
  posCart: []
};

class AppStore {
  constructor() {
    try {
      const saved = localStorage.getItem('billkraft_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const rawInvoices = Array.isArray(parsed.invoices) ? parsed.invoices : defaultState.invoices;
        
        // Sanitize invoices to guarantee numeric values for taxableAmount, cgst, sgst, igst, grandTotal
        const sanitizedInvoices = rawInvoices.map(inv => ({
          ...inv,
          taxableAmount: Number(inv.taxableAmount || 0),
          cgst: Number(inv.cgst || 0),
          sgst: Number(inv.sgst || 0),
          igst: Number(inv.igst || 0),
          grandTotal: Number(inv.grandTotal || 0)
        }));

        this.state = {
          ...defaultState,
          ...parsed,
          invoices: sanitizedInvoices,
          products: Array.isArray(parsed.products) ? parsed.products : defaultState.products,
          parties: Array.isArray(parsed.parties) ? parsed.parties : defaultState.parties,
          ewayBills: Array.isArray(parsed.ewayBills) ? parsed.ewayBills : defaultState.ewayBills,
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : defaultState.purchases,
          orders: Array.isArray(parsed.orders) ? parsed.orders : defaultState.orders,
          posCart: Array.isArray(parsed.posCart) ? parsed.posCart : []
        };
      } else {
        this.state = JSON.parse(JSON.stringify(defaultState));
      }
    } catch (e) {
      console.error('Failed to parse state:', e);
      this.state = JSON.parse(JSON.stringify(defaultState));
    }
  }

  save() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('billkraft_state_v2', JSON.stringify(this.state));
      } catch (e) {
        console.error('State save error:', e);
      }
    }, 150);
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    localStorage.setItem('billkraft_state_v2', JSON.stringify(this.state));
  }
}

const store = new AppStore();
window.store = store;

// Global Navigation Controllers
window.navigate = (viewName) => {
  try {
    store.state.activeView = viewName;
    store.save();
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error('Navigation error:', e);
  }
};

window.switchGstTab = (tabName) => {
  store.state.activeGstTab = tabName;
  store.save();
  renderApp();
};

window.toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  store.state.theme = next;
  store.save();
};

// ==========================================================================
// DELETE HANDLERS
// ==========================================================================

window.deleteInvoice = (invoiceId) => {
  const inv = store.state.invoices.find(i => i.id === invoiceId);
  if (confirm(`Are you sure you want to delete Invoice ${inv ? inv.invoiceNumber : ''}?`)) {
    store.state.invoices = store.state.invoices.filter(i => i.id !== invoiceId);
    store.save();
    renderApp();
  }
};

window.deleteProduct = (productId) => {
  const prod = store.state.products.find(p => p.id === productId);
  if (confirm(`Are you sure you want to delete Product "${prod ? prod.name : ''}"?`)) {
    store.state.products = store.state.products.filter(p => p.id !== productId);
    store.save();
    renderApp();
  }
};

window.deleteParty = (partyId) => {
  const party = store.state.parties.find(p => p.id === partyId);
  if (confirm(`Are you sure you want to delete Party "${party ? party.name : ''}"?`)) {
    store.state.parties = store.state.parties.filter(p => p.id !== partyId);
    store.save();
    renderApp();
  }
};

window.resetAllData = () => {
  if (confirm('Are you sure you want to reset all data back to default demo records?')) {
    store.reset();
    renderApp();
  }
};

// POS Cart handlers
window.addToPosCart = (productId) => {
  const prod = store.state.products.find(p => p.id === productId);
  if (!prod) return;

  const existing = store.state.posCart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    store.state.posCart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  }
  store.save();
  renderApp();
};

window.updatePosQty = (id, newQty) => {
  if (newQty <= 0) {
    store.state.posCart = store.state.posCart.filter(i => i.id !== id);
  } else {
    const item = store.state.posCart.find(i => i.id === id);
    if (item) item.qty = newQty;
  }
  store.save();
  renderApp();
};

window.removePosCartItem = (id) => {
  store.state.posCart = store.state.posCart.filter(i => i.id !== id);
  store.save();
  renderApp();
};

window.clearPosCart = () => {
  store.state.posCart = [];
  store.save();
  renderApp();
};

window.filterPosItems = (query) => {
  const q = (query || '').toLowerCase().trim();
  const filtered = store.state.products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.sku.toLowerCase().includes(q) || 
    (p.hsn && p.hsn.includes(q))
  );

  const grid = document.getElementById('pos-grid');
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(p => `
      <div class="pos-item-card" onclick="window.addToPosCart('${p.id}')" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; cursor: pointer; transition: transform 0.15s ease;">
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.25rem;">${p.name}</div>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">₹${fmt(p.price)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Stock: <strong>${p.stock} ${p.unit}</strong> | HSN: ${p.hsn}</div>
      </div>
    `).join('') : `<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">No products match "${query}".</div>`;
  }
};

window.checkoutPos = (method) => {
  if (!store.state.posCart.length) {
    alert('Please add items to cart before completing payment.');
    return;
  }

  const subtotal = store.state.posCart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const newInv = {
    id: 'inv-' + Date.now(),
    invoiceNumber: 'POS-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    partyName: 'Walk-in Retail Customer',
    gstin: 'URP',
    placeOfSupply: '27-Maharashtra',
    items: store.state.posCart.map(c => ({ name: c.name, qty: c.qty, price: c.price, amount: c.price * c.qty })),
    taxableAmount: subtotal,
    cgst: tax / 2,
    sgst: tax / 2,
    igst: 0,
    grandTotal: grandTotal,
    status: 'Paid (' + method + ')'
  };

  store.state.invoices.unshift(newInv);
  store.state.posCart = [];
  store.save();

  alert(`Payment of ₹${grandTotal.toLocaleString('en-IN')} via ${method} successful!\nInvoice ${newInv.invoiceNumber} generated.`);
  renderApp();
};

// ==========================================================================
// MODAL FORMS (ADD NEW INVOICE, PRODUCT, PARTY)
// ==========================================================================

window.closeModal = () => {
  const backdrop = document.getElementById('modal-backdrop');
  backdrop.classList.remove('active');
};

// 1. ADD NEW INVOICE MODAL (Supports Full Manual Typing + Suggestions)
window.openCreateInvoiceModal = () => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">📄 Create New GST Tax Invoice</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-invoice-form" onsubmit="window.saveNewInvoice(event)">
        
        <!-- Customer Section -->
        <h4 style="font-family: var(--font-display); margin-bottom: 0.75rem; color: var(--primary);">1. Customer Details</h4>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Customer / Party Name (Type or Select)</label>
            <input 
              type="text" 
              class="form-input" 
              id="inv-party-name" 
              placeholder="Type customer name (e.g. Acme Enterprises)" 
              list="parties-datalist" 
              oninput="window.autoFillParty(this.value)"
              required 
            />
            <datalist id="parties-datalist">
              ${store.state.parties.map(p => `<option value="${p.name}">${p.gstin ? 'GSTIN: ' + p.gstin : 'URP Customer'}</option>`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">Customer GSTIN (Type or leave blank)</label>
            <input 
              type="text" 
              class="form-input" 
              id="inv-party-gstin" 
              placeholder="e.g. 27AAACA9988B1Z1 (or URP)" 
            />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label class="form-label">Place of Supply (For GST Rate Split)</label>
          <select class="form-select" id="inv-pos">
            <option value="27-Maharashtra">27-Maharashtra (Intra-state: CGST 9% + SGST 9%)</option>
            <option value="29-Karnataka">29-Karnataka (Inter-state: IGST 18%)</option>
            <option value="07-Delhi">07-Delhi (Inter-state: IGST 18%)</option>
            <option value="33-Tamil Nadu">33-Tamil Nadu (Inter-state: IGST 18%)</option>
            <option value="24-Gujarat">24-Gujarat (Inter-state: IGST 18%)</option>
            <option value="09-Uttar Pradesh">09-Uttar Pradesh (Inter-state: IGST 18%)</option>
          </select>
        </div>

        <!-- Item Details Section -->
        <h4 style="font-family: var(--font-display); margin-bottom: 0.75rem; color: var(--primary);">2. Item & Pricing Details</h4>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Item Description / Product Name (Type or Select)</label>
            <input 
              type="text" 
              class="form-input" 
              id="inv-prod-name" 
              placeholder="Type item description (e.g. Dell Monitor 27&quot;)" 
              list="products-datalist" 
              oninput="window.autoFillProduct(this.value)"
              required 
            />
            <datalist id="products-datalist">
              ${store.state.products.map(pr => `<option value="${pr.name}">₹${pr.price}</option>`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">GST Tax Rate (%)</label>
            <select class="form-select" id="inv-gst-rate">
              <option value="18">18% GST (Standard Electronics & Services)</option>
              <option value="12">12% GST (Processed Goods & Hardware)</option>
              <option value="5">5% GST (Essential Commodities)</option>
              <option value="28">28% GST (Luxury & Automobiles)</option>
              <option value="0">0% GST (Exempt / Nil Rated)</option>
            </select>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Unit Rate / Price (₹)</label>
            <input 
              type="number" 
              class="form-input" 
              id="inv-prod-price" 
              placeholder="e.g. 2500" 
              step="any"
              min="0"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input 
              type="number" 
              class="form-input" 
              id="inv-qty" 
              value="1" 
              min="1" 
              required 
            />
          </div>
        </div>

        <!-- Date & Payment Status -->
        <h4 style="font-family: var(--font-display); margin-bottom: 0.75rem; color: var(--primary);">3. Invoice Status</h4>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Payment Status</label>
            <select class="form-select" id="inv-status">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Date</label>
            <input type="date" class="form-input" id="inv-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save & Generate GST Invoice</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

// Auto-fill helpers when selecting from datalist suggestions
window.autoFillParty = (val) => {
  const party = store.state.parties.find(p => p.name.toLowerCase() === val.toLowerCase());
  if (party) {
    const gstinEl = document.getElementById('inv-party-gstin');
    const posEl = document.getElementById('inv-pos');
    if (gstinEl && party.gstin) gstinEl.value = party.gstin;
    if (posEl && party.state) posEl.value = party.state;
  }
};

window.autoFillProduct = (val) => {
  const prod = store.state.products.find(p => p.name.toLowerCase() === val.toLowerCase());
  if (prod) {
    const priceEl = document.getElementById('inv-prod-price');
    if (priceEl && prod.price) priceEl.value = prod.price;
  }
};

window.saveNewInvoice = (e) => {
  e.preventDefault();
  try {
    const partyNameEl = document.getElementById('inv-party-name') || document.getElementById('inv-party');
    const partyName = partyNameEl ? partyNameEl.value.split('|')[0].trim() : 'Customer';

    const gstinEl = document.getElementById('inv-party-gstin');
    const gstin = (gstinEl && gstinEl.value.trim()) ? gstinEl.value.trim() : 'URP';

    const posEl = document.getElementById('inv-pos');
    const pos = posEl ? posEl.value : '27-Maharashtra';
    
    const prodNameEl = document.getElementById('inv-prod-name') || document.getElementById('inv-prod');
    const prodName = prodNameEl ? prodNameEl.value.split('|')[0].trim() : 'General Item';

    const gstRateEl = document.getElementById('inv-gst-rate');
    const gstRatePercent = gstRateEl ? Number(gstRateEl.value || 18) : 18;

    const priceEl = document.getElementById('inv-prod-price');
    const unitPrice = (priceEl && priceEl.value) ? Number(priceEl.value) : 1000;

    const qtyEl = document.getElementById('inv-qty');
    const qty = (qtyEl && qtyEl.value) ? Number(qtyEl.value) : 1;
    
    const statusEl = document.getElementById('inv-status');
    const status = statusEl ? statusEl.value : 'Paid';

    const dateEl = document.getElementById('inv-date');
    const date = (dateEl && dateEl.value) ? dateEl.value : new Date().toISOString().split('T')[0];

    const taxable = unitPrice * qty;
    const taxRate = gstRatePercent / 100;

    const isInterState = !pos.startsWith(store.state.businessInfo.stateCode);

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = taxable * taxRate;
    } else {
      cgst = taxable * (taxRate / 2);
      sgst = taxable * (taxRate / 2);
    }

    const grandTotal = taxable + cgst + sgst + igst;

    const newInv = {
      id: 'inv-' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(100 + Math.random() * 900),
      date: date,
      partyName: partyName,
      gstin: gstin,
      placeOfSupply: pos,
      gstRate: gstRatePercent,
      items: [{ name: prodName, qty, price: unitPrice, hsn: gstRatePercent + '% GST', amount: taxable }],
      taxableAmount: taxable,
      cgst,
      sgst,
      igst,
      grandTotal,
      status: status
    };

    // Save new invoice
    store.state.invoices.unshift(newInv);

    // Auto-save new party if custom typed
    if (partyName && !store.state.parties.some(p => p.name.toLowerCase() === partyName.toLowerCase())) {
      store.state.parties.unshift({
        id: 'pt-' + Date.now(),
        name: partyName,
        type: 'Customer',
        gstin: gstin,
        phone: 'N/A',
        state: pos,
        balance: 0
      });
    }

    // Auto-save new product if custom typed
    if (prodName && !store.state.products.some(pr => pr.name.toLowerCase() === prodName.toLowerCase())) {
      store.state.products.unshift({
        id: 'p-' + Date.now(),
        name: prodName,
        sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
        hsn: gstRatePercent + '% GST',
        price: unitPrice,
        stock: 50,
        unit: 'PCS'
      });
    }

    store.save();
    window.closeModal();
    renderApp();
    
    // AUTOMATICALLY DISPLAY THE INVOICE LETTER PREVIEW IMMEDIATELY AFTER CREATION
    setTimeout(() => {
      window.viewInvoiceLetter(newInv.id);
    }, 150);
  } catch (err) {
    console.error('Invoice creation error:', err);
    alert('Invoice creation notice: ' + err.message);
  }
};

// INVOICE LETTER PREVIEW MODAL
// INVOICE LETTER PREVIEW MODAL
window.viewInvoiceLetter = (invoiceId) => {
  const inv = store.state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header" style="padding: 0.75rem 1.25rem;">
      <h3 class="modal-title" style="font-size: 1.05rem;">📄 Tax Invoice Letter — ${inv.invoiceNumber}</h3>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.openCreateEwayModal('${inv.id}')">🚛 Generate E-Way Bill</button>
        <button class="btn btn-emerald" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.printInvoice('${inv.id}')">🖨️ Print / Download PDF</button>
        <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
      </div>
    </div>
    <div class="modal-body" style="padding: 1.15rem; background: #ffffff; color: #0f172a; border-radius: var(--radius-lg); overflow-y: hidden;">
      
      <!-- Letter Top Branding Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--primary); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
        <div>
          <span style="display: inline-block; background: var(--primary-gradient); color: #fff; font-weight: 800; font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; text-transform: uppercase; margin-bottom: 0.2rem;">OFFICIAL TAX INVOICE LETTER</span>
          <h2 style="font-family: var(--font-display); color: #0f172a; margin: 0; font-size: 1.35rem; font-weight: 800;">${store.state.businessInfo.name}</h2>
          <p style="font-size: 0.8rem; color: #475569; margin: 0.15rem 0 0;"><strong>GSTIN:</strong> ${store.state.businessInfo.gstin} | ${store.state.businessInfo.address}</p>
        </div>
        <div style="text-align: right;">
          <div style="background: #f8fafc; padding: 0.5rem 0.85rem; border-radius: var(--radius-md); border: 1px solid #cbd5e1;">
            <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #64748b;">INVOICE DETAILS</div>
            <div style="font-size: 1rem; font-weight: 800; color: var(--primary); margin-top: 0.1rem;">${inv.invoiceNumber}</div>
            <div style="font-size: 0.775rem; color: #334155;">Date: <strong>${inv.date}</strong> | POS: <strong>${inv.placeOfSupply}</strong></div>
          </div>
        </div>
      </div>

      <!-- Customer Billed To Section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #f8fafc; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0; margin-bottom: 0.75rem;">
        <div>
          <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em;">BILLED TO (BUYER DETAILS)</div>
          <div style="font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.15rem;">${inv.partyName}</div>
          <div style="font-size: 0.8rem; color: #475569; margin-top: 0.1rem;">GSTIN / UIN: <strong style="color: #0f172a;">${inv.gstin}</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em;">PAYMENT & TAX COMPLIANCE</div>
          <div style="margin-top: 0.15rem;"><span class="badge badge-success" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">${inv.status}</span></div>
          <div style="font-size: 0.775rem; color: #64748b; margin-top: 0.2rem;">Place of Supply: ${inv.placeOfSupply}</div>
        </div>
      </div>

      <!-- Itemized Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; font-size: 0.85rem;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #334155;">
            <th style="padding: 0.5rem; text-align: left;">#</th>
            <th style="padding: 0.5rem; text-align: left;">Item Description / Service</th>
            <th style="padding: 0.5rem; text-align: center;">Tax / HSN</th>
            <th style="padding: 0.5rem; text-align: center;">Qty</th>
            <th style="padding: 0.5rem; text-align: right;">Rate (₹)</th>
            <th style="padding: 0.5rem; text-align: right;">Taxable Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.45rem 0.5rem; color: #64748b;">${idx + 1}</td>
              <td style="padding: 0.45rem 0.5rem; color: #0f172a;"><strong>${item.name}</strong></td>
              <td style="padding: 0.45rem 0.5rem; text-align: center;"><span style="background: #e2e8f0; color: #334155; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px;">${item.hsn || (inv.gstRate ? inv.gstRate + '% GST' : '18% GST')}</span></td>
              <td style="padding: 0.45rem 0.5rem; text-align: center; font-weight: 700;">${item.qty}</td>
              <td style="padding: 0.45rem 0.5rem; text-align: right;">₹${fmt(item.price)}</td>
              <td style="padding: 0.45rem 0.5rem; text-align: right; font-weight: 700; color: #0f172a;">₹${fmt(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Summary & Tax Split Cards -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
        <div style="max-width: 320px; font-size: 0.75rem; color: #64748b; background: #f8fafc; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 0.25rem; font-weight: 700; color: #334155;">Declaration & Terms:</p>
          <ul style="margin: 0; padding-left: 1rem; line-height: 1.3;">
            <li>Certified that all details are true and correct.</li>
            <li>Subject to Mumbai Jurisdiction only.</li>
            <li>Computer generated tax invoice letter.</li>
          </ul>
        </div>

        <div style="width: 280px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 0.65rem 0.85rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.15rem 0; color: #334155;">
            <span>Subtotal (Taxable Value):</span>
            <strong>₹${fmt(inv.taxableAmount)}</strong>
          </div>
          ${inv.cgst ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem; padding: 0.15rem 0; color: #475569;">
              <span>CGST Output:</span>
              <span>₹${fmt(inv.cgst)}</span>
            </div>
          ` : ''}
          ${inv.sgst ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem; padding: 0.15rem 0; color: #475569;">
              <span>SGST Output:</span>
              <span>₹${fmt(inv.sgst)}</span>
            </div>
          ` : ''}
          ${inv.igst ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem; padding: 0.15rem 0; color: #475569;">
              <span>IGST Output:</span>
              <span>₹${fmt(inv.igst)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; border-top: 2px solid var(--primary); padding-top: 0.4rem; margin-top: 0.3rem; color: var(--primary);">
            <span>Grand Total:</span>
            <span>₹${fmt(inv.grandTotal)}</span>
          </div>
        </div>
      </div>

    </div>
  `;
  backdrop.classList.add('active');
};

// ==========================================================================
// E-WAY BILL SYSTEM (GENERATION, SLIP VIEW, DELETE)
// ==========================================================================

// 1. OPEN CREATE E-WAY BILL MODAL
window.openCreateEwayModal = (targetInvId = null) => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  const invOptions = store.state.invoices.map(i => 
    `<option value="${i.id}" ${targetInvId === i.id ? 'selected' : ''}>${i.invoiceNumber} - ${i.partyName} (₹${fmt(i.grandTotal)})</option>`
  ).join('');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">🚛 Generate E-Way Bill (NIC GST Portal Integration)</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-eway-form" onsubmit="window.saveNewEwayBill(event)">
        
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Select Sales Tax Invoice</label>
          <select class="form-select" id="ewb-invoice-id" onchange="window.autoFillEwayInvoice(this.value)" required>
            ${invOptions}
          </select>
        </div>

        <h4 style="font-family: var(--font-display); margin: 1rem 0 0.75rem; color: var(--primary);">Transport & Vehicle Details</h4>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Transporter Name</label>
            <input type="text" class="form-input" id="ewb-transporter" placeholder="e.g. VRL Logistics Ltd" value="VRL Logistics Ltd" required />
          </div>
          <div class="form-group">
            <label class="form-label">Transporter GSTIN / ID</label>
            <input type="text" class="form-input" id="ewb-trans-gstin" placeholder="e.g. 27AAATV1234F1Z3" value="27AAATV1234F1Z3" />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Vehicle Number</label>
            <input type="text" class="form-input" id="ewb-vehicle" placeholder="e.g. MH-04-JK-9920" value="MH-04-JK-9920" required />
          </div>
          <div class="form-group">
            <label class="form-label">Transportation Mode</label>
            <select class="form-select" id="ewb-mode">
              <option value="Road">Road Transportation</option>
              <option value="Rail">Rail Express</option>
              <option value="Air">Air Freight</option>
              <option value="Ship">Ship Cargo</option>
            </select>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Approx Distance (in KM)</label>
            <input type="number" class="form-input" id="ewb-distance" placeholder="Distance in Km (e.g. 240)" value="240" min="1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Transportation</label>
            <select class="form-select" id="ewb-reason">
              <option value="Outward - Supply">Outward - Supply / Sales</option>
              <option value="Job Work">Job Work Movement</option>
              <option value="Export">Export Shipment</option>
              <option value="Line Sales">Line Sales</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-emerald">🚛 Generate Official E-Way Bill</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

// 2. SAVE NEW E-WAY BILL
window.saveNewEwayBill = (e) => {
  e.preventDefault();
  try {
    const invId = document.getElementById('ewb-invoice-id').value;
    const inv = store.state.invoices.find(i => i.id === invId);

    const transporter = document.getElementById('ewb-transporter').value.trim();
    const transporterGstin = document.getElementById('ewb-trans-gstin').value.trim() || 'URP';
    const vehicleNo = document.getElementById('ewb-vehicle').value.trim();
    const mode = document.getElementById('ewb-mode').value;
    const distance = Number(document.getElementById('ewb-distance').value || 100);

    // Generate E-Way Bill Number e.g. 1810-xxxx-xxxx
    const ewbNo = Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Calculate validity days (1 day per 200 km)
    const validDays = Math.max(1, Math.ceil(distance / 200));
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + validDays);
    const validUntil = validDate.toISOString().split('T')[0] + ' 23:59:59';

    const newEwb = {
      id: 'ewb-' + Date.now(),
      ewbNo: ewbNo,
      invoiceNumber: inv ? inv.invoiceNumber : 'INV-2026-001',
      invoiceId: invId,
      consignee: inv ? inv.partyName : 'Customer',
      gstin: inv ? inv.gstin : 'URP',
      fromState: store.state.businessInfo.stateCode + '-Maharashtra',
      toState: inv ? inv.placeOfSupply : '27-Maharashtra',
      vehicleNo: vehicleNo,
      transporter: transporter,
      transporterGstin: transporterGstin,
      mode: mode,
      distance: distance,
      validUntil: validUntil,
      status: 'Valid (In Transit)',
      grandTotal: inv ? inv.grandTotal : 50000
    };

    store.state.ewayBills.unshift(newEwb);
    store.save();
    window.closeModal();
    renderApp();

    setTimeout(() => {
      window.viewEwaySlip(newEwb.id);
    }, 150);
  } catch (err) {
    console.error('E-Way Bill error:', err);
    alert('E-Way Bill notice: ' + err.message);
  }
};

// 3. VIEW E-WAY BILL PRINT SLIP
window.viewEwaySlip = (ewayId) => {
  const ewb = store.state.ewayBills.find(e => e.id === ewayId);
  if (!ewb) return;

  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">🚛 E-Way Bill Slip — ${ewb.ewbNo}</h3>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-emerald" onclick="window.printEwaySlip('${ewb.id}')">🖨️ Print E-Way Bill</button>
        <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
      </div>
    </div>
    <div class="modal-body" style="padding: 1.75rem; background: #ffffff; color: #0f172a; border-radius: var(--radius-lg);">
      
      <!-- EWB Header -->
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 4px;">GOVERNMENT OF INDIA — E-WAY BILL SYSTEM</span>
          <h2 style="font-family: var(--font-display); color: #0f172a; margin: 0.3rem 0 0; font-size: 1.5rem; font-weight: 800;">E-WAY BILL: ${ewb.ewbNo}</h2>
          <p style="font-size: 0.85rem; color: #475569; margin: 0.15rem 0 0;">Generated Date: <strong>${new Date().toISOString().split('T')[0]}</strong> | Valid Until: <strong style="color: #b91c1c;">${ewb.validUntil}</strong></p>
        </div>
        <div style="text-align: right;">
          <!-- QR Code Barcode Representation -->
          <div style="border: 2px dashed #334155; padding: 0.5rem; text-align: center; border-radius: 6px; background: #f8fafc; font-family: monospace; font-size: 0.7rem; font-weight: 700;">
            [ QR / BARCODE SEAL ]<br/>
            EWB-${ewb.ewbNo}
          </div>
        </div>
      </div>

      <!-- PART A: DOCUMENT & GOODS DETAILS -->
      <div style="border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; background: #f8fafc;">
        <h4 style="margin: 0 0 0.75rem 0; font-family: var(--font-display); color: var(--primary);">PART A: Goods & Tax Details</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-size: 0.85rem;">
          <div><strong>GSTIN of Supplier:</strong><br/>${store.state.businessInfo.gstin}</div>
          <div><strong>Place of Dispatch:</strong><br/>${ewb.fromState}</div>
          <div><strong>Doc / Invoice No:</strong><br/><strong style="color: var(--primary);">${ewb.invoiceNumber}</strong></div>
          
          <div><strong>GSTIN of Consignee:</strong><br/>${ewb.gstin}</div>
          <div><strong>Place of Delivery:</strong><br/>${ewb.toState}</div>
          <div><strong>Consignee Name:</strong><br/>${ewb.consignee}</div>

          <div><strong>Total Goods Value:</strong><br/><strong style="font-size: 1rem; color: #0f172a;">₹${fmt(ewb.grandTotal)}</strong></div>
          <div><strong>Distance:</strong><br/>${ewb.distance} KM</div>
          <div><strong>Status:</strong><br/><span class="badge badge-success">${ewb.status}</span></div>
        </div>
      </div>

      <!-- PART B: TRANSPORT VEHICLE DETAILS -->
      <div style="border: 1px solid #cbd5e1; border-radius: var(--radius-md); padding: 1rem; background: #ffffff;">
        <h4 style="margin: 0 0 0.75rem 0; font-family: var(--font-display); color: var(--emerald);">PART B: Transporter & Vehicle Details</h4>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; font-size: 0.85rem;">
          <div><strong>Mode:</strong><br/>${ewb.mode}</div>
          <div><strong>Vehicle No:</strong><br/><strong style="font-size: 0.95rem; color: var(--primary);">${ewb.vehicleNo}</strong></div>
          <div><strong>Transporter:</strong><br/>${ewb.transporter}</div>
          <div><strong>Transporter ID:</strong><br/>${ewb.transporterGstin}</div>
        </div>
      </div>

    </div>
  `;
  backdrop.classList.add('active');
};

// PRINT E-WAY BILL SLIP
window.printEwaySlip = (ewayId) => {
  window.print();
};

// DELETE / CANCEL E-WAY BILL
window.deleteEwayBill = (ewayId) => {
  if (confirm('Are you sure you want to cancel this E-Way Bill? This action is recorded on GST NIC portal.')) {
    store.state.ewayBills = store.state.ewayBills.filter(e => e.id !== ewayId);
    store.save();
    renderApp();
  }
};

// ==========================================================================
// PURCHASES & VENDOR BILLS SYSTEM
// ==========================================================================

// 1. OPEN CREATE PURCHASE BILL MODAL
window.openCreatePurchaseModal = () => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">🛍️ Record Inward Purchase Bill / Vendor Bill</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-purchase-form" onsubmit="window.saveNewPurchase(event)">
        
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Vendor / Supplier Name (Type or Select)</label>
            <input type="text" class="form-input" id="pur-vendor-name" placeholder="e.g. TechMart Wholesalers" list="vendors-datalist" required />
            <datalist id="vendors-datalist">
              ${store.state.parties.filter(p => p.type === 'Vendor' || p.type === 'Customer').map(p => `<option value="${p.name}">GSTIN: ${p.gstin}</option>`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label">Vendor Invoice / Bill No</label>
            <input type="text" class="form-input" id="pur-bill-no" placeholder="e.g. PUR-2026-901" value="PUR-2026-${Math.floor(100+Math.random()*900)}" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Item Description / Raw Material</label>
            <input type="text" class="form-input" id="pur-prod-name" placeholder="e.g. Dell Monitor 27&quot;" list="products-datalist" required />
          </div>

          <div class="form-group">
            <label class="form-label">GST Tax Rate (%)</label>
            <select class="form-select" id="pur-gst-rate">
              <option value="18">18% GST (Input ITC Eligible)</option>
              <option value="12">12% GST (Input ITC Eligible)</option>
              <option value="5">5% GST (Input ITC Eligible)</option>
              <option value="28">28% GST (Input ITC Eligible)</option>
              <option value="0">0% GST (Exempt)</option>
            </select>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Purchase Unit Rate (₹)</label>
            <input type="number" class="form-input" id="pur-price" placeholder="e.g. 15000" min="0" step="any" required />
          </div>

          <div class="form-group">
            <label class="form-label">Quantity Received</label>
            <input type="number" class="form-input" id="pur-qty" value="1" min="1" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Payment Status</label>
            <select class="form-select" id="pur-status">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Bill Date</label>
            <input type="date" class="form-input" id="pur-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">🛍️ Save & Claim ITC</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

// 2. SAVE NEW PURCHASE BILL
window.saveNewPurchase = (e) => {
  e.preventDefault();
  try {
    const vendorName = document.getElementById('pur-vendor-name').value.trim();
    const billNumber = document.getElementById('pur-bill-no').value.trim();
    const prodName = document.getElementById('pur-prod-name').value.trim();
    const gstRatePercent = Number(document.getElementById('pur-gst-rate').value || 18);
    const unitPrice = Number(document.getElementById('pur-price').value || 0);
    const qty = Number(document.getElementById('pur-qty').value || 1);
    const status = document.getElementById('pur-status').value;
    const date = document.getElementById('pur-date').value;

    const taxable = unitPrice * qty;
    const taxRate = gstRatePercent / 100;
    const cgst = taxable * (taxRate / 2);
    const sgst = taxable * (taxRate / 2);
    const grandTotal = taxable + cgst + sgst;

    const newPur = {
      id: 'pur-' + Date.now(),
      billNumber: billNumber,
      vendorName: vendorName,
      gstin: '27AAACT1234F1Z9',
      date: date,
      placeOfSupply: '27-Maharashtra',
      items: [{ name: prodName, qty, price: unitPrice, hsn: gstRatePercent + '% GST', amount: taxable }],
      taxableAmount: taxable,
      cgst,
      sgst,
      igst: 0,
      grandTotal,
      status: status
    };

    store.state.purchases.unshift(newPur);
    store.save();
    window.closeModal();
    renderApp();
  } catch (err) {
    console.error('Purchase error:', err);
    alert('Purchase notice: ' + err.message);
  }
};

// DELETE PURCHASE
window.deletePurchase = (purId) => {
  if (confirm('Are you sure you want to delete this purchase bill record?')) {
    store.state.purchases = store.state.purchases.filter(p => p.id !== purId);
    store.save();
    renderApp();
  }
};

// ==========================================================================
// ORDERS SYSTEM (PURCHASE ORDERS & SALES ORDERS)
// ==========================================================================

// 1. OPEN CREATE ORDER MODAL
window.openCreateOrderModal = (defaultType = 'Sales Order') => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">📋 Issue ${defaultType === 'Purchase Order' ? 'Purchase Order (PO)' : 'Sales Order (SO)'}</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-order-form" onsubmit="window.saveNewOrder(event)">
        
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Order Type</label>
            <select class="form-select" id="ord-type">
              <option value="Purchase Order" ${defaultType === 'Purchase Order' ? 'selected' : ''}>Purchase Order (Vendor Procurement)</option>
              <option value="Sales Order" ${defaultType === 'Sales Order' ? 'selected' : ''}>Sales Order (Customer Order)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Customer / Vendor Name</label>
            <input type="text" class="form-input" id="ord-party-name" placeholder="e.g. Acme Tech Solutions" list="all-parties-list" required />
            <datalist id="all-parties-list">
              ${store.state.parties.map(p => `<option value="${p.name}">${p.type}: ${p.gstin}</option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Item / Product Description</label>
            <input type="text" class="form-input" id="ord-prod-name" placeholder="e.g. Wireless Mouse Pro" list="products-datalist" required />
          </div>

          <div class="form-group">
            <label class="form-label">Agreed Rate / Price (₹)</label>
            <input type="number" class="form-input" id="ord-price" placeholder="e.g. 5000" min="0" step="any" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-input" id="ord-qty" value="1" min="1" required />
          </div>

          <div class="form-group">
            <label class="form-label">Expected Delivery / Fulfillment Date</label>
            <input type="date" class="form-input" id="ord-exp-date" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">📋 Issue Official Order</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

// 2. SAVE NEW ORDER
window.saveNewOrder = (e) => {
  e.preventDefault();
  try {
    const type = document.getElementById('ord-type').value;
    const partyName = document.getElementById('ord-party-name').value.trim();
    const prodName = document.getElementById('ord-prod-name').value.trim();
    const price = Number(document.getElementById('ord-price').value || 0);
    const qty = Number(document.getElementById('ord-qty').value || 1);
    const expectedDate = document.getElementById('ord-exp-date').value;

    const subtotal = price * qty;
    const grandTotal = subtotal * 1.18; // 18% tax estimate

    const prefix = type === 'Sales Order' ? 'SO-2026-' : 'PO-2026-';
    const orderNumber = prefix + Math.floor(100 + Math.random() * 900);

    const newOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: orderNumber,
      type: type,
      partyName: partyName,
      gstin: '27AAACA9988B1Z1',
      date: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate,
      items: [{ name: prodName, qty, price, amount: subtotal }],
      grandTotal: grandTotal,
      status: 'Pending'
    };

    store.state.orders.unshift(newOrder);
    store.save();
    window.closeModal();
    renderApp();
  } catch (err) {
    console.error('Order creation error:', err);
    alert('Order notice: ' + err.message);
  }
};

// DELETE ORDER
window.deleteOrder = (ordId) => {
  if (confirm('Are you sure you want to cancel / delete this order?')) {
    store.state.orders = store.state.orders.filter(o => o.id !== ordId);
    store.save();
    renderApp();
  }
};

// 2. ADD NEW PRODUCT MODAL
window.openAddProductModal = () => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">📦 Add New Product / Stock Item</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-product-form" onsubmit="window.saveNewProduct(event)">
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Item Name</label>
            <input type="text" class="form-input" id="prod-name" placeholder="e.g. Wireless Mouse Pro" required />
          </div>
          <div class="form-group">
            <label class="form-label">SKU / Code</label>
            <input type="text" class="form-input" id="prod-sku" placeholder="e.g. WM-PRO" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">HSN / SAC Code</label>
            <input type="text" class="form-input" id="prod-hsn" placeholder="e.g. 8471" required />
          </div>
          <div class="form-group">
            <label class="form-label">Sales Price (₹)</label>
            <input type="number" class="form-input" id="prod-price" placeholder="e.g. 2490" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Initial Stock Quantity</label>
            <input type="number" class="form-input" id="prod-stock" value="10" required />
          </div>
          <div class="form-group">
            <label class="form-label">Unit of Measure</label>
            <select class="form-select" id="prod-unit">
              <option value="PCS">PCS (Pieces)</option>
              <option value="NOS">NOS (Numbers)</option>
              <option value="KG">KG (Kilograms)</option>
              <option value="BOX">BOX (Boxes)</option>
              <option value="MTR">MTR (Meters)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">+ Add Product to Stock</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

window.saveNewProduct = (e) => {
  e.preventDefault();
  const name = document.getElementById('prod-name').value;
  const sku = document.getElementById('prod-sku').value;
  const hsn = document.getElementById('prod-hsn').value;
  const price = Number(document.getElementById('prod-price').value);
  const stock = Number(document.getElementById('prod-stock').value);
  const unit = document.getElementById('prod-unit').value;

  const newProd = {
    id: 'p-' + Date.now(),
    name,
    sku,
    hsn,
    price,
    stock,
    unit
  };

  store.state.products.unshift(newProd);
  store.save();
  window.closeModal();
  renderApp();
};

// 3. ADD NEW PARTY MODAL
window.openAddPartyModal = () => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">👥 Add New Customer or Vendor</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-party-form" onsubmit="window.saveNewParty(event)">
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Party Name</label>
            <input type="text" class="form-input" id="party-name" placeholder="e.g. Infotech Systems Ltd" required />
          </div>
          <div class="form-group">
            <label class="form-label">Party Type</label>
            <select class="form-select" id="party-type">
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor / Supplier</option>
            </select>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">GSTIN (Optional)</label>
            <input type="text" class="form-input" id="party-gstin" placeholder="e.g. 27AAACI1234D1Z8" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" class="form-input" id="party-phone" placeholder="e.g. +91 98765 43210" required />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">State / Region</label>
          <select class="form-select" id="party-state">
            <option value="27-Maharashtra">27-Maharashtra</option>
            <option value="29-Karnataka">29-Karnataka</option>
            <option value="07-Delhi">07-Delhi</option>
            <option value="33-Tamil Nadu">33-Tamil Nadu</option>
            <option value="09-Uttar Pradesh">09-Uttar Pradesh</option>
          </select>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">+ Save Party</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

// Double tap gesture handler for mobile / touchscreen users
let lastRowTapTime = 0;
window.handleRowTouch = (invId) => {
  const now = Date.now();
  if (now - lastRowTapTime < 350) {
    window.viewInvoiceLetter(invId);
  }
  lastRowTapTime = now;
};

window.saveNewParty = (e) => {
  e.preventDefault();
  const name = document.getElementById('party-name').value;
  const type = document.getElementById('party-type').value;
  const gstin = document.getElementById('party-gstin').value || 'URP';
  const phone = document.getElementById('party-phone').value;
  const state = document.getElementById('party-state').value;

  const newParty = {
    id: 'pt-' + Date.now(),
    name,
    type,
    gstin,
    phone,
    state,
    balance: 0
  };

  store.state.parties.unshift(newParty);
  store.save();
  window.closeModal();
  renderApp();
};

// PRINT & EXPORT HANDLERS
window.printInvoice = (invoiceId) => {
  const inv = store.state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  const printable = document.getElementById('printable-area');
  printable.style.display = 'block';
  printable.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 20px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <div>
          <h2 style="margin: 0; font-size: 24px;">TAX INVOICE</h2>
          <h3 style="margin: 5px 0;">${store.state.businessInfo.name}</h3>
          <p style="margin: 0; font-size: 12px;">GSTIN: ${store.state.businessInfo.gstin}</p>
          <p style="margin: 0; font-size: 12px;">${store.state.businessInfo.address}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-weight: bold;">Invoice No: ${inv.invoiceNumber}</p>
          <p style="margin: 0;">Date: ${inv.date}</p>
          <p style="margin: 0;">Place of Supply: ${inv.placeOfSupply}</p>
        </div>
      </div>

      <div style="margin: 15px 0; padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">
        <h4 style="margin: 0 0 5px 0;">Billed To:</h4>
        <p style="margin: 0; font-weight: bold;">${inv.partyName}</p>
        <p style="margin: 0; font-size: 12px;">GSTIN: ${inv.gstin}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #eee;">
            <th style="border: 1px solid #000; padding: 8px;">Item Description</th>
            <th style="border: 1px solid #000; padding: 8px;">HSN</th>
            <th style="border: 1px solid #000; padding: 8px;">Qty</th>
            <th style="border: 1px solid #000; padding: 8px;">Rate (₹)</th>
            <th style="border: 1px solid #000; padding: 8px;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.hsn}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.qty}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;">${fmt(item.price)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;">${fmt(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
        <table style="width: 300px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px;">Taxable Amount:</td>
            <td style="text-align: right; padding: 4px;">₹${fmt(inv.taxableAmount)}</td>
          </tr>
          ${inv.cgst ? `<tr><td style="padding: 4px;">CGST (9%):</td><td style="text-align: right; padding: 4px;">₹${fmt(inv.cgst)}</td></tr>` : ''}
          ${inv.sgst ? `<tr><td style="padding: 4px;">SGST (9%):</td><td style="text-align: right; padding: 4px;">₹${fmt(inv.sgst)}</td></tr>` : ''}
          ${inv.igst ? `<tr><td style="padding: 4px;">IGST (18%):</td><td style="text-align: right; padding: 4px;">₹${fmt(inv.igst)}</td></tr>` : ''}
          <tr style="font-weight: bold; border-top: 2px solid #000;">
            <td style="padding: 6px;">Grand Total:</td>
            <td style="text-align: right; padding: 6px;">₹${fmt(inv.grandTotal)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  window.print();
  setTimeout(() => { printable.style.display = 'none'; }, 1000);
};

window.exportGstJson = (tab) => {
  const jsonStr = JSON.stringify(store.state.invoices, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BillKraft_${tab.toUpperCase()}_GST_Filing.json`;
  a.click();
};

// Global Navigation Controllers
window.navigate = (viewName) => {
  try {
    window.closeModal();
    store.state.activeView = viewName;
    store.save();
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error('Navigation error:', e);
  }
};

window.switchGstTab = (tabName) => {
  store.state.activeGstTab = tabName;
  store.save();
  renderApp();
};

window.switchSalesTab = (tabName) => {
  store.state.activeSalesTab = tabName;
  store.save();
  renderApp();
};

window.switchPurchasesTab = (tabName) => {
  store.state.activePurchasesTab = tabName;
  store.save();
  renderApp();
};

window.filterSalesRevenuePeriod = (period) => {
  store.state.salesPeriodFilter = period;
  store.save();
  renderApp();
};

window.toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  store.state.theme = next;
  store.save();
};

// ==========================================================================
// RENDER VIEWS
// ==========================================================================

// High-Performance 60FPS Render Scheduler
let renderScheduled = false;

function renderApp() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    executeRenderApp();
  });
}

function executeRenderApp() {
  document.documentElement.setAttribute('data-theme', store.state.theme || 'light');
  window.closeModal();

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + store.state.activeView);
  if (activeNav) activeNav.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const subEl = document.getElementById('page-subtitle');
  const container = document.getElementById('content-container');

  if (!container) return;

  // CRITICAL FIX: Always wipe container innerHTML completely clean before rendering new view to prevent overlapping!
  container.innerHTML = '';

  if (store.state.activeView === 'dashboard') {
    titleEl.innerText = 'Executive Dashboard';
    subEl.innerText = 'Real-time overview of sales, purchases, cashflow receivables, payables, and inventory alerts';

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const todayStr = `${year}-${month}-${day}`;
    const currentMonthStr = `${year}-${month}`;
    const currentYearStr = `${year}`;

    // Calculate Start of Week (Monday) without mutating Date object
    const dayOfWeek = now.getDay();
    const distToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

    const monday = new Date(now);
    monday.setDate(now.getDate() - distToMon);

    const monYear = monday.getFullYear();
    const monMonth = String(monday.getMonth() + 1).padStart(2, '0');
    const monDay = String(monday.getDate()).padStart(2, '0');
    const mondayStr = `${monYear}-${monMonth}-${monDay}`;

    // Real Sales Revenue Time Breakdowns
    const todaySales = store.state.invoices
      .filter(inv => inv.date === todayStr)
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisWeekSales = store.state.invoices
      .filter(inv => inv.date && inv.date >= mondayStr && inv.date <= todayStr)
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisMonthSales = store.state.invoices
      .filter(inv => inv.date && inv.date.startsWith(currentMonthStr))
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisYearSales = store.state.invoices
      .filter(inv => inv.date && inv.date.startsWith(currentYearStr))
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    // Real Purchases Time Breakdowns
    const todayPurchases = store.state.purchases
      .filter(p => p.date === todayStr)
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisWeekPurchases = store.state.purchases
      .filter(p => p.date && p.date >= mondayStr && p.date <= todayStr)
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisMonthPurchases = store.state.purchases
      .filter(p => p.date && p.date.startsWith(currentMonthStr))
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const thisYearPurchases = store.state.purchases
      .filter(p => p.date && p.date.startsWith(currentYearStr))
      .reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const totalSales = store.state.invoices.reduce((a, b) => a + Number(b.grandTotal || 0), 0);
    const totalPurchases = store.state.purchases.reduce((a, b) => a + Number(b.grandTotal || 0), 0);

    const salesFilter = store.state.salesPeriodFilter || 'all';
    let displayedSalesVal = totalSales;
    let periodTrendLabel = 'All Outward Sales Invoices';

    if (salesFilter === 'today') {
      displayedSalesVal = todaySales;
      periodTrendLabel = `📅 Today's Sales (${todayStr})`;
    } else if (salesFilter === 'week') {
      displayedSalesVal = thisWeekSales;
      periodTrendLabel = '🗓️ Weekly Sales Total';
    } else if (salesFilter === 'month') {
      displayedSalesVal = thisMonthSales;
      periodTrendLabel = '📆 Current Month Sales Total';
    } else if (salesFilter === 'year') {
      displayedSalesVal = thisYearSales;
      periodTrendLabel = '📈 Annual Fiscal Total';
    }

    const purchasesFilter = store.state.purchasesPeriodFilter || 'all';
    let displayedPurchasesVal = totalPurchases;
    let purchasesTrendLabel = 'Inward Procurement';

    if (purchasesFilter === 'today') {
      displayedPurchasesVal = todayPurchases;
      purchasesTrendLabel = `📅 Today's Purchases (${todayStr})`;
    } else if (purchasesFilter === 'week') {
      displayedPurchasesVal = thisWeekPurchases;
      purchasesTrendLabel = '🗓️ Weekly Purchases Total';
    } else if (purchasesFilter === 'month') {
      displayedPurchasesVal = thisMonthPurchases;
      purchasesTrendLabel = '📆 Current Month Purchases';
    } else if (purchasesFilter === 'year') {
      displayedPurchasesVal = thisYearPurchases;
      purchasesTrendLabel = '📈 Annual Purchases Total';
    }
    
    // Amount Receivable: Invoices that are Unpaid / Pending or 15% estimated receivables
    const amountReceivable = store.state.invoices.filter(i => i.status && i.status.includes('Pending')).reduce((a, b) => a + Number(b.grandTotal || 0), 0) || Math.round(totalSales * 0.15);
    
    // Amount Payable: Purchases that are Unpaid / Pending or 20% estimated payables
    const amountPayable = store.state.purchases.filter(p => p.status && p.status.includes('Pending')).reduce((a, b) => a + Number(b.grandTotal || 0), 0) || Math.round(totalPurchases * 0.20);
    
    const lowStockItems = store.state.products.filter(p => Number(p.stock || 0) < 10);

    container.innerHTML = `
      <!-- Top Financial Metrics Grid (Small Compact Size) -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.5rem; margin-bottom: 0.75rem;">
        
        <div class="stat-card" style="padding: 0.5rem 0.75rem; gap: 0.2rem;">
          <div class="stat-header" style="display: flex; justify-content: space-between; align-items: center; gap: 0.25rem;">
            <span class="stat-label" style="font-size: 0.65rem;">Total Sales Revenue</span>
            <select class="form-select" onchange="window.filterSalesRevenuePeriod(this.value)" style="width: auto; padding: 0.05rem 0.25rem; font-size: 0.65rem; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--primary);">
              <option value="all" ${salesFilter === 'all' ? 'selected' : ''}>All Time</option>
              <option value="today" ${salesFilter === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${salesFilter === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${salesFilter === 'month' ? 'selected' : ''}>This Month</option>
              <option value="year" ${salesFilter === 'year' ? 'selected' : ''}>This Year</option>
            </select>
          </div>
          <div class="stat-value" style="font-size: 1.1rem; margin-top: 0.1rem;">₹${fmt(displayedSalesVal)}</div>
          <div class="stat-trend trend-up" style="font-size: 0.65rem;">${periodTrendLabel}</div>
        </div>

        <div class="stat-card emerald" style="padding: 0.5rem 0.75rem; gap: 0.2rem;">
          <div class="stat-header" style="display: flex; justify-content: space-between; align-items: center; gap: 0.25rem;">
            <span class="stat-label" style="font-size: 0.65rem;">Total Purchases</span>
            <select class="form-select" onchange="window.filterPurchasesPeriod(this.value)" style="width: auto; padding: 0.05rem 0.25rem; font-size: 0.65rem; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--emerald);">
              <option value="all" ${purchasesFilter === 'all' ? 'selected' : ''}>All Time</option>
              <option value="today" ${purchasesFilter === 'today' ? 'selected' : ''}>Today</option>
              <option value="week" ${purchasesFilter === 'week' ? 'selected' : ''}>This Week</option>
              <option value="month" ${purchasesFilter === 'month' ? 'selected' : ''}>This Month</option>
              <option value="year" ${purchasesFilter === 'year' ? 'selected' : ''}>This Year</option>
            </select>
          </div>
          <div class="stat-value" style="font-size: 1.1rem; margin-top: 0.1rem;">₹${fmt(displayedPurchasesVal)}</div>
          <div class="stat-trend trend-up" style="font-size: 0.65rem;">${purchasesTrendLabel}</div>
        </div>

        <div class="stat-card amber" style="padding: 0.5rem 0.75rem; gap: 0.2rem;">
          <div class="stat-header">
            <span class="stat-label" style="font-size: 0.65rem;">Amount Receivable</span>
            <div class="stat-icon" style="width: 22px; height: 22px; font-size: 0.75rem;">📥</div>
          </div>
          <div class="stat-value" style="font-size: 1.1rem; margin-top: 0.1rem;">₹${fmt(amountReceivable)}</div>
          <div class="stat-trend trend-up" style="font-size: 0.65rem;">From Customers</div>
        </div>

        <div class="stat-card rose" style="padding: 0.5rem 0.75rem; gap: 0.2rem;">
          <div class="stat-header">
            <span class="stat-label" style="font-size: 0.65rem;">Amount Payable</span>
            <div class="stat-icon" style="width: 22px; height: 22px; font-size: 0.75rem;">📤</div>
          </div>
          <div class="stat-value" style="font-size: 1.1rem; margin-top: 0.1rem;">₹${fmt(amountPayable)}</div>
          <div class="stat-trend trend-down" style="font-size: 0.65rem;">To Suppliers</div>
        </div>

        <div class="stat-card" style="padding: 0.5rem 0.75rem; gap: 0.2rem;">
          <div class="stat-header">
            <span class="stat-label" style="font-size: 0.65rem;">Low Stock Warning</span>
            <div class="stat-icon" style="width: 22px; height: 22px; font-size: 0.75rem;">⚠️</div>
          </div>
          <div class="stat-value" style="font-size: 1.1rem; margin-top: 0.1rem;">${lowStockItems.length} Items</div>
          <div class="stat-trend trend-down" style="font-size: 0.65rem;">Needs Reorder</div>
        </div>

      </div>

      <!-- Low Stock Warning Notification Banner (Micro Compact) -->
      ${lowStockItems.length ? `
        <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid var(--rose); border-radius: var(--radius-md); padding: 0.4rem 0.75rem; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.3rem; color: var(--rose); font-weight: 700; font-size: 0.775rem; font-family: var(--font-main);">
              <span>⚠️</span> LOW STOCK NOTIFICATION (${lowStockItems.length} Critical Items)
            </div>
            <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;" onclick="window.navigate('inventory')">View Inventory</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.4rem;">
            ${lowStockItems.map(p => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.725rem;">
                <div style="font-weight: 700;">${p.name}</div>
                <div style="color: var(--rose); font-weight: 800; font-size: 0.775rem; margin-top: 0.05rem;">Stock: ${p.stock} ${p.unit}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Dashboard Recent Activity & Quick Action Card -->
      <div class="gst-studio-card" style="padding: 0.75rem 1rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Recent Invoices & Transactions</h3>
            <p style="font-size: 0.725rem; color: var(--text-muted);">Overview of latest generated sales invoices</p>
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.navigate('gst')">📜 GST Studio</button>
            <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openCreateInvoiceModal()">+ New Invoice</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th style="padding: 0.35rem 0.5rem;">Invoice No</th>
                <th style="padding: 0.35rem 0.5rem;">Date</th>
                <th style="padding: 0.35rem 0.5rem;">Party Name</th>
                <th style="padding: 0.35rem 0.5rem;">Grand Total</th>
                <th style="padding: 0.35rem 0.5rem;">Status</th>
                <th style="padding: 0.35rem 0.5rem;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.invoices.slice(0, 5).map(inv => `
                <tr class="invoice-row" ondblclick="window.viewInvoiceLetter('${inv.id}')" ontouchstart="window.handleRowTouch('${inv.id}')" title="Double click to open Tax Invoice Letter">
                  <td style="padding: 0.35rem 0.5rem;"><strong>${inv.invoiceNumber}</strong></td>
                  <td style="padding: 0.35rem 0.5rem;">${inv.date}</td>
                  <td style="padding: 0.35rem 0.5rem;">${inv.partyName}</td>
                  <td style="padding: 0.35rem 0.5rem;"><strong>₹${fmt(inv.grandTotal)}</strong></td>
                  <td style="padding: 0.35rem 0.5rem;"><span class="badge badge-success" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${inv.status}</span></td>
                  <td style="padding: 0.35rem 0.5rem;" onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 0.25rem; align-items: center; white-space: nowrap;">
                      <button class="btn btn-primary" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;" onclick="window.viewInvoiceLetter('${inv.id}')">View</button>
                      <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.65rem;" onclick="window.printInvoice('${inv.id}')">🖨️ Print</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'gst') {
    titleEl.innerText = 'GST Reports & Compliance Studio';
    subEl.innerText = 'Dedicated GST filing reports (GSTR-1, GSTR-2B, GSTR-3B, GSTR-7 & HSN Summary)';
    container.innerHTML = renderGstStudio(store.state.activeGstTab, store.state);
  } else if (store.state.activeView === 'pos') {
    titleEl.innerText = 'Express POS Billing';
    subEl.innerText = 'High-speed retail checkout & receipt printing';
    container.innerHTML = renderPosTerminal(store.state);
  } else if (store.state.activeView === 'invoices') {
    titleEl.innerText = 'Invoices & Sales';
    subEl.innerText = 'Create, track, print, and delete GST tax invoices';
    container.innerHTML = `
      <div class="gst-studio-card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-family: var(--font-display);">Sales Tax Invoices</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Double click any invoice row to open full Tax Invoice Letter</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" onclick="window.openCreateInvoiceModal()">+ Create Sales Tax Invoice</button>
            <button class="btn btn-outline" style="color: var(--rose);" onclick="window.resetAllData()">🔄 Reset Demo Data</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Party Name</th>
                <th>Taxable Val</th>
                <th>GST Amount</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.invoices.length ? store.state.invoices.map(inv => `
                <tr class="invoice-row" ondblclick="window.viewInvoiceLetter('${inv.id}')" ontouchstart="window.handleRowTouch('${inv.id}')" title="Double click to open Tax Invoice Letter">
                  <td><strong>${inv.invoiceNumber}</strong></td>
                  <td>${inv.date}</td>
                  <td>${inv.partyName}</td>
                  <td>₹${fmt(inv.taxableAmount)}</td>
                  <td>₹${fmt((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))}</td>
                  <td><strong>₹${fmt(inv.grandTotal)}</strong></td>
                  <td><span class="badge badge-success">${inv.status}</span></td>
                  <td onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 0.35rem; align-items: center; white-space: nowrap;">
                      <button class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.viewInvoiceLetter('${inv.id}')">View</button>
                      <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.printInvoice('${inv.id}')">🖨️ Print</button>
                      <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteInvoice('${inv.id}')">🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No invoices available. Click "+ Create Sales Tax Invoice" to add one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'estimates') {
    titleEl.innerText = 'Estimates & Proforma Quotations';
    subEl.innerText = 'Create formal GST price estimates and convert approved quotes directly into Tax Invoices';
    
    if (!store.state.estimates) store.state.estimates = [];
    const totalEstimatesVal = store.state.estimates.reduce((acc, e) => acc + Number(e.grandTotal || 0), 0);
    const approvedCount = store.state.estimates.filter(e => e.status === 'Approved').length;
    const convertedCount = store.state.estimates.filter(e => e.status === 'Converted').length;

    container.innerHTML = `
      <!-- Top Estimates Metrics (Uniform Small Compact Size) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Quotation Value</span>
            <div class="stat-icon">📑</div>
          </div>
          <div class="stat-value">₹${fmt(totalEstimatesVal)}</div>
          <div class="stat-trend trend-up">Active Quotations</div>
        </div>

        <div class="stat-card emerald">
          <div class="stat-header">
            <span class="stat-label">Approved Quotations</span>
            <div class="stat-icon">✅</div>
          </div>
          <div class="stat-value">${approvedCount} Quotes</div>
          <div class="stat-trend trend-up">Ready to Convert</div>
        </div>

        <div class="stat-card amber">
          <div class="stat-header">
            <span class="stat-label">Converted to Invoice</span>
            <div class="stat-icon">🧾</div>
          </div>
          <div class="stat-value">${convertedCount} Converted</div>
          <div class="stat-trend trend-up">Fulfilled Invoices</div>
        </div>
      </div>

      <div class="gst-studio-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Proforma Estimates & Quotations</h3>
            <p style="font-size: 0.725rem; color: var(--text-muted);">Manage sales quotes, send estimates to clients, and convert to Sales Invoice in 1-click</p>
          </div>
          <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openCreateEstimateModal()">+ Create New Estimate</button>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th>Estimate No</th>
                <th>Date</th>
                <th>Valid Until</th>
                <th>Customer / Party Name</th>
                <th>Taxable Val</th>
                <th>GST Tax</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.estimates.length ? store.state.estimates.map(est => `
                <tr class="invoice-row" ondblclick="window.viewEstimateLetter('${est.id}')" title="Double click to view Proforma Quotation">
                  <td><strong>${est.estimateNumber}</strong></td>
                  <td>${est.date}</td>
                  <td><strong style="color: var(--text-muted);">${est.validUntil || 'N/A'}</strong></td>
                  <td>${est.partyName}</td>
                  <td>₹${fmt(est.taxableAmount)}</td>
                  <td>₹${fmt((est.cgst || 0) + (est.sgst || 0) + (est.igst || 0))}</td>
                  <td><strong>₹${fmt(est.grandTotal)}</strong></td>
                  <td>
                    <span class="badge ${est.status === 'Converted' ? 'badge-success' : est.status === 'Approved' ? 'badge-info' : 'badge-warning'}">${est.status || 'Sent'}</span>
                  </td>
                  <td onclick="event.stopPropagation()">
                    <div style="display: flex; gap: 0.35rem; align-items: center; white-space: nowrap;">
                      ${est.status !== 'Converted' ? `
                        <button class="btn btn-emerald" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.convertEstimateToInvoice('${est.id}')" title="Convert quote to Sales Tax Invoice">⚡ Convert to Invoice</button>
                      ` : ''}
                      <button class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.viewEstimateLetter('${est.id}')">View</button>
                      <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.printEstimate('${est.id}')">🖨️ Print</button>
                      <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteEstimate('${est.id}')">🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No estimates created yet. Click "+ Create New Estimate" to issue one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'purchases') {
    titleEl.innerText = 'Purchases & Vendor Bills';
    subEl.innerText = 'Record inward vendor bills, track purchases, and claim Input Tax Credit (ITC)';

    const totalPurchasesVal = store.state.purchases.reduce((acc, p) => acc + Number(p.grandTotal || 0), 0);
    const totalItcClaimable = store.state.purchases.reduce((acc, p) => acc + Number((p.cgst || 0) + (p.sgst || 0) + (p.igst || 0)), 0);

    container.innerHTML = `
      <!-- Top Purchase Metrics (Uniform Small Compact Size) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Inward Purchases</span>
            <div class="stat-icon">🛍️</div>
          </div>
          <div class="stat-value">₹${fmt(totalPurchasesVal)}</div>
          <div class="stat-trend trend-up">Supplier Procurement</div>
        </div>

        <div class="stat-card emerald">
          <div class="stat-header">
            <span class="stat-label">Eligible Input Tax Credit (ITC)</span>
            <div class="stat-icon">📥</div>
          </div>
          <div class="stat-value">₹${fmt(totalItcClaimable)}</div>
          <div class="stat-trend trend-up">Available for GSTR-3B Set-off</div>
        </div>

        <div class="stat-card amber">
          <div class="stat-header">
            <span class="stat-label">Vendor Bills Count</span>
            <div class="stat-icon">📑</div>
          </div>
          <div class="stat-value">${store.state.purchases.length} Bills</div>
          <div class="stat-trend trend-up">100% Tax Documented</div>
        </div>
      </div>

      <div class="gst-studio-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Purchases & Inward Bills Directory</h3>
            <p style="font-size: 0.725rem; color: var(--text-muted);">Manage vendor invoices and input GST claims</p>
          </div>
          <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openCreatePurchaseModal()">+ Record Purchase Bill</button>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Vendor / Supplier</th>
                <th>Taxable Val</th>
                <th>ITC Tax Amount</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.purchases.length ? store.state.purchases.map(pur => `
                <tr class="invoice-row">
                  <td><strong>${pur.billNumber}</strong></td>
                  <td>${pur.date}</td>
                  <td>
                    <div><strong>${pur.vendorName}</strong></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${pur.gstin}</div>
                  </td>
                  <td>₹${fmt(pur.taxableAmount)}</td>
                  <td><strong style="color: var(--emerald);">₹${fmt((pur.cgst || 0) + (pur.sgst || 0) + (pur.igst || 0))}</strong></td>
                  <td><strong>₹${fmt(pur.grandTotal)}</strong></td>
                  <td><span class="badge badge-success">${pur.status}</span></td>
                  <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deletePurchase('${pur.id}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No purchase bills recorded. Click "+ Record Purchase Bill" to add one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'orders') {
    titleEl.innerText = 'Purchase & Sales Orders';
    subEl.innerText = 'Issue and track Sales Orders (SO) & Purchase Orders (PO)';

    const salesOrdersCount = store.state.orders.filter(o => o.type === 'Sales Order').length;
    const purchaseOrdersCount = store.state.orders.filter(o => o.type === 'Purchase Order').length;
    const totalOrderVal = store.state.orders.reduce((acc, o) => acc + Number(o.grandTotal || 0), 0);

    container.innerHTML = `
      <!-- Top Order Metrics (Uniform Small Compact Size) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Sales Orders (SO)</span>
            <div class="stat-icon">📋</div>
          </div>
          <div class="stat-value">${salesOrdersCount} Orders</div>
          <div class="stat-trend trend-up">Customer Commitments</div>
        </div>

        <div class="stat-card emerald">
          <div class="stat-header">
            <span class="stat-label">Purchase Orders (PO)</span>
            <div class="stat-icon">📦</div>
          </div>
          <div class="stat-value">${purchaseOrdersCount} Orders</div>
          <div class="stat-trend trend-up">Vendor Procurement</div>
        </div>

        <div class="stat-card amber">
          <div class="stat-header">
            <span class="stat-label">Total Order Pipeline Value</span>
            <div class="stat-icon">💰</div>
          </div>
          <div class="stat-value">₹${fmt(totalOrderVal)}</div>
          <div class="stat-trend trend-up">Active Fulfillment Pipeline</div>
        </div>
      </div>

      <div class="gst-studio-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Orders Directory</h3>
            <p style="font-size: 0.725rem; color: var(--text-muted);">Manage sales orders (customer) and purchase orders (vendor procurement)</p>
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button class="btn btn-emerald" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openCreateOrderModal('Purchase Order')">📦 + Create Purchase Order (PO)</button>
            <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openCreateOrderModal('Sales Order')">📋 + Create Sales Order (SO)</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Type</th>
                <th>Party Name</th>
                <th>Order Date</th>
                <th>Expected Date</th>
                <th>Est. Grand Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.orders.length ? store.state.orders.map(ord => `
                <tr class="invoice-row">
                  <td><strong style="color: var(--primary);">${ord.orderNumber}</strong></td>
                  <td><span class="badge ${ord.type === 'Sales Order' ? 'badge-info' : 'badge-warning'}">${ord.type}</span></td>
                  <td><strong>${ord.partyName}</strong></td>
                  <td>${ord.date}</td>
                  <td><strong style="color: var(--emerald);">${ord.expectedDate}</strong></td>
                  <td><strong>₹${fmt(ord.grandTotal)}</strong></td>
                  <td><span class="badge badge-success">${ord.status}</span></td>
                  <td style="display: flex; gap: 0.35rem; align-items: center;">
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteOrder('${ord.id}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No orders recorded. Click "+ Create Purchase Order (PO)" or "+ Create Sales Order (SO)" to issue one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'inventory') {
    titleEl.innerText = 'Stock & Inventory';
    subEl.innerText = 'Track product stock, HSN codes, and pricing';
    container.innerHTML = `
      <div class="gst-studio-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Product & Stock Directory</h3>
          <button class="btn btn-emerald" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openAddProductModal()">+ Add New Product</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>SKU</th>
                <th>HSN Code</th>
                <th>Price (₹)</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.products.length ? store.state.products.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.sku}</td>
                  <td>${p.hsn}</td>
                  <td>₹${fmt(p.price)}</td>
                  <td><strong>${p.stock} ${p.unit}</strong></td>
                  <td>
                    ${p.stock < 10 
                      ? '<span class="badge badge-warning">Low Stock</span>' 
                      : '<span class="badge badge-success">In Stock</span>'}
                  </td>
                  <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteProduct('${p.id}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No products in inventory. Click "+ Add New Product" to create one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'parties') {
    titleEl.innerText = 'Customers & Parties';
    subEl.innerText = 'Manage customer & vendor GSTIN directories';
    container.innerHTML = `
      <div class="gst-studio-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-family: var(--font-main); font-size: 0.95rem;">Parties Directory</h3>
          <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.725rem;" onclick="window.openAddPartyModal()">+ Add New Party</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.775rem;">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Type</th>
                <th>GSTIN</th>
                <th>Phone</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.parties.length ? store.state.parties.map(pt => `
                <tr>
                  <td><strong>${pt.name}</strong></td>
                  <td><span class="badge badge-info">${pt.type}</span></td>
                  <td>${pt.gstin}</td>
                  <td>${pt.phone}</td>
                  <td>${pt.state}</td>
                  <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteParty('${pt.id}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No customer or vendor records. Click "+ Add New Party" to add one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (store.state.activeView === 'eway') {
    titleEl.innerText = 'E-Way Bills Hub & Logistics';
    subEl.innerText = 'Generate, track, print, and cancel electronic waybills for movement of goods';
    
    const activeEwayCount = store.state.ewayBills.filter(e => e.status.includes('Valid')).length;
    const totalFreightKm = store.state.ewayBills.reduce((acc, e) => acc + Number(e.distance || 0), 0);
    const totalCargoVal = store.state.ewayBills.reduce((acc, e) => acc + Number(e.grandTotal || 0), 0);

    container.innerHTML = `
      <!-- Top E-Way Metrics Row (Uniform Small Compact Size) -->
      <div class="stats-grid">
        <div class="stat-card emerald">
          <div class="stat-header">
            <span class="stat-label">Active E-Way Bills</span>
            <div class="stat-icon">🚛</div>
          </div>
          <div class="stat-value">${activeEwayCount} Active</div>
          <div class="stat-trend trend-up">NIC GST Portal Verified</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Freight Distance</span>
            <div class="stat-icon">🛣️</div>
          </div>
          <div class="stat-value">${totalFreightKm} KM</div>
          <div class="stat-trend trend-up">Multi-state Transit</div>
        </div>

        <div class="stat-card amber">
          <div class="stat-header">
            <span class="stat-label">In-Transit Cargo Value</span>
            <div class="stat-icon">📦</div>
          </div>
          <div class="stat-value">₹${fmt(totalCargoVal)}</div>
          <div class="stat-trend trend-up">Covered under EWB Slips</div>
        </div>

        <div class="stat-card rose">
          <div class="stat-header">
            <span class="stat-label">Compliance Status</span>
            <div class="stat-icon">✅</div>
          </div>
          <div class="stat-value">100% Valid</div>
          <div class="stat-trend trend-up">Rule 138 Compliant</div>
        </div>
      </div>

      <!-- E-Way Bills Directory Card -->
      <div class="gst-studio-card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-family: var(--font-display);">Generated E-Way Bills Directory</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Real-time dispatch, vehicle numbers, and validity tracking</p>
          </div>
          <button class="btn btn-emerald" onclick="window.openCreateEwayModal()">+ Generate New E-Way Bill</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>E-Way Bill No</th>
                <th>Invoice No</th>
                <th>Consignee & GSTIN</th>
                <th>Vehicle No</th>
                <th>Transporter</th>
                <th>Distance</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${store.state.ewayBills.length ? store.state.ewayBills.map(ewb => `
                <tr class="invoice-row" ondblclick="window.viewEwaySlip('${ewb.id}')" title="Double click to open E-Way Bill Slip">
                  <td><strong style="color: var(--primary);">${ewb.ewbNo}</strong></td>
                  <td><strong>${ewb.invoiceNumber}</strong></td>
                  <td>
                    <div><strong>${ewb.consignee}</strong></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${ewb.gstin}</div>
                  </td>
                  <td><span class="badge badge-info">${ewb.vehicleNo}</span></td>
                  <td>${ewb.transporter}</td>
                  <td>${ewb.distance} KM</td>
                  <td><strong style="color: var(--rose);">${ewb.validUntil.split(' ')[0]}</strong></td>
                  <td><span class="badge badge-success">${ewb.status}</span></td>
                  <td style="display: flex; gap: 0.35rem; align-items: center;" onclick="event.stopPropagation()">
                    <button class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.viewEwaySlip('${ewb.id}')">👁️ View Slip</button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.printEwaySlip('${ewb.id}')">🖨️ Print</button>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; color: var(--rose); border-color: var(--rose);" onclick="window.deleteEwayBill('${ewb.id}')">🗑️ Cancel</button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">No E-Way Bills generated. Click "+ Generate New E-Way Bill" to create one.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// Initial render & Navigation Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderApp();

  // Attach direct event listeners to sidebar nav buttons for cross-browser reliability
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = btn.getAttribute('data-view');
      if (view) {
        window.navigate(view);
      }
    });
  });

  // Initialize Draggable Floating Calculator
  makeCalcDraggable();
});

/* ==========================================================================
   FLOATING DRAGGABLE CALCULATOR CONTROLLER
   ========================================================================== */

let calcExpr = '';

window.toggleFloatingCalc = () => {
  const widget = document.getElementById('floating-calc-widget');
  if (!widget) return;
  const isHidden = widget.style.display === 'none' || !widget.style.display;
  widget.style.display = isHidden ? 'flex' : 'none';
};

window.calcInput = (val) => {
  if (calcExpr === 'Error') calcExpr = '';
  calcExpr += val;
  window.updateCalcDisplay();
};

window.calcClear = () => {
  calcExpr = '';
  const histEl = document.getElementById('calc-history');
  if (histEl) histEl.innerHTML = '&nbsp;';
  window.updateCalcDisplay();
};

window.calcBackspace = () => {
  if (calcExpr === 'Error') {
    calcExpr = '';
  } else {
    calcExpr = calcExpr.slice(0, -1);
  }
  window.updateCalcDisplay();
};

window.calcEvaluate = () => {
  try {
    if (!calcExpr) return;
    let evalStr = calcExpr.replace(/×/g, '*').replace(/÷/g, '/');
    let res = Function(`'use strict'; return (${evalStr})`)();
    const histEl = document.getElementById('calc-history');
    if (histEl) histEl.innerText = calcExpr + ' =';
    calcExpr = String(Math.round(res * 100) / 100);
    window.updateCalcDisplay();
  } catch (e) {
    calcExpr = 'Error';
    window.updateCalcDisplay();
  }
};

window.calcApplyGst = (rate) => {
  try {
    let currentVal = Number(document.getElementById('calc-result').innerText) || 0;
    if (isNaN(currentVal) || currentVal === 0) return;
    let gstAmt = currentVal * (rate / 100);
    let totalWithGst = currentVal + gstAmt;
    const histEl = document.getElementById('calc-history');
    if (histEl) histEl.innerText = `₹${currentVal} + ${rate}% GST`;
    calcExpr = String(Math.round(totalWithGst * 100) / 100);
    window.updateCalcDisplay();
  } catch (e) {
    calcExpr = 'Error';
    window.updateCalcDisplay();
  }
};

window.updateCalcDisplay = () => {
  const resEl = document.getElementById('calc-result');
  if (resEl) {
    resEl.innerText = calcExpr || '0';
  }
};

function makeCalcDraggable() {
  const widget = document.getElementById('floating-calc-widget');
  const header = document.getElementById('calc-header');
  if (!widget || !header) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  header.onmousedown = dragMouseDown;
  header.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    widget.style.top = (widget.offsetTop - pos2) + "px";
    widget.style.left = (widget.offsetLeft - pos1) + "px";
    widget.style.bottom = 'auto';
    widget.style.right = 'auto';
  }

  function dragTouchStart(e) {
    if (e.touches.length !== 1) return;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeTouchElement;
    document.ontouchmove = elementTouchMove;
  }

  function elementTouchMove(e) {
    if (e.touches.length !== 1) return;
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    widget.style.top = (widget.offsetTop - pos2) + "px";
    widget.style.left = (widget.offsetLeft - pos1) + "px";
    widget.style.bottom = 'auto';
    widget.style.right = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function closeTouchElement() {
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

/* ==========================================================================
   ESTIMATES & QUOTATIONS CONTROLLER
   ========================================================================== */

window.openCreateEstimateModal = () => {
  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Default 30-day validity
  const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const autoEstNo = 'EST-2026-' + String(Math.floor(100 + Math.random() * 900));

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">📑 Issue Proforma Estimate / Quotation</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="create-estimate-form" onsubmit="window.saveNewEstimate(event)">
        
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Estimate Number</label>
            <input type="text" class="form-input" id="est-no" value="${autoEstNo}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Customer / Client Name</label>
            <input type="text" class="form-input" id="est-party-name" placeholder="e.g. Apex Tech Solutions" list="customers-datalist" required />
            <datalist id="customers-datalist">
              ${store.state.parties.map(p => `<option value="${p.name}">${p.gstin}</option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Quotation Date</label>
            <input type="date" class="form-input" id="est-date" value="${todayStr}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Valid Until Date</label>
            <input type="date" class="form-input" id="est-valid-date" value="${validUntilDate}" required />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Place of Supply</label>
            <select class="form-select" id="est-pos">
              <option value="27-Maharashtra">27-Maharashtra (Intrastate CGST+SGST)</option>
              <option value="29-Karnataka">29-Karnataka (Interstate IGST)</option>
              <option value="07-Delhi">07-Delhi (Interstate IGST)</option>
              <option value="33-Tamil Nadu">33-Tamil Nadu (Interstate IGST)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Item / Product Name</label>
            <input type="text" class="form-input" id="est-prod-name" placeholder="e.g. Type-C Thunderbolt Dock" list="products-datalist" required />
            <datalist id="products-datalist">
              ${store.state.products.map(p => `<option value="${p.name}">₹${p.price}</option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-input" id="est-qty" value="1" min="1" required />
          </div>

          <div class="form-group">
            <label class="form-label">Quoted Rate (₹)</label>
            <input type="number" class="form-input" id="est-price" placeholder="e.g. 12400" min="0" step="any" required />
          </div>

          <div class="form-group">
            <label class="form-label">GST Tax Rate (%)</label>
            <select class="form-select" id="est-gst-rate">
              <option value="18">18% (Standard GST)</option>
              <option value="12">12% (IT Hardware)</option>
              <option value="5">5% (Essentials)</option>
              <option value="28">28% (Luxury)</option>
              <option value="0">0% (Exempt)</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
          <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">📑 Issue Estimate</button>
        </div>
      </form>
    </div>
  `;
  backdrop.classList.add('active');
};

window.saveNewEstimate = (e) => {
  e.preventDefault();
  try {
    const estNo = document.getElementById('est-no').value.trim();
    const partyName = document.getElementById('est-party-name').value.trim();
    const estDate = document.getElementById('est-date').value;
    const validUntil = document.getElementById('est-valid-date').value;
    const pos = document.getElementById('est-pos').value;
    const prodName = document.getElementById('est-prod-name').value.trim();
    const qty = Number(document.getElementById('est-qty').value || 1);
    const price = Number(document.getElementById('est-price').value || 0);
    const gstRatePercent = Number(document.getElementById('est-gst-rate').value || 18);

    const taxableAmount = qty * price;
    const isInterstate = !pos.startsWith('27');

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterstate) {
      igst = taxableAmount * (gstRatePercent / 100);
    } else {
      cgst = taxableAmount * (gstRatePercent / 200);
      sgst = taxableAmount * (gstRatePercent / 200);
    }
    const grandTotal = taxableAmount + cgst + sgst + igst;

    const newEst = {
      id: 'est-' + Date.now(),
      estimateNumber: estNo,
      date: estDate,
      validUntil: validUntil,
      partyName: partyName,
      gstin: '27AAACA9988B1Z1',
      placeOfSupply: pos,
      items: [{ name: prodName, qty, price, hsn: '8471', amount: taxableAmount }],
      taxableAmount,
      cgst,
      sgst,
      igst,
      grandTotal,
      status: 'Sent'
    };

    if (!store.state.estimates) store.state.estimates = [];
    store.state.estimates.unshift(newEst);
    store.save();
    window.closeModal();
    renderApp();
  } catch (err) {
    console.error('Estimate error:', err);
    alert('Estimate notice: ' + err.message);
  }
};

window.convertEstimateToInvoice = (estimateId) => {
  const est = (store.state.estimates || []).find(e => e.id === estimateId);
  if (!est) return;

  if (confirm(`Convert Estimate ${est.estimateNumber} directly into an Official Sales Tax Invoice?`)) {
    const autoInvNo = 'INV-2026-' + String(Math.floor(100 + Math.random() * 900));
    
    const newInv = {
      id: 'inv-' + Date.now(),
      invoiceNumber: autoInvNo,
      date: new Date().toISOString().split('T')[0],
      partyName: est.partyName,
      gstin: est.gstin || '27AAACA9988B1Z1',
      placeOfSupply: est.placeOfSupply || '27-Maharashtra',
      items: JSON.parse(JSON.stringify(est.items || [])),
      taxableAmount: est.taxableAmount,
      cgst: est.cgst,
      sgst: est.sgst,
      igst: est.igst,
      grandTotal: est.grandTotal,
      status: 'Paid'
    };

    est.status = 'Converted';
    store.state.invoices.unshift(newInv);
    store.save();
    alert(`Success! Estimate ${est.estimateNumber} has been converted to Sales Tax Invoice ${newInv.invoiceNumber}.`);
    window.navigate('invoices');
  }
};

window.deleteEstimate = (estimateId) => {
  if (confirm('Are you sure you want to delete this estimate quotation?')) {
    store.state.estimates = store.state.estimates.filter(e => e.id !== estimateId);
    store.save();
    renderApp();
  }
};

window.viewEstimateLetter = (estimateId) => {
  const est = (store.state.estimates || []).find(e => e.id === estimateId);
  if (!est) return;

  const modal = document.getElementById('modal-card');
  const backdrop = document.getElementById('modal-backdrop');

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">📑 Proforma Estimate / Quotation — ${est.estimateNumber}</h3>
      <button class="btn btn-icon" onclick="window.closeModal()">✕</button>
    </div>
    <div class="modal-body" style="background: #ffffff; color: #000; padding: 1.5rem; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 1rem; margin-bottom: 1rem;">
        <div>
          <h2 style="color: #4f46e5; margin: 0; font-size: 1.5rem;">BILLKRAFT ENTERPRISES</h2>
          <p style="margin: 0.2rem 0; font-size: 0.85rem; color: #64748b;">GSTIN: 27AAAAA0000A1Z5 | Reg: Maharashtra, India</p>
          <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Email: billing@billkraft.com | Phone: +91 98200 12345</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #1e293b; font-size: 1.25rem;">PROFORMA ESTIMATE</h3>
          <p style="margin: 0.2rem 0; font-weight: 700;"># ${est.estimateNumber}</p>
          <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Date: ${est.date}</p>
          <p style="margin: 0; font-size: 0.85rem; color: #dc2626;">Valid Until: ${est.validUntil || 'N/A'}</p>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="margin: 0 0 0.25rem; font-size: 0.85rem; color: #64748b;">QUOTATION PREPARED FOR:</h4>
        <strong style="font-size: 1.1rem; color: #0f172a;">${est.partyName}</strong>
        <p style="margin: 0.2rem 0 0; font-size: 0.85rem; color: #475569;">Place of Supply: ${est.placeOfSupply}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.85rem;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 0.5rem; border: 1px solid #cbd5e1;">Item / Description</th>
            <th style="padding: 0.5rem; border: 1px solid #cbd5e1;">Qty</th>
            <th style="padding: 0.5rem; border: 1px solid #cbd5e1;">Rate (₹)</th>
            <th style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${(est.items || []).map(item => `
            <tr>
              <td style="padding: 0.5rem; border: 1px solid #cbd5e1;">${item.name}</td>
              <td style="padding: 0.5rem; border: 1px solid #cbd5e1;">${item.qty}</td>
              <td style="padding: 0.5rem; border: 1px solid #cbd5e1;">₹${fmt(item.price)}</td>
              <td style="padding: 0.5rem; border: 1px solid #cbd5e1; text-align: right;">₹${fmt(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="font-size: 0.8rem; color: #64748b;">
          <p style="margin: 0;">* This is an official commercial price quotation / estimate.</p>
          <p style="margin: 0;">* Terms: Payment 100% against delivery or order confirmation.</p>
        </div>
        <div style="text-align: right; width: 240px; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>Taxable Value:</span><span>₹${fmt(est.taxableAmount)}</span></div>
          <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;"><span>GST Tax:</span><span>₹${fmt((est.cgst || 0) + (est.sgst || 0) + (est.igst || 0))}</span></div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; font-weight: 800; font-size: 1.1rem; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a;">
            <span>Estimated Total:</span><span>₹${fmt(est.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="window.printEstimate('${est.id}')">🖨️ Print Quote</button>
    </div>
  `;
  backdrop.classList.add('active');
};

window.printEstimate = (estimateId) => {
  window.viewEstimateLetter(estimateId);
  setTimeout(() => window.print(), 300);
};
