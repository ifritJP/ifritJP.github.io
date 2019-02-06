glb = 11
local tbl = { value = 0 }
function tbl:func( val )
  self.value = self.value + val
  return self.value
end
return tbl
