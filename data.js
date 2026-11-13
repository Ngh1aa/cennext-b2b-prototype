/*
 * G.I.E site: the single seed data file.
 * Every list and detail page reads from this object. User changes are kept in
 * sessionStorage (see app.js), seeded from here, and restored by "Reset demo data".
 * Service and program copy only; no client projects are described.
 */
window.GIE_SEED = {
  version: 4,
  services: [
    {
      id: 'automation',
      title: 'Automation & control',
      short: 'Build a control project',
      summary: 'Define PLC, HMI and system boundaries before implementation.',
      description: 'Clarify control requirements, equipment interfaces and test expectations before a project starts.',
      inputs: ['Equipment and process overview', 'Existing control system, if known', 'Production and access constraints'],
      process: [
        { title: 'Walk the process', text: 'Agree which machines, sequences and operator tasks the control change touches.' },
        { title: 'Set the boundaries', text: 'List the signals, panels and interfaces that are in scope and the ones that stay as they are.' },
        { title: 'Define acceptance', text: 'Write the test criteria that will show the control change works on the real line.' },
        { title: 'Plan the handover', text: 'Decide what documentation, backups and training the maintenance team needs afterwards.' }
      ],
      deliverables: ['Control scope and system boundaries', 'Interface and responsibility checklist', 'Test criteria and handover outline'],
      boundaries: 'Safety-critical design, site work, equipment supply and commissioning responsibilities require separate qualified engineering review and agreement.',
      relatedPrograms: ['planned-maintenance', 'modernization-roadmap']
    },
    {
      id: 'integration',
      title: 'System integration',
      short: 'Connect your systems',
      summary: 'Make interfaces, responsibilities and handover requirements explicit.',
      description: 'Make the interfaces between equipment, systems and project partners explicit.',
      inputs: ['Systems that need to exchange information', 'Available interface documentation', 'Dependencies and responsibility boundaries'],
      process: [
        { title: 'Map the systems', text: 'Record each system, who owns it and what information it produces or needs.' },
        { title: 'Agree the interfaces', text: 'Describe each connection: data, timing, protocol and the party responsible for it.' },
        { title: 'Order the dependencies', text: 'Sequence the work so each partner knows what they need, and when.' },
        { title: 'Prepare coordination', text: 'Set up the checklist the project team uses to confirm every interface at handover.' }
      ],
      deliverables: ['Interface and ownership map', 'Integration requirements and dependencies', 'Coordination and handover checklist'],
      boundaries: 'Network security design, vendor software changes and site connection work need separate agreement with the system owners.',
      relatedPrograms: ['modernization-roadmap']
    },
    {
      id: 'modernization',
      title: 'Modernization',
      short: 'Modernize an existing line',
      summary: 'Map the current system, constraints and a staged migration approach.',
      description: 'Plan the next change around the equipment and constraints already in place.',
      inputs: ['Current equipment and documentation', 'Known reliability or maintainability concerns', 'Access windows and production constraints'],
      process: [
        { title: 'Assess what exists', text: 'Document the current equipment, its condition and the parts that are hard to support.' },
        { title: 'Find the constraints', text: 'Record shutdown windows, production targets and the risks of each change.' },
        { title: 'Stage the migration', text: 'Split the change into steps that fit the shutdown windows the plant actually has.' },
        { title: 'Plan verification', text: 'Agree how each stage is checked and documented before the next one starts.' }
      ],
      deliverables: ['Current-system assessment outline', 'Staged migration and dependency roadmap', 'Verification and documentation plan'],
      boundaries: 'Equipment selection, installation and commissioning are agreed separately for each stage.',
      relatedPrograms: ['modernization-roadmap', 'volume-repair']
    },
    {
      id: 'repair',
      title: 'Repair or replace assessment',
      short: 'Decide on a failed motor',
      summary: 'Compare repair and replacement paths for a failed or ageing motor.',
      description: 'Compare repair and replacement paths for a failed or ageing motor before committing budget or downtime.',
      inputs: ['Nameplate data: HP, voltage, frame, speed', 'Symptoms and failure history', 'Replacement lead time, if quoted'],
      process: [
        { title: 'Identify', text: 'Confirm motor type, horsepower, frame, duty and application.' },
        { title: 'Diagnose', text: 'Work out whether the damage is mechanical, electrical or both.' },
        { title: 'Compare', text: 'Set the repair scope against a real replacement option, price and lead time.' },
        { title: 'Decide', text: 'Choose the path that best fits cost, downtime risk and future service needs.' }
      ],
      deliverables: ['Repair versus replace comparison', 'Downtime and lead-time summary', 'Recommended next step for the maintenance team'],
      boundaries: 'Final feasibility depends on teardown inspection of the actual motor. A screening result is not a repair quote.',
      relatedPrograms: ['volume-repair', 'planned-maintenance']
    }
  ],
  programs: [
    {
      id: 'volume-repair',
      title: 'Volume repair program',
      kicker: 'Plant support / recurring repair',
      summary: 'One repeatable process for plants that send motors for repair every month.',
      lead: 'For facilities managing a steady flow of assets, a repeatable program reduces coordination overhead: scheduled pickup and return, serialized tracking and one documentation pattern.',
      bestFit: 'Industrial campuses, multi-site operations and aging fleets that cannot reinvent the repair process every time a motor comes offline.',
      steps: [
        { title: 'Schedule', text: 'Set recurring pickup and return windows around production and maintenance schedules.', outcome: 'Less coordination' },
        { title: 'Track', text: 'Keep each motor connected to its repair history with serialized records.', outcome: 'Clear asset visibility' },
        { title: 'Repair', text: 'Apply the agreed repair path across motors, bearings, rewinds and diagnostics.', outcome: 'Consistent scope' },
        { title: 'Return', text: 'Coordinate return, records and next-step recommendations for the maintenance team.', outcome: 'Ready to reinstall' }
      ],
      includes: [
        { label: 'Logistics', title: 'Scheduled pickup and return', text: 'Move motors on a recurring basis instead of arranging transport job by job.' },
        { label: 'Records', title: 'Serialized repair history', text: 'Keep service documentation tied to individual assets.' },
        { label: 'Commercial', title: 'Program pricing', text: 'Recurring demand can be structured differently from one-off repair work.' }
      ],
      signals: [
        { title: 'You manage a steady repair queue', text: 'Several motors move through maintenance every month.' },
        { title: 'Your sites need one shared process', text: 'Different buildings need a common way to request and track repairs.' },
        { title: 'Your equipment is difficult to replace', text: 'Legacy or long-lead assets make predictable repair support more valuable.' }
      ],
      relatedServices: ['repair', 'modernization']
    },
    {
      id: 'planned-maintenance',
      title: 'Planned maintenance program',
      kicker: 'Plant support / inspection rhythm',
      summary: 'Scheduled inspections that find wear before it becomes a stoppage.',
      lead: 'A planned inspection rhythm for critical drives and motors, with condition notes that feed repair-or-replace decisions before a failure forces one.',
      bestFit: 'Plants with a short list of critical assets where an unplanned stop costs more than routine inspection.',
      steps: [
        { title: 'Rank', text: 'Agree which assets are critical and how often each should be inspected.', outcome: 'Clear priorities' },
        { title: 'Inspect', text: 'Record vibration, temperature, insulation and visual condition on a schedule.', outcome: 'Trend data' },
        { title: 'Flag', text: 'Highlight assets whose condition is moving toward a failure threshold.', outcome: 'Early warning' },
        { title: 'Plan', text: 'Schedule repair or replacement inside a planned shutdown window.', outcome: 'Fewer surprises' }
      ],
      includes: [
        { label: 'Schedule', title: 'Inspection calendar', text: 'Inspections planned around shifts and shutdown windows.' },
        { label: 'Condition', title: 'Trend notes per asset', text: 'Each inspection adds to the record for that asset.' },
        { label: 'Decision', title: 'Repair or replace flags', text: 'Assets near end of life are flagged before they fail.' }
      ],
      signals: [
        { title: 'A few assets stop the whole line', text: 'One failure on a critical drive halts production.' },
        { title: 'Failures arrive without warning', text: 'There is no trend data before a motor fails.' },
        { title: 'Shutdown windows are short', text: 'Work has to be planned well ahead to fit the available time.' }
      ],
      relatedServices: ['repair', 'automation']
    },
    {
      id: 'modernization-roadmap',
      title: 'Modernization roadmap',
      kicker: 'Plant support / staged upgrades',
      summary: 'A multi-stage plan for replacing obsolete controls and drives over several shutdowns.',
      lead: 'For lines that rely on obsolete controls or unsupported drives, a roadmap splits the upgrade into stages that fit real shutdown windows and keeps documentation current at each step.',
      bestFit: 'Lines with discontinued PLCs, drives or HMIs, and teams that cannot stop production for one large changeover.',
      steps: [
        { title: 'Survey', text: 'Document the current controls, drives and the parts that are no longer supported.', outcome: 'Known risk' },
        { title: 'Stage', text: 'Group the changes into stages that fit planned shutdowns.', outcome: 'Realistic plan' },
        { title: 'Verify', text: 'Agree how each stage is tested before the line restarts.', outcome: 'Confident restarts' },
        { title: 'Update', text: 'Keep drawings and backups current after every stage.', outcome: 'Usable records' }
      ],
      includes: [
        { label: 'Survey', title: 'Obsolescence register', text: 'A list of unsupported components and their replacement options.' },
        { label: 'Plan', title: 'Stage-by-stage roadmap', text: 'Each stage has a scope, a window and acceptance checks.' },
        { label: 'Records', title: 'Documentation updates', text: 'Drawings and backups are refreshed after each stage.' }
      ],
      signals: [
        { title: 'Spare parts are hard to find', text: 'Key components are discontinued or only available second-hand.' },
        { title: 'One big changeover is not possible', text: 'Production cannot stop long enough for a single replacement.' },
        { title: 'Drawings are out of date', text: 'The documentation no longer matches what is installed.' }
      ],
      relatedServices: ['modernization', 'integration', 'automation']
    }
  ],
  options: {
    equipmentTypes: ['Electric motor', 'Drive or VFD', 'PLC or control panel', 'HMI or SCADA', 'Production line', 'Other or not sure'],
    urgency: [
      { id: 'planned', label: 'Planned', text: 'More than a month away' },
      { id: 'soon', label: 'Soon', text: 'Within the next month' },
      { id: 'urgent', label: 'Urgent', text: 'Equipment is down now' }
    ],
    budgets: ['Not decided yet', 'Under $10,000', '$10,000 to $50,000', '$50,000 to $250,000', 'Over $250,000'],
    contactMethods: ['Email', 'Phone'],
    contactTopics: ['A question about a service', 'Plant support programs', 'An existing request', 'Something else']
  },
  requests: [
    {
      id: 'RFQ-1001',
      example: true,
      status: 'in-review',
      createdAt: '2026-11-03T09:12:00',
      updatedAt: '2026-11-04T14:30:00',
      submittedAt: '2026-11-03T09:40:00',
      service: 'modernization',
      program: '',
      step: 6,
      equipment: { type: 'PLC or control panel', makeModel: 'Legacy PLC, model to confirm', quantity: 2, site: 'Packing hall, Line 3', description: 'Replace two unsupported PLC panels on the packing line in stages.', constraints: 'Weekend shutdowns only.' },
      schedule: { urgency: 'planned', startDate: '2027-02-01', budget: '$50,000 to $250,000', notes: '' },
      attachments: [{ name: 'line3-panel-photos.zip', size: 4812000 }, { name: 'io-list.xlsx', size: 38400 }],
      contact: { name: 'Dana Whitfield', company: 'Harlow Creek Packaging', email: 'd.whitfield@harlowcreekpack.com', phone: '+1 678 555 0142', method: 'Email' },
      assessment: null,
      history: [
        { status: 'draft', at: '2026-11-03T09:12:00', note: 'Draft started.' },
        { status: 'submitted', at: '2026-11-03T09:40:00', note: 'Brief submitted.' },
        { status: 'in-review', at: '2026-11-04T14:30:00', note: 'Scope review started.' }
      ]
    },
    {
      id: 'RFQ-1002',
      example: true,
      status: 'draft',
      createdAt: '2026-11-10T16:05:00',
      updatedAt: '2026-11-10T16:20:00',
      submittedAt: '',
      service: 'repair',
      program: '',
      step: 3,
      equipment: { type: 'Electric motor', makeModel: '150 HP TEFC, frame 445T', quantity: 1, site: 'Boiler house', description: 'Motor tripping on overload after a bearing noise complaint.', constraints: '' },
      schedule: { urgency: 'soon', startDate: '', budget: 'Not decided yet', notes: '' },
      attachments: [],
      contact: { name: '', company: '', email: '', phone: '', method: 'Email' },
      assessment: null,
      history: [
        { status: 'draft', at: '2026-11-10T16:05:00', note: 'Draft started.' }
      ]
    }
  ],
  messages: []
};
