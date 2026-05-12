from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'email', 'subject']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información del Contacto', {
            'fields': ('name', 'email', 'subject')
        }),
        ('Mensaje', {
            'fields': ('message',)
        }),
        ('Estado', {
            'fields': ('status',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
