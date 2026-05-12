from django.views import View
from django.shortcuts import render
from .models import Contact
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def create_contact_api(request):
    """API endpoint: Create contact message"""
    try:
        contact = Contact.objects.create(
            name=request.data.get('name'),
            email=request.data.get('email'),
            subject=request.data.get('subject'),
            message=request.data.get('message'),
        )
        return Response({
            'id': contact.id,
            'status': 'created',
            'message': 'Mensaje guardado correctamente'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)
