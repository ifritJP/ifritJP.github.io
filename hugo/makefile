
INDEX = _index.org

IGNORE_SRCS += tutorial1.org

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
SRCS += arg.org
SRCS += nilable.org
SRCS += closure.org
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
SRCS += lua.org
SRCS += make.org
SRCS += macro.org
SRCS += cast.org
SRCS += subfile.org
SRCS += lazyLoading.org
SRCS += shebang_main.org
SRCS += dir.org
SRCS += go.org
SRCS += go_package.org
SRCS += lua_runtime.org
SRCS += async.org
SRCS += async_old.org
SRCS += luago.org
SRCS += go_study.org
SRCS += lnstags.org
SRCS += reason.org
SRCS += recommend.org
SRCS += completion.org
SRCS += onWeb.org
SRCS += test.org
SRCS += Box.org

SRCS := $(addprefix content/LuneScript/, $(SRCS))
INDEX := $(addprefix content/LuneScript/, $(INDEX))

IGNORE_SRCS := $(addprefix content/LuneScript/, $(IGNORE_SRCS))

HEAD := content/LuneScript/_all.org.head

EXCLUDE = -e '^\#+TITLE:' -e '^\#+AUTHOR:' -e '^\#+date:'
#SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z\@\.]*\. *\(.*\)/-----\n* *\2*/g'
#SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z@\.]* \(.*\) /-----\n* *\2*/g'
SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z@\.]* \(.*[^ ]\)/-----\n* *\2*/g'

help:
	@echo make all
	@echo make concat_all

concat_all:
	@echo $(SRCS) | sed 's@ @\n@g' | sort > dump.list
	find content/LuneScript -iname '*.org' | sort | \
		grep -v -e 'all.org' -e '_index.org' > dump2.list
	diff dump.list dump2.list $(addprefix -I, $(IGNORE_SRCS))

	@echo $(HEAD) $(INDEX) $(SRCS) | \
		../../LuneScript/src/lnsc makeAll.lns shebang > content/LuneScript/all.org


#	cat $(INDEX) | sed 's@\[\[@[[../@g' | cat - $(SRCS) |		\
#		sed 's/^*/**/g'  | sed $(SEDPAT) |			\
#		grep -v $(EXCLUDE) > dump
#	cat $(HEAD) dump > dump2
#
#	mv dump2 content/LuneScript/all.org
#	rm dump

all:
	$(MAKE) concat_all
	hugo

