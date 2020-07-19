var lnsFront = {
};
lnsFront.lnsOStream = null;
lnsFront.luaOStream = null;
lnsFront.setLuaCode = null;
lnsFront.getLnsLibCode = null;
lnsFront.setup = null;

{
    var executeEle;
    var idSeed = 0;
    var id2Elements = {};
    // LuneScript の lua ファイルを格納するマップ。
    // modName -> lua コード
    var lnsLibCodeMap = {};

    
    
    function compile( frontId ) {
        id2Elements[ frontId ].consoleEle.value = "";
        id2Elements[ frontId ].luaCodeEle.value = "";
        
        var editor = id2Elements[ frontId ].lnsCodeEle;

        var stackTop = fengari.lua.lua_gettop( fengari.L );

        if ( fengari.lauxlib.luaL_loadstring(
    	    fengari.L, fengari.to_luastring( lnsLibCodeMap[ "lns" ] ) ) != fengari.lua.LUA_OK )
        {
    	    console.log( fengari.to_jsstring( fengari.lua.lua_tostring( fengari.L, -1 ) ) );
        }
        else {
	    fengari.lua.lua_pushinteger( fengari.L, frontId );
	    fengari.lua.lua_pushstring( fengari.L, fengari.to_luastring( editor.value ) );
    	    if ( fengari.lua.lua_pcall( fengari.L, 2, 0, 0 ) != fengari.lua.LUA_OK ) {
    	        console.log( fengari.to_jsstring( fengari.lua.lua_tostring( fengari.L, -1 ) ) );
	    }
        }

        fengari.lua.lua_settop( fengari.L, stackTop );
    };

    // modName で指定されたモジュールのコードを返す。
    // lua コードからコールされる。
    lnsFront.getLnsLibCode = function( frontId, modName ) {
        if ( lnsLibCodeMap[ modName ] ) {
	    return lnsLibCodeMap[ modName ];
        }
        return "";
    };

    // LuneScript の lua ファイルを読み込み、lnsLibCodeMap に格納する
    function loadLnsLibCode( frontId, modName, path ) {
        var fileReq = new XMLHttpRequest();
        fileReq.addEventListener("load", function( event ) {
    	    lnsLibCodeMap[ modName ] = fileReq.response;
	    if ( isReadyLnsLibCode() ) {
	        compile( frontId );
	    }
        });
        fileReq.open( "GET", path );
        fileReq.send();
    }

    // LuneScript の 全ての lua ファイルを読み込み済みか確認する
    function isReadyLnsLibCode() {
        var ready = true;
        Object.keys(lnsLibCodeMap).forEach( function( key ) {
	    if ( !lnsLibCodeMap[ key ] || lnsLibCodeMap[ key ] == "" ) {
	        ready = false;
	    }
        });
        return ready;
    }

    function preloadLnsCode( frontId ) {
        // LuneScript の lua ファイルを読み込んでおくために、
        // lunescript-main-1.rockspec から全ファイル構成を取得する
        var xmlReq = new XMLHttpRequest();
        xmlReq.addEventListener("load", function( event ) {
    	    const regexp = RegExp( '(lune.base.\\w+).*"src/(lune/base/[\\w\.]+)"', 'g' );

    	    lnsLibCodeMap[ "lns" ] = false;
    	    for ( match of xmlReq.response.matchAll( regexp ) ) {
    	        var path = match[2];
	        var module = match[1];
    	        lnsLibCodeMap[ module ] = false;
    	    };

	    loadLnsLibCode( frontId, "lns", "lns.lua" );
	    // loadLnsLibCode する前に、lnsLibCodeMap をセットしておく
    	    for ( match of xmlReq.response.matchAll( regexp ) ) {
    	        var path = match[2];
	        var module = match[1];
	        loadLnsLibCode( frontId, module, path );
    	    };
        });
        xmlReq.open( "GET", "lunescript-main-1.rockspec");
        xmlReq.send();
        
    }

    lnsFront.setup = function( consoleId, luaCodeId, lnsCodeId, executeId ) {
        idSeed++;
        var frontId = idSeed;
        if ( frontId == 1 ) {
            preloadLnsCode( frontId );
        }


        var elements = {};
        id2Elements[ frontId ] = elements;
        elements.consoleEle = document.getElementById( consoleId );
        elements.luaCodeEle = document.getElementById( luaCodeId );
        elements.lnsCodeEle = document.getElementById( lnsCodeId );
        elements.executeEle = document.getElementById( executeId );

        
        lnsFront.lnsOStream = function( id, txt ) {
            id2Elements[ id ].consoleEle.value += txt;
        };
        lnsFront.luaOStream = function( id, txt ) {
            id2Elements[ id ].consoleEle.value += txt;
        };
        lnsFront.setLuaCode = function( id, code ) {
            id2Elements[ id ].luaCodeEle.value = code;
        };
        elements.executeEle.onclick = function() {
	    if ( isReadyLnsLibCode() ) {
	        compile( frontId );
	    }
	    else {
	        alert( "not ready" );
	    }
        };
        
        
        
        var url = new URL( document.location );
        var urlSearch = new URLSearchParams( url.search );
        var console = id2Elements[ frontId ].consoleEle;
        if ( urlSearch.has( "param") ) {
            elements.lnsCodeEle.value = urlSearch.get( "param");
        }
    };
}
