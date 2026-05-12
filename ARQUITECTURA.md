# Arquitectura de Florería - Sin Framework Frontend

## 1. Descripción General

Aplicación web de florería construida con:
- **Django**: Backend principal, renderiza templates HTML
- **Express.js**: API auxiliar para servicios específicos
- **Vanilla JavaScript**: Interactividad en cliente
- **MySQL**: Base de datos

## 2. Responsabilidades por Componente

### Django (Puerto 8000)
```
✅ Renderizar Pages HTML
   - Home
   - Catálogo
   - Detalle de Producto
   - Carrito
   - Contacto
   - Footer, Navbar (templates reutilizables)

✅ Gestionar Modelos de Datos
   - Producto
   - Categoría
   - Inventario

✅ Administración
   - Django Admin: /admin
   - Crear/editar/eliminar productos
   - Gestionar categorías

✅ API REST (para Express)
   - GET /api/products/ - Listar todos
   - GET /api/products/<id>/ - Detalle
   - GET /api/categories/ - Categorías
   - POST /api/check-stock/ - Validar existencia

✅ Sesiones
   - Gestionar carrito en sesión (opcional)
   - Cookies de usuario
```

### Express.js (Puerto 3001)
```
✅ API Auxiliar
   - POST /cart/add - Agregar a carrito
   - GET /cart/:cartId - Ver carrito
   - DELETE /cart/:cartId/item/:itemId - Eliminar del carrito
   - PATCH /cart/:cartId/item/:itemId - Actualizar cantidad

✅ Gestión de Pedidos
   - POST /orders - Crear pedido
   - GET /orders/:orderId - Obtener pedido
   - GET /orders/user/:userId - Histórico de pedidos

✅ Contacto
   - POST /contact - Recibir mensaje
   - Simulación de envío de correo

✅ Comunicación con Django
   - Consultar productos
   - Validar existencias
   - Crear registros de pedidos en Django

✅ Persistencia
   - Tabla Cart (carrito)
   - Tabla Order (pedidos)
   - Tabla Contact (mensajes)
```

### Cliente (JavaScript Vanilla)
```
✅ Interactividad
   - Event Listeners en HTML
   - fetch() para llamadas AJAX
   - Manipulación de DOM
   - LocalStorage para carrito temporal

✅ No requiere build tools
✅ No requiere npm en navegador
✅ HTML renderizado desde servidor
```

## 3. Flujo de Datos

### Caso 1: Cargar Página Home
```
1. Usuario accede http://localhost:8000/
2. Django: views.py renderiza template home.html
3. Template home.html incluye:
   - CSS: static/css/home.css
   - HTML: contenido dinámico con {% for producto in productos %}
   - JS: static/js/base.js
4. Navegador renderiza HTML + CSS
5. JavaScript puro escucha eventos
```

### Caso 2: Agregar Producto al Carrito
```
1. Usuario hace clic en "Agregar al carrito"
2. JavaScript captura evento click
3. JavaScript hace fetch() a http://localhost:3001/cart/add
   - Envía: {productId, quantity}
4. Express recibe, valida contra Django
5. Express guarda en su BD (tabla Cart)
6. Express retorna {cartId, success: true}
7. JavaScript actualiza DOM (notificación, contador)
```

### Caso 3: Crear Pedido
```
1. Usuario está en /cart/ (renderizado por Django)
2. Usuario hace clic en "Confirmar Pedido"
3. JavaScript hace fetch() a http://localhost:3001/orders
   - Envía: {cartId, userInfo, address}
4. Express:
   - Consulta los items del carrito
   - Llama a Django: GET /api/products/ para validar
   - Crea Order en su BD
   - Envía email simulado (Nodemailer)
5. Express retorna {orderId, confirmationNumber}
6. JavaScript redirige a Django: /order-confirmation/?orderId=...
7. Django renderiza página de confirmación
```

## 4. Base de Datos (MySQL)

### Tablas Django
```
products
├── id (INT, PK)
├── name (VARCHAR)
├── description (TEXT)
├── price (DECIMAL)
├── image (VARCHAR - ruta a static/)
├── category_id (FK)
└── stock (INT)

categories
├── id (INT, PK)
├── name (VARCHAR)
└── description (TEXT)

users
├── id (INT, PK)
├── username (VARCHAR)
├── email (VARCHAR)
└── password (VARCHAR)
```

### Tablas Express (Sequelize)
```
carts
├── id (UUID, PK)
├── user_id (INT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

cart_items
├── id (UUID, PK)
├── cart_id (FK)
├── product_id (INT)
├── quantity (INT)
└── price (DECIMAL)

orders
├── id (UUID, PK)
├── user_id (INT)
├── total_price (DECIMAL)
├── status (ENUM: pending, confirmed, shipped, delivered)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

contacts
├── id (UUID, PK)
├── email (VARCHAR)
├── subject (VARCHAR)
├── message (TEXT)
├── created_at (TIMESTAMP)
└── status (ENUM: new, read, replied)
```

## 5. Comunicación Django ↔ Express

### Express → Django (Llamadas HTTP)
```javascript
// En Express: services/djangoService.js
const getDjangoProduct = async (productId) => {
  const response = await fetch('http://localhost:8000/api/products/' + productId);
  return response.json();
};
```

### Django → Express (Opcional)
```python
# En Django: services.py
import requests
response = requests.post('http://localhost:3001/orders', json=order_data)
```

## 6. Stack Tecnológico

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| **Frontend** | HTML5, CSS3, JavaScript Vanilla | Navegador |
| **Backend Principal** | Django 4.2 + DRF | 8000 |
| **API Auxiliar** | Express.js 4.18 | 3001 |
| **Base de Datos** | MySQL 8.0 | 3306 |
| **ORM** | Django ORM, Sequelize | - |

## 7. Archivos Clave

### Django
- `floreria_project/settings.py` - Configuración
- `products/models.py` - Modelos de producto
- `products/views.py` - Vistas (renderizar HTML)
- `templates/` - Archivos HTML
- `static/` - CSS, JS, imágenes

### Express
- `index.js` - Servidor principal
- `routes/` - Definición de rutas
- `controllers/` - Lógica de negocio
- `models/` - Modelos Sequelize
- `services/` - Servicios (email, Django API)

### Cliente
- `static/js/base.js` - JS global
- `static/js/cart.js` - Lógica de carrito
- `static/js/api-client.js` - Cliente HTTP
- `static/css/` - Estilos

## 8. Ventajas de esta Arquitectura

✅ **No requiere transpilación** - HTML/CSS/JS puro
✅ **SEO amigable** - HTML renderizado en servidor
✅ **Fácil mantenimiento** - Menos dependencias
✅ **Escalable** - Separación clara de responsabilidades
✅ **Bajo acoplamiento** - Django y Express independientes
✅ **Rendimiento** - Sin overhead de framework frontend

## 9. Despliegue

### Desarrollo
```bash
# Terminal 1
cd django-backend && python manage.py runserver 8000

# Terminal 2
cd express-backend && npm start
```

### Producción (Recomendado)
- Django: Gunicorn + Nginx
- Express: PM2 + Nginx
- Base de Datos: MySQL en servidor
- SSL: Let's Encrypt

## 10. Justificación Educativa

Esta arquitectura enseña:
- HTTP y protocolo web fundamentales
- Renderizado de templates
- AJAX y llamadas asincrónicas
- Separación de responsabilidades
- Comunicación entre servidores
- Manejo de sesiones y cookies
- Por qué los frameworks frontend existen

Sin la abstracción de React/Vue, entiendes cómo funcionan realmente las aplicaciones web.
