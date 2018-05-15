for f in $(ls data/29.0/);do if [ -f data/29.0/$f/model.pdb ]; then ./make_CB_map.py data/29.0/$f/model.pdb data/29.0/$f/model.dmap; fi; done

