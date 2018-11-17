# Diepssect

This a public repo for hacky diep stuff, including networking protocol, WebAssembly, memory editing, & physics.

## Protocol

You can find `userscripts/diep-pl.js` and use it in TemperMonkey. Press F12 to view all short cuts, but it include features like Alt+Z to dump log to console.

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

- https://github.com/firebolt55439/Diep.io-Protocol
- https://github.com/FlorianCassayre/diep.io-protocol

## Memory editing

You can find `userscripts/hexedit.js` and use it in TemperMonkey. Note that it **MUST** be paired with `userscripts/exporter.js` in order to work.
