from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.views import View
from django.views.generic import TemplateView
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class HomeView(TemplateView):
    """Render home page"""
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['featured_products'] = Product.objects.filter(is_active=True)[:6]
        context['categories'] = Category.objects.all()
        return context


class CatalogView(TemplateView):
    """Render catalog page"""
    template_name = 'catalog.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['products'] = Product.objects.filter(is_active=True)
        context['categories'] = Category.objects.all()
        return context


class ProductDetailView(TemplateView):
    """Render product detail page"""
    template_name = 'product-detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id, is_active=True)
        context['product'] = product
        context['related_products'] = Product.objects.filter(
            category=product.category, is_active=True
        ).exclude(id=product_id)[:3]
        return context


class CartView(TemplateView):
    """Render cart page"""
    template_name = 'cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['express_api_url'] = 'http://localhost:3001'
        return context


class ContactView(TemplateView):
    """Render contact page"""
    template_name = 'contact.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['express_api_url'] = 'http://localhost:3001'
        return context


class OrderConfirmationView(TemplateView):
    """Render order confirmation page"""
    template_name = 'order-confirmation.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.request.GET.get('orderId') or self.request.GET.get('external_reference')
        payment_id = self.request.GET.get('payment_id') or self.request.GET.get('collection_id')
        payment_result = (
            self.request.GET.get('paymentResult')
            or self.request.GET.get('status')
            or self.request.GET.get('collection_status')
        )

        context['order_id'] = order_id
        context['payment_result'] = payment_result
        context['payment_id'] = payment_id
        context['payment_status'] = None
        context['payment_message'] = None
        context['clear_cart'] = False

        if order_id and payment_id:
            try:
                response = requests.post(
                    f'{settings.EXPRESS_API_URL}/orders/{order_id}/mercado-pago/confirm',
                    json={'payment_id': payment_id},
                    timeout=8,
                )
                if response.ok:
                    payment_data = response.json()
                    context['payment_status'] = payment_data.get('status')
                    context['payment_message'] = payment_data.get('mercado_pago_status')
                    context['clear_cart'] = payment_data.get('status') == 'paid'
                else:
                    context['payment_message'] = 'No pudimos confirmar el pago automaticamente.'
            except requests.RequestException:
                context['payment_message'] = 'No pudimos conectar con el servicio de pagos.'

        return context


# API Views
@api_view(['GET'])
def product_list_api(request):
    """API endpoint: List all products"""
    products = Product.objects.filter(is_active=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def product_detail_api(request, pk):
    """API endpoint: Get product detail"""
    product = get_object_or_404(Product, pk=pk, is_active=True)
    serializer = ProductSerializer(product)
    return Response(serializer.data)


@api_view(['GET'])
def category_list_api(request):
    """API endpoint: List all categories"""
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def check_stock_api(request):
    """API endpoint: Check product stock"""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    try:
        product = Product.objects.get(id=product_id)
        available = product.stock >= quantity
        return Response({
            'available': available,
            'stock': product.stock,
            'product_id': product_id,
            'price': str(product.price)
        })
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
