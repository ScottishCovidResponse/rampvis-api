import sys
import json


# for v in sys.argv[1:]:
#   print(v)

# simple JSON echo script
for line in sys.stdin:
  print(json.dumps(json.loads(line)))
