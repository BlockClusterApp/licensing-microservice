--[[
  KEYS[1] - type (node/pod)
  KEYS[2] - name (of pod or node)

  ARGV[1] - stats
]]

local rcall = redis.call

-- base64 encoding
function enc(data)
  return ((data:gsub('.', function(x) 
      local r,b='',x:byte()
      for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end
      return r;
  end)..'0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
      if (#x < 6) then return '' end
      local c=0
      for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end
      return b:sub(c+1,c+1)
  end)..({ '', '==', '=' })[#data%3+1])
end

-- base64 decoding
function dec(data)
  data = string.gsub(data, '[^'..b..'=]', '')
  return (data:gsub('.', function(x)
      if (x == '=') then return '' end
      local r,f='',(b:find(x)-1)
      for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
      return r;
  end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
      if (#x ~= 8) then return '' end
      local c=0
      for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
          return string.char(c)
  end))
end

-- insert to list
function insert(hashKey, value)
  rcall("LPUSH", hashKey, value)
  local newLength = rcall("LLEN", hashKey)
  if newLength > 100 then
    rcall("RPOP", hashKey)
  end
  return newLength - 1
end


local hashKey = KEYS[1] .. KEYS[2]
hashKey = enc(hashKey)

local length = rcall("LLEN", hashKey)

if length > 100 then
  -- Remove extra elements
  local extraElementCount = length - 100
  for i = 0,extraElementCount,1
  do
    rcall("RPOP", hashKey)
  end
else 
  insert(hashKey, ARGV[1])
end

return hashKey