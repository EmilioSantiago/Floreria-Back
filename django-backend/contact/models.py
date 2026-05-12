from django.db import models

class Contact(models.Model):
    """Model for contact messages"""
    STATUS_CHOICES = [
        ('new', 'Nuevo'),
        ('read', 'Leído'),
        ('replied', 'Respondido'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.email}"
