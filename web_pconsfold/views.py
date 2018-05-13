from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
# from filebrowser.base import FileListing
import os
import json
# Create your views here.
def index(request):
    # tableData = []
    # listFile = open(os.path.join(settings.DATA_DIR,'list.txt'),'r')
    # headers = listFile.readline().strip().split(',')
    # for line in listFile:
    #     temp_string = '<tr><td>'
	# splitline = line.strip().split(",")
	# # <td><a href="/details/{{ cell }}">{{ cell }}</a> </td>
	# temp_string += '<a href="/details/' + splitline[0] + '">' + splitline[0] + '</a></td><td>'
	# temp_string += "</td><td>".join(splitline[1:]) + "</td></tr>"
    #     tableData.append(temp_string)
    return render(request, 'web_pconsfold/index.html') # ,{'headers':headers, 'tableData': tableData})

def details(request,pdb_id):
    modelURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pdb_id+'/model.pdb')
    base_url = os.path.join(settings.STATIC_URL, 'data/29.0/', pdb_id)
    ls_list = []
    for f in os.listdir('/big/pfam/web_pconsfold/static/data/29.0/' + pdb_id):
        ls_list.append((f, os.path.join(base_url, f)))
    return render(request, 'web_pconsfold/details.html',{'pdb_id':pdb_id, 'modelURL':modelURL, 'base_url':base_url, 'ls_list':ls_list})

def get_browse(request, initial_search='no'):
    tableData = []
    listFile = open(os.path.join(settings.DATA_DIR,'list.txt'),'r')
    headers = listFile.readline().strip().split(',')
    for line in listFile:
        #temp_string = '<tr><td>'
        splitline = line.strip().split(",")
        tableData.append(splitline)
        # <td><a href="/details/{{ cell }}">{{ cell }}</a> </td>
        # temp_string += '<a href="/details/' + splitline[0] + '">' + splitline[0] + '</a></td><td>'
        # temp_string += "</td><td>".join(splitline[1:]) + "</td></tr>"
        # tableData.append(temp_string)
    jsondata = json.dumps(tableData)
    return render(request, 'web_pconsfold/browse.html',{'headers':headers,
        'tableData': jsondata, 'initial_search': initial_search})

def get_help(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/help.html', {})
def get_news(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/news.html', {})
def get_download(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/download.html', {})
def get_reference(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/reference.html', {})
