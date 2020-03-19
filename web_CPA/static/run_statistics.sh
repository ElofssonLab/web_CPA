#!/bin/bash
for d in `ls data/CPA/`; do python calculate_topos.py data/CPA/$d; done
