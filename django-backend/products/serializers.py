from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_stock = serializers.SerializerMethodField()
    display_image = serializers.CharField(source='get_image_url', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'image_url', 'display_image', 
                  'category', 'category_name', 'stock', 'is_active', 'in_stock', 'created_at']

    def get_in_stock(self, obj):
        return obj.stock > 0
