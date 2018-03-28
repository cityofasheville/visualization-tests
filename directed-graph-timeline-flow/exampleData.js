const levelOne = {
    // Once we have data for these things: id and horizontal position are determined by time since start
    // See if force layout handles vertical positioning
    nodes: [
        {
            title: 'Early Assistance Session',
            dayMarker: -1,
            id: '0.0',
            shortDesc: "Optional paid service to discuss code and development questions with staff",
            longDesc: "The Early Assistance program provides a non-mandatory flexible review session for prospective business owners, developers, and designers to receive expert technical advice from staff during the preliminary phase of a project.",
            infoLinks: [
                {
                    text: 'schedule an early assistance meeting',
                    url: 'https://develop.early-assistance.ashevillenc.gov/'
                }
            ]
        },
        {
            title: 'Commercial Review Application',
            dayMarker: 0,
            id: '1.0',
            shortDesc: "garbage garbage garbage garbage garbage garbage garbage garbage garbage garbage garbage garbage garbage",
            infoLinks: [
                {
                    text: 'Submit plans for review on the development portal',
                    url: 'https://develop.plans.ashevillenc.gov/'
                }
            ]
        },
        {
            title: 'Staff Reviews Development Plan',
            dayMarker: 3,
            id: '2.0',
            infoLinks: [
                {
                    text: 'Track your site development application status with Accela Citizen Access',
                    url: 'https://services.ashevillenc.gov/citizenaccess/'
                }
            ]
        },
        {
            title: 'Staff Transmits Review Comments',
            dayMarker: 5,
            id: '3.0'
        },
        {
    // 4 AND 4.1 BECAUSE THEY HAPPEN AT SAME TIME-- like version numbers, not decimals (4.1, 2, 3 ... 11, etc)
            title: 'Zoning Plan Approved',
            dayMarker: 6,
            id: '4.0'
        },
        {
            title: 'Revision and Resubmission Required',
            dayMarker: null,
            id: '4.1'
        },
    ],
    links: [
        {
            source: '0.0',
            target: '1.0'
        },
        {
            source: '1.0',
            target: '2.0'
        },
        {
            source: '2.0',
            target: '3.0'
        },
        {
            source: '3.0',
            target: '4.0'
        },
        {
            source: '3.0',
            target: '4.1'
        },
        {
            source: '4.1',
            target: '1.0'
        },
    ]
}
