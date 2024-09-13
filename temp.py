import glob
import shutil

for x in glob.glob("./lessons/*"):
   shutil.rmtree(x+"/slides")