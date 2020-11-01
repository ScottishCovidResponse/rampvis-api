from flask import current_app

config = current_app.config
ontology = current_app.extensions['ontology']


class OntologyService:
    def __init__(self):
        ontology.query("CREATE OR REPLACE DATABASE RAMP_VIS")

    def test(self):
        query_string = '''
        USING PERIODIC COMMIT 500
        LOAD CSV WITH HEADERS FROM
        'https://raw.githubusercontent.com/ngshya/datasets/master/cora/cora_content.csv'
        AS line FIELDTERMINATOR ','
        CREATE (:Paper {id: line.paper_id, class: line.label})
        '''
        ontology.query(query_string, db='RAMP_VIS')
