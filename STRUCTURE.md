# 📁 Estructura Completa del Proyecto - Florería Chelito

```
Floreria-Back/
│
├── 📄 README.md                          # Documentación general del proyecto
├── 📄 QUICKSTART.md                      # Guía rápida de inicio
├── 📄 ARQUITECTURA.md                    # Documentación técnica detallada
├── 📄 SETUP.md                           # Estado y pasos siguientes
├── 📄 STRUCTURE.md                       # Este archivo (estructura del proyecto)
│
├── 📂 django-backend/                    # Backend principal Django
│   ├── 📄 manage.py                      # Manage script de Django
│   ├── 📄 requirements.txt               # Dependencias de Python
│   ├── 📄 .env                           # Variables de entorno
│   ├── 📄 .gitignore                     # Ignorar archivos en git
│   ├── 📄 venv/                          # Entorno virtual (ignorado en git)
│   │
│   ├── 📂 floreria_project/              # Configuración principal
│   │   ├── 📄 __init__.py
│   │   ├── 📄 settings.py                # Configuración de Django
│   │   ├── 📄 urls.py                    # URLs principales
│   │   ├── 📄 wsgi.py                    # WSGI (producción)
│   │   └── 📄 asgi.py                    # ASGI (WebSocket)
│   │
│   ├── 📂 products/                      # App - Productos y Catálogo
│   │   ├── 📂 migrations/                # Migraciones de BD
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 0001_initial.py        # Migración inicial
│   │   ├── 📄 __init__.py
│   │   ├── 📄 apps.py                    # Configuración de app
│   │   ├── 📄 admin.py                   # Registro en admin
│   │   ├── 📄 models.py                  # Modelos (Product, Category)
│   │   ├── 📄 views.py                   # Vistas y APIs
│   │   ├── 📄 urls.py                    # URLs de la app
│   │   └── 📄 serializers.py             # Serializadores DRF
│   │
│   ├── 📂 orders/                        # App - Pedidos
│   │   ├── 📂 migrations/
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 0001_initial.py
│   │   ├── 📄 __init__.py
│   │   ├── 📄 apps.py
│   │   ├── 📄 admin.py
│   │   ├── 📄 models.py                  # Modelos (Order, OrderItem)
│   │   ├── 📄 views.py                   # Vistas de pedidos
│   │   └── 📄 urls.py
│   │
│   ├── 📂 contact/                       # App - Contactos
│   │   ├── 📂 migrations/
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 0001_initial.py
│   │   ├── 📄 __init__.py
│   │   ├── 📄 apps.py
│   │   ├── 📄 admin.py
│   │   ├── 📄 models.py                  # Modelo Contact
│   │   ├── 📄 views.py
│   │   └── 📄 urls.py
│   │
│   ├── 📂 templates/                     # Templates HTML
│   │   ├── 📄 base.html                  # Plantilla base (extienden todas)
│   │   ├── 📄 home.html                  # Página inicio
│   │   ├── 📄 catalog.html               # Catálogo con filtros
│   │   ├── 📄 product-detail.html        # Detalle de producto
│   │   ├── 📄 cart.html                  # Carrito + checkout modal
│   │   └── 📄 contact.html               # Formulario de contacto
│   │
│   ├── 📂 static/                        # Archivos estáticos
│   │   ├── 📂 css/
│   │   │   ├── 📄 base.css               # Estilos globales (600+ líneas)
│   │   │   ├── 📄 home.css               # Estilos página inicio
│   │   │   ├── 📄 catalog.css            # Estilos catálogo
│   │   │   ├── 📄 product-detail.css     # Estilos detalle
│   │   │   └── 📄 cart.css               # Estilos carrito
│   │   │
│   │   ├── 📂 js/
│   │   │   ├── 📄 api-client.js          # Cliente HTTP para APIs (100 líneas)
│   │   │   ├── 📄 utils.js               # Funciones auxiliares (toast, formato)
│   │   │   ├── 📄 cart.js                # Lógica del carrito (200+ líneas)
│   │   │   ├── 📄 base.js                # Scripts globales
│   │   │   └── 📄 ui.js                  # Funciones de UI
│   │   │
│   │   └── 📂 images/
│   │       └── 📁 (logosy, iconos, etc.)
│   │
│   └── 📂 media/                         # Archivos subidos (imágenes de productos)
│       └── 📂 products/
│
├── 📂 express-backend/                   # Backend auxiliar Express
│   ├── 📄 index.js                       # Servidor principal (50 líneas)
│   ├── 📄 package.json                   # Dependencias de Node.js
│   ├── 📄 .env                           # Variables de entorno
│   ├── 📄 .gitignore                     # Ignorar archivos
│   ├── 📁 node_modules/                  # Dependencias (ignorado en git)
│   │   └── 📊 148 paquetes instalados
│   │
│   ├── 📂 config/
│   │   └── 📄 db.js                      # Conexión a MySQL (Sequelize)
│   │
│   ├── 📂 models/
│   │   ├── 📄 Cart.js                    # Modelo de carrito
│   │   ├── 📄 Order.js                   # Modelo de carrito (items)
│   │   └── 📄 Contact.js                 # Modelo de contactos
│   │
│   ├── 📂 routes/
│   │   ├── 📄 cart.js                    # Rutas de carrito
│   │   │   └── POST /cart/add
│   │   │   └── GET  /cart/:id
│   │   │
│   │   ├── 📄 orders.js                  # Rutas de pedidos
│   │   │   └── POST /orders
│   │   │   └── GET  /orders/:id
│   │   │
│   │   └── 📄 contact.js                 # Rutas de contacto
│   │       └── POST /contact
│   │
│   ├── 📂 controllers/
│   │   ├── 📄 cartController.js          # Lógica de carrito (pendiente)
│   │   ├── 📄 orderController.js         # Lógica de pedidos (pendiente)
│   │   └── 📄 contactController.js       # Lógica de contacto (pendiente)
│   │
│   ├── 📂 services/
│   │   ├── 📄 djangoService.js           # Comunicación con Django API
│   │   │   └── getDjangoProduct()
│   │   │   └── checkStock()
│   │   │
│   │   └── 📄 emailService.js            # Envío de emails (Nodemailer)
│   │       └── sendOrderConfirmation()
│   │       └── sendContactReply()
│   │
│   ├── 📂 middleware/
│   │   ├── 📄 errorHandler.js            # Manejador de errores
│   │   └── 📄 cors.js                    # CORS configuration
│   │
│   └── 📂 utils/
│       └── 📄 logger.js                  # Logging utility
│
└── 📂 docker/ (Opcional - Para futuros despliegues)
    ├── 📄 Dockerfile.django
    ├── 📄 Dockerfile.express
    └── 📄 docker-compose.yml

```

