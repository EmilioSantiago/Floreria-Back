from django.urls import path
from django.contrib.auth import views as auth_views
from . import views, admin_views

app_name = 'products'

urlpatterns = [
    # Auth
    path('login/', auth_views.LoginView.as_view(template_name='admin/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),

    # Frontend views
    path('', views.HomeView.as_view(), name='home'),
    path('catalog/', views.CatalogView.as_view(), name='catalog'),
    path('product/<int:product_id>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('contact/', views.ContactView.as_view(), name='contact'),
    path('order-confirmation/', views.OrderConfirmationView.as_view(), name='order_confirmation'),

    # Dashboard & Admin CRUD
    path('dashboard/', admin_views.AdminDashboardView.as_view(), name='dashboard'),
    path('dashboard/products/', admin_views.AdminProductListView.as_view(), name='admin_product_list'),
    path('dashboard/products/add/', admin_views.AdminProductCreateView.as_view(), name='admin_product_add'),
    path('dashboard/products/<int:pk>/edit/', admin_views.AdminProductUpdateView.as_view(), name='admin_product_edit'),
    path('dashboard/products/<int:pk>/delete/', admin_views.AdminProductDeleteView.as_view(), name='admin_product_delete'),
    
    path('dashboard/orders/', admin_views.AdminOrderListView.as_view(), name='admin_order_list'),
    path('dashboard/orders/<int:pk>/', admin_views.AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('dashboard/orders/<int:pk>/status/', admin_views.update_order_status, name='update_order_status'),

    # API endpoints
    path('products/', views.product_list_api, name='api_product_list'),
    path('products/<int:pk>/', views.product_detail_api, name='api_product_detail'),
    path('categories/', views.category_list_api, name='api_category_list'),
    path('check-stock/', views.check_stock_api, name='api_check_stock'),
]
