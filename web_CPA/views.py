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
    return render(request, 'web_CPA/index.html') # ,{'headers':headers, 'tableData': tableData})


def details(request, subfamily_id):
    # print(subfamily_id)
    # pfam_id = 'PF00001.18'
    # modelURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pfam_id+'/model.pdb')
    # modelURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pfam_id+'/model.pdb')
    # # modelURLs = [modelURL]
    # dmapURL = os.path.join(settings.STATIC_URL, 'data/29.0/'+pfam_id+'/model.dmap')
    # # dmapURLs = [dmapURL]
    # base_url = os.path.join(settings.DATA_DIR, '29.0/', pfam_id)
    # base_url = os.path.join(settings.DATA_DIR, 'CPA/', subfamily_id)
    partial_protein_list = []
    with open(os.path.join(settings.DATA_DIR, "CPA", "partial_protein_list.txt"), 'r') as partial_protein_list_handle:
        partial_protein_list = partial_protein_list_handle.read().strip().split('\n')

    if subfamily_id in partial_protein_list:
        partial = True
    else:
        partial = False
    cpa_url = os.path.join(settings.DATA_DIR, 'CPA/', subfamily_id)
    ls_list = []
    fasta_url = ''
    # for f in os.listdir('/big/pfam/web_CPA/static/data/29.0/' + pfam_id):
    # prot_di = fix(id,glob.glob("{}/*.l3".format(jobDir)))
    di_list = []
    model_list = []
    Full_alignment_images_raw = glob.glob(settings.DATA_DIR + "/CPA/images/Full_length_seq_topo_figures/*" + subfamily_id + "*")
    Repeat_alignment_images_raw = glob.glob(settings.DATA_DIR + "/CPA/images/Repeat_seq_topo_figures/*" + subfamily_id + "*")
    # Repeat_alignment_images = glob.glob(cpa_url + "/*.pdb")
    raw_cpa_models = glob.glob(cpa_url + "/*.pdb")
    pir_models = glob.glob(cpa_url + "/*.pir")
    seed_models_raw = glob.glob(cpa_url + "/*seed.msa")
    fasta_topo_files = glob.glob(cpa_url + "/*topo")
    cases_path = glob.glob(cpa_url + "/*_cases.txt")
    buttons_path = glob.glob(cpa_url + "/*_buttons.txt")
    topAnnot_names = glob.glob(cpa_url + "/*-topology_annotation.svg")  # [0].split('/')[-1]
    # if len(cpa_models) > 0:
    # print(cpa_models)
    # print(pir_models)
    # print(cpa_models)
    models = [os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, c.split("/")[-1]) for c in raw_cpa_models]
    cpa_models = []
    model_type = ''
    for model in models:
        if 'Tr' in model:
            cpa_models.append(["trRosetta model", str(model)])
            if not model_type:
                model_type = "Predicted model"
        elif "_struct.pdb" in model:
            cpa_models.append(["Crystal structure", str(model)])
            if not model_type:
                model_type = "Crystal structure"
        # else:
        #     cpa_models.append(["CONFOLD Homology model", str(model)])
        #     if not model_type:
        #         model_type = "Homology model"

    if len(pir_models) > 0:
        pir_model = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, pir_models[0].split("/")[-1])
    else:
        pir_model = ''
    seed_models = [os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, seed_model.split("/")[-1]) for seed_model in seed_models_raw]
    fasta_topo_file = ''
    if len(fasta_topo_files) > 0:
        fasta_topo_file = [os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, fasta_topo_file.split("/")[-1]) for fasta_topo_file in fasta_topo_files][0]
    Full_alignment_images = [os.path.join(settings.STATIC_URL, 'data/CPA/images/Full_length_seq_topo_figures', full_image.split("/")[-1]) for full_image in Full_alignment_images_raw]
    Repeat_alignment_images = [os.path.join(settings.STATIC_URL, 'data/CPA/images/Repeat_seq_topo_figures', repeat_image.split("/")[-1]) for repeat_image in Repeat_alignment_images_raw]
    # print(fasta_topo_file)
    
    ######################
    # Data from heirarchy.txt
    info = {}
    with open(os.path.join(settings.DATA_DIR, "CPA", subfamily_id, "heirarchy.txt"), 'r') as heir_stat:
        for d in heir_stat.read().strip().split('\n'):
            key = d.split(':')[0].strip()
            values = d.split(':')[1:]
            # if key == "Subfamily":
            #     detail_link = '<a href="/details/' + sub_family + '">' + sub_family + '</a>'
            #     info[key] = detail_link
            # elif key == "Pfam":
            #     pfam_link = '<a href="https://pfam.xfam.org/family/' + value + '" target="_blank">' + value + '</a>' 
            #     info[key] = pfam_link
            # else:
            if key.startswith("KR"):
                info["KRbroken"] = ''
                info["KRreentrant"] = ''
                p_type = key.split('/')
                value = values[0].split('/')
                if len(value[0]) > 0:
                    info["KRbroken"] = [p_type[0], value[0]]
                    info["KRreentrant"] = [p_type[1], value[1]]
            elif key == "CPAfold":
                info["Superfamily"] = values[0]
                info["Family"] = values[1]
                # detail_link = '<a href="/details/' + sub_family + '">' + sub_family + '</a>'
                # info["Subfamily"] = detail_link
            elif key == "Pfam family":
                pfam_link = ''
                pfam_link = '<a href="https://pfam.xfam.org/family/' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                info["Pfam-Family"] = pfam_link
            elif key == "Pfam clan":
                pfam_clan_link = ''
                pfam_clan_link = '<a href="https://pfam.xfam.org/clan/' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                info["Pfam-Clan"] = pfam_clan_link
            elif key == "Fold-type": 
                info[key] = values[0].replace(" fold-type", '')
            elif key == "TCDB family":
                tcdb_link = ''
                # for l in values[1].split(','):
                #     if len(tcdb_link) > 0:
                #         tcdb_link += ','
                # tcdb_link += '<a href="http://www.tcdb.org/search/result.php?tc=' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                info["TCDB-Family"] = values[0]
            elif key == "TCDB superfamily":
                tcdb_link = ''
                # for l in values[1].split(','):
                #     if len(tcdb_link) > 0:
                #         tcdb_link += ','
                #tcdb_link += '<a href="http://www.tcdb.org/search/result.php?tc=' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                info["TCDB-Superfamily"] = values[0]
            # elif key == "OPM family":
            #     info[key] = ''
            #     if len([x for x in values if len(x.strip()) > 0]) > 0:
            #         # opm_sup_family = values[0]
            #         opm_family = values[0]
            #         #opm_s_link = '<a href="https://opm.phar.umich.edu/protein_superfamilies/' + values[0] + '" target="_blank">Superfamily</a>' 
            #         opm_link = '<a href="https://opm.phar.umich.edu/protein_families/' + values[0] + '" target="_blank">Family</a>' 
            #         info["OPM"] =  opm_link
                
            elif key in ["cath","CATH","CATH family"]:
                info[key] = ''
                cath_link = ''
                if len([x for x in values if len(x.strip()) > 0]) > 0:
                    cath_link = '<a href="http://www.cathdb.info/version/latest/superfamily/' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                info["CATH"] = cath_link
            elif key == "PDB":
                info[key] = ''
                if values != ['']:
                    if len(values) > 0:
                        pdb_link = ''
                        for pdb in values[0].split(','):
                            pdb_link += '<a href="https://www.rcsb.org/structure/' + pdb[:4] + '" target="_blank">' + pdb + '</a>,' 
                        info[key] = pdb_link[:-1]

            # TCDB::2.A.24:
            # http://www.tcdb.org/search/result.php?tc=2.A.10
            else:
                info[key] = values[0].strip()
    cartoon_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, subfamily_id + "-cartoon.svg")
    krbias_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, subfamily_id + "-KRbias.png")
    motif_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, subfamily_id + "-NC_CC.png")
    # topAnnot_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, topAnnot_name)
    topAnnot_urls = [os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, topAnnot.split("/")[-1]) for topAnnot in topAnnot_names]
    # print(topAnnot_urls)

    fasta_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, subfamily_id + ".fasta")
    family_msa_url = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, subfamily_id + "-msa.fasta")
    # cases_path = os.path.join(settings.STATIC_URL, 'data/CPA/', subfamily_id, cases[0].split("/")[-1])
    # print(cpa_model)
    # print(modelURL)
    cases_text = ''
    if len(cases_path) > 0:
        case_path = cases_path[0]
        with open(case_path) as cases_handle:
            cases_text = cases_handle.read()
    buttons_text = []
    if len(buttons_path) > 0:
        buttons_path = buttons_path[0]
        with open(buttons_path) as buttons_handle:
            for line in buttons_handle:
                buttons_text.append(line.strip().split())
    # print(buttons_text)
    # raw_models = glob.glob(base_url + "/*.pdb")
    # raw_DIs = glob.glob(base_url + "/*.l3")
    temp_fasta_url = ''
    if len(fasta_topo_files) > 0:
        temp_fasta_url = glob.glob(cpa_url + "/" + subfamily_id +".fasta")[0]
    # desc_file = glob.glob(base_url + "/description.txt")[0]

    fa_len = 0
    if len(fasta_topo_files) > 0:
        with open(temp_fasta_url) as fa_handle:
            fa_handle.readline()
            seq = ''.join(fa_handle.readlines())
            # print(seq)
            fa_len = len(seq)
            # print seq
            # print len(seq)
    # topology
    topo_lambda = lambda x: x.split("/")[0][:-1]+"<sub>"+x.split("/")[0][-1]+"</sub>"

    # topology_calculated = 0
    # topo_data = [[],[],[],"",""]
    # topo_file = glob.glob(base_url + "/topology.txt")
    # if topo_file:
    #     topology_calculated = 1
    #     topo_file = topo_file[0]
    #     with open(topo_file) as topo_in:
    #         topo_data = topo_in.readlines()
    #     topo_data[0] = map(topo_lambda,topo_data[0].strip().split(";"))
    #     topo_data[1] = map(lambda x: x.split("/")[0],topo_data[1].strip().split(";"))
    #     topo_data[2] = topo_data[2].strip().split(";")
    #     if topo_data[3]:
    #          topo_data[3] = topo_lambda(topo_data[3].strip())
    # print(topo_file)
    # end topology

    # with open(desc_file, 'r') as desc_handle:
    #     desc_list = desc_handle.readlines()
    #     if len(desc_list) > 1:
    #         pfam_name = desc_list[0].strip()
    #         pfam_title = desc_list[1].strip()
    #         desc = desc_list[2].strip()
    #     else:
    #         pfam_name = desc_list.strip()
    #         pfam_title = ""
    #         desc = ""
    #     if len(desc_list) > 4:
    #         clan_id = desc_list[3].strip()
    #         clan_name = desc_list[4].strip()
    #     else:
    #         clan_id = ""
    #         clan_name = ""
