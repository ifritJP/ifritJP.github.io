{
    var initialized = false;
    var idSeed = 0;

    var lnsFrontIdMap = {};

    function runLnsCode( element, codeNo ) {
        function openFront() {
            idSeed++;
            
            var frontDiv = document.createElement( "div" );
            frontDiv.spellcheck = false;
            var warnEle = document.createElement( "div" );
            warnEle.innerHTML = "初回 Run は時間がかかります。" +
                "以下の textarea は編集可能です。" +
                "編集後に Run すると、編集した内容を実行します。";
            warnEle.style.color = "#f00";
            warnEle.style.textDecorationLine = "blink";
            var lnsCodeEle = document.createElement( "textarea" );
            lnsCodeEle.class = "lnsFront";
            lnsCodeEle.id = "lns-code-" + idSeed;
            lnsCodeEle.value = element.innerText;
            lnsCodeEle.style.width = "100%";
            lnsCodeEle.rows = 10;
            var lineNo = lnsCodeEle.value.split("\n").length;
            if ( lineNo < lnsCodeEle.rows ) {
                lnsCodeEle.rows = lineNo;
            }
            var outputEle = document.createElement( "textarea" );
            outputEle.readOnly = true;
            outputEle.id = "output-" + idSeed;
            outputEle.style.width = "100%";
            outputEle.rows = 5;
            frontDiv.appendChild( warnEle );
            frontDiv.appendChild( lnsCodeEle );
            frontDiv.appendChild( document.createElement( "br" ) );

            frontDiv.appendChild( outputEle );
            element.appendChild( frontDiv );

            lnsFrontIdMap[ codeNo ] =
                lnsFront.setup( outputEle.id, "", lnsCodeEle.id, "" );
        }

        
        if ( !initialized ) {
            initialized = true;
            var script = document.createElement( "script" );
            script.type = "text/javascript";
            script.src = "https://ifritjp.github.io/LuneScript-webFront/contents/lunescript-front.js";
            script.addEventListener( "load", function() {
                openFront();
            });
            document.head.appendChild( script );
        }
        else {
            if ( lnsFrontIdMap[ codeNo ] == null ) {
                openFront();
            }
            else {
                lnsFront.compile( lnsFrontIdMap[ codeNo ] );
            }
        }
    }


    var codeNo = 0;
    window.addEventListener( "load",function() {
        Array.from( document.getElementsByClassName( "src-lns" ) ).forEach( function( element ) {
            if ( element.innerText.indexOf( "@lnsFront: ok" ) == -1 &&
                 element.innerText.indexOf( "@lnsFront: error" ) == -1 ) {
                return;
            }
            codeNo++;
            //element.appendChild( document.createElement( "br" ) );

            var button = document.createElement( "input" );
            button.type = "button";
            button.value = "Run";
            button.addEventListener( "click", function ( workElement, workCodeNo ) {
                return function() {
                    runLnsCode( workElement, workCodeNo );
                };
            }( element, codeNo ) );
            element.appendChild( button );
        });
        Array.from( document.getElementsByClassName( "language-dot" ) ).forEach( function( element ) {
            element.display = none;
        });
    } );
}
