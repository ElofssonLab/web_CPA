import sys
from os import path
import re
import glob
# import urllib.request
# from urllib.error import HTTPError

if len(sys.argv) != 2:
    print("Error, takes a subfamily folder as input")

in_folder = sys.argv[1].rstrip('/')
pdbURL = "https://files.rcsb.org/download/"
sf_id = in_folder.split('/')[-1]
# colors = ["0x6495ED", "'blue'", "0xF08080", "'red'"]
colors = {'N-broken-core-5':"0x800080",
          'N-broken-core-6':"0x6495ED",
          'N-broken-core-7':"0xE60073",
          'N-reentrant-core-5':"0x6495ED",
          'N-reentrant-core-6':"0x008000",
          'N-reentrant-core-7':"0x6495ED",
          'N-broken-scaffold-5':"0x800000",
          'N-broken-scaffold-6':"0x800000",
          'N-broken-scaffold-7':"0x800000",
          'N-reentrant-scaffold-5':"0x800000",
          'N-reentrant-scaffold-6':"0x800000",
          'N-reentrant-scaffold-7':"0x800000",
          'C-broken-core-5':"0x800080",
          'C-broken-core-6':"0x6495ED",
          'C-broken-core-7':"0xE60073",
          'C-reentrant-core-5':"0x6495ED",
          'C-reentrant-core-6':"0x008000",
          'C-reentrant-core-7':"0x6495ED",
          'C-broken-scaffold-5':"0x800000",
          'C-broken-scaffold-6':"0x800000",
          'C-broken-scaffold-7':"0x800000",
          'C-reentrant-scaffold-5':"0x800000",
          'C-reentrant-scaffold-6':"0x800000",
          'C-reentrant-scaffold-7':"0x800000"}
topo_colors = ["0xFFFF80", "0x99FFFF"]

case_string = ''
helices = ''
topo_file = in_folder + "/" + sf_id + ".rtopo" 
heir_file = in_folder + "/heirarchy.txt"
pdb_file = glob.glob(in_folder + "/*.pdb")
pdb_id = ''

with open(heir_file) as heir_handle:
    for line in heir_handle:
        if line.startswith("N-core"):
            temp = line.strip().split(':')[1].split('-')
            if len(temp) > 1:
                n_start, n_stop = [int(i) for i in temp]
            else:
                n_start = n_stop = int(temp[0])
            n_core_range = range(n_start, n_stop+1)
        elif line.startswith("N-Scaffold"):
            temp = line.strip().split(':')[1].split('-')
            if len(temp) > 1:
                n_start, n_stop = [int(i) for i in temp]
            else:
                n_start = n_stop = int(temp[0])
            n_scaff_range = range(n_start, n_stop+1)
        elif line.startswith("C-core"):
            temp = line.strip().split(':')[1].split('-')
            if len(temp) > 1:
                c_start, c_stop = [int(i) for i in temp]
            else:
                c_start = c_stop = int(temp[0])
            c_core_range = range(c_start, c_stop+1)
        elif line.startswith("C-Scaffold"):
            temp = line.strip().split(':')[1].split('-')
            if len(temp) > 1:
                c_start, c_stop = [int(i) for i in temp]
            else:
                c_start = c_stop = int(temp[0])
            c_scaff_range = range(c_start, c_stop+1)
        elif line.startswith("Fold-type"):
            fold_type = line.strip().split(":")[-1]
            if len(fold_type.split(' ')) > 1:
                fold_nr = fold_type.split(' ')[0]
                fold_subtype = fold_type.split(' ')[2]
        elif line.startswith("PDB"):
            pot_pdb = line.strip().split(":")
            if len(pot_pdb[1]) > 1:
                # Need to fetch pdb
                pdb_id = pot_pdb[1].split('(')[0]
                # print(pdb_id)
# N-Scaffold:1-4
# N-core:5-7
# N-repeat:1-7
# C-Scaffold:8-10
# C-core:11-13
# C-repeat:8-13
if not pdb_file:
    print("Need structures for the following:")
    print("{}: {}".format(sf_id, pdb_id))
    # try:
    #     urllib.request.urlretrieve(pdbURL + pdb_id + '.pdb', in_folder + '/' + sf_id + '_struct.pdb')
    # except HTTPError as err:
    #     print("{} not exists, skipping...".format(pdb_id), file=sys.stderr)
if not path.exists(topo_file):
    topo_file = in_folder + "/" + sf_id + ".btopo" 
if not path.exists(topo_file):
    topo_file = in_folder + "/" + sf_id + ".topo" 

with open(topo_file) as in_file:
    in_file.readline()  # Read header line
    topo = in_file.readline().strip()
    s_color_start = 1
    s_color_end = len(topo)
    p = re.compile("M+")
    m = p.finditer(topo)
    for i, match in enumerate(m):
        s_color_index = match.start() - 1
        s_color = 0 if topo[s_color_index] == 'i' else 1
        case_string += "case (atom.resi>=" + str(s_color_start) + " && atom.resi<=" + str(match.start()) + "):\n"
        case_string += "return {}\n".format(topo_colors[s_color])
        s_color = (s_color + 1) % 2

        if (i+1) in n_core_range:
            color = colors['N-' + fold_subtype + '-core-' + fold_nr]
            helices  += "N-core " + " {} ".format(i+1) + str(match.start() + 1) + " " + str(match.end()) + '\n'
        elif (i+1) in c_core_range:
            color = colors['C-' + fold_subtype + '-core-' + fold_nr]
            helices += "C-core " + " {} ".format(i+1) + str(match.start() + 1) + " " + str(match.end()) + '\n'
        elif (i+1) in n_scaff_range:
            color = colors['N-' + fold_subtype + '-scaffold-' + fold_nr]
            helices += "N-scaff " + " {} ".format(i+1) + str(match.start() + 1) + " " + str(match.end()) + '\n'
        elif (i+1) in c_scaff_range:
            color = colors['C-' + fold_subtype + '-scaffold-' + fold_nr]
            helices += "C-scaff " + " {} ".format(i+1) + str(match.start() + 1) + " " + str(match.end()) + '\n'
        # case (atom.resi>=231 && atom.resi<=251):
        #     return 0xF08080
        case_string += "case (atom.resi>=" + str(match.start() + 1) + " && atom.resi<=" + str(match.end()) + "):\n"
        case_string += "return {}\n".format(color)
        s_color_start = match.end() +  1
    # Final coloring of the last part of the chain after the last helix
    case_string += "case (atom.resi>=" + str(s_color_start) + " && atom.resi<=" + str(s_color_end) + "):\n"
    case_string += "return {}\n".format(topo_colors[s_color])

case_string += "default: return 'white'\n"
with open(in_folder + "/" + sf_id + "_cases.txt", 'w') as out_file:
    out_file.write(case_string)
with open(in_folder + "/" + sf_id + "_buttons.txt", 'w') as out_file:
    out_file.write(helices)
