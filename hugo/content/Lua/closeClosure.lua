function createCloseVal(num)
   local meta = {
      __close = function( self, err ) print( "__close", self.num ) end,
      __gc = function( self ) print( "__gc", self.num ) end,
   }
   return setmetatable( { num=num }, meta )
end

function test( num ) 
   local val<close> = createCloseVal( num )
   return function()
      print( "closure", val.num )
   end
end

local hoge = test( 100 )
hoge()


