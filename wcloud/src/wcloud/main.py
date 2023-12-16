import MeCab
import unidic
from wordcloud import WordCloud
import os
import os.path
import random

cab = MeCab.Tagger( unidic.DICDIR )

exclude = (
    "OPTIONS",
    "LAYOUT",
    "POST",
    "TAGS",
    "BEGIN",
    "END",
    "SRC",
    "TITLE",
    "AUTHOR",
    "こと"
)

def getWordList( txt ):
    node = cab.parseToNode( txt )
    word_list = []
    
    
    while node:
        feature = node.feature.split( ',' )
        if feature[ 0 ] == "名詞" and feature[ 2 ] != "副詞可能" and feature[ 1 ] != "数詞":
            if node.surface in exclude:
                None
            else:
                #print( node.surface, feature )
                word_list.append( node.surface )
    
        node = node.next
    return word_list

def getWordListFromFile( path ):
    txt = open( path, "r" ).read()
    return getWordList( txt )

def getFilePaths( path ):
    path_list = []
    for basefile in os.listdir( path ):
        full_path =  os.path.join( path, basefile )
        if os.path.isfile( full_path ):
            if basefile[ -4: ] == ".org":
                path_list.append( full_path )
        elif os.path.isdir( full_path ):
            path_list.extend( getFilePaths( full_path ) )
    return path_list

word_list = []
for file_path in getFilePaths( "../blog2/content/posts/" ):
    word_list.extend( getWordListFromFile( file_path ) )

freq = {}
for word in word_list:
    num = freq.get( word, 0 )
    num = num + 1
    freq[ word ] = num

values = list( freq.values() )
values.sort()
values.reverse()
    
freq[ "LuneScript" ] = freq[ "LuneScript" ] + values[0] * 2

def color_func( word, font_size, *args, **kwargs ):
    if word == "LuneScript":
        return (200,100,0)
    return (random.randint( 0, 205),
            random.randint( 0, 205),
            random.randint( 0, 205))

font = "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf"
wc = WordCloud( width = 300, height = 400, color_func = color_func,
                font_path = font, background_color="white" ).generate_from_frequencies( freq )
wc.to_file( "../blog2/static/wc.png" )
