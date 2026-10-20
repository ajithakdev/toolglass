#!/usr/bin/env python3
"""Prints the unrolled Keccak-f[1600] `permute` used in src/tools/hash/hash.ts.

Lanes are two 32-bit halves (a{2i} low, a{2i+1} high), lane i = x + 5y.
Run: python3 scripts/gen-keccak-permute.py, then paste over `permute` and run the hash tests.
"""

ROT = [0] * 25
x, y = 1, 0
for t in range(24):
    ROT[x + 5 * y] = ((t + 1) * (t + 2) // 2) % 64
    x, y = y, (2 * x + 3 * y) % 5

out = []
w = out.append
w("function permute(s: Int32Array) {")
w("  " + "; ".join(f"let a{i} = s[{i}]!" for i in range(50)) + ";")
w("  let c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, dl, dh;")
w("  " + "; ".join(f"let b{i}" for i in range(50)) + ";")
w("  for (let r = 0; r < 48; r += 2) {")
# theta
for x in range(5):
    for h in (0, 1):
        w(f"    c{2 * x + h} = " + " ^ ".join(f"a{2 * (x + 5 * y) + h}" for y in range(5)) + ";")
for x in range(5):
    p, n = 2 * ((x + 4) % 5), 2 * ((x + 1) % 5)
    w(f"    dl = c{p} ^ ((c{n} << 1) | (c{n + 1} >>> 31)); dh = c{p + 1} ^ ((c{n + 1} << 1) | (c{n} >>> 31));")
    w("    " + " ".join(f"a{2 * (x + 5 * y)} ^= dl; a{2 * (x + 5 * y) + 1} ^= dh;" for y in range(5)))
# rho and pi
for x in range(5):
    for y in range(5):
        i, j, n = x + 5 * y, y + 5 * ((2 * x + 3 * y) % 5), ROT[x + 5 * y]
        lo, hi = f"a{2 * i}", f"a{2 * i + 1}"
        if n == 0:
            w(f"    b{2 * j} = {lo}; b{2 * j + 1} = {hi};")
        elif n < 32:
            w(f"    b{2 * j} = ({lo} << {n}) | ({hi} >>> {32 - n}); b{2 * j + 1} = ({hi} << {n}) | ({lo} >>> {32 - n});")
        elif n == 32:
            w(f"    b{2 * j} = {hi}; b{2 * j + 1} = {lo};")
        else:
            m = n - 32
            w(f"    b{2 * j} = ({hi} << {m}) | ({lo} >>> {32 - m}); b{2 * j + 1} = ({lo} << {m}) | ({hi} >>> {32 - m});")
# chi
for y in range(5):
    for x in range(5):
        i, i1, i2 = x + 5 * y, (x + 1) % 5 + 5 * y, (x + 2) % 5 + 5 * y
        w(f"    a{2 * i} = b{2 * i} ^ (~b{2 * i1} & b{2 * i2}); a{2 * i + 1} = b{2 * i + 1} ^ (~b{2 * i1 + 1} & b{2 * i2 + 1});")
# iota
w("    a0 ^= RC[r]!; a1 ^= RC[r + 1]!;")
w("  }")
w("  " + "; ".join(f"s[{i}] = a{i}" for i in range(50)) + ";")
w("}")
print("\n".join(out))
