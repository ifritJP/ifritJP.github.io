local arg = ...

local js = require( 'js' )

local lnsStreamObj = {
   write = function( self, txt )
      js.global:lnsOStream( txt )
   end
}
io = {
   stdout = lnsStreamObj,
   stderr = lnsStreamObj,
}

local front = require( 'lune.base.front' )
local luaCode = front.convertLnsCode2LuaCode( arg, "lnsweb.lns" )

js.global:setLuaCode( luaCode )

local newEnv = {}
for key, val in pairs( _ENV ) do
   if key == "print" then
      newEnv[ key ] = function( ... )
	 local args = { ... }
	 for index, printVal in ipairs( args ) do
	    js.global:luaOStream( string.format( "%s", printVal ) .. "\t" )
	 end
	 js.global:luaOStream( "\n" )
      end
   else
      newEnv[ key ] = val
   end
end

local luaStreamObj = {
   write = function( self, txt )
      js.global:luaOStream( txt )
   end
}
newEnv[ "io" ] = {
   stdout = luaStreamObj,
   stderr = luaStreamObj,
}


load( luaCode, "lnsweb.lua", "t", newEnv )()