#   #  print fasta_url
    # pdb_name = fasta_url.split('/')[-1].split('.')[2].replace('_', '')
    # pdb_url = "http://www.rcsb.org/structure/" + pdb_name[:-1]
    # pfam_url = "https://pfam.xfam.org/family/" + pfam_id.split('.')[0]
    # print pdb_name
    # with open(fasta_url) as fa_handle:
    #     fa_handle.readline()
    #     seq = fa_handle.readline().strip()
    #     # print seq
    #     # print len(seq)
    #     protein_len = len(seq)
    # for di in raw_DIs:
    #     di_list.append(str(os.path.join(settings.STATIC_URL,
    #         "data/29.0/"+pfam_id,
    #             di.split("/")[-1])))
    # for mod in raw_models:
    #     model_list.append(str(os.path.join(settings.STATIC_URL,
    #         "data/29.0/"+pfam_id,
    #             mod.split("/")[-1])))
    # DI = di_list[0]
    # for f in os.listdir(base_url):
    #     if f.endswith('.fa'):
    #         fasta_url = os.path.join(settings.STATIC_URL, 'data/29.0/',
    #         pfam_id, f)
    #     ls_list.append((f, os.path.join(settings.STATIC_URL, 'data/29.0/',
    #         pfam_id, f)))

    #FIX FOR STRUCTURE FROM PDB
    # pdb_chain = pdb_name[-1] if len(pdb_url.split("/")[-1])==4 else ""
    # org_pdb_file = "https://files.rcsb.org/view/{}.pdb".format(pdb_url.split("/")[-1]) if len(pdb_url.split("/")[-1])==4 else ""
    # model_list = sorted(model_list, key=lambda x: "".join(x.split(".")[:-1]))
    # modelURLs = [org_pdb_file] + model_list
    #print(cpa_model)
    if subfamily_id.startswith("Cons_hypoth698"):
        subfamily_id = subfamily_id.replace('Cons_hypoth698', 'PSE')
    return render(request, 'web_CPA/details.html', {# 'pfam_id': pfam_id,
                                                          # 'pfam_url': pfam_url,
                                                          'modelURLs': cpa_models,
                                                          'pirURL': pir_model,
                                                          'modelType': model_type,
                                                          'cartoonURL': cartoon_url,
                                                          'krbiasURL': krbias_url,
                                                          'topannotURLs': topAnnot_urls,
                                                          'pfam_link':info["Pfam-Family"],
                                                          'pfam_clan_link':info["Pfam-Clan"],
                                                          'tcdb_link':info["TCDB-Family"],
                                                          'opm_link':info["OPM family"],
                                                          'cath_link':info["CATH"],
                                                          'partial':partial,
                                                          # 'modelURLs': modelURLs,
                                                          # 'dmapURL': dmapURL,
                                                          # 'topology_calculated' : topology_calculated,
                                                          # 'topo_data': topo_data,
                                                          # 'dmapURLs': dmapURLs,
                                                          # 'DIs': di_list,
                                                          # 'DI': DI,
                                                          # 'base_url': base_url,
                                                          # 'fasta_url': fasta_url,
                                                          # 'prot_len': protein_len,
                                                          'pdb_id': info["PDB"],
                                                          # 'pdb_chain' : pdb_name[4:],
                                                          # 'pdb_url': pdb_url,
                                                          # 'pdb_chain': pdb_chain,
                                                          # 'pfam_name': pfam_name,
                                                          # 'pfam_title': pfam_title,
                                                          # 'desc': desc,
                                                          # 'clan_id': clan_id,
                                                          # 'clan_name': clan_name,
                                                          # 'ls_list': ls_list,
                                                          'topology': info["Topology"],
                                                          'nrepeat': info["N-repeat"],
                                                          'crepeat': info["C-repeat"],
                                                          'krbroken': info["KRbroken"],
                                                          'krreentrant': info["KRreentrant"],
                                                          'motif_url': motif_url,
                                                          'seed_models': seed_models,
                                                          'fasta_url': fasta_url,
                                                          'fasta_topo_file': fasta_topo_file,
                                                          'family_msa_url': family_msa_url,
                                                          'subfamily_id': subfamily_id,
                                                          'cases_text': cases_text,
                                                          'full_images': Full_alignment_images,
                                                          'repeat_images': Repeat_alignment_images,
                                                          'fa_len': fa_len,
                                                          'buttons_text': buttons_text})

