(function () {
  'use strict';

  const STORAGE = 'urbanwear_products';
  const defaults = [
    {id:1,name:'Essential Oversized T-Shirt',category:'T-Shirts',price:650,oldPrice:800,badge:'NEW',image:''},
    {id:2,name:'Heavyweight Black Tee',category:'T-Shirts',price:750,oldPrice:0,badge:'',image:''},
    {id:3,name:'Relaxed Stone T-Shirt',category:'T-Shirts',price:700,oldPrice:0,badge:'',image:''},
    {id:4,name:'Classic Straight Pants',category:'Pants',price:1200,oldPrice:1400,badge:'SALE',image:''},
    {id:5,name:'Wide Leg Cargo Pants',category:'Pants',price:1450,oldPrice:0,badge:'',image:''},
    {id:6,name:'Everyday Beige Pants',category:'Pants',price:1100,oldPrice:0,badge:'',image:''},
    {id:7,name:'Dark Utility Trousers',category:'Pants',price:1350,oldPrice:1500,badge:'SALE',image:''},
    {id:8,name:'Premium Cream Tee',category:'T-Shirts',price:800,oldPrice:0,badge:'',image:''}
  ];

  const $ = id => document.getElementById(id);
  const money = n => 'EGP ' + Number(n || 0).toLocaleString('en-EG');

  function getProducts() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) {
        localStorage.setItem(STORAGE, JSON.stringify(defaults));
        return [...defaults];
      }
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [...defaults];
    } catch (err) {
      console.error(err);
      localStorage.removeItem(STORAGE);
      localStorage.setItem(STORAGE, JSON.stringify(defaults));
      return [...defaults];
    }
  }

  function saveProducts(list) {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error(err);
      alert('Could not save the product. The selected image may be too large. Please choose a smaller image.');
      return false;
    }
  }

  let editingId = null;
  let selectedImage = '';

  function resetForm() {
    $('productForm').reset();
    editingId = null;
    selectedImage = '';
    $('editingId').value = '';
    $('saveBtn').textContent = 'Add product';
    $('imagePreview').style.display = 'none';
    $('previewImg').removeAttribute('src');
    $('productImage').value = '';
  }

  function showMessage(message) {
    if (typeof window.toast === 'function') window.toast(message);
    else alert(message);
  }

  function drawProducts() {
    const tbody = $('adminProducts');
    const list = getProducts();

    tbody.innerHTML = list.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>
          <div class="admin-product-cell">
            <div class="admin-preview" ${p.image ? `style="background-image:url('${p.image}')"` : ''}></div>
            <span>${escapeHtml(p.name)}</span>
          </div>
        </td>
        <td>${escapeHtml(p.category)}</td>
        <td>${money(p.price)}</td>
        <td>
          <button type="button" class="btn-edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button type="button" class="btn-delete" data-action="delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function editProduct(id) {
    const product = getProducts().find(p => Number(p.id) === Number(id));
    if (!product) return showMessage('Product not found');

    editingId = Number(product.id);
    selectedImage = product.image || '';

    $('editingId').value = product.id;
    $('productName').value = product.name || '';
    $('productCategory').value = product.category || 'Pants';
    $('productPrice').value = product.price ?? '';
    $('productOldPrice').value = product.oldPrice || '';
    $('productBadge').value = product.badge || '';

    if (selectedImage) {
      $('previewImg').src = selectedImage;
      $('imagePreview').style.display = 'block';
    } else {
      $('imagePreview').style.display = 'none';
      $('previewImg').removeAttribute('src');
    }

    $('productImage').value = '';
    $('saveBtn').textContent = 'Update product';
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function deleteProduct(id) {
    const product = getProducts().find(p => Number(p.id) === Number(id));
    if (!product) return;
    if (!confirm(`Delete "${product.name}"?`)) return;

    const updated = getProducts().filter(p => Number(p.id) !== Number(id));
    if (saveProducts(updated)) {
      drawProducts();
      showMessage('Product deleted');
    }
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 900;
          const ratio = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * ratio));
          canvas.height = Math.max(1, Math.round(img.height * ratio));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('Could not read image.'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('productForm');
    if (!form) return;

    drawProducts();

    $('saveBtn').addEventListener('click', async function (event) {
      event.preventDefault();

      const name = $('productName').value.trim();
      const category = $('productCategory').value;
      const price = Number($('productPrice').value);
      const oldPrice = Number($('productOldPrice').value) || 0;
      const badge = $('productBadge').value.trim();

      if (!name) return showMessage('Enter product name');
      if (!Number.isFinite(price) || price <= 0) return showMessage('Enter a valid price');

      const file = $('productImage').files[0];
      try {
        if (file) selectedImage = await readImage(file);
      } catch (err) {
        return showMessage(err.message);
      }

      const list = getProducts();

      if (editingId !== null) {
        const index = list.findIndex(p => Number(p.id) === Number(editingId));
        if (index === -1) return showMessage('Product not found');

        list[index] = {
          ...list[index],
          name, category, price, oldPrice, badge,
          image: selectedImage || list[index].image || ''
        };

        if (!saveProducts(list)) return;
        drawProducts();
        resetForm();
        showMessage('Product updated successfully');
      } else {
        list.push({
          id: Date.now(), name, category, price, oldPrice, badge,
          image: selectedImage
        });

        if (!saveProducts(list)) return;
        drawProducts();
        resetForm();
        showMessage('Product added successfully');
      }
    });

    $('cancelEdit').addEventListener('click', resetForm);

    $('productImage').addEventListener('change', async function () {
      const file = this.files[0];
      if (!file) return;
      try {
        const data = await readImage(file);
        selectedImage = data;
        $('previewImg').src = data;
        $('imagePreview').style.display = 'block';
      } catch (err) {
        this.value = '';
        showMessage(err.message);
      }
    });

    $('adminProducts').addEventListener('click', function (event) {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (button.dataset.action === 'edit') editProduct(id);
      if (button.dataset.action === 'delete') deleteProduct(id);
    });
  });
})();
