function lnsOStream( txt ) {
    var console = document.getElementById( "console" );
    console.value += txt;
}

function luaOStream( txt ) {
    var console = document.getElementById( "console" );
    console.value += txt;
}


function setLuaCode( code ) {
    var luaCode = document.getElementById( "lua-code" );
    luaCode.value = code;
}


function compile() {
    document.getElementById( "console" ).value = "";
    document.getElementById( "lua-code" ).value = "";
    
    var editor = document.getElementById( "lns-code" );

    var stackTop = fengari.lua.lua_gettop( fengari.L );

    fengari.load( fengari.to_luastring(
	"package.path='\"./lua/5.3/?/init.lua;./?.lua;\"'") )();
    
    if ( fengari.lauxlib.luaL_loadfile(
    	fengari.L, fengari.to_luastring( "lns.lua" ) ) != fengari.lua.LUA_OK )
    {
    	console.log( fengari.to_jsstring( fengari.lua.lua_tostring( fengari.L, -1 ) ) );
    }
    else {
	fengari.lua.lua_pushstring( fengari.L, fengari.to_luastring( editor.value ) );
    	if ( fengari.lua.lua_pcall( fengari.L, 1, 0, 0 ) != fengari.lua.LUA_OK ) {
    	    console.log( fengari.to_jsstring( fengari.lua.lua_tostring( fengari.L, -1 ) ) );
	}
    }

    fengari.lua.lua_settop( fengari.L, stackTop );
};

// LuneScript の lua ファイルを格納するマップ。
// modName -> lua コード
var lnsLibCodeMap = {};

// modName で指定されたモジュールのコードを返す。
// lua コードからコールされる。
function getLnsLibCode( modName ) {
    if ( lnsLibCodeMap[ modName ] ) {
	return lnsLibCodeMap[ modName ];
    }
    return "";
}

// LuneScript の lua ファイルを読み込み、lnsLibCodeMap に格納する
function loadLnsLibCode( modName, path ) {
    var fileReq = new XMLHttpRequest();
    fileReq.addEventListener("load", function( event ) {
    	lnsLibCodeMap[ modName ] = fileReq.response;
	if ( isReadyLnsLibCode() ) {
	    compile();
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

window.addEventListener( "load",function() {
    document.getElementById( "convert" ).onclick = function() {
	if ( isReadyLnsLibCode() ) {
	    compile();
	}
	else {
	    alert( "not ready" );
	}
    };
    
    // LuneScript の lua ファイルを読み込んでおくために、
    // lunescript-main-1.rockspec から全ファイル構成を取得する
    var xmlReq = new XMLHttpRequest();
    xmlReq.addEventListener("load", function( event ) {
    	const regexp = RegExp( '(lune.base.\\w+).*"src/(lune/base/[\\w\.]+)"', 'g' );

    	for ( match of xmlReq.response.matchAll( regexp ) ) {
    	    var path = match[2];
	    var module = match[1];
    	    lnsLibCodeMap[ module ] = false;
    	};

	// loadLnsLibCode する前に、lnsLibCodeMap をセットしておく
    	for ( match of xmlReq.response.matchAll( regexp ) ) {
    	    var path = match[2];
	    var module = match[1];
	    loadLnsLibCode( module, path );
    	};
    });
    xmlReq.open( "GET", "lunescript-main-1.rockspec");
    xmlReq.send();
}, false );