def get_browse(request):
    tableData = []
    if 'search' in request.GET:
        initial_search = request.GET["search"]
    else:
        initial_search = ''
    # listFile = open(os.path.join(settings.DATA_DIR,'list.txt'),'r')
    # statsFile = open(os.path.join(settings.DATA_DIR,'stats.txt'),'r')
    # headers = listFile.readline().strip().split(',')
    # headers = ["ID","N","Meff","hasPDB","hasModel","FDR"]
    # <!-- Family, Topology,Fold-type, Pfam family, Pfam clan, TCDB family, TCDB superfamily -->	
    # headers = ["Subfamily", "Family", "Superfamily", "Fold-type","Topology", "Pfam"]

    protein_list = []
    with open(os.path.join(settings.DATA_DIR, "CPA", "protein_list.txt"), 'r') as protein_list_handle:
        protein_list = protein_list_handle.read().strip().split('\n')

    sub_families= [f.split("/")[-1] for f in glob.glob(settings.DATA_DIR + "/CPA/*") if os.path.isdir(f) and f.split("/")[-1] in protein_list]
    family_stats = []


    for sub_family in sub_families:
        info = {}
        with open(os.path.join(settings.DATA_DIR, "CPA", sub_family, "heirarchy.txt"), 'r') as heir_stat:

            for d in heir_stat.read().strip().split('\n'):
                key = d.split(':')[0]
                values = d.split(':')[1:]
                if key == "Family":
                    #info["Superfamily"] = values[0]
                    #info["Family"] = values[1]
                    # if sub_family.startswith("Cons_hypoth698"):
                    #     detail_link = '<a href="/details/' + sub_family + '">' + sub_family + "(" + sub_family.replace('Cons_hypoth698', 'PSE') + ')</a>'
                    # else:

                    sub_family_name = sub_family
                    if sub_family.startswith("Cons_hypoth698"):
                        sub_family_name = sub_family.replace('Cons_hypoth698', 'PSE')
                    detail_link = '<a href="/details/' + sub_family + '">' + sub_family_name + '</a>'
                    info["Family"] = detail_link
                elif key == "Pfam family":
                    pfam_link = ''
                    pfam_link = '<a href="https://pfam.xfam.org/family/' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                    info["Pfam-Family"] = pfam_link
                elif key == "Pfam clan":
                    pfam_clan_link = ''
                    pfam_clan_link = '<a href="https://pfam.xfam.org/clan/' + values[0] + '" target="_blank">' + values[0] + '</a>' 
                    info["Pfam-Clan"] = pfam_clan_link
                elif key == "Fold-type": 
                    info[key] = values[0].replace(" fold-type", '')
                    # info[key] = values[0]
                elif key == "TCDB family":
                    tcdb_link = ''
                    # for l in values[1].split(','):
                    #     if len(tcdb_link) > 0:
                    #         tcdb_link += ','
                    #     tcdb_link += '<a href="http://www.tcdb.org/search/result.php?tc=' + l + '" target="_blank">' + l + '</a>' 
                    info["TCDB-Family"] = values
                elif key == "TCDB superfamily":
                    tcdb_link = ''
                    # for l in values[1].split(','):
                    #     if len(tcdb_link) > 0:
                    #         tcdb_link += ','
                    #     tcdb_link += '<a href="http://www.tcdb.org/search/result.php?tc=' + l + '" target="_blank">' + l + '</a>' 
                    info["TCDB-Superfamily"] = values
                # elif key == "OPM":
                #     info[key] = ''
                #     if len([x for x in values if len(x.strip()) > 0]) > 0:
                #         opm_sup_family = values[0]
                #         opm_family = values[1]
                #         opm_s_link = '<a href="https://opm.phar.umich.edu/protein_superfamilies/' + values[0] + '" target="_blank">Superfamily</a>' 
                #         opm_link = '<a href="https://opm.phar.umich.edu/protein_families/' + values[1] + '" target="_blank">Family</a>' 
                #         info[key] = opm_s_link + ',' + opm_link
                #     
                # elif key == "CATH":
                #     info[key] = ''
                #     if len([x for x in values if len(x.strip()) > 0]) > 0:
                #         cath_link = '<a href="http://www.cathdb.info/version/latest/superfamily/' + values[0] + '" target="_blank">Superfamily</a>' 
                #         info[key] = cath_link
                # TCDB::2.A.24:
                # http://www.tcdb.org/search/result.php?tc=2.A.10
                else:
                    info[key] = values
                # elif key == "PDB":
                #     info.append(value)
                #     if value:
                #         value = "True"
                #     else:
                #         value = "False"
                #     info.append(value)
                # else:
                #     info.append(value)
            # family_stats.append(info)
    # <!-- Family, Topology,Fold-type, Pfam family, Pfam clan, TCDB family, TCDB superfamily -->	
            # tableData.append([info["Subfamily"], info["Family"],
            #                   info["Superfamily"], info["Fold-type"],
            #                   info["Topology"], info["Pfam-Clan"],
            #                   info["Pfam"], info["TCDB"],
            #                   info["OPM"], info["CATH"]])
            tableData.append([info["Family"],
                              info["Topology"], info["Fold-type"],
                              info["Pfam-Family"], info["Pfam-Clan"],
                              info["TCDB-Family"], info["TCDB-Superfamily"]
                              ])
                            
    # print(family_stats)

    # statsHeader = statsFile.readline().strip().split(',')
    # # tableData.append(headers)
    # stats = {}
    # for line in statsFile:
    #     splitline = line.strip().split(",")
    #     stats[splitline[0]] = splitline[1:]
    # # print(stats)
    # # print(statsHeader)
    # for line in listFile:
    #     #temp_string = '<tr><td>'
    #     splitline = line.strip().split(",")
    #     # tableData.append(splitline)
    #     # <td><a href="/details/{{ cell }}">{{ cell }}</a> </td>
    #     full_id = splitline[0]
    #     if full_id in stats:
    #         # print(stats[full_id])
    #         pcons, proq3, M, N, Meff, ppv, TPR, FPR, tm, fdr = stats[full_id]
    #     else: 
    #         pcons, proq3, M, N, Meff, ppv, TPR, FPR, tm, fdr = [""] * 10
    #     pfam_acc = splitline[0].split('.')[0]
    #     N = splitline[1]
    #     Meff = '{0:.2f}'.format(float(splitline[2])) if len(splitline[2]) > 0 else ''
    #     # pfam_link = '<a href="https://pfam.xfam.org/family/' + pfam_acc + '" target="_blank">' + pfam_acc + '</a>'
    #     pfam_link = '<a href="/details/' + splitline[0] + '">' + pfam_acc + '</a>' if splitline[4] == '1' else pfam_acc
    #     # processed_lines = [temp_string] + splitline[1:3]
    #     # pdb_link = '<a href="http://www.rcsb.org/pdb/search/smartSubquery.do?smartSearchSubtype=PfamIdQuery&pfamID=' + pfam_acc + '" target="_blank">RCSB</a>' if splitline[3] == '1' else 'Missing'
    #     # model_link = '<a href="/details/' + splitline[0] + '">Model</a>' if splitline[4] == '1' else 'Missing'
    #     has_pdb_structure = "Yes" if splitline[3] == '1' else "No"
    #     has_model = "Yes" if splitline[4] == '1' else "No"
    #     if splitline[5] == 'NA':
    #         FDR = ''
    #     elif len(splitline[5]) > 0:
    #         FDR = '{0:.3f}'.format(float(splitline[5]))
    #     else:
    #         FDR = ''
    #     if tm.strip() == 'NA':
    #         fixed_tm = ''
    #     elif len(tm) > 0:
    #         fixed_tm = '{0:.3f}'.format(float(tm))
    #     else:
    #         fixed_tm = ''

    #     # if tm == 'NA':
    #     #     tm = ''
    #     # elif len(tm) > 0:
    #     # else:
    #     #     tm = ''
    #     
    #     clan_acc = splitline[6]
    #     if has_model == "Yes":
    #         processed_lines = [pfam_link, clan_acc, N, Meff, str(FDR), '{0:.3f}'.format(float(pcons)), '{0:.3f}'.format(float(proq3)), str(fixed_tm), has_pdb_structure]
    #         tableData.append(processed_lines)
    #     # temp_string += "</td><td>".join(splitline[1:]) + "</td></tr>"
    #     # tableData.append(temp_string)
    # print(tableData)
    jsondata = json.dumps(tableData)
    return render(request, 'web_CPA/browse.html',{#'headers':headers,
        'tableData': jsondata, 'initial_search': initial_search})

def get_contact(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/contact.html', {})
def get_search(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/search.html', {})
def get_help(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/help.html', {})
def get_news(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/news.html', {})
def get_download(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/download.html', {})
def get_reference(request):
    # return HttpResponse('In help site')
    return render(request, 'web_CPA/reference.html', {})
