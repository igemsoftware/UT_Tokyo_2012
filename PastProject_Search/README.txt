README_PastProjectSearch.txt

For a basic description of Past Project Search, please visit : 
http://2012.igem.org/Team:UT-Tokyo-Software/Project/PastProjectSearch

To use Past Project Search locally , you have to do the following steps.

Or you can use this software on your browser without download : 
http://igem-ut.net/ppsearch/

***
Usage
***

Past Project Search is a web application written in Python.
In order to run this application locally or deploy this application on your server,
you need to do the following as a preparation:



0. Install Python

As Past Project Search is written in python, you need to install Python 2.7 on your computer.
On Mac OS X and Linux, python is usually installed by default.



1. Install and run elasticsearch

Past Project Search uses elasticsearch as a search engine and thus you need to
install and run elasticsearch to run Past Project Search.

Latest version of elasticsearch can be found at
http://www.elasticsearch.org/download/

Install and launch elasticsearch.
elasticsearch uses TCP port 9200 to communicate with other softwares.



2. Populate the Past Project index

You need to feed Past Project data to elasticsearch in order to perform search
using it.
To do this, first you need to edit the es.py.
In the top part of the es.py, you can find that YEAR='2007' is written.
You need to change the value of YEAR as the data you want to feed.
Then execute:

$ python es.py

Note that "es.py" depends on the following packages:
pyes, wikimarkup

Install them using easy_install or pip before running "es.py".



3. Launch the server-side application

Now, you can launch the Past Project Search server-side script on your computer.

$ python pr/pr.py

"pr.py" depends on web.py and pyes and so you need to install them beforehand.
The http server will run on port 8080.



4. Test with your browser

Launch your favorite browser and type in the address bar "localhost:8080" and hit enter.
You will see Past Project Search running on your computer.



5. Deploy to your server

You can deploy this application to your own server.
Past Project Search is a WSGI web application based on web.py framework.

You can refer to the link below for how to deploy the app:
http://webpy.org/install

