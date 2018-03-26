# Flow graph notes


## What all flow graphs have in common
- Styling (node color, background, etc)
  - Done by class - .flowNode fill, stroke, on hover/on focus
  - Color is semantic meaning - red bad, etc
- Spacing along a timeline
  - Can be toggled off?  Defaults to even if there is no time data?
- Keyboard nav
  - Tab to whole diagram
  - Arrow keys through nodes in order/relative y position, tooltip is shown and read on focus
  - Enter either lets a user nav through individual records or pops up appropriate modal depending
- Done by inheritance wth React
  - Takes parent element, data


## About a particular permit process
Generic listing of steps and resources
Intended user: any member of the public needing to understand process or access documents
Features:
  - Timeline is either goal or average
  - Nodes contain title, brief description
  - Clicking on a node or pressing enter pops up a modal with more details and links


## Permits#index - /permits
Day to day metrics, which permits need action, where in process are hot spots
Intended user: anyone in DSD?
Features:
  - Use intended timeline for spacing
  - Color overall node by how it's doing relative to goals
  - Each case is within node, size and color by how long it's been there?
  - Tooltip over each case


## Individual permit (permits#show - permits/:id)
Intended user: public, internal
Features:
  - Flow diagram is just timeline
  - Node mouseover is tooltip of timestamp for that step for that recod
  - Clicking on a node pops up same modal as in info/generic view


# Next steps
- Also list permits by other things?
  - Like the rest of SimpliCity-- address, neighborhood, etc
  - Type of permit
  - Date
- Management/high level and accountability dashboards