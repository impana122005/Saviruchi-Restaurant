// Cart Count
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount(){
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let totalCount = 0;
  cartItems.forEach(item => { totalCount += item.quantity; });
  const el = document.getElementById("cart-count");
  if(el) el.innerText = totalCount;
}

function showMessage(message, type = "info"){
  const box = document.getElementById("message-box");
  if(!box) return;
  box.textContent = message;
  box.className = "message-box " + type;
  box.style.display = "block";
  setTimeout(() => { box.style.display = "none"; }, 5000);
}

function showLoginMessage(message){
  const box = document.getElementById("login-message");
  if(!box) return;
  box.textContent = message;
  box.style.display = "block";
}

function clearLoginMessage(){
  const box = document.getElementById("login-message");
  if(!box) return;
  box.style.display = "none";
}

function isReloaded(){
  const perf = window.performance;
  if(perf && typeof perf.getEntriesByType === 'function'){
    const navEntries = perf.getEntriesByType('navigation');
    if(navEntries.length) return navEntries[0].type === 'reload';
  }
  return perf && perf.navigation ? perf.navigation.type === 1 : false;
}

function updateAuthUI(){
  const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const currentUser = sessionStorage.getItem("currentUser");
  const logoutBtn = document.getElementById("logout-btn");
  const siteContent = document.getElementById("site-content");
  const adminPanel = document.querySelector('.admin-panel');

  if(logoutBtn) logoutBtn.style.display = loggedIn ? "block" : "none";
  if(siteContent) siteContent.style.display = loggedIn ? "block" : "none";
  if(adminPanel) adminPanel.style.display = (loggedIn && currentUser === "admin") ? "block" : "none";

  if(loggedIn){
    document.getElementById("login-page").style.display = "none";
    document.getElementById("signup-page").style.display = "none";
    document.getElementById("forgot-page").style.display = "none";
  } else {
    document.getElementById("login-page").style.display = "flex";
    document.getElementById("signup-page").style.display = "none";
    document.getElementById("forgot-page").style.display = "none";
    clearLoginMessage();
  }
}

function getSavedMenuItems(){
  return JSON.parse(localStorage.getItem("savedMenuItems")) || [];
}

function saveMenuItems(items){
  localStorage.setItem("savedMenuItems", JSON.stringify(items));
}

