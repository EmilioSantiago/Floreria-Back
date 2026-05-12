from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(('products.urls', 'products'), namespace='products')),
    path('api/', include(('products.urls', 'products_api'), namespace='products_api')),
]
