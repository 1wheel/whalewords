import json
import sys
import nltk
from sys import stdout

f = open('text')
text = f.read()
chapters = text.split('\nCHAPTER')

chapterTitles = []
chapterStarts = []
for i in range(len(chapters)):
	chapterTitles.append(chapters[i].split('.')[1][1:])
	chapterStarts.append(text.find(chapters[i]))

#use nltk for word frequency; set everything to lower case and remove periods
text1 = nltk.Text(nltk.word_tokenize(text.lower().replace('.', ' ')))
freq = nltk.FreqDist(text1)

f = open('stopwords')
lines = f.readlines()
for l in lines:
	try:
		freq.pop(l[:-1])
	except Exception:
		print 'Exception'

fKeys = freq.keys()
fValues = freq.values()

mobydick = {'text': text, 'chapterTitles': chapterTitles, 'chapterStarts': chapterStarts, 'fKeys': fKeys, 'fValues': fValues}
json.dump(mobydick, open('webpage/mobydick.json', 'wb'))