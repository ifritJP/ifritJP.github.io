{
    window.addEventListener( "load",function() {

        hljs.registerLanguage("lns", function (e) {
            const KEYWORDS = {
                type: "int real str bool stem form List Map Set __exp __ Mapping",
                keyword: "fn macro let and return if when then else elseif" +
                    " proto extend abstract pub pro pri local static non" +
                    " override advertise" +
                    " __init" +
                    " unwrap default mut new" +
                    " as provide" +
                    " subfile use owner" +
                    " class interface module require" +
                    " enum alge match switch case" +
                    " for foreach forsort while in not or repeat until _",
                built_in: '_G _ENV super self _exp' +
                    ' __func__ __line__ __mod__ type __var',
                const_val: "true false nil",
                meta: '_lune_control __luago __async __noasync __asyncLock __unsafe'
            };            
            
            const OPE = {
                className: 'operator',
                begin: /`{|,,,,|,,,|,,|\.\.|[=|\+\*\-\?&~<>:$#]|\(@|\[@|@@@|@@=|@@/
            };

            return {
                case_insensitive: false,
                keywords: KEYWORDS,
                contains: [
                    {
                        className: "comment",
                        begin: /^#!/,
                        end: /$/
                    },
                    {
                        className: "keyword",
                        begin: /import\.l|import\.d|import/
                    },
                    {
                        className: "meta",
                        begin: /\.\.\.|!/
                    },
                    OPE,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    hljs.C_NUMBER_MODE,
                    {
                        className: 'string',
                        contains: [hljs.BACKSLASH_ESCAPE],
                        variants: [
                            {
                                begin: /```/, end: /```/,
                                contains: [hljs.BACKSLASH_ESCAPE]
                            },
                            {
                                begin: /'/, end: /'/,
                                relevance: 10
                            },
                            {
                                begin: /"/, end: /"/,
                                relevance: 10
                            },
                            hljs.APOS_STRING_MODE,
                            hljs.QUOTE_STRING_MODE                            
                        ]
                    }
                ]
            }; } );

        
        Array.from( document.getElementsByClassName( "language-lns" ) ).forEach( function( element ) {
            hljs.highlightBlock( element );
        });
    });
}
