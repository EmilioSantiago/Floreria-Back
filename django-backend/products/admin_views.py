from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, TemplateView
from django.urls import reverse_lazy
from django.db.models import Sum, Count
from .models import Product, Category
from orders.models import Order
from .forms import ProductForm

@method_decorator(staff_member_required, name='dispatch')
class AdminDashboardView(TemplateView):
    template_name = 'admin/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_products'] = Product.objects.count()
        context['total_orders'] = Order.objects.count()
        context['total_sales'] = Order.objects.filter(status='delivered').aggregate(Sum('total'))['total__sum'] or 0
        context['recent_orders'] = Order.objects.all()[:5]
        context['low_stock_products'] = Product.objects.filter(stock__lt=5)
        return context

@method_decorator(staff_member_required, name='dispatch')
class AdminProductListView(ListView):
    model = Product
    template_name = 'admin/product_list.html'
    context_object_name = 'products'
    paginate_by = 10

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

@method_decorator(staff_member_required, name='dispatch')
class AdminProductCreateView(CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'admin/product_form.html'
    success_url = reverse_lazy('products:admin_product_list')

@method_decorator(staff_member_required, name='dispatch')
class AdminProductUpdateView(UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'admin/product_form.html'
    success_url = reverse_lazy('products:admin_product_list')

@method_decorator(staff_member_required, name='dispatch')
class AdminProductDeleteView(DeleteView):
    model = Product
    template_name = 'admin/product_confirm_delete.html'
    success_url = reverse_lazy('products:admin_product_list')

@method_decorator(staff_member_required, name='dispatch')
class AdminOrderListView(ListView):
    model = Order
    template_name = 'admin/order_list.html'
    context_object_name = 'orders'
    paginate_by = 10

@method_decorator(staff_member_required, name='dispatch')
class AdminOrderDetailView(TemplateView):
    template_name = 'admin/order_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['order'] = get_object_or_404(Order, pk=self.kwargs.get('pk'))
        return context

@staff_member_required
def update_order_status(request, pk):
    if request.method == 'POST':
        order = get_object_or_404(Order, pk=pk)
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
    return redirect('products:admin_order_detail', pk=pk)
