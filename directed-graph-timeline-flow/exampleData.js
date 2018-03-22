const levelOne = {
    // Once we have data for these things: id and horizontal position are determined by time since start
    // See if force layout handles vertical positioning
    nodes: [
        {
            title: 'Early Assistance Session',
            firstAppearanceDaysSinceStart: -2,
            id: 0
        },
        {
            title: 'Commercial Review Application',
            firstAppearanceDaysSinceStart: 0,
            id: 1
        },
        {
            title: 'Staff Development Plan Review',
            firstAppearanceDaysSinceStart: 7,
            id: 2
        },
        {
            title: 'Staff Development Plan Review Comments Transmitted',
            firstAppearanceDaysSinceStart: 10,
            id: 3
        },
        {
    // 4 AND 4.1 BECAUSE THEY HAPPEN AT SAME TIME-- like version numbers, not decimals (4.1, 2, 3 ... 11, etc)
            title: 'Zoning Plan Approved',
            firstAppearanceDaysSinceStart: 12,
            id: 4.0
        },
        {
            title: 'Revisions Required',
            firstAppearanceDaysSinceStart: 12,
            id: 4.1
        },
        {
            title: 'Applicant Revises Plans',
            firstAppearanceDaysSinceStart: null,
            id: 5
        },
    ],
    links: [
        {
            source: 0,
            target: 1
        },
        {
            source: 1,
            target: 2
        },
        {
            source: 2,
            target: 3
        },
        {
            source: 3,
            target: 4.0
        },
        {
            source: 3,
            target: 4.1
        },
        {
            source: 4.1,
            target: 5
        },
        {
            source: 5,
            target: 1
        }
    ]
}
