#!/usr/bin/env python3
"""Generate the LCD noise tile used in code.css and print it as a CSS data URL.

A small RGBA PNG of dark and light speckles with low alpha, tiled over the
green LCD colour. Pure standard library, deterministic (fixed seed).
Usage: python dev/make-lcd-noise.py
"""
import base64
import random
import struct
import zlib

SIZE = 48
random.seed(42)


def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)


rows = []
for y in range(SIZE):
    row = bytearray([0])  # filter type: none
    for x in range(SIZE):
        if random.random() < 0.55:
            row += bytes([10, 20, 0, random.randint(0, 14)])       # dark speckle
        else:
            row += bytes([255, 255, 220, random.randint(0, 10)])   # light speckle
    rows.append(bytes(row))

png = (b'\x89PNG\r\n\x1a\n'
       + chunk(b'IHDR', struct.pack('>IIBBBBB', SIZE, SIZE, 8, 6, 0, 0, 0))
       + chunk(b'IDAT', zlib.compress(b''.join(rows), 9))
       + chunk(b'IEND', b''))

print('url(data:image/png;base64,' + base64.b64encode(png).decode() + ')')
