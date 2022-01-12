rsconf = {
    _id : "rsmongo",
    members: [
        {
            "_id": 0,
            "host": "mongodb01:27017",
            "priority": 3
        },
        {
            "_id": 1,
            "host": "mongodb02:27017",
            "priority": 2
        },
        {
            "_id": 2,
            "host": "mongodb03:27017",
            "priority": 1
        }
    ]
}

rs.initiate(rsconf);
