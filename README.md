# Diepssect

This a public repo for hacky diep stuff, including networking protocol, WebAssembly, memory editing, & physics.

## Contribution

I started working on this last summer in 2017, with the goal of deciphering the diep.io protocol. Unfortunately the developer started updating the game for a while, and each time the memory layout and protocol is shuffled. But since now it's been months since the last update now, I'm starting to work on it again. If you make any discoveries, pull requests are welcome!

## Userscripts

All of the non-deprecated scripts are found in the `userscripts` folder, but you can also install them by just clicking. They all should be able to run in harmony, with the exception of `dpma.js`, which should not be combined with `hexedit.js` or `diep-pl.js`.

- [`Diep-pl.js`](https://raw.githubusercontent.com/cx88/diepssect/master/userscripts/diep-pl.user.js) - A diep packer logger, used for deciphering the protocol.
- [`dpma.js`](https://raw.githubusercontent.com/cx88/diepssect/master/userscripts/dpma.user.js) - A WIP script that allows both editing memory and packets.
- [`hexedit.js`](https://raw.githubusercontent.com/cx88/diepssect/master/userscripts/hexedit.user.js) - A script that allows memory editing.
- [`injector.js`](https://raw.githubusercontent.com/cx88/diepssect/master/userscripts/injector.user.js) - A script that inject itself into diep's `build_*.js` for exporting and replacing variables. It's included in `hexedit.js` and `dpma.js`
- `replacer.js` - A deprecated script that's merged into `injector.js`
- `exporter.js` - Another deprecated script that's merged into `injector.js`. It used to be required for `hexedit.js` to work.


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

Many packets are already completely deciphered. Some packet types have a known structure, but contain tables or mappings that are unknown and possible to figure out through manual trial-and-error. A few are completely unknown and deemed impossible without reverse engineering.

### Serverbound Packets
|  ID  |   Description   |   Status   |
|------|-----------------|------------|
| `00` | init            | Done       |
| `01` | input           | Done       |
| `02` | spawn           | Done       |
| `03` | upgrade build   | Done       |
| `04` | upgrade tank    | Structured |
| `05` | echo            | Done       |
| `06` |                 | Unknown    |
| `07` | extension found | Structured |
| `08` | clear death     | Done       |
| `09` | take tank       | Done       |

### Clientbound Packets
|  ID  |    Description    |   Status   |
|------|-------------------|------------|
| `00` | update            | Structured |
| `01` | outdated client   | Done       |
| `02` | compressed update | Unknown    |
| `03` | message           | Done       |
| `04` | server status     | Done       |
| `05` | echo              | Done       |
| `06` | party link        | Done       |
| `07` | ready             | Done       |
| `08` | achievements      | Structured |
| `09` | invalid link      | Done       |
| `0a` | player count      | Done       |

### Other Repos

Here are some repos about the protocol. Unfortunately, most of the information there especially about the details of the `00` packet is either outdated or incorrect.
- https://github.com/firebolt55439/Diep.io-Protocol
- https://github.com/FlorianCassayre/diep.io-protocol

## WebAssembly

Diep.io uses [Emscripten](https://github.com/kripken/emscripten) with [WebAssembly](https://webassembly.org/). This means that unlike most .io games, diep is written not in JavaScript but rather C++. This means that the code cannot be easily read, and will be difficult to comprehend even when disassembled.

## Memory editing

You can find `userscripts/hexedit.js` and use it in TemperMonkey. Six vectors with static memory addresses have been included, and you can find their information in the comments.
