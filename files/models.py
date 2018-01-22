from django.db import models

# Create your models here.
class Document(models.Model):
    name         = models.CharField(max_length=255, blank=False)
    description  = models.CharField(max_length=1000, null=True, blank=False)
    picture      = models.FileField(upload_to='documents/')
    modelpackage = models.FileField(upload_to='documents/')
    uploaded_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

