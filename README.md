### CPAfold ###

To run, clone the main repo recursively to include data subrepo,  `git clone --recursive https://github.com/ElofssonLab/web_CPA`
(In two steps: `git clone https://github.com/ElofssonLab/web_CPA` Update the data submodule `git submodule init`, `git submodule update`)

Run `create_env.sh` to create the virtual environment and activate it using `source /env/bin/activate`

Run the server with `python manage.py runserver`

The website will now be available at localhost:8080
