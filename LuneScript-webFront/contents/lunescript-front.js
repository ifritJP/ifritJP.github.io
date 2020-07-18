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

window.onload = function() {

    var compile = function() {
	document.getElementById( "console" ).value = "";
	document.getElementById( "lua-code" ).value = "";
	
	var editor = document.getElementById( "lns-code" );

	var stackTop = fengari.lua.lua_gettop( fengari.L );

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

    document.getElementById( "convert" ).onclick = function() {
	compile();
    };
}
