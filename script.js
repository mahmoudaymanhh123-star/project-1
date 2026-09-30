const defaults=[
{id:1,name:'Essential Oversized T-Shirt',category:'T-Shirts',price:650,oldPrice:800,badge:'NEW',image:''},
{id:2,name:'Heavyweight Black Tee',category:'T-Shirts',price:750,oldPrice:0,badge:'',image:''},
{id:3,name:'Relaxed Stone T-Shirt',category:'T-Shirts',price:700,oldPrice:0,badge:'',image:''},
{id:4,name:'Classic Straight Pants',category:'Pants',price:1200,oldPrice:1400,badge:'SALE',image:''},
{id:5,name:'Wide Leg Cargo Pants',category:'Pants',price:1450,oldPrice:0,badge:'',image:''},
{id:6,name:'Everyday Beige Pants',category:'Pants',price:1100,oldPrice:0,badge:'',image:''},
{id:7,name:'Dark Utility Trousers',category:'Pants',price:1350,oldPrice:1500,badge:'SALE',image:''},
{id:8,name:'Premium Cream Tee',category:'T-Shirts',price:800,oldPrice:0,badge:'',image:''}];
function products(){let x=localStorage.getItem('urbanwear_products');if(!x){localStorage.setItem('urbanwear_products',JSON.stringify(defaults));return defaults}return JSON.parse(x)}
const money=n=>'EGP '+Number(n).toLocaleString('en-EG');
const bg=x=>x?`style="background-image:url('${x}')"`:'';
function card(p){return `<article class="product-card">${p.badge?`<span class="badge-new">${p.badge}</span>`:''}<a href="product.html?id=${p.id}"><div class="product-image" ${bg(p.image)}></div></a><a class="quick-add btn-main" href="product.html?id=${p.id}">View product</a><div class="product-info"><div class="category">${p.category}</div><h3>${p.name}</h3><div class="price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:''}</div></div></article>`}
function render(list,el){el.innerHTML=list.map(card).join('')}
function listing(){const g=document.querySelector('#productGrid');if(!g)return;let list=products();const q=new URLSearchParams(location.search).get('category');if(q)list=list.filter(p=>p.category===q);render(list,g);document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.category==='All'?products():products().filter(p=>p.category===b.dataset.category),g)});document.querySelector('#sort')?.addEventListener('change',e=>{let a=[...list];if(e.target.value==='low')a.sort((x,y)=>x.price-y.price);if(e.target.value==='high')a.sort((x,y)=>y.price-x.price);render(a,g)})}
function product(){const el=document.querySelector('#productDetail');if(!el)return;const id=Number(new URLSearchParams(location.search).get('id'));const p=products().find(x=>x.id===id)||products()[0];el.innerHTML=`<div class="row g-0"><div class="col-lg-6"><div class="detail-image" ${bg(p.image)}></div></div><div class="col-lg-6"><div class="detail-copy"><div class="category">${p.category}</div><h1>${p.name}</h1><div class="detail-price">${money(p.price)}</div><p>Premium everyday fit designed for comfort, movement and a clean look.</p><b>Select size</b><div class="size-list">${['S','M','L','XL'].map((s,i)=>`<button class="size ${i===1?'active':''}">${s}</button>`).join('')}</div><div class="quantity"><button id="minus">−</button><span id="qty">1</span><button id="plus">+</button></div><button id="addCart" class="btn-main w-100">Add to cart</button></div></div></div>`;let q=1;document.querySelector('#plus').onclick=()=>{q++;qty.textContent=q};document.querySelector('#minus').onclick=()=>{if(q>1)q--;qty.textContent=q};document.querySelectorAll('.size').forEach(s=>s.onclick=()=>{document.querySelectorAll('.size').forEach(x=>x.classList.remove('active'));s.classList.add('active')});document.querySelector('#addCart').onclick=()=>{let c=JSON.parse(localStorage.getItem('urbanwear_cart')||'[]'),i=c.find(x=>x.id===p.id);i?i.qty+=q:c.push({...p,qty:q});localStorage.setItem('urbanwear_cart',JSON.stringify(c));count();toast('Product added to cart')}}
function count(){let c=JSON.parse(localStorage.getItem('urbanwear_cart')||'[]').reduce((a,x)=>a+x.qty,0);document.querySelectorAll('.cart-count').forEach(x=>x.textContent=c)}
function cart(){const el=document.querySelector('#cartItems');if(!el)return;let c=JSON.parse(localStorage.getItem('urbanwear_cart')||'[]');if(!c.length){el.innerHTML='<div class="empty">Your cart is empty.</div>';return}el.innerHTML=c.map((p,i)=>`<div class="cart-item"><div class="cart-thumb" ${bg(p.image)}></div><div><b>${p.name}</b><div class="category">${p.category}</div></div><div class="qty">x${p.qty}</div><b class="item-price">${money(p.price*p.qty)}</b><button class="btn-delete" onclick="removeItem(${i})"><i class="bi bi-trash"></i></button></div>`).join('');document.querySelector('#cartTotal').textContent=money(c.reduce((a,x)=>a+x.price*x.qty,0))}
function removeItem(i){let c=JSON.parse(localStorage.getItem('urbanwear_cart')||'[]');c.splice(i,1);localStorage.setItem('urbanwear_cart',JSON.stringify(c));cart();count()}
function toast(message){
 const old=document.querySelector('.uw-toast');
 if(old) old.remove();
 const el=document.createElement('div');
 el.className='uw-toast';
 el.textContent=message;
 document.body.appendChild(el);
 setTimeout(()=>el.classList.add('show'),10);
 setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},2200);
}

