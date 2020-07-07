function createCloseVal(num)
   local meta = {
      __close = function( self, err ) print( "__close", self.num ) end,
      __gc = function( self ) print( "__gc", self.num ) end,
   }
   return setmetatable( { num=num }, meta )
end

for count = 1, 3 do
   local val<close> = createCloseVal( count )
   local val2<close> = createCloseVal( count + 100 )
end
