from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Order, OrderItem


@api_view(['GET'])
def order_detail_api(request, pk):
    """API endpoint: Get order detail"""
    try:
        order = Order.objects.get(id=pk)
        return Response({
            'id': order.id,
            'customer_name': order.customer_name,
            'email': order.email,
            'phone': order.phone,
            'total': str(order.total),
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'items': [{
                'product_name': item.product_name,
                'quantity': item.quantity,
                'price': str(item.price),
                'subtotal': str(float(item.quantity) * float(item.price)),
            } for item in order.items.all()]
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
