function DefClass( SuperClass ) -- クラス定義用関数
   local NewClass = {}
   setmetatable( NewClass, { __index = SuperClass } )
   function NewClass:super( ... )
      local obj = {}
      if SuperClass then
	 obj = SuperClass:new( ... )
      end
      setmetatable( obj, { __index = NewClass } )
      return obj
   end
   function NewClass:new( ... )
      return self:super( ... )
   end
   return NewClass
end

local SuperClass = DefClass( nil ) -- クラス定義。 継承無し
function SuperClass:new( value )
  local obj = self:super() -- 親クラスのインスタンス生成
  obj.valueA = value
  return obj
end
function SuperClass:funcA()
  return self.valueA
end

local SubClass = DefClass( SuperClass ) -- クラス定義。  SuperClass を継承。 コンストラクタはデフォルト。
function SubClass:funcB()
  return self.valueA + 10
end

local SubSubClass = DefClass( SubClass ) -- クラス定義。 SubClass を継承
function SubSubClass:new( value1, value2 )
  local obj = self:super( value1 ) -- 親クラスのインスタンス生成
  obj.valueC = value2
  return obj
end
function SubSubClass:funcC()
  return self.valueC
end

local obj = SuperClass:new( 1 )
print( obj:funcA(), obj.funcB, obj.funcC ) -- 1, nil, nil
obj = SubClass:new( 1 )
print( obj:funcA(), obj:funcB(), obj.funcC) -- 1, 11, nil
obj = SubSubClass:new( 1, 2 )
print( obj:funcA(), obj:funcB(), obj:funcC() ) -- 1, 11, 2


local function sampleCompare( val1, val2, param )
   print( val1, val2, param )
end

local function generateCompare( param )
  return function( val1, val2 )
    return sampleCompare( val1, val2, param )
  end
end
generateCompare( 1 )( 10, 20 )
generateCompare( 2 )( 10, 20 )


local meta = {
  __index = function( tbl, key )
    return key
  end
}
local tbl = {}
print( tbl[ 1 ] ) -- nil
setmetatable( tbl, meta )
print( tbl[ 1 ] ) -- 1



local sub = require( 'foo.req' )
print( gbl, sub:func(1) )
gbl = 0
print( gbl, sub:func(1) )
gbl = 0
local sub2 = require( 'foo.req' )
print( sub == sub2 )

local sub3func = loadfile( 'foo/req.lua' )
local sub31 = sub3func()
local sub32 = sub3func()
print( sub31:func(1) )
print( sub32:func(1) )
print( sub31 == sub32 )




local ite = coroutine.wrap( function ( param, prev )
   for next = 1, param do
     coroutine.yield( next, string.format( "%d", next ) )
   end
   return nil
end)

for value1, value2  in ite, 10, nil do
   print( string.format( '%d "%s"',  value1, value2 ) ) -- 1, "1" : 2, "2" : ～ : N, "N"
end


local crn = coroutine.create( function( value )
      print( "c1", value )
      print( "c2", coroutine.yield( value + 1 ) )
      return value + 2 
end)
print( "m1", coroutine.resume( crn, 2 ) )
print( "m2", coroutine.resume( crn, 3 ) )
print( "m3", coroutine.resume( crn, 4 ) )

crn = coroutine.wrap( function( value )
      print( "c1", value )
      print( "c2", coroutine.yield( value + 1 ) )
      return value + 2 
end)
print( "m1", crn( 2 ) )
print( "m2", crn( 3 ) )
-- print( "m3", crn( 4 ) ) -- error


local aa = require( 'sub' )


local classA = {
  value = 0,
  get = function( self )
     return self.value
  end,
  set = function( self, value )
     self.value = value
  end,
}
print( classA:get() ) -- 0
classA.set( classA, 1 )
print( classA.get( classA ) ) -- 1


local classA = { total = 0, value = 1 }
function classA:getTotal()
  return self.total
end
function classA:add()
  self.total = self.total + self.value
end
function classA:setValue( val )
  self.value = val
end
print( classA:getTotal() ) -- 0
classA:add()
print( classA:getTotal() ) -- 1
classA:setValue( 2 )
classA:add()
print( classA:getTotal() ) -- 3


local function func()
  return 1
end
print( "value = ", func() ) -- 1
print( "value = ", (function() return 2 end)() ) -- 2

enableLogFlag = nil
local function log( ... )
  if enableLogFlag then
    print( ... )
  end
  local val1 = {...,nil}
  print( val1[1], val1[2] )
  local val2 = {...}
  print( val2[1], val2[2] )
end
log( "test", "aaa" )

local function ite( param, prev )
   if prev == param then
      return nil
   end
   if prev == nil then
      prev = 0
   end
   local next = prev + 1
   return next, string.format( "%d", next )
end

for value1, value2  in ite, 10, nil do
   print( string.format( '%d "%s"',  value1, value2 ) ) -- 1, "1" : 2, "2" : ～ : N, "N"
end


value = 0
repeat
   local hoge = value
   value = value + 1
   print( value )
until hoge == 2


value = 10
if value == _ENV.value then
  print( "equals" )
end

hoge = --[=[
   afjeiao
]=]1
print( hoge )

hoge = [=[
   afjeiao
]=]
print( hoge )

print( #"123" )

tbl = { foo = 1, bar = 2, [ ".hoge" ] = 3, [1] = 4 }
print( tbl.foo )
print( tbl[ ".hoge" ] )
print( tbl[ 1 ] )

tbl = { "1", "2", "3", 4, [5] = 5, [7]=7 }
-- tbl[1] == "1"; tbl[2] == "2"; tbl[3] == "3"; tbl[4] == 4; tbl[5] == 4;

print( #tbl, tbl[1], tbl[5] )
--print( tbl.1 )



for k,v in pairs( tbl ) do
   print( k, v )
end

tbl[1]=nil

for k,v in pairs( tbl ) do
   print( k, v )
end

table.remove( tbl, 3 )

for k,v in pairs( tbl ) do
   print( k, v )
end

