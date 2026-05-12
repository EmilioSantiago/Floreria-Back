# 🌸 QUICKSTART - Florería Chelito (Sin Framework Frontend)

## Requisitos Previos

✅ **Python 3.11** - Instalado
✅ **Node.js 16+** - v24.11.1 Instalado
✅ **MySQL 8.0** - Necesitas instalarlo
✅ **Git** - Opcional

## Pasos Rápidos de Instalación

### 1. Verificar Python y Node.js

```bash
# Python
python --version  # Debe ser 3.11+

# Node.js
node --version
npm --version
```

### 2. Crear Base de Datos MySQL

```bash
# Abrir MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE floreria_db;
CREATE USER 'floreria_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON floreria_db.* TO 'floreria_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configurar Django

**Editar `.env` en `django-backend/`:**

```env
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.mysql
DB_NAME=floreria_db
DB_USER=floreria_user
DB_PASSWORD=tu_contraseña_segura
DB_HOST=127.0.0.1
DB_PORT=3306

# Express Backend
EXPRESS_API_URL=http://localhost:3001

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3001
```

**Activar venv e instalar dependencias:**

```bash
cd django-backend

# Activar entorno virtual (si no está activado)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear migraciones
python manage.py makemigrations

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (administrador)
python manage.py createsuperuser
# Ingresa: usuario, email, contraseña

# Recopilar archivos estáticos
python manage.py collectstatic --noinput
```

### 4. Configurar Express

**Editar `.env` en `express-backend/`:**

```env
NODE_ENV=development
PORT=3001

# Database (Mismo que Django)
DB_HOST=127.0.0.1
DB_USER=floreria_user
DB_PASSWORD=tu_contraseña_segura
DB_NAME=floreria_db
DB_PORT=3306

# Django Backend
DJANGO_API_URL=http://localhost:8000/api

# Email (Mailtrap para desarrollo - registrarse gratis en mailtrap.io)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_password_mailtrap

# CORS
CORS_ORIGIN=http://localhost:8000
```

**Instalar dependencias:**

```bash
cd express-backend
npm install
```

---

## Ejecución del Proyecto

### Opción 1: Dos Terminales (Recomendado)

**Terminal 1 - Django:**

```bash
cd django-backend
venv\Scripts\activate
python manage.py runserver 8000
```

Verás:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Terminal 2 - Express:**

```bash
cd express-backend
npm start
```

Verás:
```
🌸 Express server running on http://localhost:3001
```

### Opción 2: Una Terminal (Script PowerShell)

Crea un archivo `start.ps1`:

```powershell
# start.ps1
$djangoPath = "c:\Users\emili\OneDrive\Desktop\Floreria-Back\django-backend"
$expressPath = "c:\Users\emili\OneDrive\Desktop\Floreria-Back\express-backend"

# Abrir Django en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$djangoPath'; .\venv\Scripts\activate; python manage.py runserver 8000"

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Abrir Express en nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$expressPath'; npm start"

Write-Host "Ambos servidores iniciándose..."
Write-Host "Django: http://localhost:8000"
Write-Host "Express: http://localhost:3001"
```

Ejecutar:
```bash
.\start.ps1
```

---

## URLs Principales

| URL | Descripción |
|-----|-------------|
| http://localhost:8000/ | Home - Página principal |
| http://localhost:8000/catalog/ | Catálogo de productos |
| http://localhost:8000/cart/ | Carrito de compras |
| http://localhost:8000/contact/ | Formulario de contacto |
| http://localhost:8000/product/1/ | Detalle de producto |
| http://localhost:8000/admin/ | Panel de administración |
| http://localhost:3001/health | Health check de Express |

---

## Panel de Administración Django

1. Ir a: http://localhost:8000/admin/
2. Ingresar con el superusuario creado anteriormente
3. Crear productos:
   - Ir a "Products" → "Add Product"
   - Llenar: Nombre, Descripción, Precio, Stock, Imagen, Categoría

---

## Creación Rápida de Datos de Prueba

Desde Django Admin:

1. **Crear Categorías:**
   - Rosas
   - Tulipanes
   - Girasoles
   - Margaritas

2. **Crear Productos:**
   - 6-10 productos con imágenes (puedes usar URLs de placeholders)

3. **Ajustar Stock:**
   - Al menos 5 unidades de cada producto

---

## Solución de Problemas

### Error: "No such table: products_product"
```bash
cd django-backend
python manage.py makemigrations
python manage.py migrate
```

### Error: "Can't connect to MySQL"
- Verificar que MySQL está corriendo
- Verificar credenciales en `.env`
- Verificar que la BD existe: `SHOW DATABASES;`

### Error: "Port 8000 already in use"
```bash
# Cambiar puerto
python manage.py runserver 8001
```

### Express no conecta con Django
- Verificar que Django está corriendo en http://localhost:8000
- Verificar `DJANGO_API_URL` en `.env` de Express

---

## Arquitectura del Proyecto

```
Frontend (Navegador)
    ↓
Django (8000) ← Renderiza HTML, CSS, JS
    ↓
JavaScript Vanilla ← Interactividad en cliente
    ↓
Express (3001) ← API auxiliar para servicios
    ↓
MySQL ← Base de datos compartida
```

---

## Próximos Pasos

1. ✅ Crear productos en Admin Django
2. ✅ Probar agregar al carrito
3. ✅ Probar checkout
4. ✅ Revisar emails en Mailtrap
5. ✅ Implementar pagos reales
6. ✅ Desplegar en producción

---

## Documentación Completa

Ver: [ARQUITECTURA.md](ARQUITECTURA.md)
Ver: [README.md](README.md)

---

¡Bienvenido a Florería Chelito! 🌸
