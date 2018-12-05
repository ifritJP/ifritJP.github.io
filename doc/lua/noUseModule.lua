local mod = {}
function mod.func1()
   print( "func1" )
end
function mod.func2()
   return 2
end
return mod


-- local global=_G
-- ext51={}
-- ext51.val = 10
-- package.loaded[ "ext51" ] = ext51
--module( "ext51" )

-- for key, val in global.pairs( global.ext51 ) do
--    global.print( key, val )
-- end

--return ext51
--return {}
--return nil


