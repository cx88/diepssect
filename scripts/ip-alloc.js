let parseIpv6 = ip => {
  let { length } = ip.match(/:/) || []
  return ip
    .replace('::', ':' + Array(8 - length).join(':') + ':')
    .split(':')
    .map(r => parseInt(r, 16) || 0)
}

const IpAlloc = class {
  constructor(template) {
    let match = template.toLowerCase().match(/^([0-9a-f:]{2,39})\/([0-9]+)$/)
    if (!match)
      throw new SyntaxError('Invalid IPv6 range!')

    let maximum = 1 << Math.min(16, +match[2])
    let ipv6 = parseIpv6(match[0])

    this.ipStart = ipv6.slice(0, 7).map(r => r.toString(16)).join(':') + ':'
    this.ipMin = ipv6[7] & -maximum
    this.maximum = maximum

    this.connected = {}
  }
  asString(addr) {
    return this.ipStart + (this.ipMin + addr).toString(16)
  }
  getRandom() {
    return this.asString(Math.floor(Math.random() * this.maximum))
  }
  for(ip) {
    let connected = this.connected[ip]
    if (!connected)
      connected = this.connected[ip] = Array(this.maximum).fill(0)
    let index = null
    for (let i = 0; i < this.maximum; i++)
      if (connected[i] < 2) {
        connected[index = i]++
        break
      }
    if (index === null)
      return { ip: null }
    let locked = true
    return {
      ip: this.asString(index),
      release: () => {
        if (locked)
          connected[index]--
        locked = false
      },
    }
  }
}

module.exports = IpAlloc
