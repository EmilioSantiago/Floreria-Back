from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'quantity', 'price', 'calculate_subtotal']

    def calculate_subtotal(self, obj):
        """Calcula el subtotal del item (cantidad × precio)"""
        if obj.quantity and obj.price:
            return obj.quantity * obj.price
        return '-'
    calculate_subtotal.short_description = 'Subtotal'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer_name', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['id', 'customer_name', 'email']
    readonly_fields = ['order_id', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Información de Pedido', {
            'fields': ('order_id', 'status')
        }),
        ('Información del Cliente', {
            'fields': ('customer_name', 'email', 'phone')
        }),
        ('Dirección de Envío', {
            'fields': ('address', 'city', 'postal_code')
        }),
        ('Costo', {
            'fields': ('total',)
        }),
        ('Método de Pago', {
            'fields': ('payment_method',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def order_id(self, obj):
        """Muestra el ID del pedido con formato"""
        return f"Order #{obj.id}"
    order_id.short_description = 'Número de Pedido'
    order_id.admin_order_field = 'id'
