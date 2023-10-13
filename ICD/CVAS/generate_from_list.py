in_file = "fields_in.txt"
out_file = "CVASdictionary.json"

print(f"Reading fields from {in_file} and writing to json results to {out_file}")

prefix = """{
    "name": "CVAS",
    "key": "pl",
    "measurements": [
"""

def get_field_desc(key_name):
    # Replace spaces
    key_name = key_name.replace(" ", "_")
    
    return ( \
"        {\n"
f'            "name": "{key_name}",\n'
f'            "key": "{key_name}",\n'
'''
            "values": [
                {
                    "key": "value",
                    "name": "Value",
                    "units": "unit",
                    "format": "integer",
                    "hints": {
                        "range": 1
                    }
                },
                {
                    "key": "utc",
                    "source": "timestamp",
                    "name": "Timestamp",
                    "format": "utc",
                    "hints": {
                        "domain": 1
                    }
                }
            ]
        }'''
    )

postfix = """
    ]
}
"""

with open(out_file, "w") as out_f:
    # Write prefix
    out_f.write(prefix)

    # Go throug the fields in the in file
    with open(in_file) as in_f:
        # Read field name
        in_lines = in_f.readlines()
        
        # Iterate over each field name
        print("Fields list:")
        for i, field_name in enumerate(in_lines):
            # Remove new line symbol
            field_name = field_name.strip("\n")
            print(field_name)

            # write
            out_f.write(get_field_desc(field_name))

            # Add comma only in between the field description dicts
            if i != len(in_lines) - 1:
                out_f.write(",\n")
    
    # Write postfix
    out_f.write(postfix)

print("FINISHED")
