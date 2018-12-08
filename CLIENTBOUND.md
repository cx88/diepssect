# Clientbound Packets

### Encodings

|   Name   |        Description         | Size |
|----------|----------------------------|------|
| Float    | A floating point number    | 4    |
| Varint   | A signed 32 bit integer    | 1+   |
| Varuint  | An unsigned 32 bit integer | 1+   |
| String   | A null terminated string   | 1+   |

You might've noticed that only four out of the six primary encodings are used on clientbound packets. Varfloats and Ints are only used on serverbound packets. However, the client do have a few secondary encodings, as listed below.

|    Name    |        Description         |       Structure       |
|------------|----------------------------|-----------------------|
| Entity Id  | The id of an entity.       | vu(time) vu(counter)  |
| Varindex   | The index of a field.      | vu(index XOR 1)       |

There is a table of fields, with each row mapped to an index and a type, which looks like this:

| Index | Type | Description |
|-------|------|-------------|
| 1     | vi   | Angle       |
| 2     | vi   | X-position  |
| 3     | vi   | Y-position  |
| 5     | f    | Max Health  |
| 24    | f    | Health      |

Here is a example of a packet where two entities are deleted while one is being updated:

```
00          | vu 0      | header
20          | vu 32     | packet id
02          | vu 2      | number deleted
   01 04    | ei 1:4    | entity 1:4
   01 06    | ei 1:6    | entity 1:6
01          | vu 3      | number created or updated
   01 07    | ei 1:2    | entity 1:7
      00 01 | vu 0 vu 1 | updating mode
      00    | vx 1      | field id (= 1)
      a2 02 | vi ???    | field 1: x
      00    | vx 1      | field id (= 1 + 1)
      fc 01 | vi ???    | field 2: y
      00    | vx 1      | field id (= 1 + 1 + 1)
      73    | vi ???    | field 3: angle
      01    | vx 0      | field ended
```
