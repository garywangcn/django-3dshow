from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from files.models import Document
from django.template import Context, Template

# Create your views here.

def index(request):
    context = {}
    document_list = Document.objects.all()
    print(document_list)
    for doc in document_list :
        print(doc.name)
        print(doc.picture)
        print(doc.picture.url)
        print(doc.modelpackage)
    context['document_list'] = document_list 
    index_page = render(request, 'home.html', context)
    return index_page
