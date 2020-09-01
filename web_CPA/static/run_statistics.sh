#!/bin/bash
for d in `ls -d data/CPA/*/`; do python calculate_topos.py $d; done
