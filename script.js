const state = {
  products: [],
  filter: "all",
  query: "",
  selected: new Set(),
};

const els = {
  fileInput: document.querySelector("#fileInput"),
  fileDrop: document.querySelector("#fileDrop"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  exportButton: document.querySelector("#exportButton"),
  openAllButton: document.querySelector("#openAllButton"),
  totalCount: document.querySelector("#totalCount"),
  pendingCount: document.querySelector("#pendingCount"),
  matchedCount: document.querySelector("#matchedCount"),
  averagePrice: document.querySelector("#averagePrice"),
  queryPrefix: document.querySelector("#queryPrefix"),
  currencyRate: document.querySelector("#currencyRate"),
  filterSelect: document.querySelector("#filterSelect"),
  tableSearch: document.querySelector("#tableSearch"),
  emptyState: document.querySelector("#emptyState"),
  tableWrap: document.querySelector("#tableWrap"),
  productRows: document.querySelector("#productRows"),
  selectAll: document.querySelector("#selectAll"),
};

const sampleProducts = [
  {
    id: crypto.randomUUID(),
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80",
    sourceName: "미니멀 여성 숄더백",
    sourcePrice: "39,000원",
    taobaoName: "ins风小方包女单肩斜挎包",
    taobaoUrl: "https://item.taobao.com/item.htm?id=sample-bag",
    taobaoPrice: "68",
  },
  {
    id: crypto.randomUUID(),
    image:
      "https://images.unsplash.com/photo-1608354580875-30bd4168b351?auto=format&fit=crop&w=300&q=80",
    sourceName: "원터치 스테인리스 텀블러",
    sourcePrice: "24,900원",
    taobaoName: "",
    taobaoUrl: "",
    taobaoPrice: "",
  },
  {
    id: crypto.randomUUID(),
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
    sourceName: "욕실 정리 수납 트레이",
    sourcePrice: "12,800원",
    taobaoName: "",
    taobaoUrl: "",
    taobaoPrice: "",
  },
];

function normalizeKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/\s|_|-/g, "");
}

function findValue(row, candidates) {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    const match = entries.find(([key]) => normalizeKey(key).includes(normalizedCandidate));
    if (match) return match[1];
  }
  return "";
}

