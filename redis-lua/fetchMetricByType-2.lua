--[[
  KEYS[1] - clientId
  KEYS[2] - type (nodes/pods)
]]

local arrayLimit = 100

local rcall = redis.call

local result = {}

local hashKey = "metric/" .. KEYS[1] .. "/" .. KEYS[2] .. "/*"


local keys = rcall("KEYS", hashKey)

local keysCount = #keys

for i = 1,keysCount,1 
do
  local stats = rcall("LRANGE", keys[i], 0, arrayLimit)
  result[keys[i]] = stats
end

return cjson.encode(result)