
SRCS += _index.org
SRCS += tutorial1.org
SRCS += tutorial2.setup.org
SRCS += tutorial3.hello.org
SRCS += crosscompile.org
SRCS += value.org
SRCS += set.org
SRCS += enum.org
SRCS += match.org
SRCS += variable.org
SRCS += branch.org
SRCS += loop.org
SRCS += func.org
SRCS += multipleRetVal.org
SRCS += defaultArg.org
SRCS += nilable.org
SRCS += class1.org
SRCS += class2accessor.org
SRCS += classInherit.org
SRCS += classAdvertise.org
SRCS += classOverride.org
SRCS += interface.org
SRCS += classMapping.org
SRCS += generics.org
SRCS += nilcond.org
SRCS += import.org
SRCS += require.org
SRCS += glue.org
SRCS += make.org
SRCS += macro.org
SRCS += cast.org
SRCS += subfile.org
SRCS += reason.org
SRCS += recommend.org
SRCS += completion.org

SRCS := $(addprefix content/LuneScript/, $(SRCS))

HEAD := content/LuneScript/_all.org.head

EXCLUDE = -e '^\#+TITLE:' -e '^\#+AUTHOR:' -e '^\#+date:'
SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z]*\. *\(.*\)/-----\n* *\2*/g'

all:
	cat $(SRCS) | sed 's/^*/**/g'  | sed $(SEDPAT) | grep -v $(EXCLUDE) > dump
	cat $(HEAD) dump > dump2

	mv dump2 content/LuneScript/all.org
	rm dump
	hugo

