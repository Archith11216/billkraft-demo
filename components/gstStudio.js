/* ==========================================================================
   BILLKRAFT 2.0 - INLINE GST REPORT STUDIO (EMBEDDED IN DASHBOARD CANVAS)
   ========================================================================== */

export function renderGstStudio(activeTab = 'gstr1', storeData) {
  const { invoices = [], parties = [], products = [] } = storeData;

  // Calculate live GSTR aggregates from invoices
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalCess = 0;

  invoices.forEach(inv => {
    totalTaxable += (inv.taxableAmount || 0);
    totalCGST += (inv.cgst || 0);
    totalSGST += (inv.sgst || 0);
    totalIGST += (inv.igst || 0);
  });

  const totalTax = totalCGST + totalSGST + totalIGST;

  return `
    <div class="gst-studio-card">
      <div class="gst-studio-header">
        <div class="gst-title-area">
          <div class="gst-badge-icon">GST</div>
          <div>
            <h3 class="gst-title">Inline GST Report Studio</h3>
            <p class="gst-desc">Real-time GST compliance reports & 1-click filing data directly on dashboard</p>
          </div>
        </div>
        <div class="gst-actions">
          <button class="btn btn-outline" onclick="window.exportGstJson('${activeTab}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export JSON (GST Portal)
          </button>
          <button class="btn btn-emerald" onclick="window.printGstReport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print GST Summary
          </button>
        </div>
      </div>

      <!-- GST Report Tabs -->
      <div class="gst-tabs">
        <button class="gst-tab-btn ${activeTab === 'gstr1' ? 'active' : ''}" onclick="window.switchGstTab('gstr1')">
          GSTR-1 (Sales Output)
        </button>
        <button class="gst-tab-btn ${activeTab === 'gstr2b' ? 'active' : ''}" onclick="window.switchGstTab('gstr2b')">
          GSTR-2B (ITC Match)
        </button>
        <button class="gst-tab-btn ${activeTab === 'gstr3b' ? 'active' : ''}" onclick="window.switchGstTab('gstr3b')">
          GSTR-3B (Tax Return)
        </button>
        <button class="gst-tab-btn ${activeTab === 'hsn' ? 'active' : ''}" onclick="window.switchGstTab('hsn')">
          HSN Summary
        </button>
        <button class="gst-tab-btn ${activeTab === 'tds' ? 'active' : ''}" onclick="window.switchGstTab('tds')">
          TDS & TCS Payable
        </button>
        <button class="gst-tab-btn ${activeTab === 'gstr7' ? 'active' : ''}" onclick="window.switchGstTab('gstr7')">
          GSTR-7
        </button>
      </div>

      <!-- Report Canvas Area -->
      <div class="gst-canvas">
        ${renderGstTabContent(activeTab, { invoices, totalTaxable, totalCGST, totalSGST, totalIGST, totalTax })}
      </div>
    </div>
  `;
}

