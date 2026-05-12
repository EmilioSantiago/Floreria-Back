# Florería - Arquitectura sin Framework Frontend

Proyecto de florería construido con Django (backend principal + templates HTML) y Express.js (API auxiliar), usando únicamente HTML, CSS y JavaScript puro en el cliente.

## Estructura del Proyecto

```
Floreria-Back/
├── django-backend/          # Backend principal con Django
│   ├── floreria_project/    # Configuración del proyecto
│   ├── products/            # App de productos
│   ├── orders/              # App de pedidos
│   ├── contact/             # App de contactos
│   ├── templates/           # Templates HTML
│   └── static/              # CSS, JS, imágenes
│
└── express-backend/         # API auxiliar con Express
    ├── routes/              # Rutas de API
    ├── controllers/         # Lógica de controladores
    ├── models/              # Modelos de Sequelize
    ├── services/            # Servicios auxiliares
    └── config/              # Configuración
```

## Requisitos Previos

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- pip (gestor de paquetes de Python)
- npm (gestor de paquetes de Node.js)

## Instalación y Configuración

### 1. Instalar Dependencias de Django

```bash
cd django-backend

# Crear entorno virtual (Windows)
python -m venv venv
venv\Scripts\activate

# O en macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Instalar Dependencias de Express

```bash
cd express-backend
npm install
```

### 3. Configurar Base de Datos

Editar `django-backend/.env` con tus credenciales MySQL:
```
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=floreria_db
```

Crear la base de datos:
```bash
mysql -u root -p
CREATE DATABASE floreria_db;
EXIT;
```

### 4. Crear Migraciones Django

```bash
cd django-backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Ejecutar el Proyecto

### Terminal 1 - Django

```bash
cd django-backend
# Activar entorno virtual
venv\Scripts\activate  # Windows
# o
source venv/bin/activate  # macOS/Linux

python manage.py runserver 8000
```

Acceder en: http://localhost:8000

### Terminal 2 - Express

```bash
cd express-backend
npm start
```

API disponible en: http://localhost:3001

## URLs Principales Django

- Home: http://localhost:8000/
- Catálogo: http://localhost:8000/catalog/
- Carrito: http://localhost:8000/cart/
- Contacto: http://localhost:8000/contact/
- Admin: http://localhost:8000/admin/

## Endpoints Express

- POST `/cart/add` - Agregar producto al carrito
- GET `/cart/:id` - Obtener carrito
- POST `/orders` - Crear pedido
- GET `/orders/:id` - Obtener pedido
- POST `/contact` - Enviar mensaje de contacto

## Arquitectura

- **Django**: Renderiza HTML, gestiona sesiones, Admin
- **Express**: API auxiliar para carrito, pedidos, contacto
- **HTML/CSS/JS**: Interfaz interactiva sin frameworks
- **MySQL**: Base de datos compartida

## Tecnologías Usadas

- **Backend**: Django 4.2, Express.js 4.18
- **Base de Datos**: MySQL 8.0
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **ORM**: Django ORM, Sequelize
