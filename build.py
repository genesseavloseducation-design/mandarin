import re
r=lambda f: open(f,encoding='utf-8').read()
h=r('src/shell.html')
for k,f in [('STYLE','src/style.css'),('DATA','src/js/data.js'),('PHRASES','src/js/phrases.js'),('PHRASES2','src/js/phrases2.js'),('HANZI','src/js/hanzi-data.js'),('SPEECH','src/js/speech.js'),('STROKES','src/js/strokes.js'),('APP','src/js/app.js')]:
    h=h.replace('/*%s*/'%k, r(f))
assert '</script>' not in r('src/js/app.js')
open('index.html','w',encoding='utf-8').write(h)
print('built', len(h))