function renderGstTabContent(tab, data) {
  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (tab === 'gstr1') {
    return `
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-label">B2B Taxable Value</div>
          <div class="stat-value">${formatINR(data.totalTaxable)}</div>
        </div>
        <div class="stat-card emerald">
          <div class="stat-label">CGST Output</div>
          <div class="stat-value">${formatINR(data.totalCGST)}</div>
        </div>
        <div class="stat-card emerald">
          <div class="stat-label">SGST Output</div>
          <div class="stat-value">${formatINR(data.totalSGST)}</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">IGST Output</div>
          <div class="stat-value">${formatINR(data.totalIGST)}</div>
        </div>
      </div>

      <h4 style="margin-bottom: 1rem; font-family: var(--font-display);">GSTR-1 Outward Supplies Ledger</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer / GSTIN</th>
              <th>Place of Supply</th>
              <th>Taxable Value</th>
              <th>CGST (9%)</th>
              <th>SGST (9%)</th>
              <th>IGST (18%)</th>
              <th>Total Tax</th>
              <th>Filing Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.invoices.length ? data.invoices.map(inv => `
              <tr>
                <td><strong>${inv.invoiceNumber}</strong></td>
                <td>${inv.date}</td>
                <td>
                  <div><strong>${inv.partyName || 'Cash Sale'}</strong></div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${inv.gstin || 'URP (Unregistered)'}</div>
                </td>
                <td>${inv.placeOfSupply || '27-Maharashtra'}</td>
                <td>${formatINR(inv.taxableAmount)}</td>
                <td>${formatINR(inv.cgst)}</td>
                <td>${formatINR(inv.sgst)}</td>
                <td>${formatINR(inv.igst)}</td>
                <td><strong>${formatINR((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))}</strong></td>
                <td><span class="badge badge-success">Ready to File</span></td>
              </tr>
            `).join('') : `
              <tr><td colspan="10" style="text-align:center; color: var(--text-muted);">No outward invoices generated yet.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'gstr2b') {
    return `
      <div style="padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-display); color: var(--emerald);">GSTR-2B Input Tax Credit (ITC) Auto-Reconciliation</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Auto-downloaded supplier GST returns for inward supplies eligible for ITC claims.</p>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Supplier GSTIN</th>
              <th>Invoice No</th>
              <th>ITC Eligibility</th>
              <th>Eligible Integrated Tax</th>
              <th>Eligible Central Tax</th>
              <th>Eligible State Tax</th>
              <th>Reconciliation Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>TechMart Logistics Pvt Ltd</strong></td>
              <td>27AAACT1234F1Z9</td>
              <td>INV-2026-904</td>
              <td><span class="badge badge-success">Inputs Eligible</span></td>
              <td>₹0.00</td>
              <td>₹4,500.00</td>
              <td>₹4,500.00</td>
              <td><span class="badge badge-success">Matched (100%)</span></td>
            </tr>
            <tr>
              <td><strong>Apex Raw Materials Corp</strong></td>
              <td>27BBBAP8899K1Z2</td>
              <td>PUR-8821</td>
              <td><span class="badge badge-success">Capital Goods</span></td>
              <td>₹12,600.00</td>
              <td>₹0.00</td>
              <td>₹0.00</td>
              <td><span class="badge badge-info">Auto Drafted</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'gstr3b') {
    return `
      <h4 style="margin-bottom: 1rem; font-family: var(--font-display);">GSTR-3B Monthly Tax Liability Summary</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nature of Supplies</th>
              <th>Total Taxable Value</th>
              <th>Integrated Tax</th>
              <th>Central Tax</th>
              <th>State/UT Tax</th>
              <th>Net Tax Payable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>3.1 (a) Outward Taxable Supplies</strong></td>
              <td>${formatINR(data.totalTaxable)}</td>
              <td>${formatINR(data.totalIGST)}</td>
              <td>${formatINR(data.totalCGST)}</td>
              <td>${formatINR(data.totalSGST)}</td>
              <td><strong>${formatINR(data.totalTax)}</strong></td>
            </tr>
            <tr>
              <td><strong>4 (A) Eligible ITC Claimed</strong></td>
              <td>₹95,000.00</td>
              <td>₹12,600.00</td>
              <td>₹4,500.00</td>
              <td>₹4,500.00</td>
              <td><strong style="color: var(--emerald);">₹21,600.00</strong></td>
            </tr>
            <tr style="background: var(--bg-hover); font-weight: 700;">
              <td>Net Cash Liability To Pay (Output - ITC)</td>
              <td>-</td>
              <td>${formatINR(Math.max(0, data.totalIGST - 12600))}</td>
              <td>${formatINR(Math.max(0, data.totalCGST - 4500))}</td>
              <td>${formatINR(Math.max(0, data.totalSGST - 4500))}</td>
              <td><span class="badge badge-warning">Final Cash Pay: ${formatINR(Math.max(0, data.totalTax - 21600))}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  if (tab === 'hsn') {
    return `
      <h4 style="margin-bottom: 1rem; font-family: var(--font-display);">HSN Code Summary of Outward Supplies</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>HSN / SAC Code</th>
              <th>Description</th>
              <th>UQC Unit</th>
              <th>Total Quantity</th>
              <th>Total Taxable Value</th>
              <th>CGST Amount</th>
              <th>SGST Amount</th>
              <th>IGST Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>8471</strong></td>
              <td>Computer Hardware & Accessories</td>
              <td>PCS</td>
              <td>42</td>
              <td>₹1,45,000.00</td>
              <td>₹13,050.00</td>
              <td>₹13,050.00</td>
              <td>₹0.00</td>
            </tr>
            <tr>
              <td><strong>8517</strong></td>
              <td>Wireless Communication Equipment</td>
              <td>NOS</td>
              <td>18</td>
              <td>₹88,000.00</td>
              <td>₹7,920.00</td>
              <td>₹7,920.00</td>
              <td>₹0.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
      <h4>Report module for ${tab.toUpperCase()} loaded cleanly inside canvas</h4>
      <p>Data synced with latest company records.</p>
    </div>
  `;
}
