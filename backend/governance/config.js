module.exports = {
  caseType: 'licensed_design_asset', initialState: 'briefed',
  states: ['briefed', 'assets_verified', 'generated', 'edited', 'review', 'approved', 'packaged', 'published'],
  createRoles: ['designer', 'creative_director', 'admin'],
  evidenceKinds: ['brief_digest', 'license_record', 'source_asset_digest', 'generation_manifest', 'edit_manifest', 'moderation_result', 'export_manifest'],
  requiredSignals: ['licenseVerified', 'moderationStatus', 'width', 'height', 'policyVersion'],
  transitions: [
    { from: 'briefed', action: 'verify_assets', to: 'assets_verified', roles: ['rights_manager'], requiresEvidence: true },
    { from: 'assets_verified', action: 'record_generation', to: 'generated', roles: ['designer'], requiresEvidence: true },
    { from: 'generated', action: 'record_edit', to: 'edited', roles: ['designer'], requiresEvidence: true },
    { from: 'edited', action: 'submit_review', to: 'review', roles: ['designer'], requiresEvidence: true },
    { from: 'review', action: 'approve', to: 'approved', roles: ['creative_director'], requiresEvidence: true, dualControl: true },
    { from: 'approved', action: 'package', to: 'packaged', roles: ['production'], requiresEvidence: true },
    { from: 'packaged', action: 'publish', to: 'published', roles: ['publisher'], requiresEvidence: true, dualControl: true },
  ],
  assess: (x) => ({ disposition: x.licenseVerified && x.moderationStatus === 'passed' ? 'eligible_for_human_review' : 'hold', dimensions: { width: x.width, height: x.height }, rightsDecision: null }),
};
