local _global=_G
useModule={}
module( "useModule" )
function func1()
   _global.print( "func1" )
end
function func2()
   return 2
end