---

## 📊 Resumen de Archivos

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| **Python** | 25+ | Django models, views, URLs, apps |
| **JavaScript** | 15+ | Express routes, services, models |
| **HTML** | 6 | Templates (base, home, catalog, etc.) |
| **CSS** | 1+ | Estilos globales |
| **Documentación** | 4 | README, QUICKSTART, ARQUITECTURA, SETUP |
| **Configuración** | 10+ | settings.py, .env, package.json, etc. |
| **Total** | 60+ | Archivos principales del proyecto |

---

## 🔄 Flujo de Archivos Importante

### 1. Solicitud de Página Completa (Django Renderiza)

```
Cliente → HTTP GET /
  ↓
Django URL Router (urls.py)
  ↓
View (views.py) - HomeView
  ↓
Template (templates/home.html) + Context
  ↓
Renderizado: HTML + CSS + JS
  ↓
HTML Response ← Navegador muestra página
```

### 2. Interacción en Cliente (JavaScript Puro)

```
Usuario clickea "Agregar al carrito"
  ↓
JavaScript Event Listener (cart.js)
  ↓
fetch() HTTP POST a Express (3001)
  ↓
Express Route (routes/cart.js)
  ↓
Controller Logic (controllers/cartController.js)
  ↓
Sequelize Model → MySQL
  ↓
JSON Response ← JavaScript
  ↓
Actualiza DOM (sin recargar página)
```

### 3. Sincronización Django ↔ Express

```
Express necesita validar producto
  ↓
djangoService.js → HTTP GET a Django API
  ↓
Django View (views.py)
  ↓
Django ORM → MySQL
  ↓
JSON Response ← Express
  ↓
Express almacena datos
```

---

## 🎯 Archivos Clave por Funcionalidad

### Mostrar Productos
- `django-backend/products/models.py` - Define modelo Product
- `django-backend/products/views.py` - Renderiza templates + API
- `django-backend/templates/catalog.html` - HTML del catálogo
- `django-backend/static/css/base.css` - Estilos grid

### Gestionar Carrito
- `django-backend/static/js/cart.js` - Lógica completa del carrito
- `express-backend/routes/cart.js` - API del carrito
- `django-backend/templates/cart.html` - Interfaz del carrito

### Crear Pedidos
- `express-backend/routes/orders.js` - Rutas de pedidos
- `django-backend/orders/models.py` - Modelo Order
- `django-backend/static/js/cart.js` - submitCheckout()

### Enviar Contactos
- `express-backend/services/emailService.js` - Emails
- `django-backend/contact/models.py` - Guardar mensajes
- `django-backend/templates/contact.html` - Formulario

---

## 📈 Crecimiento del Proyecto

**Fase 1 (Actual - Estructura Base):**
- ✅ Modelos y migraciones
- ✅ Templates y estilos
- ✅ API REST básica
- ✅ Carrito local (LocalStorage)

**Fase 2 (Próximo - Funcionalidades):**
- [ ] Sincronizar carrito con servidor
- [ ] Sistema de usuarios/login
- [ ] Pagos integrados (Stripe, MercadoPago)
- [ ] Emails reales
- [ ] Dashboard de vendedor

**Fase 3 (Futuro - Optimización):**
- [ ] Caché (Redis)
- [ ] Búsqueda avanzada (ElasticSearch)
- [ ] Análisis (Google Analytics)
- [ ] Reseñas y ratings
- [ ] Wishlist de usuarios

---

## 🛠️ Tecnologías por Archivo

| Archivo | Tecnología | Propósito |
|---------|-----------|----------|
| `manage.py` | Django CLI | Ejecutar comandos Django |
| `settings.py` | Django Config | Configurar aplicación |
| `models.py` | Django ORM | Definir tablas de BD |
| `views.py` | Django Views | Lógica y renderizado |
| `templates/*.html` | Jinja2 | Plantillas dinámicas |
| `base.css` | CSS3 | Estilos responsive |
| `cart.js` | Vanilla JS | Lógica interactiva |
| `index.js` | Express | Servidor Node.js |
| `db.js` | Sequelize | ORM para Express |
| `*.js routes` | Express | Definir endpoints API |

---

## 📝 Notas

- **Tamaño del proyecto:** ~2400 líneas de código
- **Tiempo de desarrollo:** Reducido (estructura preconfigurada)
- **Mantenibilidad:** Alta (código organizado y documentado)
- **Escalabilidad:** Media-Alta (arquitectura preparada para crecer)

---

¡Explorar los archivos para entender mejor cómo funciona! 🚀
