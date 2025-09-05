// Base de datos de restaurantes y platos
const restaurants = [
    {
        id: 1,
        name: "La Parrilla Argentina",
        image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80",
        dishes: [
            { id: 101, name: "Bife de Chorizo", price: 3500 },
            { id: 102, name: "Asado de Tira", price: 2800 },
            { id: 103, name: "Ensalada Mixta", price: 1200 },
            { id: 104, name: "Papas Fritas", price: 900 }
        ]
    },
    {
        id: 2,
        name: "Pizza Napoli",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1981&q=80",
        dishes: [
            { id: 201, name: "Pizza Margherita", price: 2200 },
            { id: 202, name: "Pizza Napolitana", price: 2500 },
            { id: 203, name: "Pizza Cuatro Quesos", price: 2800 },
            { id: 204, name: "Calzone", price: 2300 }
        ]
    },
    {
        id: 3,
        name: "Sushi Palace",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2127&q=80",
        dishes: [
            { id: 301, name: "Roll Philadelphia", price: 1800 },
            { id: 302, name: "Roll California", price: 1600 },
            { id: 303, name: "Sashimi Variado", price: 3200 },
            { id: 304, name: "Tempura", price: 2100 }
        ]
    }
];

// Variables globales
let selectedRestaurant = null;
let selectedDishes = [];
let cart = [];

// Elementos del DOM
const restaurantsPage = document.getElementById('restaurants-page');
const dishesPage = document.getElementById('dishes-page');
const checkoutPage = document.getElementById('checkout-page');
const restaurantList = document.getElementById('restaurant-list');
const restaurantName = document.getElementById('restaurant-name');
const dishesList = document.getElementById('dishes-list');
const orderItems = document.getElementById('order-items');
const totalAmount = document.getElementById('total-amount');
const backToRestaurants = document.getElementById('back-to-restaurants');
const backToDishes = document.getElementById('back-to-dishes');
const goToCheckout = document.getElementById('go-to-checkout');
const sendWhatsapp = document.getElementById('send-whatsapp');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurants();
    setupEventListeners();
});

// Cargar restaurantes en la página
function loadRestaurants() {
    restaurantList.innerHTML = '';
    
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="restaurant-image" style="background-image: url('${restaurant.image}')"></div>
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
            </div>
        `;
        
        card.addEventListener('click', () => {
            selectRestaurant(restaurant);
        });
        
        restaurantList.appendChild(card);
    });
}

// Configurar event listeners
function setupEventListeners() {
    backToRestaurants.addEventListener('click', () => {
        showPage(restaurantsPage);
    });
    
    backToDishes.addEventListener('click', () => {
        showPage(dishesPage);
    });
    
    goToCheckout.addEventListener('click', () => {
        updateOrderSummary();
        showPage(checkoutPage);
    });
    
    sendWhatsapp.addEventListener('click', sendOrderViaWhatsapp);
}

// Seleccionar un restaurante
function selectRestaurant(restaurant) {
    selectedRestaurant = restaurant;
    selectedDishes = [];
    restaurantName.textContent = restaurant.name;
    loadDishes();
    showPage(dishesPage);
}

// Cargar platos del restaurante seleccionado
function loadDishes() {
    dishesList.innerHTML = '';
    
    selectedRestaurant.dishes.forEach(dish => {
        const dishCard = document.createElement('div');
        dishCard.className = 'dish-card';
        dishCard.innerHTML = `
            <div class="dish-info">
                <div class="dish-name">${dish.name}</div>
                <div class="dish-price">$${dish.price}</div>
            </div>
            <button class="dish-button" data-id="${dish.id}">Agregar</button>
        `;
        
        const button = dishCard.querySelector('.dish-button');
        button.addEventListener('click', () => {
            toggleDishSelection(dish, button);
        });
        
        dishesList.appendChild(dishCard);
    });
}

// Alternar selección de plato
function toggleDishSelection(dish, button) {
    const index = selectedDishes.findIndex(d => d.id === dish.id);
    
    if (index === -1) {
        // Agregar plato
        selectedDishes.push({...dish, quantity: 1});
        button.textContent = 'Descartar';
        button.classList.add('selected');
    } else {
        // Quitar plato
        selectedDishes.splice(index, 1);
        button.textContent = 'Agregar';
        button.classList.remove('selected');
    }
}

// Actualizar resumen del pedido
function updateOrderSummary() {
    orderItems.innerHTML = '';
    let total = 0;
    
    selectedDishes.forEach(dish => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <span>${dish.name}</span>
            <span>$${dish.price}</span>
        `;
        orderItems.appendChild(item);
        total += dish.price;
    });
    
    totalAmount.textContent = `$${total}`;
}

// Enviar pedido por WhatsApp
function sendOrderViaWhatsapp() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const location = document.getElementById('customer-location').value;
    
    // Validación básica
    if (!name || !phone || !address || !location) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    // Crear mensaje
    let message = `¡Hola! Quiero hacer un pedido de *${selectedRestaurant.name}*.\n\n`;
    message += `*Mi pedido:*\n`;
    
    selectedDishes.forEach(dish => {
        message += `- ${dish.name} ➞ $${dish.price}\n`;
    });
    
    message += `\n*Total: $${totalAmount.textContent}*\n\n`;
    message += `*Mis datos:*\n`;
    message += `Nombre: ${name}\n`;
    message += `Teléfono: ${phone}\n`;
    message += `Dirección: ${address}\n`;
    message += `Localidad: ${location}`;
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (reemplaza con tu número real)
    const whatsappNumber = "5491112345678"; // Ejemplo: código país + código área + número
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
}

// Mostrar página específica
function showPage(page) {
    // Ocultar todas las páginas
    restaurantsPage.classList.remove('active');
    dishesPage.classList.remove('active');
    checkoutPage.classList.remove('active');
    
    // Mostrar la página solicitada
    page.classList.add('active');
}