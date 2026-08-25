"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "../lib/categories";

const MARKUP = "<div id=\"loading\"><div class=\"spinner\"></div><div class=\"label\">Loading job cost data\u2026</div></div>\n\n<div id=\"app\" style=\"display:none;\">\n  <div class=\"topbar\">\n    <div class=\"topbar-inner\">\n      <div class=\"brand-block\">\n        <div>\n          <p class=\"brand-eyebrow\">Job Cost Tracker</p>\n          <h1 class=\"brand-title\" id=\"project-title\">\u2014</h1>\n        </div>\n        <button class=\"btn-switch-job\" id=\"btn-switch-job\">Switch Job \u25be</button>\n        <button class=\"btn-switch-job\" id=\"btn-logout\" title=\"Log out\">Log Out</button>\n      </div>\n      <div class=\"topbar-stat\">\n        <div class=\"label\">Budget</div>\n        <div class=\"value\" id=\"topbar-budget\">\u2014</div>\n      </div>\n      <div class=\"topbar-stat\">\n        <div class=\"label\">Cost to Date</div>\n        <div class=\"value\" id=\"topbar-cost\">\u2014</div>\n      </div>\n      <div class=\"topbar-stat\">\n        <div class=\"label\">Balance</div>\n        <div class=\"value\" id=\"topbar-balance\">\u2014</div>\n      </div>\n    </div>\n    <div class=\"tabs\">\n      <button class=\"tab\" data-view=\"jobs\">All Jobs</button>\n      <button class=\"tab active\" data-view=\"dashboard\">Dashboard</button>\n      <button class=\"tab\" data-view=\"detail\">Cost Detail</button>\n      <button class=\"tab\" data-view=\"invoices\">Invoice Log</button>\n    </div>\n  </div>\n\n  <main>\n    <div class=\"data-toolbar\">\n      <button class=\"btn ghost small\" id=\"btn-export\">\u2b07 Export to Excel</button>\n      <button class=\"btn ghost small\" id=\"btn-import\">\u2b06 Import Excel</button>\n      <input type=\"file\" id=\"import-file\" accept=\".xlsx,.xls,.csv\" style=\"display:none;\">\n    </div>\n\n    <!-- ALL JOBS -->\n    <section class=\"view\" id=\"view-jobs\">\n      <div class=\"section-head\">\n        <h2 class=\"section-title\">All Jobs</h2>\n        <button class=\"btn primary\" id=\"btn-new-job-fromtab\">+ New Job</button>\n      </div>\n      <div class=\"card-grid\" id=\"job-cards\"></div>\n    </section>\n\n    <!-- DASHBOARD -->\n    <section class=\"view active\" id=\"view-dashboard\">\n      <h2 class=\"section-title\">Budget vs. Actual \u2014 by Area of Work</h2>\n      <div class=\"card-grid\" id=\"cat-cards\"></div>\n    </section>\n\n    <!-- COST DETAIL -->\n    <section class=\"view\" id=\"view-detail\">\n      <h2 class=\"section-title\">Cost Detail \u2014 All PO Lines</h2>\n      <div class=\"toolbar\">\n        <input type=\"text\" id=\"detail-search\" placeholder=\"Search PO # or description\u2026\">\n        <select id=\"detail-cat-filter\"><option value=\"\">All categories</option></select>\n        <div class=\"spacer\"></div>\n        <button class=\"btn ghost\" id=\"btn-add-category\">Manage Categories</button>\n        <button class=\"btn primary\" id=\"btn-add-po\">+ Add PO Line</button>\n      </div>\n      <table id=\"detail-table\">\n        <thead>\n          <tr>\n            <th data-sort=\"po\">PO #<span class=\"arrow\"></span></th>\n            <th data-sort=\"type\">Type<span class=\"arrow\"></span></th>\n            <th data-sort=\"category\">Category<span class=\"arrow\"></span></th>\n            <th class=\"num\" data-sort=\"budget\">Budget<span class=\"arrow\"></span></th>\n            <th class=\"num\" data-sort=\"cost\">Cost to Date<span class=\"arrow\"></span></th>\n            <th class=\"num\" data-sort=\"balance\">Balance<span class=\"arrow\"></span></th>\n            <th>% Spent</th>\n            <th></th>\n          </tr>\n        </thead>\n        <tbody id=\"detail-tbody\"></tbody>\n      </table>\n    </section>\n\n    <!-- INVOICE LOG -->\n    <section class=\"view\" id=\"view-invoices\">\n      <h2 class=\"section-title\">Invoice Log</h2>\n      <div class=\"toolbar\">\n        <input type=\"text\" id=\"inv-search\" placeholder=\"Search PO # or vendor\u2026\">\n        <select id=\"inv-page-size\">\n          <option value=\"25\">25 per page</option>\n          <option value=\"50\">50 per page</option>\n          <option value=\"100\">100 per page</option>\n          <option value=\"all\">Show all</option>\n        </select>\n        <div class=\"spacer\"></div>\n        <button class=\"btn primary\" id=\"btn-add-invoice\">+ Log Invoice</button>\n      </div>\n      <table id=\"inv-table\">\n        <thead>\n          <tr>\n            <th data-sort=\"date\">Date<span class=\"arrow\"></span></th>\n            <th data-sort=\"po\">PO #<span class=\"arrow\"></span></th>\n            <th data-sort=\"vendor\">Vendor<span class=\"arrow\"></span></th>\n            <th data-sort=\"invoiceNum\">Invoice #<span class=\"arrow\"></span></th>\n            <th class=\"num\" data-sort=\"amount\">Amount<span class=\"arrow\"></span></th>\n            <th></th>\n          </tr>\n        </thead>\n        <tbody id=\"inv-tbody\"></tbody>\n      </table>\n      <div class=\"toolbar\" style=\"justify-content:flex-end;margin-top:10px;margin-bottom:0;\">\n        <span id=\"inv-page-label\" style=\"font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);\"></span>\n        <button class=\"btn small ghost\" id=\"inv-page-prev\">\u2190 Prev</button>\n        <button class=\"btn small ghost\" id=\"inv-page-next\">Next \u2192</button>\n      </div>\n    </section>\n  </main>\n</div>\n\n<!-- Job switcher dropdown -->\n<div class=\"job-menu-overlay\" id=\"job-menu-overlay\">\n  <div class=\"job-menu\" id=\"job-menu\"></div>\n</div>\n\n<!-- PO row action menu -->\n<div class=\"job-menu-overlay\" id=\"po-row-menu-overlay\">\n  <div class=\"job-menu\" id=\"po-row-menu\" style=\"width:160px;\">\n    <div class=\"job-menu-item\" id=\"po-row-menu-edit\"><span class=\"jm-name\">Edit</span></div>\n    <div class=\"job-menu-item\" id=\"po-row-menu-delete\"><span class=\"jm-name\" style=\"color:var(--bad);\">Delete</span></div>\n  </div>\n</div>\n\n<!-- Invoice modal -->\n<div class=\"modal-overlay\" id=\"invoice-modal\">\n  <div class=\"modal\">\n    <h3 id=\"invoice-modal-title\">Log Invoice</h3>\n    <input type=\"hidden\" id=\"inv-edit-id\">\n    <div class=\"field\">\n      <label for=\"inv-date\">Date</label>\n      <input type=\"date\" id=\"inv-date\">\n    </div>\n    <div class=\"field\" style=\"position:relative;\">\n      <label for=\"inv-po-input\">PO Code</label>\n      <input type=\"text\" id=\"inv-po-input\" placeholder=\"Search PO # or description\u2026\" autocomplete=\"off\">\n      <input type=\"hidden\" id=\"inv-po\">\n      <div id=\"inv-po-results\" class=\"po-search-results\"></div>\n    </div>\n    <div class=\"field\">\n      <label for=\"inv-vendor\">Vendor</label>\n      <input type=\"text\" id=\"inv-vendor\" placeholder=\"e.g. ABC Framing LLC\">\n    </div>\n    <div class=\"field\">\n      <label for=\"inv-num\">Invoice #</label>\n      <input type=\"text\" id=\"inv-num\" placeholder=\"e.g. 4471\">\n    </div>\n    <div class=\"field\">\n      <label for=\"inv-amount\">Amount ($)</label>\n      <input type=\"number\" id=\"inv-amount\" step=\"0.01\" placeholder=\"0.00\">\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn ghost\" id=\"inv-cancel\">Cancel</button>\n      <button class=\"btn primary\" id=\"inv-save\">Save Invoice</button>\n    </div>\n  </div>\n</div>\n\n<!-- PO modal -->\n<div class=\"modal-overlay\" id=\"po-modal\">\n  <div class=\"modal\">\n    <h3 id=\"po-modal-title\">Add PO Line</h3>\n    <input type=\"hidden\" id=\"po-edit-original\">\n    <div class=\"field\">\n      <label for=\"po-code\">PO #</label>\n      <input type=\"text\" id=\"po-code\" placeholder=\"e.g. TSN276\">\n    </div>\n    <div class=\"field\">\n      <label for=\"po-type\">Description</label>\n      <input type=\"text\" id=\"po-type\" placeholder=\"e.g. Roof Flashing Labor\">\n    </div>\n    <div class=\"field\">\n      <label for=\"po-category\">Category</label>\n      <select id=\"po-category\"></select>\n    </div>\n    <div class=\"field\">\n      <label for=\"po-budget\">Budget ($)</label>\n      <input type=\"number\" id=\"po-budget\" step=\"0.01\" placeholder=\"0.00\">\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn ghost\" id=\"po-cancel\">Cancel</button>\n      <button class=\"btn primary\" id=\"po-save\">Save PO Line</button>\n    </div>\n  </div>\n</div>\n\n<!-- New Category modal -->\n<div class=\"modal-overlay\" id=\"category-modal\">\n  <div class=\"modal\">\n    <h3>Manage Categories</h3>\n    <div id=\"category-list\" style=\"margin-bottom:14px;\"></div>\n    <div class=\"field\">\n      <label for=\"category-name\">Add a Category</label>\n      <input type=\"text\" id=\"category-name\" placeholder=\"e.g. Landscaping\">\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn ghost\" id=\"category-cancel\">Close</button>\n      <button class=\"btn primary\" id=\"category-save\">Add Category</button>\n    </div>\n  </div>\n</div>\n\n<!-- New Job modal -->\n<div class=\"modal-overlay\" id=\"job-modal\">\n  <div class=\"modal\">\n    <h3>New Job</h3>\n    <div class=\"field\">\n      <label for=\"job-name\">Job Name</label>\n      <input type=\"text\" id=\"job-name\" placeholder=\"e.g. Ocean Ave Duplex\">\n    </div>\n    <div class=\"field\">\n      <label for=\"job-client\">Client</label>\n      <input type=\"text\" id=\"job-client\" placeholder=\"e.g. Meridian Development\">\n    </div>\n    <div class=\"field\">\n      <label for=\"job-start\">Start Date</label>\n      <input type=\"date\" id=\"job-start\">\n    </div>\n    <div class=\"field\">\n      <label for=\"job-status\">Status</label>\n      <select id=\"job-status\">\n        <option value=\"Active\">Active</option>\n        <option value=\"On Hold\">On Hold</option>\n        <option value=\"Complete\">Complete</option>\n      </select>\n    </div>\n    <div class=\"modal-actions\">\n      <button class=\"btn ghost\" id=\"job-cancel\">Cancel</button>\n      <button class=\"btn primary\" id=\"job-save\">Create Job</button>\n    </div>\n  </div>\n</div>\n\n<div id=\"toast\"></div>\n\n<button id=\"back-to-top\" title=\"Back to top\" aria-label=\"Back to top\">\u2191</button>\n\n";

