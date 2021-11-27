from marshmallow import Schema, fields, validate

from .data_node import DataTypeEnum, SourceEnum, ModelEnum, AnalyticsEnum


class DataSchema(Schema):
    endpoint = fields.Str(required=True)
    url_prefix = fields.Str(required=True)
    description = fields.Str(required=True)
    header = fields.Str(required=True)
    type = fields.Str(validate=validate.OneOf([d.value for d in DataTypeEnum]), required=False)
    type_val = fields.Str(validate=validate.OneOf([d.value for d in ModelEnum] + [d.value for d in AnalyticsEnum]),
                          required=False)
    source = fields.Str(validate=validate.OneOf([d.value for d in SourceEnum]), required=False)
