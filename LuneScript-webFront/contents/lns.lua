local lnsCode = ...


local js = require( 'js' )

-- require で lns のライブラリを逐次ロードしないように、
-- require の処理を入れ替える。
local bakRequire = require
require = function( modName )
   if package.loaded[ modName ] then
      return package.loaded[ modName ]
   end
   -- js の getLnsLibCode() コールして Lua コードを取得する
   local code = js.global:getLnsLibCode( modName )
   local mod = load( code )()
   -- lua コードをロードしてセットする
   package.loaded[ modName ] = mod
   return mod
end


-- fengari は io パッケージを用意していないので、
-- ダミーの io パッケージを設定。
-- コンソールの出力を js 側に転送する関数をセット。
local lnsStreamObj = {
   write = function( self, txt )
      js.global:lnsOStream( txt )
   end
}
io = {
   stdout = lnsStreamObj,
   stderr = lnsStreamObj,
}

-- 引数で与えられた lnsCode から Lua コードに変換する
local front = require( 'lune.base.front' )
local luaCode = front.convertLnsCode2LuaCode( lnsCode, "lnsweb.lns" )

js.global:setLuaCode( luaCode )

-- 変換した Lua を実行する 

-- io パッケージを入れ変えるために新しい Lua の環境を作成する
local newEnv = {}
for key, val in pairs( _ENV ) do
   if key == "print" then
      -- print を入れ替える
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
-- io パッケージを設定
-- コンソールの出力を js 側に転送する関数をセット。
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
