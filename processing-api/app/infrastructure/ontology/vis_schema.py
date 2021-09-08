from marshmallow import Schema, fields, validate

from .vis_node import VisTypeEnum


class VisSchema(Schema):
    name = fields.Str(required=True)
    description = fields.Str(required=True)
    vis_type = fields.Str(validate=validate.OneOf([d.value for d in VisTypeEnum]), required=False)
