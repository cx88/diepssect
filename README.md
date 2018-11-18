# Diepssect

This a public repo for hacky diep stuff, including networking protocol, WebAssembly, memory editing, & physics.

## Contribution

I started working on this last summer in 2017, with the goal of deciphering the diep.io protocol. Unfortuneately the developer started updating the game for a while, and each time the memory layout and protocol is shuffled. But since now it's been months since the last update now, I'm starting to work on it again. If you make any discoveries, pull requests are welcome!

## Protocol

You can find `userscripts/diep-pl.js` and use it in TemperMonkey. Press F12 to view all short cuts, but it include features like Alt+Z to dump log to console.

### Encodings

Although data is represented in many ways, there are only four core encodings. Floats are always 4 bytes, where as the rest is variable and have at least 1 byte.

|   Name   |        Description         |
|----------|----------------------------|
| Float    | A floating point number    |
| Varint   | A signed 32 bit integer    |
| Varuint  | An unsigned 32 bit integer |
| Varfloat | A float casted to a varint |
| String   | A null terminated string   |

### Serverbound Packets
|  ID  |   Description   |
|------|-----------------|
| `00` | init            |
| `01` | input           |
| `02` | spawn           |
| `03` | upgrade build   |
| `04` | upgrade tank    |
| `05` | echo            |
| `06` |                 |
| `07` | extension found |
| `08` | clear death     |
| `09` | take tank       |

### Clientbound Packets
|  ID  |    Description    |
|------|-------------------|
| `00` | update            |
| `01` | outdated client   |
| `02` | compressed update |
| `03` | message           |
| `04` | server status     |
| `05` | echo              |
| `06` | party link        |
| `07` | ready             |
| `08` | achievements      |
| `09` | invalid link      |
| `0a` | player count      |

### Other Repos

Here are some repos about the protocol. Unfortunately, most of the information there especially about the details of the `00` packet is either outdated or incorrect.
- https://github.com/firebolt55439/Diep.io-Protocol
- https://github.com/FlorianCassayre/diep.io-protocol

## Memory editing

You can find `userscripts/hexedit.js` and use it in TemperMonkey. Note that it **MUST** be paired with `userscripts/exporter.js` in order to work. Six vectors with static memory addresses have been included, and you can find their information in the comments.
