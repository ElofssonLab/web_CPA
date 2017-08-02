from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import os
# Create your views here.
def index(request):
    tableData = []
    listFile = open(os.path.join(settings.DATA_DIR,'list.txt'),'r')
    headers = listFile.readline().strip().split(',')
    for line in listFile:
        tableData.append(line.strip().split(','))
    return render(request, 'web_pconsfold/index.html',{'headers':headers, 'tableData': tableData})

def details(request,pdb_id):
    modelURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pdb_id+'/model.pdb')
    return render(request, 'web_pconsfold/details.html',{'pdb_id':pdb_id, 'modelURL':modelURL})
