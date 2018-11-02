--[[
  KEYS[1] - clientId
  KEYS[2] - type
  KEYS[3] - resourceName
]]
local arrayLimit = 100

local rcall = redis.call
local hashKey = "metric/" .. KEYS[1] .. "/" .. KEYS[2] .. "/" .. KEYS[3]

local metrics = rcall("LRANGE", hashKey, 0, arrayLimit)

return metrics