function formatNumber(value) {
  return Number(value).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

function formatTaobaoPrice(value) {
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  if (!numeric) return "-";
  return `¥${formatNumber(numeric)}`;
}

function getSearchUrl(product) {
  const prefix = els.queryPrefix.value.trim();
  const query = [prefix, product.sourceName].filter(Boolean).join(" ");
  return `https://s.taobao.com/search?q=${encodeURIComponent(query)}&search_type=item&ie=utf8`;
}

function getImageSearchUrl() {
  return "https://taobao-image-search.com/";
}

function getVisibleProducts() {
  return state.products.filter((product) => {
    const matched = Boolean(product.taobaoName || product.taobaoUrl || product.taobaoPrice);
    if (state.filter === "pending" && matched) return false;
    if (state.filter === "matched" && !matched) return false;
    if (!state.query) return true;
    return product.sourceName.toLowerCase().includes(state.query.toLowerCase());
  });
}

function renderStats() {
  const matched = state.products.filter((product) => product.taobaoName || product.taobaoUrl || product.taobaoPrice);
  const prices = matched
    .map((product) => Number(String(product.taobaoPrice).replace(/[^0-9.]/g, "")))
    .filter(Boolean);
  const average = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

  els.totalCount.textContent = state.products.length;
  els.pendingCount.textContent = state.products.length - matched.length;
  els.matchedCount.textContent = matched.length;
  els.averagePrice.textContent = average ? `¥${formatNumber(average)}` : "-";
  els.exportButton.disabled = state.products.length === 0;
  els.openAllButton.disabled = state.selected.size === 0;
}

function renderTable() {
  const products = getVisibleProducts();
  els.emptyState.hidden = state.products.length > 0;
  els.tableWrap.hidden = state.products.length === 0;
  els.selectAll.checked = products.length > 0 && products.every((product) => state.selected.has(product.id));

  els.productRows.innerHTML = products
    .map((product) => {
      const matched = Boolean(product.taobaoName || product.taobaoUrl || product.taobaoPrice);
      return `
        <tr data-id="${product.id}">
          <td><input class="row-check" type="checkbox" ${state.selected.has(product.id) ? "checked" : ""} aria-label="${escapeHtml(product.sourceName)} 선택" /></td>
          <td>${renderImage(product)}</td>
          <td class="source-name">${escapeHtml(product.sourceName || "-")}</td>
          <td class="price">${escapeHtml(product.sourcePrice || "-")}</td>
          <td>
            <div class="action-stack">
              <a class="search-link image-search" href="${getImageSearchUrl()}" target="_blank" rel="noopener">이미지 검색</a>
              <a class="search-link keyword-search" href="${getSearchUrl(product)}" target="_blank" rel="noopener">상품명 검색</a>
              ${
                product.image
                  ? `<button class="copy-link" type="button" data-copy-image="${escapeAttribute(product.image)}">이미지 URL 복사</button>`
                  : ""
              }
            </div>
          </td>
          <td><input data-field="taobaoName" value="${escapeAttribute(product.taobaoName)}" placeholder="타오바오 상품명" /></td>
          <td><input data-field="taobaoUrl" value="${escapeAttribute(product.taobaoUrl)}" placeholder="https://item.taobao.com/..." /></td>
          <td><input data-field="taobaoPrice" value="${escapeAttribute(product.taobaoPrice)}" placeholder="예: 68" /></td>
          <td><span class="status-pill ${matched ? "matched" : "pending"}">${matched ? "입력됨" : "대기"}</span></td>
        </tr>
      `;
    })
    .join("");

  renderStats();
}

function renderImage(product) {
  if (!product.image) return `<span class="missing-image">이미지 없음</span>`;
  return `<img class="product-thumb" src="${escapeAttribute(product.image)}" alt="${escapeAttribute(product.sourceName)}" />`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

async function readWorkbook(file) {
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await readCsvText(file);
    return parseCsv(text);
  }

  if (!window.XLSX) {
    throw new Error("XLSX library is not loaded");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

async function readCsvText(file) {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (!utf8.includes("\uFFFD")) return utf8;
  try {
    return new TextDecoder("euc-kr", { fatal: false }).decode(buffer);
  } catch {
    return utf8;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    headers.reduce((record, header, index) => {
      record[header || `column_${index + 1}`] = values[index] ?? "";
      return record;
    }, {}),
  );
}

async function handleFile(file) {
  if (!file) return;
  const rows = await readWorkbook(file);
  state.products = rows.map((row) => ({
    id: crypto.randomUUID(),
    image: String(findValue(row, ["이미지", "image", "imageurl", "image_url", "사진", "url"])).trim(),
    sourceName: String(findValue(row, ["상품명", "product", "name", "title", "제품명"])).trim(),
    sourcePrice: String(findValue(row, ["가격", "price", "판매가", "원가"])).trim(),
    taobaoName: String(findValue(row, ["타오바오상품명", "taobaoname"])).trim(),
    taobaoUrl: String(findValue(row, ["타오바오url", "taobaourl"])).trim(),
    taobaoPrice: String(findValue(row, ["타오바오가격", "taobaoprice"])).trim(),
  }));
  state.selected = new Set(state.products.map((product) => product.id));
  renderTable();
}

function exportCsv() {
  const header = ["원본 상품명", "원본 가격", "이미지", "타오바오 상품명", "타오바오 URL", "타오바오 가격", "환산 원화"];
  const rate = Number(els.currencyRate.value) || 0;
  const rows = state.products.map((product) => {
    const price = Number(String(product.taobaoPrice).replace(/[^0-9.]/g, "")) || 0;
    return [
      product.sourceName,
      product.sourcePrice,
      product.image,
      product.taobaoName,
      product.taobaoUrl,
      formatTaobaoPrice(product.taobaoPrice),
      price && rate ? `${formatNumber(price * rate)}원` : "",
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "taobao-sourcing-results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

els.fileInput.addEventListener("change", (event) => {
  handleFile(event.target.files[0]).catch((error) => {
    console.error(error);
    alert("엑셀 파일을 읽지 못했습니다. 첫 번째 시트와 컬럼명을 확인해주세요.");
  });
});

["dragenter", "dragover"].forEach((eventName) => {
  els.fileDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.fileDrop.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.fileDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.fileDrop.classList.remove("dragging");
  });
});

els.fileDrop.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  handleFile(file).catch((error) => {
    console.error(error);
    alert("파일을 읽지 못했습니다. CSV는 첫 줄에 상품명, 가격, 이미지 컬럼명이 있어야 합니다.");
  });
});

els.loadSampleButton.addEventListener("click", () => {
  state.products = sampleProducts.map((product) => ({ ...product, id: crypto.randomUUID() }));
  state.selected = new Set(state.products.map((product) => product.id));
  renderTable();
});

els.productRows.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) return;
  const row = event.target.closest("tr");
  const product = state.products.find((item) => item.id === row.dataset.id);
  product[field] = event.target.value;
  renderStats();
  row.querySelector(".status-pill").className = `status-pill ${
    product.taobaoName || product.taobaoUrl || product.taobaoPrice ? "matched" : "pending"
  }`;
  row.querySelector(".status-pill").textContent =
    product.taobaoName || product.taobaoUrl || product.taobaoPrice ? "입력됨" : "대기";
});

els.productRows.addEventListener("change", (event) => {
  if (!event.target.classList.contains("row-check")) return;
  const id = event.target.closest("tr").dataset.id;
  if (event.target.checked) state.selected.add(id);
  else state.selected.delete(id);
  renderStats();
});

els.productRows.addEventListener("click", async (event) => {
  const imageUrl = event.target.dataset.copyImage;
  if (!imageUrl) return;
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(imageUrl);
  } else {
    const input = document.createElement("textarea");
    input.value = imageUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  event.target.textContent = "복사됨";
  setTimeout(() => {
    event.target.textContent = "이미지 URL 복사";
  }, 1200);
});

els.selectAll.addEventListener("change", () => {
  const visibleIds = getVisibleProducts().map((product) => product.id);
  visibleIds.forEach((id) => {
    if (els.selectAll.checked) state.selected.add(id);
    else state.selected.delete(id);
  });
  renderTable();
});

els.filterSelect.addEventListener("change", () => {
  state.filter = els.filterSelect.value;
  renderTable();
});

els.tableSearch.addEventListener("input", () => {
  state.query = els.tableSearch.value.trim();
  renderTable();
});

els.queryPrefix.addEventListener("input", renderTable);
els.exportButton.addEventListener("click", exportCsv);

els.openAllButton.addEventListener("click", () => {
  state.products
    .filter((product) => state.selected.has(product.id))
    .slice(0, 10)
    .forEach((product) => window.open(getSearchUrl(product), "_blank", "noopener"));
});

renderTable();
