#!/usr/bin/python
#encoding=utf-8

import os
import sys

path = sys.argv[0]

dirname = os.path.dirname(path)

basename = os.path.basename(dirname)

if basename.lower() == "server":
	dirname = os.path.dirname(dirname)
	basename = os.path.basename(dirname)

if os.path.exists("config"):
	for parent,dirnames,filenames in os.walk("config"):
		for filename in filenames:
			os.system("start \"" + basename + filename[len("gameconfig"):] + "\" node app.js \"./" + parent + "/" + filename + "\"")
else:
	os.system("start node app.js")