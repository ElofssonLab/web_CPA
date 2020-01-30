#!/bin/bash

for id in $(cat data/IDs_29.0.txt); 
do 
    [ ! -s data/29.0/$id/model.pdb ]
    hasmodel=$?

    pdbid=$(grep $id data/has_pdb.29.0_0.75_E3.txt | cut -d' ' -f3)
    [ -z "$pdbid" ]
    haspdb=$?

    fdr=$(grep $id data/fdr_29.0_* | cut -d' ' -f4)

    m=$(grep $id data/fdr_29.0_* | awk '{print $3}' | sed -e 's/confold_2.5_m50_//g')
    if [ ! -z "$m" ]; then 
        read n meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
    else
        m="hhE0"
        read n meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
    fi
    echo "$id,$n,$meff,$haspdb,$hasmodel,$fdr" > data/29.0/$id/info.txt; 
    echo $id
done

# ID: Pfam identifier (e.g. PF00001.18)
# N: length of representative sequence
# Meff: alignment size in effective sequences
# hasPDB/hasModel: boolean if family has structure in PDB/predicted structure
# FDR: false discovery rate of predicted structure
echo "ID,N,Meff,hasPDB,hasModel,FDR" > list.txt
cat data/29.0/*/info.txt >> list.txt
