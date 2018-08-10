#!/bin/bash

for id in $(cat data/IDs_29.0.txt); 
do 
    # echo "$id"
    [ ! -s data/29.0/$id/model.pdb ]
    hasmodel=$?
    # if [ "$hasmodel" = 1 ]; then
    # echo "$hasmodel"
    # fi
    # pdbid=$(grep $id has_pdb.29.0_0.75_E3.txt | cut -d' ' -f3)
    # [ -z "$pdbid" ]
    # haspdb=$?

    match=$(grep $id data/fdr_29.0_* | cut -d':' -f2- | cut -d' ' -f-3)
    fdr=$(grep $id data/fdr_29.0_* | cut -d':' -f2- | cut -d' ' -f4)
    # echo "$match"
    # echo "$fdr"
    m=$(grep $id data/fdr_29.0_* | awk '{print $3}' | sed -e 's/confold_2.5_m50_//g')
    if [ "$hasmodel" = 1 ]; then
        if [ ! -z "$match" ]; then 
            row=$(grep "$match" data/pdb_29.0_dat.glob.txt)
	    if [ ! -z "$row" ]; then
                read pcons proq3 M N Meff ppv TPR FPR tm <<<$(echo "$row" | cut -d' ' -f5,9,17-23)
       	    else
                if [ ! -z "$m" ]; then 
                    read N Meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
                else
                    m="hhE0"
                    read N Meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
                fi
                # read N Meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
                pcons=$(grep "$match" data/pcons_29.0_* | cut -d' ' -f5)
                proq3=$(grep "$match" data/proq3_29.0_* | cut -d' ' -f7)
                M=
                # N=
                # Meff=
                ppv=
                TPR=
                FPR=
                tm=
	    fi
            # read -ra spl_row <<< $row
            # pcons=${spl_row[4]}
            # proq3=${spl_row[8]}
            # M=${spl_row[16]}
            # N=${spl_row[17]}
            # Meff=${spl_row[18]}
            # ppv=${spl_row[19]}
            # TPR=${spl_row[20]}
            # FPR=${spl_row[21]}
            # tm=${spl_row[22]}
            # echo "$row" "$fdr" >> data/stats.txt
        #     read n meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
        # else
        #     m="hhE0"
        #     read n meff <<<$(grep "Meff " data/29.0/$id/*${m}*.gneff | cut -d' ' -f6,9)
            # echo "$row $fdr" 
        echo "$id,$pcons,$proq3,$M,$N,$Meff,$ppv,$TPR,$FPR,$tm,$fdr" > data/29.0/$id/stats.txt
        fi
    fi
# > data/29.0/$id/stats.txt
    # echo $id
done
# id model method stage pcons proq2 proqroscen proqrosfa proq3 model_raw TOTAL BOND ANGLE IMP VDW NOE M N Meff ppv TPR FPR tm
# ID: Pfam identifier (e.g. PF00001.18)
# N: length of representative sequence
# Meff: alignment size in effective sequences
# hasPDB/hasModel: boolean if family has structure in PDB/predicted structure
# FDR: false discovery rate of predicted structure
echo "ID,pcons,proq3,M,N,Meff,ppv,TPR,FPR,tm,fdr" > data/stats.txt
# cat data/29.0/*/info.txt >> list.txt
# echo "$(head -1 data/pdb_29.0_dat.glob.txt) fdr" > data/stats.txt
cat data/29.0/*/stats.txt >> data/stats.txt
