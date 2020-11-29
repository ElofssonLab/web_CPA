#!/bin/bash
while read d; 
do echo $d; python calculate_topos.py data/CPA/$d; done <data/CPA/protein_list.txt

# for d in `ls -d data/CPA/*/`; do python calculate_topos.py $d; done