function renderSavedMenuItems(){
  const menu = document.querySelector(".menu-container");
  if(!menu) return;
  menu.querySelectorAll(".saved-food-card").forEach(card => card.remove());
  const savedItems = getSavedMenuItems();
  savedItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "food-card saved-food-card";
    card.dataset.category = item.category;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button onclick="addToCart('${item.name}', ${item.price}, '${item.image}')">Add to Cart</button>
      <button class="remove-menu-btn" onclick="removeSavedMenuItem(${index})">Remove Item</button>
    `;
    menu.appendChild(card);
  });
}

function removeSavedMenuItem(index){
  const items = getSavedMenuItems();
  items.splice(index, 1);
  saveMenuItems(items);
  renderSavedMenuItems();
  showMessage("Menu item removed", "info");
}

function getSavedUsers(){
  return JSON.parse(localStorage.getItem("savedUsers")) || [];
}

function saveUsers(users){
  localStorage.setItem("savedUsers", JSON.stringify(users));
}

function findUser(username){
  return getSavedUsers().find(user => user.username === username);
}

// Show criteria list with valid/invalid rules
function showCriteria(password, listId){
  const list = document.getElementById(listId);
  if(!list) return;

  const lengthOk  = password.length >= 8;
  const upperOk   = /[A-Z]/.test(password);
  const numberOk  = /[0-9]/.test(password);
  const specialOk = /[@#$%^&*!]/.test(password);

  list.querySelector('[data-rule="length"]').classList.toggle('valid', lengthOk);
  list.querySelector('[data-rule="uppercase"]').classList.toggle('valid', upperOk);
  list.querySelector('[data-rule="number"]').classList.toggle('valid', numberOk);
  list.querySelector('[data-rule="special"]').classList.toggle('valid', specialOk);

  list.style.display = 'block';
}

function hideCriteria(listId){
  const list = document.getElementById(listId);
  if(list) list.style.display = 'none';
}

// Signup
function validatePassword(){
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;
  const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&*!]).{8,}$/;

  if(!passwordPattern.test(password)){
    showCriteria(password, 'signup-password-criteria');
    return;
  }

  hideCriteria('signup-password-criteria');

  if(username === ""){
    showSignupMessage("Enter username", "error");
    return;
  }

  if(findUser(username)){
    showSignupMessage("Username already exists. Please choose another or login.", "error");
    return;
  }

  const users = getSavedUsers();
  users.push({ username, password });
  saveUsers(users);
  showSignupMessage("Account created successfully!", "success");
  setTimeout(() => {
  showLogin();
}, 1000);
}

// Forgot password
function resetPassword(){
  const username    = document.getElementById("forgot-username").value.trim();
  const newPassword = document.getElementById("new-password").value;
  const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&*!]).{8,}$/;

  if(!passwordPattern.test(newPassword)){
    showCriteria(newPassword, 'new-password-criteria');
    return;
  }

  hideCriteria('new-password-criteria');

  const users = getSavedUsers();
  const user  = users.find(item => item.username === username);

  if(!user){
    showForgotMessage("Invalid Username", "error");
    return;
  }

  user.password = newPassword;
  saveUsers(users);
  showForgotMessage("Password reset successfully", "success");
  setTimeout(() => {
    showLogin();
  }, 2000);
}

// Login
function loginUser(){
  const username  = document.getElementById("username").value.trim();
  const password  = document.getElementById("password").value;
  const adminUser = "admin";
  const adminPass = "Saviruchi@123";
  const user = findUser(username);

  if(
    (username === adminUser && password === adminPass) ||
    (user && password === user.password)
  ){
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("currentUser", username);
    updateAuthUI();
    renderSavedMenuItems();
    document.getElementById("login-page").style.display = "none";
  } else {
    showLoginMessage("Invalid Username or Password");
  }
}

function logoutUser(){
  localStorage.removeItem("cart");
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("currentUser");
  updateAuthUI();
  window.location.href = "index.html";
}

function togglePassword(inputId, icon){
  const input = document.getElementById(inputId);
  if(input.type === "password"){
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Page navigation
function showSignup(){
  clearLoginMessage();
  document.getElementById("login-page").style.display  = "none";
  document.getElementById("signup-page").style.display = "flex";
}

function showForgot(){
  hideCriteria('new-password-criteria');
  document.getElementById("login-page").style.display  = "none";
  document.getElementById("forgot-page").style.display = "flex";
}

function showLogin(){
  document.getElementById("signup-page").style.display = "none";
  document.getElementById("forgot-page").style.display = "none";
  document.getElementById("login-page").style.display  = "flex";
}

// Cart
function addToCart(name, price, image){
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cartItems.find(item => item.name === name);
  if(existingItem){
    existingItem.quantity++;
  } else {
    cartItems.push({ name, price, image, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
  showMessage(name + " added to cart", "success");
}

// Search
const searchInput = document.getElementById("search");
if(searchInput){
  searchInput.addEventListener("keyup", function(){
    const value = searchInput.value.toLowerCase();
    document.querySelectorAll(".food-card").forEach(card => {
      const titleEl  = card.querySelector("h3");
      const foodName = titleEl ? titleEl.innerText.toLowerCase() : "";
      card.style.display = foodName.includes(value) ? "block" : "none";
    });
  });
}

// Filter
const filter = document.getElementById("filter");
if(filter){
  filter.addEventListener("change", function(){
    const category = filter.value;
    document.querySelectorAll(".food-card").forEach(card => {
      card.style.display =
        (category === "all" || card.dataset.category === category) ? "block" : "none";
    });
  });
}

// Admin
function addFoodItem(){
  const name      = document.getElementById("foodName").value.trim();
  const priceText = document.getElementById("foodPrice").value.trim();
  const category  = document.getElementById("foodCategory").value;

  if(name === "" || priceText === ""){
    showMessage("Enter valid food name and price.", "error");
    return;
  }

  const price = parseFloat(priceText);
  if(Number.isNaN(price) || price <= 0){
    showMessage("Enter a valid numeric price.", "error");
    return;
  }

  const savedItems = getSavedMenuItems();
  savedItems.push({ name, price, category, image: "images/Masala-Dosa.jpg" });
  saveMenuItems(savedItems);
  renderSavedMenuItems();

  document.getElementById("foodName").value  = "";
  document.getElementById("foodPrice").value = "";
  showMessage("Menu item saved and added.", "success");
}

// Reservation
function reserveTable(){
  const name   = document.getElementById("name").value;
  const email  = document.getElementById("email").value;
  const date   = document.getElementById("date").value;
  const time   = document.getElementById("time").value;
  const guests = document.getElementById("guests").value;
  const reservationMessage = document.getElementById("reservation-message");
  const emailPattern = /^[^\s@]+@(?:gmail\.com|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/;

  if(name === "" || date === "" || time === "" || guests === ""){
    reservationMessage.textContent   = "Please fill all reservation details.";
    reservationMessage.className     = "message-box error";
    reservationMessage.style.display = "block";
    return;
  }

  if(email.trim() === "" || !emailPattern.test(email)){
    reservationMessage.textContent   = "Enter valid email";
    reservationMessage.className     = "message-box error";
    reservationMessage.style.display = "block";
    return;
  }

  const tableNumber = Math.floor(Math.random() * 20) + 1;
  reservationMessage.innerHTML =
    `Table reserved successfully!<br>` +
    `Table Number: <strong>${tableNumber}</strong><br>` +
    `Name: ${name}<br>Guests: ${guests}<br>Date: ${date}`;
  reservationMessage.className     = "message-box success";
  reservationMessage.style.display = "block";
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", function(){
  if(isReloaded()){
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUser");
  }
  updateCartCount();
  updateAuthUI();
  renderSavedMenuItems();
});

function showSignupMessage(message, type="error"){
  const box = document.getElementById("signup-message");
  if(!box) return;
  box.textContent = message;
  box.className = "message-box " + type;
  box.style.display = "block";
  setTimeout(() => { box.style.display = "none"; }, 3000);
}

function showForgotMessage(message, type="error"){
  const box = document.getElementById("forgot-message");
  if(!box) return;
  box.textContent = message;
  box.className = "message-box " + type;
  box.style.display = "block";
  setTimeout(() => { box.style.display = "none"; }, 3000);
}