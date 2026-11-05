const tabs=[...document.querySelectorAll('.day-tab')];
const panels=[...document.querySelectorAll('.day-panel')];

function selectDay(tab,moveFocus=false){
  tabs.forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1});
  panels.forEach(panel=>{const active=panel.id===tab.dataset.day;panel.classList.toggle('active',active);panel.hidden=!active});
  if(moveFocus)tab.focus();
}

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectDay(tab));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    selectDay(tabs[next],true);
  });
});

document.querySelectorAll('.check').forEach(button=>button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'))));

document.querySelectorAll('.mapcode').forEach(button=>button.addEventListener('click',async()=>{
  const label=button.querySelector('b');
  try{
    await navigator.clipboard.writeText(button.dataset.code);
    button.classList.add('copied');
    label.textContent='已複製';
    window.setTimeout(()=>{button.classList.remove('copied');label.textContent='複製'},1400);
  }catch{
    label.textContent='請長按';
  }
}));

/* ==================== 互動式行李打包清單邏輯 ==================== */
(function initPackingChecklist() {
  const STORAGE_KEY = 'okinawa_2026_packing_v1';

  // 完整收錄所有指定類別與 54 個品項
  const PACKING_DATA = [
    {
      id: 'carry-on',
      title: '1. 隨身物品',
      icon: '🛂',
      important: true,
      items: [
        { id: 'c1', name: '護照' },
        { id: 'c2', name: '機票' },
        { id: 'c3', name: '現金' },
        { id: 'c4', name: '信用卡' },
        { id: 'c5', name: '身分證' },
        { id: 'c6', name: '台灣駕照正本' },
        { id: 'c7', name: '駕照日文譯本' },
        { id: 'c8', name: 'Visit Japan Web QR截圖' },
        { id: 'c9', name: '行動電源' },
        { id: 'c10', name: '衛生紙' },
        { id: 'c11', name: '濕紙巾' },
        { id: 'c12', name: '護手霜' },
        { id: 'c13', name: '口罩', tag: '防疫備品' },
        { id: 'c14', name: '酒精', tag: '防疫備品' }
      ]
    },
    {
      id: 'toiletries',
      title: '2. 盥洗用品',
      icon: '🪥',
      items: [
        { id: 't1', name: '洗面乳' },
        { id: 't2', name: '卸妝油' },
        { id: 't3', name: '洗髮乳' },
        { id: 't4', name: '沐浴乳' },
        { id: 't5', name: '潤髮乳' },
        { id: 't6', name: '護髮油' },
        { id: 't7', name: '牙膏' },
        { id: 't8', name: '牙刷' },
        { id: 't9', name: '毛巾' },
        { id: 't10', name: '髒衣塑膠袋' }
      ]
    },
    {
      id: 'skincare',
      title: '3. 保養與美妝',
      icon: '💄',
      items: [
        { id: 's1', name: '保養品' },
        { id: 's2', name: '化妝品' },
        { id: 's3', name: '防曬' },
        { id: 's4', name: '乳液' },
        { id: 's5', name: '耳環' },
        { id: 's6', name: '隱形眼鏡' },
        { id: 's7', name: '夾子', tag: '頭髮配件' },
        { id: 's8', name: '髮夾', tag: '頭髮配件' },
        { id: 's9', name: '髮圈', tag: '頭髮配件' }
      ]
    },
    {
      id: 'electronics',
      title: '4. 電子產品',
      icon: '🔌',
      items: [
        { id: 'e1', name: '充電線' },
        { id: 'e2', name: '轉接頭' },
        { id: 'e3', name: '耳機' }
      ]
    },
    {
      id: 'medicine',
      title: '5. 常備藥品',
      icon: '💊',
      items: [
        { id: 'm1', name: '腸胃藥' },
        { id: 'm2', name: '感冒藥' },
        { id: 'm3', name: '止痛藥' },
        { id: 'm4', name: '過敏藥' },
        { id: 'm5', name: '痠痛藥膏' },
        { id: 'm6', name: 'OK蹦' }
      ]
    },
    {
      id: 'clothing',
      title: '6. 衣物穿搭',
      icon: '👗',
      items: [
        { id: 'w1', name: '衣服' },
        { id: 'w2', name: '褲子' },
        { id: 'w3', name: '內衣' },
        { id: 'w4', name: '內褲' },
        { id: 'w5', name: '襪子' },
        { id: 'w6', name: '帽子' },
        { id: 'w7', name: '手套' },
        { id: 'w8', name: '外套' },
        { id: 'w9', name: '睡衣' },
        { id: 'w10', name: '拖鞋' }
      ]
    },
    {
      id: 'misc',
      title: '7. 個人雜項',
      icon: '🕶️',
      items: [
        { id: 'o1', name: '眼鏡' },
        { id: 'o2', name: '太陽眼鏡' },
        { id: 'o3', name: '衛生棉' },
        { id: 'o4', name: '眼罩' },
        { id: 'o5', name: '雨傘' },
        { id: 'o6', name: '購物袋' }
      ]
    }
  ];

  let checkedState = {};
  let currentTab = 'all';

  // 讀取 LocalStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      checkedState = saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('無法讀取 LocalStorage，將使用預設狀態', e);
      checkedState = {};
    }
  }

  // 寫入 LocalStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedState));
    } catch (e) {
      console.warn('無法寫入 LocalStorage', e);
    }
  }

  // 更新頂部進度條與統計數據
  function updateDashboard() {
    const totalItems = PACKING_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = PACKING_DATA.reduce((acc, cat) => {
      return acc + cat.items.filter(item => checkedState[item.id]).length;
    }, 0);

    const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    const statsText = document.getElementById('pk-stats-text');
    const progressBar = document.getElementById('pk-progress-bar');

    if (statsText) {
      statsText.textContent = `已完成 ${completedItems} / ${totalItems} (${percent}%)`;
    }
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }

  // 渲染分類篩選 Tabs
  function renderTabs() {
    const tabsContainer = document.getElementById('pk-tabs');
    if (!tabsContainer) return;

    const allTabs = [
      { id: 'all', label: '全部顯示' },
      ...PACKING_DATA.map(cat => ({ id: cat.id, label: `${cat.icon} ${cat.title.replace(/^\d+\.\s*/, '')}` }))
    ];

    tabsContainer.innerHTML = allTabs.map(tab => `
      <button 
        type="button" 
        class="pk-tab-btn ${currentTab === tab.id ? 'active' : ''}" 
        data-tab="${tab.id}">
        ${tab.label}
      </button>
    `).join('');
  }

  // 渲染分類卡片與品項
  function renderGrid() {
    const gridContainer = document.getElementById('pk-grid');
    if (!gridContainer) return;

    const filteredCategories = currentTab === 'all'
      ? PACKING_DATA
      : PACKING_DATA.filter(cat => cat.id === currentTab);

    gridContainer.innerHTML = filteredCategories.map(cat => {
      const doneCount = cat.items.filter(i => checkedState[i.id]).length;
      const totalCount = cat.items.length;

      const itemsHtml = cat.items.map(item => {
        const isChecked = !!checkedState[item.id];
        const tagHtml = item.tag ? `<span class="pk-subtag">${item.tag}</span>` : '';
        return `
          <li>
            <label class="pk-item-label ${isChecked ? 'checked' : ''}">
              <input 
                type="checkbox" 
                class="pk-checkbox" 
                data-item-id="${item.id}" 
                ${isChecked ? 'checked' : ''}
              />
              <span class="pk-item-text">${tagHtml}${item.name}</span>
            </label>
          </li>
        `;
      }).join('');

      return `
        <article class="pk-card ${cat.important ? 'pk-card-important' : ''}">
          <div class="pk-card-header">
            <h3 class="pk-card-title">
              <span>${cat.icon} ${cat.title}</span>
              ${cat.important ? '<span class="pk-badge-important">最重要</span>' : ''}
            </h3>
            <span class="pk-card-count">${doneCount} / ${totalCount}</span>
          </div>
          <ul class="pk-item-list">
            ${itemsHtml}
          </ul>
        </article>
      `;
    }).join('');
  }

  // 綁定互動事件
  function bindEvents() {
    const section = document.getElementById('packing-section');
    if (!section) return;

    // 勾選事件代理
    section.addEventListener('change', (e) => {
      if (e.target.classList.contains('pk-checkbox')) {
        const itemId = e.target.getAttribute('data-item-id');
        checkedState[itemId] = e.target.checked;
        saveState();
        updateDashboard();
        renderGrid();
      }
    });

    // 切換分類頁籤與全部重置
    section.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.pk-tab-btn');
      if (tabBtn) {
        currentTab = tabBtn.getAttribute('data-tab');
        renderTabs();
        renderGrid();
        return;
      }

      const resetBtn = e.target.closest('#pk-reset-btn');
      if (resetBtn) {
        if (window.confirm('確定要清空所有已勾選的打包紀錄，重新開始嗎？')) {
          checkedState = {};
          saveState();
          updateDashboard();
          renderGrid();
        }
      }
    });
  }

  // 啟動初始化
  function init() {
    if (!document.getElementById('packing-section')) return;
    loadState();
    renderTabs();
    renderGrid();
    updateDashboard();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
