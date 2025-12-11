const dishes = [
  { name: '红油抄手', category: '小吃', prompt: 'chinese wontons with chili oil, bright red sauce, sprinkled with scallions' },
  { name: '酸辣粉', category: '粉面', prompt: 'hot and sour glass noodles, chili oil broth, peanuts and greens' },
  { name: '辣椒炒肉', category: '荤菜', prompt: 'stir fried pork with chili peppers, glossy sauce, home style' },
  { name: '麻婆豆腐', category: '荤菜', prompt: 'mapo tofu with minced pork, red oil, silken tofu, Sichuan peppercorn' },
  { name: '干锅花菜', category: '素菜', prompt: 'dry pot cauliflower with bacon slices and chili peppers' },
  { name: '麻辣烫', category: '小吃', prompt: 'malatang skewers in spicy broth, colorful vegetables and meat' },
  { name: '水煮牛肉', category: '荤菜', prompt: 'sichuan boiled beef slices in spicy red broth, chili and herbs' },
  { name: '水煮肉片', category: '荤菜', prompt: 'spicy boiled pork slices with vegetables, red chili oil broth' },
  { name: '螺蛳粉', category: '粉面', prompt: 'luosifen rice noodles with pickled bamboo shoots, peanuts, rich broth' },
  { name: '土豆丝', category: '素菜', prompt: 'shredded potato stir fry with bell peppers and vinegar' },
  { name: '重庆辣子鸡', category: '荤菜', prompt: 'chongqing spicy chicken with dried chilies and peppercorns' },
  { name: '番茄鸡蛋汤', category: '汤羹', prompt: 'tomato egg drop soup, bright red broth with egg ribbons' },
  { name: '蔬菜汤', category: '汤羹', prompt: 'clear vegetable soup with carrots, corn, greens' },
  { name: '牛排', category: '西式', prompt: 'grilled steak with grill marks, served with vegetables' },
  { name: '豪华辛拉面', category: '粉面', prompt: 'ramen bowl with rich broth, egg, corn, greens, noodles' },
  { name: '太二酸菜鱼', category: '荤菜', prompt: 'pickled mustard fish fillet in golden broth, chili oil on top' },
  { name: '酸菜鱼面', category: '粉面', prompt: 'fish slice noodle soup with pickled greens and chili oil' },
  { name: '番茄肥牛', category: '荤菜', prompt: 'tomato braised beef slices with mushrooms and greens' },
  { name: '青椒煎蛋', category: '素菜', prompt: 'pan fried eggs with green peppers, golden edges' },
  { name: '番茄煎蛋', category: '素菜', prompt: 'pan fried eggs with tomato slices, bright and juicy' },
];

const menuGrid = document.getElementById('menu-grid');
const heroDish = document.getElementById('hero-dish');
const heroCategory = document.getElementById('hero-category');
const filtersEl = document.getElementById('filters');
const orderBtn = document.getElementById('order-btn');

let selectedDish = dishes[0];
let activeCategory = '全部';
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

function makeImageUrl(dish) {
  const prompt = encodeURIComponent(`tasty ${dish.prompt}, bright light, high quality food photo`);
  return `https://image.pollinations.ai/prompt/${prompt}`;
}

function renderFilters() {
  const categories = ['全部', ...new Set(dishes.map((dish) => dish.category))];
  filtersEl.innerHTML = '';
  categories.forEach((cat) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter ${cat === activeCategory ? 'active' : ''}`;
    button.textContent = cat;
    button.addEventListener('click', () => {
      activeCategory = cat;
      renderFilters();
      renderMenu();
    });
    filtersEl.appendChild(button);
  });
}

function renderMenu() {
  const fragment = document.createDocumentFragment();
  const filtered = activeCategory === '全部'
    ? dishes
    : dishes.filter((dish) => dish.category === activeCategory);

  filtered.forEach((dish) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.name = dish.name;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = `${dish.name} 照片`;
    img.src = makeImageUrl(dish);
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = dish.name;

    const cat = document.createElement('p');
    cat.className = 'category';
    cat.textContent = dish.category;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill';
    button.textContent = '选这道';
    button.addEventListener('click', () => selectDish(dish, card));

    body.appendChild(title);
    body.appendChild(cat);
    body.appendChild(button);

    card.appendChild(body);
    fragment.appendChild(card);
  });

  menuGrid.innerHTML = '';
  menuGrid.appendChild(fragment);
  highlightSelection();
}

function selectDish(dish, cardElement) {
  selectedDish = dish;
  heroDish.textContent = dish.name;
  heroCategory.textContent = dish.category;
  highlightSelection(cardElement);
}

function highlightSelection(cardElement) {
  document.querySelectorAll('.card').forEach((card) => {
    const name = card.dataset.name;
    card.classList.toggle('selected', selectedDish && name === selectedDish.name);
  });

  if (!cardElement && selectedDish) {
    const found = document.querySelector(`.card[data-name="${selectedDish.name}"]`);
    if (found) found.classList.add('selected');
  }
}

function getShareUrl() {
  const url = new URL(location.href);
  url.searchParams.set('dish', selectedDish.name);
  return url.toString();
}

function buildShareText() {
  const title = '小曦的厨房';
  const url = getShareUrl();
  const text = `我想吃：${selectedDish.name}\n看看这道菜：${url}`;
  return { title, text, url };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('内容已复制');
  } catch (_) {
    showToast('复制失败，请手动复制');
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2200);
}

function handleOrder() {
  if (!selectedDish) {
    showToast('先选一道菜');
    return;
  }

  const { title, text, url } = buildShareText();

  if (isWeChat) {
    copyText(text);
    showToast('微信内已复制，点右上角分享给我');
    return;
  }

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {
      copyText(text);
      showToast('分享取消，已复制内容');
    });
  } else {
    copyText(text);
  }
}

function init() {
  const params = new URLSearchParams(location.search);
  const urlDish = params.get('dish');
  const found = dishes.find((dish) => dish.name === urlDish);
  if (found) {
    selectedDish = found;
  }

  renderFilters();
  renderMenu();
  selectDish(selectedDish);
  orderBtn.addEventListener('click', handleOrder);
}

document.addEventListener('DOMContentLoaded', init);