export default function HomePage() {
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (window.__strandAppBooted) return;
    window.__strandAppBooted = true;
    boot(router);
  }, [router]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}

function boot(router) {
  let state = null; // { categories:[], activeJobId, jobs: [...] }
  let detailSort = { key: "po", dir: 1 };
  let invSort = { key: "date", dir: -1 };
  let invPage = 0;

  const fmtMoney = (n) => {
    const v = Number(n) || 0;
    const neg = v < 0;
    const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return (neg ? "-$" : "$") + s;
  };
  const fmtPct = (n) => (n === null || n === undefined || !isFinite(n)) ? "—" : (n * 100).toFixed(1) + "%";
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) { return d; }
  };

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ---------- API ----------
  async function api(path, opts) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    if (res.status === 401) {
      router.push("/login");
      throw new Error("Not authenticated");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadState() {
    const previousActiveId = state ? state.activeJobId : null;
    const data = await api("/api/state");
    // /api/state has no concept of "which job you're viewing" — that's purely
    // client-side. Carry the current selection forward across every reload,
    // and only fall back to the first job if that selection no longer exists
    // (e.g. it was just deleted) or this is the very first load.
    const stillExists = data.jobs.some((j) => j.id === previousActiveId);
    data.activeJobId = stillExists ? previousActiveId : (data.jobs[0] ? data.jobs[0].id : null);
    state = data;
  }
  async function refresh() {
    await loadState();
    renderAll();
  }

  function activeJob() {
    return state.jobs.find((j) => j.id === state.activeJobId) || state.jobs[0];
  }

  // ---------- Derived data ----------
  function costForPO(job, po) {
    return job.invoices.filter((i) => i.po === po).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  }
  function categorySummary(job) {
    return state.categories.map((cat) => {
      const posInCat = job.pos.filter((p) => p.category === cat);
      const budget = posInCat.reduce((s, p) => s + (Number(p.budget) || 0), 0);
      const cost = posInCat.reduce((s, p) => s + costForPO(job, p.po), 0);
      return { category: cat, budget, cost, balance: budget - cost, pct: budget ? cost / budget : null };
    }).filter((c) => c.budget > 0 || c.cost > 0);
  }
  function jobTotals(job) {
    const budget = job.pos.reduce((s, p) => s + (Number(p.budget) || 0), 0);
    const cost = job.pos.reduce((s, p) => s + costForPO(job, p.po), 0);
    return { budget, cost, balance: budget - cost, pct: budget ? cost / budget : null };
  }
  function statusOf(pct) {
    if (pct === null || pct === undefined) return "good";
    if (pct > 1) return "bad";
    if (pct >= 0.85) return "warn";
    return "good";
  }
  function jobStatusPillClass(status) {
    if (status === "Complete") return "good";
    if (status === "On Hold") return "warn";
    return "info";
  }
  function tapeBarHTML(pct) {
    const status = statusOf(pct);
    const clamped = (pct === null || pct === undefined) ? 0 : Math.min(pct, 1.15);
    const widthPct = Math.min(clamped * 100, 100);
    const ticks = [0, 25, 50, 75, 100].map(() => "<span></span>").join("");
    return (
      '<div class="tape-bar">' +
      '<div class="tape-track"><div class="tape-fill ' + status + '" style="width:' + widthPct + '%"></div></div>' +
      '<div class="tape-ticks">' + ticks + '</div>' +
      '</div>'
    );
  }

  // ---------- Render ----------
  function renderTopbar() {
    const job = activeJob();
    if (!job) {
      document.getElementById("project-title").textContent = "No jobs yet";
      document.getElementById("topbar-budget").textContent = "—";
      document.getElementById("topbar-cost").textContent = "—";
      document.getElementById("topbar-balance").textContent = "—";
      return;
    }
    document.getElementById("project-title").textContent = job.name;
    const t = jobTotals(job);
    document.getElementById("topbar-budget").textContent = fmtMoney(t.budget);
    document.getElementById("topbar-cost").textContent = fmtMoney(t.cost);
    const balEl = document.getElementById("topbar-balance");
    balEl.textContent = fmtMoney(t.balance);
    balEl.classList.toggle("over", t.balance < 0);
  }

  function renderJobsList() {
    const wrap = document.getElementById("job-cards");
    if (state.jobs.length === 0) {
      wrap.innerHTML = '<div class="empty-state"><div class="big">No jobs yet</div>Click "+ New Job" to start tracking one.</div>';
      return;
    }
    const sorted = [...state.jobs].sort((a, b) => {
      if (a.id === state.activeJobId) return -1;
      if (b.id === state.activeJobId) return 1;
      return a.name.localeCompare(b.name);
    });
    wrap.innerHTML = sorted.map((j) => {
      const t = jobTotals(j);
      const status = statusOf(t.pct);
      return (
        '<div class="job-card">' +
          '<div class="job-card-head"><div><div class="job-name">' + j.name + '</div>' +
          (j.client ? '<div class="job-client">' + j.client + '</div>' : "") +
          '</div><div class="status-pill ' + jobStatusPillClass(j.status) + '">' + j.status + '</div></div>' +
          '<div class="cat-figures"><span>Budget <b>' + fmtMoney(t.budget) + '</b></span><span>Actual <b>' + fmtMoney(t.cost) + '</b></span></div>' +
          tapeBarHTML(t.pct) +
          '<div class="job-card-foot"><span class="pct">' + fmtPct(t.pct) + ' spent · ' + fmtMoney(t.balance) + ' balance</span>' +
          '<span style="display:flex;gap:6px;">' +
          '<button class="btn small danger-ghost" data-delete-job="' + j.id + '">Delete</button>' +
          '<button class="btn small ' + (j.id === state.activeJobId ? "ghost" : "primary") + '" data-open-job="' + j.id + '">' +
          (j.id === state.activeJobId ? "Current" : "Open") + '</button></span></div>' +
        '</div>'
      );
    }).join("");

    wrap.querySelectorAll("[data-open-job]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-open-job");
        if (id === state.activeJobId) { switchTab("dashboard"); return; }
        state.activeJobId = id;
        renderAll();
        switchTab("dashboard");
        toast("Switched to " + activeJob().name);
      });
    });

    wrap.querySelectorAll("[data-delete-job]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete-job");
        const job = state.jobs.find((j) => j.id === id);
        if (!job) return;
        const label = job.name + (job.pos.length ? " (" + job.pos.length + " PO lines, " + job.invoices.length + " invoices)" : "");
        if (!confirm('Delete "' + label + '"? This permanently deletes all its PO lines and invoices. This cannot be undone.')) return;
        try {
          await api("/api/jobs?id=" + encodeURIComponent(id), { method: "DELETE" });
          await loadState();
          renderAll();
          toast(job.name + " deleted");
        } catch (err) { toast(err.message); }
      });
    });
  }

  function renderDashboard() {
    const job = activeJob();
    const wrap = document.getElementById("cat-cards");
    if (!job) {
      wrap.innerHTML = '<div class="empty-state"><div class="big">No jobs yet</div>Head to the All Jobs tab and click "+ New Job".</div>';
      return;
    }
    const summary = categorySummary(job).sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
    if (summary.length === 0) {
      wrap.innerHTML = '<div class="empty-state"><div class="big">No cost data yet</div>Add a PO line and log an invoice to see budget vs. actual.</div>';
      return;
    }
    wrap.innerHTML = summary.map((c) => {
      const status = statusOf(c.pct);
      const label = status === "bad" ? "Over Budget" : status === "warn" ? "Watch" : "On Track";
      return (
        '<div class="cat-card"><div class="cat-card-head"><div class="cat-name">' + c.category + '</div>' +
        '<div class="status-pill ' + status + '">' + label + '</div></div>' +
        '<div class="cat-figures"><span>Budget <b>' + fmtMoney(c.budget) + '</b></span><span>Actual <b>' + fmtMoney(c.cost) + '</b></span></div>' +
        tapeBarHTML(c.pct) +
        '<div class="cat-figures" style="margin-top:6px;margin-bottom:0;"><span>Balance <b>' + fmtMoney(c.balance) + '</b></span><span>' + fmtPct(c.pct) + ' spent</span></div>' +
        '</div>'
      );
    }).join("");
  }

  function populateCatFilter() {
    const sel = document.getElementById("detail-cat-filter");
    sel.innerHTML = '<option value="">All categories</option>' +
      state.categories.map((c) => '<option value="' + c + '">' + c + '</option>').join("");
  }
  function populateCatSelects() {
    const opts = state.categories.map((c) => '<option value="' + c + '">' + c + '</option>').join("");
    document.getElementById("po-category").innerHTML = opts + '<option value="__new__">+ Add New Category...</option>';
  }
  let poSearchList = []; // sorted PO list for the current job, cached while the invoice modal is open

  function populatePOSelect() {
    const job = activeJob();
    poSearchList = [...job.pos].sort((a, b) => a.po.localeCompare(b.po, undefined, { numeric: true }));
  }

  function renderPOResults(query) {
    const wrap = document.getElementById("inv-po-results");
    const q = query.trim().toLowerCase();
    let matches = q
      ? poSearchList.filter((p) => p.po.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
      : poSearchList;
    const CAP = 40;
    const shown = matches.slice(0, CAP);

    if (shown.length === 0) {
      wrap.innerHTML = '<div class="po-result-empty">No matching PO lines</div>';
    } else {
      wrap.innerHTML = shown.map((p, i) => (
        '<div class="po-result' + (i === 0 ? " active" : "") + '" data-po="' + p.po + '">' +
          '<span class="po-code">' + p.po + '</span><span class="po-desc">' + p.type + '</span>' +
        '</div>'
      )).join("") + (matches.length > CAP ? '<div class="po-result-more">+' + (matches.length - CAP) + ' more — keep typing to narrow it down</div>' : "");
    }
    wrap.classList.add("open");

    wrap.querySelectorAll("[data-po]").forEach((row) => {
      row.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep focus so the blur-hide doesn't fire before the click registers
        const po = poSearchList.find((p) => p.po === row.getAttribute("data-po"));
        if (po) selectPOResult(po);
      });
    });
  }

  function selectPOResult(po) {
    document.getElementById("inv-po").value = po.po;
    document.getElementById("inv-po-input").value = po.po + " — " + po.type;
    document.getElementById("inv-po-results").classList.remove("open");
  }

  function wirePOSearchOnce() {
    const input = document.getElementById("inv-po-input");
    if (input.dataset.wired) return;
    input.dataset.wired = "1";
    const results = document.getElementById("inv-po-results");

    input.addEventListener("focus", () => renderPOResults(input.value.includes(" — ") ? "" : input.value));
    input.addEventListener("input", () => {
      document.getElementById("inv-po").value = ""; // any manual edit invalidates the prior selection
      renderPOResults(input.value);
    });
    input.addEventListener("blur", () => {
      setTimeout(() => results.classList.remove("open"), 120);
    });
    input.addEventListener("keydown", (e) => {
      const rows = Array.from(results.querySelectorAll("[data-po]"));
      if (!rows.length) return;
      let activeIdx = rows.findIndex((r) => r.classList.contains("active"));
      if (e.key === "ArrowDown") {
        e.preventDefault();
        rows[activeIdx]?.classList.remove("active");
        activeIdx = Math.min(activeIdx + 1, rows.length - 1);
        rows[activeIdx].classList.add("active");
        rows[activeIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        rows[activeIdx]?.classList.remove("active");
        activeIdx = Math.max(activeIdx - 1, 0);
        rows[activeIdx].classList.add("active");
        rows[activeIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[activeIdx] || rows[0];
        const po = poSearchList.find((p) => p.po === row.getAttribute("data-po"));
        if (po) selectPOResult(po);
      } else if (e.key === "Escape") {
        results.classList.remove("open");
      }
    });
  }

  function renderDetail() {
    const job = activeJob();
    if (!job) {
      document.getElementById("detail-tbody").innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="big">No jobs yet</div>Head to the All Jobs tab and click "+ New Job".</div></td></tr>';
      return;
    }
    const search = document.getElementById("detail-search").value.trim().toLowerCase();
    const catFilter = document.getElementById("detail-cat-filter").value;
    let rows = job.pos.map((p) => {
      const cost = costForPO(job, p.po);
      const balance = (Number(p.budget) || 0) - cost;
      const pct = p.budget ? cost / p.budget : null;
      return { ...p, cost, balance, pct };
    });
    if (search) rows = rows.filter((r) => r.po.toLowerCase().includes(search) || r.type.toLowerCase().includes(search));
    if (catFilter) rows = rows.filter((r) => r.category === catFilter);

    rows.sort((a, b) => {
      const k = detailSort.key;
      let av = a[k], bv = b[k];
      if (typeof av === "string") { av = av.toLowerCase(); bv = (bv || "").toLowerCase(); }
      if (av < bv) return -1 * detailSort.dir;
      if (av > bv) return 1 * detailSort.dir;
      return 0;
    });

    const tbody = document.getElementById("detail-tbody");
    if (job.pos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="big">No PO lines yet</div>Click "+ Add PO Line" to add the first one for this job.</div></td></tr>';
      return;
    }
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="big">No matching PO lines</div>Try clearing the search or filter.</div></td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((r) => (
      '<tr class="' + (r.balance < 0 ? "row-bad" : "") + '">' +
        '<td class="mono">' + r.po + '</td>' +
        '<td>' + r.type + '</td>' +
        '<td><select class="cat-select" data-po="' + r.po + '">' +
          state.categories.map((c) => '<option value="' + c + '" ' + (c === r.category ? "selected" : "") + '>' + c + '</option>').join("") +
        '</select></td>' +
        '<td class="num">' + fmtMoney(r.budget) + '</td>' +
        '<td class="num">' + fmtMoney(r.cost) + '</td>' +
        '<td class="num balance">' + fmtMoney(r.balance) + '</td>' +
        '<td class="mini-bar">' + tapeBarHTML(r.pct) + '</td>' +
        '<td><button class="row-menu-btn" data-po-menu="' + r.po + '" title="Manage this PO line">\u22ee</button></td>' +
      '</tr>'
    )).join("");

    tbody.querySelectorAll(".cat-select").forEach((sel) => {
      sel.addEventListener("change", async (e) => {
        const po = e.target.getAttribute("data-po");
        try {
          await api("/api/pos", { method: "PATCH", body: JSON.stringify({ jobId: activeJob().id, po, category: e.target.value }) });
          await refresh();
          toast(po + " moved to " + e.target.value);
        } catch (err) { toast(err.message); }
      });
    });

    tbody.querySelectorAll("[data-po-menu]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openPORowMenu(btn.getAttribute("data-po-menu"), btn);
      });
    });
  }

  function renderInvoices() {
    const job = activeJob();
    if (!job) {
      document.getElementById("inv-tbody").innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="big">No jobs yet</div>Head to the All Jobs tab and click "+ New Job".</div></td></tr>';
      return;
    }
    const search = document.getElementById("inv-search").value.trim().toLowerCase();
    let rows = [...job.invoices];
    if (search) rows = rows.filter((r) => r.po.toLowerCase().includes(search) || (r.vendor || "").toLowerCase().includes(search));
    rows.sort((a, b) => {
      const k = invSort.key;
      let av = a[k], bv = b[k];
      if (k === "date") { av = av || ""; bv = bv || ""; }
      if (typeof av === "string") { av = av.toLowerCase(); bv = (bv || "").toLowerCase(); }
      if (av < bv) return -1 * invSort.dir;
      if (av > bv) return 1 * invSort.dir;
      return 0;
    });

    const tbody = document.getElementById("inv-tbody");
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="big">No invoices logged yet</div>Click "Log Invoice" to add the first one.</div></td></tr>';
      document.getElementById("inv-page-label").textContent = "";
      document.getElementById("inv-page-prev").disabled = true;
      document.getElementById("inv-page-next").disabled = true;
      return;
    }

    const pageSizeVal = document.getElementById("inv-page-size").value;
    const pageSize = pageSizeVal === "all" ? rows.length : parseInt(pageSizeVal, 10);
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    if (invPage >= totalPages) invPage = totalPages - 1;
    if (invPage < 0) invPage = 0;
    const start = invPage * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    document.getElementById("inv-page-label").textContent =
      "Showing " + (start + 1) + "–" + (start + pageRows.length) + " of " + rows.length +
      (totalPages > 1 ? "  ·  page " + (invPage + 1) + " of " + totalPages : "");
    document.getElementById("inv-page-prev").disabled = invPage === 0;
    document.getElementById("inv-page-next").disabled = invPage >= totalPages - 1;

    tbody.innerHTML = pageRows.map((r) => (
      '<tr><td class="mono">' + fmtDate(r.date) + '</td><td class="mono">' + r.po + '</td>' +
      '<td>' + (r.vendor || '<span style="color:var(--ink-soft)">—</span>') + '</td>' +
      '<td class="mono">' + (r.invoiceNum || "—") + '</td><td class="num">' + fmtMoney(r.amount) + '</td>' +
      '<td style="white-space:nowrap;"><button class="btn small ghost" data-edit="' + r.id + '">Edit</button> ' +
      '<button class="btn small danger-ghost" data-del="' + r.id + '">Delete</button></td></tr>'
    )).join("");

    tbody.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => openInvoiceModal(btn.getAttribute("data-edit"))));
    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this invoice entry?")) return;
        try {
          await api("/api/invoices?id=" + encodeURIComponent(id), { method: "DELETE" });
          await refresh();
          toast("Invoice deleted");
        } catch (err) { toast(err.message); }
      });
    });
  }

  function renderAll() {
    renderTopbar();
    renderJobsList();
    renderDashboard();
    renderDetail();
    renderInvoices();
  }

  // ---------- Tabs ----------
  function switchTab(view) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
  }
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.view)));

  // ---------- Job switcher ----------
  const jobMenuOverlay = document.getElementById("job-menu-overlay");
  function renderJobMenu() {
    const menu = document.getElementById("job-menu");
    const sorted = [...state.jobs].sort((a, b) => a.name.localeCompare(b.name));
    menu.innerHTML = sorted.map((j) => (
      '<div class="job-menu-item ' + (j.id === state.activeJobId ? "active-job" : "") + '" data-select-job="' + j.id + '">' +
        '<div><div class="jm-name">' + j.name + '</div><div class="jm-sub">' + j.status + (j.client ? " · " + j.client : "") + '</div></div>' +
        '<div class="status-pill ' + jobStatusPillClass(j.status) + '">' + j.status + '</div>' +
      '</div>'
    )).join("") + '<div class="job-menu-divider"></div><div class="job-menu-add" id="job-menu-add-btn">+ New Job</div>';

    menu.querySelectorAll("[data-select-job]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.getAttribute("data-select-job");
        jobMenuOverlay.classList.remove("open");
        if (id !== state.activeJobId) {
          state.activeJobId = id;
          renderAll();
          toast("Switched to " + activeJob().name);
        }
        switchTab("dashboard");
      });
    });
    document.getElementById("job-menu-add-btn").addEventListener("click", () => {
      jobMenuOverlay.classList.remove("open");
      openJobModal();
    });
  }
  document.getElementById("btn-switch-job").addEventListener("click", () => { renderJobMenu(); jobMenuOverlay.classList.add("open"); });
  jobMenuOverlay.addEventListener("click", (e) => { if (e.target === jobMenuOverlay) jobMenuOverlay.classList.remove("open"); });

  // ---------- PO row menu ----------
  const poRowMenuOverlay = document.getElementById("po-row-menu-overlay");
  const poRowMenu = document.getElementById("po-row-menu");
  let poRowMenuTarget = null; // the PO # the open menu refers to

  function openPORowMenu(po, anchorEl) {
    poRowMenuTarget = po;
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 160;
    // po-row-menu-overlay is position:fixed (viewport-anchored), so its absolutely
    // positioned child needs viewport-relative coordinates straight off the rect —
    // adding window.scrollY/X here would push the menu further off-screen the more
    // the page is scrolled, which is exactly what was happening on longer PO lists.
    let left = rect.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    poRowMenu.style.left = left + "px";
    poRowMenu.style.top = (rect.bottom + 4) + "px";
    poRowMenuOverlay.classList.add("open");
  }
  poRowMenuOverlay.addEventListener("click", (e) => {
    if (e.target === poRowMenuOverlay) poRowMenuOverlay.classList.remove("open");
  });
  document.getElementById("po-row-menu-edit").addEventListener("click", () => {
    poRowMenuOverlay.classList.remove("open");
    openPOModal(poRowMenuTarget);
  });
  document.getElementById("po-row-menu-delete").addEventListener("click", async () => {
    poRowMenuOverlay.classList.remove("open");
    const job = activeJob();
    const po = poRowMenuTarget;
    const rec = job.pos.find((p) => p.po === po);
    if (!rec) return;
    const invCount = job.invoices.filter((i) => i.po === po).length;
    const msg = invCount > 0
      ? 'Delete PO "' + po + '"? ' + invCount + " logged invoice" + (invCount !== 1 ? "s" : "") + " on it will also be deleted. This cannot be undone."
      : 'Delete PO "' + po + '"? This cannot be undone.';
    if (!confirm(msg)) return;
    try {
      await api("/api/pos?jobId=" + encodeURIComponent(job.id) + "&po=" + encodeURIComponent(po), { method: "DELETE" });
      await refresh();
      toast(po + " deleted");
    } catch (err) { toast(err.message); }
  });

  document.getElementById("btn-logout").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  });

  // ---------- Sorting ----------
  document.querySelectorAll("#detail-table thead th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (detailSort.key === key) detailSort.dir *= -1; else { detailSort.key = key; detailSort.dir = 1; }
      renderDetail();
    });
  });
  document.querySelectorAll("#inv-table thead th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (invSort.key === key) invSort.dir *= -1; else { invSort.key = key; invSort.dir = 1; }
      invPage = 0;
      renderInvoices();
    });
  });

  document.getElementById("detail-search").addEventListener("input", renderDetail);
  document.getElementById("detail-cat-filter").addEventListener("change", renderDetail);
  document.getElementById("inv-search").addEventListener("input", () => { invPage = 0; renderInvoices(); });
  document.getElementById("inv-page-size").addEventListener("change", () => { invPage = 0; renderInvoices(); });
  document.getElementById("inv-page-prev").addEventListener("click", () => { invPage -= 1; renderInvoices(); });
  document.getElementById("inv-page-next").addEventListener("click", () => { invPage += 1; renderInvoices(); });

  // ---------- Invoice modal ----------
  const invoiceModal = document.getElementById("invoice-modal");
  function openInvoiceModal(editId) {
    const job = activeJob();
    if (!job) { toast("Create a job first"); return; }
    populatePOSelect();
    if (job.pos.length === 0) { toast("Add a PO line for this job first"); return; }
    wirePOSearchOnce();
    const editIdField = document.getElementById("inv-edit-id");
    if (editId) {
      const rec = job.invoices.find((i) => i.id === editId);
      const rec_po = poSearchList.find((p) => p.po === rec.po);
      document.getElementById("invoice-modal-title").textContent = "Edit Invoice";
      editIdField.value = editId;
      document.getElementById("inv-date").value = rec.date || "";
      document.getElementById("inv-po").value = rec.po;
      document.getElementById("inv-po-input").value = rec_po ? rec.po + " — " + rec_po.type : rec.po;
      document.getElementById("inv-vendor").value = rec.vendor || "";
      document.getElementById("inv-num").value = rec.invoiceNum || "";
      document.getElementById("inv-amount").value = rec.amount;
    } else {
      document.getElementById("invoice-modal-title").textContent = "Log Invoice";
      editIdField.value = "";
      document.getElementById("inv-date").value = todayStr();
      document.getElementById("inv-po").value = "";
      document.getElementById("inv-po-input").value = "";
      document.getElementById("inv-vendor").value = "";
      document.getElementById("inv-num").value = "";
      document.getElementById("inv-amount").value = "";
    }
    document.getElementById("inv-po-results").classList.remove("open");
    invoiceModal.classList.add("open");
    document.getElementById("inv-po-input").focus();
  }
  document.getElementById("btn-add-invoice").addEventListener("click", () => openInvoiceModal(null));
  document.getElementById("inv-cancel").addEventListener("click", () => invoiceModal.classList.remove("open"));
  invoiceModal.addEventListener("click", (e) => { if (e.target === invoiceModal) invoiceModal.classList.remove("open"); });

  document.getElementById("inv-save").addEventListener("click", async () => {
    const editId = document.getElementById("inv-edit-id").value;
    const po = document.getElementById("inv-po").value;
    const amount = parseFloat(document.getElementById("inv-amount").value);
    if (!po || isNaN(amount)) { toast("PO code and amount are required"); return; }
    const job = activeJob();
    const payload = {
      date: document.getElementById("inv-date").value || null,
      po,
      vendor: document.getElementById("inv-vendor").value.trim() || null,
      invoiceNum: document.getElementById("inv-num").value.trim() || null,
      amount,
    };
    try {
      if (editId) {
        await api("/api/invoices", { method: "PATCH", body: JSON.stringify({ id: editId, ...payload }) });
        toast("Invoice updated");
      } else {
        await api("/api/invoices", { method: "POST", body: JSON.stringify({ jobId: job.id, ...payload }) });
        toast("Invoice logged");
      }
      invoiceModal.classList.remove("open");
      await refresh();
    } catch (err) { toast(err.message); }
  });

  // ---------- PO modal ----------
  const poModal = document.getElementById("po-modal");
  let poCategoryTouched = false;
  function openPOModal(editPo) {
    if (!activeJob()) { toast("Create a job first"); return; }
    populateCatSelects();
    poCategoryTouched = false;
    if (editPo) {
      const job = activeJob();
      const rec = job.pos.find((p) => p.po === editPo);
      if (!rec) { toast("That PO line no longer exists"); return; }
      document.getElementById("po-modal-title").textContent = "Edit PO Line";
      document.getElementById("po-edit-original").value = editPo;
      document.getElementById("po-code").value = rec.po;
      document.getElementById("po-type").value = rec.type;
      document.getElementById("po-budget").value = rec.budget;
      poCategoryTouched = true; // don't let the auto-classify-on-type overwrite an existing category
      document.getElementById("po-category").value = rec.category;
    } else {
      document.getElementById("po-modal-title").textContent = "Add PO Line";
      document.getElementById("po-edit-original").value = "";
      document.getElementById("po-code").value = "";
      document.getElementById("po-type").value = "";
      document.getElementById("po-budget").value = "";
    }
    poModal.classList.add("open");
    document.getElementById("po-code").focus();
  }
  document.getElementById("btn-add-po").addEventListener("click", () => openPOModal(null));
  document.getElementById("po-cancel").addEventListener("click", () => poModal.classList.remove("open"));
  poModal.addEventListener("click", (e) => { if (e.target === poModal) poModal.classList.remove("open"); });
  document.getElementById("po-category").addEventListener("change", (e) => {
    poCategoryTouched = true;
    if (e.target.value === "__new__") {
      openCategoryModal(e.target);
    }
  });
  document.getElementById("po-type").addEventListener("input", (e) => {
    if (poCategoryTouched) return;
    document.getElementById("po-category").value = classifyTypeClient(e.target.value);
  });

  document.getElementById("po-save").addEventListener("click", async () => {
    const editOriginal = document.getElementById("po-edit-original").value;
    const code = document.getElementById("po-code").value.trim();
    const type = document.getElementById("po-type").value.trim();
    const budget = parseFloat(document.getElementById("po-budget").value) || 0;
    const category = document.getElementById("po-category").value;
    if (!code || !type) { toast("PO # and description are required"); return; }
    if (category === "__new__") { toast("Add or pick a category first"); return; }
    try {
      if (editOriginal) {
        await api("/api/pos", {
          method: "PATCH",
          body: JSON.stringify({ jobId: activeJob().id, po: editOriginal, newPo: code, type, category, budget }),
        });
        poModal.classList.remove("open");
        await refresh();
        toast(code + " updated");
      } else {
        await api("/api/pos", { method: "POST", body: JSON.stringify({ jobId: activeJob().id, po: code, type, budget, category }) });
        poModal.classList.remove("open");
        await refresh();
        toast(code + " added");
      }
    } catch (err) { toast(err.message); }
  });

  // ---------- Category modal ----------
  const categoryModal = document.getElementById("category-modal");
  let categoryModalTarget = null; // the <select> to update after creating (null when opened standalone)
  let renamingCategory = null; // category name currently in inline-edit mode, or null

  function countPosUsingCategory(name) {
    return state.jobs.reduce((sum, j) => sum + j.pos.filter((p) => p.category === name).length, 0);
  }

  function renderCategoryList() {
    const wrap = document.getElementById("category-list");
    const canDelete = state.categories.length > 1;
    wrap.innerHTML = state.categories.map((c) => {
      const n = countPosUsingCategory(c);
      if (c === renamingCategory) {
        return (
          '<div style="display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid var(--line);">' +
            '<input type="text" class="cat-rename-input" data-original="' + c + '" value="' + c + '" ' +
              'style="flex:1;padding:5px 8px;font-size:13px;border:1px solid var(--line);border-radius:5px;">' +
            '<button class="btn small primary" data-save-rename="' + c + '">Save</button>' +
            '<button class="btn small ghost" data-cancel-rename="1">Cancel</button>' +
          '</div>'
        );
      }
      return (
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);">' +
          '<span style="font-size:13px;">' + c + (n > 0 ? ' <span style="color:var(--ink-soft);font-family:var(--font-mono);font-size:11px;">(' + n + ' PO line' + (n !== 1 ? "s" : "") + ')</span>' : "") + '</span>' +
          '<span style="display:flex;gap:6px;">' +
            '<button class="btn small ghost" data-rename-category="' + c + '">Rename</button>' +
            '<button class="btn small danger-ghost" data-delete-category="' + c + '" ' + (canDelete ? "" : "disabled") + '>Delete</button>' +
          '</span>' +
        '</div>'
      );
    }).join("");

    const renameInput = wrap.querySelector(".cat-rename-input");
    if (renameInput) {
      renameInput.focus();
      renameInput.select();
    }

    wrap.querySelectorAll("[data-rename-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        renamingCategory = btn.getAttribute("data-rename-category");
        renderCategoryList();
      });
    });
    wrap.querySelectorAll("[data-cancel-rename]").forEach((btn) => {
      btn.addEventListener("click", () => {
        renamingCategory = null;
        renderCategoryList();
      });
    });
    wrap.querySelectorAll("[data-save-rename]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const oldName = btn.getAttribute("data-save-rename");
        const input = wrap.querySelector('.cat-rename-input[data-original="' + oldName + '"]');
        const newName = input.value.trim();
        if (!newName) { toast("Category name is required"); return; }
        if (newName === oldName) { renamingCategory = null; renderCategoryList(); return; }
        try {
          await api("/api/categories", { method: "PATCH", body: JSON.stringify({ oldName, newName }) });
          renamingCategory = null;
          await loadState();
          populateCatFilter();
          populateCatSelects();
          renderCategoryList();
          renderAll();
          toast(oldName + " renamed to " + newName);
        } catch (err) { toast(err.message); }
      });
    });
    const renameInputEl = wrap.querySelector(".cat-rename-input");
    if (renameInputEl) {
      renameInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") wrap.querySelector("[data-save-rename]").click();
        if (e.key === "Escape") { renamingCategory = null; renderCategoryList(); }
      });
    }

    wrap.querySelectorAll("[data-delete-category]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const name = btn.getAttribute("data-delete-category");
        const n = countPosUsingCategory(name);
        const msg = n > 0
          ? 'Delete "' + name + '"? ' + n + " PO line" + (n !== 1 ? "s" : "") + ' using it will be moved to "Other / Miscellaneous".'
          : 'Delete "' + name + '"?';
        if (!confirm(msg)) return;
        try {
          await api("/api/categories?name=" + encodeURIComponent(name), { method: "DELETE" });
          await loadState();
          populateCatFilter();
          populateCatSelects();
          renderCategoryList();
          renderAll();
          toast(name + " deleted");
        } catch (err) { toast(err.message); }
      });
    });
  }

  function openCategoryModal(targetSelect) {
    categoryModalTarget = targetSelect || null;
    renamingCategory = null;
    document.getElementById("category-name").value = "";
    renderCategoryList();
    categoryModal.classList.add("open");
    document.getElementById("category-name").focus();
  }
  document.getElementById("btn-add-category").addEventListener("click", () => openCategoryModal(null));
  document.getElementById("category-cancel").addEventListener("click", () => {
    // if this was opened from the PO modal's dropdown, don't leave it stuck on "__new__"
    if (categoryModalTarget) categoryModalTarget.value = state.categories[0] || "";
    renamingCategory = null;
    categoryModal.classList.remove("open");
  });
  categoryModal.addEventListener("click", (e) => {
    if (e.target === categoryModal) {
      if (categoryModalTarget) categoryModalTarget.value = state.categories[0] || "";
      renamingCategory = null;
      categoryModal.classList.remove("open");
    }
  });

  document.getElementById("category-save").addEventListener("click", async () => {
    const name = document.getElementById("category-name").value.trim();
    if (!name) { toast("Category name is required"); return; }
    try {
      await api("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
      await loadState();
      populateCatFilter();
      if (categoryModalTarget) {
        populateCatSelects();
        categoryModalTarget.value = name;
        categoryModal.classList.remove("open");
      } else {
        populateCatSelects();
        document.getElementById("category-name").value = "";
        renderCategoryList();
      }
      renderAll();
      toast(name + " added");
    } catch (err) { toast(err.message); }
  });

  // ---------- New Job modal ----------
  const jobModal = document.getElementById("job-modal");
  function openJobModal() {
    document.getElementById("job-name").value = "";
    document.getElementById("job-client").value = "";
    document.getElementById("job-start").value = todayStr();
    document.getElementById("job-status").value = "Active";
    jobModal.classList.add("open");
    document.getElementById("job-name").focus();
  }
  document.getElementById("btn-new-job-fromtab").addEventListener("click", openJobModal);
  document.getElementById("job-cancel").addEventListener("click", () => jobModal.classList.remove("open"));
  jobModal.addEventListener("click", (e) => { if (e.target === jobModal) jobModal.classList.remove("open"); });

  document.getElementById("job-save").addEventListener("click", async () => {
    const name = document.getElementById("job-name").value.trim();
    if (!name) { toast("Job name is required"); return; }
    try {
      const { id } = await api("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          name,
          client: document.getElementById("job-client").value.trim(),
          startDate: document.getElementById("job-start").value || "",
          status: document.getElementById("job-status").value,
        }),
      });
      state.activeJobId = id;
      jobModal.classList.remove("open");
      await refresh();
      switchTab("dashboard");
      toast(name + " created");
    } catch (err) { toast(err.message); }
  });

  // ---------- Export / Import ----------
  const XLSX_MONEY_FMT = '"$"#,##0.00;[RED]"-$"#,##0.00';
  const XLSX_DATE_FMT = "yyyy-mm-dd";

  function setColFormat(ws, colLetter, startRow, endRow, fmt, asDate) {
    for (let r = startRow; r <= endRow; r++) {
      const ref = colLetter + r;
      const cell = ws[ref];
      if (!cell) continue;
      if (asDate && typeof cell.v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cell.v)) {
        cell.v = new Date(cell.v + "T00:00:00");
        cell.t = "d";
      }
      cell.z = fmt;
    }
  }

  function exportToExcel() {
    const job = activeJob();
    if (!job) { toast("Create a job first"); return; }
    const poRows = job.pos.map((p) => {
      const cost = costForPO(job, p.po);
      return { "PO #": p.po, "Type": p.type, "Category": p.category, "Budget": p.budget, "Cost to Date": cost, "Balance": (Number(p.budget) || 0) - cost };
    });
    const invRows = job.invoices.map((i) => ({ "Date": i.date || "", "PO Code": i.po, "Vendor": i.vendor || "", "Invoice #": i.invoiceNum || "", "Amount": i.amount, "Source": i.source || "" }));

    const wb = window.XLSX.utils.book_new();
    const ws1 = window.XLSX.utils.json_to_sheet(poRows);
    ws1["!cols"] = [{ wch: 12 }, { wch: 42 }, { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    setColFormat(ws1, "D", 2, poRows.length + 1, XLSX_MONEY_FMT, false);
    setColFormat(ws1, "E", 2, poRows.length + 1, XLSX_MONEY_FMT, false);
    setColFormat(ws1, "F", 2, poRows.length + 1, XLSX_MONEY_FMT, false);

    const ws2 = window.XLSX.utils.json_to_sheet(invRows);
    ws2["!cols"] = [{ wch: 13 }, { wch: 12 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
    setColFormat(ws2, "A", 2, invRows.length + 1, XLSX_DATE_FMT, true);
    setColFormat(ws2, "E", 2, invRows.length + 1, XLSX_MONEY_FMT, false);

    window.XLSX.utils.book_append_sheet(wb, ws1, "PO Detail");
    window.XLSX.utils.book_append_sheet(wb, ws2, "Invoice Log");
    const fname = (job.name || "Job Cost").replace(/[^\w\- ]+/g, "") + " - Export.xlsx";
    window.XLSX.writeFile(wb, fname);
    toast("Exported " + job.name + " to Excel");
  }

  function normHeader(h) { return String(h || "").trim().toLowerCase(); }
  function findCol(headers, candidates) {
    for (const cand of candidates) {
      const idx = headers.findIndex((h) => normHeader(h) === cand);
      if (idx !== -1) return idx;
    }
    for (const cand of candidates) {
      const idx = headers.findIndex((h) => normHeader(h).includes(cand));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const CATEGORY_RULES = [
    ["Overhead & General Conditions", ["supervision", "business ins", "group health", "overtime (", "interest (", "contigency", "contingency", "transportation,", "cleanup (", "punchout (", "misc. - safety", "vehicle expense"]],
    ["Equipment", ["concrete pump", "crane", "scaffolding", "machine rentals", "hollow metal", "ceiling grinding"]],
    ["Masonry", ["masonry", "filled cells"]],
    ["Sitework & Shoring", ["excavation", "shoring", "safety - labor"]],
    ["Rebar, Wire & Post-Tension", ["rebar", "reinforcing", "wire products", "wire mesh", "post tension", "pt labor", "beam accessories"]],
    ["Formwork & Lumber", ["form labor", "form lumber", "form rental", "lumber -"]],
    ["Finishing Labor", ["finish"]],
    ["Concrete", ["concrete"]],
  ];
  function classifyTypeClient(typeText) {
    const t = String(typeText || "").toLowerCase();
    for (const [cat, kws] of CATEGORY_RULES) {
      for (const kw of kws) { if (t.includes(kw)) return cat; }
    }
    return "Other / Miscellaneous";
  }

  async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const job = activeJob();
    if (!job) { toast("Create a job first"); e.target.value = ""; return; }
    try {
      const data = await file.arrayBuffer();
      const wb = window.XLSX.read(data, { type: "array" });
      const poRowsToSend = [];
      const invRowsToSend = [];
      let skippedDupes = 0;

      for (const sheetName of wb.SheetNames) {
        const sheet = wb.Sheets[sheetName];
        const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" });
        if (rows.length < 2) continue;
        const headers = rows[0].map((h) => String(h));
        const body = rows.slice(1).filter((r) => r.some((c) => c !== "" && c !== null));

        const amountCol = findCol(headers, ["amount", "cost to date", "cost"]);
        const poCol = findCol(headers, ["po code", "po #", "po#", "po"]);
        const budgetCol = findCol(headers, ["budget"]);
        const typeCol = findCol(headers, ["type", "description"]);
        const categoryCol = findCol(headers, ["category"]);
        const dateCol = findCol(headers, ["date"]);
        const vendorCol = findCol(headers, ["vendor"]);
        const invoiceNumCol = findCol(headers, ["invoice #", "invoice#", "invoice num", "invoice"]);

        const looksLikeInvoiceSheet = poCol !== -1 && amountCol !== -1 && (dateCol !== -1 || vendorCol !== -1 || invoiceNumCol !== -1) && budgetCol === -1;
        const looksLikePOSheet = poCol !== -1 && budgetCol !== -1;

        if (looksLikePOSheet) {
          body.forEach((r) => {
            const po = String(r[poCol] || "").trim();
            if (!po) return;
            poRowsToSend.push({
              po, type: typeCol !== -1 ? String(r[typeCol] || "").trim() : "",
              budget: parseFloat(r[budgetCol]) || 0,
              category: categoryCol !== -1 ? String(r[categoryCol] || "").trim() : "",
            });
          });
        } else if (looksLikeInvoiceSheet) {
          body.forEach((r) => {
            const po = String(r[poCol] || "").trim();
            const amount = parseFloat(r[amountCol]);
            if (!po || isNaN(amount)) return;
            let dateVal = dateCol !== -1 ? r[dateCol] : "";
            let dateStr = null;
            if (dateVal instanceof Date) {
              dateStr = dateVal.toISOString().slice(0, 10);
            } else if (typeof dateVal === "number" && dateVal > 0) {
              const d = window.XLSX.SSF.parse_date_code(dateVal);
              if (d) dateStr = d.y + "-" + String(d.m).padStart(2, "0") + "-" + String(d.d).padStart(2, "0");
            } else if (dateVal) {
              dateStr = String(dateVal).trim().slice(0, 10);
            }
            const vendor = vendorCol !== -1 ? (String(r[vendorCol] || "").trim() || null) : null;
            const invoiceNum = invoiceNumCol !== -1 ? (String(r[invoiceNumCol] || "").trim() || null) : null;

            const fingerprint = po + "|" + dateStr + "|" + vendor + "|" + invoiceNum + "|" + amount;
            const dupe = job.invoices.some((i) => (i.po + "|" + i.date + "|" + i.vendor + "|" + i.invoiceNum + "|" + i.amount) === fingerprint);
            if (dupe) { skippedDupes++; return; }
            invRowsToSend.push({ po, date: dateStr, vendor, invoiceNum, amount });
          });
        }
      }

      let addedPOs = 0, updatedPOs = 0, addedInvoices = 0;
      if (poRowsToSend.length > 0) {
        const before = job.pos.map((p) => p.po);
        const res = await api("/api/pos/bulk", { method: "POST", body: JSON.stringify({ jobId: job.id, rows: poRowsToSend }) });
        addedPOs = res.added; updatedPOs = res.updated;
      }
      if (invRowsToSend.length > 0) {
        const res = await api("/api/invoices/bulk", { method: "POST", body: JSON.stringify({ jobId: job.id, rows: invRowsToSend }) });
        addedInvoices = res.added;
      }

      await refresh();
      const parts = [];
      if (addedInvoices) parts.push(addedInvoices + " invoice" + (addedInvoices !== 1 ? "s" : "") + " added");
      if (skippedDupes) parts.push(skippedDupes + " duplicate" + (skippedDupes !== 1 ? "s" : "") + " skipped");
      if (updatedPOs) parts.push(updatedPOs + " PO" + (updatedPOs !== 1 ? "s" : "") + " updated");
      if (addedPOs) parts.push(addedPOs + " PO" + (addedPOs !== 1 ? "s" : "") + " added");
      toast(parts.length ? parts.join(", ") + " in " + job.name : "Nothing recognizable found in that file");
    } catch (err) {
      console.error(err);
      toast("Could not read that file — check it's a valid Excel file");
    } finally {
      e.target.value = "";
    }
  }

  document.getElementById("btn-export").addEventListener("click", exportToExcel);
  document.getElementById("btn-import").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", handleImportFile);

  // ---------- Back to top ----------
  const backToTopBtn = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("show", window.scrollY > 400);
  });
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- Init ----------
  (async function init() {
    try {
      await loadState();
      populateCatFilter();
      renderAll();
      document.getElementById("loading").style.display = "none";
      document.getElementById("app").style.display = "block";
    } catch (err) {
      console.error(err);
    }
  })();
}
