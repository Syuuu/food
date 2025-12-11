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

const KITCHEN_EMAIL = 'your-email@example.com'; // 修改为你接收提醒的邮箱

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

const badgeTexts = ['重磅热菜', '今日想吃', '暖心汤品', '速溶快手', '灵魂主食'];

function today() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function makeImageUrl(name) {
  const prompt = encodeURIComponent(`cinematic food photography, ${name}, studio light, ai generated, 4k`);
  return `https://image.pollinations.ai/prompt/${prompt}`;
}

function renderMenu() {
  const fragment = document.createDocumentFragment();
  dishes.forEach((name, idx) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.name = name;

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = badgeTexts[idx % badgeTexts.length];
    card.appendChild(badge);

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = `${name} 图片 (AI 生成)`;
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

function buildMailto({ name, date, notes }) {
  const subject = encodeURIComponent(`小曦的厨房点餐 - ${date}`);
  const greeting = name ? `${name} 想吃：${selectedDish}` : `点餐：${selectedDish}`;
  const lines = [
    greeting,
    '',
    `日期：${date}`,
    `备注：${notes || '无'}`,
    '',
    '来自小曦的厨房 App 自动生成'
  ];
  const bodyText = lines.join('\n');
  const body = encodeURIComponent(bodyText);
  return { mailto: `mailto:${KITCHEN_EMAIL}?subject=${subject}&body=${body}`, bodyText };
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

  const formData = new FormData(orderForm);
  const name = formData.get('name')?.trim();
  const date = formData.get('date');
  const notes = formData.get('notes')?.trim();

  const { mailto, bodyText } = buildMailto({ name, date, notes });

  emailPreview.value = bodyText;
  copyPanel.hidden = false;
  localStorage.setItem('last-order-date', today());
  updateStatus();

  window.location.href = mailto;
}

function copyText() {
  navigator.clipboard.writeText(emailPreview.value).then(() => {
    copyBtn.textContent = '已复制，再去邮箱粘贴';
    setTimeout(() => (copyBtn.textContent = '复制邮件正文'), 2000);
  });
}

function shuffleHero() {
  const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
  heroDish.textContent = randomDish;
}

function initFormDefaults() {
  document.getElementById('date').value = today();
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
