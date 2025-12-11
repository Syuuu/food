const dishes = [
  '红油抄手',
  '酸辣粉',
  '辣椒炒肉',
  '麻婆豆腐',
  '干锅花菜',
  '麻辣烫',
  '水煮牛肉',
  '水煮肉片',
  '螺蛳粉',
  '土豆丝',
  '重庆辣子鸡',
  '番茄鸡蛋汤',
  '蔬菜汤',
  '牛排',
  '豪华辛拉面',
  '太二酸菜鱼',
  '酸菜鱼面',
  '番茄肥牛',
  '青椒煎蛋',
  '番茄煎蛋',
];

const menuGrid = document.getElementById('menu-grid');
const heroDish = document.getElementById('hero-dish');
const resetBtn = document.getElementById('reset-btn');
const summaryEl = document.getElementById('summary');
const statusText = document.getElementById('status-text');
const orderForm = document.getElementById('order-form');
const copyPanel = document.getElementById('copy-panel');
const emailPreview = document.getElementById('email-preview');
const copyBtn = document.getElementById('copy-btn');

let selectedDish = null;
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

function today() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function makeImageUrl(name) {
  const prompt = encodeURIComponent(`high quality food photo of ${name}, close-up, natural light, appetizing, chinese home cooking`);
  return `https://image.pollinations.ai/prompt/${prompt}`;
}

function renderMenu() {
  const fragment = document.createDocumentFragment();
  dishes.forEach((name) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.name = name;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = `${name} 照片`;
    img.src = makeImageUrl(name);
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = name;

    const tags = document.createElement('div');
    tags.className = 'tags';
    ['家常', '现做', '暖胃'].forEach((tagText) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = tagText;
      tags.appendChild(tag);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill';
    button.textContent = '选择';
    button.addEventListener('click', () => selectDish(name, card));

    body.appendChild(title);
    body.appendChild(tags);
    body.appendChild(button);

    card.appendChild(body);
    fragment.appendChild(card);
  });
  menuGrid.innerHTML = '';
  menuGrid.appendChild(fragment);
}

function selectDish(name, cardElement) {
  selectedDish = name;
  heroDish.textContent = name;
  summaryEl.textContent = `已选择：${name}`;
  summaryEl.style.color = '#f4f6fb';
  document.querySelectorAll('.card').forEach((card) => card.classList.remove('selected'));
  cardElement.classList.add('selected');
}

function updateStatus() {
  const lastDate = localStorage.getItem('last-order-date');
  if (lastDate === today()) {
    statusText.textContent = '今天已经提交过啦 · 需要修改请换一天';
    statusText.style.color = '#f7d46b';
    return false;
  }
  statusText.textContent = '今天还没提交';
  statusText.style.color = '#9aa0a6';
  return true;
}

function buildShareText() {
  const title = '小曦的厨房 - 点餐';
  const lines = [`今日想吃：${selectedDish}`, `日期：${today()}`, '备注：无'];
  const text = lines.join('\n');
  return { title, text, url: location.href };
}

function handleSubmit(event) {
  event.preventDefault();
  if (!selectedDish) {
    summaryEl.textContent = '请先选择一道菜哦';
    summaryEl.style.color = '#f7d46b';
    return;
  }
  if (!updateStatus()) {
    summaryEl.textContent = '今天已经提交过啦，明天再选～';
    summaryEl.style.color = '#f7d46b';
    return;
  }

  const { title, text, url } = buildShareText();

  emailPreview.value = text;
  copyPanel.hidden = false;
  localStorage.setItem('last-order-date', today());
  updateStatus();

  summaryEl.textContent = '分享内容已准备，去分享吧';
  summaryEl.style.color = '#7ad9a5';

  if (isWeChat) {
    copyText().then(() => {
      summaryEl.textContent = '已复制内容，点右上角分享给我';
      summaryEl.style.color = '#7ad9a5';
    });
    return;
  }

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {
      summaryEl.textContent = '分享被取消，内容已生成可复制';
      summaryEl.style.color = '#f7d46b';
    });
  } else {
    summaryEl.textContent = '浏览器不支持分享，已生成可复制内容';
    summaryEl.style.color = '#f7d46b';
  }
}

function copyText() {
  return navigator.clipboard.writeText(emailPreview.value).then(() => {
    copyBtn.textContent = '已复制，去分享吧';
    setTimeout(() => (copyBtn.textContent = '复制分享文本'), 2000);
  });
}

function shuffleHero() {
  const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
  heroDish.textContent = randomDish;
}

function initFormDefaults() {
  updateStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  shuffleHero();
  initFormDefaults();

  orderForm.addEventListener('submit', handleSubmit);
  copyBtn.addEventListener('click', copyText);
  resetBtn.addEventListener('click', shuffleHero);
});
