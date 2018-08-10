
### USAGE ####
### ./make_CB_map.py input.pdb [output.dmap] 


import sys,re
from math import sqrt

GLY = re.compile("ATOM.{9}CA..GLY")
CB = re.compile("ATOM.{9}CB")
#ATOM   2439  CB  TYR   250      -3.915  -0.288  -3.247  1.00  0.00           C
#CB_ext = re.compile(".{21}\([ 0-9]{4}\).{4}\(.{8}\)\(.{8}\)\(.{8}\)")
CB_ext = re.compile(".{22}([ 0-9]{4}).{4}(.{8})(.{8})(.{8})")

aas = []
with open(sys.argv[1]) as pdb:
    for line in pdb:
        if GLY.match(line):
            ri,x,y,z = CB_ext.findall(line)[0]
            aas.append((int(ri),float(x),float(y),float(z)))
        elif CB.match(line):
            ri,x,y,z = CB_ext.findall(line)[0]
            aas.append((int(ri),float(x),float(y),float(z)))
            
# print len(aas),aas

def distance(r1,r2):
    return sqrt((r1[1]-r2[1])**2+(r1[2]-r2[2])**2+(r1[3]-r2[3])**2)


outname = sys.argv[2] if len(sys.argv)>2 else sys.argv[1]+".dmap"
with open(outname,"w") as out:
    for i,r1 in enumerate(aas):
        for r2 in aas[i+1:]:
#            print r1,r2
            out.write("{} {} {}\n".format(r1[0],r2[0],distance(r1,r2)))
        
