(function () {
  'use strict';

  var CATALOG = {
    1: { name: 'Fresh Lettuce', price: 35.99, stock: 10, img: 'image/site/products/01-lettuce-thumb.webp' },
    2: { name: 'Whole Chicken', price: 180, stock: 7, img: 'image/site/products/02-chicken-thumb.webp' },
    3: { name: 'Premium Jasmine Rice', price: 320, stock: 5, img: 'image/site/products/03-rice-thumb.webp' },
    4: { name: 'Eggs (Tray of 30)', price: 170, stock: 12, img: 'image/site/products/04-eggs-thumb.webp' },
    5: { name: 'Pandesal (12 pcs)', price: 49, stock: 9, img: 'image/site/products/05-pandesal-thumb.webp' },
    6: { name: 'Laundry Detergent (1kg)', price: 60, stock: 8, img: 'image/site/products/06-detergent-thumb.webp' },
    7: { name: 'Cooking Oil (1L)', price: 95, stock: 15, img: 'image/site/products/07-oil-thumb.webp' },
    8: { name: 'Baby Care Wipes', price: 90, stock: 6, img: 'image/site/products/08-wipes-thumb.webp' },
    9: { name: 'Premium Coffee (100g)', price: 75, stock: 10, img: 'image/site/products/09-coffee-thumb.webp' },
    10: { name: 'Fruit Juice (1L)', price: 65, stock: 11, img: 'image/site/products/10-juice-thumb.webp' }
  };
  var CART_KEY = 'checkoutCart';
  var ORDER_EMAIL = 'info@cecyrashop.online';

  function $(id) { return document.getElementById(id); }
  function num(n) {
    var cents = Math.round(n * 100);
    return cents % 100 === 0
      ? (cents / 100).toLocaleString('en-PH')
      : (cents / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function peso(n) { return '₱' + num(n); }
  function priceHTML(n) { return '<span class="cur">₱</span>' + num(n); }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }

  function readCart() {
    try {
      var items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(items)) return [];
      return items.filter(function (i) { return CATALOG[i.id] && i.qty > 0; }).map(function (i) {
        return { id: i.id, qty: Math.min(Math.floor(i.qty), CATALOG[i.id].stock) };
      });
    } catch (e) { return []; }
  }
  var cart = readCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* works for this page view */ }
  }
  function line(id) { return cart.filter(function (i) { return i.id === id; })[0]; }
  function cartQty() { return cart.reduce(function (t, i) { return t + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (t, i) { return t + i.qty * CATALOG[i.id].price; }, 0); }

  function setQty(id, qty) {
    var item = line(id);
    qty = Math.min(qty, CATALOG[id].stock);
    if (qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    else if (item) item.qty = qty;
    else cart.push({ id: id, qty: qty });
    saveCart();
    render();
  }

  /* Mobile menu */
  var navList = $('nav-list');
  var navToggle = $('nav-toggle');
  function closeNav() {
    if (!navList || !navList.classList.contains('open')) return;
    navList.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
  if (navList && navToggle) {
    navToggle.addEventListener('click', function () {
      navList.classList.add('open');
      document.body.style.overflow = 'hidden';
      navToggle.setAttribute('aria-expanded', 'true');
      $('nav-close').focus();
    });
    $('nav-close').addEventListener('click', closeNav);
    navList.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* Bayong drawer */
  var sidebar = $('cart-sidebar');
  var overlay = $('cart-overlay');
  var cartBtn = $('cart-btn');
  var bar = $('bayong-bar');
  var opener = null;
  function openCart(e) {
    opener = e && e.currentTarget;
    sidebar.classList.add('open');
    overlay.classList.add('active');
    sidebar.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    $('cart-close-btn').focus();
  }
  function closeCart() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  function renderDrawer() {
    var count = cartQty();
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = count; });
    document.querySelectorAll('.cart-sum').forEach(function (el) { el.textContent = count ? peso(cartTotal()) : ''; });
    document.body.classList.toggle('has-items', count > 0);
    if (bar) {
      bar.hidden = count === 0;
      $('bar-text').textContent = count + (count === 1 ? ' item · ' : ' items · ') + peso(cartTotal());
    }
    if (!sidebar) return;
    var box = $('cart-items');
    box.innerHTML = '';
    $('cart-foot').hidden = !cart.length;
    if (!cart.length) {
      box.innerHTML = '<div class="cart-empty"><p>Your bayong is empty.</p><a class="block block--green" href="#shop" id="cart-empty-shop">Shop today\'s products</a></div>';
      $('cart-empty-shop').addEventListener('click', closeCart);
      return;
    }
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id = item.id;
      row.innerHTML =
        '<img src="' + p.img + '" alt="" width="72" height="72">' +
        '<div><h3>' + p.name + '</h3>' +
        '<div class="cart-item-row"><span class="qty">' +
        '<button type="button" data-a="dec" aria-label="Remove one ' + p.name + '">' + icon('minus') + '</button>' +
        '<output aria-label="Quantity">' + item.qty + '</output>' +
        '<button type="button" data-a="inc" aria-label="Add one more ' + p.name + '"' + (item.qty >= p.stock ? ' disabled' : '') + '>' + icon('plus') + '</button>' +
        '</span><span class="cart-item-sub">' + peso(p.price * item.qty) + '</span></div>' +
        '<button type="button" class="cart-remove" data-a="rm">Remove</button></div>';
      row.querySelector('[data-a=dec]').addEventListener('click', function () { setQty(item.id, item.qty - 1); focusLine(item.id, 'dec'); });
      row.querySelector('[data-a=inc]').addEventListener('click', function () { setQty(item.id, item.qty + 1); focusLine(item.id, 'inc'); });
      row.querySelector('[data-a=rm]').addEventListener('click', function () { setQty(item.id, 0); $('cart-close-btn').focus(); });
      box.appendChild(row);
    });
    $('cart-total').innerHTML = priceHTML(cartTotal());
  }
  function focusLine(id, action) {
    var row = document.querySelector('.cart-item[data-id="' + id + '"]');
    var btn = row && row.querySelector('[data-a=' + action + ']');
    if (btn && !btn.disabled) btn.focus(); else $('cart-close-btn').focus();
  }
  if (sidebar) {
    sidebar.setAttribute('aria-hidden', 'true');
    cartBtn.addEventListener('click', openCart);
    if (bar) bar.addEventListener('click', openCart);
    $('cart-close-btn').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    sidebar.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = sidebar.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    $('checkout-btn').addEventListener('click', function () {
      saveCart();
      window.location.href = 'order-summary.html';
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sidebar) closeCart();
    closeNav();
  });

  /* Product tiles */
  function renderTiles() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      var id = Number(card.dataset.id);
      var item = line(id);
      card.querySelector('.product-add').hidden = !!item;
      var stepper = card.querySelector('.stepper');
      stepper.hidden = !item;
      if (item) {
        stepper.querySelector('output').textContent = item.qty;
        stepper.querySelector('[data-a=inc]').disabled = item.qty >= CATALOG[id].stock;
      }
    });
  }
  function bump(id) {
    if (cartBtn) { cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump'); }
    var live = $('cart-live');
    if (live) live.textContent = CATALOG[id].name + ' updated. ' + cartQty() + ' items in your bayong.';
  }
  document.querySelectorAll('.product-card').forEach(function (card) {
    var id = Number(card.dataset.id);
    var add = card.querySelector('.product-add');
    var stepper = card.querySelector('.stepper');
    add.addEventListener('click', function () {
      setQty(id, 1); bump(id);
      stepper.querySelector('[data-a=inc]').focus();
    });
    stepper.querySelector('[data-a=inc]').addEventListener('click', function () {
      setQty(id, line(id).qty + 1); bump(id);
    });
    stepper.querySelector('[data-a=dec]').addEventListener('click', function () {
      setQty(id, line(id).qty - 1); bump(id);
      if (line(id)) stepper.querySelector('[data-a=dec]').focus(); else add.focus();
    });
    var photo = card.querySelector('.tile-photo');
    photo.addEventListener('click', function () {
      photo.setAttribute('aria-pressed', String(photo.getAttribute('aria-pressed') !== 'true'));
    });
  });

  /* Order page */
  function renderOrder() {
    var body = $('summary-cart-body');
    if (!body) return;
    if (!$('order-sent').hidden) return;
    if (!cart.length) {
      $('order-layout').hidden = true;
      $('order-empty').hidden = false;
      return;
    }
    body.innerHTML = '';
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + p.name + '<small>' + item.qty + ' × ' + peso(p.price) + '</small></td><td>' + peso(p.price * item.qty) + '</td>';
      body.appendChild(tr);
    });
    $('summary-cart-total').innerHTML = priceHTML(cartTotal());
  }

  var MESSAGES = {
    'customer-name': 'Please enter your full name.',
    'customer-contact': 'Enter a mobile number like 09171234567 or +639171234567.',
    'customer-address': 'Please enter your delivery address.',
    'customer-pickup': 'Please tell us your pickup time.',
    'customer-payment': 'Please choose how you would like to pay.'
  };
  function fulfil() {
    var c = document.querySelector('input[name=fulfil]:checked');
    return c ? c.value : 'Delivery';
  }
  function isRelevant(id) {
    if (id === 'customer-address') return fulfil() === 'Delivery';
    if (id === 'customer-pickup') return fulfil() !== 'Delivery';
    return true;
  }
  function checkField(id) {
    var el = $(id);
    var ok = !isRelevant(id) || (el.value.trim() !== '' && el.checkValidity());
    $(id + '-error').textContent = ok ? '' : MESSAGES[id];
    if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
    return ok;
  }
  function orderText() {
    var lines = ['New order from cecyrashop.online', ''];
    cart.forEach(function (i) {
      var p = CATALOG[i.id];
      lines.push(i.qty + ' x ' + p.name + ' - PHP ' + num(p.price * i.qty));
    });
    lines.push('', 'Total: PHP ' + num(cartTotal()), '');
    lines.push('Name: ' + $('customer-name').value.trim(), 'Mobile: ' + $('customer-contact').value.trim(), 'Method: ' + fulfil());
    if (fulfil() === 'Delivery') lines.push('Address: ' + $('customer-address').value.trim());
    else lines.push('Pickup time: ' + $('customer-pickup').value.trim());
    lines.push('Payment: ' + $('customer-payment').value);
    var notes = $('customer-notes').value.trim();
    if (notes) lines.push('Notes: ' + notes);
    return lines.join('\n');
  }
  var form = $('checkout-form');
  if (form) {
    form.noValidate = true;
    Object.keys(MESSAGES).forEach(function (id) {
      function recheck() { if ($(id).hasAttribute('aria-invalid')) checkField(id); }
      $(id).addEventListener('input', recheck);
      $(id).addEventListener('change', recheck);
    });
    document.querySelectorAll('input[name=fulfil]').forEach(function (r) {
      r.addEventListener('change', function () {
        var delivery = fulfil() === 'Delivery';
        $('address-field').hidden = !delivery;
        $('pickup-field').hidden = delivery;
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(MESSAGES).forEach(function (id) {
        if (!checkField(id) && !firstBad) firstBad = $(id);
      });
      if (firstBad) { firstBad.focus(); return; }
      var text = orderText();
      var href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('New order: ' + $('customer-name').value.trim()) + '&body=' + encodeURIComponent(text);
      $('sent-email').href = href;
      $('sent-text').textContent = text;
      $('order-layout').hidden = true;
      $('order-intro').hidden = true;
      $('order-sent').hidden = false;
      $('order-sent-title').focus();
      window.scrollTo(0, 0);
      window.location.href = href;
    });
    $('sent-copy-btn').addEventListener('click', function () {
      var btn = this;
      var text = $('sent-text').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Copied'; }, function () { btn.textContent = 'Select the text below to copy'; });
      } else { btn.textContent = 'Select the text below to copy'; }
    });
  }

  function render() {
    renderDrawer();
    renderTiles();
    renderOrder();
  }
  document.querySelectorAll('.footer-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  render();
})();
