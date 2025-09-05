// Base de datos de restaurantes y platos

// Localidades predefinidas


// Matriz de precios de delivery [restaurante][localidad]
// Precios de ejemplo para testing


// Variables globales
let selectedRestaurant = null;
let selectedDishes = [];
let cart = [];
let deliveryCost = 0;

// Elementos del DOM
const restaurantsPage = document.getElementById('restaurants-page');
const dishesPage = document.getElementById('dishes-page');
const checkoutPage = document.getElementById('checkout-page');
const restaurantList = document.getElementById('restaurant-list');
const restaurantName = document.getElementById('restaurant-name');
const dishesList = document.getElementById('dishes-list');
const orderItems = document.getElementById('order-items');
const deliveryInfo = document.getElementById('delivery-info');
const totalAmount = document.getElementById('total-amount');
const backToRestaurants = document.getElementById('back-to-restaurants');
const backToDishes = document.getElementById('back-to-dishes');
const goToCheckout = document.getElementById('go-to-checkout');
const sendWhatsapp = document.getElementById('send-whatsapp');
const customerLocation = document.getElementById('customer-location');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurants();
    loadLocalidades();
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

// Cargar localidades en el selector
function loadLocalidades() {
    customerLocation.innerHTML = '<option value="">Selecciona una localidad</option>';
    
    localidades.forEach(localidad => {
        const option = document.createElement('option');
        option.value = localidad;
        option.textContent = localidad;
        customerLocation.appendChild(option);
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
    
    // Actualizar el costo de delivery cuando cambia la localidad
    customerLocation.addEventListener('change', updateDeliveryCost);
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

// Calcular costo de delivery basado en restaurante y localidad
function calculateDeliveryCost() {
    if (!selectedRestaurant || !customerLocation.value) {
        return 0;
    }
    
    const restaurantIndex = restaurants.findIndex(r => r.id === selectedRestaurant.id);
    const locationIndex = localidades.findIndex(l => l === customerLocation.value);
    
    if (restaurantIndex >= 0 && locationIndex >= 0) {
        return deliveryPrices[restaurantIndex][locationIndex];
    }
    
    return 0;
}

// Actualizar el costo de delivery cuando cambia la localidad
function updateDeliveryCost() {
    deliveryCost = calculateDeliveryCost();
    updateOrderSummary();
}

// Actualizar resumen del pedido
function updateOrderSummary() {
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    selectedDishes.forEach(dish => {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <span>${dish.name}</span>
            <span>$${dish.price}</span>
        `;
        orderItems.appendChild(item);
        subtotal += dish.price;
    });
    
    // Calcular y mostrar delivery
    deliveryCost = calculateDeliveryCost();
    deliveryInfo.innerHTML = '';
    
    if (deliveryCost > 0) {
        const deliveryItem = document.createElement('div');
        deliveryItem.className = 'delivery-item';
        deliveryItem.innerHTML = `
            <span>Delivery a ${customerLocation.value || 'tu localidad'}</span>
            <span>$${deliveryCost}</span>
        `;
        deliveryInfo.appendChild(deliveryItem);
    }
    
    const total = subtotal + deliveryCost;
    
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
    
    // Calcular subtotal
    const subtotal = selectedDishes.reduce((sum, dish) => sum + dish.price, 0);
    const total = subtotal + deliveryCost;
    
    // Crear mensaje
    let message = `¡Hola! Quiero hacer un pedido de *${selectedRestaurant.name}*.\n\n`;
    message += `*Mi pedido:*\n`;
    
    selectedDishes.forEach(dish => {
        message += `- ${dish.name} ➞ $${dish.price}\n`;
    });
    
    // Agregar delivery al mensaje
    if (deliveryCost > 0) {
        message += `- Delivery a ${location} ➞ $${deliveryCost}\n`;
    }
    
    message += `\n*Total: $${total}*\n\n`;
    message += `*Mis datos:*\n`;
    message += `Nombre: ${name}\n`;
    message += `Teléfono: ${phone}\n`;
    message += `Dirección: ${address}\n`;
    message += `Localidad: ${location}`;
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (reemplaza con tu número real)
    const whatsappNumber = "+5356272873"; // Ejemplo: código país + código área + número
    
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