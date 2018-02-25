#!/usr/bin/python
#encoding=utf-8

import os

if not os.path.exists("node_modules"):
	os.system("npm update")

# if os.path.exists("config"):
# 	for parent,dirnames,filenames in os.walk("config"):
# 		for filename in filenames:
# 			os.system("taskkill /im node.exe /f /fi \"windowtitle eq " + filename + "\"")
mCmd =  "taskkill /im node.exe /F"
os.system(mCmd)