function admin(){
 const t=document.querySelector('#adminProducts');
 if(!t)return;
 const f=document.querySelector('#productForm');
 const id=document.querySelector('#editingId');
 const imageInput=document.querySelector('#productImage');
 const preview=document.querySelector('#imagePreview');
 const previewImg=document.querySelector('#previewImg');
 const saveBtn=document.querySelector('#saveBtn');
 const cancelBtn=document.querySelector('#cancelEdit');
 let selectedImage='';

 const field=name=>f.elements[name];

 function resetForm(){
  f.reset();
  id.value='';
  selectedImage='';
  preview.style.display='none';
  previewImg.removeAttribute('src');
  saveBtn.textContent='Add product';
 }

 function draw(){
  t.innerHTML=products().map(p=>`<tr>
   <td>${p.id}</td>
   <td><div style="display:flex;align-items:center;gap:10px"><div class="admin-preview" ${bg(p.image)}></div>${p.name}</div></td>
   <td>${p.category}</td>
   <td>${money(p.price)}</td>
   <td>
    <button type="button" class="btn-edit" data-edit="${p.id}">Edit</button>
    <button type="button" class="btn-delete" data-delete="${p.id}">Delete</button>
   </td>
  </tr>`).join('');

  t.querySelectorAll('[data-edit]').forEach(btn=>{
   btn.addEventListener('click',()=>editProduct(Number(btn.dataset.edit)));
  });
  t.querySelectorAll('[data-delete]').forEach(btn=>{
   btn.addEventListener('click',()=>deleteProduct(Number(btn.dataset.delete)));
  });
 }

 function editProduct(productId){
  const p=products().find(x=>Number(x.id)===Number(productId));
  if(!p){toast('Product not found');return;}
  id.value=p.id;
  field('name').value=p.name||'';
  field('category').value=p.category||'Pants';
  field('price').value=p.price||'';
  field('oldPrice').value=p.oldPrice||'';
  field('badge').value=p.badge||'';
  selectedImage=p.image||'';
  if(selectedImage){
   previewImg.src=selectedImage;
   preview.style.display='block';
  }else{
   preview.style.display='none';
   previewImg.removeAttribute('src');
  }
  imageInput.value='';
  saveBtn.textContent='Update product';
  window.scrollTo({top:0,behavior:'smooth'});
 }

 function deleteProduct(productId){
  if(!confirm('Delete this product?'))return;
  const updated=products().filter(p=>Number(p.id)!==Number(productId));
  localStorage.setItem('urbanwear_products',JSON.stringify(updated));
  draw();
  toast('Product deleted');
 }

 imageInput.addEventListener('change',()=>{
  const file=imageInput.files[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){
   toast('Please choose an image file');
   imageInput.value='';
   return;
  }
  const reader=new FileReader();
  reader.onload=()=>{
   selectedImage=reader.result;
   previewImg.src=selectedImage;
   preview.style.display='block';
  };
  reader.readAsDataURL(file);
 });

 f.addEventListener('submit',e=>{
  e.preventDefault();
  e.stopPropagation();

  const name=field('name').value.trim();
  const category=field('category').value;
  const price=Number(field('price').value);
  const oldPrice=Number(field('oldPrice').value)||0;
  const badge=field('badge').value.trim();

  if(!name || !price || price<0){
   toast('Enter a valid product name and price');
   return;
  }

  const a=products();
  const d={name,category,price,oldPrice,badge,image:selectedImage};

  if(id.value){
   const index=a.findIndex(x=>Number(x.id)===Number(id.value));
   if(index===-1){toast('Product not found');return;}
   a[index]={...a[index],...d};
   localStorage.setItem('urbanwear_products',JSON.stringify(a));
   draw();
   resetForm();
   toast('Product updated successfully');
  }else{
   d.id=Date.now();
   a.push(d);
   localStorage.setItem('urbanwear_products',JSON.stringify(a));
   draw();
   resetForm();
   toast('Product added successfully');
  }
 });

 cancelBtn.addEventListener('click',resetForm);
 draw();
}
document.addEventListener('DOMContentLoaded',()=>{let h=document.querySelector('#homeProducts');if(h)render(products().slice(0,4),h);listing();product();cart();admin();count()});
