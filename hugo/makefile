
INDEX = _index.ja.org

IGNORE_SRCS += tutorial1.ja.org

SRCS += tutorial2.setup.ja.org
SRCS += tutorial3.hello.ja.org
SRCS += crosscompile.ja.org
SRCS += value.ja.org
SRCS += set.ja.org
SRCS += enum.ja.org
SRCS += match.ja.org
SRCS += variable.ja.org
SRCS += branch.ja.org
SRCS += loop.ja.org
SRCS += func.ja.org
SRCS += multipleRetVal.ja.org
SRCS += defaultArg.ja.org
SRCS += arg.ja.org
SRCS += nilable.ja.org
SRCS += closure.ja.org
SRCS += class1.ja.org
SRCS += class2accessor.ja.org
SRCS += classInherit.ja.org
SRCS += classAdvertise.ja.org
SRCS += classOverride.ja.org
SRCS += interface.ja.org
SRCS += classMapping.ja.org
SRCS += generics.ja.org
SRCS += nilcond.ja.org
SRCS += import.ja.org
SRCS += require.ja.org
SRCS += glue.ja.org
SRCS += lua.ja.org
SRCS += make.ja.org
SRCS += macro.ja.org
SRCS += cast.ja.org
SRCS += subfile.ja.org
SRCS += lazyLoading.ja.org
SRCS += shebang_main.ja.org
SRCS += dir.ja.org
SRCS += go.ja.org
SRCS += go_package.ja.org
SRCS += lua_runtime.ja.org
SRCS += async.ja.org
SRCS += async_old.ja.org
SRCS += luago.ja.org
SRCS += go_study.ja.org
SRCS += go_wasm.ja.org
SRCS += lnstags.ja.org
SRCS += reason.ja.org
SRCS += recommend.ja.org
SRCS += completion.ja.org
SRCS += onWeb.ja.org
SRCS += test.ja.org
SRCS += Box.ja.org
SRCS += design.ja.org
SRCS += design-2.ja.org
SRCS += design-3.ja.org

SRCS := $(addprefix content/LuneScript/, $(SRCS))
INDEX := $(addprefix content/LuneScript/, $(INDEX))
EN_SRCS := $(patsubst %.ja.org,%.en.org,$(SRCS) $(INDEX))

IGNORE_SRCS := $(addprefix content/LuneScript/, $(IGNORE_SRCS))

HEAD := content/LuneScript/_all.org.head

EXCLUDE = -e '^\#+TITLE:' -e '^\#+AUTHOR:' -e '^\#+date:'
#SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z\@\.]*\. *\(.*\)/-----\n* *\2*/g'
#SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z@\.]* \(.*\) /-----\n* *\2*/g'
SEDPAT = 's/^\#+\(TITLE\|title\):[ 0-9A-Z@\.]* \(.*[^ ]\)/-----\n* *\2*/g'

help:
	@echo make all
	@echo make concat_all
	@echo make trans
	@echo make clean-trans

clean-trans:
	@rm $(EN_SRCS)

trans: $(EN_SRCS)

%.en.org: %.ja.org
	../../trans-orgmode/trans-orgmode trans \
		-c ../../trans-org-accesstoken.json $< > $@ -m

concat_all:
	@echo $(SRCS) | sed 's@ @\n@g' | sort > dump.list
	find content/LuneScript -iname '*.ja.org' | sort | \
		grep -v -e 'all.ja.org' -e '_index.ja.org' > dump2.list
	diff dump.list dump2.list $(addprefix -I, $(IGNORE_SRCS))

	@echo $(HEAD) $(INDEX) $(SRCS) | \
		../../LuneScript/src/lnsc makeAll.lns shebang > content/LuneScript/all.ja.org


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

