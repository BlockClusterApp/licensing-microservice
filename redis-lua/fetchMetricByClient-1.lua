--[[
  KEYS[1] - clientId
]]

local arrayLimit = 100

local rcall = redis.call

local result = {}

local helpers = {}


function helpers.fetchByType(type) 
  local _result = {}
  local hashKey = "metric/" .. KEYS[1] .. "/" .. type .. "/*"
  local keys = rcall("KEYS", hashKey)
  local keysCount = #keys

  for i = 1,keysCount,1 
  do
    local stats = rcall("LRANGE", keys[i], 0, arrayLimit)
    _result[keys[i]] = stats
  end

  return _result
  -- return keys[1]
end


result["nodes"] = helpers.fetchByType("nodes")
result["pods"] = helpers.fetchByType("pods")



return cjson.encode(result)
