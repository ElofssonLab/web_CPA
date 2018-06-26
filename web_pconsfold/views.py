from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
# from filebrowser.base import FileListing
import os
import json
import glob

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


def details(request, pfam_id):
    modelURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pfam_id+'/model.pdb')
    # modelURLs = [modelURL]
    dmapURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pfam_id+'/model.dmap')
    # dmapURLs = [dmapURL]
    base_url = os.path.join(settings.DATA_DIR, '29.0/', pfam_id)
    ls_list = []
    fasta_url = ''
    # for f in os.listdir('/big/pfam/web_pconsfold/static/data/29.0/' + pfam_id):
    # prot_di = fix(id,glob.glob("{}/*.l3".format(jobDir)))
    di_list = []
    model_list = []
    raw_models = glob.glob(base_url + "/*.pdb")
    raw_DIs = glob.glob(base_url + "/*.l3")
    fasta_url = glob.glob(base_url + "/*.fa")[0]
    desc_file = glob.glob(base_url + "/description.txt")[0]
    with open(desc_file, 'r') as desc_handle:
        desc_list = desc_handle.readlines()
        if len(desc_list) > 1:
            pfam_name = desc_list[0].strip()
            pfam_title = desc_list[1].strip()
            desc = desc_list[2].strip()
        else:
            pfam_name = desc_list.strip()
            pfam_title = ""
            desc = ""
        if len(desc_list) > 4:
            clan_id = desc_list[3].strip()
            clan_name = desc_list[4].strip()
        else:
            clan_id = ""
            clan_name = ""
    # print fasta_url
    pdb_name = fasta_url.split('/')[-1].split('.')[2].replace('_', '')
    pdb_url = "http://www.rcsb.org/structure/" + pdb_name[:-1]
    pfam_url = "https://pfam.xfam.org/family/" + pfam_id.split('.')[0]
    # print pdb_name
    with open(fasta_url) as fa_handle:
        fa_handle.readline()
        seq = fa_handle.readline().strip()
        # print seq
        # print len(seq)
        protein_len = len(seq)
    for di in raw_DIs:
        di_list.append(str(os.path.join(settings.STATIC_URL,
            "data/29.0/"+pfam_id,
                di.split("/")[-1])))
    for mod in raw_models:
        model_list.append(str(os.path.join(settings.STATIC_URL,
            "data/29.0/"+pfam_id,
                mod.split("/")[-1])))
    DI = di_list[0]
    for f in os.listdir(base_url):
        if f.endswith('.fa'):
            fasta_url = os.path.join(settings.STATIC_URL, 'data/29.0/',
            pfam_id, f)
        ls_list.append((f, os.path.join(settings.STATIC_URL, 'data/29.0/',
            pfam_id, f)))
    return render(request, 'web_pconsfold/details.html', {'pfam_id': pfam_id,
                                                          'pfam_url': pfam_url,
                                                          'modelURL': modelURL,
                                                          'modelURLs': model_list,
                                                          'dmapURL': dmapURL,
                                                          # 'dmapURLs': dmapURLs,
                                                          'DIs': di_list,
                                                          'DI': DI,
                                                          'base_url': base_url,
                                                          'fasta_url': fasta_url,
                                                          'prot_len': protein_len,
                                                          'pdb_url': pdb_url,
                                                          'pfam_name': pfam_name,
                                                          'pfam_title': pfam_title,
                                                          'desc': desc,
                                                          'clan_id': clan_id,
                                                          'clan_name': clan_name,
                                                          'ls_list': ls_list})

def get_browse(request):
    tableData = []
    if 'search' in request.GET:
        initial_search = request.GET["search"]
    else:
        initial_search = ''
    listFile = open(os.path.join(settings.DATA_DIR,'list.txt'),'r')
    headers = listFile.readline().strip().split(',')
    # tableData.append(headers)
    for line in listFile:
        #temp_string = '<tr><td>'
        splitline = line.strip().split(",")
        # tableData.append(splitline)
        # <td><a href="/details/{{ cell }}">{{ cell }}</a> </td>
        pfam_acc = splitline[0].split('.')[0]
        N = splitline[1]
        Meff = '{0:.2f}'.format(float(splitline[2])) if len(splitline[2]) > 0 else ''
        # pfam_link = '<a href="https://pfam.xfam.org/family/' + pfam_acc + '" target="_blank">' + pfam_acc + '</a>'
        pfam_link = '<a href="/details/' + splitline[0] + '">' + pfam_acc + '</a>' if splitline[4] == '1' else pfam_acc
        # processed_lines = [temp_string] + splitline[1:3]
        # pdb_link = '<a href="http://www.rcsb.org/pdb/search/smartSubquery.do?smartSearchSubtype=PfamIdQuery&pfamID=' + pfam_acc + '" target="_blank">RCSB</a>' if splitline[3] == '1' else 'Missing'
        # model_link = '<a href="/details/' + splitline[0] + '">Model</a>' if splitline[4] == '1' else 'Missing'
        has_pdb_structure = "Yes" if splitline[3] == '1' else "No"
        has_model = "Yes" if splitline[4] == '1' else "No"
        if splitline[5] == 'NA':
            FDR = ''
        elif len(splitline[5]) > 0:
            FDR = '{0:.3f}'.format(float(splitline[5]))
        else:
            FDR = ''
        clan_acc = splitline[6]
        if has_model == "Yes":
            processed_lines = [pfam_link, clan_acc, N, Meff, str(FDR), has_pdb_structure, has_model]
            tableData.append(processed_lines)
        # temp_string += "</td><td>".join(splitline[1:]) + "</td></tr>"
        # tableData.append(temp_string)
    jsondata = json.dumps(tableData)
    return render(request, 'web_pconsfold/browse.html',{'headers':headers,
        'tableData': jsondata, 'initial_search': initial_search})

def get_contact(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/contact.html', {})
def get_search(request):
    # return HttpResponse('In help site')
    return render(request, 'web_pconsfold/search.html', {})
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
