--[[
  KEYS[1] - clientid
  KEYS[2] - type (node/pod)
  KEYS[3] - name (of pod or node)

  ARGV[1] - stats
]]

local rcall = redis.call

local arrayLimit = 100

local encoding = {}
-- base64 encoding
function encoding.enc(data)
  return data
end

-- base64 decoding
function encoding.dec(data)
  return data
end


local helpers = {}
-- insert to list
function helpers.insert(hashKey, value)
  rcall("LPUSH", hashKey, value)
  local newLength = rcall("LLEN", hashKey)
  if newLength > arrayLimit then
    rcall("RPOP", hashKey)
  end
  return newLength - 1
end


local hashKey = KEYS[1] .. "/" .. KEYS[2] .. "/" .. KEYS[3]
hashKey = encoding.enc(hashKey)

local length = rcall("LLEN", hashKey)

if length > arrayLimit then
  -- Remove extra elements
  local extraElementCount = length - arrayLimit
  for i = 0,extraElementCount,1
  do
    rcall("RPOP", hashKey)
  end
  helpers.insert(hashKey, ARGV[1])
else 
  helpers.insert(hashKey, ARGV[1])
end

return hashKey