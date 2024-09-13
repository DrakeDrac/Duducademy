import gzip
from io import StringIO, BytesIO
import json
import base64

def decompressBytesToString(inputBytes):
  """
  decompress the given byte array (which must be valid 
  compressed gzip data) and return the decoded text (utf-8).
  """
  bio = BytesIO()
  stream = BytesIO(inputBytes)
  decompressor = gzip.GzipFile(fileobj=stream, mode='r')
  while True:  # until EOF
    chunk = decompressor.read(8192)
    if not chunk:
      decompressor.close()
      bio.seek(0)
      return bio.read().decode("utf-8")
    bio.write(chunk)
  return None

def compressStringToBytes(inputString):
  """
  read the given string, encode it in utf-8,
  compress the data and return it as a byte array.
  """
  bio = BytesIO()
  bio.write(inputString.encode("utf-8"))
  bio.seek(0)
  stream = BytesIO()
  compressor = gzip.GzipFile(fileobj=stream, mode='w')
  while True:  # until EOF
    chunk = bio.read(8192)
    if not chunk:  # EOF?
      compressor.close()
      return stream.getvalue()
    compressor.write(chunk)
def hehe():
    old=""
    with open("./m2.json", "r") as f:
        old=f.read()
    Json=json.loads(old)
    for x in Json:
        for y in x:
            del y['ct']
            del y['c_id']
            del y['id']
    print(Json[0][0])
    with open("./moj.bin", "wb") as f:
        f.write(base64.a85encode(compressStringToBytes(json.dumps(Json))))
hehe()